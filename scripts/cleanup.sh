#!/bin/bash

# =====================================================
# LightingPro 项目清理脚本
# 清理缓存文件和临时文件以释放存储空间
# =====================================================

set -e

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log_info() {
    echo -e "${BLUE}[CLEANUP]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[CLEANUP]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[CLEANUP]${NC} $1"
}

# 获取目录大小
get_size() {
    if [ -d "$1" ]; then
        du -sh "$1" 2>/dev/null | cut -f1
    else
        echo "0B"
    fi
}

log_info "开始清理 LightingPro 项目文件"
log_info "项目路径: $PROJECT_ROOT"

cd "$PROJECT_ROOT"

# 记录清理前的大小
BEFORE_SIZE=$(get_size "$PROJECT_ROOT")
log_info "清理前项目大小: $BEFORE_SIZE"

echo

# 1. 清理 Next.js 缓存
log_info "清理 Next.js 缓存..."
if [ -d ".next/cache" ]; then
    CACHE_SIZE=$(get_size ".next/cache")
    rm -rf .next/cache/*
    log_success "已清理 Next.js 缓存 ($CACHE_SIZE)"
else
    log_warning "Next.js 缓存目录不存在"
fi

# 2. 清理 MCP 日志
log_info "清理 MCP 日志文件..."
if [ -d "logs" ]; then
    LOGS_SIZE=$(get_size "logs")
    find logs -name "*.log" -mtime +7 -delete 2>/dev/null || true
    log_success "已清理旧日志文件 ($LOGS_SIZE)"
else
    log_warning "日志目录不存在"
fi

# 3. 清理临时文件
log_info "清理临时文件..."
TEMP_FILES_REMOVED=0

# 删除 .DS_Store 文件
find . -name ".DS_Store" -delete 2>/dev/null && TEMP_FILES_REMOVED=$((TEMP_FILES_REMOVED + 1)) || true

# 删除临时文件
find . -name "*.tmp" -delete 2>/dev/null && TEMP_FILES_REMOVED=$((TEMP_FILES_REMOVED + 1)) || true
find . -name "*.temp" -delete 2>/dev/null && TEMP_FILES_REMOVED=$((TEMP_FILES_REMOVED + 1)) || true

log_success "已清理 $TEMP_FILES_REMOVED 个临时文件"

# 4. 清理 npm 缓存 (可选)
if [ "$1" = "--deep" ]; then
    log_info "执行深度清理..."
    
    # 清理 npm 缓存
    npm cache clean --force 2>/dev/null || true
    log_success "已清理 npm 缓存"
    
    # 重新安装依赖 (可选)
    if [ "$2" = "--reinstall" ]; then
        log_info "重新安装依赖..."
        rm -rf node_modules package-lock.json
        npm install
        log_success "依赖重新安装完成"
    fi
fi

# 5. 清理数据库备份 (保留最新5个)
log_info "清理旧的数据库备份..."
if [ -d "backups" ]; then
    BACKUP_COUNT=$(find backups -name "*.sql" 2>/dev/null | wc -l)
    if [ "$BACKUP_COUNT" -gt 5 ]; then
        find backups -name "*.sql" -type f | sort | head -n -5 | xargs rm -f
        log_success "已清理旧备份文件，保留最新5个"
    else
        log_warning "备份文件数量正常 ($BACKUP_COUNT 个)"
    fi
fi

# 记录清理后的大小
echo
AFTER_SIZE=$(get_size "$PROJECT_ROOT")
log_success "清理完成！"
log_info "清理前: $BEFORE_SIZE"
log_info "清理后: $AFTER_SIZE"

# 计算节省的空间
BEFORE_BYTES=$(du -s "$PROJECT_ROOT" 2>/dev/null | cut -f1)
AFTER_BYTES=$(du -s "$PROJECT_ROOT" 2>/dev/null | cut -f1)
SAVED_KB=$((BEFORE_BYTES - AFTER_BYTES))

if [ "$SAVED_KB" -gt 0 ]; then
    SAVED_MB=$((SAVED_KB / 1024))
    log_success "节省存储空间: ${SAVED_MB}MB"
else
    log_info "存储空间变化不明显"
fi

echo
log_info "清理建议:"
echo "  - 定期运行: ./scripts/cleanup.sh"
echo "  - 深度清理: ./scripts/cleanup.sh --deep"
echo "  - 重装依赖: ./scripts/cleanup.sh --deep --reinstall"