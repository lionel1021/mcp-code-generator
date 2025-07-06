'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { ExternalLink, ShoppingCart, Zap, Star, TrendingUp, Shield } from 'lucide-react'
import { LightingProduct } from '@/lib/supabase'

interface AffiliateButtonProps {
  product: LightingProduct
  variant?: 'primary' | 'secondary' | 'compact' | 'card'
  showCommission?: boolean
  showProvider?: boolean
  trackingEnabled?: boolean
  className?: string
  userId?: string
}

interface AffiliateData {
  affiliate_url: string
  tracking_pixel_url: string
  provider: string
  commission_rate: number
  expected_commission: number
}

export const AffiliateButton: React.FC<AffiliateButtonProps> = ({
  product,
  variant = 'primary',
  showCommission = false,
  showProvider = true,
  trackingEnabled = true,
  className = '',
  userId
}) => {
  const [affiliateData, setAffiliateData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 生成联盟链接
  const generateAffiliateLink = useCallback(async () => {
    if (affiliateData) return // 已有数据，避免重复请求

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/affiliate/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          user_id: userId
        })
      })

      const result = await response.json()

      if (result.success) {
        setAffiliateData(result.data)
      } else {
        setError(result.error || '无法生成联盟链接')
      }
    } catch (err) {
      setError('网络错误，请稍后重试')
      console.error('Failed to generate affiliate link:', err)
    } finally {
      setLoading(false)
    }
  }, [product.id, userId, affiliateData])

  // 处理点击事件
  const handleClick = useCallback(async () => {
    if (!affiliateData) {
      await generateAffiliateLink()
      return
    }

    // 如果启用追踪，加载追踪像素
    if (trackingEnabled && affiliateData.tracking_pixel_url) {
      const img = new Image()
      img.src = affiliateData.tracking_pixel_url
    }

    // 打开联盟链接
    window.open(affiliateData.affiliate_url, '_blank', 'noopener,noreferrer')
  }, [affiliateData, generateAffiliateLink, trackingEnabled])

  // 预加载联盟链接（可选）
  useEffect(() => {
    if (variant === 'card') {
      // 为卡片组件预加载链接
      generateAffiliateLink()
    }
  }, [variant, generateAffiliateLink])

  // 获取提供商信息
  const getProviderInfo = (provider: string) => {
    const providers = {
      amazon: { name: 'Amazon', icon: '🛒', color: 'bg-yellow-500' },
      taobao: { name: '淘宝', icon: '🛍️', color: 'bg-orange-500' },
      tmall: { name: '天猫', icon: '🏪', color: 'bg-red-500' },
      jd: { name: '京东', icon: '📦', color: 'bg-red-600' },
      lighting_direct: { name: 'Lighting Direct', icon: '💡', color: 'bg-blue-500' }
    }
    return providers[provider as keyof typeof providers] || { 
      name: provider, 
      icon: '🔗', 
      color: 'bg-gray-500' 
    }
  }

  // 渲染不同变体
  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium
          transition-all duration-200 hover:scale-105 disabled:opacity-50
          ${loading ? 'bg-gray-300 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'}
          ${className}
        `}
      >
        {loading ? (
          <Zap className="w-4 h-4 animate-spin" />
        ) : (
          <ExternalLink className="w-4 h-4" />
        )}
        <span>{loading ? '生成中...' : '购买'}</span>
      </button>
    )
  }

  if (variant === 'secondary') {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          inline-flex items-center space-x-2 px-4 py-2 border border-blue-600 
          text-blue-600 rounded-lg hover:bg-blue-50 transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        {loading ? (
          <Zap className="w-4 h-4 animate-spin" />
        ) : (
          <ShoppingCart className="w-4 h-4" />
        )}
        <span>{loading ? '生成链接中...' : '立即购买'}</span>
        {showProvider && affiliateData && (
          <span className="text-xs text-gray-500">
            via {getProviderInfo(affiliateData.provider).name}
          </span>
        )}
      </button>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">购买链接</h4>
              <p className="text-sm text-gray-600">安全可信的购买渠道</p>
            </div>
          </div>
          
          {affiliateData && (
            <div className="flex items-center space-x-1 text-xs text-green-600">
              <Shield className="w-3 h-3" />
              <span>已验证</span>
            </div>
          )}
        </div>

        {error ? (
          <div className="text-red-600 text-sm mb-3">
            {error}
          </div>
        ) : affiliateData ? (
          <div className="space-y-2 mb-4">
            {showProvider && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">购买平台:</span>
                <div className="flex items-center space-x-1">
                  <span>{getProviderInfo(affiliateData.provider).icon}</span>
                  <span className="font-medium">{getProviderInfo(affiliateData.provider).name}</span>
                </div>
              </div>
            )}
            
            {showCommission && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">推荐奖励:</span>
                <div className="flex items-center space-x-1 text-green-600">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">
                    ¥{affiliateData.expected_commission.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">产品价格:</span>
              <span className="font-bold text-lg text-green-600">
                ¥{product.price.toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm mb-4">
            点击按钮获取购买链接
          </div>
        )}

        <button
          onClick={handleClick}
          disabled={loading}
          className={`
            w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg
            font-medium transition-all duration-200 disabled:opacity-50
            ${loading 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
            }
          `}
        >
          {loading ? (
            <>
              <Zap className="w-5 h-5 animate-spin" />
              <span>生成购买链接中...</span>
            </>
          ) : affiliateData ? (
            <>
              <ExternalLink className="w-5 h-5" />
              <span>前往购买</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-5 h-5" />
              <span>获取购买链接</span>
            </>
          )}
        </button>

        {affiliateData && (
          <p className="text-xs text-gray-500 mt-2 text-center">
            点击将在新窗口打开官方购买页面
          </p>
        )}
      </div>
    )
  }

  // 默认 primary 变体
  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        inline-flex items-center space-x-3 px-6 py-3 rounded-lg font-medium
        transition-all duration-200 hover:scale-105 disabled:opacity-50
        ${loading 
          ? 'bg-gray-300 text-gray-500' 
          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
        }
        ${className}
      `}
    >
      {loading ? (
        <Zap className="w-5 h-5 animate-spin" />
      ) : (
        <ShoppingCart className="w-5 h-5" />
      )}
      
      <div className="flex flex-col items-start">
        <span className="text-lg">
          {loading ? '生成购买链接中...' : '立即购买'}
        </span>
        {showProvider && affiliateData && (
          <span className="text-sm opacity-90">
            通过 {getProviderInfo(affiliateData.provider).name}
          </span>
        )}
      </div>
      
      {showCommission && affiliateData && (
        <div className="flex items-center space-x-1 bg-white/20 rounded-full px-2 py-1">
          <Star className="w-3 h-3" />
          <span className="text-xs">
            +¥{affiliateData.expected_commission.toFixed(2)}
          </span>
        </div>
      )}
    </button>
  )
}

export default AffiliateButton