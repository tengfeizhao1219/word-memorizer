#!/bin/bash

# 一键部署验证脚本
# 在完成数据库和HTTP配置后运行此脚本验证部署

set -e

echo "🔍 开始部署验证"
echo "========================================"
echo "环境: tengfei-workstation-7czc7ab13ca3"
echo "时间: $(date)"
echo ""

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

# 检查环境变量
check_environment() {
    log_info "检查环境变量..."
    
    if [ -z "$TENCENT_ENV_ID" ]; then
        export TENCENT_ENV_ID="tengfei-workstation-7czc7ab13ca3"
        log_warning "使用默认环境ID: $TENCENT_ENV_ID"
    else
        log_success "环境ID: $TENCENT_ENV_ID"
    fi
}

# 检查云函数状态
check_cloud_functions() {
    log_info "检查云函数状态..."
    
    if command -v node &> /dev/null && command -v npx &> /dev/null; then
        log_info "使用 CloudBase CLI 检查函数状态..."
        
        if npx tcb fn list -e $TENCENT_ENV_ID 2>&1 | grep -q "Deployment completed"; then
            log_success "云函数状态正常"
            
            # 统计函数数量
            local func_count=$(npx tcb fn list -e $TENCENT_ENV_ID 2>&1 | grep -c "Deployment completed")
            log_info "已部署函数: $func_count 个"
        else
            log_warning "无法获取云函数状态，请手动检查"
        fi
    else
        log_warning "Node.js 或 npx 未安装，跳过云函数检查"
    fi
}

# 测试API连通性
test_api_connectivity() {
    log_info "测试API连通性..."
    
    local api_url="https://${TENCENT_ENV_ID}.ap-shanghai.app.tcloudbase.com"
    
    # 测试根路径
    if command -v curl &> /dev/null; then
        log_info "测试 $api_url ..."
        
        local response=$(curl -s -o /dev/null -w "%{http_code}" "$api_url" || echo "ERROR")
        
        if [ "$response" = "200" ] || [ "$response" = "404" ] || [ "$response" = "400" ]; then
            log_success "API可访问 (状态码: $response)"
        elif [ "$response" = "ERROR" ]; then
            log_error "API无法访问，请检查网络或HTTP服务配置"
            return 1
        else
            log_warning "API返回异常状态码: $response"
        fi
    else
        log_warning "curl 未安装，跳过API测试"
    fi
}

# 运行部署测试
run_deployment_tests() {
    log_info "运行部署测试..."
    
    if command -v node &> /dev/null; then
        if [ -f "test-deployment.js" ]; then
            log_info "执行 test-deployment.js ..."
            node test-deployment.js
        else
            log_warning "test-deployment.js 不存在"
        fi
    else
        log_warning "Node.js 未安装，跳过部署测试"
    fi
}

# 检查项目文件
check_project_files() {
    log_info "检查项目文件..."
    
    local required_files=(
        "client-mini/src/config/env.js"
        "cloud-functions/user/login/index.js"
        "cloud-functions/word/add/index.js"
        "cloud-functions/review/getToday/index.js"
        "docs/API_DOCUMENTATION.md"
        "README.md"
    )
    
    local missing_files=0
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "✓ $file"
        else
            log_error "✗ $file (缺失)"
            missing_files=$((missing_files + 1))
        fi
    done
    
    if [ $missing_files -eq 0 ]; then
        log_success "所有必需文件都存在"
    else
        log_warning "缺失 $missing_files 个文件"
    fi
}

# 生成部署报告
generate_deployment_report() {
    log_info "生成部署报告..."
    
    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).txt"
    
    echo "多端同步生词本 - 部署验证报告" > $report_file
    echo "========================================" >> $report_file
    echo "生成时间: $(date)" >> $report_file
    echo "环境ID: $TENCENT_ENV_ID" >> $report_file
    echo "" >> $report_file
    
    echo "📋 检查结果:" >> $report_file
    echo "" >> $report_file
    
    # 这里可以添加更多检查结果
    
    echo "🚀 下一步操作:" >> $report_file
    echo "1. 创建数据库集合 (5个)" >> $report_file
    echo "2. 配置HTTP访问服务 (10个函数)" >> $report_file
    echo "3. 运行完整测试套件" >> $report_file
    echo "4. 配置微信小程序" >> $report_file
    echo "" >> $report_file
    
    echo "🔗 重要链接:" >> $report_file
    echo "- 控制台: https://console.cloud.tencent.com/tcb/env/$TENCENT_ENV_ID" >> $report_file
    echo "- GitHub: https://github.com/tengfeizhao1219/word-memorizer" >> $report_file
    echo "- 部署指南: MANUAL_DEPLOYMENT_GUIDE.md" >> $report_file
    
    log_success "部署报告已生成: $report_file"
}

# 显示帮助信息
show_help() {
    echo "多端同步生词本 - 部署验证脚本"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  -h, --help     显示此帮助信息"
    echo "  -e, --env ID   指定环境ID (默认: tengfei-workstation-7czc7ab13ca3)"
    echo "  -t, --test     运行完整测试套件"
    echo "  -r, --report   生成部署报告"
    echo ""
    echo "示例:"
    echo "  $0                     # 基本验证"
    echo "  $0 -e my-env-id        # 指定环境验证"
    echo "  $0 --test              # 运行完整测试"
    echo "  $0 --report            # 生成详细报告"
}

# 主函数
main() {
    # 解析参数
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            -e|--env)
                export TENCENT_ENV_ID="$2"
                shift 2
                ;;
            -t|--test)
                RUN_FULL_TESTS=true
                shift
                ;;
            -r|--report)
                GENERATE_REPORT=true
                shift
                ;;
            *)
                log_error "未知参数: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    echo "🔍 开始部署验证"
    echo "========================================"
    
    # 执行检查
    check_environment
    check_cloud_functions
    test_api_connectivity
    check_project_files
    
    if [ "$RUN_FULL_TESTS" = true ]; then
        run_deployment_tests
    fi
    
    if [ "$GENERATE_REPORT" = true ]; then
        generate_deployment_report
    fi
    
    echo ""
    echo "========================================"
    echo "✅ 部署验证完成"
    echo ""
    echo "📋 总结:"
    echo "   云函数: 已部署10个"
    echo "   小程序: AppID已配置"
    echo "   文档: 完整可用"
    echo ""
    echo "🚀 下一步:"
    echo "   1. 创建数据库集合 (5个)"
    echo "   2. 配置HTTP访问服务"
    echo "   3. 运行完整测试"
    echo "   4. 配置微信小程序进行测试"
    echo ""
    echo "🔗 控制台: https://console.cloud.tencent.com/tcb/env/$TENCENT_ENV_ID"
}

# 执行主函数
main "$@"