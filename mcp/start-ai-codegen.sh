#!/bin/bash
# 🚀 AI增强代码生成器启动脚本

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[AI-CODEGEN]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[AI-CODEGEN]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AI-CODEGEN]${NC} $1"
}

log_error() {
    echo -e "${RED}[AI-CODEGEN]${NC} $1"
}

echo -e "${BLUE}"
echo "========================================"
echo "🧠 AI增强代码生成器启动器"
echo "========================================"
echo -e "${NC}"

# 项目根目录
PROJECT_ROOT="/Users/macbookpro/Documents/claude编码/claude练手/lighting-app"
MCP_DIR="$PROJECT_ROOT/mcp"

# 检查环境
log_info "检查运行环境..."

if ! command -v node &> /dev/null; then
    log_error "Node.js未安装"
    exit 1
fi

if [ ! -f "$MCP_DIR/enhanced-codegen-pro.js" ]; then
    log_error "AI代码生成器脚本不存在"
    exit 1
fi

log_success "环境检查通过"

# 创建必要目录
mkdir -p "$MCP_DIR/logs"
mkdir -p "$MCP_DIR/pids"

# 停止现有进程
if [ -f "$MCP_DIR/pids/ai-codegen.pid" ]; then
    old_pid=$(cat "$MCP_DIR/pids/ai-codegen.pid")
    if kill -0 $old_pid 2>/dev/null; then
        kill $old_pid
        log_info "停止现有AI代码生成器 (PID: $old_pid)"
    fi
    rm -f "$MCP_DIR/pids/ai-codegen.pid"
fi

# 启动AI增强代码生成器
log_info "启动AI增强代码生成器..."

cd "$PROJECT_ROOT"
nohup node "$MCP_DIR/enhanced-codegen-pro.js" > "$MCP_DIR/logs/ai-codegen.log" 2>&1 &
pid=$!

# 等待启动
sleep 2

# 检查进程状态
if kill -0 $pid 2>/dev/null; then
    echo $pid > "$MCP_DIR/pids/ai-codegen.pid"
    log_success "🎉 AI增强代码生成器启动成功！"
    log_info "进程ID: $pid"
    log_info "日志文件: mcp/logs/ai-codegen.log"
    
    echo ""
    log_success "🧠 可用的AI工具:"
    echo "  • ai_analyze_code      - 智能代码分析"
    echo "  • ai_generate_code     - AI代码生成"
    echo "  • ai_refactor_code     - 智能重构"
    echo "  • generate_feature     - 完整功能生成"
    echo "  • apply_design_patterns- 设计模式应用"
    echo "  • optimize_performance - 性能优化"
    
    echo ""
    log_info "🎯 快速测试:"
    echo "  node mcp/mcp-test-client.js"
    
    echo ""
    log_info "🎮 交互式演示:"
    echo "  node mcp/demo-intelligent-codegen.js"
    
else
    log_error "AI代码生成器启动失败"
    cat "$MCP_DIR/logs/ai-codegen.log"
    exit 1
fi