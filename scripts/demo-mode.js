#!/usr/bin/env node

/**
 * 🎮 演示模式启动器 - 最简单的体验方式
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class DemoMode {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.envPath = path.join(this.projectRoot, '.env.demo');
  }

  // 🎯 创建演示环境配置
  createDemoEnv() {
    console.log('🎮 创建演示模式配置...');

    const demoEnvContent = `# ==================================================
# 🎮 MCP AI Code Generator - 演示模式
# ==================================================
# 这是最简化的演示配置，无需任何外部依赖
# ==================================================

# 演示模式标识
NODE_ENV=demo
DEMO_MODE=true
OFFLINE_MODE=true

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true

# 模拟数据库（本地JSON文件）
SUPABASE_URL=file://demo-data
SUPABASE_ANON_KEY=demo-key

# 模拟Redis（内存存储）
REDIS_URL=memory://demo
REDIS_PASSWORD=demo

# MCP演示配置
MCP_SERVER_PORT=3001
MCP_AI_MODEL=demo-model
MCP_DEMO_MODE=true

# 演示限制
MAX_DEMO_REQUESTS=50
DEMO_SESSION_TIMEOUT=2h

# 禁用外部服务
ANALYTICS_ENABLED=false
MONITORING_ENABLED=false
EXTERNAL_APIS_ENABLED=false

# ==================================================
# 🎮 演示模式 - 完全离线，无需配置
# ==================================================`;

    fs.writeFileSync(this.envPath, demoEnvContent);
    console.log('✅ 演示配置已创建');
  }

  // 📊 显示演示模式信息
  displayDemoInfo() {
    console.log('\\n' + '='.repeat(60));
    console.log('🎮 MCP AI Code Generator - 演示模式');
    console.log('='.repeat(60));
    console.log('🌟 特点：');
    console.log('  ✅ 无需任何外部依赖');
    console.log('  ✅ 完全离线运行');
    console.log('  ✅ 使用模拟数据展示功能');
    console.log('  ✅ 零配置，立即可用');
    console.log('\\n🎯 演示内容：');
    console.log('  - AI代码生成演示');
    console.log('  - 组件模板展示');
    console.log('  - 用户界面体验');
    console.log('  - 功能特性演示');
    console.log('\\n🔗 访问地址: http://localhost:3000');
    console.log('='.repeat(60));
  }

  // 🚀 启动演示模式
  async startDemo() {
    console.log('🚀 启动演示模式服务器...');

    const child = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      cwd: this.projectRoot,
      shell: true,
      env: {
        ...process.env,
        ENV_FILE: '.env.demo'
      }
    });

    // 处理中断信号
    process.on('SIGINT', () => {
      console.log('\\n🛑 正在停止演示服务器...');
      child.kill('SIGINT');
      process.exit(0);
    });

    child.on('close', (code) => {
      console.log(`演示服务器退出，代码: ${code}`);
    });
  }

  // 🎯 主运行方法
  async run() {
    console.log('🎮 MCP AI Code Generator - 演示模式启动\\n');
    
    try {
      // 创建演示配置
      this.createDemoEnv();
      
      // 显示演示信息
      this.displayDemoInfo();
      
      // 启动演示服务器
      await this.startDemo();
      
    } catch (error) {
      console.error('❌ 演示模式启动失败：', error.message);
      process.exit(1);
    }
  }
}

// 运行演示模式
if (require.main === module) {
  const demo = new DemoMode();
  demo.run();
}

module.exports = DemoMode;