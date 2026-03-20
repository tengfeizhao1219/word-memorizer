/**
 * 简单测试 - 检查基础配置
 */

console.log('🔍 检查单词本系统基础配置...');
console.log('='.repeat(50));

// 检查环境变量
console.log('\n📋 环境配置检查:');
console.log('1. 微信AppID:', process.env.WX_APPID || '未设置');
console.log('2. 腾讯云环境ID:', process.env.TCB_ENV || '未设置');
console.log('3. 当前目录:', process.cwd());

// 检查文件结构
console.log('\n📁 文件结构检查:');
const fs = require('fs');
const path = require('path');

const requiredDirs = [
  'cloud-functions',
  'client-mini-wechat',
  'database'
];

const requiredFiles = [
  'cloud-functions/user/login/index.js',
  'client-mini-wechat/app.js',
  'client-mini-wechat/app.json',
  'database/init.js'
];

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(dir);
  console.log(`${exists ? '✅' : '❌'} ${dir}: ${exists ? '存在' : '缺失'}`);
});

console.log('\n📄 关键文件检查:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? '存在' : '缺失'}`);
});

// 检查小程序配置
console.log('\n📱 微信小程序配置检查:');
try {
  const appJson = JSON.parse(fs.readFileSync('client-mini-wechat/app.json', 'utf8'));
  console.log('✅ app.json 解析成功');
  console.log('   AppID:', appJson.appid || '未设置');
  console.log('   项目名称:', appJson.projectname || '未设置');
  console.log('   页面数量:', appJson.pages ? appJson.pages.length : 0);
} catch (error) {
  console.log('❌ app.json 解析失败:', error.message);
}

// 检查云函数配置
console.log('\n☁️  云函数配置检查:');
try {
  const configPath = 'cloud-functions/config.json';
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ config.json 解析成功');
    console.log('   环境ID:', config.envId || '未设置');
  } else {
    console.log('⚠️  config.json 不存在');
  }
} catch (error) {
  console.log('❌ 云函数配置检查失败:', error.message);
}

// 检查数据库初始化脚本
console.log('\n🗄️  数据库初始化检查:');
try {
  const initScript = fs.readFileSync('database/init.js', 'utf8');
  const hasCollections = initScript.includes('createCollection');
  const hasIndexes = initScript.includes('createIndex');
  console.log(`✅ 初始化脚本: ${hasCollections ? '有集合创建' : '无集合创建'}`);
  console.log(`✅ 索引创建: ${hasIndexes ? '有索引创建' : '无索引创建'}`);
} catch (error) {
  console.log('❌ 数据库初始化检查失败:', error.message);
}

console.log('\n' + '='.repeat(50));
console.log('🎯 下一步建议:');
console.log('='.repeat(50));
console.log('1. 在微信开发者工具中导入项目');
console.log('2. 配置正确的AppID: wx1ccb4d171dd88162');
console.log('3. 配置腾讯云环境ID: tengfei-workstation-7czc7ab13ca3');
console.log('4. 在微信开发者工具中测试云函数调用');
console.log('5. 如果需要服务器端测试，需要配置腾讯云API密钥');

console.log('\n💡 快速测试方法:');
console.log('1. 打开微信开发者工具');
console.log('2. 导入目录: word-memorizer/client-mini-wechat');
console.log('3. 设置AppID: wx1ccb4d171dd88162');
console.log('4. 点击"云开发"按钮，配置环境');
console.log('5. 在控制台运行测试代码');