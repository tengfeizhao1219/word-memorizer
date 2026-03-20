// 🧪 诊断测试代码
// 在微信开发者工具控制台运行

console.log('🔍 开始诊断测试')
console.log('时间:', new Date().toLocaleString())

// 1. 基础环境
console.log('1. 基础环境:')
console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在')
console.log('  - 页面对象:', typeof getCurrentPages !== 'undefined' ? '✅ 存在' : '❌ 不存在')

// 2. 当前页面
if (typeof getCurrentPages !== 'undefined' && getCurrentPages().length > 0) {
  const pages = getCurrentPages()
  console.log('2. 当前页面:')
  pages.forEach((page, i) => {
    console.log(`  - 页面${i}: ${page.route}`)
  })
} else {
  console.log('2. 当前页面: ⚠️ 无页面或getCurrentPages不可用')
}

// 3. 简单功能测试
console.log('3. 功能测试:')
try {
  // 测试console.log
  console.log('  - console.log: ✅ 正常')
  
  // 测试简单计算
  const testCalc = 1 + 1
  console.log(`  - JavaScript计算: ✅ 正常 (1+1=${testCalc})`)
  
  console.log('✅ 基础诊断完成')
} catch (error) {
  console.log(`  - 功能测试: ❌ 失败 - ${error.message}`)
}

// 4. 错误捕获测试
console.log('4. 错误捕获:')
try {
  // 故意触发错误
  undefinedFunction()
} catch (error) {
  console.log(`  - 错误捕获: ✅ 正常 - ${error.message}`)
}

console.log('🎯 诊断完成，请提供控制台输出')
