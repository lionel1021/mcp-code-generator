#!/usr/bin/env node
/**
 * 🚀 LightingPro MCP 智能代码生成器
 * 基于模型上下文协议(MCP)的高级代码生成功能
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema, 
  ErrorCode, 
  ListToolsRequestSchema, 
  McpError 
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

/**
 * 🧠 智能代码生成模板引擎
 */
class SmartCodeGenerator {
  constructor() {
    this.templates = new Map();
    this.patterns = new Map();
    this.context = {
      projectType: 'lighting-app',
      framework: 'next.js',
      language: 'typescript',
      styling: 'tailwindcss',
      database: 'supabase',
      architecture: 'component-based'
    };
    this.initializeTemplates();
  }

  initializeTemplates() {
    // React组件模板
    this.templates.set('react-component', {
      template: `import React, { useState, useEffect } from 'react';
import { {{icons}} } from 'lucide-react';
{{imports}}

interface {{componentName}}Props {
  {{props}}
}

export const {{componentName}}: React.FC<{{componentName}}Props> = ({
  {{propList}}
}) => {
  {{stateDeclarations}}
  
  {{effects}}
  
  {{methods}}

  return (
    <div className="{{rootClassName}}">
      {{content}}
    </div>
  );
};

export default {{componentName}};`,
      variables: ['componentName', 'icons', 'imports', 'props', 'propList', 'stateDeclarations', 'effects', 'methods', 'rootClassName', 'content']
    });

    // API路由模板
    this.templates.set('api-route', {
      template: `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
{{imports}}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

{{methodHandlers}}

export async function {{method}}(request: NextRequest) {
  try {
    {{validation}}
    
    {{businessLogic}}
    
    return NextResponse.json({{successResponse}}, { status: {{successStatus}} });
  } catch (error) {
    console.error('{{routeName}} error:', error);
    return NextResponse.json(
      { error: '{{errorMessage}}' },
      { status: {{errorStatus}} }
    );
  }
}`,
      variables: ['imports', 'methodHandlers', 'method', 'validation', 'businessLogic', 'successResponse', 'successStatus', 'routeName', 'errorMessage', 'errorStatus']
    });

    // 数据库Hook模板
    this.templates.set('database-hook', {
      template: `import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
{{imports}}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function {{hookName}}<T = any>({{parameters}}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  {{methods}}

  useEffect(() => {
    {{fetchLogic}}
  }, [{{dependencies}}]);

  return {
    data,
    loading,
    error,
    {{returnMethods}}
  };
}`,
      variables: ['imports', 'hookName', 'parameters', 'methods', 'fetchLogic', 'dependencies', 'returnMethods']
    });

    // 页面组件模板
    this.templates.set('page-component', {
      template: `import React, { Suspense } from 'react';
import { Metadata } from 'next';
{{imports}}

export const metadata: Metadata = {
  title: '{{pageTitle}} | LightingPro',
  description: '{{pageDescription}}',
  keywords: [{{keywords}}],
};

{{loadingComponent}}

{{pageInterface}}

export default function {{pageName}}({{pageProps}}) {
  {{pageLogic}}

  return (
    <div className="{{pageClassName}}">
      {{seoSection}}
      
      <Suspense fallback={<{{loadingComponentName}} />}>
        {{mainContent}}
      </Suspense>
      
      {{additionalSections}}
    </div>
  );
}`,
      variables: ['imports', 'pageTitle', 'pageDescription', 'keywords', 'loadingComponent', 'pageInterface', 'pageName', 'pageProps', 'pageLogic', 'pageClassName', 'seoSection', 'loadingComponentName', 'mainContent', 'additionalSections']
    });

    // 设计模式
    this.patterns.set('lighting-product-card', {
      description: '照明产品卡片组件',
      props: {
        product: 'Product',
        onAddToCart: '(productId: number) => void',
        onAddToWishlist: '(productId: number) => void',
        variant: "'default' | 'compact' | 'detailed'"
      },
      features: ['产品图片轮播', '价格显示', '评分星级', '库存状态', '快捷操作']
    });

    this.patterns.set('smart-search', {
      description: '智能搜索组件',
      props: {
        onSearch: '(query: string) => void',
        filters: 'SearchFilter[]',
        suggestions: 'string[]',
        loading: 'boolean'
      },
      features: ['实时搜索建议', '高级过滤', '搜索历史', '语音搜索']
    });
  }

  /**
   * 🔍 分析现有代码结构
   */
  async analyzeCodebase(projectPath) {
    const analysis = {
      components: [],
      pages: [],
      hooks: [],
      types: [],
      patterns: [],
      dependencies: []
    };

    try {
      // 分析组件
      const componentsPath = path.join(projectPath, 'src/components');
      const componentFiles = await fs.readdir(componentsPath).catch(() => []);
      
      for (const file of componentFiles) {
        if (file.endsWith('.tsx')) {
          const content = await fs.readFile(path.join(componentsPath, file), 'utf-8');
          analysis.components.push({
            name: file.replace('.tsx', ''),
            path: file,
            exports: this.extractExports(content),
            props: this.extractProps(content),
            hooks: this.extractHooks(content)
          });
        }
      }

      // 分析页面
      const pagesPath = path.join(projectPath, 'src/app');
      const pageFiles = await this.getPageFiles(pagesPath);
      analysis.pages = pageFiles;

      // 分析package.json
      const packagePath = path.join(projectPath, 'package.json');
      const packageContent = await fs.readFile(packagePath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      analysis.dependencies = Object.keys(packageJson.dependencies || {});

      return analysis;
    } catch (error) {
      console.error('Codebase analysis error:', error);
      return analysis;
    }
  }

  /**
   * 🎯 智能代码生成
   */
  async generateCode(request) {
    const { type, name, specifications, context = {} } = request;
    
    // 合并上下文
    const fullContext = { ...this.context, ...context };
    
    switch (type) {
      case 'component':
        return this.generateComponent(name, specifications, fullContext);
      case 'page':
        return this.generatePage(name, specifications, fullContext);
      case 'hook':
        return this.generateHook(name, specifications, fullContext);
      case 'api':
        return this.generateAPIRoute(name, specifications, fullContext);
      case 'feature':
        return this.generateFeature(name, specifications, fullContext);
      default:
        throw new Error(`Unsupported generation type: ${type}`);
    }
  }

  /**
   * ⚛️ 生成React组件
   */
  generateComponent(name, specs, context) {
    const template = this.templates.get('react-component');
    const componentName = this.pascalCase(name);
    
    // 智能分析所需的图标
    const icons = this.analyzeRequiredIcons(specs);
    
    // 生成Props接口
    const props = this.generatePropsInterface(specs.props || {});
    const propList = Object.keys(specs.props || {}).join(',\n  ');
    
    // 生成状态声明
    const stateDeclarations = this.generateStateDeclarations(specs.state || {});
    
    // 生成方法
    const methods = this.generateMethods(specs.methods || []);
    
    // 生成内容
    const content = this.generateComponentContent(specs, icons);
    
    const variables = {
      componentName,
      icons: icons.join(', '),
      imports: this.generateImports(specs.imports || []),
      props,
      propList,
      stateDeclarations,
      effects: this.generateEffects(specs.effects || []),
      methods,
      rootClassName: this.generateRootClassName(specs.className),
      content
    };

    return this.renderTemplate(template.template, variables);
  }

  /**
   * 📄 生成页面组件
   */
  generatePage(name, specs, context) {
    const template = this.templates.get('page-component');
    const pageName = this.pascalCase(name) + 'Page';
    
    const variables = {
      imports: this.generatePageImports(specs.imports || []),
      pageTitle: specs.title || name,
      pageDescription: specs.description || `${name} page for LightingPro`,
      keywords: specs.keywords?.map(k => `"${k}"`).join(', ') || '"lighting", "LED"',
      loadingComponent: this.generateLoadingComponent(specs.loading),
      pageInterface: specs.props ? this.generatePagePropsInterface(specs.props) : '',
      pageName,
      pageProps: specs.props ? '{ params }: PageProps' : '',
      pageLogic: this.generatePageLogic(specs.logic || []),
      pageClassName: 'min-h-screen bg-gray-50',
      seoSection: this.generateSEOSection(specs.seo),
      loadingComponentName: 'LoadingSkeleton',
      mainContent: this.generateMainContent(specs.content),
      additionalSections: this.generateAdditionalSections(specs.sections || [])
    };

    return this.renderTemplate(template.template, variables);
  }

  /**
   * 🪝 生成自定义Hook
   */
  generateHook(name, specs, context) {
    const template = this.templates.get('database-hook');
    const hookName = 'use' + this.pascalCase(name);
    
    const variables = {
      imports: this.generateHookImports(specs.imports || []),
      hookName,
      parameters: this.generateHookParameters(specs.parameters || {}),
      methods: this.generateHookMethods(specs.methods || []),
      fetchLogic: this.generateFetchLogic(specs.query),
      dependencies: this.generateDependencies(specs.dependencies || []),
      returnMethods: this.generateReturnMethods(specs.returnMethods || [])
    };

    return this.renderTemplate(template.template, variables);
  }

  /**
   * 🛣️ 生成API路由
   */
  generateAPIRoute(name, specs, context) {
    const template = this.templates.get('api-route');
    
    const variables = {
      imports: this.generateAPIImports(specs.imports || []),
      methodHandlers: this.generateMethodHandlers(specs.methods || ['GET']),
      method: specs.method || 'GET',
      validation: this.generateValidation(specs.validation),
      businessLogic: this.generateBusinessLogic(specs.logic),
      successResponse: specs.successResponse || '{ success: true, data }',
      successStatus: specs.successStatus || 200,
      routeName: name,
      errorMessage: specs.errorMessage || 'Internal server error',
      errorStatus: specs.errorStatus || 500
    };

    return this.renderTemplate(template.template, variables);
  }

  /**
   * 🚀 生成完整功能模块
   */
  async generateFeature(name, specs, context) {
    const feature = {
      name: this.pascalCase(name),
      files: []
    };

    // 生成组件
    if (specs.components) {
      for (const [componentName, componentSpecs] of Object.entries(specs.components)) {
        const code = this.generateComponent(componentName, componentSpecs, context);
        feature.files.push({
          path: `src/components/${this.pascalCase(componentName)}.tsx`,
          content: code
        });
      }
    }

    // 生成页面
    if (specs.pages) {
      for (const [pageName, pageSpecs] of Object.entries(specs.pages)) {
        const code = this.generatePage(pageName, pageSpecs, context);
        feature.files.push({
          path: `src/app/${pageName}/page.tsx`,
          content: code
        });
      }
    }

    // 生成Hooks
    if (specs.hooks) {
      for (const [hookName, hookSpecs] of Object.entries(specs.hooks)) {
        const code = this.generateHook(hookName, hookSpecs, context);
        feature.files.push({
          path: `src/hooks/${hookName}.ts`,
          content: code
        });
      }
    }

    // 生成API路由
    if (specs.api) {
      for (const [routeName, routeSpecs] of Object.entries(specs.api)) {
        const code = this.generateAPIRoute(routeName, routeSpecs, context);
        feature.files.push({
          path: `src/app/api/${routeName}/route.ts`,
          content: code
        });
      }
    }

    return feature;
  }

  // 辅助方法
  analyzeRequiredIcons(specs) {
    const iconMap = {
      cart: 'ShoppingCart',
      heart: 'Heart',
      star: 'Star',
      search: 'Search',
      filter: 'Filter',
      share: 'Share2',
      user: 'User',
      settings: 'Settings',
      light: 'Lightbulb',
      power: 'Power',
      wifi: 'Wifi'
    };

    const icons = [];
    const content = JSON.stringify(specs).toLowerCase();
    
    for (const [keyword, icon] of Object.entries(iconMap)) {
      if (content.includes(keyword)) {
        icons.push(icon);
      }
    }

    return icons.length > 0 ? icons : ['Star'];
  }

  generatePropsInterface(props) {
    return Object.entries(props)
      .map(([key, type]) => `  ${key}: ${type};`)
      .join('\n');
  }

  generateStateDeclarations(state) {
    return Object.entries(state)
      .map(([key, type]) => `  const [${key}, set${this.pascalCase(key)}] = useState<${type}>();`)
      .join('\n');
  }

  generateMethods(methods) {
    return methods
      .map(method => `  const ${method.name} = ${method.implementation || '() => {}'}`)
      .join('\n\n');
  }

  generateComponentContent(specs, icons) {
    if (specs.pattern && this.patterns.has(specs.pattern)) {
      return this.generatePatternContent(specs.pattern, specs);
    }
    
    return `<div className="p-4">
        <h2 className="text-xl font-semibold mb-4">${specs.title || 'Component Title'}</h2>
        {/* TODO: Implement component content */}
      </div>`;
  }

  renderTemplate(template, variables) {
    let result = template;
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(placeholder, value || '');
    }
    return result;
  }

  // 工具方法
  pascalCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).replace(/[-_\s]+(.)?/g, (_, char) => 
      char ? char.toUpperCase() : ''
    );
  }

  camelCase(str) {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  }

  // 更多生成方法...
  generateImports(imports) {
    return imports.map(imp => `import ${imp};`).join('\n');
  }

  generateRootClassName(className) {
    return className || 'p-4 bg-white rounded-lg shadow-sm';
  }

  generateEffects(effects) {
    return effects.map(effect => 
      `  useEffect(() => {\n    ${effect.implementation || '// TODO: Implement effect'}\n  }, [${effect.dependencies?.join(', ') || ''}]);`
    ).join('\n\n');
  }

  // 提取代码信息的方法
  extractExports(content) {
    const exportRegex = /export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g;
    const exports = [];
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      exports.push(match[1]);
    }
    return exports;
  }

  extractProps(content) {
    const propsRegex = /interface\s+\w+Props\s*{([^}]*)}/s;
    const match = content.match(propsRegex);
    return match ? match[1].trim() : '';
  }

  extractHooks(content) {
    const hookRegex = /use\w+/g;
    return content.match(hookRegex) || [];
  }

  async getPageFiles(dir) {
    const files = [];
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      for (const item of items) {
        if (item.isDirectory()) {
          const subFiles = await this.getPageFiles(path.join(dir, item.name));
          files.push(...subFiles);
        } else if (item.name === 'page.tsx') {
          files.push(path.relative(dir, path.join(dir, item.name)));
        }
      }
    } catch (error) {
      // 目录不存在，忽略
    }
    return files;
  }

  // 更多辅助生成方法
  generatePageImports(imports) {
    const defaultImports = [
      "import Link from 'next/link';",
      "import Image from 'next/image';"
    ];
    return [...defaultImports, ...imports].join('\n');
  }

  generateLoadingComponent(loadingSpec) {
    return `const LoadingSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
  </div>
);`;
  }

  generatePageLogic(logic) {
    return logic.map(item => `  ${item}`).join('\n');
  }

  generateSEOSection(seo) {
    return `{/* SEO优化区域 */}
      <div className="sr-only">
        <h1>${seo?.h1 || 'Page Title'}</h1>
      </div>`;
  }

  generateMainContent(content) {
    return content || `<div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Page Content</h1>
        {/* TODO: Add main content */}
      </div>`;
  }

  generateAdditionalSections(sections) {
    return sections.map(section => 
      `<section className="py-8">
        <h2 className="text-2xl font-semibold mb-4">${section.title}</h2>
        {/* TODO: Implement ${section.title} */}
      </section>`
    ).join('\n\n      ');
  }

  generatePagePropsInterface(props) {
    return `interface PageProps {
  ${Object.entries(props).map(([key, type]) => `${key}: ${type};`).join('\n  ')}
}`;
  }

  generateHookImports(imports) {
    return ["import { useState, useEffect } from 'react';", ...imports].join('\n');
  }

  generateHookParameters(params) {
    return Object.entries(params).map(([key, type]) => `${key}: ${type}`).join(', ');
  }

  generateHookMethods(methods) {
    return methods.map(method => `  const ${method.name} = async (${method.params || ''}) => {
    try {
      ${method.implementation || '// TODO: Implement method'}
    } catch (error) {
      setError(error.message);
    }
  };`).join('\n\n');
  }

  generateFetchLogic(query) {
    return query ? `async function fetchData() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          ${query};
        
        if (error) throw error;
        setData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();` : '// TODO: Implement fetch logic';
  }

  generateDependencies(deps) {
    return deps.join(', ');
  }

  generateReturnMethods(methods) {
    return methods.join(',\n    ');
  }

  generateAPIImports(imports) {
    return ["import { NextRequest, NextResponse } from 'next/server';", ...imports].join('\n');
  }

  generateMethodHandlers(methods) {
    return methods.map(method => 
      `// ${method} handler implementation`
    ).join('\n');
  }

  generateValidation(validation) {
    return validation || '// TODO: Add request validation';
  }

  generateBusinessLogic(logic) {
    return logic || '// TODO: Implement business logic';
  }
}

/**
 * 🎛️ MCP 服务器设置
 */
const server = new Server(
  {
    name: 'lighting-smart-codegen',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const generator = new SmartCodeGenerator();

// 注册工具
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'analyze_codebase',
        description: '🔍 分析现有代码库结构和模式',
        inputSchema: {
          type: 'object',
          properties: {
            project_path: {
              type: 'string',
              description: '项目根目录路径'
            }
          },
          required: ['project_path']
        }
      },
      {
        name: 'generate_component',
        description: '⚛️ 智能生成React组件',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '组件名称'
            },
            specifications: {
              type: 'object',
              description: '组件规格和需求'
            },
            context: {
              type: 'object',
              description: '生成上下文'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'generate_page',
        description: '📄 生成Next.js页面组件',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '页面名称'
            },
            specifications: {
              type: 'object',
              description: '页面规格和需求'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'generate_hook',
        description: '🪝 生成自定义React Hook',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Hook名称'
            },
            specifications: {
              type: 'object',
              description: 'Hook规格和功能'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'generate_api_route',
        description: '🛣️ 生成API路由',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'API路由名称'
            },
            specifications: {
              type: 'object',
              description: 'API规格和功能'
            }
          },
          required: ['name']
        }
      },
      {
        name: 'generate_feature',
        description: '🚀 生成完整功能模块',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: '功能模块名称'
            },
            specifications: {
              type: 'object',
              description: '功能模块完整规格'
            }
          },
          required: ['name', 'specifications']
        }
      },
      {
        name: 'suggest_improvements',
        description: '💡 分析代码并建议改进',
        inputSchema: {
          type: 'object',
          properties: {
            file_path: {
              type: 'string',
              description: '要分析的文件路径'
            }
          },
          required: ['file_path']
        }
      }
    ]
  };
});

// 实现工具处理
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'analyze_codebase': {
        const analysis = await generator.analyzeCodebase(args.project_path);
        return {
          content: [
            {
              type: 'text',
              text: `🔍 代码库分析结果：\n\n${JSON.stringify(analysis, null, 2)}`
            }
          ]
        };
      }

      case 'generate_component': {
        const code = generator.generateComponent(
          args.name,
          args.specifications || {},
          args.context || {}
        );
        return {
          content: [
            {
              type: 'text',
              text: `⚛️ 生成的React组件：\n\n\`\`\`typescript\n${code}\n\`\`\``
            }
          ]
        };
      }

      case 'generate_page': {
        const code = generator.generatePage(
          args.name,
          args.specifications || {}
        );
        return {
          content: [
            {
              type: 'text',
              text: `📄 生成的页面组件：\n\n\`\`\`typescript\n${code}\n\`\`\``
            }
          ]
        };
      }

      case 'generate_hook': {
        const code = generator.generateHook(
          args.name,
          args.specifications || {}
        );
        return {
          content: [
            {
              type: 'text',
              text: `🪝 生成的自定义Hook：\n\n\`\`\`typescript\n${code}\n\`\`\``
            }
          ]
        };
      }

      case 'generate_api_route': {
        const code = generator.generateAPIRoute(
          args.name,
          args.specifications || {}
        );
        return {
          content: [
            {
              type: 'text',
              text: `🛣️ 生成的API路由：\n\n\`\`\`typescript\n${code}\n\`\`\``
            }
          ]
        };
      }

      case 'generate_feature': {
        const feature = await generator.generateFeature(
          args.name,
          args.specifications
        );
        
        const fileList = feature.files.map(file => 
          `📁 ${file.path}\n\`\`\`typescript\n${file.content}\n\`\`\`\n`
        ).join('\n');

        return {
          content: [
            {
              type: 'text',
              text: `🚀 生成的功能模块 "${feature.name}"：\n\n${fileList}`
            }
          ]
        };
      }

      case 'suggest_improvements': {
        // 简化版改进建议
        const suggestions = [
          "🔧 添加TypeScript类型定义",
          "🎨 优化Tailwind CSS类名结构",
          "♿ 改进可访问性标准",
          "⚡ 优化性能和加载速度",
          "🧪 添加单元测试",
          "📚 改进代码文档"
        ];

        return {
          content: [
            {
              type: 'text',
              text: `💡 代码改进建议：\n\n${suggestions.map(s => `• ${s}`).join('\n')}`
            }
          ]
        };
      }

      default:
        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
  } catch (error) {
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
  }
});

// 启动服务器
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🚀 LightingPro Smart CodeGen MCP Server started');
}

main().catch(console.error);