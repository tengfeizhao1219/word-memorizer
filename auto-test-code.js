// 🧪 自动生成的测试代码
// 在微信开发者工具控制台中运行

console.log('🔍 开始自动测试');

// 1. 基础环境测试
function testBasicEnvironment() {
  console.log('1. 基础环境测试:');
  console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在');
  console.log('  - 页面路径:', getCurrentPages().map(p => p.route));
  return true;
}

// 2. 云开发测试
function testCloudDevelopment() {
  console.log('2. 云开发测试:');
  
  if (!wx.cloud) {
    console.log('  ❌ 云开发不可用');
    return false;
  }
  
  console.log('  ✅ 云开发可用');
  
  // 初始化
  wx.cloud.init({
    env: 'tengfei-workstation-7czc7ab13ca3',
    traceUser: true
  });
  
  return true;
}

// 3. 页面跳转测试
function testPageNavigation() {
  console.log('3. 页面跳转测试:');
  
  try {
    // 测试跳转到登录页
    wx.navigateTo({
      url: '/pages/login/login',
      success: () => console.log('  ✅ 跳转到登录页成功'),
      fail: (err) => console.log('  ⚠️ 跳转到登录页失败:', err)
    });
    
    return true;
  } catch (error) {
    console.log('  ❌ 页面跳转测试失败:', error.message);
    return false;
  }
}

// 4. 数据库连接测试
async function testDatabaseConnection() {
  console.log('4. 数据库连接测试:');
  
  if (!wx.cloud) {
    console.log('  ❌ 云开发未初始化');
    return false;
  }
  
  try {
    const db = wx.cloud.database();
    const res = await db.collection('users').count();
    console.log(`  ✅ 数据库连接成功 (users集合: ${res.total}个文档)`);
    return true;
  } catch (error) {
    console.log(`  ⚠️ 数据库连接失败 (可能权限问题): ${error.message}`);
    return false;
  }
}

// 5. 云函数测试
async function testCloudFunctions() {
  console.log('5. 云函数测试:');
  
  if (!wx.cloud) {
    console.log('  ❌ 云开发未初始化');
    return false;
  }
  
  try {
    const res = await wx.cloud.callFunction({
      name: 'login',
      data: { action: 'test' }
    });
    console.log(`  ✅ 云函数调用成功: ${JSON.stringify(res.result)}`);
    return true;
  } catch (error) {
    console.log(`  ⚠️ 云函数调用失败: ${error.message}`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行所有测试');
  console.log('----------------------------------------');
  
  const results = {
    basic: testBasicEnvironment(),
    cloud: testCloudDevelopment(),
    navigation: testPageNavigation(),
    database: await testDatabaseConnection(),
    functions: await testCloudFunctions()
  };
  
  console.log('----------------------------------------');
  console.log('📊 测试结果汇总:');
  console.log(`  基础环境: ${results.basic ? '✅' : '❌'}`);
  console.log(`  云开发: ${results.cloud ? '✅' : '❌'}`);
  console.log(`  页面跳转: ${results.navigation ? '✅' : '❌'}`);
  console.log(`  数据库: ${results.database ? '✅' : '❌'}`);
  console.log(`  云函数: ${results.functions ? '✅' : '❌'}`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(`🎯 通过率: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('✅ 所有测试通过！小程序可以正常使用。');
  } else {
    console.log('⚠️ 部分测试失败，请检查相关配置。');
  }
}

// 立即运行测试
runAllTests().catch(console.error);

// 导出测试函数供手动调用
module.exports = {
  testBasicEnvironment,
  testCloudDevelopment,
  testPageNavigation,
  testDatabaseConnection,
  testCloudFunctions,
  runAllTests
};