# 📚 生词本 - 智能单词记忆小程序

基于艾宾浩斯记忆曲线的智能单词记忆工具，帮助用户科学、高效地记忆单词。

## 🚀 快速开始

### 1. 下载项目
```bash
git clone https://github.com/tengfeizhao1219/word-memorizer.git
cd word-memorizer
```

### 2. 导入到微信开发者工具
1. 打开微信开发者工具
2. 点击「导入项目」
3. 选择目录: `word-memorizer/client-mini-wechat`
4. AppID: `wx1ccb4d171dd88162`
5. 项目名称: 生词本
6. 点击「导入」

### 3. 配置腾讯云环境
1. 环境ID: `tengfei-workstation-7czc7ab13ca3`
2. 地域: `ap-shanghai`
3. 确保数据库集合已创建（5个）

### 4. 运行测试
1. 点击「编译」按钮
2. 在控制台测试连接
3. 验证基本功能

## 📁 项目结构

```
word-memorizer/
├── 📱 client-mini-wechat/      # 微信小程序原生版本（主版本）
├── 📱 client-mini/            # Uni-app版本（备用）
├── ☁️ cloud-functions/        # 腾讯云云函数
├── 🗄️ database/              # 数据库配置
├── 📚 docs/                  # 所有文档和指南
├── 🔧 scripts/               # 工具脚本
├── 🧪 tests/                 # 测试代码
└── 📄 项目配置文件
```

详细结构说明请查看 [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)

## 📚 文档目录

所有文档都集中在 `docs/` 目录下：

### 使用指南 (`docs/guides/`)
- [快速开始指南](docs/guides/QUICK_START.md)
- [用户使用手册](docs/guides/USER_GUIDE.md)
- [开发者指南](docs/guides/DEVELOPER_GUIDE.md)
- [常见问题解答](docs/guides/FAQ.md)

### 部署文档 (`docs/deployment/`)
- [部署检查清单](docs/deployment/DEPLOYMENT_CHECKLIST.md)
- [腾讯云配置指南](docs/deployment/TENCENT_CLOUD_SETUP.md)
- [微信开发者工具配置](docs/deployment/WECHAT_DEV_TOOL_SETUP.md)
- [故障排除指南](docs/deployment/TROUBLESHOOTING.md)

### 配置文档 (`docs/configuration/`)
- [API接口文档](docs/configuration/API_DOCUMENTATION.md)
- [数据库设计文档](docs/configuration/DATABASE_SCHEMA.md)
- [环境配置说明](docs/configuration/ENVIRONMENT_CONFIG.md)
- [安全配置指南](docs/configuration/SECURITY_CONFIG.md)

## 🔧 技术栈

### 前端
- **微信小程序原生开发**
- 使用微信小程序云开发
- 支持云函数调用
- 响应式设计

### 后端
- **腾讯云云开发**
- 云函数（Node.js）
- 文档型数据库
- 云存储

### 开发工具
- 微信开发者工具
- Git版本控制
- 腾讯云控制台

## 🎯 核心功能

### 已实现
- ✅ 用户登录（微信登录 + 游客模式）
- ✅ 首页展示（用户信息、学习数据、功能入口）
- ✅ 基础页面结构（8个页面路由）

### 开发中
- 🔄 生词管理（添加、查看、编辑、删除）
- 🔄 智能复习（基于艾宾浩斯记忆曲线）
- 🔄 学习统计（进度、掌握率、连续学习天数）
- 🔄 数据导入导出（Excel、CSV格式）

## 📊 数据库设计

### 核心集合
1. **users** - 用户信息
2. **words** - 生词数据
3. **categories** - 分类管理
4. **reviews** - 复习记录
5. **sync_logs** - 同步日志

详细设计请查看 [数据库设计文档](docs/configuration/DATABASE_SCHEMA.md)

## 🚀 部署要求

### 腾讯云配置
- ✅ 环境ID: `tengfei-workstation-7czc7ab13ca3`
- ✅ 地域: `ap-shanghai`
- ✅ 数据库: 5个集合
- ✅ 云函数: 10个函数

### 微信小程序配置
- ✅ AppID: `wx1ccb4d171dd88162`
- ✅ 项目名称: 生词本
- ✅ 基础库版本: 最新稳定版

## 🧪 测试

### 连接测试
在微信开发者工具控制台运行：
```javascript
// 测试云开发连接
wx.cloud.init({ env: 'tengfei-workstation-7czc7ab13ca3' })

// 测试数据库
const db = wx.cloud.database()
db.collection('users').count().then(console.log)

// 测试云函数
wx.cloud.callFunction({ name: 'login', data: { action: 'test' } })
```

### 功能测试
1. 首页显示测试
2. 登录功能测试
3. 页面跳转测试
4. 数据操作测试

## 🔄 开发流程

### 1. 环境搭建
```bash
# 克隆项目
git clone https://github.com/tengfeizhao1219/word-memorizer.git

# 安装依赖（如果需要）
cd word-memorizer/client-mini-wechat
npm install
```

### 2. 开发新功能
1. 在 `client-mini-wechat/pages/` 创建新页面
2. 在 `cloud-functions/` 添加云函数
3. 更新相关文档
4. 运行测试

### 3. 提交代码
```bash
git add .
git commit -m "feat: 添加新功能"
git push origin master
```

## 📞 支持与反馈

### 遇到问题？
1. 查看 [常见问题解答](docs/guides/FAQ.md)
2. 查看 [故障排除指南](docs/deployment/TROUBLESHOOTING.md)
3. 检查控制台错误信息
4. 提供详细的问题描述

### 需要帮助？
1. 提供具体的错误信息
2. 提供相关截图
3. 描述操作步骤
4. 说明期望的结果

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 贡献者

- **项目维护**: [tengfeizhao1219](https://github.com/tengfeizhao1219)
- **技术支持**: OpenClaw AI Assistant

## 🔗 相关链接

- [GitHub仓库](https://github.com/tengfeizhao1219/word-memorizer)
- [腾讯云控制台](https://tcb.cloud.tencent.com/dev)
- [微信开发者文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [腾讯云云开发文档](https://docs.cloudbase.net/)

---

**最后更新**: 2026-03-18  
**项目状态**: 开发中 - 首页和登录页已完成  
**部署状态**: 腾讯云环境已配置，等待连接测试