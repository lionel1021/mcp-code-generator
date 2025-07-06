import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsData {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: string;
  url: string;
  referrer: string;
  userAgent: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: AnalyticsData = await request.json();
    
    // 基本数据验证
    if (!data.action || !data.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // 在生产环境中，这里可以发送到你的分析服务
    // 例如：Google Analytics、Mixpanel、自定义数据库等
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Analytics Event:', {
        action: data.action,
        category: data.category,
        label: data.label,
        timestamp: data.timestamp,
        url: data.url
      });
    }

    // 示例：保存到数据库
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) {
      try {
        // 这里可以添加Supabase数据库存储逻辑
        // const { createClient } = require('@supabase/supabase-js');
        // const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
        // await supabase.from('analytics_events').insert(data);
      } catch (dbError) {
        console.error('Database save failed:', dbError);
      }
    }

    // 特殊事件处理
    if (data.action === 'share') {
      // 分享事件的特殊处理
      console.log(`🎉 Viral Share: ${data.label} at ${data.timestamp}`);
    }

    if (data.action === 'github_click') {
      // GitHub点击的特殊处理
      console.log(`⭐ GitHub Click: ${data.label} from ${data.url}`);
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// 支持预检请求
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}