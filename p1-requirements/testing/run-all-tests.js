/**
 * P1需求完整测试套件
 * 测试分类管理、搜索功能、学习统计所有功能
 */

const https = require('https');
const assert = require('assert');

// 配置信息
const config = {
  envId: 'tengfei-workstation-7czc7ab13ca3',
  region: 'ap-shanghai',
  baseUrl: `https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com`,
  testUserId: 'test_user_p1_requirements',
  timeout: 10000 // 10秒超时
};

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// 测试用例容器
const testSuites = [];

/**
 * HTTP请求工具函数
 */
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(config.timeout, () => {
      req.destroy();
      reject(new Error('请求超时'));
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * 测试用例装饰器
 */
function testCase(description, testFunction) {
  return {
    description,
    run: async () => {
      testResults.total++;
      console.log(`\n🧪 测试: ${description}`);
      
      try {
        await testFunction();
        testResults.passed++;
        console.log(`  ✅ 通过`);
        return true;
      } catch (error) {
        testResults.failed++;
        testResults.errors.push({
          test: description,
          error: error.message
        });
        console.log(`  ❌ 失败: ${error.message}`);
        return false;
      }
    }
  };
}

/**
 * 测试套件装饰器
 */
function testSuite(name, tests) {
  return {
    name,
    tests,
    run: async () => {
      console.log(`\n📋 测试套件: ${name}`);
      console.log('=' .repeat(50));
      
      let suitePassed = 0;
      let suiteFailed = 0;
      
      for (const test of tests) {
        const result = await test.run();
        if (result) {
          suitePassed++;
        } else {
          suiteFailed++;
        }
      }
      
      console.log(`\n📊 套件统计: 通过 ${suitePassed}/${tests.length}`);
      return suitePassed === tests.length;
    }
  };
}

/**
 * 分类管理测试套件
 */
const categoryTests = [
  testCase('创建分类', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/category/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: '测试分类_' + Date.now(),
      description: '自动化测试创建的分类',
      color: '#4CAF50',
      icon: 'folder'
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(response.data.data.categoryId);
  }),
  
  testCase('获取分类列表', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/category/list',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(Array.isArray(response.data.data.categories));
  }),
  
  testCase('分类分页查询', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/category/list?page=1&pageSize=10',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(response.data.data.pagination);
    assert.strictEqual(response.data.data.pagination.page, 1);
    assert.strictEqual(response.data.data.pagination.pageSize, 10);
  })
];

/**
 * 搜索功能测试套件
 */
const searchTests = [
  testCase('基础关键词搜索', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/search?query=test',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(Array.isArray(response.data.data.results));
  }),
  
  testCase('搜索分页功能', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/search?query=test&page=1&pageSize=5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(response.data.data.pagination);
    assert.strictEqual(response.data.data.pagination.page, 1);
    assert.strictEqual(response.data.data.pagination.pageSize, 5);
  }),
  
  testCase('搜索建议功能', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/search/suggestions?query=te',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(Array.isArray(response.data.data.suggestions));
  })
];

/**
 * 学习统计测试套件
 */
const statsTests = [
  testCase('获取每日统计', async () => {
    const today = new Date().toISOString().split('T')[0];
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: `/stats/daily?date=${today}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(response.data.data.daily);
    assert.strictEqual(response.data.data.date, today);
  }),
  
  testCase('获取分类统计', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/stats/categories',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(Array.isArray(response.data.data.categories));
  }),
  
  testCase('获取学习趋势', async () => {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/stats/trend?days=7',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data.code, 0);
    assert.ok(Array.isArray(response.data.data.trend));
    assert.strictEqual(response.data.data.trend.length, 7);
  })
];

/**
 * 集成测试套件
 */
const integrationTests = [
  testCase('分类与生词关联', async () => {
    // 1. 创建分类
    const createResponse = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/category/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      name: '集成测试分类_' + Date.now(),
      color: '#2196F3',
      icon: 'test'
    });
    
    const categoryId = createResponse.data.data.categoryId;
    
    // 2. 添加生词到分类
    const addWordResponse = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/category/words/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, {
      categoryId: categoryId,
      wordIds: ['test_word_1', 'test_word_2']
    });
    
    assert.strictEqual(addWordResponse.statusCode, 200);
    assert.strictEqual(addWordResponse.data.code, 0);
  }),
  
  testCase('搜索与统计集成', async () => {
    // 1. 搜索
    const searchResponse = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/search?query=integration',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // 2. 获取统计
    const statsResponse = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/stats/daily',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    assert.strictEqual(searchResponse.statusCode, 200);
    assert.strictEqual(statsResponse.statusCode, 200);
  })
];

/**
 * 性能测试套件
 */
const performanceTests = [
  testCase('搜索响应时间 < 500ms', async () => {
    const startTime = Date.now();
    
    await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/search?query=performance',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`  响应时间: ${responseTime}ms`);
    assert.ok(responseTime < 500, `响应时间 ${responseTime}ms 超过500ms`);
  }),
  
  testCase('分类列表加载时间 < 300ms', async () => {
    const startTime = Date.now();
    
    await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/category/list?pageSize=5',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`  响应时间: ${responseTime}ms`);
    assert.ok(responseTime < 300, `响应时间 ${responseTime}ms 超过300ms`);
  })
];

/**
 * 运行所有测试
 */
async function runAllTests() {
  console.log('🚀 开始P1需求完整测试');
  console.log('='.repeat(60));
  console.log(`环境: ${config.envId}`);
  console.log(`时间: ${new Date().toISOString()}`);
  console.log('='.repeat(60));
  
  // 注册测试套件
  const suites = [
    testSuite('分类管理功能测试', categoryTests),
    testSuite('搜索功能测试', searchTests),
    testSuite('学习统计测试', statsTests),
    testSuite('集成测试', integrationTests),
    testSuite('性能测试', performanceTests)
  ];
  
  // 运行所有测试套件
  let allPassed = true;
  
  for (const suite of suites) {
    const suiteResult = await suite.run();
    if (!suiteResult) {
      allPassed = false;
    }
  }
  
  // 输出测试报告
  console.log('\n' + '='.repeat(60));
  console.log('📊 测试报告');
  console.log('='.repeat(60));
  console.log(`总测试用例: ${testResults.total}`);
  console.log(`通过: ${testResults.passed}`);
  console.log(`失败: ${testResults.failed}`);
  console.log(`通过率: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ 错误详情:');
    testResults.errors.forEach((error, index) => {
      console.log(`  ${index + 1}. ${error.test}`);
      console.log(`     错误: ${error.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allPassed) {
    console.log('🎉 所有测试通过！P1需求功能正常。');
    process.exit(0);
  } else {
    console.log('❌ 测试失败，请检查错误信息。');
    process.exit(1);
  }
}

/**
 * 健康检查
 */
async function healthCheck() {
  console.log('🏥 执行健康检查...');
  
  try {
    const response = await httpRequest({
      hostname: `${config.envId}.ap-shanghai.app.tcloudbase.com`,
      path: '/',
      method: 'GET',
      timeout: 5000
    });
    
    if (response.statusCode === 200) {
      console.log('✅ 环境健康检查通过');
      return true;
    } else {
      console.log(`❌ 环境健康检查失败: HTTP ${response.statusCode}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ 环境健康检查失败: ${error.message}`);
    return false;
  }
}

/**
 * 主函数
 */
async function main() {
  try {
    // 执行健康检查
    const isHealthy = await healthCheck();
    if (!isHealthy) {
      console.log('⚠️ 环境可能存在问题，但继续执行测试...');
    }
    
    // 运行所有测试
    await runAllTests();
    
  } catch (error) {
    console.error('❌ 测试执行失败:', error);
    process.exit(1);
  }
}

// 执行测试
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 测试框架错误:', error);
    process.exit(1);
  });
}

module.exports = {
  runAllTests,
  testCase,
  testSuite,
  config
};