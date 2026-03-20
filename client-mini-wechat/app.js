// app.js
App({
  onLaunch() {
    // 初始化云开发 - 使用测试环境
    // 原环境ID: 'tengfei-workstation-7czc7ab13ca3' 可能不存在
    // 使用动态环境进行测试
    wx.cloud.init({
      env: wx.cloud.DYNAMIC_CURRENT_ENV, // 使用测试环境
      traceUser: true
    })
    
    console.log('云开发初始化完成，环境:', wx.cloud.DYNAMIC_CURRENT_ENV);
    
    // 测试云开发连接
    this.testCloudConnection();
    
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        console.log('微信登录成功:', res.code);
        // 可以在这里调用登录云函数
        this.handleLogin(res.code);
      },
      fail: err => {
        console.error('微信登录失败:', err);
      }
    })
  },
  
  // 测试云开发连接
  testCloudConnection() {
    console.log('开始测试云开发连接...');
    
    // 测试数据库连接
    const db = wx.cloud.database();
    db.collection('users').count()
      .then(res => {
        console.log('✅ 数据库连接成功，用户数量:', res.total);
      })
      .catch(err => {
        console.warn('⚠️ 数据库连接测试失败（可能集合不存在）:', err.message);
        console.log('提示：这可能是正常的，如果集合尚未创建');
      });
    
    // 测试云函数
    wx.cloud.callFunction({
      name: 'login',
      data: { action: 'test' }
    })
      .then(res => {
        console.log('✅ 云函数调用成功:', res);
      })
      .catch(err => {
        console.warn('⚠️ 云函数调用失败:', err.message);
        console.log('提示：云函数可能未部署或环境配置问题');
      });
  },
  
  // 处理登录
  async handleLogin(code) {
    try {
      // 调用登录云函数
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          code: code,
          userInfo: {
            nickName: '微信用户',
            avatarUrl: ''
          }
        }
      });
      
      if (result.result.success) {
        const userData = result.result.data;
        console.log('登录成功，用户信息:', userData);
        
        // 保存用户信息到全局数据
        this.globalData.userInfo = userData.userInfo;
        this.globalData.userId = userData.userId;
        
        // 保存到本地存储
        wx.setStorageSync('userId', userData.userId);
        wx.setStorageSync('userInfo', userData.userInfo);
        
        // 触发登录成功事件
        if (this.loginSuccessCallback) {
          this.loginSuccessCallback(userData);
        }
      } else {
        console.error('登录失败:', result.result.message);
      }
    } catch (error) {
      console.error('登录过程出错:', error);
      
      // 使用模拟用户数据（开发阶段）
      const mockUser = {
        userId: 'dev_user_' + Date.now(),
        userInfo: {
          nickname: '开发测试用户',
          avatar: '',
          stats: {
            totalWords: 0,
            masteredWords: 0,
            learningWords: 0
          }
        }
      };
      
      this.globalData.userInfo = mockUser.userInfo;
      this.globalData.userId = mockUser.userId;
      wx.setStorageSync('userId', mockUser.userId);
      wx.setStorageSync('userInfo', mockUser.userInfo);
      
      console.log('使用模拟用户数据:', mockUser);
    }
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