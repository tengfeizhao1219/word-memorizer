// 🧪 全面测试代码
// 在微信开发者工具控制台运行

console.log('🚀 开始全面测试')
console.log('时间:', new Date().toLocaleString())
console.log('')

// 1. 环境检查
console.log('1. 环境检查:')
console.log('  wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在')
console.log('  wx.cloud:', wx.cloud ? '✅ 存在' : '❌ 不存在')

if (!wx.cloud) {
    console.log('❌ 致命错误: 请检查云开发配置')
    return
}

// 2. 初始化测试
console.log('')
console.log('2. 初始化测试:')
try {
    wx.cloud.init({
        env: 'tengfei-workstation-7czc7ab13ca3',
        traceUser: true
    })
    console.log('  ✅ 初始化成功')
} catch (err) {
    console.log('  ❌ 初始化失败:', err.message)
    return
}

// 3. 云函数测试
console.log('')
console.log('3. 云函数测试:')

// 简单测试
wx.cloud.callFunction({
    name: 'login',
    data: { action: 'test' },
    success: (res) => {
        console.log('  ✅ 调用成功:', res)
    },
    fail: (err) => {
        console.log('  ❌ 调用失败:')
        console.log('     错误:', err.message)
        console.log('     代码:', err.errCode || '未知')
        console.log('     详情:', err)
    }
})

console.log('')
console.log('🎯 测试发起，请查看结果')
console.log('💡 如果失败，请提供错误信息')
