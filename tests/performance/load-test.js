// =====================================================
// K6 Performance Load Testing for LightingPro
// Comprehensive API and caching performance tests
// =====================================================

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate, Trend, Counter } from 'k6/metrics'

// Custom metrics
const errorRate = new Rate('error_rate')
const responseTime = new Trend('response_time')
const cacheHits = new Counter('cache_hits')
const cacheMisses = new Counter('cache_misses')

// Test configuration
export const options = {
  stages: [
    // Warm-up
    { duration: '2m', target: 10 },
    
    // Ramp-up to normal load
    { duration: '5m', target: 50 },
    
    // Stay at normal load
    { duration: '10m', target: 50 },
    
    // Ramp-up to high load
    { duration: '5m', target: 100 },
    
    // Stay at high load
    { duration: '10m', target: 100 },
    
    // Spike test
    { duration: '2m', target: 200 },
    { duration: '3m', target: 200 },
    
    // Ramp-down
    { duration: '5m', target: 0 },
  ],
  
  thresholds: {
    // Performance requirements
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.05'],   // Error rate under 5%
    error_rate: ['rate<0.05'],
    
    // Cache performance
    'http_req_duration{endpoint:recommendations}': ['p(95)<100'], // Cached recommendations under 100ms
    'http_req_duration{endpoint:search}': ['p(95)<200'],         // Search under 200ms
    'http_req_duration{endpoint:product}': ['p(95)<150'],        // Product details under 150ms
  },
}

// Base URL configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test data
const testData = {
  questionnaires: [
    {
      room_type: 'living',
      room_size: 'medium',
      style_preference: 'modern',
      budget_min: 100,
      budget_max: 500
    },
    {
      room_type: 'bedroom',
      room_size: 'small',
      style_preference: 'minimalist',
      budget_min: 50,
      budget_max: 200
    },
    {
      room_type: 'kitchen',
      room_size: 'large',
      style_preference: 'industrial',
      budget_min: 200,
      budget_max: 800
    }
  ],
  
  searchQueries: [
    'pendant light',
    'ceiling lamp',
    'table lamp',
    'floor lamp',
    'chandelier',
    'LED bulb'
  ],
  
  productIds: [
    '750e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002',
    '750e8400-e29b-41d4-a716-446655440003'
  ]
}

// Utility functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function checkResponse(response, endpoint) {
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
    'has valid JSON': (r) => {
      try {
        JSON.parse(r.body)
        return true
      } catch {
        return false
      }
    }
  })
  
  // Record metrics
  errorRate.add(!success)
  responseTime.add(response.timings.duration, { endpoint })
  
  // Check for cache headers
  const cacheHeader = response.headers['x-cache'] || response.headers['cf-cache-status']
  if (cacheHeader === 'HIT') {
    cacheHits.add(1)
  } else {
    cacheMisses.add(1)
  }
  
  return success
}

// Test scenarios
export default function() {
  // Weighted scenario selection
  const scenarios = [
    { weight: 40, fn: testRecommendations },
    { weight: 30, fn: testProductSearch },
    { weight: 20, fn: testProductDetails },
    { weight: 10, fn: testStaticData }
  ]
  
  const totalWeight = scenarios.reduce((sum, s) => sum + s.weight, 0)
  const random = Math.random() * totalWeight
  
  let weightSum = 0
  for (const scenario of scenarios) {
    weightSum += scenario.weight
    if (random <= weightSum) {
      scenario.fn()
      break
    }
  }
  
  sleep(1) // Think time
}

// Test recommendation API
function testRecommendations() {
  const questionnaire = randomChoice(testData.questionnaires)
  
  // Create questionnaire and get recommendations
  const response = http.post(
    `${BASE_URL}/api/products/recommendations`,
    JSON.stringify(questionnaire),
    {
      headers: {
        'Content-Type': 'application/json',
      },
      tags: { endpoint: 'recommendations' }
    }
  )
  
  const success = checkResponse(response, 'recommendations')
  
  if (success) {
    const data = JSON.parse(response.body)
    
    check(data, {
      'has questionnaire_id': (d) => d.questionnaire_id !== undefined,
      'has recommendations': (d) => Array.isArray(d.recommendations),
      'recommendations not empty': (d) => d.recommendations.length > 0,
      'has total count': (d) => typeof d.total === 'number'
    })
  }
}

// Test product search
function testProductSearch() {
  const query = randomChoice(testData.searchQueries)
  const params = new URLSearchParams({
    query,
    limit: '20',
    page: '1'
  })
  
  const response = http.get(
    `${BASE_URL}/api/products/search?${params}`,
    { tags: { endpoint: 'search' } }
  )
  
  const success = checkResponse(response, 'search')
  
  if (success) {
    const data = JSON.parse(response.body)
    
    check(data, {
      'has products array': (d) => Array.isArray(d.data),
      'has pagination': (d) => d.pagination !== undefined,
      'has facets': (d) => d.facets !== undefined
    })
  }
}

// Test product details
function testProductDetails() {
  const productId = randomChoice(testData.productIds)
  
  const response = http.get(
    `${BASE_URL}/api/products/${productId}`,
    { tags: { endpoint: 'product' } }
  )
  
  const success = checkResponse(response, 'product')
  
  if (success) {
    const data = JSON.parse(response.body)
    
    check(data, {
      'has product data': (d) => d.data !== undefined,
      'has product id': (d) => d.data.id === productId,
      'has affiliate links': (d) => d.data.affiliate_links !== undefined
    })
  }
}

// Test static data endpoints
function testStaticData() {
  const endpoints = [
    '/api/brands',
    '/api/categories'
  ]
  
  const endpoint = randomChoice(endpoints)
  
  const response = http.get(
    `${BASE_URL}${endpoint}`,
    { tags: { endpoint: 'static' } }
  )
  
  checkResponse(response, 'static')
}