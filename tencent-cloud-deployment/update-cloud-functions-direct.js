#!/usr/bin/env node

/**
 * 更新云函数代码，直接使用腾讯云密钥（跳过环境变量）
 */

const fs = require('fs');
const path = require('path');

console.log('🔄 更新云函数代码 - 直接使用密钥');
console.log('==============================\n');

// 配置信息
const config = {
  envId: 'cloud1-1g9313w0bb791de0',
  secretId: 'AKIDQjwAGArKbfVK4iOtDLFvOdeR0LSM1Tgh',
  secretKey: 'sjS2SgjdNwSktulPq5LSCnDQO9j7HDvP',
  region: 'ap-shanghai',
  appId: 'wx1ccb4d171dd88162'
};

console.log('📋 配置信息:');
console.log(`   环境ID: ${config.envId}`);
console.log(`   SecretId: ${config.secretId.substring(0, 8)}...`);
console.log(`   SecretKey: ${'*'.repeat(config.secretKey.length - 4)}${config.secretKey.slice(-4)}`);
console.log(`   地域: ${config.region}`);

// 云函数目录
const cloudFunctionsDir = path.join(__dirname, 'cloud-functions');

// 需要更新的云函数
const functions = [
  {
    name: 'translate',
    file: 'translate/index.js',
    type: 'translate'
  },
  {
    name: 'user-login',
    file: 'user/login/index.js',
    type: 'user'
  },
  {
    name: 'word-list',
    file: 'word/list/index.js',
    type: 'word'
  }
];

console.log('\n📁 更新云函数代码...');

functions.forEach(func => {
  const filePath = path.join(cloudFunctionsDir, func.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`   ❌ 文件不存在: ${func.file}`);
    return;
  }
  
  console.log(`\n📝 更新: ${func.name} (${func.file})`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let updated = false;
  
  // 1. 更新环境ID
  if (content.includes('cloud.DYNAMIC_CURRENT_ENV')) {
    content = content.replace(
      /cloud\.init\({[\s\S]*?}\)/,
      `cloud.init({
  env: '${config.envId}',
  traceUser: true
})`
    );
    updated = true;
    console.log('   ✅ 更新环境ID');
  }
  
  // 2. 对于翻译函数，直接注入腾讯云配置
  if (func.type === 'translate') {
    // 查找腾讯云SDK初始化部分
    const tencentCloudConfig = `
// 腾讯云翻译配置（直接使用密钥，跳过环境变量）
const clientConfig = {
  credential: {
    secretId: '${config.secretId}',
    secretKey: '${config.secretKey}'
  },
  region: '${config.region}',
  profile: {
    httpProfile: {
      endpoint: 'tmt.tencentcloudapi.com'
    }
  }
};

const tmtClient = new TmtClient(clientConfig);
console.log('腾讯云翻译服务已初始化（直接密钥模式）');
`;
    
    // 在适当位置插入配置
    if (content.includes('const TmtClient = TencentCloud.tmt.v20180321.Client;')) {
      const insertPoint = content.indexOf('const TmtClient = TencentCloud.tmt.v20180321.Client;') +
        'const TmtClient = TencentCloud.tmt.v20180321.Client;'.length;
      
      content = content.slice(0, insertPoint) + '\n\n' + tencentCloudConfig + content.slice(insertPoint);
      updated = true;
      console.log('   ✅ 注入腾讯云翻译配置');
    }
  }
  
  // 3. 移除可能的环境变量引用
  const envVarPatterns = [
    /process\.env\.TENCENT_SECRET_ID/g,
    /process\.env\.TENCENT_SECRET_KEY/g,
    /process\.env\.TENCENT_REGION/g
  ];
  
  envVarPatterns.forEach(pattern => {
    if (content.match(pattern)) {
      content = content.replace(pattern, '');
      updated = true;
      console.log('   ✅ 移除环境变量引用');
    }
  });
  
  // 保存更新后的文件
  if (updated) {
    // 创建备份
    const backupPath = filePath + '.backup-' + Date.now();
    fs.copyFileSync(filePath, backupPath);
    
    // 写入更新
    fs.writeFileSync(filePath, content);
    
    // 创建部署版本
    const deployPath = filePath + '.deploy';
    fs.writeFileSync(deployPath, content);
    
    console.log(`   💾 已更新并备份: ${func.file}`);
    console.log(`     原始备份: ${backupPath}`);
    console.log(`     部署版本: ${deployPath}`);
  } else {
    console.log(`   ⚠️  无需更新: ${func.file}`);
  }
});

console.log('\n✅ 云函数代码更新完成!');

// 创建部署包
console.log('\n📦 创建直接部署包...');
const deployDir = path.join(__dirname, 'deploy-direct');
if (!fs.existsSync(deployDir)) {
  fs.mkdirSync(deployDir, { recursive: true });
}

// 复制云函数到部署目录
functions.forEach(func => {
  const sourceFile = path.join(cloudFunctionsDir, func.file);
  const deployFile = path.join(deployDir, func.name, 'index.js');
  
  if (fs.existsSync(sourceFile + '.deploy')) {
    // 使用.deploy版本
    const deployContent = fs.readFileSync(sourceFile + '.deploy', 'utf8');
    
    // 创建目录
    const funcDir = path.dirname(deployFile);
    if (!fs.existsSync(funcDir)) {
      fs.mkdirSync(funcDir, { recursive: true });
    }
    
    // 写入文件
    fs.writeFileSync(deployFile, deployContent);
    
    // 创建package.json
    const packageJson = {
      name: `word-memorizer-${func.name}`,
      version: '1.0.0',
      main: 'index.js',
      dependencies: func.type === 'translate' ? {
        'tencentcloud-sdk-nodejs': '^4.0.454',
        'wx-server-sdk': '^2.6.3'
      } : {
        'wx-server-sdk': '^2.6.3'
      }
    };
    
    fs.writeFileSync(
      path.join(funcDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log(`   ✅ 创建部署包: ${func.name}/`);
  }
});

console.log('\n🎯 直接部署方案准备完成!');
console.log('');
console.log('📋 部署包位置:');
console.log(`   ${deployDir}`);
console.log('');
console.log('🚀 下一步操作:');
console.log('1. 使用微信开发者工具导入项目');
console.log('2. 在云开发控制台创建数据库集合:');
console.log('   - users (用户表)');
console.log('   - words (单词表)');
console.log('   - translation_history (翻译历史表)');
console.log('3. 上传并部署云函数（使用deploy-direct目录中的文件）');
console.log('4. 测试云函数调用');
console.log('');
console.log('💡 重要提示:');
console.log('由于跳过了环境变量，密钥直接写在代码中。');
console.log('这简化了开发配置，但生产环境建议使用环境变量。');
console.log('');
console.log('⏰ 完成时间:', new Date().toLocaleString());