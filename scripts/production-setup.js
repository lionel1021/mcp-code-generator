#!/usr/bin/env node

/**
 * 🏭 生产环境安全配置向导
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class ProductionSetup {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env.local');
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async askQuestion(question) {
    return new Promise(resolve => {
      this.rl.question(question, resolve);
    });
  }

  async collectProductionConfig() {
    console.log('🏭 生产环境配置向导');
    console.log('='.repeat(50));
    
    const config = {};
    
    // 数据库配置
    console.log('\n📊 数据库配置：');
    config.supabaseUrl = await this.askQuestion('Supabase URL: ');
    config.supabaseKey = await this.askQuestion('Supabase Key: ');
    
    // Redis配置
    console.log('\n🗄️ Redis配置：');
    config.redisUrl = await this.askQuestion('Redis URL: ');
    config.redisToken = await this.askQuestion('Redis Token: ');
    
    // 应用配置
    console.log('\n🌐 应用配置：');
    config.appUrl = await this.askQuestion('应用URL (https://yourdomain.com): ');
    config.environment = await this.askQuestion('环境 (production/staging): ');
    
    // 安全配置
    console.log('\n🔒 安全配置：');
    config.sessionSecret = crypto.randomBytes(64).toString('hex');
    config.csrfSecret = crypto.randomBytes(32).toString('hex');
    
    console.log('✅ 配置收集完成');
    return config;
  }

  createProductionEnv(config) {
    const envContent = `# ==================================================
# 🏭 MCP AI Code Generator - 生产环境配置
# ==================================================

# 环境设置
NODE_ENV=production
SECURITY_MODE=production

# 应用配置
NEXT_PUBLIC_APP_URL=${config.appUrl}
NEXT_PUBLIC_DEMO_MODE=false

# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=${config.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${config.supabaseKey}

# Redis配置
UPSTASH_REDIS_REST_URL=${config.redisUrl}
UPSTASH_REDIS_REST_TOKEN=${config.redisToken}

# MCP配置
MCP_SERVER_PORT=3001
MCP_AI_MODEL=gpt-4
MCP_ANALYSIS_ENABLED=true
MCP_DEMO_MODE=false

# 安全设置
SESSION_SECRET=${config.sessionSecret}
CSRF_SECRET=${config.csrfSecret}
RATE_LIMIT_MAX=1000
SESSION_TIMEOUT=1h

# 生产功能
ANALYTICS_ENABLED=true
MONITORING_ENABLED=true
EXTERNAL_APIs_ENABLED=true

# ==================================================
# 🔒 生产环境安全配置已启用
# ==================================================`;

    fs.writeFileSync(this.envPath, envContent);
    console.log('✅ 生产环境配置已创建');
  }

  async run() {
    try {
      const config = await this.collectProductionConfig();
      this.createProductionEnv(config);
      
      console.log('\n🎉 生产环境配置完成！');
      console.log('\n下一步：');
      console.log('1. 运行 npm run security-check 验证配置');
      console.log('2. 运行 npm run build 构建项目');
      console.log('3. 运行 npm run start 启动生产服务器');
      
    } catch (error) {
      console.error('❌ 配置失败：', error.message);
    } finally {
      this.rl.close();
    }
  }
}

if (require.main === module) {
  const setup = new ProductionSetup();
  setup.run();
}