# 微信开发者工具配置指南

## 📱 小程序配置步骤

### 第一步：安装微信开发者工具
```
1. 访问: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
2. 下载稳定版
3. 安装并启动
```

### 第二步：导入项目
```
1. 打开微信开发者工具
2. 点击"导入项目"
3. 选择项目目录: word-memorizer/client-mini
4. AppID: wx1ccb4d171dd88162
5. 项目名称: 生词本
6. 点击"导入"
```

### 第三步：配置开发环境
```
1. 在开发者工具中:
   - 点击"详情"
   - 选择"本地设置"
   - 勾选"不校验合法域名" (开发阶段)
   - 勾选"使用npm模块"
   - 勾选"增强编译"
```

### 第四步：安装依赖
```
1. 在开发者工具中:
   - 点击"工具" → "构建npm"
   - 等待构建完成
   - 检查控制台无错误
```

### 第五步：配置云开发
```
1. 点击左侧"云开发"
2. 点击"开通云开发"
3. 环境选择: tengfei-workstation-7czc7ab13ca3
4. 点击"确定"
```

## ⚙️ 项目配置详情

### 小程序配置 (manifest.json)
```json
{
  "appid": "wx1ccb4d171dd88162",
  "cloud": true,
  "permission": {
    "scope.userLocation": {
      "desc": "你的位置信息将用于小程序位置接口的效果展示"
    }
  }
}
```

### 云开发配置 (main.js)
```javascript
wx.cloud.init({
  env: 'tengfei-workstation-7czc7ab13ca3',
  traceUser: true
});
```

### 服务器域名配置
需要在微信公众平台配置:
```
request合法域名:
- https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com

socket合法域名: (可选)
uploadFile合法域名: (可选)
downloadFile合法域名: (可选)
```

## 🧪 本地测试

### 编译运行
```
1. 点击"编译"按钮
2. 等待编译完成
3. 在模拟器中查看效果
```

### 页面测试
测试以下页面是否正常:
1. 首页 (`pages/index/index`)
2. 登录页 (`pages/login/login`)
3. 生词列表 (`pages/word-list/word-list`)
4. 生词详情 (`pages/word-detail/word-detail`)
5. 复习页面 (`pages/review/review`)
6. 统计页面 (`pages/stats/stats`)
7. 导入导出 (`pages/import-export/import-export`)

### 云函数测试
```
1. 点击"云开发"控制台
2. 测试云函数调用
3. 检查数据库连接
```

## 🔧 常见问题解决

### 问题1: 编译错误
```
可能原因:
1. 依赖未安装
2. 语法错误
3. 配置错误

解决方案:
1. 重新构建npm
2. 检查控制台错误信息
3. 验证配置文件
```

### 问题2: 云开发连接失败
```
可能原因:
1. 环境ID错误
2. 网络问题
3. 权限不足

解决方案:
1. 确认环境ID正确
2. 检查网络连接
3. 验证云开发权限
```

### 问题3: API调用失败
```
可能原因:
1. 域名未配置
2. 云函数未部署
3. 参数错误

解决方案:
1. 配置服务器域名
2. 检查云函数状态
3. 验证请求参数
```

## 📱 真机测试

### 预览功能
```
1. 点击"预览"按钮
2. 扫描二维码
3. 在手机上测试
```

### 上传版本
```
1. 点击"上传"按钮
2. 填写版本信息
3. 提交审核
```

### 体验版
```
1. 在微信公众平台设置体验版
2. 添加体验者
3. 收集反馈
```

## 🚀 发布流程

### 测试阶段
1. 开发版测试
2. 体验版测试
3. 收集用户反馈

### 审核阶段
1. 提交审核
2. 等待审核结果 (1-7天)
3. 根据反馈修改

### 发布阶段
1. 审核通过后发布
2. 监控线上版本
3. 收集用户反馈

## 📞 技术支持

### 微信开发者文档
- 小程序开发: https://developers.weixin.qq.com/miniprogram/dev/framework/
- 云开发: https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html

### 问题反馈
1. 查看开发者工具控制台
2. 检查云开发日志
3. 查阅官方文档

## 🎉 配置完成

完成以上步骤后，小程序就可以:
- ✅ 本地开发和测试
- ✅ 连接云开发环境
- ✅ 调用云函数API
- ✅ 访问数据库
- ✅ 进行真机测试

**下一步**: 进行功能测试和用户体验优化。