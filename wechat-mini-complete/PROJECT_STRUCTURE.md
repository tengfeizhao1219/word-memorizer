# 📁 项目结构说明
## 清晰、有序的项目组织

**最后更新**: 2026-03-18  
**组织原则**: 代码与文档分离，按功能模块分类

---

## 🎯 **核心目录结构**

```
word-memorizer/
├── 📱 client-mini-wechat/      # 微信小程序原生版本（推荐使用）
├── 📱 client-mini/            # Uni-app版本（备用）
├── ☁️ cloud-functions/        # 云函数代码
├── 🗄️ database/              # 数据库脚本和配置
├── 📚 docs/                  # 所有文档和指南
├── 🔧 scripts/               # 构建和部署脚本
├── 🧪 tests/                 # 测试代码
└── 📄 项目配置文件
```

---

## 📱 **小程序代码目录**

### **client-mini-wechat/（推荐）**
```
微信小程序原生版本，可以直接导入微信开发者工具
├── app.js                    # 应用逻辑
├── app.json                  # 应用配置（8个页面）
├── app.wxss                  # 全局样式
├── project.config.json       # 项目配置（AppID: wx1ccb4d171dd88162）
├── sitemap.json             # 站点地图
└── pages/                   # 页面目录
    ├── index/               # 首页（已完成）
    │   ├── index.wxml       # 模板
    │   ├── index.wxss       # 样式
    │   ├── index.js         # 逻辑
    │   └── index.json       # 配置
    ├── login/               # 登录页（基本完成）
    │   ├── login.wxml
    │   ├── login.js
    │   └── （待完善）
    └── 其他6个页面目录（待开发）
```

### **client-mini/（备用）**
```
Uni-app版本，需要使用HBuilderX运行
├── manifest.json            # Uni-app配置
├── pages.json              # 页面配置
├── package.json            # 依赖配置
└── src/                    # 源代码
    ├── pages/              # 页面组件（.vue文件）
    ├── components/         # 公共组件
    ├── utils/             # 工具函数
    ├── stores/            # 状态管理
    └── api/               # API接口
```

---

## ☁️ **云开发目录**

### **cloud-functions/**
```
腾讯云云函数代码，已部署10个函数
├── login/                  # 用户登录
├── getInfo/               # 获取用户信息
├── add/                   # 添加生词
├── list/                  # 获取列表
├── detail/                # 获取详情
├── search/                # 搜索功能
├── import/                # 导入功能
├── export/                # 导出功能
├── getToday/              # 获取今日复习
└── submit/                # 提交复习结果
```

### **database/**
```
数据库配置和初始化脚本
├── init-collections.js    # 初始化集合脚本
├── schema/               # 数据模型定义
└── migrations/           # 数据库迁移脚本
```

---

## 📚 **文档目录 (docs/)**

### **docs/guides/ - 使用指南**
```
用户和开发者指南
├── QUICK_START.md        # 快速开始指南
├── USER_GUIDE.md         # 用户使用手册
├── DEVELOPER_GUIDE.md    # 开发者指南
└── FAQ.md               # 常见问题解答
```

### **docs/deployment/ - 部署文档**
```
部署和运维相关文档
├── DEPLOYMENT_CHECKLIST.md      # 部署检查清单
├── TENCENT_CLOUD_SETUP.md       # 腾讯云配置指南
├── WECHAT_DEV_TOOL_SETUP.md     # 微信开发者工具配置
└── TROUBLESHOOTING.md          # 故障排除指南
```

### **docs/configuration/ - 配置文档**
```
系统配置和API文档
├── API_DOCUMENTATION.md         # API接口文档
├── DATABASE_SCHEMA.md           # 数据库设计文档
├── ENVIRONMENT_CONFIG.md        # 环境配置说明
└── SECURITY_CONFIG.md          # 安全配置指南
```

### **docs/根目录文档**
```
├── API_DOCUMENTATION.md        # API文档（完整版）
├── database.md                 # 数据库设计（详细版）
├── design-doc.md               # 系统设计文档
├── DESIGN.md                   # 设计概要
└── USER_MANUAL.md              # 用户手册
```

---

## 🔧 **工具和脚本目录**

### **scripts/**
```
构建、部署和开发工具脚本
├── build.sh                   # 构建脚本
├── deploy.sh                  # 部署脚本
├── test.sh                    # 测试脚本
└── utils/                     # 工具函数
```

### **tests/**
```
测试代码和测试数据
├── unit/                      # 单元测试
├── integration/               # 集成测试
├── e2e/                       # 端到端测试
└── fixtures/                  # 测试数据
```

---

## 📄 **项目配置文件**

### **根目录配置文件**
```
├── .gitignore                # Git忽略文件
├── README.md                 # 项目说明（待创建）
├── PROJECT_STRUCTURE.md      # 项目结构说明（本文档）
├── LICENSE                   # 开源许可证（待添加）
└── package.json              # Node.js项目配置（如果有）
```

---

## 🚀 **开发工作流程**

### **1. 新开发者上手**
```
1. 阅读 docs/guides/QUICK_START.md
2. 配置开发环境
3. 导入 client-mini-wechat/ 到微信开发者工具
4. 运行测试
```

### **2. 功能开发**
```
1. 在 client-mini-wechat/pages/ 创建新页面
2. 在 cloud-functions/ 添加或修改云函数
3. 更新 docs/ 中的相关文档
4. 运行测试验证
```

### **3. 部署发布**
```
1. 按照 docs/deployment/DEPLOYMENT_CHECKLIST.md 检查
2. 测试所有功能
3. 提交代码到GitHub
4. 在腾讯云控制台部署云函数
```

---

## 📊 **文件组织原则**

### **代码与文档分离**
- ✅ **代码文件**：放在功能目录中（client-mini-wechat/, cloud-functions/等）
- ✅ **文档文件**：统一放在 docs/ 目录下
- ✅ **配置文件**：放在项目根目录或相应功能目录

### **版本控制**
- ✅ **生产代码**：client-mini-wechat/（当前主版本）
- ✅ **备用代码**：client-mini/（保留供参考）
- ✅ **历史文档**：保留在docs/中，但标记状态

### **命名规范**
- ✅ **目录名**：使用小写字母和连字符
- ✅ **文件名**：使用有意义的英文名称
- ✅ **文档文件**：使用大写字母和下划线，便于识别

---

## 🔄 **维护指南**

### **添加新功能时**
1. 在相应目录添加代码文件
2. 更新相关文档
3. 添加测试用例
4. 更新项目结构文档

### **修改现有功能时**
1. 先备份相关文件
2. 修改代码
3. 更新文档
4. 运行测试

### **删除文件时**
1. 确认文件不再需要
2. 更新相关引用
3. 更新文档
4. 提交删除

---

## 🎯 **立即使用建议**

### **对于用户**：
```
1. 下载项目
2. 阅读 docs/guides/QUICK_START.md
3. 导入 client-mini-wechat/ 到微信开发者工具
4. 按照部署检查清单配置
```

### **对于开发者**：
```
1. 熟悉项目结构
2. 查看相关文档
3. 从首页开始开发
4. 遵循现有代码规范
```

### **对于部署人员**：
```
1. 使用 docs/deployment/DEPLOYMENT_CHECKLIST.md
2. 逐步验证配置
3. 记录部署结果
4. 更新部署文档
```

---

## 📞 **问题反馈**

### **文件位置问题**：
如果找不到某个文件，请：
1. 查看本文档的结构说明
2. 在相应目录中搜索
3. 检查GitHub仓库的最新结构

### **文档缺失问题**：
如果缺少某个文档，请：
1. 在 docs/ 目录中查找相关文档
2. 查看是否有替代文档
3. 联系项目维护人员

### **结构建议**：
如果有更好的组织建议，请：
1. 提出具体建议
2. 说明改进理由
3. 提供示例结构

**项目结构会持续优化，欢迎提出改进建议！**