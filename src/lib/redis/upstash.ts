// =====================================================
// Upstash Redis Configuration for Production
// Serverless Redis for Cloudflare Pages deployment
// =====================================================

import { Redis } from '@upstash/redis'

// Upstash Redis client for production
export const upstashRedis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Enhanced Redis client with connection pooling
export class UpstashCacheManager {
  private static instance: UpstashCacheManager
  private redis: Redis

  private constructor() {
    this.redis = upstashRedis
  }

  public static getInstance(): UpstashCacheManager {
    if (!UpstashCacheManager.instance) {
      UpstashCacheManager.instance = new UpstashCacheManager()
    }
    return UpstashCacheManager.instance
  }

  // Get with automatic JSON parsing
  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.redis.get(key)
      return result as T
    } catch (error) {
      console.error('Upstash Redis get error:', error)
      return null
    }
  }

  // Set with automatic JSON stringification
  async set(key: string, value: any, ttl?: number): Promise<boolean> {
    try {
      if (ttl) {
        await this.redis.set(key, value, { ex: ttl })
      } else {
        await this.redis.set(key, value)
      }
      return true
    } catch (error) {
      console.error('Upstash Redis set error:', error)
      return false
    }
  }

  // Delete key
  async del(key: string): Promise<boolean> {
    try {
      await this.redis.del(key)
      return true
    } catch (error) {
      console.error('Upstash Redis del error:', error)
      return false
    }
  }

  // Multi-get for batch operations
  async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results = await this.redis.mget(...keys)
      return results as (T | null)[]
    } catch (error) {
      console.error('Upstash Redis mget error:', error)
      return keys.map(() => null)
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key)
    } catch (error) {
      console.error('Upstash Redis incr error:', error)
      return 0
    }
  }

  // Set with expiration
  async setex(key: string, seconds: number, value: any): Promise<boolean> {
    try {
      await this.redis.set(key, value, { ex: seconds })
      return true
    } catch (error) {
      console.error('Upstash Redis setex error:', error)
      return false
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Upstash Redis exists error:', error)
      return false
    }
  }

  // Get keys by pattern (limited in Upstash)
  async scan(pattern: string, count: number = 100): Promise<string[]> {
    try {
      // Note: Upstash has limited SCAN support
      // This is a simplified implementation
      const result = await this.redis.scan(0, { match: pattern, count })
      return result[1] || []
    } catch (error) {
      console.error('Upstash Redis scan error:', error)
      return []
    }
  }

  // Pipeline operations for better performance
  async pipeline(operations: Array<{ command: string; args: any[] }>): Promise<any[]> {
    try {
      const pipeline = this.redis.pipeline()
      
      operations.forEach(op => {
        // @ts-ignore - Dynamic method calling
        pipeline[op.command](...op.args)
      })
      
      return await pipeline.exec()
    } catch (error) {
      console.error('Upstash Redis pipeline error:', error)
      return []
    }
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const result = await this.redis.ping()
      return result === 'PONG'
    } catch (error) {
      console.error('Upstash Redis ping error:', error)
      return false
    }
  }

  // Get connection info
  async info(): Promise<Record<string, any>> {
    try {
      // Upstash doesn't support INFO command
      // Return basic connection status
      const isConnected = await this.ping()
      return {
        connected: isConnected,
        provider: 'upstash',
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      console.error('Upstash Redis info error:', error)
      return { connected: false, error: error.message }
    }
  }
}

// Singleton instance
export const upstashCache = UpstashCacheManager.getInstance()

// Environment-aware Redis client
export const getRedisClient = () => {
  if (process.env.NODE_ENV === 'production' || process.env.UPSTASH_REDIS_REST_URL) {
    return upstashCache
  }
  
  // Fallback to local Redis or memory cache
  return null
}

export default upstashCache