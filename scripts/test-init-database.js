#!/usr/bin/env node

/**
 * 测试数据库初始化云函数
 */

console.log('🧪 测试数据库初始化云函数');
console.log('========================\n');

// 模拟云函数调用
const initDatabase = require('./deploy-direct/init-database/index.js');

async function testLocal() {
  console.log('🔧 本地测试数据库初始化...\n');
  
  try {
    // 测试检查功能
    console.log('1. 📋 测试检查功能...');
    const checkResult = await initDatabase.checkCollections();
    console.log('   检查结果:', JSON.stringify(checkResult, null, 2).substring(0, 500) + '...');
    
    // 测试创建功能
    console.log('\n2. 🚀 测试创建功能...');
    const createResult = await initDatabase.createCollections();
    console.log('   创建结果:', JSON.stringify(createResult, null, 2).substring(0, 500) + '...');
    
    // 测试清理功能
    console.log('\n3. 🧹 测试清理功能...');
    const cleanResult = await initDatabase.cleanCollections();
    console.log('   清理结果:', JSON.stringify(cleanResult, null, 2).substring(0, 500) + '...');
    
    console.log('\n✅ 本地测试完成!');
    
  } catch (error) {
    console.log('❌ 本地测试失败:', error.message);
    console.log(error.stack);
  }
}

async function testCloud() {
  console.log('☁️  模拟云函数调用...\n');
  
  // 模拟云函数调用
  const mockEvent = {
    action: 'check'  // 可以改为 'create' 或 'clean'
  };
  
  const mockContext = {
    OPENID: 'test_openid',
    APPID: 'wx1ccb4d171dd88162',
    ENV: 'cloud1-1g9313w0bb791de0'
  };
  
  try {
    const result = await initDatabase.main(mockEvent, mockContext);
    console.log('云函数调用结果:');
    console.log(JSON.stringify(result, null, 2));
    
    console.log('\n🎯 结果分析:');
    if (result.success) {
      console.log('✅ 云函数执行成功');
      console.log(`   动作: ${result.action}`);
      console.log(`   环境: ${result.envId}`);
      console.log(`   集合总数: ${result.summary?.total || 'N/A'}`);
      console.log(`   已存在: ${result.summary?.exists || 'N/A'}`);
      console.log(`   缺失: ${result.summary?.missing || 'N/A'}`);
    } else {
      console.log('❌ 云函数执行失败');
      console.log(`   错误: ${result.error}`);
    }
    
  } catch (error) {
    console.log('❌ 云函数模拟失败:', error.message);
  }
}

// 运行测试
async function main() {
  console.log('📋 测试配置:');
  console.log(`   环境ID: cloud1-1g9313w0bb791de0`);
  console.log(`   微信AppID: wx1ccb4d171dd88162`);
  console.log(`   云函数位置: deploy-direct/init-database/`);
  console.log('');
  
  // 先进行本地测试
  await testLocal();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // 再进行云函数模拟测试
  await testCloud();
  
  console.log('\n🚀 部署和使用指南:');
  console.log('1. 上传 init-database 云函数到腾讯云');
  console.log('2. 调用云函数初始化数据库:');
  console.log('   wx.cloud.callFunction({');
  console.log('     name: "init-database",');
  console.log('     data: { action: "create" }');
  console.log('   })');
  console.log('3. 检查数据库状态:');
  console.log('   wx.cloud.callFunction({');
  console.log('     name: "init-database",');
  console.log('     data: { action: "check" }');
  console.log('   })');
  
  console.log('\n💡 重要提示:');
  console.log('1. 这个云函数会自动创建缺失的数据库集合');
  console.log('2. 通过插入测试数据来创建集合（如果集合不存在）');
  console.log('3. 可以清理测试数据（action: "clean"）');
  console.log('4. 集合权限需要在腾讯云控制台单独配置');
  
  console.log('\n⏰ 测试完成时间:', new Date().toLocaleString());
}

// 运行主函数
main().catch(error => {
  console.log('❌ 测试程序错误:', error.message);
});