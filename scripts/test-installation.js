#!/usr/bin/env node

/**
 * 🧪 安装体验测试脚本
 * 模拟新用户的完整安装和配置体验
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

class InstallationTester {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.testResults = {
      demoMode: null,
      secureMode: null,
      productionMode: null,
      configFiles: null,
      scripts: null
    };
  }

  // 🔍 检查必要文件
  checkRequiredFiles() {
    console.log('🔍 检查必要文件...');
    
    const requiredFiles = [
      'package.json',
      'scripts/demo-mode.js',
      'scripts/setup-secure.js',
      'scripts/secure-start.js',
      'scripts/security-check.js',
      'scripts/production-setup.js'
    ];

    const results = {};
    
    for (const file of requiredFiles) {
      const filePath = path.join(this.projectRoot, file);
      results[file] = fs.existsSync(filePath);
      console.log(`  ${results[file] ? '✅' : '❌'} ${file}`);
    }

    this.testResults.configFiles = Object.values(results).every(v => v);
    return this.testResults.configFiles;
  }

  // 📋 检查npm脚本
  checkNpmScripts() {
    console.log('\\n📋 检查npm脚本...');
    
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.log('❌ package.json不存在');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const requiredScripts = [
      'demo',
      'secure-start', 
      'setup-secure',
      'security-check',
      'production-setup'
    ];

    const results = {};
    
    for (const script of requiredScripts) {
      results[script] = !!packageJson.scripts[script];
      console.log(`  ${results[script] ? '✅' : '❌'} npm run ${script}`);
    }

    this.testResults.scripts = Object.values(results).every(v => v);
    return this.testResults.scripts;
  }

  // 🎮 测试演示模式配置
  async testDemoMode() {
    console.log('\\n🎮 测试演示模式配置...');
    
    try {
      // 运行demo配置脚本
      const demoScript = path.join(this.projectRoot, 'scripts', 'demo-mode.js');
      
      return new Promise((resolve) => {
        const child = spawn('node', [demoScript], {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });

        let output = '';
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.stderr.on('data', (data) => {
          output += data.toString();
        });

        // 几秒后杀死进程（避免启动服务器）
        setTimeout(() => {
          child.kill('SIGTERM');
        }, 3000);

        child.on('close', (code) => {
          const success = output.includes('演示配置已创建') || output.includes('演示模式');
          console.log(`  ${success ? '✅' : '❌'} 演示模式配置`);
          
          // 检查是否创建了.env.demo文件
          const envDemo = fs.existsSync(path.join(this.projectRoot, '.env.demo'));
          console.log(`  ${envDemo ? '✅' : '❌'} .env.demo文件创建`);
          
          this.testResults.demoMode = success && envDemo;
          resolve(this.testResults.demoMode);
        });
      });
      
    } catch (error) {
      console.log(`  ❌ 演示模式测试失败: ${error.message}`);
      this.testResults.demoMode = false;
      return false;
    }
  }

  // 🔒 测试安全模式配置
  async testSecureMode() {
    console.log('\\n🔒 测试安全模式配置...');
    
    try {
      const setupScript = path.join(this.projectRoot, 'scripts', 'setup-secure.js');
      
      return new Promise((resolve) => {
        const child = spawn('node', [setupScript], {
          cwd: this.projectRoot,
          stdio: 'pipe'
        });

        let output = '';
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.on('close', (code) => {
          const success = output.includes('安全配置完成') && code === 0;
          console.log(`  ${success ? '✅' : '❌'} 安全配置生成`);
          
          // 检查是否创建了.env.local文件
          const envLocal = fs.existsSync(path.join(this.projectRoot, '.env.local'));
          console.log(`  ${envLocal ? '✅' : '❌'} .env.local文件创建`);
          
          // 检查是否创建了安全检查脚本
          const securityCheck = fs.existsSync(path.join(this.projectRoot, 'scripts', 'security-check.js'));
          console.log(`  ${securityCheck ? '✅' : '❌'} 安全检查脚本创建`);
          
          this.testResults.secureMode = success && envLocal && securityCheck;
          resolve(this.testResults.secureMode);
        });
      });
      
    } catch (error) {
      console.log(`  ❌ 安全模式测试失败: ${error.message}`);
      this.testResults.secureMode = false;
      return false;
    }
  }

  // 🛡️ 测试安全检查
  async testSecurityCheck() {
    console.log('\\n🛡️ 测试安全检查...');
    
    try {
      const checkScript = path.join(this.projectRoot, 'scripts', 'security-check.js');
      
      if (!fs.existsSync(checkScript)) {
        console.log('  ❌ 安全检查脚本不存在');
        return false;
      }

      return new Promise((resolve) => {
        const child = spawn('node', [checkScript], {
          cwd: this.projectRoot,
          stdio: 'pipe',
          env: { ...process.env, NODE_ENV: 'development' }
        });

        let output = '';
        child.stdout.on('data', (data) => {
          output += data.toString();
        });

        child.on('close', (code) => {
          const success = output.includes('安全检查') && (code === 0 || code === 1);
          console.log(`  ${success ? '✅' : '❌'} 安全检查执行`);
          
          const hasChecks = output.includes('配置剩余有效时间') || output.includes('安全检查通过');
          console.log(`  ${hasChecks ? '✅' : '❌'} 安全检查逻辑`);
          
          resolve(success && hasChecks);
        });
      });
      
    } catch (error) {
      console.log(`  ❌ 安全检查测试失败: ${error.message}`);
      return false;
    }
  }

  // 📊 生成测试报告
  generateReport() {
    console.log('\\n' + '='.repeat(60));
    console.log('📊 安装体验测试报告');
    console.log('='.repeat(60));
    
    const tests = [
      { name: '必要文件检查', result: this.testResults.configFiles },
      { name: 'npm脚本检查', result: this.testResults.scripts },
      { name: '演示模式配置', result: this.testResults.demoMode },
      { name: '安全模式配置', result: this.testResults.secureMode },
    ];

    tests.forEach(test => {
      console.log(`${test.result ? '✅' : '❌'} ${test.name}`);
    });

    const passedTests = tests.filter(t => t.result).length;
    const totalTests = tests.length;
    const score = Math.round((passedTests / totalTests) * 100);

    console.log('\\n📈 测试得分: ' + score + '%');
    
    if (score >= 80) {
      console.log('🎉 安装体验优秀！用户可以顺利体验功能');
    } else if (score >= 60) {
      console.log('⚠️ 安装体验良好，但有改进空间');
    } else {
      console.log('❌ 安装体验需要优化');
    }

    console.log('\\n🎯 用户体验流程:');
    console.log('1. git clone + npm install');
    console.log('2. npm run demo          # 零配置体验');
    console.log('3. npm run secure-start  # 安全开发');
    console.log('4. npm run production-setup # 生产配置');
    
    console.log('='.repeat(60));
  }

  // 🧪 运行所有测试
  async runAllTests() {
    console.log('🧪 开始安装体验测试\\n');
    
    try {
      // 基础文件检查
      this.checkRequiredFiles();
      this.checkNpmScripts();
      
      // 功能测试
      await this.testDemoMode();
      await this.testSecureMode();
      await this.testSecurityCheck();
      
      // 生成报告
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 测试过程出错：', error.message);
    }
  }
}

// 运行测试
if (require.main === module) {
  const tester = new InstallationTester();
  tester.runAllTests();
}

module.exports = InstallationTester;