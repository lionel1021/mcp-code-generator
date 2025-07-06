import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Code, 
  Sparkles, 
  Zap, 
  CheckCircle, 
  AlertCircle,
  Lightbulb,
  Rocket,
  Monitor,
  Settings
} from 'lucide-react';

interface AIAssistantDemoProps {
  className?: string;
}

interface MCPStatus {
  connected: boolean;
  serverRunning: boolean;
  aiReady: boolean;
  lastUpdate: string;
}

export const AIAssistantDemo: React.FC<AIAssistantDemoProps> = ({ 
  className = "" 
}) => {
  const [mcpStatus, setMcpStatus] = useState<MCPStatus>({
    connected: false,
    serverRunning: false,
    aiReady: false,
    lastUpdate: new Date().toLocaleTimeString()
  });

  const [currentFeature, setCurrentFeature] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // 模拟MCP连接状态检查
  useEffect(() => {
    const checkMCPStatus = () => {
      // 模拟检查逻辑
      setMcpStatus({
        connected: true,
        serverRunning: true,
        aiReady: true,
        lastUpdate: new Date().toLocaleTimeString()
      });
    };

    checkMCPStatus();
    const interval = setInterval(checkMCPStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // AI功能演示数据
  const aiFeatures = [
    {
      id: 'code-generation',
      title: '智能代码生成',
      description: '基于需求描述自动生成完整的React组件',
      icon: <Code className="w-6 h-6" />,
      example: 'AI生成: 智能产品卡片组件',
      color: 'bg-blue-500',
      demo: '// AI生成的智能组件\nexport const SmartProductCard = ({ product }) => {\n  // 智能价格分析\n  const priceAnalysis = useAIPriceAnalysis(product);\n  \n  return (\n    <div className="ai-enhanced-card">\n      {/* AI推荐徽章 */}\n      {priceAnalysis.isRecommended && (\n        <Badge>AI推荐</Badge>\n      )}\n    </div>\n  );\n};'
    },
    {
      id: 'quality-analysis',
      title: '代码质量分析',
      description: '实时分析代码质量，提供改进建议',
      icon: <Sparkles className="w-6 h-6" />,
      example: '质量分数: 92/100',
      color: 'bg-green-500',
      demo: '📊 代码质量报告:\n- 整体质量: 92/100\n- 性能: 88/100\n- 可维护性: 94/100\n- 安全性: 96/100\n\n💡 建议:\n- 添加React.memo优化\n- 使用useCallback稳定引用\n- 改进TypeScript类型定义'
    },
    {
      id: 'smart-refactor',
      title: '智能重构',
      description: '自动重构代码，应用最佳实践',
      icon: <Zap className="w-6 h-6" />,
      example: '自动应用: 性能优化 + 可访问性',
      color: 'bg-purple-500',
      demo: '🔄 重构应用:\n✅ 添加React.memo\n✅ useCallback优化\n✅ ARIA标签\n✅ TypeScript类型\n✅ 错误边界\n\n📈 改进效果:\n性能提升: +45%\n可访问性: +100%'
    },
    {
      id: 'pattern-recognition',
      title: '设计模式识别',
      description: '识别并应用适合的设计模式',
      icon: <Brain className="w-6 h-6" />,
      example: '检测到: 工厂模式适用',
      color: 'bg-orange-500',
      demo: '🎨 模式识别:\n检测到组件工厂需求\n\n推荐应用:\n- 工厂模式 (95% 匹配)\n- 策略模式 (87% 匹配)\n- 观察者模式 (72% 匹配)\n\n自动生成工厂组件...'
    }
  ];

  const handleSimulateAI = async () => {
    setIsSimulating(true);
    
    // 模拟AI处理过程
    for (let i = 0; i < aiFeatures.length; i++) {
      setCurrentFeature(i);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setIsSimulating(false);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* 头部状态 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                🧠 MCP AI代码助手
              </h3>
              <p className="text-sm text-gray-600">
                智能代码生成和优化系统
              </p>
            </div>
          </div>
          
          {/* 状态指示器 */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {mcpStatus.aiReady ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className={`text-sm font-medium ${
                mcpStatus.aiReady ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {mcpStatus.aiReady ? 'AI就绪' : '连接中...'}
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              更新: {mcpStatus.lastUpdate}
            </div>
          </div>
        </div>

        {/* 快速操作按钮 */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSimulateAI}
            disabled={isSimulating || !mcpStatus.aiReady}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
              transition-all duration-200
              ${isSimulating || !mcpStatus.aiReady
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
              }
            `}
          >
            <Rocket className="w-4 h-4" />
            <span>{isSimulating ? 'AI处理中...' : '演示AI功能'}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Monitor className="w-4 h-4" />
            <span>打开控制台</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Settings className="w-4 h-4" />
            <span>设置</span>
          </button>
        </div>
      </div>

      {/* AI功能展示区域 */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 功能列表 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 AI增强功能
            </h4>
            
            {aiFeatures.map((feature, index) => (
              <div
                key={feature.id}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer
                  ${currentFeature === index
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${isSimulating && currentFeature === index ? 'animate-pulse' : ''}
                `}
                onClick={() => !isSimulating && setCurrentFeature(index)}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                    {feature.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h5>
                    <p className="text-sm text-gray-600 mb-2">
                      {feature.description}
                    </p>
                    <div className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full inline-block">
                      {feature.example}
                    </div>
                  </div>

                  {isSimulating && currentFeature === index && (
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* 演示输出区域 */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              💻 AI输出演示
            </h4>
            
            <div className="bg-gray-900 rounded-lg p-4 h-80 overflow-auto">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-xs ml-2">
                  MCP AI Terminal
                </span>
              </div>
              
              <div className="font-mono text-sm text-green-400">
                <div className="mb-2">
                  <span className="text-blue-400">$</span> mcp ai-generate --type=component
                </div>
                
                {isSimulating ? (
                  <div className="space-y-2">
                    <div>🧠 AI分析中...</div>
                    <div>📊 质量检查中...</div>
                    <div>⚡ 优化应用中...</div>
                    <div className="text-yellow-400">
                      <span className="animate-pulse">▊</span>
                    </div>
                  </div>
                ) : (
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {aiFeatures[currentFeature]?.demo}
                  </pre>
                )}
              </div>
            </div>
            
            {/* 快速链接 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
                快速开始
              </h5>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">命令面板 (Cmd+Shift+P):</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    MCP: Generate Component
                  </code>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">快捷键:</span>
                  <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                    Ctrl+Alt+G
                  </code>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">右键菜单:</span>
                  <span className="text-xs text-purple-600">AI Code Actions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部统计 */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">95%</div>
            <div className="text-xs text-gray-600">代码质量提升</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">67%</div>
            <div className="text-xs text-gray-600">开发速度提升</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">89%</div>
            <div className="text-xs text-gray-600">最佳实践应用</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">100%</div>
            <div className="text-xs text-gray-600">TypeScript覆盖</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistantDemo;