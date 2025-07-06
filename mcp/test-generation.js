#!/usr/bin/env node
/**
 * 🎯 快速测试MCP代码生成功能
 */

import { promises as fs } from 'fs';

// 测试智能代码生成
async function testCodeGeneration() {
  console.log('🚀 测试MCP智能代码生成器\n');

  // 1. 测试产品卡片组件生成
  console.log('🎯 生成产品卡片组件...\n');
  
  const productCardSpec = {
    type: 'component',
    name: 'ProductCard',
    specifications: {
      props: {
        product: 'Product',
        onAddToCart: '(productId: number) => void',
        onAddToWishlist: '(productId: number) => void',
        variant: "'default' | 'compact' | 'detailed'"
      },
      features: ['产品图片轮播', '价格显示', '评分星级', '库存状态', '快捷操作'],
      styling: 'tailwindcss',
      icons: ['ShoppingCart', 'Heart', 'Star', 'ExternalLink'],
      pattern: 'card',
      state: {
        isLoading: 'boolean',
        isFavorited: 'boolean'
      },
      methods: [
        { name: 'handleAddToCart', implementation: 'async () => { setIsLoading(true); await onAddToCart?.(product.id); setIsLoading(false); }' },
        { name: 'toggleFavorite', implementation: '() => { setIsFavorited(!isFavorited); onAddToWishlist?.(product.id); }' }
      ]
    }
  };

  const generatedComponent = await simulateGeneration(productCardSpec);
  console.log('✅ 生成的产品卡片组件:\n');
  console.log(generatedComponent);

  // 2. 测试搜索页面生成
  console.log('\n🔍 生成搜索功能页面...\n');
  
  const searchPageSpec = {
    type: 'page',
    name: 'SearchPage',
    specifications: {
      title: '智能产品搜索',
      description: '使用AI增强的产品搜索和推荐系统',
      keywords: ['照明', '搜索', 'LED', '智能照明'],
      imports: ['SearchBar', 'FilterPanel', 'ProductGrid'],
      components: ['SearchBar', 'FilterPanel', 'ProductGrid', 'RecommendationPanel'],
      logic: [
        'const [searchQuery, setSearchQuery] = useState("");',
        'const [filters, setFilters] = useState({});',
        'const { data: products, loading } = useProductSearch(searchQuery, filters);'
      ],
      seo: { h1: '智能照明产品搜索' }
    }
  };

  const generatedPage = await simulateGeneration(searchPageSpec);
  console.log('✅ 生成的搜索页面:\n');
  console.log(generatedPage);

  // 3. 测试Hook生成
  console.log('\n🪝 生成用户收藏Hook...\n');
  
  const hookSpec = {
    type: 'hook',
    name: 'UserWishlist',
    specifications: {
      parameters: { userId: 'string' },
      methods: [
        { name: 'addToWishlist', params: 'productId: string', implementation: 'await supabase.from("wishlists").insert({ user_id: userId, product_id: productId })' },
        { name: 'removeFromWishlist', params: 'productId: string', implementation: 'await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId)' },
        { name: 'toggleWishlist', params: 'productId: string', implementation: 'isInWishlist(productId) ? await removeFromWishlist(productId) : await addToWishlist(productId)' }
      ],
      query: '.from("wishlists").select("*, products(*)").eq("user_id", userId)',
      dependencies: ['userId'],
      returnMethods: ['addToWishlist', 'removeFromWishlist', 'toggleWishlist', 'isInWishlist']
    }
  };

  const generatedHook = await simulateGeneration(hookSpec);
  console.log('✅ 生成的收藏Hook:\n');
  console.log(generatedHook);

  console.log('\n🎉 代码生成演示完成！');
}

// 模拟代码生成逻辑
async function simulateGeneration(spec) {
  const { type, name, specifications } = spec;
  
  if (type === 'component') {
    return generateComponent(name, specifications);
  } else if (type === 'page') {
    return generatePage(name, specifications);
  } else if (type === 'hook') {
    return generateHook(name, specifications);
  }
  
  return `// Generated ${type}: ${name}`;
}

function generateComponent(name, specs) {
  const icons = specs.icons?.join(', ') || 'Star';
  const propEntries = Object.entries(specs.props || {});
  const stateEntries = Object.entries(specs.state || {});
  
  return `import React, { useState, useCallback } from 'react';
import { ${icons} } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  imageUrl: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface ${name}Props {
${propEntries.map(([key, type]) => `  ${key}: ${type};`).join('\n')}
}

export const ${name}: React.FC<${name}Props> = React.memo(({
  ${propEntries.map(([key]) => key).join(',\n  ')}
}) => {
${stateEntries.map(([key, type]) => `  const [${key}, set${key.charAt(0).toUpperCase() + key.slice(1)}] = useState<${type}>(false);`).join('\n')}

${specs.methods?.map(method => `  const ${method.name} = useCallback(${method.implementation}, []);`).join('\n\n') || ''}

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={\`w-4 h-4 \${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}\`} 
      />
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* 产品图片区域 */}
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
        >
          <Heart className={\`w-4 h-4 \${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'}\`} />
        </button>
      </div>

      {/* 产品信息区域 */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        {/* 评分 */}
        <div className="flex items-center mb-3">
          <div className="flex items-center space-x-1">
            {renderStars(product.rating || 0)}
          </div>
          <span className="text-sm text-gray-500 ml-2">
            ({product.reviewCount || 0})
          </span>
        </div>

        {/* 价格和操作 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-red-600">
              ¥{product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                ¥{product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock || isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isLoading ? '添加中...' : '加入购物车'}</span>
          </button>
        </div>
      </div>
    </div>
  );
});

${name}.displayName = '${name}';

export default ${name};`;
}

function generatePage(name, specs) {
  return `import React, { Suspense, useState } from 'react';
import { Metadata } from 'next';
import { Search, Filter } from 'lucide-react';
${specs.imports?.map(imp => `import ${imp} from '@/components/${imp}';`).join('\n') || ''}

export const metadata: Metadata = {
  title: '${specs.title} | LightingPro',
  description: '${specs.description}',
  keywords: [${specs.keywords?.map(k => `"${k}"`).join(', ') || '"lighting"'}],
};

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

export default function ${name}() {
${specs.logic?.map(logic => `  ${logic}`).join('\n') || ''}

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO优化区域 */}
      <div className="sr-only">
        <h1>${specs.seo?.h1 || specs.title}</h1>
      </div>

      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              ${specs.title}
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ${specs.description}
            </p>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="space-y-6">
            {/* 搜索和过滤 */}
            <div className="flex flex-col sm:flex-row gap-4">
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="搜索照明产品..."
              />
              <FilterPanel 
                filters={filters}
                onChange={setFilters}
              />
            </div>

            {/* 产品网格 */}
            <ProductGrid 
              products={products}
              loading={loading}
            />
          </div>
        </Suspense>
      </div>
    </div>
  );
}`;
}

function generateHook(name, specs) {
  const hookName = 'use' + name;
  
  return `import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function ${hookName}(${Object.entries(specs.parameters || {}).map(([key, type]) => `${key}: ${type}`).join(', ')}) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

${specs.methods?.map(method => `  const ${method.name} = useCallback(async (${method.params}) => {
    try {
      ${method.implementation};
      await refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  }, [${specs.dependencies?.join(', ') || ''}]);`).join('\n\n') || ''}

  const isInWishlist = useCallback((productId: string) => {
    return data.some(item => item.product_id === productId);
  }, [data]);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: result, error } = await supabase
        ${specs.query};
      
      if (error) throw error;
      setData(result || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [${specs.dependencies?.join(', ') || ''}]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    ${specs.returnMethods?.join(',\n    ') || ''}
  };
}`;
}

// 运行测试
testCodeGeneration().catch(console.error);