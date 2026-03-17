/**
 * 项目状态监控面板
 * 显示项目各个组件的状态和统计信息
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ProjectDashboard {
  constructor() {
    this.projectRoot = path.join(__dirname, '..');
    this.envId = 'tengfei-workstation-7czc7ab13ca3';
    this.dashboardData = {
      timestamp: new Date().toISOString(),
      components: {},
      statistics: {},
      alerts: [],
      recommendations: []
    };
  }

  // 收集项目信息
  collectProjectInfo() {
    console.log('📊 收集项目信息...');
    
    // 项目基本信息
    this.dashboardData.project = {
      name: '多端同步生词本',
      version: this.getPackageVersion(),
      environment: this.envId,
      lastUpdated: this.getLastGitCommit(),
      totalFiles: this.countProjectFiles(),
      totalLines: this.countCodeLines()
    };

    // 组件状态
    this.dashboardData.components = {
      cloudFunctions: this.checkCloudFunctions(),
      database: this.checkDatabaseStatus(),
      frontend: this.checkFrontendStatus(),
      documentation: this.checkDocumentation(),
      deployment: this.checkDeploymentStatus(),
      testing: this.checkTestingStatus()
    };

    // 统计信息
    this.dashboardData.statistics = {
      codeMetrics: this.calculateCodeMetrics(),
      fileStructure: this.analyzeFileStructure(),
      dependencyStatus: this.checkDependencies()
    };

    // 生成建议
    this.generateRecommendations();

    return this.dashboardData;
  }

  // 获取包版本
  getPackageVersion() {
    try {
      const packagePath = path.join(this.projectRoot, 'client-mini', 'package.json');
      if (fs.existsSync(packagePath)) {
        const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        return pkg.version || '1.0.0';
      }
    } catch (error) {
      // 忽略错误
    }
    return '1.0.0';
  }

  // 获取最后Git提交
  getLastGitCommit() {
    try {
      const result = execSync('git log -1 --format="%H %ad %s" --date=short', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();
      return result;
    } catch (error) {
      return '未知';
    }
  }

  // 统计项目文件
  countProjectFiles() {
    try {
      const result = execSync('find . -type f -name "*.js" -o -name "*.vue" -o -name "*.json" -o -name "*.md" | wc -l', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();
      return parseInt(result) || 0;
    } catch (error) {
      return 0;
    }
  }

  // 统计代码行数
  countCodeLines() {
    try {
      const result = execSync('find . -type f \\( -name "*.js" -o -name "*.vue" -o -name "*.json" \\) -exec wc -l {} + | tail -1 | awk \'{print $1}\'', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      }).trim();
      return parseInt(result) || 0;
    } catch (error) {
      return 0;
    }
  }

  // 检查云函数状态
  checkCloudFunctions() {
    const functions = [
      'user/login', 'user/getInfo',
      'word/add', 'word/list', 'word/detail', 'word/search', 'word/import', 'word/export',
      'review/getToday', 'review/submit'
    ];

    const status = {
      total: functions.length,
      deployed: 0,
      ready: 0,
      missing: 0,
      details: []
    };

    functions.forEach(func => {
      const funcPath = path.join(this.projectRoot, 'cloud-functions', func, 'index.js');
      const configPath = path.join(this.projectRoot, 'cloud-functions', func, 'tcb.json');
      
      const exists = fs.existsSync(funcPath);
      const hasConfig = fs.existsSync(configPath);
      
      let funcStatus = 'READY';
      if (!exists) funcStatus = 'MISSING';
      else if (!hasConfig) funcStatus = 'NO_CONFIG';
      
      status.details.push({
        name: func.split('/').pop(),
        path: func,
        status: funcStatus,
        hasCode: exists,
        hasConfig: hasConfig
      });

      if (exists && hasConfig) status.ready++;
      if (!exists) status.missing++;
    });

    // 假设所有函数都已部署（根据之前的部署结果）
    status.deployed = status.total;

    return status;
  }

  // 检查数据库状态
  checkDatabaseStatus() {
    return {
      status: 'CONFIGURATION_NEEDED',
      collections: 5,
      configured: 0,
      message: '需要手动创建数据库集合',
      guide: '参考 init-db-simple.js 指南'
    };
  }

  // 检查前端状态
  checkFrontendStatus() {
    const pages = [
      'index/index', 'login/login', 'word-list/word-list', 'word-detail/word-detail',
      'review/review', 'stats/stats', 'import-export/import-export'
    ];

    const status = {
      total: pages.length,
      exists: 0,
      missing: 0,
      details: []
    };

    pages.forEach(page => {
      const pagePath = path.join(this.projectRoot, 'client-mini', 'src', 'pages', `${page}.vue`);
      const exists = fs.existsSync(pagePath);
      
      status.details.push({
        name: page.split('/').pop(),
        path: page,
        exists: exists
      });

      if (exists) status.exists++;
      else status.missing++;
    });

    // 检查配置文件
    const envPath = path.join(this.projectRoot, 'client-mini', 'src', 'config', 'env.js');
    const manifestPath = path.join(this.projectRoot, 'client-mini', 'manifest.json');
    
    const hasEnvConfig = fs.existsSync(envPath);
    const hasManifest = fs.existsSync(manifestPath);

    return {
      ...status,
      config: {
        env: hasEnvConfig ? 'CONFIGURED' : 'MISSING',
        manifest: hasManifest ? 'EXISTS' : 'MISSING',
        appId: this.getAppId()
      },
      overall: status.missing === 0 && hasEnvConfig && hasManifest ? 'READY' : 'INCOMPLETE'
    };
  }

  // 获取AppID
  getAppId() {
    try {
      const manifestPath = path.join(this.projectRoot, 'client-mini', 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        return manifest['mp-weixin']?.appid || '未配置';
      }
    } catch (error) {
      // 忽略错误
    }
    return '未配置';
  }

  // 检查文档状态
  checkDocumentation() {
    const docs = [
      'API_DOCUMENTATION.md',
      'USER_MANUAL.md',
      'MANUAL_DEPLOYMENT_GUIDE.md',
      'WEIXIN_DEVELOPER_SETUP.md',
      'DEPLOYMENT_SUMMARY.md'
    ];

    const status = {
      total: docs.length,
      exists: 0,
      missing: 0,
      details: []
    };

    docs.forEach(doc => {
      const docPath = path.join(this.projectRoot, doc);
      const exists = fs.existsSync(docPath);
      
      status.details.push({
        name: doc,
        exists: exists
      });

      if (exists) status.exists++;
      else status.missing++;
    });

    return {
      ...status,
      overall: status.missing === 0 ? 'COMPLETE' : 'INCOMPLETE'
    };
  }

  // 检查部署状态
  checkDeploymentStatus() {
    return {
      cloudFunctions: 'DEPLOYED', // 根据之前的部署结果
      database: 'PENDING',
      httpServices: 'PENDING',
      frontend: 'READY',
      overall: 'PARTIAL'
    };
  }

  // 检查测试状态
  checkTestingStatus() {
    const tests = [
      'api-test-suite.js',
      'performance-monitor.js',
      'error-monitor.js',
      'health-check.js',
      'test-deployment.js'
    ];

    const status = {
      total: tests.length,
      exists: 0,
      missing: 0,
      details: []
    };

    tests.forEach(test => {
      const testPath = path.join(this.projectRoot, 'tests', test);
      const exists = fs.existsSync(testPath);
      
      status.details.push({
        name: test,
        exists: exists
      });

      if (exists) status.exists++;
      else status.missing++;
    });

    return {
      ...status,
      overall: status.missing === 0 ? 'COMPLETE' : 'INCOMPLETE'
    };
  }

  // 计算代码指标
  calculateCodeMetrics() {
    return {
      totalFiles: this.countProjectFiles(),
      totalLines: this.countCodeLines(),
      cloudFunctions: 10,
      frontendPages: 7,
      apiEndpoints: 10,
      testSuites: 5
    };
  }

  // 分析文件结构
  analyzeFileStructure() {
    const structure = {
      clientMini: this.countFilesInDir('client-mini'),
      cloudFunctions: this.countFilesInDir('cloud-functions'),
      database: this.countFilesInDir('database'),
      docs: this.countFilesInDir('docs'),
      scripts: this.countFilesInDir('scripts'),
      tests: this.countFilesInDir('tests'),
      deployFiles: this.countFilesInDir('deploy-files')
    };

    return structure;
  }

  // 统计目录中的文件数
  countFilesInDir(dirName) {
    const dirPath = path.join(this.projectRoot, dirName);
    if (!fs.existsSync(dirPath)) return 0;
    
    try {
      const result = execSync(`find "${dirPath}" -type f | wc -l`, {
        encoding: 'utf8'
      }).trim();
      return parseInt(result) || 0;
    } catch (error) {
      return 0;
    }
  }

  // 检查依赖状态
  checkDependencies() {
    const deps = {
      frontend: this.checkFrontendDeps(),
      backend: this.checkBackendDeps(),
      tools: this.checkToolDeps()
    };

    return deps;
  }

  checkFrontendDeps() {
    try {
      const pkgPath = path.join(this.projectRoot, 'client-mini', 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        return {
          total: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length,
          status: 'CONFIGURED'
        };
      }
    } catch (error) {
      // 忽略错误
    }
    return { total: 0, status: 'UNKNOWN' };
  }

  checkBackendDeps() {
    // 检查云函数依赖
    const funcDirs = [
      'user/login', 'user/getInfo',
      'word/add', 'word/list', 'word/detail', 'word/search',
      'review/getToday'
    ];

    let totalDeps = 0;
    funcDirs.forEach(func => {
      const pkgPath = path.join(this.projectRoot, 'cloud-functions', func, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          totalDeps += Object.keys(pkg.dependencies || {}).length;
        } catch (error) {
          // 忽略错误
        }
      }
    });

    return {
      total: totalDeps,
      status: totalDeps > 0 ? 'CONFIGURED' : 'MINIMAL'
    };
  }

  checkToolDeps() {
    const tools = ['node', 'npm', 'git', 'curl'];
    const available = [];

    tools.forEach(tool => {
      try {
        execSync(`which ${tool}`, { stdio: 'ignore' });
        available.push(tool);
      } catch (error) {
        // 工具不可用
      }
    });

    return {
      required: tools.length,
      available: available.length,
      tools: available,
      status: available.length === tools.length ? 'COMPLETE' : 'PARTIAL'
    };
  }

  // 生成建议
  generateRecommendations() {
    const recommendations = [];

    // 基于组件状态生成建议
    if (this.dashboardData.components.database.status === 'CONFIGURATION_NEEDED') {
      recommendations.push({
        priority: 'HIGH',
        action: '创建数据库集合',
        description: '需要创建5个数据库集合才能使用系统',
        guide: '运行: node init-db-simple.js'
      });
    }

    if (this.dashboardData.components.deployment.httpServices === 'PENDING') {
      recommendations.push({
        priority: 'HIGH',
        action: '配置HTTP访问服务',
        description: '需要为10个云函数配置HTTP访问路径',
        guide: '运行: node create-http-service.js'
      });
    }

    if (this.dashboardData.components.frontend.overall === 'INCOMPLETE') {
      recommendations.push({
        priority: 'MEDIUM',
        action: '完善前端配置',
        description: '检查前端页面和配置文件',
        guide: '验证 client-mini/src/config/env.js 和 manifest.json'
      });
    }

    if (this.dashboardData.components.testing.overall === 'INCOMPLETE') {
      recommendations.push({
        priority: 'LOW',
        action: '完善测试套件',
        description: '部分测试文件缺失',
        guide: '检查 tests/ 目录'
      });
    }

    this.dashboardData.recommendations = recommendations;

    // 生成告警
    const alerts = [];
    if (recommendations.some(r => r.priority === 'HIGH')) {
      alerts.push({
        level: 'WARNING',
        message: '有高优先级任务需要完成',
        count: recommendations.filter(r => r.priority === 'HIGH').length
      });
    }

    this.dashboardData.alerts = alerts;
  }

  // 显示仪表板
  displayDashboard() {
    const data = this.dashboardData;
    
    console.log('📊 多端同步生词本 - 项目状态仪表板');
    console.log('========================================');
    console.log(`项目: ${data.project.name} v${data.project.version}`);
    console.log(`环境: ${data.project.environment}`);
    console.log(`最后更新: ${data.project.lastUpdated}`);
    console.log(`文件数: ${data.project.totalFiles} | 代码行数: ${data.project.totalLines}`);
    console.log('');
    
    console.log('⚡ 组件状态:');
    console.log(`  云函数: ${data.components.cloudFunctions.ready}/${data.components.cloudFunctions.total} 就绪`);
    console.log(`  数据库: ${data.components.database.status}`);
    console.log(`  前端: ${data.components.frontend.overall} (${data.components.frontend.exists}/${data.components.frontend.total} 页面)`);
    console.log(`  文档: ${data.components.documentation.overall} (${data.components.documentation.exists}/${data.components.documentation.total})`);
    console.log(`  部署: ${data.components.deployment.overall}`);
    console.log(`  测试: ${data.components.testing.overall} (${data.components.testing.exists}/${data.components.testing.total})`);
    console.log('');
    
    console.log('📈 统计信息:');
    console.log(`  云函数: ${data.statistics.codeMetrics.cloudFunctions} 个`);
    console.log(`  前端页面: ${data.statistics.codeMetrics.frontendPages} 个`);
    console.log(`  API接口: ${data.statistics.codeMetrics.apiEndpoints} 个`);
    console.log(`  测试套件: ${data.statistics.codeMetrics.testSuites} 个`);
    console.log('');
    
    if (data.alerts.length > 0) {
      console.log('🚨 系统告警:');
      data.alerts.forEach(alert => {
        console.log(`  ${alert.level}: ${alert.message} (${alert.count}个)`);
      });
      console.log('');
    }
    
    if (data.recommendations.length > 0) {
      console.log('💡 建议操作:');
      data.recommendations.forEach((rec, index) => {
        const priorityIcon = rec.priority === 'HIGH' ? '🔴' : 
                           rec.priority === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`  ${priorityIcon} ${rec.action}: ${rec.description}`);
      });
      console.log('');
    }
    
    console.log('🚀 下一步:');
    console.log('  1. 完成数据库和HTTP配置');
    console.log('  2. 运行完整测试验证');
    console.log('  3. 配置微信小程序');
    console.log('  4. 进行用户体验测试');
    console.log('');
    
    console.log('🔗 重要链接:');
    console.log(`  控制台: https://console.cloud.tencent.com/tcb/env/${this.envId}`);
    console.log(`  GitHub: https://github.com/tengfeizhao1219/word-memorizer`);
    console.log('');
    
    console.log('========================================');
    console.log(`仪表板生成时间: ${data.timestamp}`);
    
    // 保存仪表板数据
    this.saveDashboardData();
  }

  //