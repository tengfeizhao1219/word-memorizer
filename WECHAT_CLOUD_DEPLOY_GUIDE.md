# 微信云开发部署指南

## 🎯 部署目标
将单词本系统的云函数部署到新的腾讯云环境：`tengfei-workspace-7ef9ma8b7670ea`

## 📋 当前状态检查

### 已有云函数：
1. ✅ **translate** - 翻译功能（新开发）
2. ✅ **user/login** - 用户登录
3. ✅ **word/** - 单词相关功能
4. ✅ **review** - 复习功能
5. ✅ **sync** - 同步功能

### 需要部署到新环境：
- 所有上述云函数
- 数据库集合
- 环境变量配置

## 🚀 部署方法选择

### 方法A：微信开发者工具部署（推荐）
```
优点：简单直观，集成度高
缺点：需要手动操作每个云函数
```

### 方法B：CloudBase CLI部署
```
优点：自动化，可批量部署
缺点：需要安装CLI，需要登录
```

### 方法C：腾讯云控制台部署
```
优点：可视化操作
缺点：步骤较多
```

## 🔧 方法A：微信开发者工具部署（逐步指导）

### 步骤1：打开微信开发者工具
```
1. 打开微信开发者工具
2. 导入项目：word-memorizer/client-mini-wechat
3. 设置AppID：wx1ccb4d171dd88162
```

### 步骤2：配置云开发环境
```
1. 点击顶部"云开发"按钮
2. 点击"环境"下拉菜单
3. 选择"管理我的环境"
4. 点击"新建环境"
5. 输入环境名称：word-memorizer
6. 环境ID会自动生成，但我们需要使用指定的ID
```

### 步骤3：使用指定环境ID
```
注意：微信开发者工具新建环境会生成随机ID
我们需要使用已有的环境ID：tengfei-workspace-7ef9ma8b7670ea

解决方案：
1. 在腾讯云控制台查看该环境是否已绑定小程序
2. 如果已绑定，在微信开发者工具中选择该环境
3. 如果未绑定，可能需要联系腾讯云支持
```

### 步骤4：上传云函数
```
对于每个云函数目录：
1. 在"云开发"面板点击"云函数"
2. 点击"新建云函数"
3. 输入函数名称（如：translate）
4. 选择对应的目录
5. 点击"上传并部署"
```

### 步骤5：配置环境变量
```
1. 在"云开发"面板点击"环境设置"
2. 找到"环境变量"配置
3. 添加以下变量：
   - TENCENT_SECRET_ID = AKIDPimcCajdU7VfaHKBnBKDr673oNj060h9
   - TENCENT_SECRET_KEY = LSN7g192h7JICtPhlcFdmgNq56uQjmbB
   - TENCENT_REGION = ap-shanghai
4. 保存配置
```

### 步骤6：创建数据库集合
```
1. 在"云开发"面板点击"数据库"
2. 点击"集合名称"右侧的"+"按钮
3. 创建以下集合：
   - users（用户信息）
   - words（单词数据）
   - translation_history（翻译历史）
   - user_stats（用户统计）
```

## 🛠️ 方法B：CloudBase CLI快速部署

### 安装CLI：
```bash
npm install -g @cloudbase/cli
```

### 登录：
```bash
tcb login
```

### 查看环境：
```bash
tcb env list
```

### 部署单个云函数：
```bash
# 部署翻译云函数
cd cloud-functions/translate
npm install
tcb functions:deploy translate -e tengfei-workspace-7ef9ma8b7670ea

# 部署登录云函数
cd ../user/login
npm install
tcb functions:deploy login -e tengfei-workspace-7ef9ma8b7670ea
```

### 批量部署脚本：
```bash
# 运行部署脚本
./deploy_to_new_env.sh
```

## 📊 方法C：腾讯云控制台部署

### 步骤1：登录腾讯云控制台
```
访问：https://console.cloud.tencent.com/tcb
```

### 步骤2：选择环境
```
1. 在环境列表中找到：tengfei-workspace-7ef9ma8b7670ea
2. 点击进入环境管理
```

### 步骤3：上传云函数
```
1. 左侧菜单点击"云函数"
2. 点击"新建云函数"
3. 选择"本地上传文件夹"
4. 选择对应的云函数目录
5. 配置函数名称和运行环境
6. 点击"完成"
```

### 步骤4：配置环境变量
```
1. 左侧菜单点击"环境配置"
2. 找到"环境变量"设置
3. 添加必要的环境变量
4. 保存配置
```

### 步骤5：创建数据库
```
1. 左侧菜单点击"数据库"
2. 点击"新建集合"
3. 输入集合名称
4. 设置权限
```

## 🧪 部署后验证

### 测试1：环境变量验证
```javascript
// 创建测试云函数
exports.main = async () => {
  return {
    secretId: process.env.TENCENT_SECRET_ID ? '已配置' : '未配置',
    secretKey: process.env.TENCENT_SECRET_KEY ? '已配置' : '未配置',
    region: process.env.TENCENT_REGION || '未配置'
  };
};
```

### 测试2：翻译功能测试
```javascript
// 调用翻译云函数
wx.cloud.callFunction({
  name: 'translate',
  data: {
    text: 'hello',
    source: 'en',
    target: 'zh'
  }
}).then(result => {
  console.log('翻译测试结果:', result);
});
```

### 测试3：数据库连接测试
```javascript
// 测试数据库连接
const db = wx.cloud.database();
db.collection('users').count().then(res => {
  console.log('数据库连接成功，用户数量:', res.total);
});
```

## ⚠️ 常见问题解决

### 问题1：环境ID无法在微信开发者工具中选择
```
原因：环境未绑定到当前小程序
解决：
1. 在腾讯云控制台检查环境绑定状态
2. 如果需要绑定，联系腾讯云支持
3. 或者创建新环境并重新配置
```

### 问题2：云函数部署失败
```
原因：依赖安装失败或配置错误
解决：
1. 检查package.json依赖
2. 检查云函数代码语法
3. 查看部署日志
```

### 问题3：环境变量不生效
```
原因：配置错误或未重启云函数
解决：
1. 检查环境变量名称（大小写敏感）
2. 重新部署云函数
3. 在云函数中打印环境变量值
```

### 问题4：数据库权限错误
```
原因：集合权限设置不正确
解决：
1. 检查集合权限设置
2. 设置为"所有用户可读，仅创建者可写"
3. 或者根据需求自定义权限
```

## 🚀 快速开始建议

### 如果你熟悉微信开发者工具：
```
使用"方法A：微信开发者工具部署"
逐步操作，可视化界面
```

### 如果你熟悉命令行：
```
使用"方法B：CloudBase CLI部署"
自动化部署，效率高
```

### 如果你需要详细指导：
```
1. 先使用方法A部署翻译云函数
2. 测试翻译功能
3. 逐步部署其他云函数
```

## 📞 技术支持

### 微信云开发文档：
- 云函数部署：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/deploy.html
- 环境配置：https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/functions/env.html

### 腾讯云CloudBase文档：
- CLI使用：https://docs.cloudbase.net/cli/intro
- 环境管理：https://docs.cloudbase.net/guide/env.html

### 项目支持：
- GitHub仓库：https://github.com/tengfeizhao1219/word-memorizer
- 问题反馈：在GitHub提交Issue

---

**立即行动建议**：由于时间关系，建议先使用微信开发者工具部署**翻译云函数**，测试核心功能是否正常，然后再逐步部署其他云函数。 🚀