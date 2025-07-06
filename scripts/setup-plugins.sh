#!/bin/bash

# =====================================================
# LightingPro 开发插件一键安装脚本
# 为项目配置最佳开发环境
# =====================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SETUP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[SETUP]${NC} $1"
}

log_error() {
    echo -e "${RED}[SETUP]${NC} $1"
}

# 检查编辑器
check_editor() {
    if command -v code &> /dev/null; then
        EDITOR="code"
        log_success "检测到 VS Code"
    elif command -v cursor &> /dev/null; then
        EDITOR="cursor"  
        log_success "检测到 Cursor"
    else
        log_error "未检测到 VS Code 或 Cursor"
        return 1
    fi
}

# 安装 VS Code/Cursor 插件
install_editor_plugins() {
    log_info "安装编辑器插件..."
    
    # 核心插件
    CORE_PLUGINS=(
        "esbenp.prettier-vscode"           # 代码格式化
        "dbaeumer.vscode-eslint"           # ESLint
        "bradlc.vscode-tailwindcss"        # Tailwind CSS
        "ms-vscode.vscode-typescript-next" # TypeScript
        "usernamehw.errorlens"             # 错误显示
    )
    
    # 开发增强插件
    DEV_PLUGINS=(
        "eamodio.gitlens"                  # Git 增强
        "formulahendry.auto-rename-tag"    # 标签重命名
        "christian-kohler.path-intellisense" # 路径提示
        "ms-vscode.vscode-docker"          # Docker
        "cweijan.vscode-postgresql-client2" # PostgreSQL
    )
    
    # AI 和效率插件
    PRODUCTIVITY_PLUGINS=(
        "github.copilot"                   # GitHub Copilot
        "ms-vscode.vscode-react-native"    # React 支持
        "rangav.vscode-thunder-client"     # API 测试
        "alefragnani.project-manager"      # 项目管理
        "gruntfuggly.todo-tree"           # TODO 管理
    )
    
    # 安装核心插件
    log_info "安装核心插件..."
    for plugin in "${CORE_PLUGINS[@]}"; do
        if $EDITOR --install-extension "$plugin" &> /dev/null; then
            log_success "已安装: $plugin"
        else
            log_warning "安装失败: $plugin"
        fi
    done
    
    # 询问是否安装开发增强插件
    echo
    read -p "安装开发增强插件？(y/n): " install_dev
    if [[ $install_dev == "y" || $install_dev == "Y" ]]; then
        for plugin in "${DEV_PLUGINS[@]}"; do
            if $EDITOR --install-extension "$plugin" &> /dev/null; then
                log_success "已安装: $plugin"
            else
                log_warning "安装失败: $plugin"
            fi
        done
    fi
    
    # 询问是否安装 AI 插件
    echo
    read -p "安装 AI 和效率插件？(y/n): " install_ai
    if [[ $install_ai == "y" || $install_ai == "Y" ]]; then
        for plugin in "${PRODUCTIVITY_PLUGINS[@]}"; do
            if $EDITOR --install-extension "$plugin" &> /dev/null; then
                log_success "已安装: $plugin"
            else
                log_warning "安装失败: $plugin"
            fi
        done
    fi
}

# 安装 MCP 服务器
install_mcp_servers() {
    log_info "安装 MCP 服务器..."
    
    # 检查 Node.js
    if ! command -v npm &> /dev/null; then
        log_error "需要安装 Node.js 和 npm"
        return 1
    fi
    
    # MCP 服务器列表
    MCP_SERVERS=(
        "@modelcontextprotocol/server-filesystem"
        "@modelcontextprotocol/server-sqlite"
    )
    
    for server in "${MCP_SERVERS[@]}"; do
        log_info "安装 $server..."
        if npm install -g "$server" &> /dev/null; then
            log_success "已安装: $server"
        else
            log_warning "安装失败: $server (可能需要权限)"
        fi
    done
}

# 创建工作区配置
create_workspace_config() {
    log_info "创建工作区配置..."
    
    mkdir -p .vscode
    
    # VS Code 配置
    cat > .vscode/settings.json << 'EOF'
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.preferences.quoteStyle": "single",
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  },
  "tailwindCSS.includeLanguages": {
    "plaintext": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "editor.quickSuggestions": {
    "strings": true
  },
  "css.validate": false,
  "scss.validate": false,
  "less.validate": false
}
EOF

    # 推荐插件配置
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "eamodio.gitlens",
    "ms-vscode.vscode-docker",
    "cweijan.vscode-postgresql-client2",
    "usernamehw.errorlens",
    "formulahendry.auto-rename-tag"
  ],
  "unwantedRecommendations": []
}
EOF

    # 调试配置
    cat > .vscode/launch.json << 'EOF'
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
EOF

    # 任务配置
    cat > .vscode/tasks.json << 'EOF'
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "npm: dev",
      "type": "npm",
      "script": "dev",
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "npm: build",
      "type": "npm", 
      "script": "build",
      "group": "build",
      "problemMatcher": []
    },
    {
      "label": "MCP: start server",
      "type": "shell",
      "command": "npm run mcp:start",
      "group": "build",
      "problemMatcher": []
    }
  ]
}
EOF

    log_success "工作区配置已创建"
}

# 配置 Git hooks
setup_git_hooks() {
    log_info "配置 Git hooks..."
    
    mkdir -p .git/hooks
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/sh
# LightingPro pre-commit hook

echo "🔍 Running pre-commit checks..."

# 检查 ESLint
echo "📝 Checking ESLint..."
npm run lint || {
    echo "❌ ESLint failed. Please fix errors before committing."
    exit 1
}

# 检查 TypeScript
echo "🔧 Checking TypeScript..."
npx tsc --noEmit || {
    echo "❌ TypeScript check failed. Please fix errors before committing."
    exit 1
}

echo "✅ Pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
    log_success "Git hooks 已配置"
}

# 主菜单
show_menu() {
    echo
    echo -e "${BLUE}=== LightingPro 插件配置 ===${NC}"
    echo "1. 安装编辑器插件"
    echo "2. 安装 MCP 服务器"
    echo "3. 创建工作区配置"
    echo "4. 配置 Git hooks"
    echo "5. 全部安装 (推荐)"
    echo "6. 显示已安装插件"
    echo "7. 退出"
    echo
}

# 显示已安装插件
show_installed_plugins() {
    log_info "已安装的插件:"
    if command -v code &> /dev/null; then
        code --list-extensions | head -20
    elif command -v cursor &> /dev/null; then
        cursor --list-extensions | head -20
    else
        log_error "未检测到编辑器"
    fi
}

# 全部安装
install_all() {
    log_info "开始完整安装..."
    check_editor && \
    install_editor_plugins && \
    install_mcp_servers && \
    create_workspace_config && \
    setup_git_hooks && \
    log_success "🎉 插件配置完成！"
}

# 主函数
main() {
    case "${1:-menu}" in
        "plugins")
            check_editor && install_editor_plugins
            ;;
        "mcp")
            install_mcp_servers
            ;;
        "config")
            create_workspace_config
            ;;
        "hooks")
            setup_git_hooks
            ;;
        "all")
            install_all
            ;;
        "list")
            show_installed_plugins
            ;;
        "menu")
            while true; do
                show_menu
                read -p "选择操作 (1-7): " choice
                
                case $choice in
                    1) check_editor && install_editor_plugins ;;
                    2) install_mcp_servers ;;
                    3) create_workspace_config ;;
                    4) setup_git_hooks ;;
                    5) install_all ;;
                    6) show_installed_plugins ;;
                    7) 
                        log_info "再见!"
                        exit 0
                        ;;
                    *)
                        log_error "无效选项: $choice"
                        ;;
                esac
                
                echo
                read -p "按 Enter 继续..."
            done
            ;;
        *)
            echo "用法: $0 {plugins|mcp|config|hooks|all|list|menu}"
            ;;
    esac
}

# 执行主函数
main "$@"