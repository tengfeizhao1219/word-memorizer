/**
 * 小程序入口文件
 */

import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import uView from 'uview-plus'
import envConfig, { validateEnvironment } from './config/env.js'

// 环境验证
if (!validateEnvironment()) {
  console.error('❌ 环境配置不完整，请检查环境变量')
}

// 初始化云开发
wx.cloud.init({
  env: envConfig.cloudEnvId,
  traceUser: true
})

// 环境信息日志
console.log(`🚀 ${envConfig.envName} v${envConfig.version}`)
console.log(`📅 构建时间: ${envConfig.buildTime}`)
console.log(`☁️ 云环境: ${envConfig.cloudEnvId}`)

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  // 使用uView Plus
  app.use(uView)
  
  // 使用Pinia
  app.use(pinia)
  
  return {
    app,
    pinia
  }
}