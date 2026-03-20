# 环境变量配置指南

## 🎯 为什么需要环境变量？

### 安全问题：
- ⚠️ **API密钥不能硬编码在代码中**
- ⚠️ **GitHub会检测并阻止包含密钥的提交**
- ⚠️ **泄露密钥会导致安全风险和经济损失**

### 最佳实践：
- ✅ **环境变量**：敏感信息存储在环境变量中
- ✅ **本地配置**：开发时使用`.env`文件（不提交到Git）
- ✅ **云配置**：生产环境使用云平台的环境变量功能

## 🔧 需要配置的环境变量

### 腾讯云翻译API：
```env
TENCENT_SECRET_ID=你的SecretId（以AKID开头）
TENCENT_SECRET_KEY=你的SecretKey
TENCENT_REGION=ap-shanghai
```

### 微信小程序：
```env
WECHAT_APP_ID=wx1ccb4d171dd88162
WECHAT_APP_KEY=101675fa960ac80c09dd2bf7273c7513
```

### 腾讯云环境：
```env
TENCENT_ENV_ID=tengfei-workspace-7ef9ma8b7670ea
```

## 🛠️ 配置方法

### 方法1：微信云开发环境变量（推荐）

#### 步骤：
```
1. 登录微信开发者工具
2. 点击"云开发"按钮
3. 进入"环境设置"
4. 找到"环境变量"配置
5. 添加以下变量：
   - TENCENT_SECRET_ID
   - TENCENT_SECRET_KEY
   - TENCENT_REGION
6. 保存并重新部署云函数
```

### 方法2：本地开发配置

#### 创建`.env`文件：
```bash
# 在项目根目录创建.env文件
cd word-memorizer
echo "TENCENT_SECRET_ID=你的SecretId" > .env
echo "TENCENT_SECRET_KEY=你的SecretKey" >> .env
echo "TENCENT_REGION=ap-shanghai" >> .env

# 确保.gitignore包含.env
echo ".env" >> .gitignore
```

#### 在代码中读取：
```javascript
// 云函数中读取环境变量
const secretId = process.env.TENCENT_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY;
```

### 方法3：命令行设置

#### Linux/Mac：
```bash
export TENCENT_SECRET_ID="你的SecretId"
export TENCENT_SECRET_KEY="你的SecretKey"
export TENCENT_REGION="ap-shanghai"
```

#### Windows：
```cmd
set TENCENT_SECRET_ID=你的SecretId
set TENCENT_SECRET_KEY=你的SecretKey
set TENCENT_REGION=ap-shanghai
```

## 📋 验证配置

### 测试环境变量是否生效：
```javascript
// 创建测试云函数
exports.main = async (event) => {
  console.log('环境变量测试:');
  console.log('TENCENT_SECRET_ID:', process.env.TENCENT_SECRET_ID ? '已设置' : '未设置');
  console.log('TENCENT_SECRET_KEY:', process.env.TENCENT_SECRET_KEY ? '已设置' : '未设置');
  
  return {
    secretIdConfigured: !!process.env.TENCENT_SECRET_ID,
    secretKeyConfigured: !!process.env.TENCENT_SECRET_KEY
  };
};
```

### 测试翻译功能：
```javascript
// 调用翻译云函数测试
wx.cloud.callFunction({
  name: 'translate',
  data: {
    text: 'hello',
    source: 'en',
    target: 'zh'
  }
}).then(result => {
  if (result.result.data.isFallback) {
    console.log('⚠️ 使用本地词典，请检查环境变量配置');
  } else {
    console.log('✅ 腾讯云翻译API工作正常');
  }
});
```

## 🔒 安全注意事项

### 必须遵守：
1. **不要提交`.env`文件到Git**
2. **不要将密钥写入代码**
3. **不要分享环境变量文件**
4. **定期轮换API密钥**

### `.gitignore`配置：
```
# 环境文件
.env
.env.local
.env.development
.env.production

# 密钥文件
*.key
*.pem
*.cert

# 配置文件
config.local.json
secrets.json
```

## 🚀 部署流程

### 开发环境：
```
1. 创建.env文件（本地使用）
2. 配置环境变量
3. 测试功能
4. 确保.gitignore正确配置
```

### 生产环境：
```
1. 在微信云开发控制台配置环境变量
2. 重新部署云函数
3. 验证功能正常
4. 监控使用情况
```

## 💡 故障排除

### 问题1：环境变量未生效
```
症状：云函数报错"密钥未配置"
解决：
1. 检查环境变量名称是否正确
2. 确认已重新部署云函数
3. 检查云函数日志
```

### 问题2：GitHub仍然检测到密钥
```
症状：推送被GitHub阻止
解决：
1. 检查代码中是否还有硬编码密钥
2. 运行：git log --all --full-history -- "**/*.js" | grep -i "AKID\|Secret"
3. 移除所有硬编码密钥
```

### 问题3：翻译功能使用本地词典
```
症状：总是返回降级翻译
解决：
1. 检查环境变量是否正确设置
2. 检查腾讯云翻译服务是否开通
3. 检查网络连接
```

## 📞 技术支持

### 微信云开发文档：
- 环境变量配置：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/env.html

### 腾讯云文档：
- 机器翻译API：https://cloud.tencent.com/document/product/551
- API密钥管理：https://console.cloud.tencent.com/cam/capi

### 项目文档：
- GitHub仓库：https://github.com/tengfeizhao1219/word-memorizer
- 配置指南：本文件

---

**重要提示**：请立即按照本指南配置环境变量，确保翻译功能正常工作且代码安全。 🛡️