'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Heart, Star, Users } from 'lucide-react';

export const FloatingShareButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // 延迟显示，让用户先体验产品
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const shareProject = () => {
    const shareText = `🚀 发现了一个超棒的AI代码生成工具！

✨ 特色功能：
• 10x开发效率提升
• AI智能React组件生成
• TypeScript完美支持
• 一键部署到Cloudflare

试试这个工具：https://github.com/lionel1021/mcp-code-generator

#AI #React #开发工具 #效率工具`;

    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const goToGitHub = () => {
    window.open('https://github.com/lionel1021/mcp-code-generator', '_blank');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* 提示气泡 */}
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-black text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
          喜欢这个工具？给个Star支持一下！
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
        </div>
      )}

      {/* 主分享按钮 */}
      <div className="flex flex-col space-y-3">
        {/* GitHub Star按钮 */}
        <button
          onClick={goToGitHub}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="bg-gray-900 hover:bg-gray-800 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 group"
          title="给项目加星"
        >
          <Star className="w-5 h-5 group-hover:text-yellow-400 transition-colors" />
        </button>

        {/* 分享按钮 */}
        <button
          onClick={shareProject}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 group"
          title="分享项目"
        >
          <Share2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      {/* 脉冲动画效果 */}
      <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20 pointer-events-none"></div>
    </div>
  );
};

export default FloatingShareButton;