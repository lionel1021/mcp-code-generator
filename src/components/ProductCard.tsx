import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Heart, ExternalLink } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    rating?: number;
    reviewCount?: number;
    brand?: string;
    category?: string;
    tags?: string[];
    features?: string[];
    affiliateUrl?: string;
    inStock?: boolean;
    isNew?: boolean;
    isHot?: boolean;
  };
  variant?: 'default' | 'compact' | 'detailed';
  showWishlist?: boolean;
  onAddToCart?: (productId: number) => void;
  onAddToWishlist?: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showWishlist = true,
  onAddToCart,
  onAddToWishlist,
}) => {
  const {
    id,
    name,
    description,
    price,
    originalPrice,
    imageUrl,
    rating = 0,
    reviewCount = 0,
    brand,
    category,
    tags = [],
    features = [],
    affiliateUrl,
    inStock = true,
    isNew = false,
    isHot = false,
  } = product;

  const discountPercentage = originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart && inStock) {
      onAddToCart(id);
    }
  };

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToWishlist) {
      onAddToWishlist(id);
    }
  };

  const handleAffiliateClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (affiliateUrl) {
      window.open(affiliateUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400 opacity-50" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return stars;
  };

  if (variant === 'compact') {
    return (
      <Link href={`/product/${id}`} className="block group">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="relative">
            <Image
              src={imageUrl}
              alt={name}
              width={300}
              height={200}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {isNew && (
              <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                新品
              </span>
            )}
            {isHot && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                热销
              </span>
            )}
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-red-600">
                  ¥{price.toFixed(2)}
                </span>
                {originalPrice && (
                  <span className="text-sm text-gray-500 line-through">
                    ¥{originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(rating)}
                <span className="text-sm text-gray-500">({reviewCount})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${id}`} className="block group">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* 产品图片区域 */}
        <div className="relative">
          <Image
            src={imageUrl}
            alt={name}
            width={400}
            height={300}
            className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* 标签 */}
          <div className="absolute top-3 left-3 flex flex-col space-y-1">
            {isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                新品
              </span>
            )}
            {isHot && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                热销
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* 快捷操作按钮 */}
          <div className="absolute top-3 right-3 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {showWishlist && (
              <button
                onClick={handleAddToWishlist}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="添加到收藏"
              >
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>
            )}
            {affiliateUrl && (
              <button
                onClick={handleAffiliateClick}
                className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                title="查看商品详情"
              >
                <ExternalLink className="w-4 h-4 text-gray-600 hover:text-blue-500" />
              </button>
            )}
          </div>

          {/* 库存状态 */}
          {!inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white text-lg font-semibold">暂时缺货</span>
            </div>
          )}
        </div>

        {/* 产品信息区域 */}
        <div className="p-4">
          {/* 品牌和分类 */}
          {(brand || category) && (
            <div className="flex items-center justify-between mb-2">
              {brand && (
                <span className="text-sm text-blue-600 font-medium">{brand}</span>
              )}
              {category && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {category}
                </span>
              )}
            </div>
          )}

          {/* 产品名称 */}
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {name}
          </h3>

          {/* 产品描述 */}
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {description}
          </p>

          {/* 特色功能 */}
          {features.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {features.slice(0, 3).map((feature, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                  >
                    {feature}
                  </span>
                ))}
                {features.length > 3 && (
                  <span className="text-xs text-gray-500">+{features.length - 3}</span>
                )}
              </div>
            </div>
          )}

          {/* 评分和评论 */}
          <div className="flex items-center mb-3">
            <div className="flex items-center space-x-1">
              {renderStars(rating)}
              <span className="text-sm text-gray-600 ml-1">
                {rating > 0 ? rating.toFixed(1) : 'N/A'}
              </span>
            </div>
            <span className="text-sm text-gray-500 ml-2">
              ({reviewCount} 评价)
            </span>
          </div>

          {/* 价格和操作 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-red-600">
                ¥{price.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">
                  ¥{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                inStock
                  ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{inStock ? '加入购物车' : '缺货'}</span>
            </button>
          </div>

          {/* 标签 */}
          {tags.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {tags.slice(0, 4).map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
                {tags.length > 4 && (
                  <span className="text-xs text-gray-500">+{tags.length - 4}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;