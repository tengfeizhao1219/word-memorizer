# ☁️ 腾讯云云开发配置指南
## 完整的环境配置和验证步骤

**适用环境**: `tengfei-workstation-7czc7ab13ca3`  
**地域**: `ap-shanghai` (上海)  
**最后验证**: 2026-03-18

---

## 🎯 **环境概览**

### **基本信息**
```
✅ 环境ID: tengfei-workstation-7czc7ab13ca3
✅ 地域: ap-shanghai
✅ 创建时间: 2026-03-17
✅ 状态: 已激活
✅ 免费额度: 在限额内
```

### **资源统计**
```
📊 数据库: 5个集合
⚡ 云函数: 10个函数
💾 云存储: 默认配置
🔗 HTTP服务: 未启用（使用云调用）
```

---

## 📋 **配置检查清单**

### **✅ 1. 环境状态检查**
- [ ] 环境显示为「正常」状态
- [ ] 地域显示为「上海」
- [ ] 免费额度未超限
- [ ] 账户余额充足

### **✅ 2. 数据库配置检查**
- [ ] 集合数量: 5个
- [ ] 集合名称正确:
  1. `users` - 用户信息
  2. `words` - 生词数据
  3. `categories` - 分类管理
  4. `reviews` - 复习记录
  5. `sync_logs` - 同步日志
- [ ] 每个集合有适当的索引
- [ ] 权限配置正确

### **✅ 3. 云函数检查**
- [ ] 函数数量: 10个
- [ ] 函数名称正确:
  1. `login` - 用户登录
  2. `getInfo` - 获取用户信息
  3. `add` - 添加生词
  4. `list` - 获取列表
  5. `detail` - 获取详情
  6. `search` - 搜索功能
  7. `import` - 导入功能
  8. `export` - 导出功能
  9. `getToday` - 获取今日复习
  10. `submit` - 提交复习结果
- [ ] 所有函数状态为「运行中」
- [ ] 函数代码为最新版本

### **✅ 4. 云存储检查**
- [ ] 存储空间已创建
- [ ] 权限配置适当
- [ ] 有足够的存储空间

---

## 🔧 **配置步骤**

### **步骤1: 登录腾讯云控制台**
```
1. 访问: https://tcb.cloud.tencent.com/dev
2. 使用腾讯云账号登录
3. 选择「云开发」服务
```

### **步骤2: 选择环境**
```
1. 在环境列表中查找: tengfei-workstation-7czc7ab13ca3
2. 点击进入环境详情
3. 验证环境状态为「正常」
```

### **步骤3: 验证数据库**
```
1. 点击左侧「数据库」
2. 选择「文档型数据库」
3. 验证5个集合是否存在
4. 点击每个集合查看详情
```

### **步骤4: 验证云函数**
```
1. 点击左侧「云函数」
2. 查看函数列表
3. 验证10个函数都存在
4. 检查每个函数的运行状态
```

### **步骤5: 验证云存储**
```
1. 点击左侧「云存储」
2. 查看存储空间
3. 验证权限配置
```

---

## 🧪 **连接测试**

### **测试1: 环境连接测试**
在微信开发者工具控制台运行：
```javascript
// 初始化云开发
wx.cloud.init({
  env: 'tengfei-workstation-7czc7ab13ca3',
  traceUser: true
})

console.log('云开发初始化完成')
```

### **测试2: 数据库连接测试**
```javascript
// 获取数据库引用
const db = wx.cloud.database()

// 测试users集合
db.collection('users').count()
  .then(res => {
    console.log('✅ users集合连接成功，文档数:', res.total)
  })
  .catch(err => {
    console.error('❌ users集合连接失败:', err)
  })

// 测试words集合
db.collection('words').count()
  .then(res => {
    console.log('✅ words集合连接成功，文档数:', res.total)
  })
  .catch(err => {
    console.error('❌ words集合连接失败:', err)
  })
```

### **测试3: 云函数调用测试**
```javascript
// 测试login函数
wx.cloud.callFunction({
  name: 'login',
  data: {
    action: 'test',
    timestamp: Date.now()
  }
})
.then(res => {
  console.log('✅ login函数调用成功:', res.result)
})
.catch(err => {
  console.error('❌ login函数调用失败:', err)
})

// 测试getInfo函数
wx.cloud.callFunction({
  name: 'getInfo',
  data: { action: 'test' }
})
.then(res => {
  console.log('✅ getInfo函数调用成功:', res.result)
})
.catch(err => {
  console.error('❌ getInfo函数调用失败:', err)
})
```

### **测试4: 完整连接测试**
```javascript
async function testCompleteConnection() {
  console.log('🧪 开始完整连接测试...')
  
  try {
    // 1. 初始化
    wx.cloud.init({
      env: 'tengfei-workstation-7czc7ab13ca3',
      traceUser: true
    })
    console.log('1. 云开发初始化: ✅ 成功')
    
    // 2. 测试数据库
    const db = wx.cloud.database()
    const collections = ['users', 'words', 'categories', 'reviews', 'sync_logs']
    
    for (const collection of collections) {
      try {
        const res = await db.collection(collection).count()
        console.log(`2. ${collection}集合: ✅ 连接成功 (${res.total}个文档)`)
      } catch (err) {
        console.log(`2. ${collection}集合: ⚠️ 连接失败 (${err.message})`)
      }
    }
    
    // 3. 测试云函数
    const functions = ['login', 'getInfo', 'add', 'list']
    
    for (const func of functions) {
      try {
        const res = await wx.cloud.callFunction({
          name: func,
          data: { action: 'test' }
        })
        console.log(`3. ${func}函数: ✅ 调用成功`)
      } catch (err) {
        console.log(`3. ${func}函数: ⚠️ 调用失败 (${err.message})`)
      }
    }
    
    console.log('🧪 完整连接测试完成')
  } catch (error) {
    console.error('❌ 测试过程中出错:', error)
  }
}

// 运行测试
testCompleteConnection()
```

---

## 🚨 **常见问题解决**

### **问题1: 环境ID无效**
```
症状:
- 控制台报错: "invalid environment"
- 无法初始化云开发

解决方案:
1. 确认环境ID: tengfei-workstation-7czc7ab13ca3
2. 检查环境是否已激活
3. 验证腾讯云账户权限
```

### **问题2: 数据库连接失败**
```
症状:
- 控制台报错: "permission denied"
- 无法读取集合数据

解决方案:
1. 检查集合权限设置
2. 确认集合名称正确
3. 验证数据库网络配置
```

### **问题3: 云函数调用失败**
```
症状:
- 控制台报错: "function not found"
- 函数返回错误

解决方案:
1. 确认函数已部署
2. 检查函数代码
3. 查看云函数日志
```

### **问题4: 网络连接问题**
```
症状:
- 请求超时
- 网络错误

解决方案:
1. 检查本地网络
2. 验证腾讯云服务状态
3. 尝试使用其他网络
```

---

## 📊 **监控和维护**

### **日常监控**
```
1. 环境状态监控
2. 资源使用监控
3. 错误日志监控
4. 性能指标监控
```

### **定期维护**
```
1. 数据库备份
2. 日志清理
3. 代码更新
4. 安全审计
```

### **告警设置**
```
建议设置以下告警:
1. 环境异常告警
2. 资源超限告警
3. 错误率告警
4. 性能下降告警
```

---

## 🔄 **备份和恢复**

### **数据库备份**
```
1. 定期导出数据库
2. 备份到云存储
3. 验证备份完整性
```

### **云函数备份**
```
1. 代码版本控制
2. 配置文件备份
3. 依赖包备份
```

### **恢复流程**
```
1. 确认备份可用
2. 恢复数据库
3. 部署云函数
4. 验证恢复结果
```

---

## 🎯 **最佳实践**

### **安全实践**
```
1. 使用最小权限原则
2. 定期更新依赖
3. 监控异常访问
4. 数据加密传输
```

### **性能优化**
```
1. 数据库索引优化
2. 云函数冷启动优化
3. 缓存策略优化
4. 代码性能优化
```

### **成本控制**
```
1. 监控资源使用
2. 优化云函数执行时间
3. 合理使用免费额度
4. 定期清理无用资源
```

---

## 📝 **配置记录**

### **环境信息**
```
环境ID: tengfei-workstation-7czc7ab13ca3
地域: ap-shanghai
创建时间: 2026-03-17
创建者: tengfeizhao1219
```

### **数据库配置**
```
集合数量: 5
索引配置: 按需创建
权限配置: 小程序端读写
备份策略: 每周自动备份
```

### **云函数配置**
```
函数数量: 10
运行环境: Node.js 16
内存配置: 256MB
超时时间: 3秒
```

### **网络配置**
```
内网访问: 启用
公网访问: 按需启用
CDN加速: 未启用
SSL证书: 自动管理
```

---

## 📞 **技术支持**

### **腾讯云支持**
- 官方文档: https://docs.cloudbase.net/
- 技术支持: 提交工单
- 社区支持: 开发者社区

### **项目支持**
- GitHub Issues: 提交问题
- 项目维护者: tengfeizhao1219
- 更新日志: 查看提交记录

### **紧急联系**
```
遇到紧急问题:
1. 记录错误信息
2. 提供环境信息
3. 描述影响范围
4. 联系技术支持
```

---

## ✅ **验证完成标志**

### **基础验证**
```
✅ 环境状态正常
✅ 数据库连接正常
✅ 云函数调用正常
✅ 小程序连接正常
```

### **完整验证**
```
✅ 所有集合可访问
✅ 所有函数可调用
✅ 性能指标达标
✅ 安全配置正确
```

### **生产就绪**
```
✅ 监控告警配置
✅ 备份恢复测试
✅ 性能压力测试
✅ 安全审计通过
```

**按照此指南逐步配置和验证，确保腾讯云环境完全就绪！** 🚀