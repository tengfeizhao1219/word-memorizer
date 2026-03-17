/**
 * API测试套件 - 用于验证所有云函数
 * 可以在数据库和HTTP服务配置后运行
 */

const https = require('https');

class APITestSuite {
  constructor(envId = 'tengfei-workstation-7czc7ab13ca3') {
    this.baseUrl = `https://${envId}.ap-shanghai.app.tcloudbase.com`;
    this.envId = envId;
    this.testResults = [];
    this.testToken = null;
  }

  // 发送HTTP请求
  async request(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: `${this.envId}.ap-shanghai.app.tcloudbase.com`,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          try {
            const parsed = responseData ? JSON.parse(responseData) : {};
            resolve({
              statusCode: res.statusCode,
              data: parsed,
              raw: responseData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: { error: 'Invalid JSON', raw: responseData },
              raw: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // 测试用例：环境连通性
  async testEnvironmentConnectivity() {
    console.log('🔍 测试环境连通性...');
    
    try {
      const result = await this.request('GET', '/');
      
      if (result.statusCode === 200 || result.statusCode === 404) {
        console.log('✅ 环境连通性测试通过');
        return true;
      } else {
        console.log(`❌ 环境连通性测试失败: ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 环境连通性测试错误: ${error.message}`);
      return false;
    }
  }

  // 测试用例：用户登录
  async testUserLogin() {
    console.log('🔍 测试用户登录...');
    
    try {
      const result = await this.request('POST', '/user/login', {
        code: 'test_wx_code_123'
      });

      if (result.statusCode === 200 && result.data.code === 0) {
        this.testToken = result.data.data.token;
        console.log('✅ 用户登录测试通过');
        console.log(`   获取到token: ${this.testToken?.substring(0, 20)}...`);
        return true;
      } else {
        console.log(`❌ 用户登录测试失败: ${result.statusCode}`);
        console.log(`   响应: ${JSON.stringify(result.data)}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 用户登录测试错误: ${error.message}`);
      return false;
    }
  }

  // 测试用例：获取用户信息
  async testGetUserInfo() {
    if (!this.testToken) {
      console.log('⚠️ 跳过用户信息测试，需要先登录');
      return false;
    }

    console.log('🔍 测试获取用户信息...');
    
    try {
      const result = await this.request('GET', '/user/getInfo', null, {
        'Authorization': `Bearer ${this.testToken}`
      });

      if (result.statusCode === 200 && result.data.code === 0) {
        console.log('✅ 获取用户信息测试通过');
        return true;
      } else {
        console.log(`❌ 获取用户信息测试失败: ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 获取用户信息测试错误: ${error.message}`);
      return false;
    }
  }

  // 测试用例：添加生词
  async testAddWord() {
    if (!this.testToken) {
      console.log('⚠️ 跳过添加生词测试，需要先登录');
      return false;
    }

    console.log('🔍 测试添加生词...');
    
    const testWord = {
      word: 'example',
      phoneticUs: '/ɪgˈzæmpəl/',
      phoneticUk: '/ɪgˈzɑːmpəl/',
      definitions: [{
        pos: 'n.',
        meaning: '例子，范例',
        examples: [{
          en: 'This is a good example.',
          zh: '这是一个好例子。'
        }]
      }],
      categories: ['测试分类'],
      difficulty: 'medium',
      notes: '测试用生词'
    };

    try {
      const result = await this.request('POST', '/word/add', testWord, {
        'Authorization': `Bearer ${this.testToken}`
      });

      if (result.statusCode === 200 && result.data.code === 0) {
        console.log('✅ 添加生词测试通过');
        return true;
      } else {
        console.log(`❌ 添加生词测试失败: ${result.statusCode}`);
        console.log(`   响应: ${JSON.stringify(result.data)}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 添加生词测试错误: ${error.message}`);
      return false;
    }
  }

  // 测试用例：获取生词列表
  async testGetWordList() {
    if (!this.testToken) {
      console.log('⚠️ 跳过生词列表测试，需要先登录');
      return false;
    }

    console.log('🔍 测试获取生词列表...');
    
    try {
      const result = await this.request('GET', '/word/list?page=1&limit=10', null, {
        'Authorization': `Bearer ${this.testToken}`
      });

      if (result.statusCode === 200 && result.data.code === 0) {
        console.log('✅ 获取生词列表测试通过');
        return true;
      } else {
        console.log(`❌ 获取生词列表测试失败: ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 获取生词列表测试错误: ${error.message}`);
      return false;
    }
  }

  // 测试用例：搜索生词
  async testSearchWords() {
    if (!this.testToken) {
      console.log('⚠️ 跳出生词搜索测试，需要先登录');
      return false;
    }

    console.log('🔍 测试搜索生词...');
    
    try {
      const result = await this.request('GET', '/word/search?q=exam', null, {
        'Authorization': `Bearer ${this.testToken}`
      });

      if (result.statusCode === 200 && result.data.code === 0) {
        console.log('✅ 搜索生词测试通过');
        return true;
      } else {
        console.log(`❌ 搜索生词测试失败: ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 搜索生词测试错误: ${error.message}`);
      return false;
    }
  }

  // 测试用例：获取今日复习
  async testGetTodayReview() {
    if (!this.testToken) {
      console.log('⚠️ 跳过今日复习测试，需要先登录');
      return false;
    }

    console.log('🔍 测试获取今日复习...');
    
    try {
      const result = await this.request('GET', '/review/getToday', null, {
        'Authorization': `Bearer ${this.testToken}`
      });

      if (result.statusCode === 200 && result.data.code === 0) {
        console.log('✅ 获取今日复习测试通过');
        return true;
      } else {
        console.log(`❌ 获取今日复习测试失败: ${result.statusCode}`);
        return false;
      }
    } catch (error) {
      console.log(`❌ 获取今日复习测试错误: ${error.message}`);
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    console.log('🧪 开始运行API测试套件');
    console.log('========================================');
    console.log(`环境: ${this.envId}`);
    console.log(`API地址: ${this.baseUrl}`);
    console.log('');

    const tests = [
      { name: '环境连通性', fn: () => this.testEnvironmentConnectivity() },
      { name: '用户登录', fn: () => this.testUserLogin() },
      { name: '获取用户信息', fn: () => this.testGetUserInfo() },
      { name: '添加生词', fn: () => this.testAddWord() },
      { name: '获取生词列表', fn: () => this.testGetWordList() },
      { name: '搜索生词', fn: () => this.testSearchWords() },
      { name: '获取今日复习', fn: () => this.testGetTodayReview() }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
      const success = await test.fn();
      
      if (success) {
        passed++;
        this.testResults.push({ test: test.name, status: 'passed' });
      } else {
        failed++;
        this.testResults.push({ test: test.name, status: 'failed' });
      }

      // 测试间延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('');
    console.log('📊 测试结果统计:');
    console.log(`   通过: ${passed}`);
    console.log(`   失败: ${failed}`);
    console.log(`   总计: ${tests.length}`);
    console.log('');

    if (failed === 0) {
      console.log('🎉 所有API测试通过！系统运行正常。');
    } else {
      console.log('⚠️ 部分测试失败，请检查:');
      console.log('   1. 数据库集合是否创建');
      console.log('   2. HTTP访问服务是否配置');
      console.log('   3. 云函数日志是否有错误');
    }

    console.log('');
    console.log('🔗 控制台地址:');
    console.log(`   https://console.cloud.tencent.com/tcb/env/${this.envId}`);

    return { passed, failed, total: tests.length };
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const envId = process.argv[2] || 'tengfei-workstation-7czc7ab13ca3';
  const testSuite = new APITestSuite(envId);
  
  testSuite.runAllTests().catch(error => {
    console.error('❌ 测试套件运行错误:', error);
    process.exit(1);
  });
}

module.exports = APITestSuite;