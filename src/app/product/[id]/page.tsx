import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Truck, 
  Shield, 
  RotateCcw, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Zap,
  Award,
  Users,
  MessageCircle
} from 'lucide-react';

// 模拟产品详情数据
const sampleProductDetails = {
  1: {
    id: 1,
    name: '飞利浦 LED 球泡灯 9W',
    description: '高亮度LED球泡灯，替代传统60W白炽灯，节能80%以上。采用先进的LED技术，提供温暖舒适的光线，适合家庭各种场所使用。',
    price: 29.90,
    originalPrice: 39.90,
    images: [
      'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600',
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600'
    ],
    rating: 4.5,
    reviewCount: 128,
    brand: '飞利浦',
    category: 'LED 灯具',
    sku: 'PH-LED-9W-001',
    inStock: true,
    stockQuantity: 150,
    tags: ['LED', '节能', '长寿命', '护眼'],
    features: ['即开即亮', '无频闪', '显色指数Ra>80', '环保材质'],
    specifications: {
      '功率': '9W',
      '电压': '220V',
      '光通量': '806流明',
      '色温': '3000K (暖白光)',
      '显色指数': 'Ra>80',
      '使用寿命': '25000小时',
      '节能等级': 'A++',
      '灯头型号': 'E27',
      '尺寸': '60×60×108mm',
      '重量': '50g'
    },
    highlights: [
      '节能80%以上，替代传统60W白炽灯',
      '25000小时超长使用寿命',
      '即开即亮，无频闪护眼设计',
      '高显色指数Ra>80，还原真实色彩',
      '环保材质，通过CE、RoHS认证'
    ],
    affiliateUrl: 'https://affiliate.example.com/philips-led-9w',
    commissionRate: 0.08,
    warranty: '24个月',
    shipping: {
      free: true,
      estimatedDays: '1-3个工作日',
      areas: '全国包邮'
    }
  }
};

// 模拟评论数据
const sampleReviews = [
  {
    id: 1,
    userId: 1,
    userName: '张先生',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    rating: 5,
    comment: '质量很好，亮度足够，确实很节能。包装也很精美，安装简单。用了一个月没有任何问题，推荐购买！',
    date: '2024-12-01',
    helpful: 12,
    verified: true,
    images: ['https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=200']
  },
  {
    id: 2,
    userId: 2,
    userName: '李女士',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612d5c1?w=100',
    rating: 4,
    comment: '灯光柔和不刺眼，替换传统灯泡很方便。性价比不错，就是价格稍微有点贵。',
    date: '2024-11-28',
    helpful: 8,
    verified: true
  },
  {
    id: 3,
    userId: 3,
    userName: '王工程师',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    rating: 5,
    comment: '飞利浦的品质值得信赖，光效很好，色温舒适。作为工程师，我对照明产品比较挑剔，这款灯确实不错。',
    date: '2024-11-25',
    helpful: 15,
    verified: true
  }
];

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parseInt(id);
  const product = sampleProductDetails[productId as keyof typeof sampleProductDetails];

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">产品未找到</h1>
          <p className="text-gray-600 mb-6">抱歉，您访问的产品不存在或已下架。</p>
          <Link
            href="/products"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            返回产品列表
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-5 h-5 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 面包屑导航 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-blue-600 hover:text-blue-700">
              首页
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href="/products" className="text-blue-600 hover:text-blue-700">
              产品
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <Link href={`/category/${product.category}`} className="text-blue-600 hover:text-blue-700">
              {product.category}
            </Link>
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 产品图片区域 */}
          <div className="space-y-4">
            <div className="aspect-square relative overflow-hidden rounded-lg bg-white shadow-lg">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <div key={index} className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-colors">
                  <Image
                    src={image}
                    alt={`${product.name} - 图片 ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 产品信息区域 */}
          <div className="space-y-6">
            {/* 基本信息 */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  {product.brand}
                </span>
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {product.description}
              </p>
            </div>

            {/* 评分和评论 */}
            <div className="flex items-center space-x-4 py-4 border-t border-b border-gray-200">
              <div className="flex items-center space-x-1">
                {renderStars(product.rating)}
                <span className="text-lg font-semibold text-gray-900 ml-2">
                  {product.rating}
                </span>
              </div>
              <span className="text-gray-500">|</span>
              <span className="text-gray-600">
                {product.reviewCount} 条评价
              </span>
              <span className="text-gray-500">|</span>
              <span className="text-green-600 font-medium">
                {product.inStock ? `库存充足 (${product.stockQuantity}件)` : '暂时缺货'}
              </span>
            </div>

            {/* 价格信息 */}
            <div className="space-y-2">
              <div className="flex items-center space-x-4">
                <span className="text-4xl font-bold text-red-600">
                  ¥{product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ¥{product.originalPrice.toFixed(2)}
                    </span>
                    <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded-full font-medium">
                      节省 {discountPercentage}%
                    </span>
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500">
                价格包含税费，支持全国包邮
              </p>
            </div>

            {/* 产品特色 */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">产品特色</h3>
              <div className="grid grid-cols-2 gap-2">
                {product.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 购买操作 */}
            <div className="space-y-4">
              <div className="flex space-x-4">
                <button
                  className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{product.inStock ? '立即购买' : '暂时缺货'}</span>
                </button>
                <button className="flex items-center justify-center space-x-2 border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5" />
                  <span>收藏</span>
                </button>
                <button className="flex items-center justify-center space-x-2 border border-gray-300 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span>分享</span>
                </button>
              </div>

              {/* 联盟链接 */}
              {product.affiliateUrl && (
                <button
                  onClick={() => window.open(product.affiliateUrl, '_blank')}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                  <span>查看商品详情页</span>
                </button>
              )}
            </div>

            {/* 服务保障 */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-gray-900">服务保障</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-700">{product.shipping.areas}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-700">{product.warranty}质保</span>
                </div>
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-5 h-5 text-orange-500" />
                  <span className="text-sm text-gray-700">7天无理由退货</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 详细信息标签页 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium">
                产品规格
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                产品亮点
              </button>
              <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                用户评价
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 产品规格 */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-gray-900">技术规格</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="text-gray-600">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 用户评价 */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mt-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">用户评价</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating)}
                  <span className="text-lg font-semibold text-gray-900 ml-2">
                    {product.rating}
                  </span>
                </div>
                <span className="text-gray-500">基于 {product.reviewCount} 条评价</span>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {sampleReviews.map(review => (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-4">
                  <Image
                    src={review.userAvatar}
                    alt={review.userName}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{review.userName}</span>
                      {review.verified && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full">
                          已验证购买
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-500">{review.date}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                    {review.images && (
                      <div className="flex space-x-2 mt-3">
                        {review.images.map((image, index) => (
                          <Image
                            key={index}
                            src={image}
                            alt="用户上传图片"
                            width={80}
                            height={80}
                            className="rounded-lg object-cover"
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <button className="flex items-center space-x-1 hover:text-gray-700">
                        <Users className="w-4 h-4" />
                        <span>有用 ({review.helpful})</span>
                      </button>
                      <button className="flex items-center space-x-1 hover:text-gray-700">
                        <MessageCircle className="w-4 h-4" />
                        <span>回复</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}