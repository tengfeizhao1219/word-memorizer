/**
 * 错误分析脚本
 * 根据提供的错误信息分析问题
 */

console.log('🔍 错误分析工具');
console.log('========================================');
console.log('请提供具体的错误信息进行分析');
console.log('');

// 常见错误分析
const errorAnalysis = {
  // 云函数相关错误
  'cloud.callFunction:fail': {
    causes: [
      '云函数未部署',
      '云函数名称错误',
      '环境配置错误',
      '网络连接问题'
    ],
    solutions: [
      '检查云函数是否已部署到腾讯云',
      '确认云函数名称为"login"',
      '验证环境ID配置',
      '检查网络连接'
    ]
  },
  
  '云函数不存在': {
    causes: ['云函数未部署', '函数名称错误'],
    solutions: ['在腾讯云控制台部署login云函数', '确认函数名称']
  },
  
  // 数据库相关错误
  'database query:fail': {
    causes: ['数据库集合不存在', '权限不足', '网络问题'],
    solutions: ['创建数据库集合', '设置数据库权限', '检查网络']
  },
  
  '集合不存在': {
    causes: ['数据库集合未创建'],
    solutions: ['在腾讯云数据库创建users集合']
  },
  
  // 网络相关错误
  'request:fail': {
    causes: ['网络连接问题', '域名未备案', '服务器问题'],
    solutions: ['检查网络连接', '重启微信开发者工具', '等待重试']
  },
  
  '网络错误': {
    causes: ['网络不稳定', '防火墙阻止', 'DNS问题'],
    solutions: ['检查网络', '关闭防火墙', '更换网络环境']
  },
  
  // 权限相关错误
  '权限不足': {
    causes: ['数据库权限设置错误', '用户未授权'],
    solutions: ['设置数据库权限为"所有用户可读，仅创建者可写"', '重新授权']
  },
  
  // 环境相关错误
  '环境不存在': {
    causes: ['环境ID错误', '环境未初始化'],
    solutions: ['确认环境ID为 tengfei-workstation-7czc7ab13ca3', '重新初始化']
  }
};

// 错误代码分析
const errorCodeAnalysis = {
  '-1': '一般错误，需要具体错误信息',
  '-502001': '数据库集合不存在',
  '-502002': '数据库权限不足',
  '-501001': '云函数不存在',
  '-501002': '云函数执行错误',
  '-504001': '网络请求失败',
  '-504002': '请求超时'
};

function analyzeError(errorMsg) {
  console.log('📋 错误信息分析:');
  console.log('错误信息:', errorMsg);
  console.log('');
  
  let foundMatch = false;
  
  // 分析错误类型
  for (const [pattern, analysis] of Object.entries(errorAnalysis)) {
    if (errorMsg.includes(pattern)) {
      console.log('🔍 识别到错误类型:', pattern);
      console.log('');
      console.log('可能的原因:');
      analysis.causes.forEach(cause => console.log('  •', cause));
      console.log('');
      console.log('解决方案:');
      analysis.solutions.forEach(solution => console.log('  •', solution));
      foundMatch = true;
      break;
    }
  }
  
  // 分析错误代码
  const errorCodeMatch = errorMsg.match(/errCode:\s*(-?\d+)/);
  if (errorCodeMatch) {
    const errorCode = errorCodeMatch[1];
    console.log('');
    console.log('🔢 错误代码分析:');
    console.log('错误代码:', errorCode);
    
    if (errorCodeAnalysis[errorCode]) {
      console.log('错误含义:', errorCodeAnalysis[errorCode]);
    } else {
      console.log('未知错误代码，需要进一步分析');
    }
  }
  
  if (!foundMatch) {
    console.log('');
    console.log('⚠️ 未识别到具体错误类型');
    console.log('💡 请提供更多信息:');
    console.log('  1. 完整的错误信息');
    console.log('  2. 错误发生时的操作');
    console.log('  3. 控制台截图');
  }
  
  console.log('');
  console.log('🚀 建议操作:');
  console.log('  1. 运行测试代码验证');
  console.log('  2. 检查腾讯云控制台');
  console.log('  3. 查看网络请求详情');
  console.log('  4. 提供更详细的错误信息');
}

// 示例错误分析
console.log('📝 示例错误信息分析:');
console.log('----------------------');

const exampleErrors = [
  '云函数调用失败: {errMsg: "cloud.callFunction:fail", errCode: -1}',
  '数据库错误: {errMsg: "database query:fail", errCode: -502001}',
  '网络错误: {errMsg: "request:fail", errCode: -504001}'
];

exampleErrors.forEach((error, index) => {
  console.log(`\n示例${index + 1}: ${error}`);
  analyzeError(error);
  console.log('---');
});

console.log('');
console.log('========================================');
console.log('🎯 请提供你的具体错误信息');
console.log('========================================');
console.log('');
console.log('📋 提供格式:');
console.log('  完整的错误信息（复制粘贴）');
console.log('');
console.log('💡 我会立即分析并提供解决方案');

// 导出分析函数
module.exports = { analyzeError, errorAnalysis, errorCodeAnalysis };