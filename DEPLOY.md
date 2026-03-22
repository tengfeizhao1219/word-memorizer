# 🚀 部署指南

## 重要原则
**密钥永远不在代码中，只在环境变量中**

## 部署步骤

### 1. 腾讯云环境变量配置（必须！）
对于每个云函数，配置：
- `TENCENT_SECRET_ID` = 你的SecretId
- `TENCENT_SECRET_KEY` = 你的SecretKey
- `TENCENT_REGION` = ap-shanghai

### 2. 云函数部署
上传4个函数：
1. `translate` - 单词翻译
2. `user-login` - 用户登录
3. `word-list` - 单词列表
4. `init-database` - 数据库初始化

### 3. 前端配置
- AppID: `wx1ccb4d171dd88162`
- 环境ID: `cloud1-1g9313w0bb791de0`

### 4. 数据库创建
调用 `init-database` 函数或手动创建3个集合

## 测试命令
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
