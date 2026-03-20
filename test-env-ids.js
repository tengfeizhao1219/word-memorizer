// 🧪 环境ID测试代码
// 在微信开发者工具控制台运行

console.log('🔍 测试环境ID配置');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 测试多个可能的环境ID
const envTests = [
  // 当前配置的环境ID
  { id: 'tengfei-workstation-7czc7ab13ca3', desc: '当前配置' },
  
  // 常见环境ID格式
  { id: 'test-123456', desc: '测试环境格式' },
  { id: 'prod-abcdef', desc: '生产环境格式' },
  
  // 可能的正确环境ID（需要你提供）
  { id: 'YOUR_CORRECT_ENV_ID', desc: '请替换为正确的环境ID' }
];

async function testEnv(envId) {
  console.log(`测试环境ID: ${envId} (${envTests.find(e => e.id === envId)?.desc || '未知'})`);
  
  try {
    // 重新初始化云开发
    wx.cloud.init({
      env: envId,
      traceUser: true
    });
    
    // 测试云函数调用
    const result = await wx.cloud.callFunction({
      name: 'user-login',
      data: { action: 'test' }
    });
    
    console.log(`  ✅ 环境 ${envId} 可用`);
    console.log(`     返回结果: ${JSON.stringify(result)}`);
    return { success: true, envId };
  } catch (error) {
    console.log(`  ❌ 环境 ${envId} 不可用`);
    console.log(`     错误信息: ${error.message}`);
    return { success: false, envId, error };
  }
}

// 运行测试
async function runAllTests() {
  console.log('开始测试所有环境ID...');
  console.log('----------------------------------------');
  
  let foundValidEnv = null;
  
  for (const env of envTests) {
    const result = await testEnv(env.id);
    console.log('');
    
    if (result.success) {
      foundValidEnv = result.envId;
      break;
    }
  }
  
  console.log('----------------------------------------');
  
  if (foundValidEnv) {
    console.log(`🎉 找到可用的环境ID: ${foundValidEnv}`);
    console.log('');
    console.log('🚀 立即操作:');
    console.log(`   1. 将 app.js 中的环境ID改为: ${foundValidEnv}`);
    console.log(`   2. 重新编译小程序`);
    console.log(`   3. 测试登录功能`);
  } else {
    console.log('❌ 所有测试的环境ID都不可用');
    console.log('');
    console.log('💡 需要你:');
    console.log('   1. 登录腾讯云控制台');
    console.log('   2. 查看正确的环境ID');
    console.log('   3. 替换测试代码中的 YOUR_CORRECT_ENV_ID');
    console.log('   4. 重新运行测试');
  }
}

// 运行测试
runAllTests().catch(console.error);