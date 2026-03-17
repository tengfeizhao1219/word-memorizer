#!/bin/bash

# 多端同步生词本 - 部署脚本
# 作者: tengfeizhao1219
# 版本: 1.0.0

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查命令是否存在
check_command() {
    if ! command -v $1 &> /dev/null; then
        log_error "$1 未安装，请先安装 $1"
        exit 1
    fi
}

# 显示帮助信息
show_help() {
    echo "多端同步生词本 - 部署脚本"
    echo ""
    echo "用法: ./deploy.sh [选项]"
    echo ""
    echo "选项:"
    echo "  init         初始化项目环境"
    echo "  build        构建项目"
    echo "  deploy       部署到云开发"
    echo "  all          执行所有步骤 (init -> build -> deploy)"
    echo "  help         显示帮助信息"
    echo ""
    echo "示例:"
    echo "  ./deploy.sh init     # 初始化环境"
    echo "  ./deploy.sh all      # 执行完整部署流程"
}

# 初始化项目环境
init_project() {
    log_info "开始初始化项目环境..."
    
    # 检查必要的命令
    check_command node
    check_command npm
    
    # 检查Node.js版本
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_VERSION="16.0.0"
    
    if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
        log_error "Node.js 版本需要 >= $REQUIRED_VERSION，当前版本: $NODE_VERSION"
        exit 1
    fi
    
    log_success "Node.js 版本检查通过: $NODE_VERSION"
    
    # 安装小程序依赖
    log_info "安装小程序端依赖..."
    cd client-mini
    npm install
    cd ..
    
    # 安装Web端依赖
    log_info "安装Web端依赖..."
    cd client-web
    npm install
    cd ..
    
    # 安装云函数依赖
    log_info "安装云函数依赖..."
    cd cloud-functions
    find . -name "package.json" -type f | while read pkg; do
        dir=$(dirname "$pkg")
        log_info "安装依赖: $dir"
        cd "$dir"
        npm install
        cd - > /dev/null
    done
    cd ..
    
    log_success "项目环境初始化完成！"
}

# 构建项目
build_project() {
    log_info "开始构建项目..."
    
    # 构建小程序
    log_info "构建小程序端..."
    cd client-mini
    npm run build
    cd ..
    
    # 构建Web端
    log_info "构建Web端..."
    cd client-web
    npm run build
    cd ..
    
    log_success "项目构建完成！"
}

# 部署到云开发
deploy_to_cloudbase() {
    log_info "开始部署到云开发..."
    
    # 检查是否安装了 cloudbase-cli
    if ! command -v cloudbase &> /dev/null; then
        log_warning "cloudbase-cli 未安装，尝试安装..."
        npm install -g @cloudbase/cli
    fi
    
    # 检查是否登录
    if ! cloudbase login --check; then
        log_warning "未登录云开发，请先登录..."
        cloudbase login
    fi
    
    # 部署云函数
    log_info "部署云函数..."
    cd cloud-functions
    cloudbase functions:deploy user -e your-env-id
    cloudbase functions:deploy word -e your-env-id
    cloudbase functions:deploy review -e your-env-id
    cloudbase functions:deploy sync -e your-env-id
    cd ..
    
    # 部署数据库
    log_info "初始化数据库..."
    node database/init.js
    
    # 部署静态网站（Web端）
    log_info "部署Web端..."
    cd client-web
    cloudbase hosting:deploy dist -e your-env-id
    cd ..
    
    log_success "部署完成！"
}

# 主函数
main() {
    case "$1" in
        "init")
            init_project
            ;;
        "build")
            build_project
            ;;
        "deploy")
            deploy_to_cloudbase
            ;;
        "all")
            init_project
            build_project
            deploy_to_cloudbase
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "未知选项: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
if [ $# -eq 0 ]; then
    show_help
    exit 0
fi

main "$1"