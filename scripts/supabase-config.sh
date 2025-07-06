#!/bin/bash

# =====================================================
# Supabase 自动化配置脚本
# 用于快速配置和验证 Supabase 连接
# =====================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 日志函数
log_info() {
    echo -e "${BLUE}[SUPABASE]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUPABASE]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[SUPABASE]${NC} $1"
}

log_error() {
    echo -e "${RED}[SUPABASE]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"

log_info "LightingPro Supabase 配置工具"
log_info "项目目录: $PROJECT_ROOT"

# 检查 Supabase CLI
check_cli() {
    log_info "检查 Supabase CLI..."
    
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI 未安装"
        log_info "请运行: brew install supabase/tap/supabase"
        exit 1
    fi
    
    CLI_VERSION=$(supabase --version)
    log_success "Supabase CLI 已安装 (版本: $CLI_VERSION)"
}

# 检查环境变量文件
check_env_file() {
    log_info "检查环境变量文件..."
    
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env.local 文件不存在"
        exit 1
    fi
    
    # 检查是否包含占位符
    if grep -q "your_supabase_url" "$ENV_FILE"; then
        log_warning "检测到环境变量占位符，需要更新实际值"
        return 1
    fi
    
    log_success "环境变量文件存在"
    return 0
}

# 验证环境变量
validate_env_vars() {
    log_info "验证环境变量..."
    
    source "$ENV_FILE"
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ "$NEXT_PUBLIC_SUPABASE_URL" = "your_supabase_url" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_URL 未设置或为占位符"
        return 1
    fi
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ] || [ "$NEXT_PUBLIC_SUPABASE_ANON_KEY" = "your_supabase_anon_key" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_ANON_KEY 未设置或为占位符"
        return 1
    fi
    
    if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ] || [ "$SUPABASE_SERVICE_ROLE_KEY" = "your_supabase_service_role_key" ]; then
        log_error "SUPABASE_SERVICE_ROLE_KEY 未设置或为占位符"
        return 1
    fi
    
    log_success "环境变量验证通过"
    return 0
}

# 登录 Supabase
login_supabase() {
    log_info "检查 Supabase 登录状态..."
    
    if supabase projects list &> /dev/null; then
        log_success "已登录 Supabase"
        return 0
    else
        log_warning "需要登录 Supabase"
        log_info "正在打开浏览器进行登录..."
        
        if supabase login; then
            log_success "Supabase 登录成功"
            return 0
        else
            log_error "Supabase 登录失败"
            return 1
        fi
    fi
}

# 链接项目
link_project() {
    log_info "检查项目链接状态..."
    
    cd "$PROJECT_ROOT"
    
    # 检查是否已经链接
    if [ -f ".supabase/config.toml" ]; then
        log_success "项目已链接到 Supabase"
        return 0
    fi
    
    # 提示用户输入项目 ref
    echo
    log_info "请输入你的 Supabase 项目 ID (项目 URL 中的字符串):"
    log_info "例如: https://abcdefgh.supabase.co 中的 'abcdefgh'"
    read -p "项目 ID: " PROJECT_REF
    
    if [ -z "$PROJECT_REF" ]; then
        log_error "项目 ID 不能为空"
        return 1
    fi
    
    log_info "正在链接项目..."
    if supabase link --project-ref "$PROJECT_REF"; then
        log_success "项目链接成功"
        return 0
    else
        log_error "项目链接失败"
        return 1
    fi
}

# 运行数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    cd "$PROJECT_ROOT"
    
    # 检查迁移文件
    if [ ! -d "supabase/migrations" ]; then
        log_error "迁移目录不存在: supabase/migrations"
        return 1
    fi
    
    MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
    log_info "找到 $MIGRATION_COUNT 个迁移文件"
    
    if supabase db push; then
        log_success "数据库迁移完成"
        return 0
    else
        log_error "数据库迁移失败"
        return 1
    fi
}

# 验证连接
verify_connection() {
    log_info "验证数据库连接..."
    
    cd "$PROJECT_ROOT"
    
    # 测试 MCP 连接
    if command -v node &> /dev/null && [ -f "mcp/client.js" ]; then
        log_info "测试 MCP 数据库连接..."
        
        if timeout 10 node mcp/client.js db migrate status &> /dev/null; then
            log_success "MCP 数据库连接正常"
        else
            log_warning "MCP 连接测试超时或失败"
        fi
    fi
    
    # 测试基本查询
    log_info "测试基本数据库查询..."
    if supabase db diff &> /dev/null; then
        log_success "数据库查询正常"
    else
        log_warning "数据库查询测试失败"
    fi
}

# 显示状态
show_status() {
    log_info "=== Supabase 配置状态 ==="
    
    # CLI 状态
    if command -v supabase &> /dev/null; then
        log_success "✅ Supabase CLI: $(supabase --version)"
    else
        log_error "❌ Supabase CLI: 未安装"
    fi
    
    # 登录状态
    if supabase projects list &> /dev/null; then
        log_success "✅ 登录状态: 已登录"
    else
        log_error "❌ 登录状态: 未登录"
    fi
    
    # 项目链接状态
    if [ -f "$PROJECT_ROOT/.supabase/config.toml" ]; then
        log_success "✅ 项目链接: 已链接"
    else
        log_error "❌ 项目链接: 未链接"
    fi
    
    # 环境变量状态
    if check_env_file && validate_env_vars &> /dev/null; then
        log_success "✅ 环境变量: 已配置"
    else
        log_error "❌ 环境变量: 需要配置"
    fi
    
    # 数据库迁移状态
    cd "$PROJECT_ROOT"
    if [ -d "supabase/migrations" ]; then
        MIGRATION_COUNT=$(ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l)
        log_success "✅ 迁移文件: $MIGRATION_COUNT 个"
    else
        log_error "❌ 迁移文件: 目录不存在"
    fi
}

# 主菜单
show_menu() {
    echo
    echo -e "${PURPLE}=== Supabase 配置管理 ===${NC}"
    echo "1. 显示状态"
    echo "2. 检查 CLI"
    echo "3. 登录 Supabase"
    echo "4. 链接项目"
    echo "5. 运行迁移"
    echo "6. 验证连接"
    echo "7. 完整配置 (推荐)"
    echo "8. 打开配置指南"
    echo "9. 退出"
    echo
}

# 完整配置流程
full_setup() {
    log_info "开始完整配置流程..."
    
    check_cli || return 1
    
    if ! check_env_file || ! validate_env_vars; then
        log_warning "请先完成环境变量配置"
        log_info "参考: SUPABASE_SETUP.md"
        return 1
    fi
    
    login_supabase || return 1
    link_project || return 1
    run_migrations || return 1
    verify_connection
    
    log_success "🎉 Supabase 配置完成!"
    show_status
}

# 主函数
main() {
    case "${1:-menu}" in
        "status")
            show_status
            ;;
        "cli")
            check_cli
            ;;
        "login")
            login_supabase
            ;;
        "link")
            link_project
            ;;
        "migrate")
            run_migrations
            ;;
        "verify")
            verify_connection
            ;;
        "setup")
            full_setup
            ;;
        "guide")
            if command -v open &> /dev/null; then
                open "$PROJECT_ROOT/SUPABASE_SETUP.md"
            else
                log_info "请查看: $PROJECT_ROOT/SUPABASE_SETUP.md"
            fi
            ;;
        "menu")
            while true; do
                show_menu
                read -p "选择操作 (1-9): " choice
                
                case $choice in
                    1) show_status ;;
                    2) check_cli ;;
                    3) login_supabase ;;
                    4) link_project ;;
                    5) run_migrations ;;
                    6) verify_connection ;;
                    7) full_setup ;;
                    8) 
                        if command -v open &> /dev/null; then
                            open "$PROJECT_ROOT/SUPABASE_SETUP.md"
                        else
                            log_info "请查看: $PROJECT_ROOT/SUPABASE_SETUP.md"
                        fi
                        ;;
                    9)
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
            echo "用法: $0 {status|cli|login|link|migrate|verify|setup|guide|menu}"
            echo
            echo "选项:"
            echo "  status  - 显示配置状态"
            echo "  cli     - 检查 CLI 安装"
            echo "  login   - 登录 Supabase"
            echo "  link    - 链接项目"
            echo "  migrate - 运行迁移"
            echo "  verify  - 验证连接"
            echo "  setup   - 完整配置"
            echo "  guide   - 打开配置指南"
            echo "  menu    - 交互式菜单 (默认)"
            ;;
    esac
}

# 执行主函数
main "$@"