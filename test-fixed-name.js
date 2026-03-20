// 🧪 测试修复后的云函数名称
// 在微信开发者工具控制台运行

console.log('🔍 测试修复后的云函数名称')
console.log('时间:', new Date().toLocaleString())
console.log('')

// 1. 环境检查
if (!wx.cloud) {
  console.log('❌ wx.cloud不存在')
  return
}

// 2. 初始化
wx.cloud.init({
  env: 'tengfei-workstation-7czc7ab13ca3',
  traceUser: true
})

// 3. 测试 user-login 名称
console.log('测试1: 使用 user-login 名称')
wx.cloud.callFunction({
  name: 'user-login',
  data: { action: 'test' },
  success: (res) => {
    console.log('✅ user-login 调用成功')
    console.log('返回结果:', res)
  },
  fail: (err) => {
    console.log('❌ user-login 调用失败')
    console.log('错误信息:', err.message)
    console.log('错误代码:', err.errCode || '未知')
  }
})

// 4. 测试 login 名称（对比）
setTimeout(() => {
  console.log('')
  console.log('测试2: 使用 login 名称（对比）')
  wx.cloud.callFunction({
    name: 'login',
    data: { action: 'test' },
    success: (res) => {
      console.log('✅ login 调用成功（如果部署了）')
      console.log('返回结果:', res)
    },
    fail: (err) => {
      console.log('❌ login 调用失败（预期中）')
      console.log('错误信息:', err.message)
    }
  })
}, 2000)

console.log('')
console.log('🎯 测试发起，请查看结果')
console.log('💡 预期: user-login 应该成功，login 应该失败')
