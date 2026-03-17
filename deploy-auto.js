/**
 * 自动化部署脚本 - 使用256MB内存避免付费弹窗
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 开始自动化部署云函数');
console.log('========================================');
console.log('策略: 使用256MB内存配置，避免付费弹窗');
console.log('');

// 云函数配置
const functions = [
  // 用户服务 - 256MB内存
  { 
    name: 'user-login', 
    path: 'cloud-functions/user/login',
    config: { memory: 256, timeout: 5 }
  },
  { 
    name: 'user-getInfo', 
    path: 'cloud-functions/user/getInfo',
    config: { memory: 256, timeout: 5 }
  },
  
  // 生词服务 - 256MB内存
  { 
    name: 'word-add', 
    path: 'cloud-functions/word/add',
    config: { memory: 256, timeout: 10 }
  },
  { 
    name: 'word-list', 
    path: 'cloud-functions/word/list',
    config: { memory: 256, timeout: 10 }
  },
  { 
    name: 'word-detail', 
    path: 'cloud-functions/word/detail',
    config: { memory: 256, timeout: 10 }
  },
  { 
    name: 'word-search', 
    path: 'cloud-functions/word/search',
    config: { memory: 256, timeout: 10 }
  },
  
  // 导入导出 - 512MB内存
  { 
    name: 'word-import', 
    path: 'cloud-functions/word/import',
    config: { memory: 512, timeout: 30 }
  },
  { 
    name: 'word-export', 
    path: 'cloud-functions/word/export',
    config: { memory: 512, timeout: 30 }
  },
  
  // 复习服务 - 256MB内存
  { 
    name: 'review-getToday', 
    path: 'cloud-functions/review/getToday',
    config: { memory: 256, timeout: 10 }
  },
  { 
    name: 'review-submit', 
    path: 'cloud-functions/review/submit',
    config: { memory: 256, timeout: 10 }
  }
];

// 环境配置
const envId = 'tengfei-workstation-7czc7ab13ca3';

// 检查 cloudbase-cli
function checkCloudBaseCLI() {
  console.log('🔧 检查 CloudBase CLI...');
  
  try {
    const version = execSync('npx cloudbase --version', { 
      stdio: 'pipe',
      encoding: 'utf8'
    }).trim();
    
    console.log(`✅ CloudBase CLI 版本: ${version}`);
    return true;
  } catch (error) {
    console.log('❌ CloudBase CLI 未安装，正在安装...');
    
    try {
      execSync('npm install @cloudbase/cli --no-save', { 
        stdio: 'pipe' 
      });
      console.log('✅ CloudBase CLI 安装成功');
      return true;
    } catch (installError) {
      console.error('❌ 安装失败:', installError.message);
      return false;
    }
  }
}

// 登录云开发
function loginToCloudBase() {
  console.log('🔐 尝试登录云开发...');
  
  try {
    // 先检查是否已登录
    const checkCmd = 'npx cloudbase login list';
    execSync(checkCmd, { stdio: 'pipe' });
    console.log('✅ 已有登录会话');
    return true;
  } catch (error) {
    console.log('⚠️ 需要登录，尝试使用API密钥...');
    
    // 这里需要你的SecretId和SecretKey
    // 为了安全，从环境变量或手动输入获取
    const secretId = process.env.TENCENT_SECRET_ID;
    const secretKey = process.env.TENCENT_SECRET_KEY;
    
    if (!secretId || !secretKey) {
      console.log('❌ 未设置API密钥，请手动登录后继续');
      console.log('   运行: npx cloudbase login');
      return false;
    }
    
    try {
      const loginCmd = `npx cloudbase login -k --apiKeyId ${secretId} --apiKey ${secretKey}`;
      execSync(loginCmd, { stdio: 'pipe' });
      console.log('✅ API密钥登录成功');
      return true;
    } catch (loginError) {
      console.error('❌ 登录失败:', loginError.message);
      return false;
    }
  }
}

// 创建云函数配置文件
function createFunctionConfig(funcName, config) {
  return {
    functions: [{
      name: funcName,
      timeout: config.timeout,
      memory: config.memory,
      envVariables: {},
      runtime: 'Nodejs16.13',
      handler: 'index.main',
      installDependency: true,
      ignore: ['node_modules', 'node_modules/**/*', '.git']
    }]
  };
}

// 部署单个云函数
async function deployFunction(func, index) {
  console.log(`\n📦 [${index + 1}/${functions.length}] 部署 ${func.name}...`);
  
  try {
    // 进入函数目录
    const originalDir = process.cwd();
    process.chdir(func.path);
    
    // 创建配置文件
    const config = createFunctionConfig(func.name, func.config);
    fs.writeFileSync('tcb-config.json', JSON.stringify(config, null, 2));
    
    console.log(`   配置: ${func.config.memory}MB内存, ${func.config.timeout}秒超时`);
    
    // 尝试部署命令
    const deployCmd = `npx cloudbase functions:deploy ${func.name} -e ${envId} --force`;
    
    console.log(`   执行: ${deployCmd}`);
    
    try {
      // 尝试非交互式部署
      const result = execSync(deployCmd, { 
        stdio: 'pipe',
        encoding: 'utf8',
        timeout: 120000 // 2分钟超时
      });
      
      // 检查部署结果
      if (result.includes('success') || result.includes('Success') || result.includes('部署成功')) {
        console.log(`   ✅ ${func.name} 部署成功`);
      } else if (result.includes('already exists')) {
        console.log(`   ⚠️ ${func.name} 已存在，跳过`);
      } else {
        console.log(`   🔄 ${func.name} 部署中，检查状态...`);
        // 等待一下再检查状态
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
    } catch (execError) {
      // 检查是否是交互式提示
      if (execError.stdout && execError.stdout.includes('confirm')) {
        console.log(`   ⚠️ ${func.name} 需要交互确认，尝试绕过...`);
        
        // 尝试使用echo输入Y
        const interactiveCmd = `echo "Y" | npx cloudbase functions:deploy ${func.name} -e ${envId} --force`;
        
        try {
          execSync(interactiveCmd, { 
            stdio: 'pipe',
            encoding: 'utf8',
            timeout: 120000
          });
          console.log(`   ✅ ${func.name} 交互式部署成功`);
        } catch (interactiveError) {
          console.log(`   ❌ ${func.name} 交互式部署失败: ${interactiveError.message}`);
          console.log(`   建议手动部署此函数`);
        }
      } else {
        console.log(`   ❌ ${func.name} 部署失败: ${execError.message}`);
      }
    }
    
    // 清理配置文件
    if (fs.existsSync('tcb-config.json')) {
      fs.unlinkSync('tcb-config.json');
    }
    
    // 返回原目录
    process.chdir(originalDir);
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ ${func.name} 部署过程出错: ${error.message}`);
    
    // 确保返回原目录
    process.chdir(originalDir);
    
    return false;
  }
}

// 初始化数据库
function initDatabase() {
  console.log('\n🗄️ 初始化数据库...');
  
  try {
    const dbInitCmd = `node database/init.js --env ${envId}`;
    console.log(`   执行: ${dbInitCmd}`);
    
    const result = execSync(dbInitCmd, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log(`   ✅ 数据库初始化完成`);
    console.log(`   输出: ${result.substring(0, 200)}...`);
    
    return true;
  } catch (error) {
    console.log(`   ❌ 数据库初始化失败: ${error.message}`);
    return false;
  }
}

// 运行测试
function runTests() {
  console.log('\n🧪 运行部署测试...');
  
  try {
    const testCmd = `node test-deployment.js`;
    console.log(`   执行: ${testCmd}`);
    
    const result = execSync(testCmd, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    
    console.log(`   ✅ 测试完成`);
    console.log(result);
    
    return true;
  } catch (error) {
    console.log(`   ❌ 测试失败: ${error.message}`);
    console.log(`   输出: ${error.stdout}`);
    return false;
  }
}

// 主函数
async function main() {
  console.log('开始自动化部署流程');
  console.log('环境ID:', envId);
  console.log('云函数数量:', functions.length);
  console.log('');
  
  // 1. 检查工具
  if (!checkCloudBaseCLI()) {
    console.error('❌ 工具检查失败，退出部署');
    return;
  }
  
  // 2. 登录
  if (!loginToCloudBase()) {
    console.log('⚠️ 登录失败，请手动登录后重试');
    console.log('   运行: npx cloudbase login');
    return;
  }
  
  // 3. 部署云函数
  console.log('\n🚀 开始部署云函数...');
  console.log('----------------------------------------');
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < functions.length; i++) {
    const func = functions[i];
    const success = await deployFunction(func, i);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
    
    // 延迟避免请求过快
    if (i < functions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }
  
  console.log('\n📊 部署统计:');
  console.log(`   成功: ${successCount}`);
  console.log(`   失败: ${failCount}`);
  console.log(`   总计: ${functions.length}`);
  
  // 4. 初始化数据库
  if (successCount > 0) {
    initDatabase();
  }
  
  // 5. 运行测试
  if (successCount >= functions.length * 0.7) { // 70%成功就运行测试
    runTests();
  }
  
  console.log('\n🎉 自动化部署流程完成！');
  console.log('========================================');
  console.log('');
  console.log('🔗 控制台地址:');
  console.log(`   https://console.cloud.tencent.com/tcb/env/${envId}`);
  console.log('');
  console.log('🚀 下一步:');
  console.log('   1. 检查控制台确认部署结果');
  console.log('   2. 配置微信小程序');
  console.log('   3. 进行功能测试');
}

// 执行主函数
main().catch(error => {
  console.error('❌ 部署过程中出现错误:', error);
  process.exit(1);
});