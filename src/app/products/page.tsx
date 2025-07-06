import React from 'react';
import { Suspense } from 'react';
import ProductGrid from '@/components/ProductGrid';
import { Loader2 } from 'lucide-react';

// 模拟产品数据（实际项目中从API获取）
const sampleProducts = [
  {
    id: 1,
    name: '飞利浦 LED 球泡灯 9W',
    description: '高亮度LED球泡灯，替代传统60W白炽灯，节能80%以上',
    price: 29.90,
    originalPrice: 39.90,
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
    rating: 4.5,
    reviewCount: 128,
    brand: '飞利浦',
    category: 'LED 灯具',
    tags: ['LED', '节能', '长寿命', '护眼'],
    features: ['即开即亮', '无频闪', '显色指数Ra>80', '环保材质'],
    affiliateUrl: 'https://affiliate.example.com/philips-led-9w',
    inStock: true,
    isNew: false,
    isHot: true,
  },
  {
    id: 2,
    name: '小米 Yeelight LED 智能灯泡',
    description: '支持1600万色彩调节，可通过米家APP远程控制',
    price: 79.00,
    originalPrice: 99.00,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    rating: 4.7,
    reviewCount: 256,
    brand: '小米',
    category: '智能照明',
    tags: ['智能', '调色', 'WiFi', 'APP控制'],
    features: ['语音控制', '定时开关', '音乐律动', '情景模式'],
    affiliateUrl: 'https://affiliate.example.com/xiaomi-yeelight',
    inStock: true,
    isNew: true,
    isHot: true,
  },
  {
    id: 3,
    name: '欧普 LED 吸顶灯 36W',
    description: '简约现代设计，适合客厅卧室使用，三档调光',
    price: 299.00,
    originalPrice: 399.00,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    rating: 4.3,
    reviewCount: 89,
    brand: '欧普照明',
    category: 'LED 灯具',
    tags: ['吸顶灯', '调光', '现代', '客厅'],
    features: ['遥控器控制', '记忆功能', '夜灯模式', '安装简便'],
    affiliateUrl: 'https://affiliate.example.com/opple-ceiling-36w',
    inStock: true,
    isNew: false,
    isHot: false,
  },
  {
    id: 4,
    name: '飞利浦 Hue 智能灯带 2米',
    description: '可弯曲LED灯带，支持HomeKit和Alexa，1600万色彩',
    price: 399.00,
    originalPrice: 499.00,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
    rating: 4.8,
    reviewCount: 167,
    brand: '飞利浦',
    category: '智能照明',
    tags: ['智能', '灯带', '防水', 'HomeKit'],
    features: ['可剪切', '背胶安装', '同步音乐', '渐变效果'],
    affiliateUrl: 'https://affiliate.example.com/philips-hue-strip',
    inStock: true,
    isNew: true,
    isHot: true,
  },
  {
    id: 5,
    name: '北欧创意吊灯 餐厅灯',
    description: '简约北欧风格，适合餐厅和书房使用',
    price: 589.00,
    originalPrice: 799.00,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    rating: 4.4,
    reviewCount: 45,
    brand: '北欧之光',
    category: '装饰灯',
    tags: ['吊灯', '北欧', '餐厅', '原木'],
    features: ['天然木材', '手工制作', '环保漆面', '可调高度'],
    affiliateUrl: 'https://affiliate.example.com/nordic-pendant',
    inStock: true,
    isNew: false,
    isHot: false,
  },
  {
    id: 6,
    name: 'LED 太阳能庭院灯',
    description: '太阳能充电，自动感应，防水设计',
    price: 199.00,
    originalPrice: 299.00,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    rating: 4.2,
    reviewCount: 78,
    brand: '雷士照明',
    category: '户外照明',
    tags: ['太阳能', '庭院', '防水', '感应'],
    features: ['光感应', '8小时照明', '免布线', '环保节能'],
    affiliateUrl: 'https://affiliate.example.com/solar-garden',
    inStock: true,
    isNew: false,
    isHot: false,
  },
  {
    id: 7,
    name: 'LED 工矿灯 100W',
    description: '高亮度工业照明，适用于工厂车间和仓库',
    price: 299.00,
    originalPrice: 399.00,
    imageUrl: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500',
    rating: 4.6,
    reviewCount: 34,
    brand: '雷士照明',
    category: '工业照明',
    tags: ['工矿灯', '高亮度', '工业', '节能'],
    features: ['散热优良', '抗震设计', '长寿命', '维护简便'],
    affiliateUrl: 'https://affiliate.example.com/industrial-100w',
    inStock: false,
    isNew: false,
    isHot: false,
  },
  {
    id: 8,
    name: '应急LED手电筒',
    description: '多功能应急照明，支持手摇充电和太阳能充电',
    price: 89.00,
    originalPrice: 129.00,
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
    rating: 4.1,
    reviewCount: 123,
    brand: 'GE通用电气',
    category: '应急照明',
    tags: ['应急', '手摇充电', '太阳能', '多功能'],
    features: ['收音机功能', '手机充电', '报警器', '指南针'],
    affiliateUrl: 'https://affiliate.example.com/emergency-torch',
    inStock: true,
    isNew: true,
    isHot: false,
  },
];

const ProductsLoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-center h-16">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">正在加载产品数据...</span>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="animate-pulse">
            <div className="h-56 bg-gray-300"></div>
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default function ProductsPage() {
  const handleAddToCart = (productId: number) => {
    // TODO: 实现添加到购物车功能
    console.log('Add to cart:', productId);
    // 这里可以调用购物车API或状态管理
  };

  const handleAddToWishlist = (productId: number) => {
    // TODO: 实现添加到收藏夹功能
    console.log('Add to wishlist:', productId);
    // 这里可以调用收藏夹API或状态管理
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              💡 照明产品大全
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              精选优质照明产品，从LED灯具到智能照明，满足您的各种照明需求
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<ProductsLoadingSkeleton />}>
          <ProductGrid
            products={sampleProducts}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            showFilters={true}
            showSearch={true}
            showSort={true}
            showViewToggle={true}
            defaultView="grid"
            itemsPerPage={12}
          />
        </Suspense>
      </div>

      {/* 页面底部信息 */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                智能搜索
              </h3>
              <p className="text-gray-600">
                强大的搜索和过滤功能，帮您快速找到理想的照明产品
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                品质保证
              </h3>
              <p className="text-gray-600">
                所有产品均经过严格筛选，保证质量和性能
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                专业推荐
              </h3>
              <p className="text-gray-600">
                基于用户评价和专业测评，为您推荐最合适的产品
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}