# 🚀 LightingPro 数据库和认证配置指南

## 📋 配置步骤

### 1️⃣ 创建 Supabase 项目

1. 访问 [supabase.com](https://supabase.com)
2. 创建新项目或使用现有项目
3. 记录以下信息：
   - **Project URL**: `https://xxx.supabase.co`
   - **Anon Key**: `eyJ...` (公开密钥)
   - **Service Role Key**: `eyJ...` (服务端密钥)

### 2️⃣ 更新环境变量

复制并更新 `.env.local` 文件：

```bash
# 更新你的实际 Supabase 信息
NEXT_PUBLIC_SUPABASE_URL=https://你的项目id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的service_role密钥

# 其他配置保持不变
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3️⃣ 安装 Supabase CLI

```bash
# 安装 Supabase CLI
npm install -g supabase

# 验证安装
supabase --version
```

### 4️⃣ 运行数据库迁移

有两种方法：

#### 方法A: 使用我们的自动化脚本 (推荐)

```bash
# 进入项目目录
cd /Users/macbookpro/Documents/claude编码/claude练手/lighting-app

# 给脚本执行权限
chmod +x scripts/deploy-migrations.sh

# 运行迁移脚本
./scripts/deploy-migrations.sh
```

#### 方法B: 手动执行

```bash
# 链接到你的 Supabase 项目
supabase link --project-ref 你的项目id

# 运行所有迁移
supabase db reset

# 或者逐个运行迁移文件
supabase db push
```

### 5️⃣ 验证数据库结构

登录你的 Supabase 项目仪表板，检查以下表是否已创建：

✅ **用户系统表**:
- `user_profiles` - 用户资料
- `user_sessions` - 用户会话

✅ **产品系统表**:
- `brands` - 品牌信息
- `categories` - 产品分类
- `lighting_products` - 灯具产品
- `affiliate_links` - 联盟链接

✅ **推荐系统表**:
- `questionnaire_responses` - 问卷回答
- `recommendations` - 推荐结果
- `product_interactions` - 用户交互

✅ **分析系统表**:
- `product_stats` - 产品统计
- `daily_analytics` - 日度分析

✅ **核心函数** (新增):
- `get_product_recommendations()` - 智能推荐算法
- `search_products()` - 产品搜索函数
- `update_daily_analytics()` - 分析更新函数
- `update_product_popularity()` - 人气更新函数

### 6️⃣ 配置认证系统

在 Supabase 仪表板中：

1. 进入 **Authentication > Settings**
2. 配置**站点 URL**: `http://localhost:3000`
3. 添加**重定向 URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://你的域名.com/auth/callback`
4. 启用**邮箱确认** (可选)
5. 配置**第三方登录** (可选):
   - Google
   - GitHub
   - Apple

### 7️⃣ 测试设置

运行开发服务器并测试：

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
# 测试问卷功能
# 检查数据库连接
```

### 8️⃣ 添加种子数据 (可选)

运行种子数据脚本来添加示例产品：

```bash
# 运行种子数据迁移
supabase db push --include-all
```

## 🔧 故障排除

### 常见问题

**1. 迁移失败**
```bash
# 检查 Supabase 连接
supabase projects list

# 重置并重新迁移
supabase db reset
```

**2. 认证问题**
- 检查环境变量是否正确
- 确认站点 URL 配置
- 检查 RLS 策略是否启用

**3. 类型错误**
```bash
# 重新生成类型定义
supabase gen types typescript --project-id 你的项目id > src/types/database.types.ts
```

## 📊 验证清单

- [ ] Supabase 项目已创建
- [ ] 环境变量已配置
- [ ] 数据库迁移成功
- [ ] 所有表已创建
- [ ] RLS 策略已启用
- [ ] 认证系统配置完成
- [ ] 本地开发服务器运行正常
- [ ] 问卷功能正常工作

## 🎯 下一步

配置完成后，你可以：

1. **添加真实产品数据**
2. **测试推荐算法**
3. **配置联盟营销链接**
4. **部署到 Cloudflare Pages**

---

需要帮助？查看项目文档或联系开发团队！