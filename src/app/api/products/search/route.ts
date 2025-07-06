import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category')
    const brand = searchParams.get('brand')
    const minPrice = searchParams.get('min_price')
    const maxPrice = searchParams.get('max_price')
    const minRating = searchParams.get('min_rating')
    const sortBy = searchParams.get('sort_by') || 'name'
    const sortOrder = searchParams.get('sort_order') || 'asc'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

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

    // Build query
    let dbQuery = supabase
      .from('lighting_products')
      .select('*', { count: 'exact' })

    // Apply text search
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
    }

    // Apply filters
    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    if (brand) {
      dbQuery = dbQuery.eq('brand', brand)
    }

    if (minPrice) {
      dbQuery = dbQuery.gte('price', parseFloat(minPrice))
    }

    if (maxPrice) {
      dbQuery = dbQuery.lte('price', parseFloat(maxPrice))
    }

    if (minRating) {
      dbQuery = dbQuery.gte('rating', parseFloat(minRating))
    }

    // Apply sorting
    const isAsc = sortOrder === 'asc'
    dbQuery = dbQuery.order(sortBy, { ascending: isAsc })

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1)

    const { data: products, error, count } = await dbQuery

    if (error) {
      throw error
    }

    // Get filter options for faceted search
    const { data: categories } = await supabase
      .from('lighting_products')
      .select('category')
      .order('category')
      .then(result => ({
        ...result,
        data: result.data ? [...new Set(result.data.map(p => p.category))] : []
      }))

    const { data: brands } = await supabase
      .from('lighting_products')
      .select('brand')
      .order('brand')
      .then(result => ({
        ...result,
        data: result.data ? [...new Set(result.data.map(p => p.brand))] : []
      }))

    // Get price range
    const { data: priceRange } = await supabase
      .from('lighting_products')
      .select('price')
      .order('price')
      .then(result => {
        if (!result.data || result.data.length === 0) {
          return { data: { min: 0, max: 0 } }
        }
        const prices = result.data.map(p => p.price)
        return {
          data: {
            min: Math.min(...prices),
            max: Math.max(...prices)
          }
        }
      })

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / limit),
          hasNext: (page * limit) < (count || 0),
          hasPrev: page > 1
        },
        filters: {
          categories: categories || [],
          brands: brands || [],
          priceRange: priceRange || { min: 0, max: 0 }
        },
        query: {
          q: query,
          category,
          brand,
          minPrice,
          maxPrice,
          minRating,
          sortBy,
          sortOrder
        }
      }
    })

  } catch (error) {
    console.error('Search API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to search products',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      query = '', 
      filters = {},
      sort = { by: 'name', order: 'asc' },
      pagination = { page: 1, limit: 20 }
    } = body

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

    let dbQuery = supabase
      .from('lighting_products')
      .select('*', { count: 'exact' })

    // Apply text search
    if (query) {
      dbQuery = dbQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        switch (key) {
          case 'category':
            dbQuery = dbQuery.eq('category', value)
            break
          case 'brand':
            dbQuery = dbQuery.eq('brand', value)
            break
          case 'minPrice':
            dbQuery = dbQuery.gte('price', value)
            break
          case 'maxPrice':
            dbQuery = dbQuery.lte('price', value)
            break
          case 'minRating':
            dbQuery = dbQuery.gte('rating', value)
            break
          case 'priceRange':
            if (Array.isArray(value) && value.length === 2) {
              dbQuery = dbQuery.gte('price', value[0]).lte('price', value[1])
            }
            break
        }
      }
    })

    // Apply sorting
    const isAsc = sort.order === 'asc'
    dbQuery = dbQuery.order(sort.by, { ascending: isAsc })

    // Apply pagination
    const offset = (pagination.page - 1) * pagination.limit
    dbQuery = dbQuery.range(offset, offset + pagination.limit - 1)

    const { data: products, error, count } = await dbQuery

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      data: {
        products: products || [],
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: count || 0,
          pages: Math.ceil((count || 0) / pagination.limit),
          hasNext: (pagination.page * pagination.limit) < (count || 0),
          hasPrev: pagination.page > 1
        },
        appliedFilters: filters,
        query
      }
    })

  } catch (error) {
    console.error('Advanced search API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to perform advanced search',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    )
  }
}