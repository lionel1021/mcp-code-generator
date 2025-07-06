'use client';

import { useEffect } from 'react';

interface AnalyticsEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

export const AnalyticsTracker = () => {
  useEffect(() => {
    // 追踪页面访问
    trackEvent({
      action: 'page_view',
      category: 'engagement',
      label: 'homepage'
    });
  }, []);

  return null;
};

// 全局事件追踪函数
export const trackEvent = (event: AnalyticsEvent) => {
  // 发送到Google Analytics (如果配置了)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value
    });
  }

  // 发送到自定义分析端点
  fetch('/api/analytics', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent
    })
  }).catch(err => {
    console.debug('Analytics tracking failed:', err);
  });
};

// 分享事件追踪
export const trackShare = (platform: string, context: string = 'unknown') => {
  trackEvent({
    action: 'share',
    category: 'viral_marketing',
    label: `${platform}_${context}`
  });
  
  // 记录本地分享计数
  const shareCount = parseInt(localStorage.getItem('total_shares') || '0') + 1;
  localStorage.setItem('total_shares', shareCount.toString());
  localStorage.setItem(`shares_${platform}`, 
    String(parseInt(localStorage.getItem(`shares_${platform}`) || '0') + 1)
  );
};

// GitHub Star追踪
export const trackGitHubClick = (action: string) => {
  trackEvent({
    action: 'github_click',
    category: 'conversion',
    label: action
  });
};

// 成就系统追踪
export const trackAchievementView = (achievement: string) => {
  trackEvent({
    action: 'achievement_view',
    category: 'engagement',
    label: achievement
  });
};

export default AnalyticsTracker;