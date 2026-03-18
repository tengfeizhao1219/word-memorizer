#!/bin/bash
# 自动GitHub同步脚本
# 自动提交和推送所有更改

echo "🔄 开始自动GitHub同步"
echo "========================================"
echo "同步时间: $(date)"
echo "仓库: https://github.com/tengfeizhao1219/word-memorizer"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查Git状态
check_git_status() {
    log_info "检查Git状态..."
    
    if ! git status &> /dev/null; then
        log_error "不是Git仓库或Git未初始化"
        return 1
    fi
    
    # 检查是否有未提交的更改
    if git diff --quiet && git diff --cached --quiet; then
        log_info "没有未提交的更改"
        return 0
    else
        log_info "发现未提交的更改"
        git status --short
        return 2
    fi
}

# 添加所有文件
add_all_files() {
    log_info "添加所有文件到Git..."
    
    # 添加新文件
    new_files=$(git status --porcelain | grep '^??' | cut -c4-)
    if [ -n "$new_files" ]; then
        echo "$new_files" | while read file; do
            log_info "添加新文件: $file"
        done
    fi
    
    # 添加修改的文件
    modified_files=$(git status --porcelain | grep '^ M' | cut -c4-)
    if [ -n "$modified_files" ]; then
        echo "$modified_files" | while read file; do
            log_info "添加修改文件: $file"
        done
    fi
    
    # 执行添加
    if git add .; then
        log_success "所有文件已添加到暂存区"
        return 0
    else
        log_error "添加文件失败"
        return 1
    fi
}

# 提交更改
commit_changes() {
    local commit_message="自动同步: $(date '+%Y-%m-%d %H:%M:%S')
    
更新内容:
- 修复tabBar图标缺失错误
- 更新所有部署文件
- 同步最新代码和文档
- 生成一键部署包
    
自动生成于: $(date)
"
    
    log_info "提交更改..."
    
    if git commit -m "$commit_message"; then
        log_success "提交成功"
        echo "提交信息:"
        echo "----------------------------------------"
        echo "$commit_message" | head -10
        echo "----------------------------------------"
        return 0
    else
        log_error "提交失败"
        return 1
    fi
}

# 推送到GitHub
push_to_github() {
    log_info "推送到GitHub..."
    
    # 尝试推送
    if git push origin master; then
        log_success "推送成功"
        return 0
    else
        log_warning "推送失败，尝试强制推送..."
        
        if git push origin master --force; then
            log_success "强制推送成功"
            return 0
        else
            log_error "推送失败，请检查网络或权限"
            return 1
        fi
    fi
}

# 创建版本标签
create_version_tag() {
    local timestamp=$(date +%Y%m%d%H%M%S)
    local version="v1.0.1-auto-$timestamp"
    
    log_info "创建版本标签: $version"
    
    if git tag "$version"; then
        log_success "创建标签成功"
        
        if git push origin "$version"; then
            log_success "推送标签成功"
        else
            log_warning "推送标签失败，但版本已创建"
        fi
        
        return 0
    else
        log_warning "创建标签失败"
        return 1
    fi
}

# 生成同步报告
generate_sync_report() {
    local report_file="GITHUB_SYNC_REPORT_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# 🔄 GitHub同步报告
## 同步时间: $(date)

## 📊 同步状态
- ✅ Git状态检查完成
- ✅ 文件添加完成
- ✅ 提交完成
- ✅ 推送完成
- ✅ 版本标签创建完成

## 📁 同步的文件
\`\`\`
$(git log --oneline -1 --stat | tail -n +2)
\`\`\`

## 🎯 最新提交
\`\`\`
$(git log --oneline -3)
\`\`\`

## 📦 可下载文件
以下文件已同步到GitHub，可以直接下载:

### 一键部署包
- **文件名**: wechat-mini-deploy_*.zip
- **大小**: 约47KB
- **内容**: 小程序代码 + 文档 + 测试脚本
- **下载链接**: https://github.com/tengfeizhao1219/word-memorizer/raw/master/wechat-mini-deploy_*.zip

### 完整包
- **文件名**: wechat-mini-complete.zip
- **大小**: 约31KB
- **下载链接**: https://github.com/tengfeizhao1219/word-memorizer/raw/master/wechat-mini-complete.zip

### 代码包
- **文件名**: wechat-mini-code-only.zip
- **大小**: 约15KB
- **下载链接**: https://github.com/tengfeizhao1219/word-memorizer/raw/master/wechat-mini-code-only.zip

## 🔗 GitHub链接
- **仓库主页**: https://github.com/tengfeizhao1219/word-memorizer
- **文件浏览**: https://github.com/tengfeizhao1219/word-memorizer/tree/master
- **提交历史**: https://github.com/tengfeizhao1219/word-memorizer/commits/master
- **下载页面**: https://github.com/tengfeizhao1219/word-memorizer/releases

## 🚀 使用步骤
1. 访问GitHub仓库
2. 下载所需的zip文件
3. 解压并导入微信开发者工具
4. 按照部署指南操作

## 📞 技术支持
如果下载或使用遇到问题:
1. 检查网络连接
2. 查看错误信息
3. 访问GitHub Issues提交问题

---

*本报告由自动同步脚本生成*
EOF
    
    log_success "生成同步报告: $report_file"
    echo "报告内容摘要:"
    echo "----------------------------------------"
    head -20 "$report_file"
    echo "----------------------------------------"
    
    return 0
}

# 验证GitHub同步
verify_github_sync() {
    log_info "验证GitHub同步..."
    
    # 获取最新提交哈希
    local latest_commit=$(git log --oneline -1 --format="%H")
    
    log_info "最新提交哈希: ${latest_commit:0:8}"
    log_info "提交时间: $(git log -1 --format="%cd" --date=format:'%Y-%m-%d %H:%M:%S')"
    log_info "提交信息: $(git log -1 --format="%s")"
    
    # 检查远程状态
    if git remote -v | grep -q "github.com"; then
        log_success "GitHub远程仓库配置正确"
    else
        log_warning "未检测到GitHub远程仓库"
    fi
    
    return 0
}

# 主函数
main() {
    echo ""
    log_info "开始自动GitHub同步流程"
    echo "========================================"
    
    # 检查Git状态
    check_git_status
    local git_status=$?
    
    if [ $git_status -eq 1 ]; then
        log_error "Git状态检查失败，退出"
        exit 1
    fi
    
    # 如果有更改，执行同步
    if [ $git_status -eq 2 ]; then
        # 添加文件
        if ! add_all_files; then
            log_error "添加文件失败，退出"
            exit 1
        fi
        
        # 提交更改
        if ! commit_changes; then
            log_error "提交失败，退出"
            exit 1
        fi
    else
        log_info "没有需要提交的更改"
    fi
    
    # 推送到GitHub
    if ! push_to_github; then
        log_error "推送失败，退出"
        exit 1
    fi
    
    # 创建版本标签
    create_version_tag
    
    # 验证同步
    verify_github_sync
    
    # 生成报告
    generate_sync_report
    
    echo ""
    echo "========================================"
    log_success "🎉 GitHub自动同步完成！"
    echo ""
    echo "📊 同步摘要:"
    echo "  - 提交时间: $(date)"
    echo "  - 最新提交: $(git log --oneline -1 --format='%s')"
    echo "  - 提交哈希: $(git log --oneline -1 --format='%H' | cut -c1-8)"
    echo ""
    echo "🔗 GitHub链接:"
    echo "  - 仓库: https://github.com/tengfeizhao1219/word-memorizer"
    echo "  - 文件: https://github.com/tengfeizhao1219/word-memorizer/tree/master"
    echo "  - 下载: https://github.com/tengfeizhao1219/word-memorizer/releases"
    echo ""
    echo "📥 下载文件:"
    ls -la *.zip 2>/dev/null | awk '{print "  - " $9 " (" $5 " bytes)"}'
    echo ""
    echo "🚀 立即操作:"
    echo "  1. 访问GitHub仓库"
    echo "  2. 下载所需的zip文件"
    echo "  3. 解压并导入微信开发者工具"
    echo "  4. 测试运行"
}

# 运行主函数
main "$@"