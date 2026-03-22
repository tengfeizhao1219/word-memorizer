#!/usr/bin/env node

/**
 * 测试直接配置方案
 */

console.log('🧪 测试直接配置方案');
console.log('==================\n');

// 检查关键文件
const fs = require('fs');
const path = require('path');

const checks = [
  {
    name: '环境ID配置',
    file: 'tencent_cloud_config.md',
    pattern: /cloud1-1g9313w0bb791de0/,
    required: true
  },
  {
    name: '翻译云函数',
    file: 'deploy-direct/translate/index.js',
    patterns: [
      /cloud1-1g9313w0bb791de0/,
      /AKIDQjwAGArKbfVK4iOtDLFvOdeR0LSM1Tgh/,
      /sjS2SgjdNwSktulPq5LSCnDQO9j7HDvP/
    ],
    required: true
  },
  {
    name: '用户登录云函数',
    file: 'deploy-direct/user-login/index.js',
    patterns: [/cloud1-1g9313w0bb791de0/],
    required: true
  },
  {
    name: '单词列表云函数',
    file: 'deploy-direct/word-list/index.js',
    patterns: [/cloud1-1g9313w0bb791de0/],
    required: true
  },
  {
    name: '前端配置',
    file: 'client-mini-wechat/app.js',
    patterns: [/cloud1-1g9313w0bb791de0/],
    required: true
  }
];

let allPassed = true;

checks.forEach(check => {
  const filePath = path.join(__dirname, check.file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${check.name}: 文件不存在 - ${check.file}`);
    if (check.required) allPassed = false;
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  let passed = true;
  
  if (check.pattern) {
    if (!check.pattern.test(content)) {
      console.log(`❌ ${check.name}: 未找到匹配模式 - ${check.file}`);
      passed = false;
    }
  }
  
  if (check.patterns) {
    check.patterns.forEach((pattern, index) => {
      if (!pattern.test(content)) {
        const patternStr = pattern.toString().substring(1, 20) + '...';
        console.log(`❌ ${check.name}: 模式${index+1}不匹配 - ${patternStr}`);
        passed = false;
      }
    });
  }
  
  if (passed) {
    console.log(`✅ ${check.name}: 配置正确 - ${check.file}`);
  } else {
    if (check.required) allPassed = false;
  }
});

console.log('\n🎯 测试结果:');
if (allPassed) {
  console.log('✅ 所有关键配置检查通过！');
  console.log('🚀 可以开始部署了！');
} else {
  console.log('❌ 部分配置检查失败');
  console.log('🔧 请先修复配置问题');
}

console.log('\n📋 下一步操作:');
console.log('1. 按照 DIRECT_DEPLOYMENT_GUIDE.md 指南操作');
console.log('2. 先创建数据库集合');
console.log('3. 再部署云函数');
console.log('4. 最后测试功能');

console.log('\n💡 提示:');
console.log('如果遇到权限问题，可能需要：');
console.log('- 在腾讯云控制台为密钥添加云开发权限');
console.log('- 开通云开发、数据库、翻译服务');
console.log('- 检查环境ID是否正确');

console.log('\n⏰ 测试时间:', new Date().toLocaleString());