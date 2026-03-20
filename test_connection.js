/**
 * 测试云函数和数据库连接
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'tengfei-workspace-7ef9ma8b7670ea' // 新的环境ID
});

const db = cloud.database();

async function testDatabaseConnection() {
  console.log('🔍 测试数据库连接...');
  
  try {
    // 测试数据库连接
    const collections = await db.listCollections();
    console.log('✅ 数据库连接成功！');
    console.log('📊 现有集合:', collections.map(c => c.name).join(', '));
    
    // 测试用户集合
    const usersCount = await db.collection('users').count();
    console.log(`👥 用户数量: ${usersCount.total}`);
    
    // 测试生词集合
    const wordsCount = await db.collection('words').count();
    console.log(`📚 生词数量: ${wordsCount.total}`);
    
    return true;
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
    console.error('错误详情:', error.message);
    return false;
  }
}

async function testCloudFunction() {
  console.log('\n🔍 测试云函数调用...');
  
  try {
    // 模拟调用登录云函数
    const result = await cloud.callFunction({
      name: 'login',
      data: {
        action: 'test',
        userInfo: {
          nickName: '测试用户',
          avatarUrl: ''
        }
      }
    });
    
    console.log('✅ 云函数调用成功！');
    console.log('📋 返回结果:', JSON.stringify(result, null, 2));
    return true;
  } catch (error) {
    console.error('❌ 云函数调用失败:', error);
    console.error('错误详情:', error.message);
    
    // 检查云函数是否存在
    console.log('\n🔍 检查云函数列表...');
    try {
      const functions = await cloud.callFunction({
        name: 'getFunctions',
        data: {}
      });
      console.log('📋 可用云函数:', functions);
    } catch (e) {
      console.error('❌ 无法获取云函数列表:', e.message);
    }
    
    return false;
  }
}

async function testEnvironment() {
  console.log('\n🔍 测试环境配置...');
  
  try {
    const wxContext = cloud.getWXContext();
    console.log('✅ 环境配置正常');
    console.log('📋 环境信息:', {
      env: cloud.DYNAMIC_CURRENT_ENV,
      appid: wxContext.APPID,
      openid: wxContext.OPENID ? '已获取' : '未获取'
    });
    return true;
  } catch (error) {
    console.error('❌ 环境配置错误:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 开始测试单词本系统连接...');
  console.log('='.repeat(50));
  
  const results = {
    database: await testDatabaseConnection(),
    cloudFunction: await testCloudFunction(),
    environment: await testEnvironment()
  };
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果汇总:');
  console.log('='.repeat(50));
  
  Object.entries(results).forEach(([test, passed]) => {
    console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? '通过' : '失败'}`);
  });
  
  const allPassed = Object.values(results).every(r => r);
  
  if (allPassed) {
    console.log('\n🎉 所有测试通过！系统连接正常。');
  } else {
    console.log('\n⚠️  部分测试失败，需要检查配置。');
    console.log('\n🔧 建议检查:');
    console.log('1. 环境ID是否正确: tengfei-workstation-7czc7ab13ca3');
    console.log('2. 云函数是否已部署');
    console.log('3. 数据库集合是否已创建');
    console.log('4. 微信小程序AppID配置是否正确');
  }
  
  return allPassed;
}

// 执行测试
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  testDatabaseConnection,
  testCloudFunction,
  testEnvironment,
  main
};