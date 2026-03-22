# 🚀 单词本学习系统 - 直接部署指南

## ✅ 配置确认

### 已确认的信息：
- **环境ID**: `cloud1-1g9313w0bb791de0`
- **SecretId**: `AKIDQjwAGArKbfVK4iOtDLFvOdeR0LSM1Tgh`
- **SecretKey**: `sjS2SgjdNwSktulPq5LSCnDQO9j7HDvP`
- **地域**: `ap-shanghai`
- **微信AppID**: `wx1ccb4d171dd88162`

### 部署策略：
- ✅ **跳过环境变量配置** - 密钥直接写在云函数代码中
- ✅ **简化部署流程** - 减少配置步骤
- ✅ **开发友好** - 快速验证功能

## 📋 部署步骤

### 步骤1：登录腾讯云控制台
1. 访问: https://console.cloud.tencent.com/tcb
2. 使用你的账号登录
3. 确认环境ID: `cloud1-1g9313w0bb791de0`

### 步骤2：创建数据库集合（必需）
在云开发控制台中创建以下3个集合：

#### 集合1：users（用户表）
```
集合名称: users
权限设置: 所有用户可读，仅创建者可写
索引: 自动创建_id索引
字段建议:
  - _id: ObjectId (自动)
  - openid: String (微信用户唯一ID)
  - nickname: String (用户昵称)
  - avatar: String (头像URL)
  - created_at: Date (创建时间)
  - updated_at: Date (更新时间)
```

#### 集合2：words（单词表）
```
集合名称: words
权限设置: 所有用户可读，仅创建者可写
索引建议:
  - _id: 主键索引
  - user_id: 普通索引
  - word: 普通索引
字段建议:
  - _id: ObjectId (自动)
  - user_id: String (用户ID)
  - word: String (英文单词)
  - translation: String (中文翻译)
  - example: String (例句)
  - difficulty: Number (难度等级 1-5)
  - review_count: Number (复习次数)
  - last_reviewed: Date (最后复习时间)
  - next_review: Date (下次复习时间)
  - created_at: Date (创建时间)
```

#### 集合3：translation_history（翻译历史表）
```
集合名称: translation_history
权限设置: 所有用户可读，仅创建者可写
索引建议:
  - _id: 主键索引
  - user_id: 普通索引
  - timestamp: 普通索引
字段建议:
  - _id: ObjectId (自动)
  - user_id: String (用户ID)
  - source_text: String (原文)
  - target_text: String (译文)
  - source_lang: String (源语言)
  - target_lang: String (目标语言)
  - timestamp: Date (翻译时间)
  - service: String (翻译服务: tencent/local)
```

### 步骤3：使用微信开发者工具部署云函数

#### 准备项目：
1. 打开微信开发者工具
2. 导入项目: `/home/admin/.openclaw/workspace/word-memorizer/client-mini-wechat`
3. 确认AppID: `wx1ccb4d171dd88162`

#### 部署云函数：
1. 在开发者工具中点击"云开发"按钮
2. 选择环境: `cloud1-1g9313w0bb791de0`
3. 上传云函数（使用准备好的部署包）:

**部署包位置**: `/home/admin/.openclaw/workspace/word-memorizer/deploy-direct/`

需要部署的云函数：
```
deploy-direct/
├── translate/           # 翻译函数
│   ├── index.js        # 主代码（已注入密钥）
│   └── package.json    # 依赖配置
├── user-login/         # 用户登录函数
│   ├── index.js
│   └── package.json
└── word-list/          # 单词列表函数
    ├── index.js
    └── package.json
```

#### 部署配置：
- **运行时**: Node.js 16.13
- **内存**: 128MB
- **超时**: 3-5秒
- **环境变量**: 无需配置（密钥已在代码中）

### 步骤4：测试云函数

#### 测试1：翻译函数
```javascript
// 在小程序端测试
wx.cloud.callFunction({
  name: 'translate',
  data: {
    text: 'hello',
    source: 'en',
    target: 'zh'
  },
  success: res => console.log('翻译结果:', res.result),
  fail: err => console.error('翻译失败:', err)
})
```

#### 测试2：用户登录函数
```javascript
wx.cloud.callFunction({
  name: 'user-login',
  data: {
    code: '微信登录code'
  },
  success: res => console.log('登录结果:', res.result),
  fail: err => console.error('登录失败:', err)
})
```

#### 测试3：单词列表函数
```javascript
wx.cloud.callFunction({
  name: 'word-list',
  data: {
    user_id: '用户ID',
    page: 1,
    limit: 20
  },
  success: res => console.log('单词列表:', res.result),
  fail: err => console.error('获取失败:', err)
})
```

## 🔧 技术细节

### 云函数代码特点：
1. **直接密钥注入** - 跳过环境变量配置
2. **环境ID硬编码** - 使用 `cloud1-1g9313w0bb791de0`
3. **腾讯云SDK直接配置** - 在代码中初始化
4. **本地降级方案** - 腾讯云失败时使用本地词典

### 翻译函数关键代码：
```javascript
// 腾讯云翻译配置（直接使用密钥）
const clientConfig = {
  credential: {
    secretId: 'AKIDQjwAGArKbfVK4iOtDLFvOdeR0LSM1Tgh',
    secretKey: 'sjS2SgjdNwSktulPq5LSCnDQO9j7HDvP'
  },
  region: 'ap-shanghai',
  profile: {
    httpProfile: {
      endpoint: 'tmt.tencentcloudapi.com'
    }
  }
};
```

## 🛠️ 故障排除

### 常见问题1：数据库连接失败
**症状**: `数据库操作失败: missing secretId or secretKey`
**解决方案**:
1. 确认环境ID正确
2. 确认数据库集合已创建
3. 检查云函数环境配置

### 常见问题2：翻译服务失败
**症状**: `翻译服务错误: AuthFailure`
**解决方案**:
1. 确认SecretId/SecretKey有效
2. 确认翻译服务已开通
3. 检查网络连接

### 常见问题3：云函数部署失败
**症状**: `云函数上传失败`
**解决方案**:
1. 检查package.json依赖
2. 确认文件大小不超过限制
3. 检查运行时版本

## 📊 验证部署

### 验证清单：
- [ ] 数据库集合创建成功
- [ ] 云函数上传成功
- [ ] 翻译函数测试通过
- [ ] 用户登录函数测试通过
- [ ] 单词列表函数测试通过
- [ ] 前端小程序可以正常调用

### 验证命令：
```bash
# 检查云函数代码
cd /home/admin/.openclaw/workspace/word-memorizer/deploy-direct
ls -la */

# 检查环境ID配置
grep -n "cloud1-1g9313w0bb791de0" deploy-direct/*/index.js

# 检查密钥配置
grep -n "AKIDQjwAGArKbfVK4iOtDLFvOdeR0LSM1Tgh" deploy-direct/translate/index.js
```

## 🚀 快速开始脚本

我已创建了快速部署脚本：

```bash
# 1. 更新所有环境ID
cd /home/admin/.openclaw/workspace
./update-env-id.sh

# 2. 更新云函数代码（直接密钥）
cd /home/admin/.openclaw/workspace/word-memorizer
node update-cloud-functions-direct.js

# 3. 查看部署包
ls -la deploy-direct/
```

## 💡 重要提醒

### 安全性注意：
1. **密钥直接暴露在代码中** - 仅用于开发测试
2. **生产环境建议** - 使用环境变量或密钥管理服务
3. **定期轮换密钥** - 确保安全性

### 性能优化：
1. **数据库索引** - 为常用查询字段创建索引
2. **云函数超时** - 根据实际需求调整
3. **缓存策略** - 考虑添加缓存层

### 监控建议：
1. **日志查看** - 定期检查云函数日志
2. **错误监控** - 设置错误告警
3. **性能监控** - 监控响应时间和资源使用

## 📞 技术支持

### 如果遇到问题：
1. **检查日志**：云开发控制台 → 日志管理
2. **验证配置**：确认环境ID和密钥正确
3. **测试连接**：使用测试脚本验证

### 需要帮助：
1. 提供错误信息和截图
2. 描述操作步骤
3. 分享控制台日志

---

## 🎯 总结

### 已完成的工作：
1. ✅ 确认环境ID和密钥
2. ✅ 更新所有配置文件
3. ✅ 准备直接部署的云函数包
4. ✅ 创建详细部署指南

### 需要你完成的操作：
1. 🔄 登录腾讯云控制台创建数据库集合
2. 🔄 使用微信开发者工具部署云函数
3. 🔄 测试所有功能

### 预计时间：
- 数据库创建：5-10分钟
- 云函数部署：10-15分钟
- 功能测试：5-10分钟

**总时间**: 约20-35分钟

---

**现在你可以按照这个指南开始部署了！如果有任何问题，请随时告诉我。** 🚀