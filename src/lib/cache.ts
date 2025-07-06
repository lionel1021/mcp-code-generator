// =====================================================
// LightingPro Advanced Caching Strategy
// Multi-layer caching with Redis + Edge + Browser
// =====================================================

import { createClient } from 'redis'

// Redis configuration for Supabase/Upstash
const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD,
})

redis.on('error', (err) => console.error('Redis Client Error', err))
redis.connect()

// =====================================================
// 1. CACHE KEY STRATEGIES
// =====================================================

export const CacheKeys = {
  // Product caching
  PRODUCT_DETAILS: (id: string) => `product:${id}`,
  PRODUCT_SEARCH: (query: string, filters: string) => `search:${query}:${filters}`,
  PRODUCT_RECOMMENDATIONS: (questionnaireId: string) => `recommendations:${questionnaireId}`,
  PRODUCT_BY_CATEGORY: (categoryId: string, page: number) => `category:${categoryId}:page:${page}`,
  
  // User-specific caching
  USER_PROFILE: (userId: string) => `user:${userId}`,
  USER_QUESTIONNAIRE: (userId: string) => `questionnaire:${userId}`,
  USER_FAVORITES: (userId: string) => `favorites:${userId}`,
  
  // Analytics caching
  PRODUCT_STATS: (productId: string) => `stats:${productId}`,
  DAILY_ANALYTICS: (date: string) => `analytics:daily:${date}`,
  CONVERSION_FUNNEL: () => `analytics:funnel`,
  TOP_PRODUCTS: (period: string) => `top_products:${period}`,
  
  // Static data caching
  BRANDS_LIST: () => 'brands:all',
  CATEGORIES_TREE: () => 'categories:tree',
  AFFILIATE_LINKS: (productId: string) => `affiliate:${productId}`,
} as const

// =====================================================
// 2. CACHE TTL STRATEGIES
// =====================================================

export const CacheTTL = {
  // Static data - long cache (4 hours)
  STATIC_DATA: 4 * 60 * 60,
  
  // Product data - medium cache (1 hour)
  PRODUCT_DATA: 60 * 60,
  
  // Search results - short cache (15 minutes)
  SEARCH_RESULTS: 15 * 60,
  
  // User data - short cache (10 minutes)
  USER_DATA: 10 * 60,
  
  // Analytics - very short cache (5 minutes)
  ANALYTICS: 5 * 60,
  
  // Recommendations - medium cache (30 minutes)
  RECOMMENDATIONS: 30 * 60,
} as const

// =====================================================
// 3. CACHE MANAGER CLASS
// =====================================================

export class CacheManager {
  
  // Get with fallback to database
  static async get<T>(
    key: string, 
    fallback: () => Promise<T>, 
    ttl: number = CacheTTL.PRODUCT_DATA
  ): Promise<T> {
    try {
      // Try Redis first
      const cached = await redis.get(key)
      if (cached) {
        return JSON.parse(cached)
      }
      
      // Fallback to database
      const fresh = await fallback()
      
      // Cache the result
      await redis.setEx(key, ttl, JSON.stringify(fresh))
      
      return fresh
    } catch (error) {
      console.error('Cache error:', error)
      // Always fallback to database on cache failure
      return fallback()
    }
  }
  
  // Set cache value
  static async set(key: string, value: any, ttl: number): Promise<void> {
    try {
      await redis.setEx(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  // Delete cache key
  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }
  
  // Delete multiple keys with pattern
  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(keys)
      }
    } catch (error) {
      console.error('Cache pattern delete error:', error)
    }
  }
  
  // Increment counter (for analytics)
  static async incr(key: string, ttl?: number): Promise<number> {
    try {
      const result = await redis.incr(key)
      if (ttl && result === 1) {
        await redis.expire(key, ttl)
      }
      return result
    } catch (error) {
      console.error('Cache increment error:', error)
      return 0
    }
  }
  
  // Multi-get for batch operations
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const values = await redis.mGet(keys)
      return values.map(value => value ? JSON.parse(value) : null)
    } catch (error) {
      console.error('Cache multi-get error:', error)
      return keys.map(() => null)
    }
  }
}

// =====================================================
// 4. SPECIFIC CACHE FUNCTIONS
// =====================================================

// Product recommendation caching
export async function getCachedRecommendations(
  questionnaireId: string,
  fallback: () => Promise<any[]>
) {
  return CacheManager.get(
    CacheKeys.PRODUCT_RECOMMENDATIONS(questionnaireId),
    fallback,
    CacheTTL.RECOMMENDATIONS
  )
}

// Product search caching with smart invalidation
export async function getCachedSearch(
  query: string,
  filters: Record<string, any>,
  fallback: () => Promise<any>
) {
  const filterHash = btoa(JSON.stringify(filters)).slice(0, 10)
  const cacheKey = CacheKeys.PRODUCT_SEARCH(query, filterHash)
  
  return CacheManager.get(cacheKey, fallback, CacheTTL.SEARCH_RESULTS)
}

// Product details with aggressive caching
export async function getCachedProduct(
  productId: string,
  fallback: () => Promise<any>
) {
  return CacheManager.get(
    CacheKeys.PRODUCT_DETAILS(productId),
    fallback,
    CacheTTL.PRODUCT_DATA
  )
}

// Static data with long cache
export async function getCachedBrands(fallback: () => Promise<any[]>) {
  return CacheManager.get(
    CacheKeys.BRANDS_LIST(),
    fallback,
    CacheTTL.STATIC_DATA
  )
}

export async function getCachedCategories(fallback: () => Promise<any[]>) {
  return CacheManager.get(
    CacheKeys.CATEGORIES_TREE(),
    fallback,
    CacheTTL.STATIC_DATA
  )
}

// =====================================================
// 5. CACHE INVALIDATION STRATEGIES
// =====================================================

export class CacheInvalidation {
  
  // Product updated - invalidate related caches
  static async onProductUpdate(productId: string) {
    await Promise.all([
      CacheManager.del(CacheKeys.PRODUCT_DETAILS(productId)),
      CacheManager.del(CacheKeys.PRODUCT_STATS(productId)),
      CacheManager.delPattern(`search:*`), // Invalidate all search results
      CacheManager.delPattern(`category:*`), // Invalidate category listings
      CacheManager.delPattern(`recommendations:*`), // Invalidate recommendations
    ])
  }
  
  // New interaction - update counters and invalidate stats
  static async onUserInteraction(productId: string, type: string) {
    const today = new Date().toISOString().split('T')[0]
    
    await Promise.all([
      // Increment real-time counters
      CacheManager.incr(`counter:${productId}:${type}:${today}`, CacheTTL.ANALYTICS),
      CacheManager.incr(`counter:global:${type}:${today}`, CacheTTL.ANALYTICS),
      
      // Invalidate product stats (will be regenerated)
      CacheManager.del(CacheKeys.PRODUCT_STATS(productId)),
      CacheManager.del(CacheKeys.DAILY_ANALYTICS(today)),
    ])
  }
  
  // User profile updated
  static async onUserUpdate(userId: string) {
    await Promise.all([
      CacheManager.del(CacheKeys.USER_PROFILE(userId)),
      CacheManager.del(CacheKeys.USER_QUESTIONNAIRE(userId)),
      CacheManager.del(CacheKeys.USER_FAVORITES(userId)),
    ])
  }
}

// =====================================================
// 6. EDGE CACHING HEADERS
// =====================================================

export function getCacheHeaders(type: 'static' | 'dynamic' | 'api' | 'user') {
  switch (type) {
    case 'static':
      return {
        'Cache-Control': 'public, max-age=3600, s-maxage=7200', // 1h browser, 2h edge
        'CDN-Cache-Control': 'public, max-age=7200', // 2h CDN
        'Vary': 'Accept-Encoding',
      }
    
    case 'dynamic':
      return {
        'Cache-Control': 'public, max-age=300, s-maxage=900', // 5m browser, 15m edge  
        'CDN-Cache-Control': 'public, max-age=900',
        'Vary': 'Accept-Encoding, User-Agent',
      }
    
    case 'api':
      return {
        'Cache-Control': 'public, max-age=60, s-maxage=300', // 1m browser, 5m edge
        'CDN-Cache-Control': 'public, max-age=300',
        'Vary': 'Accept, Authorization',
      }
    
    case 'user':
      return {
        'Cache-Control': 'private, max-age=300', // 5m browser only
        'Vary': 'Authorization',
      }
  }
}

// =====================================================
// 7. MONITORING & METRICS
// =====================================================

export class CacheMetrics {
  
  static async getHitRate(period: 'hour' | 'day' = 'hour'): Promise<number> {
    const suffix = period === 'hour' ? new Date().getHours() : new Date().toISOString().split('T')[0]
    
    const [hits, misses] = await Promise.all([
      redis.get(`cache_hits:${suffix}`) || '0',
      redis.get(`cache_misses:${suffix}`) || '0',
    ])
    
    const totalRequests = parseInt(hits) + parseInt(misses)
    return totalRequests > 0 ? parseInt(hits) / totalRequests : 0
  }
  
  static async recordHit(key: string) {
    const hour = new Date().getHours()
    const day = new Date().toISOString().split('T')[0]
    
    await Promise.all([
      CacheManager.incr(`cache_hits:${hour}`, 3600),
      CacheManager.incr(`cache_hits:${day}`, 86400),
    ])
  }
  
  static async recordMiss(key: string) {
    const hour = new Date().getHours()
    const day = new Date().toISOString().split('T')[0]
    
    await Promise.all([
      CacheManager.incr(`cache_misses:${hour}`, 3600),
      CacheManager.incr(`cache_misses:${day}`, 86400),
    ])
  }
}

export default CacheManager