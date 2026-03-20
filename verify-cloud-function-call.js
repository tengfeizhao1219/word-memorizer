// 🧪 云函数调用验证代码
// 在微信开发者工具控制台运行

async function verifyCloudFunction() {
  console.log('🔍 开始验证云函数调用')
  console.log('时间:', new Date().toLocaleString())
  console.log('')
  
  // 1. 检查基础环境
  console.log('1. 基础环境:')
  console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在')
  console.log('  - wx.cloud:', wx.cloud ? '✅ 存在' : '❌ 不存在')
  
  if (!wx.cloud) {
    console.log('❌ 请确保:')
    console.log('   - app.json中有 "cloud": true')
    console.log('   - 重新编译小程序')
    return
  }
  
  // 2. 初始化测试
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
  
  // 3. 测试调用
  console.log('')
  console.log('3. 云函数调用测试:')
  
  // 测试1: 简单测试调用
  console.log('  测试1: 简单测试')
  try {
    const result = await wx.cloud.callFunction({
      name: 'login',
      data: { action: 'test', test: true }
    })
    console.log('    ✅ 调用成功')
    console.log('       返回结果:', result)
  } catch (error) {
    console.log('    ❌ 调用失败')
    console.log('       错误信息:', error.message)
    console.log('       错误详情:', error)
  }
  
  console.log('')
  console.log('🎯 验证完成')
  console.log('')
  console.log('💡 如果调用失败，可能原因:')
  console.log('   1. 云函数未部署')
  console.log('   2. 数据库集合不存在')
  console.log('   3. 环境ID错误')
  console.log('   4. 网络连接问题')
}

// 运行验证
verifyCloudFunction().catch(console.error)