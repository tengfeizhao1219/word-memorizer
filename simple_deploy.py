#!/usr/bin/env python3
"""
简单部署脚本 - 腾讯云云函数部署
只需要你扫码登录一次，然后自动部署所有云函数
"""

import os
import sys
import subprocess
import json
from pathlib import Path

# 项目路径
PROJECT_DIR = Path(__file__).parent.absolute()
CLOUD_FUNCTIONS_DIR = PROJECT_DIR / "cloud-functions"

# 需要部署的云函数列表
CLOUD_FUNCTIONS = [
    {
        "name": "translate",
        "path": "translate",
        "description": "翻译功能（最高优先级）"
    },
    {
        "name": "login",
        "path": "user/login",
        "description": "用户登录功能"
    },
    {
        "name": "word-add",
        "path": "word/add",
        "description": "添加单词功能"
    },
    {
        "name": "word-list",
        "path": "word/list",
        "description": "单词列表功能"
    },
    {
        "name": "word-delete",
        "path": "word/delete",
        "description": "删除单词功能"
    },
    {
        "name": "word-update",
        "path": "word/update",
        "description": "更新单词功能"
    },
    {
        "name": "review",
        "path": "review",
        "description": "复习功能"
    },
    {
        "name": "sync",
        "path": "sync",
        "description": "同步功能"
    }
]

# 环境变量配置
ENVIRONMENT_VARIABLES = {
    "TENCENT_SECRET_ID": "AKIDPimcCajdU7VfaHKBnBKDr673oNj060h9",
    "TENCENT_SECRET_KEY": "LSN7g192h7JICtPhlcFdmgNq56uQjmbB",
    "TENCENT_REGION": "ap-shanghai",
    "WECHAT_APP_ID": "wx1ccb4d171dd88162",
    "WECHAT_APP_KEY": "101675fa960ac80c09dd2bf7273c7513"
}

def check_tools():
    """检查必要工具是否安装"""
    print("🔧 检查必要工具...")
    
    tools = {
        "npm": "Node.js包管理器",
        "tcb": "腾讯云CloudBase CLI"
    }
    
    all_installed = True
    
    for tool, description in tools.items():
        try:
            subprocess.run([tool, "--version"], capture_output=True, check=True)
            print(f"  ✅ {tool} - {description}")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"  ❌ {tool} - 未安装")
            all_installed = False
    
    return all_installed

def install_tcb():
    """安装CloudBase CLI"""
    print("📦 安装CloudBase CLI...")
    try:
        subprocess.run(["npm", "install", "-g", "@cloudbase/cli"], check=True)
        print("  ✅ CloudBase CLI安装成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ 安装失败: {e}")
        return False

def login_tencent_cloud():
    """登录腾讯云（需要扫码）"""
    print("🔐 登录腾讯云...")
    print("  请使用微信扫描二维码登录")
    print("  如果已经登录过，可以跳过此步骤")
    
    try:
        result = subprocess.run(["tcb", "login"], capture_output=True, text=True)
        
        if "登录成功" in result.stdout or "already logged in" in result.stdout.lower():
            print("  ✅ 登录成功")
            return True
        else:
            print("  ⚠️  登录状态未知，请手动检查")
            print(f"  输出: {result.stdout[:200]}...")
            return False
    except subprocess.CalledProcessError as e:
        print(f"  ❌ 登录失败: {e}")
        return False

def get_environment_id():
    """获取或设置环境ID"""
    target_env = "tengfei-workspace-7ef9ma8b7670ea"
    
    print(f"🌐 目标环境ID: {target_env}")
    
    # 检查环境是否存在
    try:
        result = subprocess.run(["tcb", "env", "list"], capture_output=True, text=True, check=True)
        
        if target_env in result.stdout:
            print(f"  ✅ 环境 {target_env} 已存在")
            return target_env
        else:
            print(f"  ⚠️  环境 {target_env} 未找到")
            print("  请选择:")
            print("  1. 使用现有环境")
            print("  2. 创建新环境")
            print("  3. 继续使用目标环境ID（可能失败）")
            
            choice = input("  请输入选择 (1/2/3): ").strip()
            
            if choice == "1":
                # 显示现有环境
                print("现有环境:")
                print(result.stdout)
                env_id = input("请输入环境ID: ").strip()
                return env_id
            elif choice == "2":
                # 创建新环境
                env_name = input("请输入环境名称: ").strip()
                subprocess.run(["tcb", "env", "create", env_name], check=True)
                return env_name
            else:
                # 继续使用目标环境ID
                return target_env
                
    except subprocess.CalledProcessError:
        print("  ⚠️  无法获取环境列表，使用目标环境ID")
        return target_env

def install_dependencies(func_path):
    """安装云函数依赖"""
    func_dir = CLOUD_FUNCTIONS_DIR / func_path
    
    if not (func_dir / "package.json").exists():
        print(f"  ⚠️  {func_path} 没有package.json，跳过依赖安装")
        return True
    
    print(f"  📦 安装 {func_path} 依赖...")
    
    try:
        subprocess.run(["npm", "install"], cwd=func_dir, check=True, capture_output=True)
        print(f"  ✅ {func_path} 依赖安装成功")
        return True
    except subprocess.CalledProcessError as e:
        print(f"  ❌ {func_path} 依赖安装失败: {e}")
        return False

def deploy_function(func_name, func_path, env_id):
    """部署单个云函数"""
    func_dir = CLOUD_FUNCTIONS_DIR / func_path
    
    if not func_dir.exists():
        print(f"  ⚠️  {func_path} 目录不存在，跳过")
        return False
    
    print(f"  🚀 部署 {func_name} ({func_path})...")
    
    try:
        # 构建部署命令
        cmd = [
            "tcb", "functions:deploy", func_name,
            "-e", env_id,
            "--path", str(func_dir)
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        if "success" in result.stdout.lower() or "成功" in result.stdout:
            print(f"  ✅ {func_name} 部署成功")
            return True
        else:
            print(f"  ⚠️  {func_name} 部署可能有问题")
            print(f"  输出: {result.stdout[:200]}...")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"  ❌ {func_name} 部署失败: {e}")
        if e.stderr:
            print(f"  错误: {e.stderr[:200]}...")
        return False

def set_environment_variables(env_id):
    """设置环境变量（需要在控制台手动配置）"""
    print("⚙️  环境变量配置指南:")
    print("=" * 50)
    
    for key, value in ENVIRONMENT_VARIABLES.items():
        print(f"{key} = {value}")
    
    print("=" * 50)
    print("")
    print("📋 需要在腾讯云控制台手动配置以上环境变量:")
    print("  1. 访问: https://console.cloud.tencent.com/tcb")
    print(f"  2. 选择环境: {env_id}")
    print("  3. 进入'环境配置' -> '环境变量'")
    print("  4. 添加上面的变量")
    print("  5. 保存并重新部署云函数")
    print("")

def test_deployment(env_id):
    """测试部署结果"""
    print("🧪 测试部署结果...")
    
    # 测试翻译云函数
    print("  测试翻译云函数...")
    try:
        test_data = json.dumps({
            "text": "hello",
            "source": "en",
            "target": "zh"
        })
        
        cmd = [
            "tcb", "functions:invoke", "translate",
            "-e", env_id,
            "--params", test_data
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("  ✅ 翻译云函数调用成功")
            try:
                response = json.loads(result.stdout)
                print(f"  响应: {json.dumps(response, ensure_ascii=False, indent=2)[:200]}...")
            except:
                print(f"  响应: {result.stdout[:200]}...")
        else:
            print(f"  ❌ 翻译云函数调用失败: {result.stderr[:200]}...")
            
    except Exception as e:
        print(f"  ⚠️  测试失败: {e}")

def main():
    """主函数"""
    print("🚀 腾讯云云函数自动部署脚本")
    print("=" * 50)
    
    # 1. 检查工具
    if not check_tools():
        print("安装必要工具...")
        if not install_tcb():
            print("❌ 工具安装失败，请手动安装:")
            print("  npm install -g @cloudbase/cli")
            return
    
    # 2. 登录腾讯云
    if not login_tencent_cloud():
        print("⚠️  登录失败，请手动登录: tcb login")
        # 继续执行，可能已经登录
    
    # 3. 获取环境ID
    env_id = get_environment_id()
    print(f"使用环境ID: {env_id}")
    
    # 4. 部署云函数
    print("")
    print("📦 开始部署云函数...")
    print("-" * 50)
    
    deployed_count = 0
    total_count = len(CLOUD_FUNCTIONS)
    
    for i, func in enumerate(CLOUD_FUNCTIONS, 1):
        print(f"[{i}/{total_count}] {func['description']}")
        
        # 安装依赖
        install_dependencies(func["path"])
        
        # 部署函数
        if deploy_function(func["name"], func["path"], env_id):
            deployed_count += 1
        
        print("")
    
    # 5. 环境变量配置指南
    set_environment_variables(env_id)
    
    # 6. 测试部署
    test_deployment(env_id)
    
    # 7. 总结
    print("")
    print("🎉 部署完成!")
    print("=" * 50)
    print(f"成功部署: {deployed_count}/{total_count} 个云函数")
    print("")
    print("📋 下一步操作:")
    print("  1. 在腾讯云控制台配置环境变量（必须）")
    print("  2. 在微信开发者工具中测试翻译功能")
    print("  3. 创建数据库集合（如果需要）")
    print("  4. 运行完整测试")
    print("")
    print("💡 提示: 环境变量配置后需要重新部署云函数才能生效")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  用户中断部署")
    except Exception as e:
        print(f"\n❌ 部署过程中出现错误: {e}")
        import traceback
        traceback.print_exc()