#!/usr/bin/env node

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
    const expirationMatch = envContent.match(/CONFIG_EXPIRES=(\d+)/);
    
    if (expirationMatch) {
      const expiration = parseInt(expirationMatch[1]);
      const now = Date.now();
      
      if (now > expiration) {
        this.errors.push('配置已过期，请重新运行 npm run secure-setup');
      } else {
        const hoursLeft = Math.round((expiration - now) / (1000 * 60 * 60));
        console.log(`⏰ 配置剩余有效时间：${hoursLeft} 小时`);
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
      console.log('\n🚨 发现安全错误：');
      this.errors.forEach(error => console.log(`  - ${error}`));
      process.exit(1);
    }
    
    if (this.warnings.length > 0) {
      console.log('\n⚠️ 安全警告：');
      this.warnings.forEach(warning => console.log(`  - ${warning}`));
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

module.exports = SecurityChecker;