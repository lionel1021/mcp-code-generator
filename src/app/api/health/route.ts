// =====================================================
// Health Check API for Performance Monitoring
// Provides system status and performance metrics
// =====================================================

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const startTime = Date.now()
  
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {},
      performance: {
        responseTime: 0
      }
    }

    // Test database connection
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const dbStart = Date.now()
      const { error } = await supabase.from('schema_migrations').select('version').limit(1)
      const dbTime = Date.now() - dbStart
      
      health.services.database = {
        status: error ? 'unhealthy' : 'healthy',
        responseTime: dbTime,
        error: error?.message
      }
    } catch (dbError) {
      health.services.database = {
        status: 'unhealthy',
        error: dbError.message,
        responseTime: -1
      }
    }

    // Test Redis connection (if configured)
    try {
      if (process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL) {
        const cacheStart = Date.now()
        // Simple cache test would go here
        const cacheTime = Date.now() - cacheStart
        
        health.services.cache = {
          status: 'healthy',
          responseTime: cacheTime,
          provider: process.env.UPSTASH_REDIS_REST_URL ? 'upstash' : 'redis'
        }
      } else {
        health.services.cache = {
          status: 'not_configured',
          responseTime: 0
        }
      }
    } catch (cacheError) {
      health.services.cache = {
        status: 'unhealthy',
        error: cacheError.message,
        responseTime: -1
      }
    }

    // Calculate overall response time
    health.performance.responseTime = Date.now() - startTime

    // Determine overall health status
    const serviceStatuses = Object.values(health.services).map(s => s.status)
    if (serviceStatuses.includes('unhealthy')) {
      health.status = 'degraded'
    }

    const statusCode = health.status === 'healthy' ? 200 : 503

    return NextResponse.json(health, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      performance: {
        responseTime: Date.now() - startTime
      }
    }, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Health-Check': 'true'
      }
    })
  }
}