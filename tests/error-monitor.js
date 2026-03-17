/**
 * 错误监控和告警系统
 * 监控API错误并发送告警
 */

const fs = require('fs');
const path = require('path');

class ErrorMonitor {
  constructor(envId = 'tengfei-workstation-7czc7ab13ca3') {
    this.envId = envId;
    this.errorLogs = [];
    this.alertThresholds = {
      errorRate: 0.1, // 10%错误率触发告警
      consecutiveErrors: 5, // 连续5个错误触发告警
      responseTime: 5000 // 5秒响应时间触发告警
    };
    
    // 创建日志目录
    this.logDir = path.join(__dirname, '../logs/errors');
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
    
    // 加载历史错误
    this.loadErrorHistory();
  }

  // 记录错误
  recordError(errorInfo) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      envId: this.envId,
      ...errorInfo
    };
    
    this.errorLogs.push(errorEntry);
    
    // 保存到文件
    this.saveError(errorEntry);
    
    // 检查是否需要告警
    this.checkAlerts();
    
    return errorEntry;
  }

  // 保存错误到文件
  saveError(errorEntry) {
    const date = new Date().toISOString().split('T')[0];
    const errorFile = path.join(this.logDir, `errors-${date}.jsonl`);
    
    // 追加到JSONL文件
    const line = JSON.stringify(errorEntry) + '\n';
    fs.appendFileSync(errorFile, line, 'utf8');
    
    // 同时保存到按小时的文件
    const hour = new Date().getHours();
    const hourFile = path.join(this.logDir, `errors-${date}-${hour}.jsonl`);
    fs.appendFileSync(hourFile, line, 'utf8');
  }

  // 加载历史错误
  loadErrorHistory() {
    const date = new Date().toISOString().split('T')[0];
    const errorFile = path.join(this.logDir, `errors-${date}.jsonl`);
    
    if (fs.existsSync(errorFile)) {
      try {
        const content = fs.readFileSync(errorFile, 'utf8');
        const lines = content.trim().split('\n');
        this.errorLogs = lines.map(line => JSON.parse(line));
        console.log(`📖 加载了 ${this.errorLogs.length} 条历史错误记录`);
      } catch (error) {
        console.log('⚠️ 加载历史错误记录失败:', error.message);
      }
    }
  }

  // 检查告警条件
  checkAlerts() {
    const recentErrors = this.getRecentErrors(300); // 最近5分钟的错误
    
    if (recentErrors.length === 0) return;
    
    // 检查错误率
    const totalRequests = recentErrors.reduce((sum, err) => sum + (err.totalRequests || 1), 0);
    const errorCount = recentErrors.length;
    const errorRate = errorCount / totalRequests;
    
    if (errorRate > this.alertThresholds.errorRate) {
      this.sendAlert('HIGH_ERROR_RATE', {
        errorRate: (errorRate * 100).toFixed(2) + '%',
        threshold: (this.alertThresholds.errorRate * 100) + '%',
        recentErrors: recentErrors.slice(0, 5)
      });
    }
    
    // 检查连续错误
    const lastErrors = this.errorLogs.slice(-this.alertThresholds.consecutiveErrors);
    if (lastErrors.length >= this.alertThresholds.consecutiveErrors) {
      const allFailed = lastErrors.every(err => 
        err.statusCode >= 400 || err.errorType === 'NETWORK_ERROR'
      );
      
      if (allFailed) {
        this.sendAlert('CONSECUTIVE_ERRORS', {
          count: this.alertThresholds.consecutiveErrors,
          errors: lastErrors.map(err => ({
            endpoint: err.endpoint,
            statusCode: err.statusCode,
            error: err.error
          }))
        });
      }
    }
    
    // 检查响应时间
    const slowRequests = recentErrors.filter(err => 
      err.responseTime > this.alertThresholds.responseTime
    );
    
    if (slowRequests.length > 0) {
      this.sendAlert('SLOW_RESPONSE', {
        count: slowRequests.length,
        threshold: this.alertThresholds.responseTime + 'ms',
        slowest: Math.max(...slowRequests.map(err => err.responseTime)) + 'ms',
        examples: slowRequests.slice(0, 3).map(err => ({
          endpoint: err.endpoint,
          responseTime: err.responseTime + 'ms'
        }))
      });
    }
  }

  // 获取最近错误
  getRecentErrors(seconds = 300) {
    const cutoffTime = Date.now() - (seconds * 1000);
    return this.errorLogs.filter(error => {
      const errorTime = new Date(error.timestamp).getTime();
      return errorTime > cutoffTime;
    });
  }

  // 发送告警
  sendAlert(alertType, alertData) {
    const alert = {
      type: alertType,
      timestamp: new Date().toISOString(),
      envId: this.envId,
      severity: this.getAlertSeverity(alertType),
      data: alertData
    };
    
    console.log('🚨 系统告警:', alertType);
    console.log('   环境:', this.envId);
    console.log('   时间:', alert.timestamp);
    console.log('   严重程度:', alert.severity);
    console.log('   详情:', JSON.stringify(alertData, null, 2));
    console.log('');
    
    // 保存告警到文件
    this.saveAlert(alert);
    
    // 这里可以集成邮件、短信、Webhook等告警方式
    // 例如: this.sendEmailAlert(alert);
    // 例如: this.sendWebhookAlert(alert);
    
    return alert;
  }

  // 获取告警严重程度
  getAlertSeverity(alertType) {
    const severityMap = {
      'HIGH_ERROR_RATE': 'HIGH',
      'CONSECUTIVE_ERRORS': 'CRITICAL',
      'SLOW_RESPONSE': 'MEDIUM',
      'DATABASE_ERROR': 'HIGH',
      'AUTH_FAILURE': 'MEDIUM'
    };
    
    return severityMap[alertType] || 'LOW';
  }

  // 保存告警
  saveAlert(alert) {
    const date = new Date().toISOString().split('T')[0];
    const alertFile = path.join(this.logDir, `alerts-${date}.jsonl`);
    
    const line = JSON.stringify(alert) + '\n';
    fs.appendFileSync(alertFile, line, 'utf8');
  }

  // 生成错误报告
  generateErrorReport(hours = 24) {
    const cutoffTime = Date.now() - (hours * 60 * 60 * 1000);
    const recentErrors = this.errorLogs.filter(error => {
      const errorTime = new Date(error.timestamp).getTime();
      return errorTime > cutoffTime;
    });
    
    if (recentErrors.length === 0) {
      console.log(`✅ 过去${hours}小时内没有错误记录`);
      return;
    }
    
    console.log('📊 错误分析报告');
    console.log('========================================');
    console.log(`时间范围: 过去${hours}小时`);
    console.log(`环境: ${this.envId}`);
    console.log(`总错误数: ${recentErrors.length}`);
    console.log('');
    
    // 按错误类型分组
    const errorsByType = {};
    const errorsByEndpoint = {};
    const errorsByStatusCode = {};
    
    recentErrors.forEach(error => {
      // 按错误类型
      const type = error.errorType || 'UNKNOWN';
      errorsByType[type] = (errorsByType[type] || 0) + 1;
      
      // 按端点
      const endpoint = error.endpoint || 'UNKNOWN';
      errorsByEndpoint[endpoint] = (errorsByEndpoint[endpoint] || 0) + 1;
      
      // 按状态码
      const statusCode = error.statusCode || 0;
      errorsByStatusCode[statusCode] = (errorsByStatusCode[statusCode] || 0) + 1;
    });
    
    console.log('🔍 按错误类型分布:');
    Object.entries(errorsByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = (count / recentErrors.length * 100).toFixed(1);
        console.log(`   ${type}: ${count} (${percentage}%)`);
      });
    console.log('');
    
    console.log('🔗 按端点分布:');
    Object.entries(errorsByEndpoint)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10) // 显示前10个
      .forEach(([endpoint, count]) => {
        const percentage = (count / recentErrors.length * 100).toFixed(1);
        console.log(`   ${endpoint}: ${count} (${percentage}%)`);
      });
    console.log('');
    
    console.log('📡 按状态码分布:');
    Object.entries(errorsByStatusCode)
      .sort((a, b) => b[1] - a[1])
      .forEach(([statusCode, count]) => {
        const percentage = (count / recentErrors.length * 100).toFixed(1);
        console.log(`   ${statusCode}: ${count} (${percentage}%)`);
      });
    console.log('');
    
    // 时间趋势
    const errorsByHour = {};
    recentErrors.forEach(error => {
      const hour = new Date(error.timestamp).getHours();
      errorsByHour[hour] = (errorsByHour[hour] || 0) + 1;
    });
    
    console.log('⏰ 时间趋势 (按小时):');
    for (let hour = 0; hour < 24; hour++) {
      const count = errorsByHour[hour] || 0;
      if (count > 0) {
        console.log(`   ${hour.toString().padStart(2, '0')}:00 - ${count}个错误`);
      }
    }
    console.log('');
    
    // 最近错误详情
    console.log('📝 最近5个错误详情:');
    recentErrors.slice(-5).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.timestamp}`);
      console.log(`      端点: ${error.endpoint || 'N/A'}`);
      console.log(`      状态码: ${error.statusCode || 'N/A'}`);
      console.log(`      错误: ${error.error || error.message || 'N/A'}`);
      if (error.responseTime) {
        console.log(`      响应时间: ${error.responseTime}ms`);
      }
      console.log('');
    });
    
    // 保存报告
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.logDir, `error-report-${timestamp}.txt`);
    
    let reportText = `错误分析报告\n`;
    reportText += `时间范围: 过去${hours}小时\n`;
    reportText += `环境: ${this.envId}\n`;
    reportText += `总错误数: ${recentErrors.length}\n\n`;
    
    reportText += `按错误类型分布:\n`;
    Object.entries(errorsByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        const percentage = (count / recentErrors.length * 100).toFixed(1);
        reportText += `  ${type}: ${count} (${percentage}%)\n`;
      });
    reportText += `\n`;
    
    fs.writeFileSync(reportFile, reportText);
    console.log(`📄 完整报告已保存到: ${reportFile}`);
  }

  // 监控API端点
  async monitorEndpoint(method, endpoint, intervalMs = 60000) { // 默认每分钟检查一次
    console.log(`👁️ 开始监控端点: ${method} ${endpoint}`);
    console.log(`   检查间隔: ${intervalMs / 1000}秒`);
    
    const monitorInterval = setInterval(async () => {
      try {
        const https = require('https');
        const startTime = Date.now();
        
        const result = await new Promise((resolve, reject) => {
          const options = {
            hostname: `${this.envId}.ap-shanghai.app.tcloudbase.com`,
            port: 443,
            path: endpoint,
            method: method,
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10秒超时
          };

          const req = https.request(options, (res) => {
            const responseTime = Date.now() - startTime;
            let data = '';
            
            res.on('data', (chunk) => {
              data += chunk;
            });

            res.on('end', () => {
              resolve({
                statusCode: res.statusCode,
                responseTime: responseTime,
                data: data
              });
            });
          });

          req.on('error', (error) => {
            reject(error);
          });

          req.on('timeout', () => {
            req.destroy();
            reject(new Error('请求超时'));
          });

          req.end();
        });

        // 检查响应
        if (result.statusCode >= 400) {
          this.recordError({
            endpoint: endpoint,
            statusCode: result.statusCode,
            error: `HTTP ${result.statusCode}`,
            responseTime: result.responseTime,
            errorType: 'HTTP_ERROR'
          });
        } else if (result.responseTime > this.alertThresholds.responseTime) {
          this.recordError({
            endpoint: endpoint,
            statusCode: result.statusCode,
            error: '响应时间过长',
            responseTime: result.responseTime,
            errorType: 'SLOW_RESPONSE'
          });
        } else {
          console.log(`✅ ${endpoint} 检查正常 (${result.responseTime}ms)`);
        }
        
      } catch (error) {
        this.recordError({
          endpoint: endpoint,
          statusCode: 0,
          error: error.message,
          errorType: 'NETWORK_ERROR'
        });
      }
    }, intervalMs);
    
    return () => clearInterval(monitorInterval);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  const envId = process.argv[2] || 'tengfei-workstation-7czc7ab13ca3';
  const monitor = new ErrorMonitor(envId);
  
  // 生成过去24小时报告
  monitor.generateErrorReport(24);
  
  // 开始监控关键端点
  const endpoints = [
    { method: 'GET', path: '/' },
    { method: 'POST', path: '/user/login' },
    { method: 'GET', path: '/word/list' }
  ];
  
  const stopMonitors = [];
  
  endpoints.forEach(endpoint => {
    const stopMonitor = monitor.monitorEndpoint(endpoint.method, endpoint.path, 30000); // 每30秒检查
    stopMonitors.push(stopMonitor);
  });
  
  console.log('');
  console.log('👁️ 错误监控已启动');
  console.log('   按 Ctrl+C 停止监控');
  console.log('');
  
  // 处理退出
  process.on('SIGINT', () => {
    console.log('\n🛑 停止错误监控...');
    stopMonitors.forEach(stop => stop());
    process.exit(0);
  });
}

module.exports = ErrorMonitor;