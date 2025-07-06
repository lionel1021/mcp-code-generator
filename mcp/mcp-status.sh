#!/bin/bash
# 🔍 MCP服务器状态检查和快速启动脚本

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m'

echo -e "${PURPLE}"
echo "========================================"
echo "🔍 MCP增强代码生成器状态检查"
echo "========================================"
echo -e "${NC}"

echo -e "${BLUE}📊 当前状态:${NC}"

# 检查MCP SDK
if npm list @modelcontextprotocol/sdk &>/dev/null; then
    echo -e "  ${GREEN}✅ MCP SDK已安装${NC}"
else
    echo -e "  ${RED}❌ MCP SDK未安装${NC}"
    echo -e "  ${YELLOW}💡 运行: npm install @modelcontextprotocol/sdk${NC}"
fi

# 检查Node.js进程
node_processes=$(ps aux | grep "enhanced-codegen-pro\|smart-codegen\|server.js" | grep -v grep | wc -l)
if [ $node_processes -gt 0 ]; then
    echo -e "  ${GREEN}✅ MCP服务器进程运行中 ($node_processes 个)${NC}"
else
    echo -e "  ${YELLOW}⚠️  没有运行中的MCP服务器${NC}"
fi

# 检查日志文件
if [ -f "mcp/logs/ai-codegen.log" ]; then
    echo -e "  ${GREEN}✅ AI代码生成器日志存在${NC}"
    last_log=$(tail -1 mcp/logs/ai-codegen.log 2>/dev/null)
    if [[ $last_log == *"ready"* ]]; then
        echo -e "  ${GREEN}✅ AI代码生成器状态: 就绪${NC}"
    fi
else
    echo -e "  ${YELLOW}⚠️  AI代码生成器日志不存在${NC}"
fi

echo ""
echo -e "${BLUE}🚀 快速启动选项:${NC}"

echo "1. 🎮 交互式演示 (推荐新手)"
echo "   node mcp/demo-intelligent-codegen.js"

echo ""
echo "2. 🧪 AI功能测试 (推荐体验AI能力)"
echo "   node mcp/mcp-test-client.js"

echo ""
echo "3. ⚡ 代码生成测试 (快速验证)"
echo "   node mcp/test-generation.js"

echo ""
echo "4. 🛠️ 直接启动AI服务器"
echo "   node mcp/enhanced-codegen-pro.js"

echo ""
echo -e "${BLUE}💡 使用建议:${NC}"

if [ $node_processes -eq 0 ]; then
    echo -e "  ${YELLOW}🎯 建议先运行选项2体验AI增强功能${NC}"
    echo -e "  ${YELLOW}📖 然后尝试选项1了解完整功能${NC}"
else
    echo -e "  ${GREEN}🎉 MCP服务器运行中，可以直接使用！${NC}"
    echo -e "  ${GREEN}💻 建议在VS Code中配置MCP插件${NC}"
fi

echo ""
echo -e "${BLUE}📚 文档和帮助:${NC}"
echo "  📖 完整文档: cat mcp/README.md"
echo "  🔧 配置文件: mcp/mcp-config.json"
echo "  📊 日志查看: tail -f mcp/logs/*.log"

echo ""
echo -e "${PURPLE}🧠 AI增强特性:${NC}"
echo "  • 智能代码生成和优化"
echo "  • 实时质量分析和建议"
echo "  • 自动设计模式应用"
echo "  • 性能和安全性检查"

echo ""