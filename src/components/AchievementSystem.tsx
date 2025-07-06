'use client';

import React, { useState, useEffect } from 'react';
import { Star, Trophy, Users, Zap, Gift, ExternalLink } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  target: number;
  current: number;
  reward: string;
  unlocked: boolean;
  color: string;
}

export const AchievementSystem: React.FC = () => {
  const [stars, setStars] = useState(0);
  const [loading, setLoading] = useState(true);

  // 获取GitHub Stars数量
  useEffect(() => {
    const fetchStars = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/lionel1021/mcp-code-generator');
        const data = await response.json();
        setStars(data.stargazers_count || 0);
      } catch (error) {
        console.error('Error fetching stars:', error);
        setStars(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStars();
    // 每5分钟更新一次
    const interval = setInterval(fetchStars, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const achievements: Achievement[] = [
    {
      id: 'stars-10',
      title: '⭐ 初露锋芒',
      description: '获得第一批支持者',
      icon: <Star className="w-6 h-6" />,
      target: 10,
      current: stars,
      reward: '解锁项目开发者专属徽章',
      unlocked: stars >= 10,
      color: 'bg-yellow-500'
    },
    {
      id: 'stars-50',
      title: '🚀 小有名气',
      description: '项目开始获得关注',
      icon: <Zap className="w-6 h-6" />,
      target: 50,
      current: stars,
      reward: '解锁高级功能演示视频',
      unlocked: stars >= 50,
      color: 'bg-orange-500'
    },
    {
      id: 'stars-100',
      title: '🏆 百星成就',
      description: '成为社区认可的优秀项目',
      icon: <Trophy className="w-6 h-6" />,
      target: 100,
      current: stars,
      reward: '解锁VS Code扩展抢先体验',
      unlocked: stars >= 100,
      color: 'bg-purple-500'
    },
    {
      id: 'stars-500',
      title: '👥 社区热门',
      description: '加入开发者社区精英圈',
      icon: <Users className="w-6 h-6" />,
      target: 500,
      current: stars,
      reward: '加入贡献者专属群 + 技术交流',
      unlocked: stars >= 500,
      color: 'bg-blue-500'
    },
    {
      id: 'stars-1000',
      title: '🎉 千星里程碑',
      description: '成为顶级开源项目',
      icon: <Gift className="w-6 h-6" />,
      target: 1000,
      current: stars,
      reward: '优先体验新功能 + 定制化服务',
      unlocked: stars >= 1000,
      color: 'bg-green-500'
    }
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const nextAchievement = achievements.find(a => !a.unlocked);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
          成就系统
        </h3>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{stars}</div>
          <div className="text-sm text-gray-500">GitHub Stars</div>
        </div>
      </div>

      {/* 当前进度 */}
      {nextAchievement && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">下一个成就</span>
            <span className="text-sm text-gray-600">
              {nextAchievement.current} / {nextAchievement.target}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage(nextAchievement.current, nextAchievement.target)}%` }}
            ></div>
          </div>
          <div className="text-sm text-gray-600">
            还需要 <strong>{nextAchievement.target - nextAchievement.current}</strong> 个星星解锁：
            <strong className="text-blue-600">{nextAchievement.title}</strong>
          </div>
        </div>
      )}

      {/* 成就列表 */}
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div 
            key={achievement.id}
            className={`p-4 rounded-lg border-2 transition-all duration-300 ${
              achievement.unlocked 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-full ${achievement.color} ${
                achievement.unlocked ? 'text-white' : 'text-gray-400 bg-gray-300'
              }`}>
                {achievement.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className={`font-semibold ${
                    achievement.unlocked ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {achievement.title}
                  </h4>
                  {achievement.unlocked && (
                    <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                      已解锁
                    </span>
                  )}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-600 font-medium">
                    🎁 {achievement.reward}
                  </span>
                  <span className="text-sm text-gray-500">
                    {achievement.current} / {achievement.target} ⭐
                  </span>
                </div>

                {/* 进度条 */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      achievement.unlocked ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${getProgressPercentage(achievement.current, achievement.target)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 行动号召 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg text-white text-center">
        <h4 className="font-bold mb-2">🌟 帮助我们达成更多成就！</h4>
        <p className="text-sm mb-3 opacity-90">
          每一个Star都是对开发者的巨大鼓励，让我们一起打造更强大的AI代码生成工具
        </p>
        <div className="flex space-x-3 justify-center">
          <a
            href="https://github.com/lionel1021/mcp-code-generator"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors flex items-center"
          >
            <Star className="w-4 h-4 mr-1" />
            给个Star
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AchievementSystem;