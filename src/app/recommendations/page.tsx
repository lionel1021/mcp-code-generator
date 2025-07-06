'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lightbulb, Star, Heart, ExternalLink, Filter } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  brand: string
  price: number
  rating: number
  reviews: number
  image: string
  description: string
  features: string[]
  affiliateLinks: {
    amazon?: string
    homedepot?: string
    wayfair?: string
  }
  matchScore: number
}

// Mock product data - in real app, this would come from API
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Modern LED Ceiling Light',
    brand: 'Philips Hue',
    price: 249,
    rating: 4.5,
    reviews: 1234,
    image: '/api/placeholder/400/300',
    description: 'Smart LED ceiling light with customizable colors and brightness',
    features: ['Smart home compatible', 'Energy efficient', 'Color changing', 'Voice control'],
    affiliateLinks: {
      amazon: 'https://amazon.com/example',
      homedepot: 'https://homedepot.com/example'
    },
    matchScore: 95
  },
  {
    id: '2',
    name: 'Industrial Pendant Light',
    brand: 'West Elm',
    price: 179,
    rating: 4.3,
    reviews: 876,
    image: '/api/placeholder/400/300',
    description: 'Vintage-inspired pendant light with brass accents',
    features: ['Brass finish', 'Adjustable height', 'Edison bulb compatible', 'Easy installation'],
    affiliateLinks: {
      amazon: 'https://amazon.com/example',
      wayfair: 'https://wayfair.com/example'
    },
    matchScore: 88
  },
  {
    id: '3',
    name: 'Minimalist Table Lamp',
    brand: 'IKEA',
    price: 79,
    rating: 4.1,
    reviews: 542,
    image: '/api/placeholder/400/300',
    description: 'Clean lines and warm lighting for modern spaces',
    features: ['Minimalist design', 'Warm light', 'Compact size', 'Affordable'],
    affiliateLinks: {
      amazon: 'https://amazon.com/example'
    },
    matchScore: 82
  }
]

function RecommendationsContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'match' | 'price' | 'rating'>('match')

  // Get questionnaire answers from URL params
  const answers = {
    roomType: searchParams.get('roomType') || '',
    roomSize: searchParams.get('roomSize') || '',
    style: searchParams.get('style') || '',
    budget: searchParams.get('budget') || '',
    currentLighting: searchParams.get('currentLighting') || ''
  }

  useEffect(() => {
    // Simulate API call to get recommendations
    const fetchRecommendations = async () => {
      setIsLoading(true)
      
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In real app, this would be an API call with the answers
      setProducts(mockProducts)
      setIsLoading(false)
    }

    fetchRecommendations()
  }, [])

  const toggleFavorite = (productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId)
      } else {
        newFavorites.add(productId)
      }
      return newFavorites
    })
  }

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price':
        return a.price - b.price
      case 'rating':
        return b.rating - a.rating
      case 'match':
      default:
        return b.matchScore - a.matchScore
    }
  })

  const handlePurchaseClick = (product: Product, platform: string) => {
    // Track click for analytics
    console.log(`Clicked purchase for ${product.name} on ${platform}`)
    
    // In real app, this would track the click and open affiliate link
    const link = product.affiliateLinks[platform as keyof typeof product.affiliateLinks]
    if (link) {
      window.open(link, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Finding perfect lighting for you...</h2>
          <p className="text-gray-600 mt-2">Analyzing your preferences and matching products</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">LightingPro</h1>
            </Link>
            <Link href="/questionnaire">
              <Button variant="outline">Retake Quiz</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Results Summary */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Perfect Lighting Recommendations
            </h2>
            <p className="text-gray-600 mb-6">
              Based on your {answers.roomType} room preferences, {answers.style} style, and {answers.budget} budget
            </p>
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">Sort by:</span>
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'match' | 'price' | 'rating')}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="match">Best Match</option>
                  <option value="price">Price: Low to High</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProducts.map((product, index) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div 
                  className="w-full h-48 bg-gray-200 flex items-center justify-center"
                >
                  <span className="text-gray-500">Product Image</span>
                </div>
                <button
                  onClick={() => toggleFavorite(product.id)}
                  className={`absolute top-4 right-4 p-2 rounded-full ${
                    favorites.has(product.id) 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className="h-4 w-4" />
                </button>
                {index === 0 && (
                  <div className="absolute top-4 left-4 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                    Best Match
                  </div>
                )}
              </div>
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <p className="text-sm text-gray-600">{product.brand}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {formatPrice(product.price)}
                    </div>
                    <div className="text-xs text-green-600">
                      {product.matchScore}% match
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-4 w-4 ${
                          i < Math.floor(product.rating) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating} ({product.reviews} reviews)
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-600 mb-4">{product.description}</p>
                
                <div className="space-y-2 mb-4">
                  {product.features.slice(0, 3).map((feature, i) => (
                    <div key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                      {feature}
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  {Object.entries(product.affiliateLinks).map(([platform]) => (
                    <Button 
                      key={platform}
                      onClick={() => handlePurchaseClick(product, platform)}
                      className="w-full flex items-center justify-between"
                      variant={platform === 'amazon' ? 'default' : 'outline'}
                    >
                      <span>Buy on {platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {products.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No recommendations found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your preferences or retake the quiz
            </p>
            <Link href="/questionnaire">
              <Button>Retake Quiz</Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

export default function RecommendationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading recommendations...</h2>
        </div>
      </div>
    }>
      <RecommendationsContent />
    </Suspense>
  )
}