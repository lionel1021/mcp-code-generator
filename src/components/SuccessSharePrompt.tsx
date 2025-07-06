'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, Share2, Twitter, X } from 'lucide-react';

interface SuccessSharePromptProps {
  show: boolean;
  onClose: () => void;
  generatedComponent?: string;
  timeSaved?: number;
}

export const SuccessSharePrompt: React.FC<SuccessSharePromptProps> = ({
  show,
  onClose,
  generatedComponent = 'React组件',
  timeSaved = 30
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
    }
  }, [show]);

  const shareToTwitter = () => {
    const messages = [
      `🚀 刚刚用 MCP AI Code Generator 生成了一个${generatedComponent}，节省了${timeSaved}分钟开发时间！`,
      `⚡ 效率提升10倍！用 MCP AI Code Generator 几秒钟就完成了${generatedComponent}的开发！`,
      `🤖 AI助力开发！MCP Code Generator 让我的React开发变得超级高效！`,
      `💯 强烈推荐这个AI代码生成工具！刚刚生成了完美的${generatedComponent}！`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    const shareText = `${randomMessage}

试试这个AI代码生成工具：
https://github.com/lionel1021/mcp-code-generator

#AI #React #开发工具 #NextJS #TypeScript #效率工具`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
    
    // 记录分享行为
    localStorage.setItem('mcp_shared_count', 
      String(parseInt(localStorage.getItem('mcp_shared_count') || '0') + 1)
    );
  };

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  if (!show) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-white rounded-lg max-w-md w-full p-6 transform transition-all duration-300 ${
        visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
      }`}>
        {/* 成功图标 */}
        <div className="text-center mb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">🎉 生成成功！</h3>
          <p className="text-gray-600 mt-1">
            你的{generatedComponent}已经生成完毕，节省了约 <strong className="text-green-600">{timeSaved}分钟</strong> 开发时间！
          </p>
        </div>

        {/* 分享提示 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
          <div className="flex items-center mb-2">
            <Share2 className="w-5 h-5 text-blue-600 mr-2" />
            <span className="font-medium text-gray-900">分享你的成功体验！</span>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            让更多开发者知道这个强大的AI代码生成工具，一起提升开发效率！
          </p>
          
          <button
            onClick={shareToTwitter}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <Twitter className="w-4 h-4" />
            <span>分享到 Twitter</span>
          </button>
        </div>

        {/* 额外激励 */}
        <div className="text-center text-sm text-gray-500 mb-4">
          <p>💡 <strong>小提示</strong>：分享体验可以帮助项目获得更多关注，让工具变得更好！</p>
        </div>

        {/* 关闭按钮 */}
        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            稍后再说
          </button>
          <button
            onClick={shareToTwitter}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            立即分享
          </button>
        </div>

        {/* 关闭按钮 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SuccessSharePrompt;