# 腾讯云环境配置

## 🎯 环境信息

### 核心配置：
- **环境ID**: `cloud1-1g9313w0bb791de0`
- **地域**: `ap-shanghai` (上海)
- **服务状态**: 已激活

### 腾讯云翻译API密钥：
- **SecretId**: `AKIDtlU2QdhZFj16ygHxUwV5Xo3KNt0BEy37`
- **SecretKey**: `AB82oT0NYlrnYAey62oPo25ziFfbP0OZ`
- **免费额度**: 100万字符/月
- **服务状态**: 待配置环境变量

### 微信小程序配置：
- **AppID**: `wx1ccb4d171dd88162`
- **AppKey**: `101675fa960ac80c09dd2bf7273c7513`
- **审核状态**: 已通过 ✅

## 🔧 配置状态检查

### 已完成的配置：
1. ✅ **环境ID更新**：所有配置文件已更新
2. ✅ **翻译API密钥记录**：已安全存储
3. ✅ **小程序端配置**：app.js 已更新环境ID

### 待完成的配置：
1. 🔄 **云函数部署**：需要部署到新环境
2. 🔄 **环境变量配置**：需要在腾讯云控制台设置
3. 🔄 **数据库集合创建**：需要创建必要的集合
4. 🔄 **功能测试**：需要测试翻译功能

## 🚀 立即部署步骤

### 步骤1：配置环境变量（必须）
```
在腾讯云控制台配置以下环境变量：

1. 访问: https://console.cloud.tencent.com/tcb
2. 选择环境: cloud1-1g9313w0bb791de0
3. 进入"环境配置" → "环境变量"
4. 添加以下变量：

TENCENT_SECRET_ID = AKIDtlU2QdhZFj16ygHxUwV5Xo3KNt0BEy37
TENCENT_SECRET_KEY = AB82oT0NYlrnYAey62oPo25ziFfbP0OZ
TENCENT_REGION = ap-shanghai

5. 保存配置
```

### 步骤2：部署云函数
```
使用以下任一方法部署：

方法A：运行一键部署脚本
cd word-memorizer
./JUST_RUN_ME.sh

方法B：使用微信开发者工具
1. 打开微信开发者工具
2. 导入项目
3. 点击"云开发"按钮
4. 选择环境: cloud1-1g9313w0bb791de0
5. 部署云函数
```

### 步骤3：创建数据库集合
```
在腾讯云控制台创建以下集合：

必需集合：
1. users - 用户信息
2. words - 单词数据
3. translation_history - 翻译历史

可选集合：
4. user_stats - 用户统计
5. categories - 单词分类
```

### 步骤4：测试功能
```
1. 打开微信开发者工具
2. 编译小程序
3. 访问翻译页面: pages/translate/translate
4. 输入"hello"测试翻译
```

## 📋 配置文件更新状态

### 已更新的文件：
1. ✅ `cloud-functions/config.json` - 环境配置
2. ✅ `cloud-functions/translate/index.js` - 翻译云函数
3. ✅ `client-mini-wechat/app.js` - 小程序配置
4. ✅ `test_connection.js` - 测试脚本

### 配置内容：
```json
{
  "envId": "cloud1-1g9313w0bb791de0",
  "tencentTranslation": {
    "secretId": "AKIDtlU2QdhZFj16ygHxUwV5Xo3KNt0BEy37",
    "secretKey": "AB82oT0NYlrnYAey62oPo25ziFfbP0OZ",
    "region": "ap-shanghai",
    "enabled": true
  }
}
```

## 🛠️ 部署工具

### 可用部署脚本：
1. **JUST_RUN_ME.sh** - 一键部署脚本
2. **one_click_deploy.js** - Node.js部署脚本
3. **simple_deploy.py** - Python部署脚本
4. **deploy_to_new_env.sh** - 完整部署脚本

### 快速部署命令：
```bash
cd word-memorizer
./JUST_RUN_ME.sh
```

## 🧪 测试验证

### 测试1：环境连接测试
```bash
cd word-memorizer
node test_connection.js
```

### 测试2：翻译功能测试
```javascript
// 在微信开发者工具控制台测试
wx.cloud.callFunction({
  name: 'translate',
  data: {
    text: 'hello',
    source: 'en',
    target: 'zh'
  }
}).then(console.log).catch(console.error);
```

### 测试3：数据库连接测试
```javascript
const db = wx.cloud.database();
db.collection('users').count().then(console.log);
```

## ⚠️ 注意事项

### 安全提醒：
1. ⚠️ **API密钥已硬编码在代码中** - 仅用于开发测试
2. ⚠️ **生产环境必须使用环境变量**
3. ⚠️ **不要将包含密钥的代码提交到公开仓库**

### 配置提醒：
1. ✅ 环境变量配置后需要重新部署云函数
2. ✅ 数据库集合需要设置合适的权限
3. ✅ 微信小程序需要正确的AppID配置

## 🔄 故障排除

### 问题1：环境变量不生效
```
症状：翻译总是使用本地词典
解决：
1. 确认环境变量已保存
2. 重新部署云函数
3. 在云函数中打印环境变量值
```

### 问题2：云函数部署失败
```
症状：部署时出错
解决：
1. 检查package.json依赖
2. 查看部署日志
3. 尝试简化部署命令
```

### 问题3：数据库连接失败
```
症状：无法访问数据库
解决：
1. 确认集合已创建
2. 检查集合权限设置
3. 验证环境ID是否正确
```

## 📊 环境状态监控

### 腾讯云控制台地址：
- **环境管理**: https://console.cloud.tencent.com/tcb/env
- **云函数**: https://console.cloud.tencent.com/tcb/scf
- **数据库**: https://console.cloud.tencent.com/tcb/db
- **环境变量**: https://console.cloud.tencent.com/tcb/env/config

### 监控指标：
- 云函数调用次数
- 数据库读写次数
- 翻译API使用量
- 错误日志监控

## 🎯 成功标准

### 部署成功标志：
1. ✅ 云函数部署成功
2. ✅ 环境变量配置生效
3. ✅ 数据库连接正常
4. ✅ 翻译功能正常工作

### 功能测试通过：
1. ✅ "hello" → "你好" 翻译成功
2. ✅ 显示"腾讯云翻译"（非本地词典）
3. ✅ 翻译历史记录正常
4. ✅ 可以添加到生词本

---

**配置时间**: 2026-03-20 19:58  
**配置状态**: 配置文件已更新，等待部署  
**紧急程度**: 🔥 高（需要立即部署和测试）  

**下一步行动**: 立即配置环境变量并部署云函数 🚀