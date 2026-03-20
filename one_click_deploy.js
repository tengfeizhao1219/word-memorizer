#!/usr/bin/env node
/**
 * 一键部署脚本 - 使用微信云开发CLI
 * 最简单的方式部署所有云函数
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  projectPath: __dirname,
  cloudFunctionsPath: path.join(__dirname, 'cloud-functions'),
  targetEnv: 'tengfei-workspace-7ef9ma8b7670ea',
  
  // 需要部署的云函数
  functions: [
    { name: 'translate', path: 'translate', priority: 1 },
    { name: 'login', path: 'user/login', priority: 2 },
    { name: 'word-add', path: 'word/add', priority: 2 },
    { name: 'word-list', path: 'word/list', priority: 2 },
    { name: 'word-delete', path: 'word/delete', priority: 3 },
    { name: 'word-update', path: 'word/update', priority: 3 },
    { name: 'review', path: 'review', priority: 3 },
    { name: 'sync', path: 'sync', priority: 3 }
  ],
  
  // 环境变量
  envVars: {
    TENCENT_SECRET_ID: 'AKIDPimcCajdU7VfaHKBnBKDr673oNj060h9',
    TENCENT_SECRET_KEY: 'LSN7g192h7JICtPhlcFdmgNq56uQjmbB',
    TENCENT_REGION: 'ap-shanghai'
  }
};

// 工具函数
function log(message, type = 'info') {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    progress: '🔄'
  };
  
  const icon = icons[type] || icons.info;
  console.log(`${icon} ${message}`);
}

function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      cwd: options.cwd || CONFIG.projectPath,
      stdio: options.silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      output: error.stdout || error.stderr 
    };
  }
}

function checkNpmInstallation() {
  log('检查npm安装...', 'progress');
  const result = runCommand('npm --version', { silent: true });
  
  if (result.success) {
    log(`npm版本: ${result.output.trim()}`, 'success');
    return true;
  } else {
    log('npm未安装，请先安装Node.js', 'error');
    return false;
  }
}

function checkCloudCli() {
  log('检查CloudBase CLI...', 'progress');
  const result = runCommand('tcb --version', { silent: true });
  
  if (result.success) {
    log(`CloudBase CLI版本: ${result.output.trim()}`, 'success');
    return true;
  } else {
    log('CloudBase CLI未安装，尝试安装...', 'warning');
    return installCloudCli();
  }
}

function installCloudCli() {
  log('安装CloudBase CLI...', 'progress');
  const result = runCommand('npm install -g @cloudbase/cli', { silent: false });
  
  if (result.success) {
    log('CloudBase CLI安装成功', 'success');
    return true;
  } else {
    log('CloudBase CLI安装失败', 'error');
    log('请手动安装: npm install -g @cloudbase/cli', 'warning');
    return false;
  }
}

function loginToTencentCloud() {
  log('登录腾讯云（需要扫码）...', 'progress');
  console.log('');
  console.log('='.repeat(50));
  console.log('请使用微信扫描二维码登录腾讯云');
  console.log('如果已经登录过，可以按Ctrl+C跳过');
  console.log('='.repeat(50));
  console.log('');
  
  try {
    const result = runCommand('tcb login', { silent: false });
    
    if (result.success || result.output?.includes('already logged in')) {
      log('登录成功', 'success');
      return true;
    } else {
      log('登录过程可能有问题，继续尝试部署...', 'warning');
      return true; // 继续尝试
    }
  } catch (error) {
    log('登录被跳过或失败，继续尝试部署...', 'warning');
    return true; // 继续尝试
  }
}

function checkFunctionExists(funcPath) {
  const fullPath = path.join(CONFIG.cloudFunctionsPath, funcPath);
  return fs.existsSync(fullPath);
}

function installDependencies(funcPath) {
  const funcDir = path.join(CONFIG.cloudFunctionsPath, funcPath);
  const packageJson = path.join(funcDir, 'package.json');
  
  if (!fs.existsSync(packageJson)) {
    log(`${funcPath} 没有package.json，跳过依赖安装`, 'warning');
    return true;
  }
  
  log(`安装 ${funcPath} 依赖...`, 'progress');
  const result = runCommand('npm install', { cwd: funcDir, silent: true });
  
  if (result.success) {
    log(`${funcPath} 依赖安装成功`, 'success');
    return true;
  } else {
    log(`${funcPath} 依赖安装失败: ${result.error}`, 'error');
    return false;
  }
}

function deployFunction(funcName, funcPath) {
  log(`部署 ${funcName}...`, 'progress');
  
  const funcDir = path.join(CONFIG.cloudFunctionsPath, funcPath);
  
  // 检查函数目录是否存在
  if (!fs.existsSync(funcDir)) {
    log(`${funcPath} 目录不存在，跳过`, 'warning');
    return false;
  }
  
  // 构建部署命令
  const command = `tcb functions:deploy ${funcName} -e ${CONFIG.targetEnv} --path "${funcDir}"`;
  
  const result = runCommand(command, { silent: true });
  
  if (result.success) {
    log(`${funcName} 部署成功`, 'success');
    return true;
  } else {
    log(`${funcName} 部署失败`, 'error');
    
    // 尝试更简单的命令
    log(`尝试简化部署 ${funcName}...`, 'progress');
    const simpleCommand = `tcb fn deploy ${funcName} -e ${CONFIG.targetEnv}`;
    const simpleResult = runCommand(simpleCommand, { cwd: funcDir, silent: true });
    
    if (simpleResult.success) {
      log(`${funcName} 简化部署成功`, 'success');
      return true;
    } else {
      log(`${funcName} 所有部署尝试都失败`, 'error');
      return false;
    }
  }
}

function showEnvironmentVariablesGuide() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🔥 重要：环境变量配置指南');
  console.log('='.repeat(60));
  console.log('');
  console.log('以下环境变量必须在腾讯云控制台配置：');
  console.log('');
  
  for (const [key, value] of Object.entries(CONFIG.envVars)) {
    console.log(`${key} = ${value}`);
  }
  
  console.log('');
  console.log('配置步骤：');
  console.log('1. 访问 https://console.cloud.tencent.com/tcb');
  console.log(`2. 选择环境: ${CONFIG.targetEnv}`);
  console.log('3. 进入"环境配置" -> "环境变量"');
  console.log('4. 添加上面的变量');
  console.log('5. 保存配置');
  console.log('6. 重新部署云函数（环境变量生效需要重启）');
  console.log('');
  console.log('='.repeat(60));
  console.log('');
}

function showQuickTestGuide() {
  console.log('');
  console.log('='.repeat(60));
  console.log('🧪 快速测试指南');
  console.log('='.repeat(60));
  console.log('');
  console.log('测试翻译功能：');
  console.log('');
  console.log('1. 打开微信开发者工具');
  console.log('2. 导入项目: word-memorizer/client-mini-wechat');
  console.log('3. 设置AppID: wx1ccb4d171dd88162');
  console.log('4. 点击"云开发"按钮，选择环境');
  console.log('5. 访问页面: pages/translate/translate');
  console.log('6. 输入"hello"，点击翻译');
  console.log('');
  console.log('预期结果：');
  console.log('✅ 成功: 显示"腾讯云翻译"和"你好"');
  console.log('⚠️  警告: 显示"本地词典"（环境变量未生效）');
  console.log('❌ 失败: 显示错误信息');
  console.log('');
  console.log('='.repeat(60));
}

async function main() {
  console.log('');
  console.log('🚀 一键部署腾讯云云函数');
  console.log('='.repeat(50));
  
  // 1. 检查npm
  if (!checkNpmInstallation()) {
    return;
  }
  
  // 2. 检查CloudBase CLI
  if (!checkCloudCli()) {
    return;
  }
  
  // 3. 登录腾讯云
  if (!loginToTencentCloud()) {
    return;
  }
  
  // 4. 按优先级排序函数
  const sortedFunctions = [...CONFIG.functions].sort((a, b) => a.priority - b.priority);
  
  // 5. 部署云函数
  console.log('');
  log('开始部署云函数...', 'progress');
  console.log('-'.repeat(50));
  
  let deployedCount = 0;
  let totalCount = 0;
  
  for (const func of sortedFunctions) {
    totalCount++;
    
    // 检查函数是否存在
    if (!checkFunctionExists(func.path)) {
      log(`${func.name} (${func.path}) 目录不存在，跳过`, 'warning');
      continue;
    }
    
    console.log(`[${totalCount}/${sortedFunctions.length}] ${func.name}`);
    
    // 安装依赖
    installDependencies(func.path);
    
    // 部署函数
    if (deployFunction(func.name, func.path)) {
      deployedCount++;
    }
    
    console.log('');
  }
  
  // 6. 显示环境变量配置指南
  showEnvironmentVariablesGuide();
  
  // 7. 显示测试指南
  showQuickTestGuide();
  
  // 8. 总结
  console.log('');
  console.log('🎉 部署完成！');
  console.log('='.repeat(50));
  console.log(`成功部署: ${deployedCount}/${totalCount} 个云函数`);
  console.log('');
  console.log('📋 下一步操作：');
  console.log('  1. 立即配置环境变量（必须）');
  console.log('  2. 在微信开发者工具中测试翻译功能');
  console.log('  3. 根据测试结果决定后续步骤');
  console.log('');
  console.log('⏰ 预计时间：');
  console.log('  • 环境变量配置：5分钟');
  console.log('  • 功能测试：5分钟');
  console.log('  • 总计：10分钟');
  console.log('');
  console.log('💡 提示：先让翻译功能跑起来，其他可以逐步完善');
  console.log('');
}

// 运行主函数
main().catch(error => {
  console.error('❌ 部署过程中出现错误:', error);
  process.exit(1);
});