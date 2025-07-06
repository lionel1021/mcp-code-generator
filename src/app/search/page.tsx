import { Metadata } from 'next'
import ProductSearch from '@/components/ProductSearch'
import { LightingProduct } from '@/lib/supabase'

export const metadata: Metadata = {
  title: '产品搜索 - 智能照明推荐',
  description: '搜索和筛选照明产品，找到最适合您需求的照明解决方案',
}

export default function SearchPage() {
  const handleProductSelect = (product: LightingProduct) => {
    // Navigate to product detail page
    window.location.href = `/products/${product.id}`
  }

  const handleAddToCart = (product: LightingProduct) => {
    // Add to cart logic
    console.log('Adding to cart:', product)
    // You can implement cart functionality here
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">产品搜索</h1>
                <p className="mt-2 text-gray-600">
                  搜索和筛选照明产品，找到最适合您的照明解决方案
                </p>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <a
                  href="/"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  返回首页
                </a>
                <a
                  href="/recommendations"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  获取推荐
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Component */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductSearch
          onProductSelect={handleProductSelect}
          onAddToCart={handleAddToCart}
          showFilters={true}
          className="rounded-lg shadow-sm"
        />
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>找不到合适的产品？</p>
            <div className="mt-4 space-x-4">
              <a
                href="/recommendations"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                获取个性化推荐
              </a>
              <span className="text-gray-400">|</span>
              <a
                href="/contact"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                联系客服
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}