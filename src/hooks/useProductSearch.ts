import { useState, useEffect, useCallback, useMemo } from 'react'
import { LightingProduct } from '@/lib/supabase'

interface SearchFilters {
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  priceRange?: [number, number]
}

interface SortOption {
  by: string
  order: 'asc' | 'desc'
  label: string
}

interface SearchResponse {
  success: boolean
  data: {
    products: LightingProduct[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
      hasNext: boolean
      hasPrev: boolean
    }
    filters: {
      categories: string[]
      brands: string[]
      priceRange: { min: number; max: number }
    }
    query: any
  }
}

interface UseProductSearchOptions {
  initialQuery?: string
  initialFilters?: SearchFilters
  initialSort?: SortOption
  pageSize?: number
  debounceMs?: number
}

export const useProductSearch = (options: UseProductSearchOptions = {}) => {
  const {
    initialQuery = '',
    initialFilters = {},
    initialSort = { by: 'name', order: 'asc', label: '名称 A-Z' },
    pageSize = 20,
    debounceMs = 300
  } = options

  // State
  const [query, setQuery] = useState(initialQuery)
  const [filters, setFilters] = useState<SearchFilters>(initialFilters)
  const [sortBy, setSortBy] = useState<SortOption>(initialSort)
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState<LightingProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<any>(null)
  const [filterOptions, setFilterOptions] = useState<any>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 }
  })

  // Debounced search function
  const performSearch = useCallback(async (
    searchQuery: string,
    searchFilters: SearchFilters,
    searchSort: SortOption,
    searchPage: number
  ) => {
    setLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams({
        q: searchQuery,
        sort_by: searchSort.by,
        sort_order: searchSort.order,
        page: searchPage.toString(),
        limit: pageSize.toString()
      })

      // Add filters to search params
      if (searchFilters.category) {
        searchParams.append('category', searchFilters.category)
      }
      if (searchFilters.brand) {
        searchParams.append('brand', searchFilters.brand)
      }
      if (searchFilters.minPrice !== undefined) {
        searchParams.append('min_price', searchFilters.minPrice.toString())
      }
      if (searchFilters.maxPrice !== undefined) {
        searchParams.append('max_price', searchFilters.maxPrice.toString())
      }
      if (searchFilters.minRating !== undefined) {
        searchParams.append('min_rating', searchFilters.minRating.toString())
      }

      const response = await fetch(`/api/products/search?${searchParams}`)
      const data: SearchResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Search failed')
      }

      if (data.success) {
        setProducts(data.data.products)
        setPagination(data.data.pagination)
        setFilterOptions(data.data.filters)
      } else {
        throw new Error(data.error || 'Search failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [pageSize])

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(query, filters, sortBy, page)
    }, debounceMs)

    return () => clearTimeout(timeoutId)
  }, [query, filters, sortBy, page, performSearch, debounceMs])

  // Search functions
  const search = useCallback((newQuery: string) => {
    setQuery(newQuery)
    setPage(1)
  }, [])

  const updateFilter = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({})
    setPage(1)
  }, [])

  const updateSort = useCallback((newSort: SortOption) => {
    setSortBy(newSort)
    setPage(1)
  }, [])

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const nextPage = useCallback(() => {
    if (pagination?.hasNext) {
      setPage(prev => prev + 1)
    }
  }, [pagination])

  const prevPage = useCallback(() => {
    if (pagination?.hasPrev) {
      setPage(prev => prev - 1)
    }
  }, [pagination])

  const refresh = useCallback(() => {
    performSearch(query, filters, sortBy, page)
  }, [query, filters, sortBy, page, performSearch])

  // Advanced search with POST request
  const advancedSearch = useCallback(async (searchConfig: {
    query?: string
    filters?: SearchFilters
    sort?: SortOption
    pagination?: { page: number; limit: number }
  }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/products/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchConfig.query || query,
          filters: searchConfig.filters || filters,
          sort: searchConfig.sort || sortBy,
          pagination: searchConfig.pagination || { page, limit: pageSize }
        })
      })

      const data: SearchResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Advanced search failed')
      }

      if (data.success) {
        setProducts(data.data.products)
        setPagination(data.data.pagination)
        
        // Update state if provided
        if (searchConfig.query !== undefined) setQuery(searchConfig.query)
        if (searchConfig.filters) setFilters(searchConfig.filters)
        if (searchConfig.sort) setSortBy(searchConfig.sort)
        if (searchConfig.pagination) setPage(searchConfig.pagination.page)
      } else {
        throw new Error(data.error || 'Advanced search failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Advanced search failed')
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
    }
  }, [query, filters, sortBy, page, pageSize])

  // Computed values
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length
  }, [filters])

  const hasResults = products.length > 0
  const isEmpty = !loading && !hasResults && !error
  const hasMore = pagination?.hasNext || false
  const hasPrev = pagination?.hasPrev || false

  return {
    // State
    query,
    filters,
    sortBy,
    page,
    products,
    loading,
    error,
    pagination,
    filterOptions,

    // Actions
    search,
    updateFilter,
    clearFilters,
    updateSort,
    goToPage,
    nextPage,
    prevPage,
    refresh,
    advancedSearch,

    // Computed
    activeFiltersCount,
    hasResults,
    isEmpty,
    hasMore,
    hasPrev
  }
}