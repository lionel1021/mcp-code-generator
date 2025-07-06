# 🚀 Claude Code 开发环境推荐插件

## 🧩 MCP 生态插件

### **官方 MCP 服务器**
```bash
# 安装命令
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-postgres  
npm install -g @modelcontextprotocol/server-git
```

**功能说明**:
- **filesystem**: 智能文件操作、项目分析
- **postgres**: 数据库查询优化、架构分析  
- **git**: 智能提交、分支管理

### **社区 MCP 插件**
```bash
# 开发工具
mcp-server-docker       # Docker 容器管理
mcp-server-vercel       # Vercel 部署集成
mcp-server-supabase     # Supabase 深度集成
mcp-server-openapi      # API 文档生成
```

---

## 💻 VS Code / Cursor 必备插件

### **🔥 核心开发插件**

#### **代码质量**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",           // 代码格式化
    "dbaeumer.vscode-eslint",           // JavaScript/TypeScript 检查
    "bradlc.vscode-tailwindcss",        // Tailwind CSS 智能提示
    "ms-vscode.vscode-typescript-next", // TypeScript 增强
    "usernamehw.errorlens"              // 错误行内显示
  ]
}
```

#### **React/Next.js 开发**
```json
{
  "recommendations": [
    "ms-vscode.vscode-react-native",    // React 组件支持
    "formulahendry.auto-rename-tag",    // 标签自动重命名
    "christian-kohler.path-intellisense", // 路径智能提示
    "ms-vscode.vscode-json",            // JSON 增强
    "bradlc.vscode-tailwindcss"         // Tailwind 类名提示
  ]
}
```

#### **数据库开发**
```json
{
  "recommendations": [
    "ms-mssql.mssql",                   // SQL Server 支持
    "cweijan.vscode-postgresql-client2", // PostgreSQL 客户端
    "mtxr.sqltools",                    // 通用 SQL 工具
    "ms-vscode.vscode-docker"           // Docker 支持
  ]
}
```

#### **Git 和版本控制**
```json
{
  "recommendations": [
    "eamodio.gitlens",                  // Git 历史可视化
    "github.vscode-pull-request-github", // GitHub PR 集成
    "github.copilot",                   // GitHub Copilot
    "github.copilot-chat"               // Copilot 聊天
  ]
}
```

---

## 🤖 AI 开发助手

### **Claude 集成插件**
```
1. Claude for VSCode (官方)
   - 代码解释和重构
   - 智能代码生成
   - 上下文感知建议

2. Claude Code Assistant
   - 项目级代码分析
   - 架构建议
   - 性能优化建议
```

### **其他 AI 工具**
```
3. GitHub Copilot
   - 代码自动补全
   - 函数生成
   - 注释生成

4. Tabnine
   - 智能代码补全
   - 团队模型训练
   - 本地 AI 推理

5. CodeWhisperer (Amazon)
   - AWS 服务集成
   - 安全代码建议
   - 最佳实践提示
```

---

## 🔧 开发工具插件

### **项目管理**
```
1. Project Manager
   - 多项目快速切换
   - 项目收藏夹
   - 工作区管理

2. Todo Tree
   - TODO/FIXME 标记管理
   - 任务列表视图
   - 进度跟踪

3. Bookmarks
   - 代码书签功能
   - 快速导航
   - 重要位置标记
```

### **调试和测试**
```
4. REST Client
   - API 测试
   - HTTP 请求发送
   - 响应查看

5. Thunder Client
   - Postman 替代品
   - 轻量级 API 测试
   - 集合管理

6. Jest
   - 单元测试支持
   - 测试覆盖率
   - 测试运行器
```

### **样式和设计**
```
7. Color Highlight
   - 颜色值可视化
   - CSS 颜色预览
   - 主题色管理

8. Auto Close Tag
   - HTML 标签自动闭合
   - JSX 支持
   - 智能配对

9. Bracket Pair Colorizer
   - 括号配对着色
   - 嵌套可视化
   - 代码结构清晰
```

---

## 🚀 性能和监控插件

### **性能分析**
```
1. Import Cost
   - 显示导入包大小
   - 性能影响分析
   - 包优化建议

2. Bundle Analyzer
   - 构建包分析
   - 依赖关系图
   - 优化建议

3. Performance Monitor
   - 实时性能监控
   - 内存使用分析
   - 响应时间追踪
```

### **部署和 DevOps**
```
4. Docker Explorer
   - 容器管理
   - 镜像构建
   - 日志查看

5. Kubernetes
   - 集群管理
   - Pod 监控
   - 配置部署

6. Vercel for VSCode
   - 一键部署
   - 预览分支
   - 环境管理
```

---

## 🔒 安全和质量插件

### **代码安全**
```
1. SonarLint
   - 代码质量分析
   - 安全漏洞检测
   - 最佳实践建议

2. Snyk Security
   - 依赖漏洞扫描
   - 安全建议
   - 自动修复

3. GitGuardian
   - 密钥泄露检测
   - 敏感信息保护
   - 合规性检查
```

---

## 🎨 UI/UX 开发插件

### **设计工具**
```
1. Figma for VSCode
   - 设计稿导入
   - 组件提取
   - 样式同步

2. Zeplin
   - 设计规范
   - 样式指南
   - 资源导出

3. Sketch
   - 原型设计
   - 交互预览
   - 资源管理
```

### **前端增强**
```
4. Live Server
   - 本地服务器
   - 实时刷新
   - 移动预览

5. Browser Preview
   - 内置浏览器
   - 实时预览
   - 调试集成

6. Responsive Viewer
   - 多设备预览
   - 响应式测试
   - 屏幕适配
```

---

## 📊 数据和分析插件

### **数据可视化**
```
1. Rainbow CSV
   - CSV 文件着色
   - 数据预览
   - 查询功能

2. Excel Viewer
   - 表格数据查看
   - 数据分析
   - 格式转换

3. JSON Viewer
   - JSON 格式化
   - 数据结构可视化
   - 验证和编辑
```

---

## 💡 配置建议

### **推荐插件包 (lighting-app 专用)**
```json
{
  "name": "LightingPro Development Pack",
  "displayName": "LightingPro 开发插件包",
  "description": "专为 LightingPro 项目优化的插件集合",
  "version": "1.0.0",
  "engines": {
    "vscode": "^1.74.0"
  },
  "extensionPack": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint", 
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "eamodio.gitlens",
    "ms-vscode.vscode-docker",
    "cweijan.vscode-postgresql-client2",
    "github.copilot",
    "usernamehw.errorlens",
    "formulahendry.auto-rename-tag"
  ]
}
```

### **工作区配置**
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ],
  "unwantedRecommendations": [
    "ms-python.python",
    "ms-vscode.cpptools"
  ]
}
```

---

## 🚀 安装指南

### **一键安装脚本**
```bash
# 安装 VS Code 插件
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension bradlc.vscode-tailwindcss
code --install-extension eamodio.gitlens
code --install-extension ms-vscode.vscode-docker

# MCP 服务器安装
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-postgres
```

### **配置同步**
```bash
# VS Code 设置同步
Settings Sync -> Turn On
GitHub 账号登录自动同步配置
```

---

## 🎯 针对 LightingPro 的特殊推荐

### **最适合当前项目的插件**
1. **Supabase for VSCode** - 数据库管理
2. **Tailwind CSS IntelliSense** - 样式开发
3. **Thunder Client** - API 测试
4. **GitLens** - 版本控制
5. **Docker** - 容器化部署

### **下一阶段需要的插件**
1. **REST Client** - API 文档测试
2. **Excel Viewer** - 产品数据导入
3. **Color Highlight** - 主题颜色管理
4. **Import Cost** - 性能优化
5. **SonarLint** - 代码质量

---

**建议**: 先安装核心插件，随着项目发展逐步添加专业插件。避免一次性安装太多影响性能。