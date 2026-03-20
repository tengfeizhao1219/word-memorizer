/**
 * 修复环境不存在错误
 * Error: env not exists
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 修复环境不存在错误');
console.log('========================================');
console.log('错误代码: -501000 (INVALID_ENV)');
console.log('错误信息: env not exists');
console.log('');

// 1. 检查当前环境ID
function checkCurrentEnvId() {
  console.log('1. 检查当前环境ID配置:');
  
  const envId = 'tengfei-workstation-7czc7ab13ca3';
  console.log(`   当前环境ID: ${envId}`);
  console.log(`   长度: ${envId.length} 字符`);
  console.log(`   格式: ${/^[a-zA-Z0-9-]+$/.test(envId) ? '✅ 正确' : '❌ 错误'}`);
  
  return envId;
}

// 2. 检查环境ID使用位置
function checkEnvIdUsage() {
  console.log('');
  console.log('2. 检查环境ID使用位置:');
  
  const filesToCheck = [
    'wechat-mini-complete/app.js',
    'cloud-functions/config.json',
    'cloud-functions/deploy-config.js'
  ];
  
  let foundInFiles = [];
  
  for (const file of filesToCheck) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('tengfei-workstation')) {
        console.log(`   ✅ ${file}: 使用环境ID`);
        foundInFiles.push(file);
      } else {
        console.log(`   ⚠️ ${file}: 未找到环境ID`);
      }
    } else {
      console.log(`   ❌ ${file}: 文件不存在`);
    }
  }
  
  return foundInFiles.length > 0;
}

// 3. 创建环境测试代码
function createEnvTestCode() {
  console.log('');
  console.log('3. 创建环境测试代码:');
  
  const testCode = `// 🧪 环境ID测试代码
// 在微信开发者工具控制台运行

console.log('🔍 测试环境ID配置');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 测试多个可能的环境ID
const envTests = [
  // 当前配置的环境ID
  { id: 'tengfei-workstation-7czc7ab13ca3', desc: '当前配置' },
  
  // 常见环境ID格式
  { id: 'test-123456', desc: '测试环境格式' },
  { id: 'prod-abcdef', desc: '生产环境格式' },
  
  // 可能的正确环境ID（需要你提供）
  { id: 'YOUR_CORRECT_ENV_ID', desc: '请替换为正确的环境ID' }
];

async function testEnv(envId) {
  console.log(\`测试环境ID: \${envId} (\${envTests.find(e => e.id === envId)?.desc || '未知'})\`);
  
  try {
    // 重新初始化云开发
    wx.cloud.init({
      env: envId,
      traceUser: true
    });
    
    // 测试云函数调用
    const result = await wx.cloud.callFunction({
      name: 'user-login',
      data: { action: 'test' }
    });
    
    console.log(\`  ✅ 环境 \${envId} 可用\`);
    console.log(\`     返回结果: \${JSON.stringify(result)}\`);
    return { success: true, envId };
  } catch (error) {
    console.log(\`  ❌ 环境 \${envId} 不可用\`);
    console.log(\`     错误信息: \${error.message}\`);
    return { success: false, envId, error };
  }
}

// 运行测试
async function runAllTests() {
  console.log('开始测试所有环境ID...');
  console.log('----------------------------------------');
  
  let foundValidEnv = null;
  
  for (const env of envTests) {
    const result = await testEnv(env.id);
    console.log('');
    
    if (result.success) {
      foundValidEnv = result.envId;
      break;
    }
  }
  
  console.log('----------------------------------------');
  
  if (foundValidEnv) {
    console.log(\`🎉 找到可用的环境ID: \${foundValidEnv}\`);
    console.log('');
    console.log('🚀 立即操作:');
    console.log(\`   1. 将 app.js 中的环境ID改为: \${foundValidEnv}\`);
    console.log(\`   2. 重新编译小程序\`);
    console.log(\`   3. 测试登录功能\`);
  } else {
    console.log('❌ 所有测试的环境ID都不可用');
    console.log('');
    console.log('💡 需要你:');
    console.log('   1. 登录腾讯云控制台');
    console.log('   2. 查看正确的环境ID');
    console.log('   3. 替换测试代码中的 YOUR_CORRECT_ENV_ID');
    console.log('   4. 重新运行测试');
  }
}

// 运行测试
runAllTests().catch(console.error);`;

  const testFilePath = path.join(__dirname, 'test-env-ids.js');
  fs.writeFileSync(testFilePath, testCode, 'utf8');
  
  console.log(`   ✅ 生成测试代码: test-env-ids.js`);
  return testFilePath;
}

// 4. 创建环境ID查找指南
function createEnvIdFindGuide() {
  console.log('');
  console.log('4. 创建环境ID查找指南:');
  
  const guide = `# 🔍 如何找到正确的环境ID

## 🎯 环境ID不存在问题

### 错误信息:
\`\`\`
Error: errCode: -501000 | errMsg: [100003] env not exists
\`\`\`

### 当前使用的环境ID:
\`tengfei-workstation-7czc7ab13ca3\`

这个环境ID在腾讯云上不存在或无法访问。

---

## 🚀 查找正确环境ID的步骤

### 步骤1: 登录腾讯云控制台
\`\`\`
网址: https://tcb.cloud.tencent.com/
账号: 你的腾讯云账号
\`\`\`

### 步骤2: 查看环境列表
\`\`\`
1. 登录后进入控制台首页
2. 查看「环境」列表
3. 找到可用的环境
4. 复制环境ID
\`\`\`

### 步骤3: 环境ID格式
\`\`\`
正确格式示例:
- test-xxxxxxxxx
- prod-xxxxxxxxx  
- xxxxx-xxxx-xxx
- 其他自定义格式
\`\`\`

### 步骤4: 测试环境ID
\`\`\`
1. 运行 test-env-ids.js
2. 替换 YOUR_CORRECT_ENV_ID
3. 查看测试结果
\`\`\`

---

## 📋 常见环境ID位置

### 1. 腾讯云控制台首页
\`\`\`
登录后直接显示的环境列表
\`\`\`

### 2. 环境管理页面
\`\`\`
左侧菜单「环境」→「环境管理」
\`\`\`

### 3. 云函数页面
\`\`\`
云函数列表页面上方的环境选择器
\`\`\`

### 4. 数据库页面
\`\`\`
数据库集合页面上方的环境选择器
\`\`\`

---

## 🔧 修复步骤

### 1. 找到正确的环境ID
\`\`\`
从腾讯云控制台复制正确的环境ID
\`\`\`

### 2. 更新配置文件
\`\`\`
修改以下文件中的环境ID:
1. wechat-mini-complete/app.js
2. cloud-functions/config.json
3. cloud-functions/deploy-config.js
\`\`\`

### 3. 重新测试
\`\`\`
1. 重新编译小程序
2. 运行测试代码
3. 验证环境可用
\`\`\`

---

## 🚨 如果找不到环境

### 情况1: 没有可用环境
\`\`\`
解决方案:
1. 创建新环境
2. 使用免费环境
3. 联系腾讯云支持
\`\`\`

### 情况2: 环境被删除
\`\`\`
解决方案:
1. 恢复环境（如果可能）
2. 创建新环境
3. 迁移数据
\`\`\`

### 情况3: 权限问题
\`\`\`
解决方案:
1. 检查账号权限
2. 切换账号
3. 联系环境管理员
\`\`\`

---

## ✅ 成功标志

### 环境ID验证成功:
\`\`\`
✅ 环境ID存在且可访问
✅ 云函数可以调用
✅ 数据库可以连接
✅ 错误信息消失
\`\`\`

### 修复完成:
\`\`\`
✅ 所有配置文件更新
✅ 小程序重新编译
✅ 功能测试通过
✅ 无环境错误
\`\`\`

---

## 📞 技术支持

### 如果仍有问题:
\`\`\`
1. 提供腾讯云控制台截图
2. 提供环境列表截图
3. 提供具体的错误信息
4. 描述查找环境ID的过程
\`\`\`

我会根据你提供的信息进一步帮助。

---

*最后更新: 2026-03-18 20:04*  
*错误代码: -501000 (INVALID_ENV)*`;

  const guidePath = path.join(__dirname, 'FIND_ENV_ID_GUIDE.md');
  fs.writeFileSync(guidePath, guide, 'utf8');
  
  console.log(`   ✅ 生成查找指南: FIND_ENV_ID_GUIDE.md`);
  return guidePath;
}

// 5. 创建备用方案（如果环境确实不存在）
function createFallbackSolution() {
  console.log('');
  console.log('5. 创建备用方案:');
  
  const fallbackCode = `// 🔧 备用方案：使用模拟数据
// 当环境ID不存在时使用

// 修改登录页面的云函数调用
const originalLoginCode = \`// 云函数调用
wx.cloud.callFunction({
  name: 'user-login',
  data: {
    action: 'login',
    code: res.code,
    userInfo: userInfo
  },
  success: (cloudRes) => {
    // 成功处理
  },
  fail: (err) => {
    // 失败处理
    console.error('云函数调用失败:', err);
    
    // 使用模拟登录
    useMockLogin(userInfo);
  }
})\`;

// 模拟登录函数
function useMockLogin(userInfo) {
  console.log('🔧 使用模拟登录（环境不可用）');
  
  // 模拟用户数据
  const mockUserData = {
    userId: 'mock_user_' + Date.now(),
    userInfo: {
      nickName: userInfo.nickName || '测试用户',
      avatarUrl: userInfo.avatarUrl || '',
      stats: {
        totalWords: 0,
        todayReviewCount: 0,
        streakDays: 1,
        masteryRate: 0
      }
    }
  };
  
  // 保存到本地存储
  wx.setStorageSync('userId', mockUserData.userId);
  wx.setStorageSync('userInfo', mockUserData.userInfo);
  wx.setStorageSync('userStats', mockUserData.userInfo.stats);
  wx.setStorageSync('isMockUser', true);
  
  wx.showToast({
    title: '模拟登录成功',
    icon: 'success'
  });
  
  // 跳转到首页
  setTimeout(() => {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }, 1000);
}

// 立即启用备用方案
console.log('💡 备用方案已准备');
console.log('   当云函数调用失败时自动使用模拟数据');`;

  const fallbackPath = path.join(__dirname, 'fallback-solution.js');
  fs.writeFileSync(fallbackPath, fallbackCode, 'utf8');
  
  console.log(`   ✅ 生成备用方案: fallback-solution.js`);
  return fallbackPath;
}

// 主函数
async function main() {
  console.log('开始修复环境不存在错误...');
  console.log('========================================');
  
  // 检查当前配置
  const currentEnvId = checkCurrentEnvId();
  const envIdUsed = checkEnvIdUsage();
  
  // 生成工具和指南
  const testFile = createEnvTestCode();
  const guideFile = createEnvIdFindGuide();
  const fallbackFile = createFallbackSolution();
  
  console.log('');
  console.log('========================================');
  console.log('🎯 修复方案总结');
  console.log('========================================');
  
  console.log('');
  console.log('🔍 问题分析:');
  console.log(`   环境ID: ${currentEnvId}`);
  console.log('   状态: ❌ 不存在或无法访问');
  console.log('   错误代码: -501000 (INVALID_ENV)');
  
  console.log('');
  console.log('🚀 解决方案:');
  console.log('   1. 找到正确的环境ID（主要方案）');
  console.log('   2. 使用模拟数据（备用方案）');
  
  console.log('');
  console.log('📂 生成的文件:');
  console.log(`   - ${testFile} - 环境ID测试工具`);
  console.log(`   - ${guideFile} - 环境ID查找指南`);
  console.log(`   - ${fallbackFile} - 备用方案代码`);
  
  console.log('');
  console.log('💡 立即操作:');
  console.log('   1. 登录腾讯云控制台查找正确的环境ID');
  console.log('   2. 运行 test-env-ids.js 测试环境ID');
  console.log('   3. 按照 FIND_ENV_ID_GUIDE.md 操作');
  console.log('   4. 如果找不到环境，使用备用方案');
  
  console.log('');
  console.log('🔧 我会:');
  console.log('   1. 根据你找到的环境ID更新配置');
  console.log('   2. 验证修复结果');
  console.log('   3. 确保项目可以正常运行');
  
  return true;
}

// 运行修复
main().catch(console.error);