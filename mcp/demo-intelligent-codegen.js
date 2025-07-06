#!/usr/bin/env node
/**
 * 🎯 MCP智能代码生成器演示脚本
 * 展示AI增强的代码生成、分析和优化能力
 */

import { spawn } from 'child_process';
import readline from 'readline';

class MCPCodeGenDemo {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.examples = new Map([
      ['产品卡片组件', {
        type: 'component',
        name: 'ProductCard',
        specifications: {
          props: {
            product: 'Product',
            onAddToCart: '(productId: number) => void',
            variant: "'default' | 'compact'"
          },
          features: ['价格显示', '评分系统', '库存状态', '购物车操作'],
          styling: 'tailwindcss',
          icons: ['ShoppingCart', 'Heart', 'Star'],
          pattern: 'card'
        }
      }],
      ['搜索功能页面', {
        type: 'page',
        name: 'SearchPage',
        specifications: {
          title: '产品搜索',
          description: '智能搜索和过滤照明产品',
          features: ['实时搜索', '高级过滤', '搜索建议', '结果排序'],
          components: ['SearchBar', 'FilterPanel', 'ResultGrid'],
          seo: { h1: '照明产品搜索' }
        }
      }],
      ['用户收藏Hook', {
        type: 'hook',
        name: 'UserWishlist',
        specifications: {
          parameters: { userId: 'string' },
          methods: [
            { name: 'addToWishlist', params: 'productId: string' },
            { name: 'removeFromWishlist', params: 'productId: string' }
          ],
          query: '.from("wishlists").select("*").eq("user_id", userId)',
          dependencies: ['userId']
        }
      }],
      ['推荐系统API', {
        type: 'api',
        name: 'recommendations',
        specifications: {
          method: 'POST',
          validation: 'userId, preferences, limit',
          logic: 'ML-based product recommendation algorithm',
          successResponse: '{ recommendations: Product[], metadata: RecommendationMeta }',
          errorMessage: 'Failed to generate recommendations'
        }
      }],
      ['完整用户中心功能', {
        type: 'feature',
        name: 'UserCenter',
        specifications: {
          components: {
            'UserProfile': {
              props: { user: 'User', onUpdate: '(user: User) => void' },
              features: ['头像上传', '信息编辑', '偏好设置']
            },
            'UserDashboard': {
              props: { stats: 'UserStats' },
              features: ['数据概览', '活动历史', '推荐产品']
            }
          },
          pages: {
            'profile': {
              title: '个人资料',
              components: ['UserProfile', 'PreferencesForm'],
              seo: { h1: '用户个人资料管理' }
            }
          },
          hooks: {
            'UserData': {
              parameters: { userId: 'string' },
              methods: [{ name: 'updateProfile', params: 'data: Partial<User>' }]
            }
          },
          api: {
            'user-stats': {
              method: 'GET',
              logic: 'Calculate user statistics and preferences'
            }
          }
        }
      }]
    ]);
  }

  async start() {
    console.log(`
🚀 MCP智能代码生成器演示
========================================

✨ 功能特色:
• 🧠 AI驱动的代码分析和生成
• 🎯 智能模式识别和应用
• 📊 代码质量评估和优化
• 🔄 自动重构和改进建议
• 🎨 设计模式自动应用

📋 可用演示:
${Array.from(this.examples.keys()).map((name, idx) => `${idx + 1}. ${name}`).join('\n')}

❓ 输入命令:
• 数字 1-${this.examples.size}: 运行对应演示
• 'analyze': 分析现有代码
• 'refactor': 重构代码演示
• 'help': 显示帮助
• 'quit': 退出演示

========================================
`);

    await this.mainLoop();
  }

  async mainLoop() {
    while (true) {
      const input = await this.prompt('请选择演示 (输入数字或命令): ');
      
      if (input.toLowerCase() === 'quit') {
        console.log('👋 感谢使用MCP智能代码生成器演示！');
        break;
      }
      
      if (input.toLowerCase() === 'help') {
        await this.showHelp();
        continue;
      }
      
      if (input.toLowerCase() === 'analyze') {
        await this.runAnalysisDemo();
        continue;
      }
      
      if (input.toLowerCase() === 'refactor') {
        await this.runRefactorDemo();
        continue;
      }
      
      const choice = parseInt(input);
      if (choice >= 1 && choice <= this.examples.size) {
        const exampleName = Array.from(this.examples.keys())[choice - 1];
        const example = this.examples.get(exampleName);
        await this.runGenerationDemo(exampleName, example);
      } else {
        console.log('❌ 无效输入，请重试');
      }
    }
    
    this.rl.close();
  }

  async runGenerationDemo(name, example) {
    console.log(`\n🎯 正在演示: ${name}`);
    console.log('📋 生成规格:', JSON.stringify(example.specifications, null, 2));
    
    console.log('\n⏳ 调用MCP智能代码生成器...');
    
    try {
      const result = await this.callMCPServer('ai_generate_code', example);
      console.log('\n✅ 生成完成！');
      console.log('📄 生成的代码:\n');
      console.log(result);
      
      // 模拟质量分析
      await this.simulateQualityAnalysis();
      
    } catch (error) {
      console.error('❌ 生成失败:', error.message);
    }
    
    await this.prompt('\n按Enter继续...');
  }

  async runAnalysisDemo() {
    console.log('\n🔍 代码分析演示');
    
    const sampleCode = `
import React, { useState, useEffect } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAddToCart = () => {
    setIsLoading(true);
    onAddToCart(product.id);
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">¥{product.price}</p>
      <button onClick={handleAddToCart} disabled={isLoading}>
        {isLoading ? '添加中...' : '加入购物车'}
      </button>
    </div>
  );
};

export default ProductCard;
`;

    console.log('📝 待分析代码:');
    console.log(sampleCode);
    
    console.log('\n⏳ 运行AI代码分析...');
    
    try {
      const analysis = await this.callMCPServer('ai_analyze_code', {
        content: sampleCode,
        file_path: 'ProductCard.tsx'
      });
      
      console.log('📊 分析结果:\n');
      console.log(analysis);
      
    } catch (error) {
      console.error('❌ 分析失败:', error.message);
    }
    
    await this.prompt('\n按Enter继续...');
  }

  async runRefactorDemo() {
    console.log('\n🔄 代码重构演示');
    
    const problematicCode = `
import React, { useState } from 'react';

const UserProfile = ({ user }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  
  const handleSave = () => {
    // 没有验证
    fetch('/api/user', {
      method: 'POST',
      body: JSON.stringify({ name, email })
    });
    setEditing(false);
  };

  return (
    <div>
      {editing ? (
        <div>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
          <button onClick={handleSave}>保存</button>
        </div>
      ) : (
        <div>
          <p>{name}</p>
          <p>{email}</p>
          <button onClick={() => setEditing(true)}>编辑</button>
        </div>
      )}
    </div>
  );
};
`;

    console.log('📝 需要重构的代码:');
    console.log(problematicCode);
    
    console.log('\n⏳ 运行AI智能重构...');
    
    try {
      const refactored = await this.callMCPServer('ai_refactor_code', {
        content: problematicCode,
        options: { focus: 'security,performance,maintainability' }
      });
      
      console.log('✨ 重构结果:\n');
      console.log(refactored);
      
    } catch (error) {
      console.error('❌ 重构失败:', error.message);
    }
    
    await this.prompt('\n按Enter继续...');
  }

  async callMCPServer(tool, args) {
    // 模拟MCP服务器调用
    console.log(`📡 调用工具: ${tool}`);
    console.log(`📤 参数:`, JSON.stringify(args, null, 2));
    
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 返回模拟结果
    switch (tool) {
      case 'ai_generate_code':
        return this.generateMockCode(args);
      case 'ai_analyze_code':
        return this.generateMockAnalysis();
      case 'ai_refactor_code':
        return this.generateMockRefactor();
      default:
        throw new Error(`Unknown tool: ${tool}`);
    }
  }

  generateMockCode(args) {
    const { type, name, specifications } = args;
    
    if (type === 'component') {
      return `\`\`\`typescript
import React, { useState, useCallback } from 'react';
import { ${specifications.icons?.join(', ') || 'Star'} } from 'lucide-react';

interface ${name}Props {
  ${Object.entries(specifications.props || {}).map(([key, type]) => `${key}: ${type};`).join('\n  ')}
}

export const ${name}: React.FC<${name}Props> = React.memo(({
  ${Object.keys(specifications.props || {}).join(',\n  ')}
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAction = useCallback(async () => {
    setIsLoading(true);
    try {
      // 实现业务逻辑
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        {/* 组件内容 */}
        ${specifications.features?.map(feature => `<div>/* ${feature} */</div>`).join('\n        ') || ''}
      </div>
    </div>
  );
});

${name}.displayName = '${name}';

export default ${name};
\`\`\`

🎯 **生成特点:**
- ✅ TypeScript类型安全
- ⚡ React.memo性能优化 
- 🎨 Tailwind CSS样式
- 🔧 useCallback优化
- 📱 响应式设计`;
    }
    
    if (type === 'feature') {
      return `🏗️ **完整功能架构生成:**

📁 **目录结构:**
\`\`\`
src/features/${name.toLowerCase()}/
├── components/
│   ├── ${name}Profile.tsx
│   ├── ${name}Dashboard.tsx
│   └── index.ts
├── hooks/
│   ├── use${name}Data.ts
│   └── index.ts
├── api/
│   ├── ${name.toLowerCase()}-stats.ts
│   └── index.ts
├── types/
│   └── index.ts
└── utils/
    └── index.ts
\`\`\`

🎯 **架构特点:**
- 🏗️ 模块化设计
- 🔄 可复用组件
- 📊 状态管理集成
- 🛡️ TypeScript类型安全
- ⚡ 性能优化内置`;
    }
    
    return `生成的${type}: ${name}`;
  }

  generateMockAnalysis() {
    return `🧠 **AI代码分析报告:**

📊 **质量评分**
- 整体质量: 72/100
- 复杂度: 15/100  
- 可维护性: 68/100
- 性能: 65/100
- 安全性: 85/100

🎯 **识别的模式**
- card (置信度: 89.5%)
- interactive (置信度: 76.2%)

⚠️ **发现的问题**
- 缺少TypeScript类型定义 (TypeScript)
- 没有错误处理机制 (Quality)
- 内联函数影响性能 (Performance)
- 缺少可访问性属性 (Accessibility)

💡 **改进建议**
- 添加TypeScript接口定义: 提高类型安全性
- 使用useCallback包装事件处理器: 避免不必要的重渲染
- 添加aria-label属性: 改善无障碍访问
- 实现错误边界: 提高组件稳定性`;
  }

  generateMockRefactor() {
    return `🔄 **AI重构结果:**

\`\`\`typescript
import React, { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';

// 类型定义
interface User {
  id: string;
  name: string;
  email: string;
}

interface UserProfileProps {
  user: User;
  onUpdate?: (user: User) => Promise<void>;
}

// 验证schema
const userSchema = z.object({
  name: z.string().min(1, '姓名不能为空'),
  email: z.string().email('请输入有效邮箱')
});

export const UserProfile: React.FC<UserProfileProps> = React.memo(({
  user,
  onUpdate
}) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: user.name, email: user.email });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrors({});
      
      // 验证数据
      const validatedData = userSchema.parse(formData);
      
      // 调用更新API
      await onUpdate?.(validatedData);
      setEditing(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  }, [formData, onUpdate]);

  const handleInputChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 清除字段错误
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {editing ? (
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                姓名
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={\`mt-1 block w-full rounded-md border-gray-300 shadow-sm \${
                  errors.name ? 'border-red-300' : ''
                }\`}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'name-error' : undefined}
              />
              {errors.name && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                邮箱
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={\`mt-1 block w-full rounded-md border-gray-300 shadow-sm \${
                  errors.email ? 'border-red-300' : ''
                }\`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={isLoading}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500">姓名</p>
            <p className="mt-1 text-lg text-gray-900">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">邮箱</p>
            <p className="mt-1 text-lg text-gray-900">{user.email}</p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
            编辑资料
          </button>
        </div>
      )}
    </div>
  );
});

UserProfile.displayName = 'UserProfile';
\`\`\`

✅ **应用的改进**
- 添加了TypeScript类型定义和接口
- 实现了表单验证使用Zod
- 添加了错误处理和用户反馈
- 使用useCallback优化性能
- 添加了无障碍访问属性
- 改进了加载状态管理
- 添加了JSDoc文档注释

📈 **改进对比**
- 质量分数: 72 → 94
- 可维护性: 68 → 89
- 性能: 65 → 85
- 安全性: 85 → 95`;
  }

  async simulateQualityAnalysis() {
    console.log('\n📊 正在进行质量分析...');
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log(`
🎯 **代码质量报告**
- 📈 整体质量分数: 92/100
- 🧠 AI模式识别: 已应用3个最佳实践模式
- 🔧 性能优化: 已自动应用memo和callback优化
- 🛡️ 类型安全: 100% TypeScript覆盖
- ♿ 可访问性: 符合WCAG 2.1 AA标准
- 🔒 安全性: 已通过安全扫描

💡 **智能建议**
- ✅ 已应用React.memo性能优化
- ✅ 已添加完整TypeScript类型
- ✅ 已集成Tailwind CSS设计系统
- ✅ 已应用组件最佳实践模式`);
  }

  async showHelp() {
    console.log(`
📚 **MCP智能代码生成器帮助**

🎯 **主要功能:**
1. **智能代码生成** - 基于规格自动生成高质量代码
2. **AI代码分析** - 深度分析代码质量、性能和安全性
3. **智能重构** - 自动改进代码结构和性能
4. **模式识别** - 识别和应用设计模式
5. **质量优化** - 自动应用最佳实践

🛠️ **可用工具:**
- ai_generate_code: AI代码生成
- ai_analyze_code: AI代码分析  
- ai_refactor_code: AI代码重构
- generate_feature_complete: 完整功能生成
- apply_design_patterns: 设计模式应用
- optimize_performance: 性能优化

🎨 **支持的生成类型:**
- React组件 (component)
- Next.js页面 (page)  
- 自定义Hook (hook)
- API路由 (api)
- 完整功能模块 (feature)

💡 **AI增强特性:**
- 🧠 智能模式识别
- 📊 质量自动评估
- 🔄 实时优化建议
- 🎯 上下文感知生成
- 🛡️ 安全性自动检查
`);
  }

  async prompt(question) {
    return new Promise((resolve) => {
      this.rl.question(question, resolve);
    });
  }
}

// 启动演示
const demo = new MCPCodeGenDemo();
demo.start().catch(console.error);