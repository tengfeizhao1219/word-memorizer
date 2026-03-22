# 🔧 后端文件说明

## 📁 目录结构

### 核心后端文件：
```
deploy-direct/                    # 🎯 核心云函数（必须部署）
├── translate/                   # 翻译函数
├── user-login/                  # 用户登录函数
├── word-list/                   # 单词列表函数
└── init-database/              # 数据库初始化函数
```

### 本地开发文件：
```
local-server/                    # 🖥️ 本地开发服务器（可选）
├── server.js                   # Express.js 服务器
└── test-api.js                 # API测试脚本
```

### 工具脚本：
```
tools/                          # 🔧 开发工具（可选）
├── analyze-error.js           # 错误分析工具
├── auto-test-code.js          # 自动测试工具
├── check-database-collections.js # 数据库检查工具
└── test_connection.js         # 连接测试工具
```

### 部署工具：
```
test-direct-config.js          # 🔧 配置测试工具
test-init-database.js          # 🗄️ 数据库初始化测试
update-cloud-functions-direct.js # ⚡ 云函数更新工具
tencent_cloud_config.md        # ☁️ 腾讯云配置指南
update-env-id.sh               # 🔄 环境ID更新脚本
start-local.sh                 # 🚀 本地启动脚本
```

## 🎯 部署优先级

### 必须部署（核心功能）：
1. **deploy-direct/** - 4个云函数
2. **环境变量配置** - 在腾讯云控制台

### 可选部署（增强功能）：
1. **local-server/** - 本地开发环境
2. **tools/** - 开发工具脚本

### 测试工具：
1. **test-direct-config.js** - 测试配置
2. **test-init-database.js** - 测试数据库

## 🔧 工具使用说明

### 测试云函数配置：
```bash
node test-direct-config.js
```

### 测试数据库初始化：
```bash
node test-init-database.js
```

### 启动本地服务器：
```bash
./start-local.sh
# 或
cd local-server && node server.js
```

### 更新云函数：
```bash
node update-cloud-functions-direct.js
```

## 📋 文件恢复记录

### 已恢复的核心文件：
- ✅ `deploy-direct/` - 4个云函数（核心）
- ✅ `local-server/` - 本地开发服务器
- ✅ 所有部署工具脚本

### 占位文件：
- 📝 `tools/` 目录中的工具文件为占位符
- 原始文件在清理过程中丢失
- 不影响核心功能部署

## 🚀 快速开始

### 1. 部署核心云函数：
```bash
# 使用 deploy-direct/ 中的4个函数
```

### 2. 配置环境变量：
在腾讯云控制台配置：
```
TENCENT_SECRET_ID = 你的SecretId
TENCENT_SECRET_KEY = 你的SecretKey
TENCENT_REGION = ap-shanghai
```

### 3. 测试部署：
```bash
node test-direct-config.js
node test-init-database.js
```

---
**后端文件已恢复，核心功能完整！** 🎉
