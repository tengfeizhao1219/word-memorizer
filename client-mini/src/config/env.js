/**
 * 环境配置
 * 根据不同的环境加载不同的配置
 */

// 环境类型
const ENV_TYPES = {
  DEVELOPMENT: 'development',
  TEST: 'test',
  PRODUCTION: 'production'
}

// 当前环境
const currentEnv = process.env.NODE_ENV || ENV_TYPES.DEVELOPMENT

// 环境配置
const envConfigs = {
  [ENV_TYPES.DEVELOPMENT]: {
    // 开发环境
    name: '开发环境',
    cloudEnvId: 'tengfei-workstation-7czc7ab13ca3', // 你的环境ID
    apiBaseUrl: '',
    debug: true,
    logLevel: 'debug'
  },
  
  [ENV_TYPES.TEST]: {
    // 测试环境
    name: '测试环境',
    cloudEnvId: 'tengfei-workstation-7czc7ab13ca3', // 使用同一个环境
    apiBaseUrl: '',
    debug: true,
    logLevel: 'info'
  },
  
  [ENV_TYPES.PRODUCTION]: {
    // 生产环境
    name: '生产环境',
    cloudEnvId: 'tengfei-workstation-7czc7ab13ca3', // 生产环境ID
    apiBaseUrl: '',
    debug: false,
    logLevel: 'warn'
  }
}

// 获取当前环境配置
const config = envConfigs[currentEnv] || envConfigs[ENV_TYPES.DEVELOPMENT]

// 导出配置
export default {
  // 环境信息
  env: currentEnv,
  envName: config.name,
  isDev: currentEnv === ENV_TYPES.DEVELOPMENT,
  isTest: currentEnv === ENV_TYPES.TEST,
  isProd: currentEnv === ENT_TYPES.PRODUCTION,
  
  // 云开发配置
  cloudEnvId: config.cloudEnvId,
  
  // API配置
  apiBaseUrl: config.apiBaseUrl,
  
  // 功能开关
  debug: config.debug,
  logLevel: config.logLevel,
  
  // 小程序配置
  appId: 'wx1ccb4d171dd88162', // 微信小程序AppID
  
  // 版本信息
  version: '1.0.0',
  buildTime: '2026-03-17'
}

// 环境变量验证
export function validateEnvironment() {
  const requiredVars = ['cloudEnvId']
  const missingVars = []
  
  requiredVars.forEach(varName => {
    if (!config[varName] || config[varName].includes('xxxxxx')) {
      missingVars.push(varName)
    }
  })
  
  if (missingVars.length > 0) {
    console.warn(`⚠️ 环境变量未配置: ${missingVars.join(', ')}`)
    console.warn('请更新 src/config/env.js 中的配置')
    return false
  }
  
  return true
}