import React from 'react';
import PluginTestComponent from '@/components/PluginTestComponent';

/**
 * 🧪 插件测试页面
 * 专门用于测试新安装的开发插件功能
 */

export default function PluginTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 开发插件功能测试
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            测试刚刚安装的 VS Code/Cursor 插件功能，验证开发环境配置是否正确
          </p>
        </div>

        {/* 测试组件展示 */}
        <div className="space-y-8">
          <PluginTestComponent 
            title="✅ 成功状态测试" 
            status="success"
          >
            <p>这是成功状态的测试组件，用于验证 Tailwind CSS 样式是否正确应用。</p>
          </PluginTestComponent>

          <PluginTestComponent 
            title="⚠️ 警告状态测试" 
            status="warning"
          >
            <p>这是警告状态的测试组件，检查样式变化和 TypeScript 类型推断。</p>
          </PluginTestComponent>

          <PluginTestComponent 
            title="❌ 错误状态测试" 
            status="error"
          >
            <p>这是错误状态的测试组件，测试错误样式和 Error Lens 功能。</p>
          </PluginTestComponent>
        </div>

        {/* 插件功能说明 */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 插件功能验证指南
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-600">
                🎨 前端开发插件
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>Tailwind CSS IntelliSense</strong>: 类名自动补全</li>
                <li>• <strong>Auto Rename Tag</strong>: 标签同步重命名</li>
                <li>• <strong>Prettier</strong>: 代码自动格式化</li>
                <li>• <strong>Error Lens</strong>: 行内错误显示</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-green-600">
                ⚡ 开发效率插件
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• <strong>TypeScript</strong>: 类型检查和智能提示</li>
                <li>• <strong>ESLint</strong>: 代码质量检查</li>
                <li>• <strong>Path Intellisense</strong>: 文件路径提示</li>
                <li>• <strong>GitLens</strong>: Git 历史可视化</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              💡 测试建议
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>在编辑器中打开这个文件</li>
              <li>尝试修改 className 属性，观察 Tailwind 提示</li>
              <li>故意输入错误的 TypeScript 代码</li>
              <li>使用 Cmd+S (Mac) 或 Ctrl+S (Windows) 保存文件</li>
              <li>查看是否有自动格式化和错误提示</li>
            </ol>
          </div>
        </div>

        {/* 返回首页链接 */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}