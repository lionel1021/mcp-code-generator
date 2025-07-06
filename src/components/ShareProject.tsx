'use client';

import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';

interface ShareProjectProps {
  className?: string;
  trigger?: 'button' | 'success' | 'floating';
  customMessage?: string;
}

export const ShareProject: React.FC<ShareProjectProps> = ({ 
  className = '', 
  trigger = 'button',
  customMessage 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const projectUrl = 'https://github.com/lionel1021/mcp-code-generator';
  
  const defaultMessage = `🚀 刚刚用 MCP AI Code Generator 生成了一个完整的React组件，效率提升10倍！

试试这个AI代码生成工具：
${projectUrl}

#AI #React #开发工具 #NextJS #TypeScript`;

  const shareText = customMessage || defaultMessage;

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(projectUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(projectUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const TriggerButton = () => {
    if (trigger === 'floating') {
      return (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 z-50"
          title="分享项目"
        >
          <Share2 className="w-5 h-5" />
        </button>
      );
    }

    if (trigger === 'success') {
      return (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>分享成功体验</span>
        </button>
      );
    }

    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors ${className}`}
      >
        <Share2 className="w-4 h-4" />
        <span>分享项目</span>
      </button>
    );
  };

  return (
    <>
      <TriggerButton />

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">分享 MCP AI Code Generator</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              帮助更多开发者发现这个AI代码生成工具！
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={shareToTwitter}
                className="flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span>Twitter</span>
              </button>

              <button
                onClick={shareToLinkedIn}
                className="flex items-center justify-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </button>

              <button
                onClick={shareToFacebook}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                <Facebook className="w-4 h-4" />
                <span>Facebook</span>
              </button>

              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '已复制' : '复制链接'}</span>
              </button>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">预览分享内容：</p>
              <div className="text-xs text-gray-700 bg-white p-2 rounded border max-h-20 overflow-y-auto">
                {shareText}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareProject;