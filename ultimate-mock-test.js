// 🎯 终极模拟登录测试
// 确保函数完全正常工作

console.log('🎯 终极模拟登录测试');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 测试1: 直接调用并检查返回值
function testFunctionReturn() {
  console.log('1. 测试函数返回值:');
  
  try {
    // 获取页面
    const pages = getCurrentPages();
    if (!pages || pages.length === 0) {
      console.log('   ⚠️ 请确保在登录页面运行此测试');
      return { success: false, reason: '不在页面上下文' };
    }
    
    const page = pages[pages.length - 1];
    console.log('   当前页面:', page.route);
    
    if (!page || typeof page.useMockLogin !== 'function') {
      console.log('   ❌ useMockLogin不是函数');
      return { success: false, reason: '函数不存在' };
    }
    
    console.log('   ✅ useMockLogin是函数');
    
    // 调用函数
    const testData = {
      nickName: '终极测试用户',
      avatarUrl: ''
    };
    
    console.log('   🧪 调用函数...');
    const result = page.useMockLogin(testData);
    
    console.log('   📊 调用完成');
    console.log('      返回值类型:', typeof result);
    console.log('      返回值:', result);
    
    if (result === undefined) {
      console.log('   ❌ 函数返回undefined');
      return { success: false, reason: '返回undefined' };
    }
    
    if (result && result.userId) {
      console.log('   ✅ 函数返回有效数据');
      console.log('      用户ID:', result.userId);
      console.log('      昵称:', result.userInfo?.nickName || '未知');
      return { success: true, data: result };
    } else {
      console.log('   ⚠️ 返回数据不完整');
      return { success: false, reason: '数据不完整', data: result };
    }
  } catch (error) {
    console.log('   ❌ 调用出错:', error.message);
    console.log('      堆栈:', error.stack);
    return { success: false, reason: '调用出错', error: error };
  }
}

// 测试2: 检查本地存储
function testLocalStorage() {
  console.log('');
  console.log('2. 检查本地存储（延迟检查）:');
  
  return new Promise((resolve) => {
    setTimeout(() => {
      try {
        const userId = wx.getStorageSync('userId');
        const userInfo = wx.getStorageSync('userInfo');
        const isMockUser = wx.getStorageSync('isMockUser');
        const userStats = wx.getStorageSync('userStats');
        
        console.log('   用户ID:', userId || '未设置');
        console.log('   用户信息:', userInfo ? '✅ 已保存' : '❌ 未保存');
        console.log('   模拟用户:', isMockUser ? '✅ 是' : '❌ 否');
        console.log('   用户统计:', userStats ? '✅ 已保存' : '❌ 未保存');
        
        if (userId && isMockUser) {
          console.log('   ✅ 本地存储数据完整');
          resolve({ success: true, userId, userInfo, isMockUser });
        } else {
          console.log('   ❌ 本地存储数据不完整');
          resolve({ success: false, userId, userInfo, isMockUser });
        }
      } catch (error) {
        console.log('   ❌ 检查存储出错:', error.message);
        resolve({ success: false, error: error.message });
      }
    }, 800);
  });
}

// 测试3: 简单备用测试
function simpleBackupTest() {
  console.log('');
  console.log('3. 简单备用测试（如果上述失败）:');
  console.log('   运行以下代码手动测试:');
  console.log(`
    // 清理旧数据
    wx.removeStorageSync('userId');
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('isMockUser');
    
    // 获取页面
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    
    // 查看函数定义
    console.log('函数:', page.useMockLogin);
    console.log('函数类型:', typeof page.useMockLogin);
    
    // 尝试调用
    try {
      const result = page.useMockLogin({nickName: '测试'});
      console.log('结果:', result);
    } catch(e) {
      console.log('错误:', e);
    }
  `);
}

// 运行所有测试
async function runAllTests() {
  console.log('开始终极测试...');
  console.log('----------------------------------------');
  
  // 测试1
  const funcResult = testFunctionReturn();
  
  // 测试2（延迟）
  const storageResult = await testLocalStorage();
  
  console.log('');
  console.log('----------------------------------------');
  console.log('📊 测试结果汇总:');
  console.log('----------------------------------------');
  
  console.log('函数调用:', funcResult.success ? '✅ 成功' : '❌ 失败');
  if (!funcResult.success) {
    console.log('   原因:', funcResult.reason);
  }
  
  console.log('本地存储:', storageResult.success ? '✅ 成功' : '❌ 失败');
  
  console.log('');
  console.log('🎯 结论:');
  
  if (funcResult.success && storageResult.success) {
    console.log('✅ 模拟登录函数完全正常工作！');
    console.log('');
    console.log('🚀 可以立即开始开发:');
    console.log('   1. 等待页面跳转到首页');
    console.log('   2. 查看首页模拟数据');
    console.log('   3. 测试所有功能');
    console.log('   4. 开始正式开发');
  } else if (funcResult.success && !storageResult.success) {
    console.log('⚠️ 函数调用成功但数据未保存');
    console.log('💡 需要检查本地存储权限或代码');
  } else if (!funcResult.success && storageResult.success) {
    console.log('⚠️ 数据已保存但函数返回有问题');
    console.log('💡 需要检查函数返回值');
  } else {
    console.log('❌ 模拟登录需要进一步修复');
    console.log('');
    console.log('🔧 建议操作:');
    console.log('   1. 重新编译小程序');
    console.log('   2. 检查控制台错误');
    console.log('   3. 运行简单备用测试');
    console.log('   4. 提供具体错误信息');
  }
  
  // 显示备用测试
  if (!funcResult.success || !storageResult.success) {
    simpleBackupTest();
  }
  
  return { funcResult, storageResult };
}

// 运行测试
runAllTests().then(result => {
  console.log('');
  console.log('🔧 技术支持:');
  console.log('   如果测试失败，请提供:');
  console.log('   1. 完整的控制台输出');
  console.log('   2. 具体的错误信息');
  console.log('   3. 操作步骤描述');
  console.log('');
  console.log('我会根据结果立即修复。');
}).catch(error => {
  console.log('❌ 测试运行出错:', error);
});