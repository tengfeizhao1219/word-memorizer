/**
 * 健康检查脚本 - 检查系统所有组件状态
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class HealthCheck {
  constructor(envId = 'tengfei-workstation-7czc7ab13ca3') {
    this.envId = envId;
    this.baseUrl = `https://${envId}.ap-shanghai.app.tcloudbase.com`;
    this.healthStatus = {
      overall: 'UNKNOWN',
      components: {},
      timestamp: null,
      details: {}
    };
    
    // 创建健康检查日志目录
    this.logDir = path.join(__dirname, '../logs/health');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // 检查环境连通性
  async checkEnvironment() {
    console.log('🔍 检查环境连通性...');
    
    try {
      const result = await this.makeRequest('GET', '/');
      
      if (result.statusCode === 200 || result.statusCode === 404) {
        return {
          status: 'HEALTHY',
          message: '环境可访问',
          details: {
            statusCode: result.statusCode,
            responseTime: result.responseTime
          }
        };
      } else {
        return {
          status: 'UNHEALTHY',
          message: `环境返回异常状态码: ${result.statusCode}`,
          details: {
            statusCode: result.statusCode,
            response: result.data
          }
        };
      }
    } catch (error) {
      return {
        status: 'UNHEALTHY',
        message: `环境连接失败: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  // 检查云函数
  async checkCloudFunctions() {
    console.log('🔍 检查云函数状态...');
    
    const functions = [
      { name: 'user-login', path: '/user/login', method: 'POST' },
      { name: 'user-getInfo', path: '/user/getInfo', method: 'GET' },
      { name: 'word-add', path: '/word/add', method: 'POST' },
      { name: 'word-list', path: '/word/list', method: 'GET' },
      { name: 'word-detail', path: '/word/detail', method: 'GET' },
      { name: 'word-search', path: '/word/search', method: 'GET' },
      { name: 'word-import', path: '/word/import', method: 'POST' },
      { name: 'word-export', path: '/word/export', method: 'POST' },
      { name: 'review-getToday', path: '/review/getToday', method: 'GET' },
      { name: 'review-submit', path: '/review/submit', method: 'POST' }
    ];

    const results = {};
    let healthyCount = 0;
    let unhealthyCount = 0;

    for (const func of functions) {
      console.log(`   检查 ${func.name}...`);
      
      try {
        const result = await this.makeRequest(func.method, func.path, 
          func.method === 'POST' ? { test: true } : null
        );

        if (result.statusCode === 200 || result.statusCode === 400) {
          // 400可能是参数错误，但函数本身是正常的
          results[func.name] = {
            status: 'HEALTHY',
            message: '函数可访问',
            details: {
              statusCode: result.statusCode,
              responseTime: result.responseTime,
              endpoint: func.path
            }
          };
          healthyCount++;
        } else {
          results[func.name] = {
            status: 'UNHEALTHY',
            message: `函数返回异常状态码: ${result.statusCode}`,
            details: {
              statusCode: result.statusCode,
              response: result.data,
              endpoint: func.path
            }
          };
          unhealthyCount++;
        }
      } catch (error) {
        results[func.name] = {
          status: 'UNHEALTHY',
          message: `函数调用失败: ${error.message}`,
          details: {
            error: error.message,
            endpoint: func.path
          }
        };
        unhealthyCount++;
      }

      // 避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return {
      overall: unhealthyCount === 0 ? 'HEALTHY' : 
               (healthyCount > unhealthyCount ? 'DEGRADED' : 'UNHEALTHY'),
      functions: results,
      summary: {
        total: functions.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount,
        healthyPercentage: (healthyCount / functions.length * 100).toFixed(1) + '%'
      }
    };
  }

  // 检查数据库连接（通过API间接检查）
  async checkDatabase() {
    console.log('🔍 检查数据库连接...');
    
    // 通过调用需要数据库的API来检查
    const testEndpoints = [
      { name: '用户登录', path: '/user/login', method: 'POST' },
      { name: '生词列表', path: '/word/list', method: 'GET' }
    ];

    const results = [];
    
    for (const endpoint of testEndpoints) {
      try {
        const result = await this.makeRequest(endpoint.method, endpoint.path, 
          endpoint.method === 'POST' ? { code: 'test_db_check' } : null
        );

        if (result.statusCode === 200) {
          results.push({
            name: endpoint.name,
            status: 'HEALTHY',
            message: '数据库连接正常',
            details: {
              statusCode: result.statusCode,
              responseTime: result.responseTime
            }
          });
        } else if (result.statusCode === 500) {
          // 500错误可能是数据库问题
          results.push({
            name: endpoint.name,
            status: 'UNHEALTHY',
            message: '数据库可能有问题',
            details: {
              statusCode: result.statusCode,
              response: result.data
            }
          });
        } else {
          // 其他状态码（如400）可能是参数问题，不是数据库问题
          results.push({
            name: endpoint.name,
            status: 'HEALTHY',
            message: 'API可访问，数据库可能正常',
            details: {
              statusCode: result.statusCode,
              responseTime: result.responseTime
            }
          });
        }
      } catch (error) {
        results.push({
          name: endpoint.name,
          status: 'UNKNOWN',
          message: `检查失败: ${error.message}`,
          details: { error: error.message }
        });
      }
    }

    // 判断整体状态
    const healthyCount = results.filter(r => r.status === 'HEALTHY').length;
    const unhealthyCount = results.filter(r => r.status === 'UNHEALTHY').length;
    
    let overallStatus = 'UNKNOWN';
    if (healthyCount === results.length) {
      overallStatus = 'HEALTHY';
    } else if (unhealthyCount > 0) {
      overallStatus = 'UNHEALTHY';
    } else if (healthyCount > 0) {
      overallStatus = 'DEGRADED';
    }

    return {
      overall: overallStatus,
      endpoints: results,
      summary: {
        total: results.length,
        healthy: healthyCount,
        unhealthy: unhealthyCount
      }
    };
  }

  // 检查响应时间
  async checkResponseTimes() {
    console.log('🔍 检查响应时间...');
    
    const endpoints = [
      { name: '环境根路径', path: '/', method: 'GET' },
      { name: '用户登录', path: '/user/login', method: 'POST' },
      { name: '生词列表', path: '/word/list', method: 'GET' }
    ];

    const results = [];
    const thresholds = {
      excellent: 500,   // 优秀: <500ms
      good: 1000,       // 良好: <1000ms
      acceptable: 2000, // 可接受: <2000ms
      slow: 5000        // 慢: >5000ms
    };

    for (const endpoint of endpoints) {
      try {
        const startTime = Date.now();
        await this.makeRequest(endpoint.method, endpoint.path, 
          endpoint.method === 'POST' ? { test: 'response_time' } : null
        );
        const responseTime = Date.now() - startTime;

        let status = 'UNKNOWN';
        if (responseTime < thresholds.excellent) status = 'EXCELLENT';
        else if (responseTime < thresholds.good) status = 'GOOD';
        else if (responseTime < thresholds.acceptable) status = 'ACCEPTABLE';
        else if (responseTime < thresholds.slow) status = 'SLOW';
        else status = 'VERY_SLOW';

        results.push({
          name: endpoint.name,
          endpoint: endpoint.path,
          responseTime: responseTime,
          status: status,
          threshold: thresholds
        });
      } catch (error) {
        results.push({
          name: endpoint.name,
          endpoint: endpoint.path,
          responseTime: null,
          status: 'ERROR',
          error: error.message
        });
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // 计算平均响应时间
    const validResults = results.filter(r => r.responseTime !== null);
    const avgResponseTime = validResults.length > 0 ?
      validResults.reduce((sum, r) => sum + r.responseTime, 0) / validResults.length : 0;

    let overallStatus = 'UNKNOWN';
    if (validResults.length === 0) {
      overallStatus = 'ERROR';
    } else if (avgResponseTime < thresholds.excellent) {
      overallStatus = 'EXCELLENT';
    } else if (avgResponseTime < thresholds.good) {
      overallStatus = 'GOOD';
    } else if (avgResponseTime < thresholds.acceptable) {
      overallStatus = 'ACCEPTABLE';
    } else if (avgResponseTime < thresholds.slow) {
      overallStatus = 'SLOW';
    } else {
      overallStatus = 'VERY_SLOW';
    }

    return {
      overall: overallStatus,
      averageResponseTime: avgResponseTime,
      endpoints: results,
      thresholds: thresholds
    };
  }

  // 发送HTTP请求
  async makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      
      const options = {
        hostname: `${this.envId}.ap-shanghai.app.tcloudbase.com`,
        port: 443,
        path: path,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10秒超时
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
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
              responseTime: responseTime,
              raw: responseData
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              data: { error: 'Invalid JSON', raw: responseData },
              responseTime: responseTime,
              raw: responseData
            });
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('请求超时'));
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // 运行完整健康检查
  async runFullCheck() {
    console.log('🏥 开始完整健康检查');
    console.log('========================================');
    console.log(`环境: ${this.envId}`);
    console.log(`时间: ${new Date().toISOString()}`);
    console.log('');
    
    this.healthStatus.timestamp = new Date().toISOString();
    
    // 并行运行检查
    const [environment, cloudFunctions, database, responseTimes] = await Promise.all([
      this.checkEnvironment(),
      this.checkCloudFunctions(),
      this.checkDatabase(),
      this.checkResponseTimes()
    ]);
    
    // 更新状态
    this.healthStatus.components = {
      environment,
      cloudFunctions,
      database,
      responseTimes
    };
    
    // 计算整体状态
    const componentStatuses = [
      environment.status || environment.overall,
      cloudFunctions.overall,
      database.overall,
      responseTimes.overall
    ];
    
    if (componentStatuses.every(s => s === 'HEALTHY' || s === 'EXCELLENT' || s === 'GOOD')) {
      this.healthStatus.overall = 'HEALTHY';
    } else if (componentStatuses.some(s => s === 'UNHEALTHY' || s === 'ERROR')) {
      this.healthStatus.overall = 'UNHEALTHY';
    } else {
      this.healthStatus.overall = 'DEGRADED';
    }
    
    // 生成报告
    this.generateReport();
    
    // 保存状态
    this.saveHealthStatus();
    
    return this.healthStatus;
  }

  // 生成健康检查报告
  generateReport() {
    console.log('📊 健康检查报告');
    console.log('========================================');
    console.log(`整体状态: ${this.getStatusEmoji(this.healthStatus.overall)} ${this.healthStatus.overall}`);
    console.log(`检查时间: ${this.healthStatus.timestamp}`);
    console.log('');
    
    // 环境状态
    const env = this.healthStatus.components.environment;
    console.log('🌍 环境状态:');
    console.log(`   状态: ${this.getStatusEmoji(env.status)} ${env.status}`);
    console.log(`   消息: ${env.message}`);
    if (env.details.responseTime) {
      console.log(`   响应时间: ${env.details.responseTime}ms`);
    }
    console.log('');
    
    // 云函数状态
    const funcs = this.healthStatus.components.cloudFunctions;
    console.log('⚡ 云函数状态:');
    console.log(`   整体: ${this.getStatusEmoji(funcs.overall)} ${funcs.overall}`);
    console.log(`   健康: ${funcs.summary.healthy}/${funcs.summary.total} (${funcs.summary.healthyPercentage})`);
    
    // 显示有问题的函数
    const unhealthyFuncs = Object.entries(funcs.functions)
      .filter(([_, status]) => status.status === 'UNHEALTHY');
    
    if (unhealthyFuncs.length > 0) {
      console.log(`   有问题的函数:`);
      unhealthyFuncs.forEach(([name, status]) => {
        console.log(`     - ${name}: ${status.message}`);
      });
    }
    console.log('');
    
    // 数据库状态
    const db = this.healthStatus.components.database;
    console.log('🗄️ 数据库状态:');
    console.log(`   整体: ${this.getStatusEmoji(db.overall)} ${db.overall}`);
    db.endpoints.forEach(endpoint => {
      console.log(`   ${endpoint.name}: ${this.getStatusEmoji(endpoint.status)} ${endpoint.status}`);
    });
    console.log('');
    
    // 响应时间
    const rt = this.healthStatus.components.responseTimes;
    console.log('⏱️ 响应时间:');
    console.log(`   整体: ${this.getStatusEmoji(rt.overall)} ${rt.overall}`);
    console.log(`   平均: ${rt.averageResponseTime.toFixed(2)}ms`);
    
    rt.endpoints.forEach(endpoint => {
      const time = endpoint.responseTime ? `${endpoint.responseTime}ms` : 'N/A';
      console.log(`   ${endpoint.name}: ${time} (${endpoint.status})`);
    });
    console.log('');
    
    // 建议
    console.log('💡 建议:');
    if (this.healthStatus.overall === 'HEALTHY') {
      console.log('   ✅ 系统运行正常，无需操作');
    } else if (this.healthStatus.overall === 'DEGRADED') {
      console.log('   ⚠️ 系统性能下降，建议监控并优化');
    } else {
      console.log('   ❌ 系统有问题，需要立即检查');
      console.log('      1. 检查云函数日志');
      console.log('      2. 验证数据库连接');
      console.log('      3. 检查网络配置');
    }
    console.log('');
    
    console.log('🔗 控制台地址:');
    console.log(`   https://console.cloud.tencent.com/tcb/env/${this.envId}`);
  }

  // 获取状态表情符号
  getStatusEmoji(status) {
    const emojiMap = {
      'HEALTHY': '✅',
      'EXCELLENT': '🎯',
      'GOOD': '👍',
      'ACCEPTABLE': '⚠️',
      'DEGRADED': '🔶',
      'UNHEALTHY': '❌',
      'ERROR': '💥',
      'SLOW': '🐌',
      'VERY_SLOW': '🚨',
      'UNKNOWN': '❓'
    };
    
    return emojiMap[status] || '❓';
  }

  // 保存健康状态
  saveHealthStatus() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const statusFile = path.join(this.logDir, `health-status-${timestamp}.json`);
    
    fs.writeFileSync(statusFile, JSON.stringify(this.healthStatus, null, 2));
    
    // 同时保存到最新状态文件
    const latestFile = path.join(this.logDir, 'health-status-latest.json');
    fs.writeFileSync(latestFile, JSON.stringify(this.healthStatus, null, 2));
    
    console.log(`