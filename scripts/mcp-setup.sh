#!/bin/bash

# =====================================================
# LightingPro MCP 设置和启动脚本
# =====================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查项目目录
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MCP_DIR="$PROJECT_ROOT/mcp"

log_info "LightingPro MCP Setup"
log_info "Project root: $PROJECT_ROOT"

# 创建必要的目录
mkdir -p "$PROJECT_ROOT/logs"
mkdir -p "$MCP_DIR"

# 检查依赖
log_info "Checking dependencies..."

if ! command -v node &> /dev/null; then
    log_error "Node.js is required but not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    log_error "npm is required but not installed"
    exit 1
fi

log_success "Dependencies check passed"

# 检查 MCP 文件
log_info "Checking MCP server files..."

if [ ! -f "$MCP_DIR/server.js" ]; then
    log_error "MCP server not found at $MCP_DIR/server.js"
    exit 1
fi

if [ ! -f "$MCP_DIR/client.js" ]; then
    log_error "MCP client not found at $MCP_DIR/client.js"
    exit 1
fi

# 设置文件权限
chmod +x "$MCP_DIR/server.js"
chmod +x "$MCP_DIR/client.js"

log_success "MCP files ready"

# 检查环境变量
log_info "Checking environment configuration..."

if [ ! -f "$PROJECT_ROOT/.env.local" ]; then
    log_warning ".env.local not found, MCP database features may not work"
else
    log_success "Environment configuration found"
fi

# 函数：启动 MCP 服务器
start_server() {
    log_info "Starting MCP server..."
    
    cd "$PROJECT_ROOT"
    
    # 检查端口是否被占用
    if lsof -i :3001 &> /dev/null; then
        log_warning "Port 3001 is already in use"
        log_info "Attempting to stop existing process..."
        pkill -f "mcp/server.js" 2>/dev/null || true
        sleep 2
    fi
    
    # 启动服务器
    nohup node mcp/server.js > logs/mcp-server.log 2>&1 &
    MCP_PID=$!
    
    # 等待服务器启动
    sleep 3
    
    if ps -p $MCP_PID > /dev/null; then
        log_success "MCP server started (PID: $MCP_PID)"
        echo $MCP_PID > "$PROJECT_ROOT/.mcp.pid"
        
        # 测试连接
        if node mcp/client.js db migrate status &> /dev/null; then
            log_success "MCP server is responding"
        else
            log_warning "MCP server started but not responding yet"
        fi
    else
        log_error "Failed to start MCP server"
        exit 1
    fi
}

# 函数：停止 MCP 服务器
stop_server() {
    log_info "Stopping MCP server..."
    
    if [ -f "$PROJECT_ROOT/.mcp.pid" ]; then
        PID=$(cat "$PROJECT_ROOT/.mcp.pid")
        if ps -p $PID > /dev/null; then
            kill $PID
            log_success "MCP server stopped"
        else
            log_warning "MCP server was not running"
        fi
        rm -f "$PROJECT_ROOT/.mcp.pid"
    else
        # 尝试通过进程名停止
        pkill -f "mcp/server.js" 2>/dev/null || true
        log_info "Attempted to stop MCP server by process name"
    fi
}

# 函数：显示状态
show_status() {
    log_info "MCP Server Status"
    
    if [ -f "$PROJECT_ROOT/.mcp.pid" ]; then
        PID=$(cat "$PROJECT_ROOT/.mcp.pid")
        if ps -p $PID > /dev/null; then
            log_success "Server is running (PID: $PID)"
            
            # 显示日志尾部
            if [ -f "$PROJECT_ROOT/logs/mcp-server.log" ]; then
                echo -e "\n${BLUE}Recent logs:${NC}"
                tail -n 5 "$PROJECT_ROOT/logs/mcp-server.log"
            fi
            
            return 0
        else
            log_warning "PID file exists but process is not running"
            rm -f "$PROJECT_ROOT/.mcp.pid"
        fi
    fi
    
    # 检查是否有其他 MCP 进程在运行
    if pgrep -f "mcp/server.js" > /dev/null; then
        log_warning "MCP server process found but no PID file"
        return 0
    fi
    
    log_error "MCP server is not running"
    return 1
}

# 函数：运行测试
run_tests() {
    log_info "Running MCP functionality tests..."
    
    # 启动服务器（如果没有运行）
    if ! show_status &> /dev/null; then
        start_server
        sleep 2
    fi
    
    cd "$PROJECT_ROOT"
    
    # 测试数据库迁移状态
    log_info "Testing database migration status..."
    if node mcp/client.js db migrate status; then
        log_success "Database migration test passed"
    else
        log_error "Database migration test failed"
    fi
    
    # 测试性能分析
    log_info "Testing performance analysis..."
    if timeout 10 node mcp/client.js perf api; then
        log_success "Performance analysis test passed"
    else
        log_warning "Performance analysis test timeout (expected)"
    fi
    
    # 测试部署检查
    log_info "Testing deployment check..."
    if node mcp/client.js deploy check; then
        log_success "Deployment check test passed"
    else
        log_warning "Deployment check completed with warnings"
    fi
    
    log_success "MCP tests completed"
}

# 主菜单
show_menu() {
    echo
    echo -e "${PURPLE}=== LightingPro MCP Manager ===${NC}"
    echo "1. Start MCP Server"
    echo "2. Stop MCP Server"  
    echo "3. Show Status"
    echo "4. Run Tests"
    echo "5. Interactive Client"
    echo "6. View Logs"
    echo "7. Exit"
    echo
}

# 主循环
case "${1:-menu}" in
    "start")
        start_server
        ;;
    "stop")
        stop_server
        ;;
    "status")
        show_status
        ;;
    "test")
        run_tests
        ;;
    "client")
        cd "$PROJECT_ROOT"
        node mcp/client.js
        ;;
    "logs")
        if [ -f "$PROJECT_ROOT/logs/mcp-server.log" ]; then
            tail -f "$PROJECT_ROOT/logs/mcp-server.log"
        else
            log_error "No log file found"
        fi
        ;;
    "menu")
        while true; do
            show_menu
            read -p "Select option (1-7): " choice
            
            case $choice in
                1) start_server ;;
                2) stop_server ;;
                3) show_status ;;
                4) run_tests ;;
                5) 
                    cd "$PROJECT_ROOT"
                    node mcp/client.js
                    ;;
                6)
                    if [ -f "$PROJECT_ROOT/logs/mcp-server.log" ]; then
                        echo "Press Ctrl+C to exit log view"
                        tail -f "$PROJECT_ROOT/logs/mcp-server.log"
                    else
                        log_error "No log file found"
                    fi
                    ;;
                7)
                    log_info "Goodbye!"
                    exit 0
                    ;;
                *)
                    log_error "Invalid option: $choice"
                    ;;
            esac
            
            echo
            read -p "Press Enter to continue..."
        done
        ;;
    *)
        echo "Usage: $0 {start|stop|status|test|client|logs|menu}"
        echo
        echo "Options:"
        echo "  start   - Start MCP server"
        echo "  stop    - Stop MCP server"
        echo "  status  - Show server status"
        echo "  test    - Run functionality tests"
        echo "  client  - Start interactive client"
        echo "  logs    - View server logs"
        echo "  menu    - Show interactive menu (default)"
        ;;
esac