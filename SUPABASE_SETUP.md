# 🚀 Supabase 项目配置指南

## 📋 快速配置步骤

### 1️⃣ 创建 Supabase 项目 (5分钟)

1. **访问 Supabase**
   - 打开 [supabase.com](https://supabase.com)
   - 点击 **"Start your project"** 或 **"Sign In"**

2. **登录/注册**
   - 使用 GitHub 账号登录 (推荐)
   - 或创建新账号

3. **创建新项目**
   - 点击 **"New Project"**
   - 选择组织 (默认为个人账号)

4. **填写项目信息**
   ```
   名称: lighting-app-prod
   数据库密码: [生成强密码并保存]
   地区: Northeast Asia (Seoul) 或最近的区域
   定价: Free tier (免费版)
   ```

5. **等待项目创建**
   - 大约需要 2-3 分钟
   - 状态变为 "Project ready" 时完成

### 2️⃣ 获取项目凭据 (2分钟)

在项目仪表板中：

1. **进入设置**
   - 左侧菜单 → **Settings** → **API**

2. **复制项目信息**
   ```bash
   Project URL: https://[项目ID].supabase.co
   API Keys:
   - anon public: eyJ... (公开密钥)
   - service_role: eyJ... (服务端密钥，保密!)
   ```

### 3️⃣ 更新环境变量 (1分钟)

编辑项目中的 `.env.local` 文件：

```bash
# 替换为你的真实信息
NEXT_PUBLIC_SUPABASE_URL=https://你的项目ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥

# 其他配置保持不变
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4️⃣ 配置认证设置 (2分钟)

在 Supabase 仪表板中：

1. **Authentication 设置**
   - 左侧菜单 → **Authentication** → **Settings**

2. **站点 URL 配置**
   ```
   Site URL: http://localhost:3000
   ```

3. **重定向 URLs**
   - 点击 **"Add URL"**
   - 添加: `http://localhost:3000/auth/callback`
   - 生产环境: `https://你的域名.com/auth/callback`

4. **邮箱确认** (可选)
   - **Enable email confirmations**: 关闭 (开发阶段)
   - 生产环境时再开启

## 🛠️ 自动化配置 (推荐)

完成上述手动步骤后，运行自动化脚本：

```bash
# 1. 进入项目目录
cd /path/to/lighting-app

# 2. 链接到 Supabase 项目
supabase login
supabase link --project-ref 你的项目ID

# 3. 运行数据库迁移
supabase db push

# 4. 验证连接
npm run mcp:db migrate status
```

## ✅ 验证清单

完成配置后，检查以下项目：

- [ ] ✅ Supabase 项目已创建
- [ ] ✅ 环境变量已更新
- [ ] ✅ 认证设置已配置
- [ ] ✅ 数据库已链接
- [ ] ✅ 迁移脚本已执行
- [ ] ✅ MCP 连接正常

## 🔧 测试连接

运行以下命令验证连接：

```bash
# 测试数据库连接
npm run mcp:db migrate status

# 测试 API 健康状态
curl http://localhost:3000/api/health

# 启动开发服务器
npm run dev
```

## 📊 预期结果

连接成功后，你应该看到：

1. **MCP 状态**: ✅ Supabase connected
2. **数据库表**: 12 个表已创建
3. **函数**: 4 个推荐算法函数可用
4. **API 健康**: database.status = "healthy"

## 🔄 故障排除

### 常见问题

**1. 连接超时**
```bash
# 检查网络和项目状态
supabase projects list
```

**2. 认证失败**
```bash
# 重新登录
supabase logout
supabase login
```

**3. 迁移失败**
```bash
# 重置并重新迁移
supabase db reset
```

**4. 环境变量错误**
- 确认 `.env.local` 格式正确
- 重启开发服务器: `npm run dev`

## 🎯 下一步

配置完成后：

1. **添加示例数据** - 运行种子数据脚本
2. **测试推荐算法** - 完成问卷流程
3. **配置缓存** - 设置 Redis 连接
4. **部署准备** - 配置 Cloudflare Pages

---

**预计完成时间**: 10-15分钟  
**技术难度**: 初级  
**前置要求**: 互联网连接, GitHub 账号