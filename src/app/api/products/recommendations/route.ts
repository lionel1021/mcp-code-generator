// =====================================================
// API Route: Product Recommendations with Caching
// High-performance cached recommendations endpoint
// =====================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { CacheManager, CacheKeys, getCachedRecommendations, getCacheHeaders } from '@/lib/cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const questionnaireId = searchParams.get('questionnaire_id')
    
    if (!questionnaireId) {
      return NextResponse.json(
        { error: 'questionnaire_id is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
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

    // Get cached recommendations or fetch from database
    const recommendations = await getCachedRecommendations(
      questionnaireId,
      async () => {
        // Complex recommendation query with scoring
        const { data, error } = await supabase.rpc('get_product_recommendations', {
          questionnaire_id: questionnaireId
        })
        
        if (error) throw error
        return data || []
      }
    )

    // Track cache performance
    await CacheManager.incr(`api_calls:recommendations:${new Date().getHours()}`, 3600)

    return NextResponse.json(
      {
        success: true,
        data: recommendations,
        cache_key: CacheKeys.PRODUCT_RECOMMENDATIONS(questionnaireId),
        total: recommendations.length
      },
      { 
        status: 200,
        headers: getCacheHeaders('api')
      }
    )

  } catch (error) {
    console.error('Recommendations API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recommendations',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

// =====================================================
// POST: Create new questionnaire and get recommendations
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { room_type, room_size, style_preference, budget_min, budget_max, user_id } = body

    // Validate required fields
    if (!room_type || !room_size || !style_preference || !budget_min || !budget_max) {
      return NextResponse.json(
        { error: 'Missing required questionnaire fields' },
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

    // Create questionnaire response
    const { data: questionnaire, error: questionnaireError } = await supabase
      .from('questionnaire_responses')
      .insert({
        user_id: user_id || null,
        room_type,
        room_size,
        style_preference,
        budget_min: parseInt(budget_min),
        budget_max: parseInt(budget_max),
        recommendations_generated: false
      })
      .select('id')
      .single()

    if (questionnaireError) throw questionnaireError

    // Generate recommendations immediately
    const recommendations = await getCachedRecommendations(
      questionnaire.id,
      async () => {
        const { data, error } = await supabase.rpc('get_product_recommendations', {
          questionnaire_id: questionnaire.id
        })
        
        if (error) throw error

        // Update questionnaire as processed
        await supabase
          .from('questionnaire_responses')
          .update({ 
            recommendations_generated: true,
            recommendation_count: data?.length || 0
          })
          .eq('id', questionnaire.id)

        return data || []
      }
    )

    return NextResponse.json(
      {
        success: true,
        questionnaire_id: questionnaire.id,
        recommendations,
        total: recommendations.length
      },
      { 
        status: 201,
        headers: getCacheHeaders('api')
      }
    )

  } catch (error) {
    console.error('Create questionnaire error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create questionnaire and recommendations',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}