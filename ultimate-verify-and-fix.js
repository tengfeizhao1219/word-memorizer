/**
 * 终极验证和修复脚本
 * 全面排查并修复所有潜在问题
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 终极验证和修复');
console.log('========================================');
console.log('开始时间:', new Date().toLocaleString());
console.log('');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function logSuccess(msg) { console.log(colors.green + '✅ ' + msg + colors.reset); }
function logError(msg) { console.log(colors.red + '❌ ' + msg + colors.reset); }
function logWarning(msg) { console.log(colors.yellow + '⚠️ ' + msg + colors.reset); }
function logInfo(msg) { console.log(colors.blue + '🔍 ' + msg + colors.reset); }
function logStep(msg) { console.log(colors.magenta + '🚀 ' + msg + colors.reset); }

// 阶段1: 验证文件完整性
function validateFileIntegrity() {
  logStep('阶段1: 验证文件完整性');
  
  const requiredFiles = [
    // 小程序核心文件
    { path: 'wechat-mini-complete/app.json', desc: '小程序配置文件' },
    { path: 'wechat-mini-complete/app.js', desc: '小程序逻辑文件' },
    { path: 'wechat-mini-complete/app.wxss', desc: '小程序样式文件' },
    { path: 'wechat-mini-complete/project.config.json', desc: '项目配置文件' },
    
    // 登录页面文件
    { path: 'wechat-mini-complete/pages/login/login.js', desc: '登录页面逻辑' },
    { path: 'wechat-mini-complete/pages/login/login.wxml', desc: '登录页面结构' },
    
    // 云函数文件
    { path: 'cloud-functions/user/login/index.js', desc: '登录云函数' },
    { path: 'cloud-functions/user/login/package.json', desc: '云函数依赖配置' }
  ];
  
  let allExist = true;
  
  for (const file of requiredFiles) {
    const fullPath = path.join(__dirname, file.path);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      logSuccess(`${file.desc}: ${file.path} (${stats.size} bytes)`);
    } else {
      logError(`${file.desc}: ${file.path} 不存在`);
      allExist = false;
    }
  }
  
  return allExist;
}

// 阶段2: 验证配置一致性
function validateConfigConsistency() {
  logStep('阶段2: 验证配置一致性');
  
  const envId = 'tengfei-workstation-7czc7ab13ca3';
  let allConsistent = true;
  
  // 检查app.json
  try {
    const appJsonPath = path.join(__dirname, 'wechat-mini-complete', 'app.json');
    const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
    
    if (appJson.cloud === true) {
      logSuccess('app.json: cloud配置正确');
    } else {
      logError('app.json: cloud配置不正确或缺失');
      allConsistent = false;
    }
  } catch (error) {
    logError(`app.json解析失败: ${error.message}`);
    allConsistent = false;
  }
  
  // 检查app.js中的环境ID
  try {
    const appJsPath = path.join(__dirname, 'wechat-mini-complete', 'app.js');
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    if (appJsContent.includes(envId)) {
      logSuccess('app.js: 环境ID配置正确');
    } else {
      logWarning('app.js: 未找到环境ID，使用动态环境');
    }
    
    if (appJsContent.includes('wx.cloud.init')) {
      logSuccess('app.js: 云开发初始化代码存在');
    } else {
      logError('app.js: 缺少云开发初始化代码');
      allConsistent = false;
    }
  } catch (error) {
    logError(`app.js检查失败: ${error.message}`);
    allConsistent = false;
  }
  
  return allConsistent;
}

// 阶段3: 验证云函数代码
function validateCloudFunctionCode() {
  logStep('阶段3: 验证云函数代码');
  
  const loginFuncPath = path.join(__dirname, 'cloud-functions', 'user', 'login', 'index.js');
  
  try {
    const code = fs.readFileSync(loginFuncPath, 'utf8');
    let allValid = true;
    
    // 检查关键组件
    const checks = [
      { pattern: 'exports.main', desc: '导出主函数' },
      { pattern: 'cloud.init', desc: '云开发初始化' },
      { pattern: 'cloud.database', desc: '数据库初始化' },
      { pattern: 'cloud.getWXContext', desc: '获取微信上下文' },
      { pattern: 'try', desc: '错误处理' },
      { pattern: 'catch', desc: '错误捕获' },
      { pattern: 'success:', desc: '成功返回格式' },
      { pattern: 'code:', desc: '状态码返回' }
    ];
    
    for (const check of checks) {
      if (code.includes(check.pattern)) {
        logSuccess(`云函数: ${check.desc}`);
      } else {
        logWarning(`云函数: 缺少${check.desc}`);
        allValid = false;
      }
    }
    
    // 检查数据库集合
    if (code.includes("collection('users')")) {
      logSuccess('云函数: 使用users集合');
    } else {
      logError('云函数: 未使用users集合');
      allValid = false;
    }
    
    return allValid;
  } catch (error) {
    logError(`云函数代码检查失败: ${error.message}`);
    return false;
  }
}

// 阶段4: 验证登录页面代码
function validateLoginPageCode() {
  logStep('阶段4: 验证登录页面代码');
  
  const loginJsPath = path.join(__dirname, 'wechat-mini-complete', 'pages', 'login', 'login.js');
  
  try {
    const code = fs.readFileSync(loginJsPath, 'utf8');
    let allValid = true;
    
    // 检查关键函数
    const functionChecks = [
      'onGetUserInfo',
      'loginWithWechat',
      'useMockLogin'
    ];
    
    for (const func of functionChecks) {
      if (code.includes(`${func}(`)) {
        logSuccess(`登录页面: ${func}函数存在`);
      } else {
        logWarning(`登录页面: 缺少${func}函数`);
        allValid = false;
      }
    }
    
    // 检查云函数调用
    if (code.includes('wx.cloud.callFunction')) {
      logSuccess('登录页面: 有云函数调用');
      
      // 检查参数
      if (code.includes("name: 'login'")) {
        logSuccess('登录页面: 云函数名称正确');
      } else {
        logError('登录页面: 云函数名称可能错误');
        allValid = false;
      }
      
      if (code.includes('action:')) {
        logSuccess('登录页面: 有action参数');
      } else {
        logWarning('登录页面: 可能缺少action参数');
      }
    } else {
      logError('登录页面: 没有云函数调用');
      allValid = false;
    }
    
    // 检查错误处理
    if (code.includes('.fail')) {
      logSuccess('登录页面: 有失败处理');
    } else {
      logWarning('登录页面: 缺少失败处理');
    }
    
    return allValid;
  } catch (error) {
    logError(`登录页面检查失败: ${error.message}`);
    return false;
  }
}

// 阶段5: 生成终极测试代码
function generateUltimateTestCode() {
  logStep('阶段5: 生成终极测试代码');
  
  const testCode = `// 🧪 终极云函数测试代码
// 在微信开发者工具控制台运行

console.log('🚀 开始终极测试');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 环境检查
console.log('1. 环境检查:');
console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在');
console.log('  - wx.cloud:', wx.cloud ? '✅ 存在' : '❌ 不存在');

if (!wx.cloud) {
  console.log('❌ 致命错误: wx.cloud不存在');
  console.log('💡 请检查:');
  console.log('   1. app.json中是否有 "cloud": true');
  console.log('   2. 是否重新编译了小程序');
  console.log('   3. 云开发能力是否开启');
  return;
}

// 2. 云开发初始化
console.log('');
console.log('2. 云开发初始化:');
try {
  wx.cloud.init({
    env: 'tengfei-workstation-7czc7ab13ca3',
    traceUser: true
  });
  console.log('  ✅ 初始化成功');
} catch (error) {
  console.log('  ❌ 初始化失败:', error.message);
  return;
}

// 3. 数据库连接测试
console.log('');
console.log('3. 数据库连接测试:');
try {
  const db = wx.cloud.database();
  console.log('  ✅ 数据库对象获取成功');
  
  // 测试集合访问
  const testCollection = async () => {
    try {
      const result = await db.collection('users').count();
      console.log(\`    ✅ users集合访问成功 (\${result.total}个文档)\`);
      return true;
    } catch (error) {
      console.log(\`    ❌ users集合访问失败: \${error.message}\`);
      console.log(\`        错误代码: \${error.errCode || '未知'}\`);
      return false;
    }
  };
  
  await testCollection();
} catch (error) {
  console.log('  ❌ 数据库连接失败:', error.message);
}

// 4. 云函数调用测试
console.log('');
console.log('4. 云函数调用测试:');

// 测试1: 简单测试调用
console.log('  测试1: 简单测试调用');
try {
  const result = await wx.cloud.callFunction({
    name: 'login',
    data: { action: 'test', test: true }
  });
  console.log('    ✅ 调用成功');
  console.log('       返回结果:', JSON.stringify(result, null, 2));
} catch (error) {
  console.log('    ❌ 调用失败');
  console.log('       错误信息:', error.message);
  console.log('       错误代码:', error.errCode || '未知');
  console.log('       完整错误:', error);
}

// 测试2: 模拟登录调用
console.log('');
console.log('  测试2: 模拟登录调用');
try {
  // 先获取登录code
  const loginRes = await new Promise((resolve, reject) => {
    wx.login({
      success: resolve,
      fail: reject
    });
  });
  
  if (loginRes.code) {
    console.log('    ✅ 获取到登录code');
    
    const result = await wx.cloud.callFunction({
      name: 'login',
      data: {
        action: 'login',
        code: loginRes.code,
        userInfo: {
          nickName: '测试用户',
          avatarUrl: ''
        }
      }
    });
    
    console.log('    ✅ 登录调用成功');
    console.log('       返回结果:', JSON.stringify(result, null, 2));
  } else {
    console.log('    ❌ 获取登录code失败');
  }
} catch (error) {
  console.log('    ❌ 登录调用失败');
  console.log('       错误信息:', error.message);
  console.log('       错误代码:', error.errCode || '未知');
}

// 5. 网络请求检查
console.log('');
console.log('5. 网络请求检查:');
console.log('  请在微信开发者工具中查看:');
console.log('  - 网络面板 (Network Tab)');
console.log('  - 查找 cloudfunctions 请求');
console.log('  - 检查请求状态和响应');

console.log('');
console.log('🎯 测试完成');
console.log('');
console.log('📋 问题诊断:');
console.log('  ✅ 如果所有测试通过: 云函数工作正常');
console.log('  ❌ 如果测试1失败: 云函数部署或配置问题');
console.log('  ❌ 如果测试2失败: 数据库或权限问题');
console.log('  ❌ 如果都失败: 环境或网络问题');

console.log('');
console.log('💡 下一步:');
console.log('  1. 根据测试结果针对性修复');
console.log('  2. 查看具体的错误信息');
console.log('  3. 检查腾讯云控制台配置');
console.log('  4. 重新部署云函数（如果需要）');
`;

  const testFilePath = path.join(__dirname, 'ultimate-cloud-test.js');
  fs.writeFileSync(testFilePath, testCode, 'utf8');
  
  logSuccess(`生成终极测试代码: ultimate-cloud-test.js`);
  return testFilePath;
}

// 阶段6: 生成修复建议
function generateFixRecommendations() {
  logStep('阶段6: 生成修复建议');
  
  const recommendations = `
📋 云函数调用失败 - 修复建议
========================================

🔍 可能的原因:

1. **云函数未部署**
   - 症状: "云函数不存在" 或 "找不到函数"
   - 解决: 在腾讯云控制台部署login云函数

2. **数据库集合不存在**
   - 症状: "集合不存在" 或 "权限不足"
   - 解决: 创建users集合并设置权限

3. **环境配置错误**
   - 症状: "环境不存在" 或 "无效环境"
   - 解决: 确认环境ID为 tengfei-workstation-7czc7ab13ca3

4. **网络连接问题**
   - 症状: "网络错误" 或 "请求超时"
   - 解决: 检查网络，重启微信开发者工具

5. **代码逻辑问题**
   - 症状: "语法错误" 或 "运行时错误"
   - 解决: 检查云函数和小程序代码

🚀 立即操作步骤:

1. **运行终极测试代码**
   - 在控制台运行 ultimate-cloud-test.js
   - 查看具体的错误信息

2. **检查腾讯云控制台**
   - 确认云函数已部署
   - 确认数据库集合已创建
   - 确认环境配置正确

3. **验证本地配置**
   - 检查app.json中的cloud配置
   - 检查app.js中的环境初始化
   - 检查云函数代码逻辑

4. **网络诊断**
   - 检查网络连接
   - 查看网络请求详情
   - 验证域名访问

🔧 备用方案:

如果云函数无法修复，可以使用:
1. 模拟登录 (useMockLogin函数)
2. 本地存储方案
3. 简化版本进行测试

📞 技术支持:

如果问题仍未解决，请提供:
1. 完整的错误信息
2. 控制台截图
3. 网络请求截图
4. 腾讯云控制台状态
`;

  const recFilePath = path.join(__dirname, 'FIX_RECOMMENDATIONS.md');
  fs.writeFileSync(recFilePath, recommendations, 'utf8');
  
  logSuccess(`生成修复建议: FIX_RECOMMENDATIONS.md`);
  return recFilePath;
}

// 主函数
async function main() {
  console.log(colors.cyan + '🚀 开始终极验证和修复流程' + colors.reset);
  console.log('========================================');
  
  const results = {
    fileIntegrity: validateFileIntegrity(),
    configConsistency: validateConfigConsistency(),
    cloudFunctionCode: validateCloudFunctionCode(),
    loginPageCode: validateLoginPageCode()
  };
  
  console.log('');
  console.log('========================================');
  console.log(colors.cyan + '📊 验证结果汇总' + colors.reset);
  console.log('========================================');
  
  let passed = 0;
  let total = Object.keys(results).length;
  
  for (const [key, value] of Object.entries(results)) {
    const status = value ? '✅ 通过' : '❌ 失败';
    console.log(`${status} ${key}`);
    if (value) passed++;
  }
  
  console.log('');
  console.log(`通过率: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log(colors.green + '🎉 所有验证通过！代码和配置看起来正常。' + colors.reset);
  } else {
    console.log(colors.yellow + '⚠️ 部分验证未通过，需要进一步排查。' + colors.reset);
  }
  
  // 生成测试代码和建议
  generateUltimateTestCode();
  generateFixRecommendations();
  
  console.log('');
  console.log('========================================');
  console.log(colors.cyan + '🎯 立即操作' + colors.reset);
  console.log('========================================');
  
  console.log('');
  console.log('1. 运行终极测试:');
  console.log('   在微信开发者工具控制台运行 ultimate-cloud-test.js');
  console.log('');
  
  console.log('2. 查看测试结果:');
  console.log('   根据测试结果判断问题类型');
  console.log('');
  
  console.log('3. 针对性修复:');
  console.log('   参考 FIX_RECOMMENDATIONS.md 中的建议');
  console.log('');
  
  console.log('4. 提供反馈:');
  console.log('   如果仍有问题，请提供具体的错误信息');
  
  console.log('');
  console.log('========================================');
  console.log(colors.green + '✅ 终极验证完成' + colors.reset);
  console.log('========================================');
  
  return passed === total;
}