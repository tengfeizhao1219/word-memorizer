# ⚡ 快速部署指南

## 5分钟部署流程

### 1. 准备环境
- 微信开发者工具（已安装）
- 腾讯云账号（已开通云开发）
- 本项目的文件

### 2. 部署云函数（4个）
上传 `deploy-direct/` 中的函数：
1. `translate` - 翻译
2. `user-login` - 用户登录
3. `word-list` - 单词列表
4. `init-database` - 数据库初始化

### 3. 配置环境变量（关键！）
对于每个云函数，在腾讯云控制台配置：
```
TENCENT_SECRET_ID = 你的SecretId
TENCENT_SECRET_KEY = 你的SecretKey
TENCENT_REGION = ap-shanghai
```

### 4. 导入前端
1. 打开微信开发者工具
2. 导入 `client-mini-wechat/`
3. AppID: `wx1ccb4d171dd88162`
4. 环境ID: `cloud1-1g9313w0bb791de0`

### 5. 初始化数据库
```javascript
wx.cloud.callFunction({
  name: 'init-database',
  data: { action: 'create' }
})
```

### 6. 测试功能
```javascript
// 测试翻译
wx.cloud.callFunction({
  name: 'translate',
  data: { text: 'hello', source: 'en', target: 'zh' }
})

// 测试登录
wx.cloud.callFunction({
  name: 'user-login',
  data: { code: '从wx.login获取' }
})
```

## 🛠️ 故障排除

### 常见问题：
1. **环境变量不生效**：确认在腾讯云控制台配置
2. **数据库连接失败**：调用 `init-database` 函数
3. **翻译服务失败**：确认腾讯云翻译服务已开通

### 测试工具：
```bash
# 测试配置
node scripts/test-direct-config.js

# 测试数据库
node scripts/test-init-database.js
```

## 📋 必须文件清单

### 核心部署文件：
1. `deploy-direct/` - 4个云函数
2. `client-mini-wechat/` - 前端代码
3. `DIRECT_DEPLOYMENT_GUIDE.md` - 详细指南

### 可选文件：
- `local-server/` - 本地开发
- `scripts/` - 工具脚本
- `docs/` - 文档

---
**立即开始部署！** 🚀
