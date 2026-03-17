# 多端同步生词本 - 手动部署指南

## 📋 部署概览

### 需要部署的资源
- **云函数**: 10个
- **数据库集合**: 5个
- **环境**: tengfei-workstation-7czc7ab13ca3 (上海)

### 预计时间
- 云函数部署: 20-30分钟
- 数据库配置: 5分钟
- 测试验证: 10分钟

---

## 🚀 第一步：登录腾讯云控制台

### 1.1 访问控制台
```
网址: https://console.cloud.tencent.com/
```

### 1.2 进入云开发
1. 在顶部搜索框输入"云开发"
2. 点击"云开发 CloudBase"
3. 选择"环境"标签页

### 1.3 选择正确环境
```
环境名称: tengfei-workstation
环境ID: tengfei-workstation-7czc7ab13ca3
地域: 上海
```

---

## 📦 第二步：部署云函数

### 2.1 部署用户服务函数

#### 函数1: user-login
**配置参数:**
```
函数名称: user-login
运行环境: Node.js 16.13
超时时间: 5秒
内存: 128MB
```

**操作步骤:**
1. 点击左侧"云函数"
2. 点击"新建云函数"
3. 输入函数名称: `user-login`
4. 运行环境选择: `Node.js 16.13`
5. 函数内存: `128MB`
6. 超时时间: `5秒`
7. 上传方式: `本地上传zip包`
8. 选择文件: `deploy-files/user-login.zip`
9. 点击"完成"

#### 函数2: user-getInfo
重复上述步骤，使用 `deploy-files/user-getInfo.zip`

### 2.2 部署生词服务函数

需要部署的6个函数:
1. `word-add` - 使用 `deploy-files/word-add.zip`
2. `word-list` - 使用 `deploy-files/word-list.zip`
3. `word-detail` - 使用 `deploy-files/word-detail.zip`
4. `word-search` - 使用 `deploy-files/word-search.zip`
5. `word-import` - 使用 `deploy-files/word-import.zip`
6. `word-export` - 使用 `deploy-files/word-export.zip`

**通用配置:**
```
运行环境: Node.js 16.13
内存: 256MB (import/export用512MB)
超时时间: 10秒 (import/export用30秒)
```

### 2.3 部署复习服务函数

需要部署的2个函数:
1. `review-getToday` - 使用 `deploy-files/review-getToday.zip`
2. `review-submit` - 使用 `deploy-files/review-submit.zip`

**配置:**
```
运行环境: Node.js 16.13
内存: 256MB
超时时间: 10秒
```

---

## 🗄️ 第三步：创建数据库集合

### 3.1 进入数据库管理
1. 在云开发控制台
2. 点击左侧"数据库"
3. 点击"集合"标签页

### 3.2 创建5个集合

**集合1: users**
```
集合名称: users
权限设置:
- 读取: 仅创建者可读
- 写入: 仅创建者可写
```

**集合2: words**
```
集合名称: words
权限设置:
- 读取: 仅创建者可读  
- 写入: 仅创建者可写
```

**集合3: categories**
```
集合名称: categories
权限设置:
- 读取: 所有用户可读
- 写入: 仅创建者可写
```

**集合4: reviews**
```
集合名称: reviews
权限设置:
- 读取: 仅创建者可读
- 写入: 仅创建者可写
```

**集合5: sync_logs**
```
集合名称: sync_logs
权限设置:
- 读取: 仅创建者可读
- 写入: 仅创建者可写
```

### 3.3 验证集合创建
确保5个集合都显示在列表中:
- ✅ users
- ✅ words  
- ✅ categories
- ✅ reviews
- ✅ sync_logs

---

## 🧪 第四步：验证部署

### 4.1 检查云函数状态
1. 进入"云函数"页面
2. 检查所有10个函数状态为"运行中"
3. 点击每个函数，查看"日志"是否有错误

### 4.2 运行测试脚本
```bash
cd word-memorizer
node test-deployment.js
```

**预期输出:**
```
🧪 开始部署验证测试
========================================
环境: tengfei-workstation-7czc7ab13ca3
地域: ap-shanghai

🔍 环境连通性测试... ✅ 通过
🔍 用户登录函数测试... ✅ 通过  
🔍 生词列表函数测试... ✅ 通过
🔍 复习系统函数测试... ✅ 通过

📊 测试结果统计:
   通过: 4
   失败: 0
   总计: 4

🎉 所有测试通过！部署成功！
```

### 4.3 手动测试API
可以在浏览器中测试:
```
登录测试: https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/user/login
```

---

## ⚠️ 常见问题解决

### 问题1: 云函数部署失败
```
可能原因:
1. zip文件损坏
2. 内存设置过小
3. 超时时间过短

解决方案:
1. 重新上传zip文件
2. 增加内存到256MB
3. 增加超时时间到30秒
```

### 问题2: 数据库权限错误
```
可能原因:
1. 权限设置错误
2. 集合名称错误

解决方案:
1. 检查权限设置
2. 确认集合名称拼写
3. 重新创建集合
```

### 问题3: API调用失败
```
可能原因:
1. 函数未部署成功
2. 网络问题
3. 参数错误

解决方案:
1. 检查函数状态
2. 查看函数日志
3. 验证请求参数
```

---

## 🚀 部署完成后的操作

### 5.1 获取API地址
每个函数的调用地址格式:
```
https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/[函数路径]

例如:
- 用户登录: /user/login
- 添加生词: /word/add
- 获取列表: /word/list
```

### 5.2 配置小程序
1. 注册微信小程序获取AppID
2. 更新 `client-mini/src/config/env.js` 中的 `appId`
3. 使用微信开发者工具导入项目

### 5.3 后续开发
1. Web端开发 (Vue3)
2. 移动端App开发
3. 功能扩展 (OCR、AI释义等)

---

## 📞 技术支持

### 遇到问题?
1. **查看日志**: 云函数控制台 → 日志
2. **检查状态**: 确保所有资源状态正常
3. **验证配置**: 确认环境ID和地域正确

### 联系方式
- 项目文档: `docs/` 目录
- 问题反馈: GitHub Issues
- 紧急支持: 联系开发团队

---

## 🎉 恭喜！

你已成功部署"多端同步生词本"到腾讯云开发环境。现在可以:

1. ✅ 访问控制台管理资源
2. ✅ 调用API接口
3. ✅ 配置微信小程序
4. ✅ 开始用户测试

**下一步建议**: 注册微信小程序，获取AppID，完成小程序配置。