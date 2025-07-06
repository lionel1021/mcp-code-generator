'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Star, 
  ShoppingCart,
  Eye,
  ChevronDown,
  X,
  RefreshCw,
  Grid,
  List,
  ArrowUpDown
} from 'lucide-react';
import { LightingProduct } from '@/lib/supabase';

interface SearchFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  priceRange?: [number, number];
}

interface SortOption {
  by: string;
  order: 'asc' | 'desc';
  label: string;
}

interface ProductSearchProps {
  onProductSelect?: (product: LightingProduct) => void;
  onAddToCart?: (product: LightingProduct) => void;
  className?: string;
  showFilters?: boolean;
  defaultQuery?: string;
  defaultFilters?: SearchFilters;
}

interface SearchResponse {
  success: boolean;
  data: {
    products: LightingProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      categories: string[];
      brands: string[];
      priceRange: { min: number; max: number };
    };
    query: any;
  };
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  onProductSelect,
  onAddToCart,
  className = '',
  showFilters = true,
  defaultQuery = '',
  defaultFilters = {}
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [products, setProducts] = useState<LightingProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>({
    by: 'name',
    order: 'asc',
    label: '名称 A-Z'
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filterOptions, setFilterOptions] = useState<any>({
    categories: [],
    brands: [],
    priceRange: { min: 0, max: 0 }
  });

  const sortOptions: SortOption[] = [
    { by: 'name', order: 'asc', label: '名称 A-Z' },
    { by: 'name', order: 'desc', label: '名称 Z-A' },
    { by: 'price', order: 'asc', label: '价格从低到高' },
    { by: 'price', order: 'desc', label: '价格从高到低' },
    { by: 'rating', order: 'desc', label: '评分从高到低' },
    { by: 'created_at', order: 'desc', label: '最新添加' }
  ];

  const performSearch = useCallback(async (newPage = 1) => {
    setLoading(true);
    
    try {
      const searchParams = new URLSearchParams({
        q: query,
        sort_by: sortBy.by,
        sort_order: sortBy.order,
        page: newPage.toString(),
        limit: '20'
      });

      // Add filters to search params
      if (filters.category) searchParams.append('category', filters.category);
      if (filters.brand) searchParams.append('brand', filters.brand);
      if (filters.minPrice !== undefined) searchParams.append('min_price', filters.minPrice.toString());
      if (filters.maxPrice !== undefined) searchParams.append('max_price', filters.maxPrice.toString());
      if (filters.minRating !== undefined) searchParams.append('min_rating', filters.minRating.toString());

      const response = await fetch(`/api/products/search?${searchParams}`);
      const data: SearchResponse = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
        setFilterOptions(data.data.filters);
        setPage(newPage);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [query, filters, sortBy]);

  // Initial search and search on dependency changes
  useEffect(() => {
    performSearch(1);
  }, [query, filters, sortBy]);

  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  const handleSort = useCallback((option: SortOption) => {
    setSortBy(option);
    setPage(1);
  }, []);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;
  }, [filters]);

  const renderProductCard = (product: LightingProduct) => (
    <div key={product.id} className={`
      bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden
      hover:shadow-md transition-all duration-200 group
      ${viewMode === 'list' ? 'flex' : ''}
    `}>
      <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
        <img 
          src={product.image_urls[0] || '/placeholder-product.png'} 
          alt={product.name}
          className={`object-cover group-hover:scale-105 transition-transform duration-300 ${
            viewMode === 'list' ? 'w-full h-32' : 'w-full h-48'
          }`}
        />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-medium">{product.rating}</span>
        </div>
      </div>

      <div className={`p-4 ${viewMode === 'list' ? 'flex-1 flex flex-col justify-between' : ''}`}>
        <div>
          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mt-4' : ''}`}>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-green-600">
              ¥{product.price.toFixed(2)}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {product.category}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onProductSelect?.(product)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="查看详情"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => onAddToCart?.(product)}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">加入购物车</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white ${className}`}>
      {/* Search Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索照明产品..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              {showFilters && (
                <button
                  onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    showFiltersPanel || activeFiltersCount > 0
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>筛选</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              )}
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortOptions.findIndex(opt => opt.by === sortBy.by && opt.order === sortBy.order)}
                  onChange={(e) => handleSort(sortOptions[parseInt(e.target.value)])}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {sortOptions.map((option, index) => (
                    <option key={index} value={index}>{option.label}</option>
                  ))}
                </select>
                <ArrowUpDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              {loading && (
                <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFiltersPanel && (
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部分类</option>
                {filterOptions.categories.map((category: string) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">品牌</label>
              <select
                value={filters.brand || ''}
                onChange={(e) => handleFilterChange('brand', e.target.value || undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部品牌</option>
                {filterOptions.brands.map((brand: string) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">价格范围</label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="最低价"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="最高价"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">最低评分</label>
              <select
                value={filters.minRating || ''}
                onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">全部评分</option>
                <option value="4.5">4.5星以上</option>
                <option value="4.0">4.0星以上</option>
                <option value="3.5">3.5星以上</option>
                <option value="3.0">3.0星以上</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span>清除所有筛选</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="p-6">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-sm text-gray-600">
            {pagination && (
              <span>
                找到 {pagination.total} 个产品
                {query && <span> 关于 "{query}"</span>}
              </span>
            )}
          </div>
          
          {pagination && pagination.total > 0 && (
            <div className="text-sm text-gray-600">
              第 {pagination.page} 页，共 {pagination.pages} 页
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 rounded-lg h-48 mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className={`
            ${viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
            }
          `}>
            {products.map(renderProductCard)}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-2">🔍</div>
            <p className="text-gray-600">没有找到符合条件的产品</p>
            <p className="text-sm text-gray-500 mt-2">请尝试调整搜索条件或筛选器</p>
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="mt-8 flex items-center justify-center space-x-2">
            <button
              onClick={() => performSearch(page - 1)}
              disabled={!pagination.hasPrev}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              上一页
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(pagination.pages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => performSearch(pageNum)}
                    className={`px-3 py-2 rounded-lg ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => performSearch(page + 1)}
              disabled={!pagination.hasNext}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              下一页
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;