#!/bin/bash
# 🚀 MCP服务器启动脚本
# 一键启动所有LightingPro MCP服务器

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[MCP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[MCP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[MCP]${NC} $1"
}

log_error() {
    echo -e "${RED}[MCP]${NC} $1"
}

# 项目根目录
PROJECT_ROOT="/Users/macbookpro/Documents/claude编码/claude练手/lighting-app"
MCP_DIR="$PROJECT_ROOT/mcp"

# 检查环境
check_environment() {
    log_info "检查MCP运行环境..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js"
        exit 1
    fi
    
    # 检查项目目录
    if [ ! -d "$PROJECT_ROOT" ]; then
        log_error "项目目录不存在: $PROJECT_ROOT"
        exit 1
    fi
    
    # 检查MCP脚本
    if [ ! -f "$MCP_DIR/enhanced-codegen-pro.js" ]; then
        log_error "MCP脚本文件不存在"
        exit 1
    fi
    
    log_success "环境检查通过"
}

# 启动单个MCP服务器
start_mcp_server() {
    local server_name=$1
    local script_file=$2
    local description=$3
    
    log_info "启动 $server_name..."
    
    # 检查脚本文件是否存在
    if [ ! -f "$MCP_DIR/$script_file" ]; then
        log_error "脚本文件不存在: $script_file"
        return 1
    fi
    
    # 在后台启动服务器
    cd "$PROJECT_ROOT"
    nohup node "$MCP_DIR/$script_file" > "$MCP_DIR/logs/${server_name}.log" 2>&1 &
    local pid=$!
    
    # 等待服务器启动
    sleep 2
    
    # 检查进程是否还在运行
    if kill -0 $pid 2>/dev/null; then
        echo $pid > "$MCP_DIR/pids/${server_name}.pid"
        log_success "$server_name 启动成功 (PID: $pid)"
        log_info "描述: $description"
        return 0
    else
        log_error "$server_name 启动失败"
        return 1
    fi
}

# 创建必要的目录
setup_directories() {
    log_info "创建MCP运行目录..."
    
    mkdir -p "$MCP_DIR/logs"
    mkdir -p "$MCP_DIR/pids"
    
    log_success "目录创建完成"
}

# 停止现有的MCP服务器
stop_existing_servers() {
    log_info "停止现有的MCP服务器..."
    
    if [ -d "$MCP_DIR/pids" ]; then
        for pid_file in "$MCP_DIR/pids"/*.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                local server_name=$(basename "$pid_file" .pid)
                
                if kill -0 $pid 2>/dev/null; then
                    kill $pid
                    log_info "停止 $server_name (PID: $pid)"
                fi
                
                rm -f "$pid_file"
            fi
        done
    fi
    
    log_success "现有服务器已停止"
}

# 显示服务器状态
show_status() {
    log_info "MCP服务器状态:"
    echo ""
    
    if [ -d "$MCP_DIR/pids" ]; then
        local running_count=0
        
        for pid_file in "$MCP_DIR/pids"/*.pid; do
            if [ -f "$pid_file" ]; then
                local pid=$(cat "$pid_file")
                local server_name=$(basename "$pid_file" .pid)
                
                if kill -0 $pid 2>/dev/null; then
                    echo -e "  ${GREEN}✓${NC} $server_name (PID: $pid) - 运行中"
                    ((running_count++))
                else
                    echo -e "  ${RED}✗${NC} $server_name - 已停止"
                    rm -f "$pid_file"
                fi
            fi
        done
        
        if [ $running_count -eq 0 ]; then
            echo -e "  ${YELLOW}⚠${NC} 没有运行中的MCP服务器"
        fi
    else
        echo -e "  ${YELLOW}⚠${NC} 没有运行中的MCP服务器"
    fi
    
    echo ""
}

# 启动所有MCP服务器
start_all_servers() {
    log_info "启动LightingPro MCP服务器集群..."
    echo ""
    
    # 启动基础服务器
    start_mcp_server "lighting-basic-server" "server.js" "基础MCP服务器 - 数据库操作和分析"
    
    # 启动智能代码生成器
    start_mcp_server "lighting-smart-codegen" "smart-codegen.js" "智能代码生成器 - 基础模板和模式识别"
    
    # 启动AI增强专业版
    start_mcp_server "lighting-enhanced-codegen-pro" "enhanced-codegen-pro.js" "AI增强代码生成器专业版 - 智能分析、重构和优化"
    
    echo ""
    log_success "🎉 所有MCP服务器启动完成！"
}

# 显示使用说明
show_usage() {
    echo ""
    log_info "🔧 MCP服务器使用说明:"
    echo ""
    echo -e "  ${BLUE}📡 可用的MCP工具:${NC}"
    echo "    • ai_analyze_code      - 🧠 AI代码分析"
    echo "    • ai_generate_code     - 🚀 AI代码生成"
    echo "    • ai_refactor_code     - 🔄 AI代码重构"
    echo "    • generate_feature     - 🏗️ 完整功能生成"
    echo "    • apply_design_patterns- 🎨 设计模式应用"
    echo "    • optimize_performance - ⚡ 性能优化"
    echo ""
    echo -e "  ${BLUE}🎯 快速测试:${NC}"
    echo "    node mcp/demo-intelligent-codegen.js"
    echo ""
    echo -e "  ${BLUE}📊 查看日志:${NC}"
    echo "    tail -f mcp/logs/lighting-enhanced-codegen-pro.log"
    echo ""
    echo -e "  ${BLUE}🛑 停止服务器:${NC}"
    echo "    $0 stop"
    echo ""
}

# 停止所有服务器
stop_all_servers() {
    log_info "停止所有MCP服务器..."
    stop_existing_servers
    log_success "所有MCP服务器已停止"
}

# 重启所有服务器
restart_all_servers() {
    log_info "重启MCP服务器..."
    stop_existing_servers
    sleep 1
    setup_directories
    start_all_servers
}

# 显示帮助信息
show_help() {
    echo ""
    echo -e "${BLUE}🚀 LightingPro MCP服务器管理工具${NC}"
    echo ""
    echo "用法: $0 [命令]"
    echo ""
    echo "可用命令:"
    echo "  start     启动所有MCP服务器 (默认)"
    echo "  stop      停止所有MCP服务器"
    echo "  restart   重启所有MCP服务器"
    echo "  status    显示服务器状态"
    echo "  help      显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0              # 启动所有服务器"
    echo "  $0 start        # 启动所有服务器"
    echo "  $0 status       # 查看状态"
    echo "  $0 stop         # 停止所有服务器"
    echo ""
}

# 主函数
main() {
    local command="${1:-start}"
    
    echo -e "${BLUE}"
    echo "========================================"
    echo "🚀 LightingPro MCP 服务器管理器"
    echo "========================================"
    echo -e "${NC}"
    
    case "$command" in
        "start")
            check_environment
            setup_directories
            stop_existing_servers
            start_all_servers
            show_status
            show_usage
            ;;
        "stop")
            stop_all_servers
            ;;
        "restart")
            check_environment
            restart_all_servers
            show_status
            show_usage
            ;;
        "status")
            show_status
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知命令: $command"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"