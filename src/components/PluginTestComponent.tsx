import React from 'react';

/**
 * 🧪 插件功能测试组件
 * 测试新安装的开发插件功能
 */

interface PluginTestProps {
  title: string;
  status: 'success' | 'warning' | 'error';
  children?: React.ReactNode;
}

export const PluginTestComponent: React.FC<PluginTestProps> = ({ 
  title, 
  status, 
  children 
}) => {
  // 测试 TypeScript 智能提示和错误检查
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'success':
        // 🎨 Tailwind CSS 测试 - 应该有智能提示
        return 'bg-green-100 border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200';
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-700 px-4 py-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200';
    }
  };

  // 测试 Error Lens - 这里故意留一个未使用的变量
  const unusedVariable = "这应该被 Error Lens 高亮显示";

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      {/* 🎯 测试 Auto Rename Tag 功能 */}
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h1>
        <p className="text-gray-600">
          插件功能测试组件
        </p>
      </header>

      {/* 🎨 测试 Tailwind CSS IntelliSense */}
      <div className={`border-l-4 ${getStatusStyles(status)}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {status === 'success' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {status === 'warning' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              状态: {status}
            </p>
            {children && (
              <div className="mt-2 text-sm">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🔧 测试插件功能展示区域 */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            🎨 Tailwind CSS 智能提示
          </h3>
          <p className="text-sm text-gray-600">
            输入 'className="' 后应该看到 Tailwind 类名提示
          </p>
          <div className="mt-2 p-2 bg-blue-50 rounded text-xs font-mono">
            hover:bg-blue-100 focus:ring-2 focus:ring-blue-500
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            ⚡ TypeScript 检查
          </h3>
          <p className="text-sm text-gray-600">
            类型错误应该实时显示下划线
          </p>
          <div className="mt-2 p-2 bg-red-50 rounded text-xs font-mono">
            未使用变量应该有灰色下划线
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            🔧 Prettier 格式化
          </h3>
          <p className="text-sm text-gray-600">
            保存时自动格式化代码
          </p>
          <div className="mt-2 p-2 bg-green-50 rounded text-xs font-mono">
            Cmd+S / Ctrl+S 触发自动格式化
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            🧪 Error Lens
          </h3>
          <p className="text-sm text-gray-600">
            错误和警告行内显示
          </p>
          <div className="mt-2 p-2 bg-yellow-50 rounded text-xs font-mono">
            unusedVariable 后应该显示警告
          </div>
        </div>
      </section>

      {/* 🎯 交互测试区域 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-3">
          🚀 插件功能验证清单
        </h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
            输入 className 时看到 Tailwind 提示
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
            TypeScript 错误实时显示
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
            保存时代码自动格式化
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
            Error Lens 显示行内警告
          </li>
          <li className="flex items-center">
            <span className="w-4 h-4 bg-green-400 rounded-full mr-3"></span>
            Auto Rename Tag 同步修改标签
          </li>
        </ul>
      </div>
    </div>
  );
};

// 🧪 测试导出
export default PluginTestComponent;

// TODO: 这个 TODO 应该被 Todo Tree 插件识别
// FIXME: 这个 FIXME 也应该被识别