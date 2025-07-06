# 🔐 环境变量配置指南

## 📝 填写步骤

### 🚀 第一步：创建 Supabase 项目

1. **访问 Supabase**
   - 打开 [supabase.com](https://supabase.com)
   - 点击 "Start your project" 或 "Sign In"

2. **创建新项目**
   ```
   项目名称: lighting-app-prod
   数据库密码: [生成并保存强密码]
   地区: Northeast Asia (Seoul)
   ```

3. **获取 API 密钥**
   - 左侧菜单 → Settings → API
   - 复制以下信息：

### 📋 需要替换的值

在 `.env.local` 文件中替换以下占位符：

#### **必需配置** (立即需要)

```bash
# 替换 your-project-id 为你的实际项目ID
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co

# 替换为你的 anon 公钥 (从 Supabase Settings → API 复制)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...真实密钥

# 替换为你的 service_role 密钥 (保密!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...真实密钥

# 替换密码和项目ID
DATABASE_URL=postgresql://postgres:你的密码@db.你的项目ID.supabase.co:5432/postgres
```

#### **推荐配置** (性能提升)

```bash
# 本地 Redis (如果已安装)
REDIS_URL=redis://localhost:6379

# 或使用 Upstash (云端 Redis)
# UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
# UPSTASH_REDIS_REST_TOKEN=your-token
```

#### **生产配置** (部署时需要)

```bash
# Cloudflare API (部署到 Cloudflare Pages)
CLOUDFLARE_API_TOKEN=your-token
CLOUDFLARE_ACCOUNT_ID=your-account-id
```

### 🔍 验证配置

配置完成后运行验证：

```bash
# 检查配置状态
./scripts/supabase-config.sh status

# 如果显示绿色 ✅，说明配置正确
```

### 📷 示例截图位置

**Supabase API 密钥位置**:
```
1. 登录 supabase.com
2. 选择你的项目
3. 左侧菜单 → Settings
4. 选择 → API
5. 复制 "Project URL" 和 "API Keys"
```

**密钥格式示例**:
```
URL: https://abcdefghijk.supabase.co
anon: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3M...
```

### ⚠️ 安全提醒

- **service_role 密钥**: 拥有完全数据库权限，绝不要暴露
- **anon 密钥**: 客户端使用，相对安全
- **密码**: 数据库密码要使用强密码
- **备份**: 保存密钥到安全的密码管理器

### 🔧 配置后测试

```bash
# 1. 验证环境变量
./scripts/supabase-config.sh status

# 2. 连接 Supabase
./scripts/supabase-config.sh setup

# 3. 测试 MCP 连接
npm run mcp:db migrate status

# 4. 启动开发服务器
npm run dev
```

### 🚨 常见错误

**1. URL 格式错误**
```bash
❌ 错误: https://supabase.co/dashboard/project/abcd
✅ 正确: https://abcd.supabase.co
```

**2. 密钥截断**
```bash
❌ 错误: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
✅ 正确: 完整的长密钥字符串
```

**3. 引号问题**
```bash
❌ 错误: NEXT_PUBLIC_SUPABASE_URL="https://abc.supabase.co"
✅ 正确: NEXT_PUBLIC_SUPABASE_URL=https://abc.supabase.co
```

### 📞 获取帮助

如果遇到问题：
1. 检查 Supabase 项目状态是否为 "Active"
2. 确认 API 密钥复制完整
3. 运行 `./scripts/supabase-config.sh status` 诊断
4. 查看 `logs/mcp-server.log` 错误日志

---

**下一步**: 配置完成后运行 `./scripts/supabase-config.sh setup` 完成自动化配置！