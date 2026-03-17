/**
 * 小程序入口文件
 */

import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import uView from 'uview-plus'

// 初始化云开发
wx.cloud.init({
  env: 'cloud1-xxx', // 替换为你的云环境ID
  traceUser: true
})

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