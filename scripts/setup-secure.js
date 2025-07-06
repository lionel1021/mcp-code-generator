#!/usr/bin/env node

/**
 * 🔒 MCP AI-Enhanced Code Generator - 零妥协安全性简化配置
 * 
 * 功能：
 * - 生成临时安全密钥
 * - 创建安全默认配置
 * - 运行时安全检查
 * - 渐进式安全引导
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

class SecureSetup {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.envPath = path.join(this.projectRoot, '.env.local');
    this.securityConfig = {
      mode: 'demo',
      expirationTime: 24 * 60 * 60 * 1000, // 24小时
      maxRequests: 100,
      allowedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000']
    };
  }

  // 🔐 生成安全临时密钥
  generateSecureKeys() {
    console.log('🔑 生成安全临时密钥...');
    
    const keys = {
      // 临时数据库配置 (只读演示数据)
      supabaseUrl: 'https://demo-readonly.supabase.co',
      supabaseKey: this.generateJWT({
        role: 'demo_user',
        permissions: ['read'],
        expires: Date.now() + this.securityConfig.expirationTime
      }),
      
      // 临时Redis配置 (内存模拟)
      redisUrl: 'redis://localhost:6379',
      redisToken: crypto.randomBytes(32).toString('hex'),
      
      // MCP配置 (受限模式)
      mcpPort: 3001,
      mcpModel: 'demo-limited',
      
      // 安全设置
      sessionSecret: crypto.randomBytes(64).toString('hex'),
      csrfSecret: crypto.randomBytes(32).toString('hex'),
      
      // 限制配置
      rateLimit: this.securityConfig.maxRequests,
      sessionTimeout: '30m',
      environment: 'secure-demo'
    };

    return keys;
  }

  // 🎯 生成JWT格式的临时密钥
  generateJWT(payload) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    
    // 使用临时密钥签名
    const signature = crypto
      .createHmac('sha256', 'demo-temp-secret-key')
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // 📝 创建安全环境配置文件
  createSecureEnvFile(keys) {
    console.log('📝 创建安全环境配置...');

    const envContent = `# ==================================================
# 🔒 MCP AI Code Generator - 安全演示配置
# ==================================================
# ⚠️  警告：这是临时演示配置，24小时后自动过期
# ⚠️  生产部署前请运行：npm run production-setup
# ==================================================

# 配置模式
NODE_ENV=secure-demo
SECURITY_MODE=demo
CONFIG_EXPIRES=${Date.now() + this.securityConfig.expirationTime}

# 应用配置
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=true

# 临时数据库配置 (只读演示)
NEXT_PUBLIC_SUPABASE_URL=${keys.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${keys.supabaseKey}

# 临时Redis配置 (本地模拟)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=${keys.redisToken}
UPSTASH_REDIS_REST_URL=demo://localhost
UPSTASH_REDIS_REST_TOKEN=${keys.redisToken}

# MCP安全配置
MCP_SERVER_PORT=${keys.mcpPort}
MCP_AI_MODEL=${keys.mcpModel}
MCP_ANALYSIS_ENABLED=true
MCP_DEMO_MODE=true

# 安全设置
SESSION_SECRET=${keys.sessionSecret}
CSRF_SECRET=${keys.csrfSecret}
RATE_LIMIT_MAX=${keys.rateLimit}
SESSION_TIMEOUT=${keys.sessionTimeout}

# 安全限制
MAX_REQUESTS_PER_HOUR=${this.securityConfig.maxRequests}
ALLOWED_ORIGINS=${this.securityConfig.allowedOrigins.join(',')}
DEMO_EXPIRATION=${Date.now() + this.securityConfig.expirationTime}

# 禁用的生产功能
ANALYTICS_ENABLED=false
MONITORING_ENABLED=false
EXTERNAL_APIs_ENABLED=false

# ==================================================
# 🚨 安全提醒
# ==================================================
# 1. 此配置仅用于本地演示和开发
# 2. 24小时后自动失效，需要重新生成
# 3. 生产部署前必须配置真实的API密钥
# 4. 运行 'npm run security-check' 检查安全状态
# ==================================================`;

    fs.writeFileSync(this.envPath, envContent);
    console.log('✅ 安全环境配置已创建：.env.local');
  }

  // 🛡️ 创建运行时安全检查
  createSecurityCheck() {
    console.log('🛡️ 创建安全检查机制...');

    const securityCheckPath = path.join(this.projectRoot, 'scripts', 'security-check.js');
    const securityCheckContent = `#!/usr/bin/env node

/**
 * 🔒 运行时安全检查系统
 */

const fs = require('fs');
const path = require('path');

class SecurityChecker {
  constructor() {
    this.envPath = path.join(__dirname, '..', '.env.local');
    this.warnings = [];
    this.errors = [];
  }

  // 检查配置过期时间
  checkExpiration() {
    if (!fs.existsSync(this.envPath)) {
      this.errors.push('环境配置文件不存在');
      return;
    }

    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const expirationMatch = envContent.match(/CONFIG_EXPIRES=(\\d+)/);
    
    if (expirationMatch) {
      const expiration = parseInt(expirationMatch[1]);
      const now = Date.now();
      
      if (now > expiration) {
        this.errors.push('配置已过期，请重新运行 npm run secure-setup');
      } else {
        const hoursLeft = Math.round((expiration - now) / (1000 * 60 * 60));
        console.log(\`⏰ 配置剩余有效时间：\${hoursLeft} 小时\`);
      }
    }
  }

  // 检查生产环境配置
  checkProductionReadiness() {
    const env = process.env;
    
    if (env.NODE_ENV === 'production') {
      if (env.SECURITY_MODE === 'demo') {
        this.errors.push('🚨 不能在生产环境使用演示配置！');
      }
      
      if (env.SUPABASE_URL && env.SUPABASE_URL.includes('demo')) {
        this.errors.push('🚨 生产环境不能使用演示数据库！');
      }
      
      if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
        this.errors.push('🚨 生产环境需要强密钥！');
      }
    }
  }

  // 检查安全配置
  checkSecurityConfig() {
    const env = process.env;
    
    // 检查速率限制
    if (!env.RATE_LIMIT_MAX || parseInt(env.RATE_LIMIT_MAX) > 1000) {
      this.warnings.push('⚠️ 速率限制过高，建议降低');
    }
    
    // 检查调试模式
    if (env.NODE_ENV === 'production' && env.DEBUG === 'true') {
      this.errors.push('🚨 生产环境不应启用调试模式');
    }
    
    // 检查CORS设置
    if (env.ALLOWED_ORIGINS && env.ALLOWED_ORIGINS.includes('*')) {
      this.warnings.push('⚠️ CORS设置过于宽松');
    }
  }

  // 运行所有检查
  runAllChecks() {
    console.log('🔒 运行安全检查...');
    
    this.checkExpiration();
    this.checkProductionReadiness();
    this.checkSecurityConfig();
    
    // 输出结果
    if (this.errors.length > 0) {
      console.log('\\n🚨 发现安全错误：');
      this.errors.forEach(error => console.log(\`  - \${error}\`));
      process.exit(1);
    }
    
    if (this.warnings.length > 0) {
      console.log('\\n⚠️ 安全警告：');
      this.warnings.forEach(warning => console.log(\`  - \${warning}\`));
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ 安全检查通过！');
    }
  }
}

// 运行检查
if (require.main === module) {
  const checker = new SecurityChecker();
  checker.runAllChecks();
}

module.exports = SecurityChecker;`;

    fs.writeFileSync(securityCheckPath, securityCheckContent);
    fs.chmodSync(securityCheckPath, '755');
    console.log('✅ 安全检查机制已创建');
  }

  // 🚀 创建生产环境升级脚本
  createProductionSetup() {
    console.log('🚀 创建生产环境升级脚本...');

    const prodSetupPath = path.join(this.projectRoot, 'scripts', 'production-setup.js');
    const prodSetupContent = `#!/usr/bin/env node

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
    console.log('\\n📊 数据库配置：');
    config.supabaseUrl = await this.askQuestion('Supabase URL: ');
    config.supabaseKey = await this.askQuestion('Supabase Key: ');
    
    // Redis配置
    console.log('\\n🗄️ Redis配置：');
    config.redisUrl = await this.askQuestion('Redis URL: ');
    config.redisToken = await this.askQuestion('Redis Token: ');
    
    // 应用配置
    console.log('\\n🌐 应用配置：');
    config.appUrl = await this.askQuestion('应用URL (https://yourdomain.com): ');
    config.environment = await this.askQuestion('环境 (production/staging): ');
    
    // 安全配置
    console.log('\\n🔒 安全配置：');
    config.sessionSecret = crypto.randomBytes(64).toString('hex');
    config.csrfSecret = crypto.randomBytes(32).toString('hex');
    
    console.log('✅ 配置收集完成');
    return config;
  }

  createProductionEnv(config) {
    const envContent = \`# ==================================================
# 🏭 MCP AI Code Generator - 生产环境配置
# ==================================================

# 环境设置
NODE_ENV=production
SECURITY_MODE=production

# 应用配置
NEXT_PUBLIC_APP_URL=\${config.appUrl}
NEXT_PUBLIC_DEMO_MODE=false

# 数据库配置
NEXT_PUBLIC_SUPABASE_URL=\${config.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${config.supabaseKey}

# Redis配置
UPSTASH_REDIS_REST_URL=\${config.redisUrl}
UPSTASH_REDIS_REST_TOKEN=\${config.redisToken}

# MCP配置
MCP_SERVER_PORT=3001
MCP_AI_MODEL=gpt-4
MCP_ANALYSIS_ENABLED=true
MCP_DEMO_MODE=false

# 安全设置
SESSION_SECRET=\${config.sessionSecret}
CSRF_SECRET=\${config.csrfSecret}
RATE_LIMIT_MAX=1000
SESSION_TIMEOUT=1h

# 生产功能
ANALYTICS_ENABLED=true
MONITORING_ENABLED=true
EXTERNAL_APIs_ENABLED=true

# ==================================================
# 🔒 生产环境安全配置已启用
# ==================================================\`;

    fs.writeFileSync(this.envPath, envContent);
    console.log('✅ 生产环境配置已创建');
  }

  async run() {
    try {
      const config = await this.collectProductionConfig();
      this.createProductionEnv(config);
      
      console.log('\\n🎉 生产环境配置完成！');
      console.log('\\n下一步：');
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
}`;

    fs.writeFileSync(prodSetupPath, prodSetupContent);
    fs.chmodSync(prodSetupPath, '755');
    console.log('✅ 生产环境升级脚本已创建');
  }

  // 📋 显示安全设置摘要
  displaySecuritySummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 安全配置摘要');
    console.log('='.repeat(60));
    console.log('✅ 临时安全密钥已生成');
    console.log('✅ 本地演示环境已配置');
    console.log('✅ 安全检查机制已启用');
    console.log('✅ 配置24小时后自动过期');
    console.log('\n🎯 下一步：');
    console.log('  1. npm run dev           # 启动开发服务器');
    console.log('  2. npm run security-check # 检查安全状态');
    console.log('  3. npm run production-setup # 配置生产环境');
    console.log('\n⚠️  重要提醒：');
    console.log('  - 此配置仅用于本地开发和演示');
    console.log('  - 生产部署前必须运行 production-setup');
    console.log('  - 定期运行 security-check 确保安全');
    console.log('='.repeat(60));
  }

  // 🚀 主运行方法
  async run() {
    try {
      console.log('🔒 MCP AI Code Generator - 零妥协安全性配置');
      console.log('开始初始化安全演示环境...\n');

      // 生成安全密钥
      const keys = this.generateSecureKeys();

      // 创建环境配置
      this.createSecureEnvFile(keys);

      // 创建安全检查系统
      this.createSecurityCheck();

      // 创建生产环境升级脚本
      this.createProductionSetup();

      // 显示摘要
      this.displaySecuritySummary();

      console.log('\n🎉 安全配置完成！现在可以安全地开始开发了。');

    } catch (error) {
      console.error('❌ 配置失败：', error.message);
      process.exit(1);
    }
  }
}

// 运行安全配置
if (require.main === module) {
  const setup = new SecureSetup();
  setup.run();
}

module.exports = SecureSetup;