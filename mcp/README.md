# 🚀 LightingPro MCP增强代码生成器

## 📋 启动时机和条件

### ⏰ **何时启动MCP服务器**

MCP增强代码生成器建议在以下情况下启动：

#### **1. 开发阶段启动**
```bash
# 开始新的开发会话时
./mcp/start-mcp-servers.sh start

# 需要智能代码生成时
node mcp/demo-intelligent-codegen.js
```

#### **2. 特定开发任务**
- 🎯 **创建新组件**: 需要智能生成React组件
- 🏗️ **架构设计**: 需要生成完整功能模块
- 🔄 **代码重构**: 需要AI分析和优化建议
- 📊 **质量检查**: 需要代码质量分析
- 🎨 **设计模式**: 需要应用设计模式

#### **3. 自动触发场景**
- 📝 **VS Code集成**: 编辑器启动时自动连接
- 🔧 **Git Hook**: 提交前自动代码分析
- 🚀 **CI/CD**: 构建时自动质量检查
- 👥 **团队协作**: PR创建时自动代码审查

## 🛠️ **环境要求**

### **必需依赖**
```bash
# 1. 安装Node.js (v18+)
node --version  # 确认版本

# 2. 安装项目依赖
npm install

# 3. 安装MCP SDK
npm install @modelcontextprotocol/sdk

# 4. 配置环境变量
cp .env.example .env.local
```

### **可选依赖** 
```bash
# Docker (用于Supabase本地开发)
docker --version

# Git (用于代码版本控制)
git --version
```

## 🚀 **启动方法**

### **方法1: 一键启动脚本 (推荐)**
```bash
# 启动所有MCP服务器
./mcp/start-mcp-servers.sh

# 查看状态
./mcp/start-mcp-servers.sh status

# 停止服务器
./mcp/start-mcp-servers.sh stop
```

### **方法2: 交互式演示**
```bash
# 启动演示界面 (无需MCP SDK)
node mcp/demo-intelligent-codegen.js

# 选择功能进行测试
# 1. 产品卡片组件
# 2. 搜索功能页面  
# 3. 用户收藏Hook
# 4. 推荐系统API
# 5. 完整用户中心功能
```

### **方法3: 直接运行测试**
```bash
# 运行代码生成测试 (无需MCP SDK)
node mcp/test-generation.js
```

## 🎯 **功能验证**

### **基础功能测试**
```bash
# 1. 智能代码分析
echo "分析现有代码质量和性能"

# 2. AI代码生成  
echo "基于规格生成完整组件"

# 3. 智能重构
echo "自动优化代码结构和性能"

# 4. 设计模式应用
echo "识别并应用合适的设计模式"
```

### **高级功能验证**
```bash
# 5. 完整功能模块生成
echo "生成包含组件、Hook、API的完整功能"

# 6. 质量自动优化
echo "自动应用最佳实践和性能优化"

# 7. AI模式识别
echo "智能识别代码模式和架构"
```

## 📊 **性能监控**

### **服务器状态检查**
```bash
# 查看运行状态
./mcp/start-mcp-servers.sh status

# 查看日志
tail -f mcp/logs/lighting-enhanced-codegen-pro.log

# 查看进程
ps aux | grep node
```

### **资源使用监控**
```bash
# CPU和内存使用
top -p $(cat mcp/pids/*.pid)

# 端口占用情况
lsof -i :3001
```

## 🔧 **故障排除**

### **常见问题**

#### **1. 端口占用 (EADDRINUSE)**
```bash
# 查找占用进程
lsof -i :3001

# 终止占用进程
kill -9 <PID>

# 或者修改端口配置
# 编辑 mcp/server.js 中的端口设置
```

#### **2. 模块未找到 (ERR_MODULE_NOT_FOUND)**
```bash
# 安装缺失依赖
npm install @modelcontextprotocol/sdk

# 重新安装所有依赖
rm -rf node_modules package-lock.json
npm install
```

#### **3. 权限问题**
```bash
# 添加执行权限
chmod +x mcp/start-mcp-servers.sh

# 检查文件权限
ls -la mcp/
```

### **调试模式**
```bash
# 启用调试日志
NODE_ENV=development DEBUG=mcp:* ./mcp/start-mcp-servers.sh

# 查看详细错误信息
node --trace-warnings mcp/enhanced-codegen-pro.js
```

## 🎨 **使用场景示例**

### **场景1: 新建产品展示组件**
```bash
# 1. 启动演示
node mcp/demo-intelligent-codegen.js

# 2. 选择 "1" - 产品卡片组件
# 3. 查看生成的完整TypeScript组件
# 4. 复制代码到项目中使用
```

### **场景2: 分析现有代码质量**
```bash
# 1. 启动演示
node mcp/demo-intelligent-codegen.js

# 2. 输入 "analyze" 
# 3. 查看质量评分和改进建议
# 4. 应用建议优化代码
```

### **场景3: 重构老旧组件**
```bash
# 1. 启动演示
node mcp/demo-intelligent-codegen.js

# 2. 输入 "refactor"
# 3. 查看重构前后对比
# 4. 应用改进代码
```

## 📚 **进阶配置**

### **自定义模板**
```javascript
// 在 enhanced-codegen-pro.js 中添加自定义模板
this.templates.set('custom-component', {
  description: '自定义组件模板',
  template: `// 您的自定义模板`,
  variables: ['componentName', 'props']
});
```

### **集成IDE**
```json
// VS Code settings.json
{
  "mcp.servers": {
    "lighting-codegen": {
      "command": "node",
      "args": ["./mcp/enhanced-codegen-pro.js"]
    }
  }
}
```

### **团队协作配置**
```bash
# 团队共享配置
git add mcp/mcp-config.json
git commit -m "Add MCP configuration for team"

# 环境变量模板
cp .env.local .env.example
# 编辑 .env.example，移除敏感信息
```

## 🎉 **开始使用**

### **快速体验**
```bash
# 最简单的体验方式
cd lighting-app
node mcp/demo-intelligent-codegen.js

# 选择 "1" 体验产品卡片组件生成
# 或者输入 "analyze" 体验代码分析功能
```

### **完整开发流程**
```bash
# 1. 安装依赖
npm install @modelcontextprotocol/sdk

# 2. 启动服务器
./mcp/start-mcp-servers.sh

# 3. 使用VS Code连接MCP
# 4. 开始智能化开发！
```

---

🚀 **MCP增强代码生成器让开发更智能、更高效！**