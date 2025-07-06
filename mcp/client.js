#!/usr/bin/env node

/**
 * LightingPro MCP Client
 * 命令行工具用于与 MCP 服务器交互
 */

const WebSocket = require('ws');
const readline = require('readline');

class MCPClient {
  constructor(serverUrl = 'ws://localhost:3001') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.requestId = 0;
    this.pendingRequests = new Map();
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);
      
      this.ws.on('open', () => {
        console.log('🔗 Connected to LightingPro MCP Server');
        this.setupMessageHandler();
        resolve();
      });
      
      this.ws.on('error', (error) => {
        console.error('❌ Connection failed:', error.message);
        reject(error);
      });
    });
  }

  setupMessageHandler() {
    this.ws.on('message', (data) => {
      try {
        const response = JSON.parse(data);
        
        if (response.id && this.pendingRequests.has(response.id)) {
          const { resolve, reject } = this.pendingRequests.get(response.id);
          this.pendingRequests.delete(response.id);
          
          if (response.error) {
            reject(new Error(response.error));
          } else {
            resolve(response.result);
          }
        }
      } catch (error) {
        console.error('❌ Failed to parse response:', error.message);
      }
    });
  }

  async sendRequest(tool, params = {}) {
    const id = ++this.requestId;
    
    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject });
      
      this.ws.send(JSON.stringify({
        id,
        tool,
        params
      }));
      
      // 设置超时
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000);
    });
  }

  // 数据库相关命令
  async dbMigrate(action = 'status') {
    try {
      const result = await this.sendRequest('db:migrate', { action });
      
      if (result.success) {
        console.log('✅ Database Migration Result:');
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.error('❌', result.message);
      }
    } catch (error) {
      console.error('❌ Migration failed:', error.message);
    }
  }

  async dbQuery(query, options = {}) {
    try {
      const result = await this.sendRequest('db:query', { query, ...options });
      
      if (result.success) {
        console.log('✅ Query executed successfully');
        console.log('📊 Performance:', result.performance);
        
        if (result.analysis) {
          console.log('🔍 Analysis:', result.analysis);
        }
        
        if (result.optimization) {
          console.log('⚡ Optimization suggestions:', result.optimization);
        }
        
        console.log('📋 Data:', result.data);
      } else {
        console.error('❌', result.message);
      }
    } catch (error) {
      console.error('❌ Query failed:', error.message);
    }
  }

  // 性能分析命令
  async analyzePerformance(type = 'api', options = {}) {
    try {
      const result = await this.sendRequest('perf:analyze', { type, ...options });
      
      if (result.success) {
        console.log('📊 Performance Analysis:');
        console.log(JSON.stringify(result.data, null, 2));
      } else {
        console.error('❌', result.message);
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
    }
  }

  // 代码生成命令
  async generateCode(type, template, context = {}) {
    try {
      const result = await this.sendRequest('code:generate', { type, template, context });
      
      if (result.success) {
        console.log('🎨 Generated Code:');
        console.log(result.data.code);
        
        if (result.data.suggestions) {
          console.log('💡 Suggestions:', result.data.suggestions);
        }
      } else {
        console.error('❌', result.message);
      }
    } catch (error) {
      console.error('❌ Code generation failed:', error.message);
    }
  }

  // 部署检查命令
  async checkDeployment(environment = 'production', checks = ['all']) {
    try {
      const result = await this.sendRequest('deploy:check', { environment, checks });
      
      if (result.success) {
        console.log('🚀 Deployment Check Results:');
        console.log('Environment:', result.data.environment);
        console.log('Ready for deployment:', result.data.deploymentReady ? '✅' : '❌');
        
        Object.entries(result.data.checks).forEach(([check, result]) => {
          console.log(`${result.passed ? '✅' : '❌'} ${check}:`, result.message);
        });
        
        if (result.data.summary) {
          console.log('\n📋 Summary:', result.data.summary);
        }
      } else {
        console.error('❌', result.message);
      }
    } catch (error) {
      console.error('❌ Deployment check failed:', error.message);
    }
  }

  // 交互式命令行
  async startInteractive() {
    console.log('🎛️  LightingPro MCP Interactive Mode');
    console.log('Available commands:');
    console.log('  db migrate [action]     - Database migration operations');
    console.log('  db query <sql>          - Execute database query');
    console.log('  perf [type]             - Performance analysis');
    console.log('  generate <type>         - Code generation');
    console.log('  deploy check            - Deployment readiness check');
    console.log('  help                    - Show this help');
    console.log('  exit                    - Exit interactive mode\n');

    const processCommand = async (input) => {
      const parts = input.trim().split(' ');
      const [command, subcommand, ...args] = parts;

      try {
        switch (command) {
          case 'db':
            if (subcommand === 'migrate') {
              await this.dbMigrate(args[0]);
            } else if (subcommand === 'query') {
              await this.dbQuery(args.join(' '));
            }
            break;
            
          case 'perf':
            await this.analyzePerformance(subcommand || 'api');
            break;
            
          case 'generate':
            await this.generateCode(subcommand, args[0], {});
            break;
            
          case 'deploy':
            if (subcommand === 'check') {
              await this.checkDeployment();
            }
            break;
            
          case 'help':
            console.log('Available commands listed above');
            break;
            
          case 'exit':
            console.log('👋 Goodbye!');
            this.rl.close();
            process.exit(0);
            
          default:
            console.log('❓ Unknown command. Type "help" for available commands.');
        }
      } catch (error) {
        console.error('❌ Command failed:', error.message);
      }
      
      this.rl.prompt();
    };

    this.rl.setPrompt('mcp> ');
    this.rl.prompt();
    
    this.rl.on('line', processCommand);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.rl.close();
  }
}

// 命令行界面
async function main() {
  const args = process.argv.slice(2);
  const client = new MCPClient();

  try {
    await client.connect();

    if (args.length === 0) {
      // 交互式模式
      await client.startInteractive();
    } else {
      // 命令模式
      const [command, subcommand, ...params] = args;
      
      switch (command) {
        case 'db':
          if (subcommand === 'migrate') {
            await client.dbMigrate(params[0]);
          } else if (subcommand === 'query') {
            await client.dbQuery(params.join(' '));
          }
          break;
          
        case 'perf':
          await client.analyzePerformance(subcommand || 'api');
          break;
          
        case 'generate':
          await client.generateCode(subcommand, params[0]);
          break;
          
        case 'deploy':
          await client.checkDeployment();
          break;
          
        default:
          console.log('❓ Unknown command:', command);
          console.log('Available: db, perf, generate, deploy');
      }
      
      client.disconnect();
    }
  } catch (error) {
    console.error('❌ Failed to start MCP client:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MCPClient;