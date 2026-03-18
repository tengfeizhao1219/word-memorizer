# 🚀 快速开始指南
## 5分钟内运行生词本小程序

**目标用户**: 新用户、开发者、测试人员  
**预计时间**: 5-10分钟  
**前提条件**: 已安装微信开发者工具

---

## 📥 **第一步：获取项目代码**

### **方法A：Git克隆（推荐）**
```bash
git clone https://github.com/tengfeizhao1219/word-memorizer.git
cd word-memorizer
```

### **方法B：下载ZIP**
1. 访问 [GitHub仓库](https://github.com/tengfeizhao1219/word-memorizer)
2. 点击「Code」按钮
3. 选择「Download ZIP」
4. 解压到本地目录

---

## 📱 **第二步：导入到微信开发者工具**

### **1. 打开微信开发者工具**
- 确保已安装最新版本
- 使用个人微信扫码登录

### **2. 导入项目**
```
操作步骤:
1. 点击「导入项目」
2. 选择目录: word-memorizer/client-mini-wechat
3. AppID: wx1ccb4d171dd88162
4. 项目名称: 生词本
5. 点击「导入」
```

### **3. 验证导入成功**
```
成功标志:
✅ 左侧文件树显示项目结构
✅ 中间预览窗口显示小程序界面
✅ 控制台没有红色错误
```

---

## ☁️ **第三步：配置腾讯云环境**

### **1. 验证环境配置**
```
环境信息:
- 环境ID: tengfei-workstation-7czc7ab13ca3
- 地域: ap-shanghai
- 已自动配置在 app.js 中
```

### **2. 测试云开发连接**
在控制台输入：
```javascript
// 测试1: 检查wx对象
console.log('wx对象:', typeof wx)

// 测试2: 初始化云开发
if (wx.cloud) {
  console.log('云开发可用')
  wx.cloud.init({
    env: 'tengfei-workstation-7czc7ab13ca3'
  })
} else {
  console.log('云开发未初始化')
}

// 测试3: 简单数据库操作
const db = wx.cloud.database()
db.collection('users').count().then(res => {
  console.log('数据库连接成功，users集合文档数:', res.total)
}).catch(err => {
  console.log('数据库连接失败（可能权限问题）:', err.message)
})
```

---

## 🎮 **第四步：测试基本功能**

### **1. 编译运行**
```
1. 点击顶部「编译」按钮（或按 Ctrl+B）
2. 等待编译完成
3. 查看小程序是否显示
```

### **2. 测试首页**
```
检查项目:
✅ 页面正常显示
✅ 按钮可以点击
✅ 图片正常加载
✅ 没有红色错误
```

### **3. 测试登录功能**
```
操作步骤:
1. 点击「开始使用」按钮
2. 跳转到登录页面
3. 尝试以下登录方式:
   - 微信一键登录
   - 游客模式进入
```

### **4. 测试页面跳转**
```
测试路径:
首页 → 登录页 → 返回首页
（如果已登录，测试其他页面跳转）
```

---

## 🧪 **第五步：运行测试脚本**

### **连接测试**
在控制台运行完整测试：
```javascript
// 完整连接测试
async function testAllConnections() {
  console.log('🧪 开始连接测试...')
  
  // 1. 测试wx对象
  console.log('1. wx对象测试:', typeof wx !== 'undefined' ? '✅ 通过' : '❌ 失败')
  
  // 2. 测试云开发
  if (wx.cloud) {
    console.log('2. 云开发测试: ✅ 可用')
    
    // 初始化
    wx.cloud.init({
      env: 'tengfei-workstation-7czc7ab13ca3'
    })
    
    // 3. 测试数据库
    try {
      const db = wx.cloud.database()
      const countRes = await db.collection('users').count()
      console.log('3. 数据库测试: ✅ 连接成功，文档数:', countRes.total)
    } catch (err) {
      console.log('3. 数据库测试: ⚠️ 连接失败（可能权限问题）:', err.message)
    }
    
    // 4. 测试云函数
    try {
      const funcRes = await wx.cloud.callFunction({
        name: 'login',
        data: { action: 'test' }
      })
      console.log('4. 云函数测试: ✅ 调用成功', funcRes.result)
    } catch (err) {
      console.log('4. 云函数测试: ⚠️ 调用失败:', err.message)
    }
  } else {
    console.log('2. 云开发测试: ❌ 不可用')
  }
  
  console.log('🧪 连接测试完成')
}

// 运行测试
testAllConnections()
```

---

## 🚨 **常见问题解决**

### **问题1: 导入失败**
```
可能原因:
1. 目录路径错误
2. AppID不正确
3. 微信开发者工具版本过旧

解决方案:
1. 确认选择 client-mini-wechat 目录
2. 确认AppID: wx1ccb4d171dd88162
3. 更新微信开发者工具到最新版
```

### **问题2: 编译错误**
```
可能原因:
1. 文件缺失
2. 语法错误
3. 配置错误

解决方案:
1. 检查控制台错误信息
2. 确认所有必需文件存在
3. 检查 app.json 配置
```

### **问题3: 云开发连接失败**
```
可能原因:
1. 环境ID错误
2. 网络问题
3. 权限问题

解决方案:
1. 确认环境ID: tengfei-workstation-7czc7ab13ca3
2. 检查网络连接
3. 使用游客模式测试
```

### **问题4: 数据库操作失败**
```
可能原因:
1. 集合不存在
2. 权限不足
3. 数据格式错误

解决方案:
1. 确认集合已创建
2. 检查数据库权限
3. 使用模拟数据测试
```

---

## ✅ **成功标志**

### **基础成功**
```
✅ 项目成功导入
✅ 小程序正常编译
✅ 首页正常显示
✅ 按钮可以点击
```

### **进阶成功**
```
✅ 云开发连接成功
✅ 数据库操作正常
✅ 云函数调用正常
✅ 页面跳转正常
```

### **完全成功**
```
✅ 用户登录正常
✅ 数据保存正常
✅ 所有功能正常
✅ 性能表现良好
```

---

## 🎯 **下一步行动**

### **如果测试成功**：
```
1. 开始使用小程序功能
2. 测试其他页面
3. 提供使用反馈
```

### **如果测试失败**：
```
1. 记录具体错误信息
2. 提供相关截图
3. 寻求技术支持
```

### **开发人员下一步**：
```
1. 查看开发文档
2. 了解项目结构
3. 开始功能开发
```

---

## 📞 **技术支持**

### **需要帮助时**：
1. **记录错误信息**：控制台错误全文
2. **提供截图**：问题界面截图
3. **描述步骤**：详细的操作步骤
4. **说明环境**：微信开发者工具版本、操作系统等

### **联系方式**：
- GitHub Issues: [提交问题](https://github.com/tengfeizhao1219/word-memorizer/issues)
- 项目维护者: tengfeizhao1219

---

## ⏱️ **时间预估**

| 步骤 | 预计时间 | 实际用时 |
|------|----------|----------|
| 下载项目 | 1-2分钟 | _____ |
| 导入项目 | 1分钟 | _____ |
| 配置环境 | 1分钟 | _____ |
| 测试功能 | 2-5分钟 | _____ |
| **总计** | **5-10分钟** | _____ |

**现在开始你的生词本之旅吧！** 🚀