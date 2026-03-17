/**
 * 云函数部署配置
 */

module.exports = {
  // 环境配置
  env: 'tengfei-workstation-7czc7ab13ca3',
  region: 'ap-shanghai',
  
  // 云函数配置
  functions: {
    // 用户服务
    'user/login': {
      timeout: 5,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    'user/getInfo': {
      timeout: 5,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    
    // 生词服务
    'word/add': {
      timeout: 10,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    'word/list': {
      timeout: 10,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    'word/detail': {
      timeout: 10,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    'word/search': {
      timeout: 10,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    'word/import': {
      timeout: 30,
      memory: 512,
      envVariables: {},
      installDependency: true
    },
    'word/export': {
      timeout: 30,
      memory: 512,
      envVariables: {},
      installDependency: true
    },
    
    // 复习服务
    'review/getToday': {
      timeout: 10,
      memory: 256,
      envVariables: {},
      installDependency: true
    },
    'review/submit': {
      timeout: 10,
      memory: 256,
      envVariables: {},
      installDependency: true
    }
  },
  
  // 部署选项
  options: {
    force: false,
    verbose: true,
    all: false
  }
};