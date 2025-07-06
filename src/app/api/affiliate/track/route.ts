import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// 联盟点击追踪API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const affiliateLinkId = searchParams.get('affiliate_link_id')
    const sessionId = searchParams.get('session_id')
    const userId = searchParams.get('user_id')
    const event = searchParams.get('event') || 'click'

    if (!affiliateLinkId || !sessionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
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

    // 获取客户端信息
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown'

    // 记录点击事件
    const { data: clickEvent, error } = await supabase
      .from('affiliate_clicks')
      .insert({
        affiliate_link_id: affiliateLinkId,
        user_id: userId || null,
        session_id: sessionId,
        ip_address: ipAddress,
        user_agent: userAgent,
        referrer: referer,
        event_type: event,
        timestamp: new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to record click event:', error)
      // 不阻止用户访问，静默失败
    }

    // 返回1x1透明像素
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Tracking API error:', error)
    
    // 返回透明像素，即使出错也不影响用户体验
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    )

    return new NextResponse(pixel, {
      status: 200,
      headers: {
        'Content-Type': 'image/png'
      }
    })
  }
}

// 转化追踪API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      affiliate_link_id, 
      session_id, 
      user_id,
      conversion_value,
      order_id,
      products 
    } = body

    if (!affiliate_link_id || !session_id) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
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

    // 获取联盟链接信息计算佣金
    const { data: affiliateLink } = await supabase
      .from('affiliate_links')
      .select('commission_rate, provider_id')
      .eq('id', affiliate_link_id)
      .single()

    let commissionEarned = 0
    if (affiliateLink && conversion_value) {
      commissionEarned = conversion_value * affiliateLink.commission_rate
    }

    // 更新点击记录为已转化
    const { error: updateError } = await supabase
      .from('affiliate_clicks')
      .update({
        converted: true,
        conversion_value: conversion_value || null,
        commission_earned: commissionEarned,
        order_id: order_id || null,
        updated_at: new Date().toISOString()
      })
      .eq('affiliate_link_id', affiliate_link_id)
      .eq('session_id', session_id)

    if (updateError) {
      console.error('Failed to update conversion:', updateError)
      return NextResponse.json(
        { error: 'Failed to record conversion' },
        { status: 500 }
      )
    }

    // 记录转化详情
    if (products && Array.isArray(products)) {
      const conversionDetails = products.map((product: any) => ({
        affiliate_link_id,
        session_id,
        product_id: product.id,
        product_name: product.name,
        quantity: product.quantity || 1,
        unit_price: product.price,
        total_value: (product.price * (product.quantity || 1))
      }))

      await supabase
        .from('affiliate_conversions')
        .insert(conversionDetails)
    }

    return NextResponse.json({
      success: true,
      conversion_recorded: true,
      commission_earned: commissionEarned
    })

  } catch (error) {
    console.error('Conversion tracking error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track conversion' 
      },
      { status: 500 }
    )
  }
}