// app.js
App({
  onLaunch() {
    // 初始化云开发
    wx.cloud.init({
      env: 'tengfei-workstation-7czc7ab13ca3',
      traceUser: true
    })
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  
  onShow() {
    console.log('App Show')
  },
  
  onHide() {
    console.log('App Hide')
  },
  
  globalData: {
    userInfo: null,
    version: '1.0.0'
  }
})