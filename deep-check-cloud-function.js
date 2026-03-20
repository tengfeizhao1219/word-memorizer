/**
 * 深度检查云函数配置和代码
 * 全面排查潜在问题
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 深度检查云函数配置和代码');
console.log('========================================');
console.log('检查时间:', new Date().toLocaleString());
console.log('');

// 1. 检查云函数目录结构
function checkCloudFunctionStructure() {
  console.log('1. 检查云函数目录结构:');
  
  const cloudFuncDir = path.join(__dirname, 'cloud-functions');
  
  if (!fs.existsSync(cloudFuncDir)) {
    console.log('  ❌ cloud-functions目录不存在');
    return false;
  }
  
  console.log('  ✅ cloud-functions目录存在');
  
  // 检查login云函数
  const loginFuncDir = path.join(cloudFuncDir, 'user', 'login');
  if (!fs.existsSync(loginFuncDir)) {
    console.log('  ❌ login云函数目录不存在');
    return false;
  }
  
  console.log('  ✅ login云函数目录存在');
  
  // 检查必需文件
  const requiredFiles = ['index.js', 'package.json'];
  for (const file of requiredFiles) {
    const filePath = path.join(loginFuncDir, file);
    if (!fs.existsSync(filePath)) {
      console.log(`  ❌ ${file} 文件不存在`);
      return false;
    }
    console.log(`  ✅ ${file} 文件存在`);
  }
  
  return true;
}

// 2. 检查云函数代码语法
function checkCloudFunctionCode() {
  console.log('');
  console.log('2. 检查云函数代码语法:');
  
  const loginFuncPath = path.join(__dirname, 'cloud-functions', 'user', 'login', 'index.js');
  
  try {
    const code = fs.readFileSync(loginFuncPath, 'utf8');
    
    // 检查关键函数是否存在
    const requiredExports = ['exports.main'];
    for (const exportName of requiredExports) {
      if (!code.includes(exportName)) {
        console.log(`  ❌ 缺少 ${exportName}`);
        return false;
      }
    }
    console.log('  ✅ 导出函数完整');
    
    // 检查数据库操作
    if (!code.includes('cloud.database()')) {
      console.log('  ⚠️ 未找到数据库初始化代码');
    } else {
      console.log('  ✅ 数据库初始化代码存在');
    }
    
    // 检查错误处理
    if (!code.includes('try') || !code.includes('catch')) {
      console.log('  ⚠️ 错误处理可能不完整');
    } else {
      console.log('  ✅ 有错误处理代码');
    }
    
    // 检查返回格式
    const returnPatterns = [
      'success:',
      'code:',
      'message:',
      'data:'
    ];
    
    let hasAllPatterns = true;
    for (const pattern of returnPatterns) {
      if (!code.includes(pattern)) {
        console.log(`  ⚠️ 返回格式可能缺少 ${pattern}`);
        hasAllPatterns = false;
      }
    }
    
    if (hasAllPatterns) {
      console.log('  ✅ 返回格式完整');
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ 读取代码失败:', error.message);
    return false;
  }
}

// 3. 检查package.json依赖
function checkPackageDependencies() {
  console.log('');
  console.log('3. 检查package.json依赖:');
  
  const packagePath = path.join(__dirname, 'cloud-functions', 'user', 'login', 'package.json');
  
  try {
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    const packageData = JSON.parse(packageContent);
    
    // 检查必需依赖
    const requiredDeps = ['wx-server-sdk'];
    const deps = packageData.dependencies || {};
    
    for (const dep of requiredDeps) {
      if (!deps[dep]) {
        console.log(`  ❌ 缺少依赖: ${dep}`);
        return false;
      }
    }
    
    console.log('  ✅ 必需依赖完整');
    
    // 检查版本
    if (deps['wx-server-sdk'] === 'latest') {
      console.log('  ⚠️ wx-server-sdk版本为latest，建议指定具体版本');
    } else {
      console.log(`  ✅ wx-server-sdk版本: ${deps['wx-server-sdk']}`);
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ 检查依赖失败:', error.message);
    return false;
  }
}

// 4. 检查小程序端配置
function checkMiniProgramConfig() {
  console.log('');
  console.log('4. 检查小程序端配置:');
  
  const appJsonPath = path.join(__dirname, 'wechat-mini-complete', 'app.json');
  
  try {
    const appJsonContent = fs.readFileSync(appJsonPath, 'utf8');
    const appJson = JSON.parse(appJsonContent);
    
    // 检查cloud配置
    if (!appJson.cloud) {
      console.log('  ❌ app.json缺少cloud配置');
      return false;
    }
    console.log('  ✅ app.json有cloud配置');
    
    // 检查环境配置
    const appJsPath = path.join(__dirname, 'wechat-mini-complete', 'app.js');
    if (fs.existsSync(appJsPath)) {
      const appJsContent = fs.readFileSync(appJsPath, 'utf8');
      
      if (!appJsContent.includes('tengfei-workstation-7czc7ab13ca3')) {
        console.log('  ⚠️ app.js中可能未设置环境ID');
      } else {
        console.log('  ✅ app.js中有环境ID配置');
      }
      
      if (!appJsContent.includes('wx.cloud.init')) {
        console.log('  ❌ app.js中缺少云开发初始化');
        return false;
      }
      console.log('  ✅ app.js中有云开发初始化');
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ 检查配置失败:', error.message);
    return false;
  }
}

// 5. 检查登录页面调用代码
function checkLoginPageCode() {
  console.log('');
  console.log('5. 检查登录页面调用代码:');
  
  const loginJsPath = path.join(__dirname, 'wechat-mini-complete', 'pages', 'login', 'login.js');
  
  try {
    const code = fs.readFileSync(loginJsPath, 'utf8');
    
    // 检查云函数调用
    if (!code.includes('wx.cloud.callFunction')) {
      console.log('  ❌ 未找到云函数调用代码');
      return false;
    }
    console.log('  ✅ 有云函数调用代码');
    
    // 检查函数名
    if (!code.includes("name: 'login'")) {
      console.log('  ❌ 云函数名称可能不正确');
      return false;
    }
    console.log('  ✅ 云函数名称正确');
    
    // 检查参数传递
    const requiredParams = ['action', 'code', 'userInfo'];
    let hasAllParams = true;
    
    for (const param of requiredParams) {
      if (!code.includes(param)) {
        console.log(`  ⚠️ 可能缺少参数: ${param}`);
        hasAllParams = false;
      }
    }
    
    if (hasAllParams) {
      console.log('  ✅ 参数传递完整');
    }
    
    // 检查错误处理
    if (!code.includes('.fail')) {
      console.log('  ⚠️ 缺少失败处理');
    } else {
      console.log('  ✅ 有失败处理');
    }
    
    // 检查返回处理
    if (!code.includes('cloudRes.result')) {
      console.log('  ⚠️ 返回结果处理可能不完整');
    } else {
      console.log('  ✅ 有返回结果处理');
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ 检查登录页面失败:', error.message);
    return false;
  }
}

// 6. 检查数据库集合配置
function checkDatabaseCollections() {
  console.log('');
  console.log('6. 检查数据库集合配置:');
  
  const loginFuncPath = path.join(__dirname, 'cloud-functions', 'user', 'login', 'index.js');
  
  try {
    const code = fs.readFileSync(loginFuncPath, 'utf8');
    
    // 检查集合名称
    const collections = ['users'];
    for (const collection of collections) {
      if (!code.includes(`collection('${collection}')`)) {
        console.log(`  ⚠️ 未找到集合: ${collection}`);
      } else {
        console.log(`  ✅ 使用集合: ${collection}`);
      }
    }
    
    // 检查集合操作
    const operations = ['.where', '.get', '.add', '.update', '.doc'];
    let hasOperations = true;
    
    for (const op of operations) {
      if (code.includes(op)) {
        console.log(`  ✅ 有${op}操作`);
      }
    }
    
    return true;
  } catch (error) {
    console.log('  ❌ 检查数据库配置失败:', error.message);
    return false;
  }
}

// 7. 检查环境变量和配置
function checkEnvironmentConfig() {
  console.log('');
  console.log('7. 检查环境变量和配置:');
  
  // 检查环境ID一致性
  const envId = 'tengfei-workstation-7czc7ab13ca3';
  
  // 检查app.js
  const appJsPath = path.join(__dirname, 'wechat-mini-complete', 'app.js');
  if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    
    if (appJsContent.includes(envId)) {
      console.log('  ✅ app.js环境ID正确');
    } else {
      console.log('  ❌ app.js环境ID可能不正确');
    }
  }
  
  // 检查云函数
  const loginFuncPath = path.join(__dirname, 'cloud-functions', 'user', 'login', 'index.js');
  if (fs.existsSync(loginFuncPath)) {
    const funcContent = fs.readFileSync(loginFuncPath, 'utf8');
    
    if (funcContent.includes('DYNAMIC_CURRENT_ENV')) {
      console.log('  ✅ 云函数使用动态环境');
    } else if (funcContent.includes(envId)) {
      console.log('  ⚠️ 云函数使用硬编码环境ID');
    } else {
      console.log('  ⚠️ 云函数环境配置可能有问题');
    }
  }
  
  return true;
}

// 8. 生成综合报告
function generateComprehensiveReport(results) {
  console.log('');
  console.log('========================================');
  console.log('📋 深度检查综合报告');
  console.log('========================================');
  
  const checks = [
    { name: '云函数目录结构', key: 'structure' },
    { name: '云函数代码语法', key: 'code' },
    { name: 'package.json依赖', key: 'dependencies' },
    { name: '小程序端配置', key: 'config' },
    { name: '登录页面调用代码', key: 'loginPage' },
    { name: '数据库集合配置', key: 'database' },
    { name: '环境变量和配置', key: 'environment' }
  ];
  
  let passed = 0;
  let total = checks.length;
  
  console.log('');
  console.log('检查结果:');
  console.log('----------');
  
  for (const check of checks) {
    const result = results[check.key];
    const status = result ? '✅' : '❌';
    console.log(`${status} ${check.name}`);
    if (result) passed++;
  }
  
  console.log('');
  console.log(`通过率: ${passed}/${total} (${Math.round(passed/total*100)}%)`);
  
  if (passed === total) {
    console.log('🎉 所有检查通过！');
  } else {
    console.log('⚠️ 部分检查未通过，需要进一步排查');
  }
  
  console.log('');
  console.log('🔍 潜在问题分析:');
  console.log('----------------');
  
  if (!results.structure) {
    console.log('1. 云函数目录结构可能不完整');
    console.log('   建议: 确保cloud-functions/user/login目录存在且包含必需文件');
  }
  
  if (!results.code) {
    console.log('2. 云函数代码可能有语法或逻辑问题');
    console.log('   建议: 检查index.js代码，确保导出函数和错误处理完整');
  }
  
  if (!results.config) {
    console.log('3. 小程序端配置可能有问题');
    console.log('   建议: 检查app.json和app.js中的云开发配置');
  }
  
  if (!results.loginPage) {
    console.log('4. 登录页面调用代码可能有问题');
    console.log('   建议: 检查pages/login/login.js中的云函数调用逻辑');
  }
  
  console.log('');
  console.log('🚀 建议操作:');
  console.log('------------');
  console.log('1. 重新部署云函数');
  console.log('2. 检查腾讯云控制台中的数据库集合');
  console.log('3. 验证环境ID配置');
  console.log('4. 运行测试代码验证连接');
  console.log('5. 查看具体的错误信息进行针对性修复');
  
  return passed === total;
}

// 主检查函数
async function main() {
  console.log('开始深度检查...');
  console.log('========================================');
  
  const results = {
    structure: checkCloudFunctionStructure(),
    code: checkCloudFunctionCode(),
    dependencies: checkPackageDependencies(),
    config: checkMiniProgramConfig(),
    loginPage: checkLoginPageCode(),
    database: checkDatabaseCollections(),
    environment: checkEnvironmentConfig()
  };
  
  const allPassed = generateComprehensiveReport(results);
  
  console.log('');
  console.log('========================================');
  console.log('🎯 深度检查完成');
  
  if (allPassed) {
    console.log('✅ 所有检查项通过，代码和配置看起来正常');
    console.log('');
    console.log('💡 如果仍有问题，可能是:');
    console.log('   1. 云函数未部署到腾讯云');
    console.log('   2. 数据库集合未创建');
    console.log('   3. 网络连接问题');
    console.log('   4. 环境配置问题');
  } else {
    console.log('⚠️ 发现潜在问题，请根据报告进行修复');
  }
  
  console.log('');
  console.log('🔧 立即验证步骤:');
  console.log('   1. 在微信开发者工具控制台运行测试代码');
  console.log('   2. 查看具体的错误信息');
  console.log('   3. 根据错误信息针对性修复');
  
  return allPassed;
}

// 运行深度检查
main().catch(console.error);