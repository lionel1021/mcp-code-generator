import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AffiliateManager from '@/lib/affiliate'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { product_id, user_id, provider_id } = body

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    // 获取产品信息
    const { data: product, error: productError } = await supabase
      .from('lighting_products')
      .select('*')
      .eq('id', product_id)
      .single()

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    const affiliateManager = AffiliateManager.getInstance()
    
    // 获取所有可用的联盟链接
    const { data: affiliateLinks } = await supabase
      .from('affiliate_links')
      .select('*')
      .eq('product_id', product_id)
      .eq('status', 'active')

    let selectedLink = null
    let generatedUrl = null

    if (affiliateLinks && affiliateLinks.length > 0) {
      // 选择最佳联盟链接
      selectedLink = affiliateManager.selectBestAffiliateLink(affiliateLinks)
      
      if (selectedLink) {
        // 生成个性化联盟URL
        const sessionId = crypto.randomUUID()
        generatedUrl = affiliateManager.generateAffiliateUrl(
          selectedLink.affiliate_url,
          selectedLink.provider_id,
          process.env.AFFILIATE_ID || 'lightingpro',
          {
            session_id: sessionId,
            product_id: product_id,
            user_id: user_id || ''
          }
        )

        // 记录链接生成事件
        await supabase
          .from('affiliate_link_generations')
          .insert({
            product_id,
            affiliate_link_id: (selectedLink as any).id,
            user_id: user_id || null,
            session_id: sessionId,
            generated_url: generatedUrl,
            created_at: new Date().toISOString()
          })
      }
    }

    // 如果没有联盟链接，尝试从产品的原始链接生成
    if (!selectedLink && product.affiliate_links) {
      const originalLinks = product.affiliate_links as Record<string, any>
      
      // 优先选择指定的提供商
      let targetProvider = provider_id
      if (!targetProvider && originalLinks) {
        // 选择佣金率最高的提供商
        targetProvider = Object.keys(originalLinks).reduce((best, current) => {
          const currentRate = originalLinks[current]?.commission_rate || 0
          const bestRate = originalLinks[best]?.commission_rate || 0
          return currentRate > bestRate ? current : best
        })
      }

      if (targetProvider && originalLinks[targetProvider]) {
        const originalUrl = originalLinks[targetProvider].url
        const sessionId = crypto.randomUUID()
        
        generatedUrl = affiliateManager.generateAffiliateUrl(
          originalUrl,
          targetProvider,
          process.env.AFFILIATE_ID || 'lightingpro',
          {
            session_id: sessionId,
            product_id: product_id,
            user_id: user_id || ''
          }
        )

        selectedLink = {
          id: 'generated',
          provider_id: targetProvider,
          commission_rate: originalLinks[targetProvider].commission_rate || 0.05,
          affiliate_url: generatedUrl
        }
      }
    }

    if (!generatedUrl) {
      return NextResponse.json(
        { error: 'No affiliate links available for this product' },
        { status: 404 }
      )
    }

    // 生成追踪像素URL
    const trackingPixelUrl = affiliateManager.generateTrackingPixel({
      affiliate_link_id: (selectedLink as any)?.id || '',
      session_id: crypto.randomUUID(),
      user_id: user_id
    })

    // 计算预期佣金
    const expectedCommission = affiliateManager.calculateCommission(
      product.price,
      selectedLink.provider_id
    )

    return NextResponse.json({
      success: true,
      data: {
        affiliate_url: generatedUrl,
        tracking_pixel_url: trackingPixelUrl,
        provider: selectedLink.provider_id,
        commission_rate: selectedLink.commission_rate,
        expected_commission: expectedCommission,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          brand: product.brand
        }
      }
    })

  } catch (error) {
    console.error('Affiliate generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate affiliate link',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// 批量生成联盟链接
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('product_ids')?.split(',') || []
    const userId = searchParams.get('user_id')
    const providerId = searchParams.get('provider_id')

    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one product ID is required' },
        { status: 400 }
      )
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const affiliateManager = AffiliateManager.getInstance()
    const results = []

    for (const productId of productIds) {
      try {
        // 获取产品信息
        const { data: product } = await supabase
          .from('lighting_products')
          .select('*')
          .eq('id', productId)
          .single()

        if (!product) {
          results.push({
            product_id: productId,
            success: false,
            error: 'Product not found'
          })
          continue
        }

        // 获取联盟链接
        const { data: affiliateLinks } = await supabase
          .from('affiliate_links')
          .select('*')
          .eq('product_id', productId)
          .eq('status', 'active')

        let selectedLink = null
        let generatedUrl = null

        if (affiliateLinks && affiliateLinks.length > 0) {
          selectedLink = affiliateManager.selectBestAffiliateLink(affiliateLinks)
          
          if (selectedLink) {
            const sessionId = crypto.randomUUID()
            generatedUrl = affiliateManager.generateAffiliateUrl(
              selectedLink.affiliate_url,
              selectedLink.provider_id,
              process.env.AFFILIATE_ID || 'lightingpro',
              {
                session_id: sessionId,
                product_id: productId,
                user_id: userId || ''
              }
            )
          }
        }

        if (!generatedUrl && product.affiliate_links) {
          const originalLinks = product.affiliate_links as Record<string, any>
          let targetProvider = providerId || Object.keys(originalLinks)[0]

          if (targetProvider && originalLinks[targetProvider]) {
            const sessionId = crypto.randomUUID()
            generatedUrl = affiliateManager.generateAffiliateUrl(
              originalLinks[targetProvider].url,
              targetProvider,
              process.env.AFFILIATE_ID || 'lightingpro',
              {
                session_id: sessionId,
                product_id: productId,
                user_id: userId || ''
              }
            )

            selectedLink = {
              id: 'generated',
              provider_id: targetProvider,
              commission_rate: originalLinks[targetProvider].commission_rate || 0.05
            }
          }
        }

        if (generatedUrl && selectedLink) {
          const expectedCommission = affiliateManager.calculateCommission(
            product.price,
            selectedLink.provider_id
          )

          results.push({
            product_id: productId,
            success: true,
            affiliate_url: generatedUrl,
            provider: selectedLink.provider_id,
            commission_rate: selectedLink.commission_rate,
            expected_commission: expectedCommission
          })
        } else {
          results.push({
            product_id: productId,
            success: false,
            error: 'No affiliate links available'
          })
        }

      } catch (error) {
        results.push({
          product_id: productId,
          success: false,
          error: 'Failed to process product'
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: results,
      total_processed: productIds.length,
      successful: results.filter(r => r.success).length
    })

  } catch (error) {
    console.error('Batch affiliate generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate affiliate links' 
      },
      { status: 500 }
    )
  }
}