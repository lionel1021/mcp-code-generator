'use client'

// =====================================================
// Cache Performance Dashboard
// Monitor cache hit rates, performance, and invalidation
// =====================================================

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, LineChart, Activity, Zap, Database, RefreshCw } from 'lucide-react'

interface CacheStats {
  hitRate: number
  totalRequests: number
  cacheSize: number
  topKeys: Array<{ key: string; hits: number; misses: number }>
  performanceMetrics: {
    avgResponseTime: number
    cacheResponseTime: number
    dbResponseTime: number
  }
  recentActivity: Array<{
    timestamp: string
    action: string
    key: string
    result: 'hit' | 'miss' | 'set' | 'invalidate'
  }>
}

export default function CacheDashboard() {
  const [stats, setStats] = useState<CacheStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchCacheStats = async () => {
    try {
      const response = await fetch('/api/admin/cache/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch cache stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const clearCache = async (pattern?: string) => {
    try {
      const endpoint = pattern 
        ? `/api/admin/cache/clear?pattern=${encodeURIComponent(pattern)}`
        : '/api/admin/cache/clear'
        
      await fetch(endpoint, { method: 'POST' })
      await fetchCacheStats() // Refresh stats
    } catch (error) {
      console.error('Failed to clear cache:', error)
    }
  }

  useEffect(() => {
    fetchCacheStats()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchCacheStats, 5000) // Refresh every 5 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Cache Performance Dashboard</h1>
        
        <div className="flex items-center gap-4">
          <Button
            onClick={() => fetchCacheStats()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            {autoRefresh ? 'Stop Auto-refresh' : 'Auto-refresh'}
          </Button>
          
          <Button
            onClick={() => clearCache()}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <Database className="h-4 w-4" />
            Clear All Cache
          </Button>
        </div>
      </div>

      {stats && (
        <div className="space-y-6">
          {/* Overview Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                <Zap className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {(stats.hitRate * 100).toFixed(1)}%
                </div>
                <p className="text-xs text-gray-600">
                  Higher is better
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <BarChart className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalRequests.toLocaleString()}
                </div>
                <p className="text-xs text-gray-600">
                  Last 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Response Time</CardTitle>
                <LineChart className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {stats.performanceMetrics.cacheResponseTime}ms
                </div>
                <p className="text-xs text-gray-600">
                  vs {stats.performanceMetrics.dbResponseTime}ms DB
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
                <Database className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.cacheSize / 1024 / 1024).toFixed(1)}MB
                </div>
                <p className="text-xs text-gray-600">
                  Memory usage
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Cache Keys */}
          <Card>
            <CardHeader>
              <CardTitle>Top Cache Keys Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topKeys.map((key, index) => {
                  const total = key.hits + key.misses
                  const hitRate = total > 0 ? (key.hits / total) * 100 : 0
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {key.key}
                        </div>
                        <div className="text-xs text-gray-600">
                          {key.hits} hits, {key.misses} misses
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className={`text-sm font-medium ${
                            hitRate >= 80 ? 'text-green-600' : 
                            hitRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {hitRate.toFixed(1)}%
                          </div>
                        </div>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => clearCache(key.key)}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Cache Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border-l-4 border-gray-200 pl-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full ${
                          activity.result === 'hit' ? 'bg-green-500' :
                          activity.result === 'miss' ? 'bg-red-500' :
                          activity.result === 'set' ? 'bg-blue-500' : 'bg-gray-500'
                        }`}></span>
                        <span className="text-sm font-medium">{activity.action}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.result === 'hit' ? 'bg-green-100 text-green-800' :
                          activity.result === 'miss' ? 'bg-red-100 text-red-800' :
                          activity.result === 'set' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.result}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 truncate mt-1">
                        {activity.key}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cache Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => clearCache('product:*')}
                  variant="outline"
                  className="w-full"
                >
                  Clear Products
                </Button>
                
                <Button
                  onClick={() => clearCache('search:*')}
                  variant="outline"
                  className="w-full"
                >
                  Clear Search
                </Button>
                
                <Button
                  onClick={() => clearCache('recommendations:*')}
                  variant="outline"
                  className="w-full"
                >
                  Clear Recommendations
                </Button>
                
                <Button
                  onClick={() => clearCache('analytics:*')}
                  variant="outline"
                  className="w-full"
                >
                  Clear Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}