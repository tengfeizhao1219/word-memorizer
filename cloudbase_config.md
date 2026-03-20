# 腾讯云云开发环境配置指南

## 🚀 创建新环境步骤

### 步骤1：登录腾讯云控制台
1. 访问：https://console.cloud.tencent.com/tcb
2. 使用微信扫码或账号密码登录

### 步骤2：创建新环境
```
1. 点击"新建环境"按钮
2. 环境名称：word-memorizer（或你喜欢的名称）
3. 环境别名：word-memorizer
4. 计费方式：按量计费（有免费额度）
5. 地域：上海（ap-shanghai）
6. 点击"立即开通"
```

### 步骤3：获取环境ID
创建成功后，在环境列表中找到：
- **环境ID**：类似 `your-env-id-xxxxx`
- **地域**：ap-shanghai

### 步骤4：配置微信开发者工具
```
在微信开发者工具中：
1. 点击顶部"云开发"按钮
2. 选择"环境配置"
3. 输入新的环境ID
4. 点击"确定"
```

### 步骤5：初始化数据库
```bash
# 使用云开发CLI初始化数据库
npm install -g @cloudbase/cli
tcb login
tcb env:list  # 查看环境列表
tcb functions:deploy  # 部署云函数
```

## 🔧 快速测试方案

### 方案A：使用测试环境（立即可用）
```javascript
// 修改 app.js 中的初始化代码
App({
  onLaunch() {
    // 使用动态环境（测试环境）
    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    });
    
    console.log('云开发初始化完成，环境:', wx.cloud.DYNAMIC_CURRENT_ENV);
  }
});
```

### 方案B：创建本地模拟环境（开发阶段）
```javascript
// 创建模拟数据，避免环境依赖
const mockDB = {
  users: [],
  words: [],
  // ... 其他集合
};

// 模拟云函数
const mockCloud = {
  init: () => console.log('模拟云开发初始化'),
  database: () => ({
    collection: (name) => ({
      get: () => Promise.resolve({ data: mockDB[name] || [] }),
      add: (data) => {
        mockDB[name].push(data);
        return Promise.resolve({ _id: Date.now() });
      }
    })
  }),
  callFunction: ({ name }) => {
    if (name === 'login') {
      return Promise.resolve({
        result: {
          success: true,
          data: { userId: 'mock_user_' + Date.now() }
        }
      });
    }
    return Promise.reject('云函数未实现');
  }
};

// 开发阶段使用模拟数据
if (process.env.NODE_ENV === 'development') {
  global.wx = { cloud: mockCloud };
}
```

## 📋 环境检查清单

### 环境状态检查：
- [ ] 腾讯云账号已登录
- [ ] 云开发服务已开通
- [ ] 环境已创建
- [ ] 环境ID已获取
- [ ] 地域正确（ap-shanghai）

### 权限检查：
- [ ] 有环境访问权限
- [ ] 小程序AppID已绑定环境
- [ ] 云函数部署权限
- [ ] 数据库操作权限

### 配置检查：
- [ ] 微信开发者工具环境配置正确
- [ ] 小程序app.js初始化代码正确
- [ ] 云函数package.json依赖正确
- [ ] 数据库集合已创建

## 💡 常见问题解决

### Q1：环境不存在错误
**症状**：`env not exists`
**解决**：
1. 确认环境ID是否正确
2. 在腾讯云控制台检查环境状态
3. 创建新环境并更新配置

### Q2：权限不足错误
**症状**：`permission denied`
**解决**：
1. 检查小程序AppID是否绑定到环境
2. 在腾讯云控制台添加权限
3. 重新登录获取新token

### Q3：数据库连接失败
**症状**：`database connection failed`
**解决**：
1. 检查环境是否正常
2. 初始化数据库集合
3. 检查网络连接

### Q4：云函数部署失败
**症状**：`function deploy failed`
**解决**：
1. 检查package.json依赖
2. 检查云函数代码语法
3. 查看部署日志

## 🚀 立即行动建议

### 如果你有腾讯云账号：
1. **登录控制台**检查环境状态
2. **创建新环境**如果原环境不存在
3. **更新微信开发者工具**配置

### 如果你没有腾讯云账号或想快速测试：
1. **使用测试环境**（方案A）
2. **使用模拟数据**（方案B）
3. **先完成UI开发**，环境问题后续解决

### 最快速的解决方案：
```javascript
// 临时修改 app.js，使用测试环境
App({
  onLaunch() {
    // 注释掉原来的初始化
    // wx.cloud.init({
    //   env: 'tengfei-workstation-7czc7ab13ca3'
    // });
    
    // 使用测试环境
    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV,
      traceUser: true
    });
    
    console.log('使用测试环境:', wx.cloud.DYNAMIC_CURRENT_ENV);
  }
});
```

## 📞 技术支持

### 需要我协助：
1. **检查现有代码**中的环境配置
2. **创建模拟数据方案**让你继续开发
3. **提供详细的环境创建步骤**
4. **调试具体的错误信息**

### 需要你操作：
1. **登录腾讯云控制台**检查环境
2. **更新微信开发者工具**配置
3. **测试新的环境配置**
4. **反馈结果**让我知道进展

---

**建议立即尝试方案A（使用测试环境）**，这样可以立即继续开发，环境问题可以后续解决。 🚀