// =====================================================
// 联盟营销核心模块 - 高性能佣金系统
// =====================================================

export interface AffiliateProvider {
  id: string
  name: string
  domain: string
  commission_rate: number
  tracking_param: string
  api_endpoint?: string
  status: 'active' | 'inactive' | 'testing'
}

export interface AffiliateLink {
  provider_id: string
  product_id: string
  original_url: string
  affiliate_url: string
  commission_rate: number
  priority: number
  created_at: string
  last_validated: string
  status: 'active' | 'inactive' | 'broken'
}

export interface ClickEvent {
  id: string
  affiliate_link_id: string
  user_id?: string
  session_id: string
  ip_address: string
  user_agent: string
  referrer?: string
  timestamp: string
  converted: boolean
  conversion_value?: number
  commission_earned?: number
}

// 联盟营销提供商配置
export const AFFILIATE_PROVIDERS: Record<string, AffiliateProvider> = {
  amazon: {
    id: 'amazon',
    name: 'Amazon Associates',
    domain: 'amazon.com',
    commission_rate: 0.08, // 8%
    tracking_param: 'tag',
    status: 'active'
  },
  taobao: {
    id: 'taobao',
    name: '淘宝联盟',
    domain: 'taobao.com',
    commission_rate: 0.05, // 5%
    tracking_param: 'pid',
    status: 'active'
  },
  tmall: {
    id: 'tmall',
    name: '天猫联盟',
    domain: 'tmall.com',
    commission_rate: 0.06, // 6%
    tracking_param: 'pid',
    status: 'active'
  },
  jd: {
    id: 'jd',
    name: '京东联盟',
    domain: 'jd.com',
    commission_rate: 0.04, // 4%
    tracking_param: 'unionId',
    status: 'active'
  },
  lighting_direct: {
    id: 'lighting_direct',
    name: 'Lighting Direct',
    domain: 'lightingdirect.com',
    commission_rate: 0.12, // 12%
    tracking_param: 'aff',
    status: 'active'
  }
}

// 智能链接生成器
export class AffiliateManager {
  private static instance: AffiliateManager
  private providers: Map<string, AffiliateProvider>
  
  private constructor() {
    this.providers = new Map(Object.entries(AFFILIATE_PROVIDERS))
  }
  
  static getInstance(): AffiliateManager {
    if (!AffiliateManager.instance) {
      AffiliateManager.instance = new AffiliateManager()
    }
    return AffiliateManager.instance
  }
  
  // 生成联盟链接
  generateAffiliateUrl(
    originalUrl: string, 
    providerId: string, 
    affiliateId: string,
    customParams?: Record<string, string>
  ): string {
    const provider = this.providers.get(providerId)
    if (!provider) throw new Error(`Unknown provider: ${providerId}`)
    
    try {
      const url = new URL(originalUrl)
      
      // 添加联盟追踪参数
      url.searchParams.set(provider.tracking_param, affiliateId)
      
      // 添加自定义参数
      if (customParams) {
        Object.entries(customParams).forEach(([key, value]) => {
          url.searchParams.set(key, value)
        })
      }
      
      // 添加通用追踪参数
      url.searchParams.set('utm_source', 'lightingpro')
      url.searchParams.set('utm_medium', 'affiliate')
      url.searchParams.set('utm_campaign', 'lighting_recommendations')
      
      return url.toString()
    } catch (error) {
      console.error('Failed to generate affiliate URL:', error)
      return originalUrl
    }
  }
  
  // 智能选择最佳联盟链接
  selectBestAffiliateLink(links: AffiliateLink[]): AffiliateLink | null {
    if (!links.length) return null
    
    // 按优先级和佣金率排序
    const activeLinks = links
      .filter(link => link.status === 'active')
      .sort((a, b) => {
        // 首先按优先级
        if (a.priority !== b.priority) {
          return b.priority - a.priority
        }
        // 然后按佣金率
        return b.commission_rate - a.commission_rate
      })
    
    return activeLinks[0] || null
  }
  
  // 计算预期佣金
  calculateCommission(price: number, providerId: string): number {
    const provider = this.providers.get(providerId)
    if (!provider) return 0
    
    return price * provider.commission_rate
  }
  
  // 验证链接有效性
  async validateAffiliateLink(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { 
        method: 'HEAD',
        timeout: 5000 
      })
      return response.ok
    } catch {
      return false
    }
  }
  
  // 生成追踪像素
  generateTrackingPixel(eventData: {
    affiliate_link_id: string
    session_id: string
    user_id?: string
  }): string {
    const params = new URLSearchParams({
      event: 'click',
      ...eventData
    })
    
    return `/api/affiliate/track?${params.toString()}`
  }
}

// 佣金计算工具
export class CommissionCalculator {
  // 计算分层佣金
  static calculateTieredCommission(
    saleValue: number, 
    tiers: Array<{ min: number; max?: number; rate: number }>
  ): number {
    for (const tier of tiers) {
      if (saleValue >= tier.min && (!tier.max || saleValue <= tier.max)) {
        return saleValue * tier.rate
      }
    }
    return 0
  }
  
  // 计算季度奖金
  static calculateQuarterlyBonus(
    quarterlyVolume: number,
    baseCommission: number,
    bonusTiers: Array<{ threshold: number; multiplier: number }>
  ): number {
    for (const tier of bonusTiers.reverse()) {
      if (quarterlyVolume >= tier.threshold) {
        return baseCommission * (tier.multiplier - 1)
      }
    }
    return 0
  }
}

// 链接验证器
export class LinkValidator {
  private static cache = new Map<string, { valid: boolean; timestamp: number }>()
  private static CACHE_DURATION = 24 * 60 * 60 * 1000 // 24小时
  
  static async validateBatch(urls: string[]): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>()
    const now = Date.now()
    
    // 检查缓存
    const toValidate: string[] = []
    for (const url of urls) {
      const cached = this.cache.get(url)
      if (cached && (now - cached.timestamp) < this.CACHE_DURATION) {
        results.set(url, cached.valid)
      } else {
        toValidate.push(url)
      }
    }
    
    // 批量验证新URL
    if (toValidate.length > 0) {
      const validationPromises = toValidate.map(async (url) => {
        try {
          const response = await fetch(url, { 
            method: 'HEAD',
            timeout: 3000,
            signal: AbortSignal.timeout(3000)
          })
          const valid = response.ok
          this.cache.set(url, { valid, timestamp: now })
          return [url, valid] as const
        } catch {
          this.cache.set(url, { valid: false, timestamp: now })
          return [url, false] as const
        }
      })
      
      const validationResults = await Promise.all(validationPromises)
      validationResults.forEach(([url, valid]) => {
        results.set(url, valid)
      })
    }
    
    return results
  }
}

// 收益分析器
export class RevenueAnalyzer {
  // 计算每日收益
  static calculateDailyRevenue(clicks: ClickEvent[]): {
    totalClicks: number
    conversions: number
    conversionRate: number
    totalRevenue: number
    avgCommissionPerClick: number
  } {
    const totalClicks = clicks.length
    const conversions = clicks.filter(c => c.converted).length
    const totalRevenue = clicks.reduce((sum, c) => sum + (c.commission_earned || 0), 0)
    
    return {
      totalClicks,
      conversions,
      conversionRate: totalClicks > 0 ? conversions / totalClicks : 0,
      totalRevenue,
      avgCommissionPerClick: totalClicks > 0 ? totalRevenue / totalClicks : 0
    }
  }
  
  // 预测收益
  static predictRevenue(
    historicalData: ClickEvent[],
    projectedClicks: number
  ): {
    estimatedRevenue: number
    confidence: number
    range: { min: number; max: number }
  } {
    const { avgCommissionPerClick, conversionRate } = this.calculateDailyRevenue(historicalData)
    
    const estimatedRevenue = projectedClicks * avgCommissionPerClick
    const confidence = historicalData.length >= 100 ? 0.85 : Math.min(0.7, historicalData.length / 100)
    
    const variance = confidence > 0.7 ? 0.2 : 0.4
    const range = {
      min: estimatedRevenue * (1 - variance),
      max: estimatedRevenue * (1 + variance)
    }
    
    return { estimatedRevenue, confidence, range }
  }
}

export default AffiliateManager