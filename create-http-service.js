/**
 * 创建HTTP访问服务
 * 云函数需要HTTP访问服务才能通过URL访问
 */

console.log('🔗 创建HTTP访问服务指南');
console.log('========================================');
console.log('环境: tengfei-workstation-7czc7ab13ca3');
console.log('');

console.log('📋 需要在腾讯云控制台为每个云函数创建HTTP访问服务:');
console.log('');

// 需要HTTP访问的云函数
const functions = [
  { name: 'login', path: '/user/login', method: 'POST' },
  { name: 'getInfo', path: '/user/getInfo', method: 'GET' },
  { name: 'add', path: '/word/add', method: 'POST' },
  { name: 'list', path: '/word/list', method: 'GET' },
  { name: 'detail', path: '/word/detail', method: 'GET' },
  { name: 'search', path: '/word/search', method: 'GET' },
  { name: 'import', path: '/word/import', method: 'POST' },
  { name: 'export', path: '/word/export', method: 'POST' },
  { name: 'getToday', path: '/review/getToday', method: 'GET' },
  { name: 'submit', path: '/review/submit', method: 'POST' }
];

console.log('需要配置的HTTP访问路径:');
functions.forEach((func, index) => {
  console.log(`${index + 1}. ${func.method} ${func.path} → ${func.name} 函数`);
});

console.log('');
console.log('🔧 配置步骤:');
console.log('');
console.log('1. 登录腾讯云控制台: https://console.cloud.tencent.com/');
console.log('2. 进入云开发环境: tengfei-workstation-7czc7ab13ca3');
console.log('3. 点击左侧"云函数"');
console.log('4. 点击需要配置的函数名称');
console.log('5. 点击"触发方式"标签页');
console.log('6. 点击"创建触发方式"');
console.log('7. 选择"HTTP访问服务"');
console.log('8. 配置路径和方法 (参考上面的映射)');
console.log('9. 点击"保存"');
console.log('10. 重复以上步骤为所有10个函数创建HTTP访问');
console.log('');

console.log('💡 快速配置建议:');
console.log('   - 可以先配置 user/login 测试');
console.log('   - 使用路径前缀如 /user/、/word/、/review/');
console.log('   - 确保HTTP方法和函数匹配');
console.log('');

console.log('✅ 配置完成后，测试API:');
console.log('   curl -X POST https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/user/login \\');
console.log('        -H "Content-Type: application/json" \\');
console.log('        -d \'{"code":"test"}\'');
console.log('');

console.log('📞 常见问题:');
console.log('1. 环境无效: 检查环境是否激活');
console.log('2. 404错误: 检查HTTP路径是否正确');
console.log('3. 500错误: 检查云函数代码');
console.log('4. 权限错误: 检查数据库权限');
console.log('');

console.log('🎉 HTTP访问服务配置完成后，API就可以正常调用了！');