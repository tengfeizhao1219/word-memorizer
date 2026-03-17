/**
 * 部署验证测试脚本
 * 用于验证云函数和数据库是否部署成功
 */

const https = require('https');

// 配置信息
const config = {
  envId: 'tengfei-workstation-7czc7ab13ca3',
  region: 'ap-shanghai',
  baseUrl: `https://${'tengfei-workstation-7czc7ab13ca3'}.ap-shanghai.app.tcloudbase.com`
};

// 测试用例
const testCases = [
  {
    name: '环境连通性测试',
    path: '/',
    method: 'GET',
    expected: 200
  },
  {
    name: '用户登录函数测试',
    path: '/user/login',
    method: 'POST',
    data: { code: 'test_code' },
    expected: 200
  },
  {
    name: '生词列表函数测试',
    path: '/word/list',
    method: 'GET',
    expected: 200
  },
  {
    name: '复习系统函数测试',
    path: '/review/getToday',
    method: 'GET',
    expected: 200
  }
];

console.log('🧪 开始部署验证测试');
console.log('========================================');
console.log(`环境: ${config.envId}`);
console.log(`地域: ${config.region}`);
console.log(`API地址: ${config.baseUrl}`);
console.log('');

// HTTP请求函数
function makeRequest(testCase) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      port: 443,
      path: testCase.path,
      method: testCase.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (testCase.data) {
      req.write(JSON.stringify(testCase.data));
    }

    req.end();
  });
}

// 运行测试
async function runTests() {
  let passed = 0;
  let failed = 0;

  for (const testCase of testCases) {
    process.stdout.write(`🔍 ${testCase.name}... `);
    
    try {
      const result = await makeRequest(testCase);
      
      if (result.statusCode === testCase.expected) {
        console.log('✅ 通过');
        passed++;
      } else {
        console.log(`❌ 失败 (状态码: ${result.statusCode})`);
        console.log(`   响应: ${result.data.substring(0, 100)}...`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ 错误: ${error.message}`);
      failed++;
    }
    
    // 短暂延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('');
  console.log('📊 测试结果统计:');
  console.log(`   通过: ${passed}`);
  console.log(`   失败: ${failed}`);
  console.log(`   总计: ${testCases.length}`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 所有测试通过！部署成功！');
    console.log('');
    console.log('🚀 下一步:');
    console.log('   1. 注册微信小程序获取AppID');
    console.log('   2. 更新 client-mini/src/config/env.js 中的 appId');
    console.log('   3. 使用微信开发者工具导入项目');
    console.log('   4. 进行真机测试');
  } else {
    console.log('⚠️ 部分测试失败，请检查:');
    console.log('   1. 云函数是否部署成功');
    console.log('   2. 数据库集合是否创建');
    console.log('   3. 网络连接是否正常');
  }

  console.log('');
  console.log('🔗 控制台地址:');
  console.log(`   https://console.cloud.tencent.com/tcb/env/${config.envId}`);
}

// 数据库连接测试
async function testDatabase() {
  console.log('');
  console.log('🗄️ 数据库连接测试...');
  
  // 这里可以添加数据库连接测试
  // 需要云函数支持数据库测试接口
  
  console.log('📝 数据库测试需要专门的测试接口');
  console.log('💡 建议在控制台手动验证数据库集合');
}

// 主函数
async function main() {
  await runTests();
  await testDatabase();
  
  console.log('');
  console.log('========================================');
  console.log('✅ 部署验证测试完成');
}

// 执行测试
main().catch(error => {
  console.error('❌ 测试过程中出现错误:', error);
});