// =====================================================
// Database Performance Testing
// Tests query performance and connection handling
// =====================================================

import http from 'k6/http'
import { check, sleep } from 'k6'
import { Trend, Counter, Rate } from 'k6/metrics'

// Database-specific metrics
const queryResponseTime = new Trend('db_query_response_time')
const complexQueryTime = new Trend('complex_query_time')
const connectionErrors = new Counter('db_connection_errors')
const queryErrors = new Rate('query_error_rate')

export const options = {
  scenarios: {
    // Database connection testing
    connection_test: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '2m', target: 10 },
        { duration: '3m', target: 25 },
        { duration: '3m', target: 50 },
        { duration: '2m', target: 0 },
      ],
      tags: { test_type: 'connection' },
    },
    
    // Query performance testing
    query_performance: {
      executor: 'constant-arrival-rate',
      rate: 20, // 20 queries per second
      timeUnit: '1s',
      duration: '5m',
      preAllocatedVUs: 10,
      tags: { test_type: 'query' },
      startTime: '1m',
    },
    
    // Complex query testing
    complex_queries: {
      executor: 'constant-vus',
      vus: 5,
      duration: '3m',
      tags: { test_type: 'complex' },
      startTime: '2m',
    },
  },
  
  thresholds: {
    'db_query_response_time': ['p(95)<500'], // 95% under 500ms
    'complex_query_time': ['p(95)<1000'],   // Complex queries under 1s
    'query_error_rate': ['rate<0.01'],      // Less than 1% error rate
  },
}

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000'

// Test queries of varying complexity
const testQueries = {
  simple: [
    '/api/brands',
    '/api/categories',
    '/api/products/750e8400-e29b-41d4-a716-446655440001',
  ],
  
  medium: [
    '/api/products/search?query=lamp&limit=20',
    '/api/products/search?category=ceiling-lighting&limit=50',
    '/api/products/search?brand=philips&style=modern',
  ],
  
  complex: [
    '/api/products/search?query=modern+ceiling+light&minPrice=100&maxPrice=500&style=modern&room=living&sort=rating&limit=50',
    '/api/analytics/dashboard?period=30d',
    '/api/products/recommendations',
  ]
}

function executeQuery(url, complexity = 'simple', method = 'GET', body = null) {
  const startTime = Date.now()
  
  let response
  if (method === 'POST') {
    response = http.post(url, body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: '10s',
    })
  } else {
    response = http.get(url, { timeout: '10s' })
  }
  
  const responseTime = Date.now() - startTime
  
  // Record metrics based on complexity
  if (complexity === 'complex') {
    complexQueryTime.add(responseTime)
  } else {
    queryResponseTime.add(responseTime)
  }
  
  // Check for errors
  const hasError = response.status >= 400 || response.status === 0
  queryErrors.add(hasError)
  
  if (hasError) {
    connectionErrors.add(1)
  }
  
  // Validate response
  const success = check(response, {
    'status is success': (r) => r.status >= 200 && r.status < 400,
    'response time reasonable': () => responseTime < 5000,
    'has response body': (r) => r.body && r.body.length > 0,
  })
  
  return { response, responseTime, success }
}

export default function() {
  const scenario = __ENV.K6_SCENARIO_NAME
  
  switch (scenario) {
    case 'connection_test':
      testDatabaseConnections()
      break
    case 'query_performance':
      testQueryPerformance()
      break
    case 'complex_queries':
      testComplexQueries()
      break
    default:
      testQueryPerformance()
  }
  
  sleep(0.1)
}

// Test database connection handling
function testDatabaseConnections() {
  // Test multiple simultaneous simple queries
  const promises = testQueries.simple.map(url => {
    return executeQuery(`${BASE_URL}${url}`, 'simple')
  })
  
  // Test medium complexity queries
  const mediumQuery = testQueries.medium[Math.floor(Math.random() * testQueries.medium.length)]
  executeQuery(`${BASE_URL}${mediumQuery}`, 'medium')
  
  sleep(0.5)
}

// Test query performance with various patterns
function testQueryPerformance() {
  const queryTypes = [
    { queries: testQueries.simple, weight: 60, complexity: 'simple' },
    { queries: testQueries.medium, weight: 35, complexity: 'medium' },
    { queries: testQueries.complex, weight: 5, complexity: 'complex' },
  ]
  
  // Weighted random selection
  const random = Math.random() * 100
  let weightSum = 0
  
  for (const queryType of queryTypes) {
    weightSum += queryType.weight
    if (random <= weightSum) {
      const query = queryType.queries[Math.floor(Math.random() * queryType.queries.length)]
      executeQuery(`${BASE_URL}${query}`, queryType.complexity)
      break
    }
  }
}

// Test complex queries that stress the database
function testComplexQueries() {
  // Test recommendation generation (complex algorithm)
  const questionnaireData = {
    room_type: 'living',
    room_size: 'medium',
    style_preference: 'modern',
    budget_min: 100,
    budget_max: 500
  }
  
  const result = executeQuery(
    `${BASE_URL}/api/products/recommendations`,
    'complex',
    'POST',
    JSON.stringify(questionnaireData)
  )
  
  if (result.success) {
    try {
      const data = JSON.parse(result.response.body)
      
      check(data, {
        'recommendations generated': (d) => d.recommendations && d.recommendations.length > 0,
        'has questionnaire_id': (d) => d.questionnaire_id !== undefined,
        'reasonable recommendation count': (d) => d.recommendations.length <= 20,
      })
      
      // Test fetching the cached recommendations
      if (data.questionnaire_id) {
        sleep(0.1) // Brief pause for cache
        executeQuery(
          `${BASE_URL}/api/products/recommendations?questionnaire_id=${data.questionnaire_id}`,
          'simple'
        )
      }
    } catch (e) {
      console.error('Failed to parse recommendation response:', e)
    }
  }
  
  // Test complex search with multiple filters
  const complexSearchParams = new URLSearchParams({
    query: 'modern ceiling light',
    category: 'ceiling-lighting',
    minPrice: '100',
    maxPrice: '500',
    style: 'modern',
    room: 'living',
    sort: 'rating',
    limit: '50'
  })
  
  executeQuery(
    `${BASE_URL}/api/products/search?${complexSearchParams}`,
    'complex'
  )
  
  sleep(1) // Longer pause for complex queries
}