// =====================================================
// Cache Performance Testing
// Validates cache hit rates and response times
// =====================================================

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Rate, Counter } from 'k6/metrics'

// Cache-specific metrics
const cacheHitRate = new Rate('cache_hit_rate')
const cacheResponseTime = new Trend('cache_response_time')
const dbResponseTime = new Trend('db_response_time')
const cacheWarmupTime = new Trend('cache_warmup_time')

export const options = {
  scenarios: {
    // Cache warming scenario
    cache_warmup: {
      executor: 'constant-vus',
      vus: 5,
      duration: '2m',
      tags: { scenario: 'warmup' },
    },
    
    // Cache hit testing
    cache_performance: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '3m', target: 50 },
        { duration: '5m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      tags: { scenario: 'performance' },
      startTime: '2m', // Start after warmup
    },
    
    // Cache invalidation testing
    cache_invalidation: {
      executor: 'constant-arrival-rate',
      rate: 2, // 2 requests per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 3,
      tags: { scenario: 'invalidation' },
      startTime: '4m',
    },
  },
  
  thresholds: {
    'cache_hit_rate': ['rate>0.80'], // 80% cache hit rate minimum
    'cache_response_time': ['p(95)<50'], // Cache responses under 50ms
    'db_response_time': ['p(95)<200'], // DB responses under 200ms
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test data for cache testing
const cacheTestData = {
  products: [
    '750e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '750e8400-e29b-41d4-a716-446655440003',
  ],
  
  searches: [
    { query: 'modern lamp', category: 'table-lamps' },
    { query: 'ceiling light', category: 'ceiling-lighting' },
    { query: 'pendant', style: 'industrial' },
  ],
  
  questionnaires: [
    { room_type: 'living', style_preference: 'modern', budget_min: 100, budget_max: 500 },
    { room_type: 'bedroom', style_preference: 'minimalist', budget_min: 50, budget_max: 300 },
  ]
}

function testCacheHit(endpoint, params = '') {
  const url = `${BASE_URL}${endpoint}${params}`
  const startTime = Date.now()
  
  const response = http.get(url, {
    headers: {
      'Cache-Control': 'max-age=0', // Force cache check
    }
  })
  
  const responseTime = Date.now() - startTime
  
  // Check cache headers
  const cacheStatus = response.headers['x-cache-status'] || 
                     response.headers['cf-cache-status'] || 
                     response.headers['cache-control']
  
  const isHit = cacheStatus && (
    cacheStatus.includes('HIT') || 
    cacheStatus.includes('hit') ||
    response.headers['x-cache'] === 'HIT'
  )
  
  // Record metrics
  cacheHitRate.add(isHit ? 1 : 0)
  
  if (isHit) {
    cacheResponseTime.add(responseTime)
  } else {
    dbResponseTime.add(responseTime)
  }
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time acceptable': () => responseTime < 1000,
  })
  
  return { response, isHit, responseTime }
}

export default function() {
  const scenario = __ENV.K6_SCENARIO_NAME
  
  switch (scenario) {
    case 'cache_warmup':
      warmupCache()
      break
    case 'cache_performance':
      testCachePerformance()
      break
    case 'cache_invalidation':
      testCacheInvalidation()
      break
    default:
      testCachePerformance()
  }
  
  sleep(0.5)
}

// Warm up cache with common requests
function warmupCache() {
  // Warm up product details cache
  cacheTestData.products.forEach(productId => {
    testCacheHit(`/api/products/${productId}`)
  })
  
  // Warm up search cache
  cacheTestData.searches.forEach(search => {
    const params = new URLSearchParams(search).toString()
    testCacheHit('/api/products/search', `?${params}`)
  })
  
  // Warm up static data cache
  testCacheHit('/api/brands')
  testCacheHit('/api/categories')
  
  sleep(1) // Allow cache to propagate
}

// Test cache performance with repeated requests
function testCachePerformance() {
  // Test product cache hits (should be fast)
  const productId = cacheTestData.products[Math.floor(Math.random() * cacheTestData.products.length)]
  const productResult = testCacheHit(`/api/products/${productId}`)
  
  // Test search cache hits
  const search = cacheTestData.searches[Math.floor(Math.random() * cacheTestData.searches.length)]
  const params = new URLSearchParams(search).toString()
  const searchResult = testCacheHit('/api/products/search', `?${params}`)
  
  // Test static data cache (should almost always hit)
  const staticResult = testCacheHit('/api/brands')
  
  // Verify cache effectiveness
  check(null, {
    'product cache working': () => productResult.isHit || productResult.responseTime < 100,
    'search cache working': () => searchResult.isHit || searchResult.responseTime < 200,
    'static cache working': () => staticResult.isHit,
  })
}

// Test cache invalidation and regeneration
function testCacheInvalidation() {
  // Create new questionnaire (should invalidate recommendation cache)
  const questionnaire = cacheTestData.questionnaires[Math.floor(Math.random() * cacheTestData.questionnaires.length)]
  
  const createResponse = http.post(
    `${BASE_URL}/api/products/recommendations`,
    JSON.stringify(questionnaire),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
  
  check(createResponse, {
    'questionnaire created': (r) => r.status === 201,
    'recommendations generated': (r) => {
      try {
        const data = JSON.parse(r.body)
        return data.recommendations && data.recommendations.length > 0
      } catch {
        return false
      }
    }
  })
  
  if (createResponse.status === 201) {
    const data = JSON.parse(createResponse.body)
    const questionnaireId = data.questionnaire_id
    
    // Test subsequent requests (should be cached)
    sleep(0.1) // Brief pause for cache to set
    
    const cachedResult = testCacheHit(`/api/products/recommendations?questionnaire_id=${questionnaireId}`)
    
    check(null, {
      'recommendation cached after creation': () => cachedResult.isHit || cachedResult.responseTime < 100
    })
  }
}