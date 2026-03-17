/**
 * 通过腾讯云API部署云函数
 * 避免CLI交互问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置信息
const config = {
  envId: 'YOUR_ENV_ID', // 替换为你的环境ID
  secretId: 'YOUR_SECRET_ID', // 替换为你的SecretID
  secretKey: 'YOUR_SECRET_KEY', // 替换为你的SecretKey
  region: 'ap-shanghai'
};

// 云函数列表
const functions = [
  { name: 'user-login', path: 'cloud-functions/user/login' },
  { name: 'user-getInfo', path: 'cloud-functions/user/getInfo' },
  { name: 'word-add', path: 'cloud-functions/word/add' },
  { name: 'word-list', path: 'cloud-functions/word/list' },
  { name: 'word-detail', path: 'cloud-functions/word/detail' },
  { name: 'word-search', path: 'cloud-functions/word/search' },
  { name: 'word-import', path: 'cloud-functions/word/import' },
  { name: 'word-export', path: 'cloud-functions/word/export' },
  { name: 'review-getToday', path: 'cloud-functions/review/getToday' },
  { name: 'review-submit', path: 'cloud-functions/review/submit' }
];

console.log('🚀 开始通过API部署云函数');
console.log('========================================');
console.log(`环境: ${config.envId}`);
console.log(`地域: ${config.region}`);
console.log('');

// 检查必要的工具
function checkTools() {
  console.log('🔧 检查工具...');
  
  try {
    // 检查是否安装了 cloudbase-cli
    execSync('npx cloudbase --version', { stdio: 'pipe' });
    console.log('✅ CloudBase CLI 可用');
  } catch (error) {
    console.log('❌ CloudBase CLI 不可用，尝试安装...');
    try {
      execSync('npm install @cloudbase/cli --no-save', { stdio: 'pipe' });
      console.log('✅ CloudBase CLI 安装成功');
    } catch (installError) {
      console.error('❌ 安装失败:', installError.message);
      return false;
    }
  }
  
  return true;
}

// 登录云开发
function loginToCloudBase() {
  console.log('🔐 登录云开发...');
  
  try {
    // 使用API密钥登录
    const loginCmd = `npx cloudbase login -k --apiKeyId ${config.secretId} --apiKey ${config.secretKey}`;
    execSync(loginCmd, { stdio: 'pipe' });
    console.log('✅ 登录成功');
    return true;
  } catch (error) {
    console.log('⚠️ 登录失败，尝试使用已有会话');
    return true; // 继续尝试，可能已有会话
  }
}

// 部署单个云函数
function deployFunction(funcName, funcPath) {
  console.log(`📦 部署 ${funcName}...`);
  
  try {
    // 进入函数目录
    const originalDir = process.cwd();
    process.chdir(funcPath);
    
    // 创建临时配置文件
    const tempConfig = {
      functions: [{
        name: funcName.split('-')[1] || funcName,
        timeout: 10,
        envVariables: {},
        runtime: 'Nodejs16.13',
        handler: 'index.main',
        installDependency: true
      }]
    };
    
    fs.writeFileSync('temp-tcb.json', JSON.stringify(tempConfig, null, 2));
    
    // 尝试部署
    const deployCmd = `echo "Y" | npx cloudbase functions:deploy ${funcName.split('-')[1]} -e ${config.envId} --force`;
    
    console.log(`  执行: ${deployCmd}`);
    
    const result = execSync(deployCmd, { 
      stdio: 'pipe',
      timeout: 60000 // 60秒超时
    }).toString();
    
    if (result.includes('success') || result.includes('Success') || result.includes('部署成功')) {
      console.log(`   ✅ ${funcName} 部署成功`);
    } else {
      console.log(`   ⚠️ ${funcName} 部署可能成功，但未收到明确成功消息`);
      console.log(`   输出: ${result.substring(0, 200)}...`);
    }
    
    // 清理临时文件
    if (fs.existsSync('temp-tcb.json')) {
      fs.unlinkSync('temp-tcb.json');
    }
    
    // 返回原目录
    process.chdir(originalDir);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ ${funcName} 部署失败: ${error.message}`);
    
    // 返回原目录
    process.chdir(originalDir);
    
    return false;
  }
}

// 初始化数据库
function initDatabase() {
  console.log('');
  console.log('🗄️ 初始化数据库...');
  
  try {
    const dbInitCmd = `node database/init.js --env ${config.envId}`;
    console.log(`  执行: ${dbInitCmd}`);
    
    const result = execSync(dbInitCmd, { stdio: 'pipe' }).toString();
    
    if (result.includes('成功') || result.includes('Success')) {
      console.log('   ✅ 数据库初始化成功');
      return true;
    } else {
      console.log('   ⚠️ 数据库初始化完成，但未收到明确成功消息');
      return true;
    }
    
  } catch (error) {
    console.log(`   ❌ 数据库初始化失败: ${error.message}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始部署流程...');
  console.log('');
  
  // 1. 检查工具
  if (!checkTools()) {
    console.error('❌ 工具检查失败，退出部署');
    return;
  }
  
  // 2. 登录
  if (!loginToCloudBase()) {
    console.error('❌ 登录失败，退出部署');
    return;
  }
  
  // 3. 部署云函数
  console.log('');
  console.log('🚀 开始部署云函数...');
  console.log('----------------------------------------');
  
  let successCount = 0;
  let failCount = 0;
  
  for (const func of functions) {
    const success = deployFunction(func.name, func.path);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 短暂延迟，避免请求过快
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('');
  console.log('📊 云函数部署统计:');
  console.log(`   成功: ${successCount}`);
  console.log(`   失败: ${failCount}`);
  console.log(`   总计: ${functions.length}`);
  
  // 4. 初始化数据库
  if (successCount > 0) {
    initDatabase();
  }
  
  console.log('');
  console.log('🎉 部署流程完成！');
  console.log('========================================');
  console.log('');
  console.log('🔗 控制台地址: https://console.cloud.tencent.com/tcb/env/' + config.envId);
  console.log('');
  console.log('🚀 下一步建议:');
  console.log('   1. 访问控制台验证部署结果');
  console.log('   2. 测试云函数是否正常工作');
  console.log('   3. 注册微信小程序获取AppID');
  console.log('   4. 配置小程序并测试');
}

// 执行主函数
main().catch(error => {
  console.error('❌ 部署过程中出现错误:', error);
  process.exit(1);
});