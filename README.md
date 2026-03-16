# Word Memorizer - 多端同步生词本

## 🎯 项目概述

**Word Memorizer** 是一款轻量、免费、多端同步的英语生词本应用，专为英语学习者设计。支持微信小程序和Web端，数据实时同步，帮助您随时随地记录和复习生词。

## ✨ 核心特性

- **📱 多端同步** - 微信小程序 + Web端，数据实时同步
- **🔍 智能查询** - 英汉/汉英双向查询，含读音、释义、例句
- **📊 科学复习** - 艾宾浩斯记忆曲线，智能安排复习计划
- **🏷️ 分类管理** - 自定义分类/标签，针对性复习
- **📈 学习统计** - 可视化学习数据，追踪学习进度
- **🔄 导入导出** - 支持Excel/CSV/Anki格式导入导出

## 🚀 快速开始

### 环境要求
- Node.js 16+
- 微信开发者工具
- 腾讯云账号（云开发）

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/tengfeizhao1219/word-memorizer.git
cd word-memorizer

# 安装小程序依赖
cd client-mini
npm install

# 安装Web端依赖  
cd ../client-web
npm install

# 安装云函数依赖
cd ../cloud-functions
npm install
```

### 配置说明

1. **小程序配置**：修改 `client-mini/manifest.json` 中的 appid
2. **云开发配置**：修改 `cloud-functions/config.js` 中的环境ID
3. **API配置**：根据需要配置词典API密钥

### 运行项目

```bash
# 运行小程序（HBuilderX）
# 1. 打开HBuilderX
# 2. 导入 client-mini 目录
# 3. 运行到小程序模拟器

# 运行Web端
cd client-web
npm run dev

# 部署云函数
cd cloud-functions
# 使用云开发控制台或命令行工具部署
```

## 📁 项目结构

```
word-memorizer/
├── README.md                    # 项目说明
├── docs/                        # 项目文档
│   ├── api.md                   # API接口文档
│   ├── database.md              # 数据库设计
│   ├── deploy.md                # 部署指南
│   └── design-doc.md            # 详细设计文档
├── client-mini/                 # 小程序端 (uni-app)
│   ├── src/
│   │   ├── pages/               # 页面文件
│   │   ├── components/          # 公共组件
│   │   ├── stores/              # 状态管理
│   │   ├── utils/               # 工具函数
│   │   └── api/                 # API接口
│   ├── package.json
│   └── manifest.json            # 小程序配置
├── client-web/                  # Web端 (Vue3)
│   ├── src/
│   │   ├── pages/               # 页面组件
│   │   ├── components/          # 公共组件
│   │   ├── stores/              # 状态管理
│   │   ├── utils/               # 工具函数
│   │   └── api/                 # API接口
│   ├── package.json
│   └── vite.config.js           # Vite配置
├── cloud-functions/             # 云函数
│   ├── user/                    # 用户相关
│   ├── word/                    # 生词相关
│   ├── review/                  # 复习相关
│   └── sync/                    # 同步相关
├── database/                    # 数据库脚本
│   └── init.js                  # 数据库初始化
└── scripts/                     # 辅助脚本
    ├── deploy.sh                # 部署脚本
    └── backup.js                # 备份脚本
```

## 🔧 技术栈

### 前端技术栈
- **小程序框架**: uni-app 3.x
- **Web框架**: Vue 3 + Composition API
- **构建工具**: Vite 5.x
- **UI组件库**: uView Plus 3.x
- **状态管理**: Pinia 2.x
- **HTTP客户端**: uni.request / axios

### 后端技术栈
- **云平台**: 腾讯云云开发 (CloudBase)
- **云函数**: Node.js 16.x
- **数据库**: 云开发数据库 (MongoDB兼容)
- **存储**: 云存储 (5GB免费额度)
- **认证**: 微信登录 + 云开发Auth

### 开发工具
- **小程序开发**: HBuilderX
- **Web开发**: VS Code
- **接口调试**: Apifox
- **版本控制**: Git + GitHub
- **项目管理**: GitHub Projects

## 📋 功能清单

### P0 - 核心功能（必须实现）
- ✅ 微信一键登录
- ✅ 生词添加/编辑/删除
- ✅ 生词列表与搜索
- ✅ 多端数据同步
- ✅ 单词查询（英汉/汉英）
- ✅ 复习系统（艾宾浩斯）

### P1 - 重要功能（应该实现）
- 🔄 单词发音（英式/美式）
- 🔄 生词分类/标签
- 🔄 导入/导出功能
- 🔄 学习数据统计

### P2 - 扩展功能（可以实现）
- 📅 OCR识别生词
- 🤖 AI智能释义
- 🔔 每日提醒推送
- 👥 生词本分享

## 📊 数据库设计

### 主要集合
- **users** - 用户信息
- **words** - 生词记录
- **categories** - 分类/标签
- **reviews** - 复习记录
- **sync_logs** - 同步日志

### 数据模型
详细数据模型设计请参考 `docs/database.md`

## 🔌 API接口

### 接口规范
- 请求格式: JSON
- 响应格式: `{ code, message, data, timestamp }`
- 错误码: 0-成功，非0-失败

### 主要接口
- **用户接口**: 登录、获取信息、更新设置
- **生词接口**: 列表、添加、更新、删除、搜索
- **复习接口**: 获取今日复习、提交复习结果
- **同步接口**: 拉取同步数据、推送同步数据

详细API文档请参考 `docs/api.md`

## 🚢 部署方案

### 环境准备
1. 注册微信小程序
2. 开通腾讯云云开发
3. 配置项目环境变量

### 部署流程
1. 部署云函数到云开发环境
2. 构建小程序并上传审核
3. 构建Web端并部署到服务器/CDN

详细部署指南请参考 `docs/deploy.md`

## 📅 开发计划

### 里程碑
- **M1 - 项目启动** (第1天): 环境搭建完成
- **M2 - 登录完成** (第3天): 可登录的小程序
- **M3 - 生词CRUD** (第7天): 生词管理功能
- **M4 - 多端同步** (第10天): 数据同步打通
- **M5 - 复习系统** (第14天): 艾宾浩斯算法
- **M6 - 测试优化** (第18天): 性能优化完成
- **M7 - 上线发布** (第21天): 正式上线

详细开发计划请参考 `docs/development-plan.md`

## 💰 成本预算

### 初期成本 (0-6个月)
- 微信小程序认证: ¥0 (个人主体免费)
- 腾讯云云开发: ¥0 (免费额度)
- 域名/SSL证书: ¥0 (初期不需要)
- **合计: ¥0** (完全免费)

### 云开发免费额度
- 数据库: 2GB (¥40/月价值)
- 存储: 5GB (¥10/月价值)
- 云函数: 10万次调用/月 (¥50/月价值)
- CDN: 5GB/月 (¥5/月价值)
- **总价值: ¥105/月**

## ⚠️ 风险管理

### 技术风险
- 微信审核不通过: 提前阅读审核规范
- 多端同步冲突: 实现乐观锁机制
- 数据丢失: 云开发自动备份 + 手动备份
- 性能瓶颈: 分页加载、索引优化、缓存

### 成本风险
- 用户增长过快: 设置用量监控告警
- 存储超限: 限制单用户存储，压缩图片
- 云函数超时: 优化代码，拆分大函数

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目地址: [https://github.com/tengfeizhao1219/word-memorizer](https://github.com/tengfeizhao1219/word-memorizer)
- 问题反馈: [GitHub Issues](https://github.com/tengfeizhao1219/word-memorizer/issues)

---

**让我们一起快快乐乐的记单词！** 🎉