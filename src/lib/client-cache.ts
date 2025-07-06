// =====================================================
// Client-Side Caching Strategy
// Browser caching with React Query + Local Storage
// =====================================================

import { QueryClient } from '@tanstack/react-query'

// =====================================================
// 1. REACT QUERY CONFIGURATION
// =====================================================

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long inactive data stays in cache
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry 4xx errors
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false
        }
        return failureCount < 3
      },
      
      // Refetch strategies
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
})

// =====================================================
// 2. CACHE KEYS & QUERY FUNCTIONS
// =====================================================

export const QueryKeys = {
  // Products
  products: ['products'] as const,
  product: (id: string) => [...QueryKeys.products, id] as const,
  productSearch: (params: any) => [...QueryKeys.products, 'search', params] as const,
  productsByCategory: (categoryId: string, page: number) => 
    [...QueryKeys.products, 'category', categoryId, page] as const,
  
  // Recommendations
  recommendations: ['recommendations'] as const,
  productRecommendations: (questionnaireId: string) => 
    [...QueryKeys.recommendations, questionnaireId] as const,
  
  // Static data
  brands: ['brands'] as const,
  categories: ['categories'] as const,
  
  // User data
  user: ['user'] as const,
  userProfile: (userId: string) => [...QueryKeys.user, userId] as const,
  userFavorites: (userId: string) => [...QueryKeys.user, userId, 'favorites'] as const,
  
  // Analytics
  analytics: ['analytics'] as const,
  productStats: (productId: string) => [...QueryKeys.analytics, 'product', productId] as const,
} as const

// =====================================================
// 3. API FUNCTIONS WITH CACHING
// =====================================================

export const api = {
  // Product recommendations
  getRecommendations: async (questionnaireId: string) => {
    const response = await fetch(`/api/products/recommendations?questionnaire_id=${questionnaireId}`)
    if (!response.ok) throw new Error('Failed to fetch recommendations')
    return response.json()
  },

  // Product search
  searchProducts: async (params: {
    query?: string
    category?: string
    brand?: string
    minPrice?: number
    maxPrice?: number
    style?: string
    room?: string
    page?: number
    limit?: number
  }) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })
    
    const response = await fetch(`/api/products/search?${searchParams}`)
    if (!response.ok) throw new Error('Failed to search products')
    return response.json()
  },

  // Get product details
  getProduct: async (id: string) => {
    const response = await fetch(`/api/products/${id}`)
    if (!response.ok) throw new Error('Failed to fetch product')
    return response.json()
  },

  // Static data
  getBrands: async () => {
    const response = await fetch('/api/brands')
    if (!response.ok) throw new Error('Failed to fetch brands')
    return response.json()
  },

  getCategories: async () => {
    const response = await fetch('/api/categories')
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  // Create questionnaire
  createQuestionnaire: async (data: any) => {
    const response = await fetch('/api/products/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to create questionnaire')
    return response.json()
  },

  // Track user interaction
  trackInteraction: async (data: {
    product_id: string
    interaction_type: string
    platform?: string
    source?: string
  }) => {
    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) throw new Error('Failed to track interaction')
    return response.json()
  },
}

// =====================================================
// 4. HOOKS WITH CACHING
// =====================================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Product recommendations hook
export function useRecommendations(questionnaireId: string | null) {
  return useQuery({
    queryKey: QueryKeys.productRecommendations(questionnaireId || ''),
    queryFn: () => api.getRecommendations(questionnaireId!),
    enabled: !!questionnaireId,
    staleTime: 15 * 60 * 1000, // 15 minutes for recommendations
    cacheTime: 30 * 60 * 1000, // 30 minutes cache
  })
}

// Product search hook
export function useProductSearch(params: any) {
  return useQuery({
    queryKey: QueryKeys.productSearch(params),
    queryFn: () => api.searchProducts(params),
    keepPreviousData: true, // Keep previous results while loading new ones
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Product details hook
export function useProduct(id: string) {
  return useQuery({
    queryKey: QueryKeys.product(id),
    queryFn: () => api.getProduct(id),
    staleTime: 15 * 60 * 1000, // Products change less frequently
  })
}

// Static data hooks
export function useBrands() {
  return useQuery({
    queryKey: QueryKeys.brands,
    queryFn: api.getBrands,
    staleTime: 60 * 60 * 1000, // 1 hour for static data
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours cache
  })
}

export function useCategories() {
  return useQuery({
    queryKey: QueryKeys.categories,
    queryFn: api.getCategories,
    staleTime: 60 * 60 * 1000, // 1 hour for static data
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours cache
  })
}

// Mutation hooks
export function useCreateQuestionnaire() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createQuestionnaire,
    onSuccess: (data) => {
      // Cache the new recommendations
      queryClient.setQueryData(
        QueryKeys.productRecommendations(data.questionnaire_id),
        data
      )
    },
  })
}

export function useTrackInteraction() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.trackInteraction,
    onSuccess: (_, variables) => {
      // Invalidate product stats to reflect new interaction
      queryClient.invalidateQueries({
        queryKey: QueryKeys.productStats(variables.product_id)
      })
    },
  })
}

// =====================================================
// 5. LOCAL STORAGE UTILITIES
// =====================================================

export class LocalCache {
  
  static set(key: string, data: any, ttlMinutes: number = 60): void {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        ttl: ttlMinutes * 60 * 1000,
      }
      localStorage.setItem(`cache_${key}`, JSON.stringify(item))
    } catch (error) {
      console.warn('LocalStorage cache set failed:', error)
    }
  }
  
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`cache_${key}`)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      const now = Date.now()
      
      // Check if expired
      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(`cache_${key}`)
        return null
      }
      
      return parsed.data
    } catch (error) {
      console.warn('LocalStorage cache get failed:', error)
      return null
    }
  }
  
  static remove(key: string): void {
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn('LocalStorage cache remove failed:', error)
    }
  }
  
  static clear(): void {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('cache_'))
      keys.forEach(key => localStorage.removeItem(key))
    } catch (error) {
      console.warn('LocalStorage cache clear failed:', error)
    }
  }
}

// =====================================================
// 6. PREFETCHING STRATEGIES
// =====================================================

export class PrefetchManager {
  
  // Prefetch related products when viewing a product
  static async prefetchRelatedProducts(productId: string, category: string) {
    queryClient.prefetchQuery({
      queryKey: QueryKeys.productsByCategory(category, 1),
      queryFn: () => api.searchProducts({ category, limit: 20 }),
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  }
  
  // Prefetch product details when hovering over search results
  static async prefetchProductDetails(productId: string) {
    queryClient.prefetchQuery({
      queryKey: QueryKeys.product(productId),
      queryFn: () => api.getProduct(productId),
      staleTime: 15 * 60 * 1000,
    })
  }
  
  // Prefetch static data on app load
  static async prefetchStaticData() {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: QueryKeys.brands,
        queryFn: api.getBrands,
        staleTime: 60 * 60 * 1000,
      }),
      queryClient.prefetchQuery({
        queryKey: QueryKeys.categories,
        queryFn: api.getCategories,
        staleTime: 60 * 60 * 1000,
      }),
    ])
  }
}

export default queryClient