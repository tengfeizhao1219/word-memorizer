// 🧪 云函数调用测试代码
// 在微信开发者工具控制台运行

console.log('🔍 开始云函数调用测试')
console.log('时间:', new Date().toLocaleString())
console.log('')

// 1. 检查基础环境
console.log('1. 基础环境检查:')
console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在')
console.log('  - wx.cloud:', wx.cloud ? '✅ 存在' : '❌ 不存在')

if (!wx.cloud) {
  console.log('❌ wx.cloud不存在，请确保:')
  console.log('   1. 项目已开启云开发能力')
  console.log('   2. app.json中有 "cloud": true')
  console.log('   3. 重新编译项目')
  return
}

// 2. 初始化云开发
console.log('')
console.log('2. 云开发初始化:')
try {
  wx.cloud.init({
    env: 'tengfei-workstation-7czc7ab13ca3',
    traceUser: true
  })
  console.log('  ✅ 初始化成功')
} catch (error) {
  console.log('  ❌ 初始化失败:', error.message)
  return
}

// 3. 测试云函数调用
console.log('')
console.log('3. 测试云函数调用:')

// 测试1: 简单调用
console.log('  测试1: 简单调用')
try {
  const result = await wx.cloud.callFunction({
    name: 'login',
    data: { action: 'test' }
  })
  console.log('    ✅ 调用成功:', result)
} catch (error) {
  console.log('    ❌ 调用失败:', error.message)
  console.log('       错误详情:', error)
}

// 测试2: 带详细信息的调用
console.log('')
console.log('  测试2: 完整登录调用')
try {
  // 先获取微信登录code
  const loginCode = await new Promise((resolve, reject) => {
    wx.login({
      success: (res) => resolve(res.code),
      fail: reject
    })
  })
  
  console.log('    - 获取到code:', loginCode ? '✅' : '❌')
  
  const result = await wx.cloud.callFunction({
    name: 'login',
    data: {
      action: 'login',
      code: loginCode,
      userInfo: {
        nickName: '测试用户',
        avatarUrl: ''
      }
    }
  })
  console.log('    ✅ 登录调用成功:', result)
} catch (error) {
  console.log('    ❌ 登录调用失败:', error.message)
}

// 4. 检查网络请求
console.log('')
console.log('4. 网络请求检查:')
console.log('  请在微信开发者工具中查看:')
console.log('  - 网络面板 (Network)')
console.log('  - 控制台输出 (Console)')
console.log('  - 云开发面板 (Cloud)')

console.log('')
console.log('🎯 测试完成')
console.log('')
console.log('💡 如果调用失败，请提供:')
console.log('  1. 完整的错误信息')
console.log('  2. 网络请求截图')
console.log('  3. 控制台输出截图')
