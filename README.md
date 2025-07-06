# 🚀 LightingPro - AI-Powered Lighting Recommendation Web App

A modern Next.js web application for intelligent lighting product recommendations, featuring AI-powered questionnaires and MCP-enhanced development tools.

## ✨ Features

- **🧠 Intelligent Product Recommendations**: AI-powered questionnaire system
- **🎨 Modern UI/UX**: Built with Next.js 15 + Tailwind CSS
- **⚡ High Performance**: Optimized with Redis caching and CDN
- **🔒 Secure**: Supabase authentication and RLS policies
- **🛠️ MCP Enhanced**: AI-powered code generation and optimization tools

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Hosting**: Cloudflare Pages
- **Caching**: Redis (Upstash)
- **Development**: MCP (Model Context Protocol) tools

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lighting-app.git
cd lighting-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run database migrations
npx supabase db push

# Start the development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

## 🤖 MCP Development Tools

This project includes advanced MCP (Model Context Protocol) tools for AI-enhanced development:

### Quick Start with MCP
```bash
# Check MCP status
./mcp/mcp-status.sh

# Interactive demo
node mcp/demo-intelligent-codegen.js

# Start MCP servers
./mcp/start-mcp-servers.sh
```

### MCP Features
- **AI Code Generation**: Intelligent component and hook generation
- **Code Quality Analysis**: Automated code review and optimization
- **Pattern Recognition**: Smart design pattern application
- **Performance Optimization**: Automated performance improvements

## 📊 Performance Testing

```bash
# Run all performance tests
./scripts/run-performance-tests.sh

# Run specific test types
./scripts/run-performance-tests.sh load
./scripts/run-performance-tests.sh cache
./scripts/run-performance-tests.sh database
```

## 🗄️ Database Schema

The app uses Supabase with the following main tables:
- `user_profiles` - User information and preferences
- `categories` - Product categories
- `brands` - Brand information
- `products` - Lighting product catalog
- `user_questionnaires` - User questionnaire responses
- `recommendations` - AI-generated product recommendations

## 🚀 Deployment

### Cloudflare Pages
```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
REDIS_URL=your_redis_url
UPSTASH_REDIS_REST_URL=your_upstash_url
```

## 📈 Architecture

```
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   └── lib/                 # Utilities and configurations
├── mcp/                     # MCP development tools
├── tests/                   # Performance and unit tests
├── scripts/                 # Build and deployment scripts
└── supabase/               # Database migrations and schemas
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- Enhanced with MCP (Model Context Protocol)
- Styled with Tailwind CSS
- Deployed on Cloudflare Pages

---

⭐ If you find this project helpful, please give it a star!