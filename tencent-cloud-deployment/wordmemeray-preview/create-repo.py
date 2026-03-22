#!/usr/bin/env python3
"""
通过GitHub API创建仓库并推送WordMemeray预览页面
"""

import os
import sys
import json
import subprocess
import requests

def check_git_config():
    """检查Git配置"""
    print("🔍 检查Git配置...")
    try:
        # 检查用户名
        result = subprocess.run(['git', 'config', 'user.name'], 
                              capture_output=True, text=True)
        username = result.stdout.strip()
        
        # 检查邮箱
        result = subprocess.run(['git', 'config', 'user.email'], 
                              capture_output=True, text=True)
        email = result.stdout.strip()
        
        if not username or not email:
            print("⚠️  Git用户信息未配置")
            return False
        
        print(f"✅ Git配置正常")
        print(f"   用户名: {username}")
        print(f"   邮箱: {email}")
        return True
        
    except Exception as e:
        print(f"❌ Git配置检查失败: {e}")
        return False

def create_github_repo_via_cli(repo_name, description):
    """通过GitHub CLI创建仓库"""
    print(f"\n🚀 尝试通过GitHub CLI创建仓库: {repo_name}")
    
    try:
        # 检查是否安装gh
        result = subprocess.run(['which', 'gh'], capture_output=True)
        if result.returncode != 0:
            print("❌ GitHub CLI (gh) 未安装")
            return None
        
        # 创建仓库
        cmd = [
            'gh', 'repo', 'create', repo_name,
            '--description', description,
            '--public',
            '--source=.',
            '--remote=origin',
            '--push'
        ]
        
        print(f"📦 执行命令: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print(f"✅ 仓库创建成功: {repo_name}")
            return f"https://github.com/{username}/{repo_name}"
        else:
            print(f"❌ 仓库创建失败: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ GitHub CLI操作失败: {e}")
        return None

def create_github_repo_manual():
    """提供手动创建仓库的指引"""
    print("\n📋 手动创建GitHub仓库指引:")
    print("=" * 50)
    print("1. 访问 https://github.com/new")
    print("2. 创建新仓库:")
    print("   - 仓库名称: WordMemeray-preview")
    print("   - 描述: WordMemeray风格首页预览")
    print("   - 选择: Public (公开)")
    print("   - 不要初始化README、.gitignore或license")
    print("3. 创建仓库后，复制仓库URL")
    print("4. 返回这里，我将帮你推送代码")
    print("=" * 50)
    
    repo_url = input("\n📝 请输入仓库URL (例如: https://github.com/用户名/WordMemeray-preview): ").strip()
    return repo_url

def push_to_github(repo_url):
    """推送代码到GitHub"""
    print(f"\n🚀 推送代码到GitHub: {repo_url}")
    
    try:
        # 添加远程仓库
        subprocess.run(['git', 'remote', 'add', 'origin', repo_url], check=True)
        print("✅ 远程仓库已添加")
        
        # 推送代码
        print("📤 推送代码中...")
        result = subprocess.run(['git', 'push', '-u', 'origin', 'master'], 
                              capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ 代码推送成功!")
            
            # 提取用户名和仓库名
            if 'github.com' in repo_url:
                parts = repo_url.rstrip('/').split('/')
                if len(parts) >= 2:
                    username = parts[-2]
                    repo_name = parts[-1]
                    pages_url = f"https://{username}.github.io/{repo_name}/"
                    print(f"\n🌐 GitHub Pages URL: {pages_url}")
                    return pages_url
                    
        else:
            print(f"❌ 代码推送失败: {result.stderr}")
            return None
            
    except Exception as e:
        print(f"❌ 推送失败: {e}")
        return None

def enable_github_pages():
    """启用GitHub Pages"""
    print("\n⚙️  启用GitHub Pages...")
    
    # 提供手动启用指引
    print("📋 手动启用GitHub Pages:")
    print("=" * 50)
    print("1. 访问你的GitHub仓库")
    print("2. 点击 Settings (设置)")
    print("3. 在左侧菜单选择 Pages")
    print("4. 在 Source 部分选择:")
    print("   - Branch: master")
    print("   - Folder: / (root)")
    print("5. 点击 Save (保存)")
    print("6. 等待几分钟，GitHub Pages会自动部署")
    print("=" * 50)
    
    return True

def main():
    print("🚀 WordMemeray预览页面GitHub部署工具")
    print("=" * 50)
    
    # 检查Git配置
    if not check_git_config():
        print("\n🔧 请先配置Git用户信息:")
        print("   git config --global user.name \"你的名字\"")
        print("   git config --global user.email \"你的邮箱\"")
        return
    
    repo_name = "WordMemeray-preview"
    description = "WordMemeray风格首页预览 - 现代化单词学习界面"
    
    print(f"\n🎯 目标仓库: {repo_name}")
    print(f"📝 描述: {description}")
    
    # 尝试自动创建仓库
    repo_url = create_github_repo_via_cli(repo_name, description)
    
    if not repo_url:
        # 手动创建
        repo_url = create_github_repo_manual()
    
    if repo_url:
        # 推送代码
        pages_url = push_to_github(repo_url)
        
        if pages_url:
            print(f"\n🎉 部署成功!")
            print(f"🌐 预览页面URL: {pages_url}")
            print(f"📁 仓库URL: {repo_url}")
            
            # 启用GitHub Pages
            enable_github_pages()
            
            print(f"\n💡 提示:")
            print(f"1. 访问 {pages_url} 查看预览页面")
            print(f"2. 可能需要等待1-2分钟GitHub Pages部署完成")
            print(f"3. 刷新页面查看最新效果")
        else:
            print("\n❌ 部署失败，请检查错误信息")
    else:
        print("\n❌ 仓库创建失败")

if __name__ == "__main__":
    main()