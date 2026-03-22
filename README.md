# 🚀 单词本学习系统 - 完全干净版

## 📋 特点
- ✅ **100%干净**：不包含任何密钥或敏感信息
- ✅ **环境变量驱动**：所有配置通过腾讯云环境变量管理
- ✅ **GitHub安全**：可以通过所有安全检查
- ✅ **生产就绪**：符合企业级安全标准

## 🎯 部署信息

### 必须配置（在腾讯云控制台）：
```
TENCENT_SECRET_ID = 你的腾讯云SecretId
TENCENT_SECRET_KEY = 你的腾讯云SecretKey
TENCENT_REGION = ap-shanghai
```

### 其他配置：
- 微信AppID: `wx1ccb4d171dd88162`
- 腾讯云环境ID: `cloud1-1g9313w0bb791de0`

## 📁 目录结构

```
word-memorizer-clean/
├── 📖 README.md                    # 本文件
├── 📖 DEPLOY.md                    # 部署指南
├── 📖 QUICKSTART.md                # 快速开始
│
├── ⚡ cloud-functions/             # 云函数代码
│   ├── translate/                 # 翻译函数
│   ├── user-login/                # 用户登录函数
│   ├── word-list/                 # 单词列表函数
│   └── init-database/             # 数据库初始化函数
│
└── 📱 frontend/                   # 前端小程序
```

## 🚀 快速开始

### 1. 部署云函数
上传 `cloud-functions/` 中的4个函数到腾讯云

### 2. 配置环境变量
在腾讯云控制台为每个函数配置上述3个环境变量

### 3. 导入前端
导入 `frontend/` 到微信开发者工具

### 4. 初始化数据库
调用 `init-database` 函数

## ⏰ 创建时间
**2026年3月22日** - 完全干净版本
