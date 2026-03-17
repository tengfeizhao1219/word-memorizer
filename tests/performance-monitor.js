/**
 * 性能监控脚本 - 监控API响应时间和成功率
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class PerformanceMonitor {
  constructor(envId = 'tengfei-workstation-7czc7ab13ca3') {
    this.envId = envId;
    this.baseUrl = `https://${envId}.ap-shanghai.app.tcloudbase.com`;
    this.metrics = {
      requests: 0,
      successes: 0,
      failures: 0,
      totalResponseTime: 0,
      endpoints: {}
    };
    
    // 创建日志目录
    this.logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  // 发送请求并记录性能
  async measureRequest(method, endpoint, data = null, headers = {}) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const options = {
        hostname: `${this.envId}.ap-shanghai.app.tcloudbase.com`,
        port: 443,
        path: endpoint,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = https.request(options, (res) => {
        const responseTime = Date.now() - startTime;
        let responseData = '';
        
        res.on('data', (chunk) => {
          responseData += chunk;
        });

        res.on('end', () => {
          // 记录指标
          this.recordMetrics(endpoint, responseTime, res.statusCode);
          
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
        const responseTime = Date.now() - startTime;
        this.recordMetrics(endpoint, responseTime, 0, error.message);
        reject(error);
      });

      if (data) {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // 记录性能指标
  recordMetrics(endpoint, responseTime, statusCode, error = null) {
    this.metrics.requests++;
    
    if (statusCode >= 200 && statusCode < 300) {
      this.metrics.successes++;
    } else {
      this.metrics.failures++;
    }
    
    this.metrics.totalResponseTime += responseTime;
    
    // 记录端点特定指标
    if (!this.metrics.endpoints[endpoint]) {
      this.metrics.endpoints[endpoint] = {
        requests: 0,
        successes: 0,
        failures: 0,
        totalResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        errors: []
      };
    }
    
    const endpointMetrics = this.metrics.endpoints[endpoint];
    endpointMetrics.requests++;
    
    if (statusCode >= 200 && statusCode < 300) {
      endpointMetrics.successes++;
    } else {
      endpointMetrics.failures++;
      if (error) {
        endpointMetrics.errors.push({
          timestamp: new Date().toISOString(),
          error: error,
          statusCode: statusCode
        });
      }
    }
    
    endpointMetrics.totalResponseTime += responseTime;
    endpointMetrics.minResponseTime = Math.min(endpointMetrics.minResponseTime, responseTime);
    endpointMetrics.maxResponseTime = Math.max(endpointMetrics.maxResponseTime, responseTime);
    
    // 定期保存指标
    if (this.metrics.requests % 10 === 0) {
      this.saveMetrics();
    }
  }

  // 保存指标到文件
  saveMetrics() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `metrics-${timestamp}.json`;
    const filepath = path.join(this.logDir, filename);
    
    const metricsToSave = {
      timestamp: new Date().toISOString(),
      summary: {
        totalRequests: this.metrics.requests,
        successRate: this.metrics.requests > 0 ? 
          (this.metrics.successes / this.metrics.requests * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: this.metrics.requests > 0 ? 
          (this.metrics.totalResponseTime / this.metrics.requests).toFixed(2) + 'ms' : '0ms'
      },
      endpoints: {}
    };
    
    // 计算每个端点的指标
    for (const [endpoint, data] of Object.entries(this.metrics.endpoints)) {
      metricsToSave.endpoints[endpoint] = {
        requests: data.requests,
        successRate: data.requests > 0 ? 
          (data.successes / data.requests * 100).toFixed(2) + '%' : '0%',
        averageResponseTime: data.requests > 0 ? 
          (data.totalResponseTime / data.requests).toFixed(2) + 'ms' : '0ms',
        minResponseTime: data.minResponseTime === Infinity ? 0 : data.minResponseTime + 'ms',
        maxResponseTime: data.maxResponseTime + 'ms',
        recentErrors: data.errors.slice(-5) // 最近5个错误
      };
    }
    
    fs.writeFileSync(filepath, JSON.stringify(metricsToSave, null, 2));
    console.log(`📊 指标已保存到: ${filepath}`);
  }

  // 生成性能报告
  generateReport() {
    console.log('📈 性能监控报告');
    console.log('========================================');
    console.log(`环境: ${this.envId}`);
    console.log(`时间: ${new Date().toISOString()}`);
    console.log('');
    
    console.log('📊 总体指标:');
    console.log(`   总请求数: ${this.metrics.requests}`);
    console.log(`   成功请求: ${this.metrics.successes}`);
    console.log(`   失败请求: ${this.metrics.failures}`);
    console.log(`   成功率: ${this.metrics.requests > 0 ? 
      (this.metrics.successes / this.metrics.requests * 100).toFixed(2) + '%' : '0%'}`);
    console.log(`   平均响应时间: ${this.metrics.requests > 0 ? 
      (this.metrics.totalResponseTime / this.metrics.requests).toFixed(2) + 'ms' : '0ms'}`);
    console.log('');
    
    console.log('🔍 端点性能详情:');
    for (const [endpoint, data] of Object.entries(this.metrics.endpoints)) {
      console.log(`   ${endpoint}:`);
      console.log(`     请求数: ${data.requests}`);
      console.log(`     成功率: ${data.requests > 0 ? 
        (data.successes / data.requests * 100).toFixed(2) + '%' : '0%'}`);
      console.log(`     平均响应: ${data.requests > 0 ? 
        (data.totalResponseTime / data.requests).toFixed(2) + 'ms' : '0ms'}`);
      console.log(`     最快响应: ${data.minResponseTime === Infinity ? 0 : data.minResponseTime}ms`);
      console.log(`     最慢响应: ${data.maxResponseTime}ms`);
      
      if (data.errors.length > 0) {
        console.log(`     最近错误: ${data.errors.length}个`);
      }
      console.log('');
    }
    
    // 保存完整报告
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.logDir, `report-${timestamp}.txt`);
    
    let reportText = `性能监控报告\n`;
    reportText += `环境: ${this.envId}\n`;
    reportText += `时间: ${new Date().toISOString()}\n\n`;
    
    reportText += `总体指标:\n`;
    reportText += `  总请求数: ${this.metrics.requests}\n`;
    reportText += `  成功请求: ${this.metrics.successes}\n`;
    reportText += `  失败请求: ${this.metrics.failures}\n`;
    reportText += `  成功率: ${this.metrics.requests > 0 ? 
      (this.metrics.successes / this.metrics.requests * 100).toFixed(2) + '%' : '0%'}\n`;
    reportText += `  平均响应时间: ${this.metrics.requests > 0 ? 
      (this.metrics.totalResponseTime / this.metrics.requests).toFixed(2) + 'ms' : '0ms'}\n\n`;
    
    reportText += `端点性能详情:\n`;
    for (const [endpoint, data] of Object.entries(this.metrics.endpoints)) {
      reportText += `  ${endpoint}:\n`;
      reportText += `    请求数: ${data.requests}\n`;
      reportText += `    成功率: ${data.requests > 0 ? 
        (data.successes / data.requests * 100).toFixed(2) + '%' : '0%'}\n`;
      reportText += `    平均响应: ${data.requests > 0 ? 
        (data.totalResponseTime / data.requests).toFixed(2) + 'ms' : '0ms'}\n`;
      reportText += `    最快响应: ${data.minResponseTime === Infinity ? 0 : data.minResponseTime}ms\n`;
      reportText += `    最慢响应: ${data.maxResponseTime}ms\n`;
      
      if (data.errors.length > 0) {
        reportText += `    错误数: ${data.errors.length}\n`;
      }
      reportText += `\n`;
    }
    
    fs.writeFileSync(reportFile, reportText);
    console.log(`📄 完整报告已保存到: ${reportFile}`);
  }

  // 运行性能测试
  async runPerformanceTest(durationMs = 60000) { // 默认1分钟
    console.log('⚡ 开始性能测试');
    console.log(`   持续时间: ${durationMs / 1000}秒`);
    console.log(`   环境: ${this.envId}`);
    console.log('');
    
    const endpoints = [
      { method: 'GET', path: '/', weight: 1 },
      { method: 'POST', path: '/user/login', weight: 3, data: { code: 'test_perf' } },
      { method: 'GET', path: '/word/list', weight: 5 },
      { method: 'GET', path: '/review/getToday', weight: 2 }
    ];
    
    // 计算总权重
    const totalWeight = endpoints.reduce((sum, ep) => sum + ep.weight, 0);
    
    // 生成端点数组（按权重分布）
    const weightedEndpoints = [];
    endpoints.forEach(ep => {
      const count = Math.ceil((ep.weight / totalWeight) * 100);
      for (let i = 0; i < count; i++) {
        weightedEndpoints.push(ep);
      }
    });
    
    const startTime = Date.now();
    let completedRequests = 0;
    
    // 并发请求函数
    const makeRequest = async () => {
      while (Date.now() - startTime < durationMs) {
        // 随机选择一个端点
        const endpoint = weightedEndpoints[Math.floor(Math.random() * weightedEndpoints.length)];
        
        try {
          await this.measureRequest(
            endpoint.method,
            endpoint.path,
            endpoint.data,
            endpoint.headers || {}
          );
          completedRequests++;
        } catch (error) {
          // 记录错误但继续测试
          console.log(`⚠️ 请求失败: ${endpoint.path} - ${error.message}`);
        }
        
        // 随机延迟 100-500ms 模拟真实用户行为
        const delay = 100 + Math.random() * 400;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    };
    
    // 启动多个并发请求
    const concurrency = 5; // 5个并发用户
    const promises = [];
    
    for (let i = 0; i < concurrency; i++) {
      promises.push(makeRequest());
    }
    
    // 显示进度
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / durationMs * 100)).toFixed(1);
      console.log(`⏱️ 进度: ${progress}% | 已完成请求: ${completedRequests}`);
    }, 5000);
    
    // 等待所有请求完成
    await Promise.all(promises);
    clearInterval(progressInterval);
    
    // 生成报告
    console.log('');
    console.log('✅ 性能测试完成');
    console.log(`   总请求数: ${completedRequests}`);
    console.log(`   测试时长: ${durationMs / 1000}秒`);
    console.log(`   平均QPS: ${(completedRequests / (durationMs / 1000)).toFixed(2)}`);
    console.log('');
    
    this.generateReport();
    this.saveMetrics();
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const envId = process.argv[2] || 'tengfei-workstation-7czc7ab13ca3';
  const duration = process.argv[3] ? parseInt(process.argv[3]) * 1000 : 60000;
  
  const monitor = new PerformanceMonitor(envId);
  
  monitor.runPerformanceTest(duration).catch(error => {
    console.error('❌ 性能测试错误:', error);
    process.exit(1);
  });
}

module.exports = PerformanceMonitor;