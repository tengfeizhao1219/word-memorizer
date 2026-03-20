// 🧪 环境状态诊断代码
// 在微信开发者工具控制台运行

console.log('🚀 开始环境状态诊断');
console.log('环境ID: tengfei-workstation-7czc7ab13ca3');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 基础环境检查
console.log('1. 基础环境检查:');
console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在');
console.log('  - wx.cloud:', wx.cloud ? '✅ 存在' : '❌ 不存在');

if (!wx.cloud) {
  console.log('❌ 基础环境问题，无法继续诊断');
  return;
}

// 2. 多地域测试
console.log('');
console.log('2. 多地域测试:');

const regions = [
  { name: '上海', code: 'ap-shanghai' },
  { name: '广州', code: 'ap-guangzhou' },
  { name: '北京', code: 'ap-beijing' }
];

async function testRegion(region) {
  console.log(`   测试地域: ${region.name} (${region.code})`);
  
  try {
    // 重新初始化
    wx.cloud.init({
      env: 'tengfei-workstation-7czc7ab13ca3',
      region: region.code,
      traceUser: true
    });
    
    // 测试云函数
    const result = await wx.cloud.callFunction({
      name: 'user-login',
      data: { action: 'test' }
    });
    
    console.log(`      ✅ ${region.name} 地域可用`);
    return { success: true, region: region.code };
  } catch (error) {
    console.log(`      ❌ ${region.name} 地域不可用: ${error.message}`);
    return { success: false, region: region.code, error };
  }
}

// 3. 多函数测试
console.log('');
console.log('3. 多函数测试:');

const functions = [
  { name: 'user-login', desc: '配置的函数名' },
  { name: 'login', desc: '可能的别名' },
  { name: 'test-function', desc: '测试函数' }
];

async function testFunction(funcName) {
  console.log(`   测试函数: ${funcName}`);
  
  try {
    const result = await wx.cloud.callFunction({
      name: funcName,
      data: { action: 'test' }
    });
    
    console.log(`      ✅ 函数 ${funcName} 可用`);
    return { success: true, function: funcName };
  } catch (error) {
    console.log(`      ❌ 函数 ${funcName} 不可用: ${error.message}`);
    return { success: false, function: funcName, error };
  }
}

// 4. 网络诊断
console.log('');
console.log('4. 网络诊断:');

async function testNetwork() {
  console.log('   测试网络连接...');
  
  // 测试简单请求
  try {
    const testResult = await new Promise((resolve, reject) => {
      wx.request({
        url: 'https://httpbin.org/get',
        success: resolve,
        fail: reject
      });
    });
    
    console.log('      ✅ 基础网络连接正常');
  } catch (error) {
    console.log(`      ❌ 基础网络连接失败: ${error.message}`);
  }
}

// 5. 运行所有测试
async function runAllDiagnostics() {
  console.log('开始运行所有诊断测试...');
  console.log('----------------------------------------');
  
  // 测试地域
  let foundWorkingRegion = null;
  for (const region of regions) {
    const result = await testRegion(region);
    if (result.success) {
      foundWorkingRegion = result.region;
      break;
    }
  }
  
  // 测试函数
  let foundWorkingFunction = null;
  for (const func of functions) {
    const result = await testFunction(func.name);
    if (result.success) {
      foundWorkingFunction = func.name;
      break;
    }
  }
  
  // 测试网络
  await testNetwork();
  
  console.log('----------------------------------------');
  console.log('');
  console.log('📊 诊断结果汇总:');
  console.log('----------------');
  
  if (foundWorkingRegion) {
    console.log(`✅ 找到可用的地域: ${foundWorkingRegion}`);
    console.log(`   请将配置中的地域改为: ${foundWorkingRegion}`);
  } else {
    console.log('❌ 所有测试的地域都不可用');
  }
  
  if (foundWorkingFunction) {
    console.log(`✅ 找到可用的函数名: ${foundWorkingFunction}`);
    console.log(`   请使用函数名: ${foundWorkingFunction}`);
  } else {
    console.log('❌ 所有测试的函数都不可用');
  }
  
  console.log('');
  console.log('💡 建议操作:');
  
  if (foundWorkingRegion || foundWorkingFunction) {
    console.log('   1. 根据诊断结果更新配置');
    console.log('   2. 重新编译小程序');
    console.log('   3. 测试修复后的功能');
  } else {
    console.log('   1. 检查腾讯云环境状态');
    console.log('   2. 确认环境是否被停用');
    console.log('   3. 考虑使用备用方案');
    console.log('   4. 联系腾讯云技术支持');
  }
  
  console.log('');
  console.log('🔧 备用方案:');
  console.log('   如果所有诊断都失败，可以使用:');
  console.log('   1. 模拟登录 (useMockLogin)');
  console.log('   2. 本地存储方案');
  console.log('   3. 简化版本进行测试');
}

// 运行诊断
runAllDiagnostics().catch(console.error);