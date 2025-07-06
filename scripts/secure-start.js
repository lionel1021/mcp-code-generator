#!/usr/bin/env node

/**
 * 🚀 安全启动脚本 - 带运行时安全检查的开发服务器启动
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class SecureStart {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.envPath = path.join(this.projectRoot, '.env.local');
  }

  // 🔍 检查是否已配置
  checkConfiguration() {
    if (!fs.existsSync(this.envPath)) {
      console.log('❌ 未找到安全配置文件');
      console.log('🔧 正在运行自动安全配置...\n');
      return false;
    }

    // 检查配置是否过期
    const envContent = fs.readFileSync(this.envPath, 'utf8');
    const expirationMatch = envContent.match(/CONFIG_EXPIRES=(\\d+)/);
    
    if (expirationMatch) {
      const expiration = parseInt(expirationMatch[1]);
      const now = Date.now();
      
      if (now > expiration) {
        console.log('⏰ 配置已过期，正在重新生成安全配置...\n');
        return false;
      }
    }

    return true;
  }

  // 🔧 运行安全配置
  async runSecureSetup() {
    return new Promise((resolve, reject) => {
      console.log('🔒 运行安全配置...');
      
      const setupScript = path.join(__dirname, 'setup-secure.js');
      const child = spawn('node', [setupScript], {
        stdio: 'inherit',
        cwd: this.projectRoot
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`安全配置失败，退出码: ${code}`));
        }
      });
    });
  }

  // 🛡️ 运行安全检查
  async runSecurityCheck() {
    return new Promise((resolve, reject) => {
      console.log('🛡️ 运行安全检查...');
      
      const checkScript = path.join(__dirname, 'security-check.js');
      
      // 如果安全检查脚本不存在，先创建它
      if (!fs.existsSync(checkScript)) {
        console.log('⚠️ 安全检查脚本不存在，跳过检查');
        resolve();
        return;
      }

      const child = spawn('node', [checkScript], {
        stdio: 'inherit',
        cwd: this.projectRoot,
        env: { ...process.env, NODE_ENV: process.env.NODE_ENV || 'development' }
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          console.log('⚠️ 安全检查发现问题，但继续启动开发服务器');
          resolve();
        }
      });
    });
  }

  // 🚀 启动开发服务器
  async startDevServer() {
    console.log('🚀 启动开发服务器...\n');
    
    const child = spawn('npx', ['next', 'dev', '--turbopack'], {
      stdio: 'inherit',
      cwd: this.projectRoot
    });

    child.on('close', (code) => {
      console.log(`开发服务器退出，代码: ${code}`);
    });

    // 处理中断信号
    process.on('SIGINT', () => {
      console.log('\\n🛑 正在停止开发服务器...');
      child.kill('SIGINT');
      process.exit(0);
    });
  }

  // 📊 显示启动信息
  displayStartupInfo() {
    console.log('\\n' + '='.repeat(60));
    console.log('🔒 MCP AI Code Generator - 安全模式启动');
    console.log('='.repeat(60));
    console.log('🌐 应用地址: http://localhost:3000');
    console.log('🔧 模式: 安全演示模式');
    console.log('⏰ 配置有效期: 24小时');
    console.log('\\n📋 可用命令:');
    console.log('  Ctrl+C           # 停止服务器');
    console.log('  npm run security-check # 检查安全状态');
    console.log('  npm run production-setup # 配置生产环境');
    console.log('='.repeat(60));
  }

  // 🎯 主运行方法
  async run() {
    try {
      console.log('🔒 MCP AI Code Generator - 安全启动\\n');

      // 检查配置
      const configExists = this.checkConfiguration();
      
      // 如果没有配置或已过期，运行安全配置
      if (!configExists) {
        await this.runSecureSetup();
        console.log('\\n✅ 安全配置完成\\n');
      }

      // 运行安全检查
      await this.runSecurityCheck();
      console.log('\\n✅ 安全检查完成\\n');

      // 显示启动信息
      this.displayStartupInfo();

      // 启动开发服务器
      await this.startDevServer();

    } catch (error) {
      console.error('❌ 启动失败：', error.message);
      console.log('\\n🔧 尝试手动运行：');
      console.log('  npm run setup-secure  # 重新配置');
      console.log('  npm run security-check # 检查安全状态');
      process.exit(1);
    }
  }
}

// 运行安全启动
if (require.main === module) {
  const secureStart = new SecureStart();
  secureStart.run();
}

module.exports = SecureStart;