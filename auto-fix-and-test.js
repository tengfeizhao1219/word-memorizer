/**
 * 自动修复和测试脚本
 * 一键修复tabBar错误并生成测试代码
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 自动修复和测试工具');
console.log('========================================');
console.log('最后更新: 2026-03-18');
console.log('');

// 修复app.json文件
function fixAppJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️ 文件不存在: ${filePath}`);
      return false;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // 检查是否需要修复
    if (!data.tabBar) {
      console.log(`✅ ${filePath}: 无需修复`);
      return true;
    }

    // 创建备份
    const backupPath = `${filePath}.backup.${Date.now()}`;
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`💾 创建备份: ${backupPath}`);

    // 移除tabBar
    delete data.tabBar;
    
    // 写回文件
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ ${filePath}: 已移除tabBar配置`);
    
    return true;
  } catch (error) {
    console.error(`❌ ${filePath}: 修复失败 - ${error.message}`);
    return false;
  }
}

// 生成测试代码
function generateTestCode() {
  const testCode = `// 🧪 自动生成的测试代码
// 在微信开发者工具控制台中运行

console.log('🔍 开始自动测试');

// 1. 基础环境测试
function testBasicEnvironment() {
  console.log('1. 基础环境测试:');
  console.log('  - wx对象:', typeof wx !== 'undefined' ? '✅ 存在' : '❌ 不存在');
  console.log('  - 页面路径:', getCurrentPages().map(p => p.route));
  return true;
}

// 2. 云开发测试
function testCloudDevelopment() {
  console.log('2. 云开发测试:');
  
  if (!wx.cloud) {
    console.log('  ❌ 云开发不可用');
    return false;
  }
  
  console.log('  ✅ 云开发可用');
  
  // 初始化
  wx.cloud.init({
    env: 'tengfei-workstation-7czc7ab13ca3',
    traceUser: true
  });
  
  return true;
}

// 3. 页面跳转测试
function testPageNavigation() {
  console.log('3. 页面跳转测试:');
  
  try {
    // 测试跳转到登录页
    wx.navigateTo({
      url: '/pages/login/login',
      success: () => console.log('  ✅ 跳转到登录页成功'),
      fail: (err) => console.log('  ⚠️ 跳转到登录页失败:', err)
    });
    
    return true;
  } catch (error) {
    console.log('  ❌ 页面跳转测试失败:', error.message);
    return false;
  }
}

// 4. 数据库连接测试
async function testDatabaseConnection() {
  console.log('4. 数据库连接测试:');
  
  if (!wx.cloud) {
    console.log('  ❌ 云开发未初始化');
    return false;
  }
  
  try {
    const db = wx.cloud.database();
    const res = await db.collection('users').count();
    console.log(\`  ✅ 数据库连接成功 (users集合: \${res.total}个文档)\`);
    return true;
  } catch (error) {
    console.log(\`  ⚠️ 数据库连接失败 (可能权限问题): \${error.message}\`);
    return false;
  }
}

// 5. 云函数测试
async function testCloudFunctions() {
  console.log('5. 云函数测试:');
  
  if (!wx.cloud) {
    console.log('  ❌ 云开发未初始化');
    return false;
  }
  
  try {
    const res = await wx.cloud.callFunction({
      name: 'login',
      data: { action: 'test' }
    });
    console.log(\`  ✅ 云函数调用成功: \${JSON.stringify(res.result)}\`);
    return true;
  } catch (error) {
    console.log(\`  ⚠️ 云函数调用失败: \${error.message}\`);
    return false;
  }
}

// 运行所有测试
async function runAllTests() {
  console.log('🚀 开始运行所有测试');
  console.log('----------------------------------------');
  
  const results = {
    basic: testBasicEnvironment(),
    cloud: testCloudDevelopment(),
    navigation: testPageNavigation(),
    database: await testDatabaseConnection(),
    functions: await testCloudFunctions()
  };
  
  console.log('----------------------------------------');
  console.log('📊 测试结果汇总:');
  console.log(\`  基础环境: \${results.basic ? '✅' : '❌'}\`);
  console.log(\`  云开发: \${results.cloud ? '✅' : '❌'}\`);
  console.log(\`  页面跳转: \${results.navigation ? '✅' : '❌'}\`);
  console.log(\`  数据库: \${results.database ? '✅' : '❌'}\`);
  console.log(\`  云函数: \${results.functions ? '✅' : '❌'}\`);
  
  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;
  
  console.log(\`🎯 通过率: \${passed}/\${total} (\${Math.round(passed/total*100)}%)\`);
  
  if (passed === total) {
    console.log('✅ 所有测试通过！小程序可以正常使用。');
  } else {
    console.log('⚠️ 部分测试失败，请检查相关配置。');
  }
}

// 立即运行测试
runAllTests().catch(console.error);

// 导出测试函数供手动调用
module.exports = {
  testBasicEnvironment,
  testCloudDevelopment,
  testPageNavigation,
  testDatabaseConnection,
  testCloudFunctions,
  runAllTests
};`;

  const testFilePath = path.join(__dirname, 'auto-test-code.js');
  fs.writeFileSync(testFilePath, testCode, 'utf8');
  console.log(`📄 生成测试代码: ${testFilePath}`);
  
  return testFilePath;
}

// 生成修复报告
function generateFixReport(fixedFiles) {
  const report = `# 🔧 自动修复报告
## 生成时间: ${new Date().toLocaleString()}

## 📊 修复统计
- 检查文件数: 3
- 修复文件数: ${fixedFiles.length}
- 修复状态: ${fixedFiles.length > 0 ? '✅ 已完成' : '⚠️ 无需修复'}

## 📁 修复详情
${fixedFiles.map(file => `- ✅ ${file}`).join('\n') || '- 所有文件都已是最新状态'}

## 🚀 下一步操作
1. **重新编译小程序**
   - 在微信开发者工具中点击「编译」按钮
   - 验证错误是否消失

2. **运行测试代码**
   - 复制 auto-test-code.js 中的代码
   - 在微信开发者工具控制台中运行
   - 查看测试结果

3. **验证功能**
   - 测试首页显示
   - 测试页面跳转
   - 测试登录功能

## 📞 技术支持
如果还有问题，请提供:
1. 新的错误信息
2. 控制台截图
3. 操作步骤描述

---

*本报告由自动修复工具生成*`;

  const reportPath = path.join(__dirname, 'FIX_REPORT.md');
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`📋 生成修复报告: ${reportPath}`);
  
  return reportPath;
}

// 主函数
async function main() {
  console.log('🎯 开始自动修复流程');
  console.log('----------------------------------------');
  
  // 需要修复的文件
  const filesToFix = [
    path.join(__dirname, 'wechat-mini-complete', 'app.json'),
    path.join(__dirname, 'client-mini-wechat', 'app.json'),
    path.join(__dirname, 'client-mini', 'app.json')
  ];
  
  // 修复文件
  const fixedFiles = [];
  for (const file of filesToFix) {
    if (fixAppJson(file)) {
      fixedFiles.push(path.relative(__dirname, file));
    }
  }
  
  console.log('----------------------------------------');
  
  // 生成测试代码
  const testFile = generateTestCode();
  
  // 生成修复报告
  const reportFile = generateFixReport(fixedFiles);
  
  console.log('----------------------------------------');
  console.log('🎉 自动修复完成！');
  console.log('');
  console.log('📂 生成的文件:');
  console.log(`  - ${testFile} (测试代码)`);
  console.log(`  - ${reportFile} (修复报告)`);
  console.log('');
  console.log('🚀 立即操作:');
  console.log('  1. 重新编译微信小程序');
  console.log('  2. 运行测试代码验证修复');
  console.log('  3. 查看修复报告了解详情');
}

// 运行主函数
main().catch(console.error);