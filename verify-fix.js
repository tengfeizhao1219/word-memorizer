// 🔧 修复验证测试
// 验证useMockLogin函数是否修复成功

console.log('🔍 验证模拟登录修复');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 检查useMockLogin函数
console.log('1. 检查useMockLogin函数:');

// 获取当前页面
const pages = getCurrentPages();
const currentPage = pages[pages.length - 1];

if (currentPage) {
  console.log('   当前页面:', currentPage.route);
  
  if (typeof currentPage.useMockLogin === 'function') {
    console.log('   ✅ useMockLogin函数存在');
    
    // 测试函数
    const testUserInfo = {
      nickName: '验证测试用户',
      avatarUrl: ''
    };
    
    try {
      console.log('   🧪 测试函数调用...');
      const result = currentPage.useMockLogin(testUserInfo);
      console.log('   ✅ 函数调用成功');
      console.log('      返回结果:', result);
    } catch (error) {
      console.log('   ❌ 函数调用失败:', error.message);
    }
  } else {
    console.log('   ❌ useMockLogin函数不存在');
    console.log('   💡 需要进一步修复');
  }
} else {
  console.log('   ⚠️ 无法获取当前页面');
  console.log('   💡 请确保在页面上下文中运行');
}

// 2. 检查全局函数
console.log('');
console.log('2. 检查全局函数:');

if (typeof window.mockLogin === 'function') {
  console.log('   ✅ window.mockLogin函数存在');
} else {
  console.log('   ❌ window.mockLogin函数不存在');
  console.log('   💡 运行 global-mock-test.js 加载全局函数');
}

// 3. 立即测试建议
console.log('');
console.log('3. 立即测试建议:');

console.log('   🎯 如果useMockLogin存在:');
console.log('       在控制台运行:');
console.log('       const pages = getCurrentPages();');
console.log('       const page = pages[pages.length - 1];');
console.log('       page.useMockLogin({nickName: "测试"});');
console.log('');
console.log('   🎯 如果useMockLogin不存在:');
console.log('       运行全局函数:');
console.log('       window.mockLogin("测试用户");');
console.log('');
console.log('   🎯 或者运行完整测试:');
console.log('       运行 test-mock-now.js');

console.log('');
console.log('🔧 修复状态:');
console.log('   useMockLogin函数应该现在可用');