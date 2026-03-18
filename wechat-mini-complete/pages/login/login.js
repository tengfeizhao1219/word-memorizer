// pages/login/login.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isLoggingIn: false,
    agreeTerms: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查是否已登录
    this.checkLoginStatus()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 已登录，跳转到首页
      wx.switchTab({
        url: '/pages/index/index'
      })
    }
  },

  /**
   * 获取用户信息
   */
  onGetUserInfo(e) {
    if (!this.data.agreeTerms) {
      wx.showToast({
        title: '请先同意用户协议',
        icon: 'none'
      })
      return
    }
    
    const userInfo = e.detail.userInfo
    if (userInfo) {
      this.setData({
        isLoggingIn: true
      })
      
      // 保存用户信息
      wx.setStorageSync('userInfo', userInfo)
      
      // 调用云函数登录
      this.loginWithWechat(userInfo)
    } else {
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'none'
      })
    }
  },

  /**
   * 微信登录
   */
  loginWithWechat(userInfo) {
    wx.showLoading({
      title: '登录中...'
    })
    
    // 获取微信登录code
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用云函数登录
          wx.cloud.callFunction({
            name: 'user-login',
            data: {
              action: 'login',
              code: res.code,
              userInfo: userInfo
            },
            success: (cloudRes) => {
              wx.hideLoading()
              console.log('云函数返回:', cloudRes)
              
              if (cloudRes.result && (cloudRes.result.success || cloudRes.result.code === 0)) {
                // 登录成功
                wx.showToast({
                  title: cloudRes.result.message || '登录成功',
                  icon: 'success'
                })
                
                // 保存用户数据
                const userData = cloudRes.result.data || {}
                wx.setStorageSync('userId', userData.userId || '')
                wx.setStorageSync('userInfo', userData.userInfo || {})
                wx.setStorageSync('userStats', userData.userInfo?.stats || {})
                
                // 跳转到首页
                setTimeout(() => {
                  wx.switchTab({
                    url: '/pages/index/index'
                  })
                }, 1500)
              } else {
                wx.showToast({
                  title: cloudRes.result?.message || '登录失败',
                  icon: 'none'
                })
                this.setData({ isLoggingIn: false })
              }
            },
            fail: (err) => {
              wx.hideLoading()
              console.error('云函数调用失败:', err)
              wx.showToast({
                title: '网络错误，请重试',
                icon: 'none'
              })
              this.setData({ isLoggingIn: false })
              
              // 如果云函数失败，使用模拟数据
              this.useMockLogin(userInfo)
            }
          })
        } else {
          wx.hideLoading()
          wx.showToast({
            title: '获取登录code失败',
            icon: 'none'
          })
          this.setData({ isLoggingIn: false })
        }
      },
      fail: (err) => {
        wx.hideLoading()
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
        this.setData({ isLoggingIn: false })
      }
    })
  },

  /**
   * 使用模拟登录（开发环境）
   */
    /**
   * 使用模拟登录（开发环境）
   * 当云环境不可用时使用
   */
  useMockLogin(userInfo) {
    console.log('🔧 使用模拟登录函数');
    console.log('用户信息:', userInfo);
    
    // 生成模拟用户数据
    const mockUserData = {
      userId: 'mock_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      userInfo: {
        nickName: userInfo.nickName || '测试用户',
        avatarUrl: userInfo.avatarUrl || '',
        stats: {
          totalWords: Math.floor(Math.random() * 100),
          todayReviewCount: Math.floor(Math.random() * 20),
          streakDays: Math.floor(Math.random() * 30) + 1,
          masteryRate: Math.floor(Math.random() * 100)
        },
        settings: {
          dailyGoal: 20,
          notificationEnabled: true,
          darkMode: false
        }
      },
      token: 'mock_token_' + Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天后过期
    };
    
    console.log('📋 模拟用户数据:', mockUserData);
    
    // 保存到本地存储
    wx.setStorageSync('userId', mockUserData.userId);
    wx.setStorageSync('userInfo', mockUserData.userInfo);
    wx.setStorageSync('userStats', mockUserData.userInfo.stats);
    wx.setStorageSync('userSettings', mockUserData.userInfo.settings);
    wx.setStorageSync('authToken', mockUserData.token);
    wx.setStorageSync('tokenExpiresAt', mockUserData.expiresAt);
    wx.setStorageSync('isMockUser', true);
    wx.setStorageSync('lastLoginTime', Date.now());
    
    // 显示成功提示
    wx.showToast({
      title: '模拟登录成功',
      icon: 'success',
      duration: 2000
    });
    
    // 记录登录事件
    console.log('✅ 模拟登录成功，用户ID:', mockUserData.userId);
    console.log('   昵称:', mockUserData.userInfo.nickName);
    console.log('   统计:', mockUserData.userInfo.stats);
    
    // 延迟跳转，让用户看到提示
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
    
    return mockUserData;
  },
  },

  /**
   * 显示手机登录
   */
  showPhoneLogin() {
    wx.showToast({
      title: '手机登录功能开发中',
      icon: 'none'
    })
  },

  /**
   * 切换协议同意状态
   */
  toggleTerms() {
    this.setData({
      agreeTerms: !this.data.agreeTerms
    })
  },

  /**
   * 显示用户协议
   */
  showTerms() {
    wx.showModal({
      title: '用户协议',
      content: '欢迎使用生词本！请仔细阅读用户协议...',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  /**
   * 显示隐私政策
   */
  showPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '我们非常重视您的隐私保护...',
      showCancel: false,
      confirmText: '我知道了'
    })
  },

  /**
   * 进入游客模式
   */
  enterGuestMode() {
    wx.showModal({
      title: '游客模式',
      content: '游客模式下数据仅保存在本地，切换设备或清除缓存会丢失数据。确定进入吗？',
      success: (res) => {
        if (res.confirm) {
          // 设置游客标识
          wx.setStorageSync('isGuest', true)
          
          // 跳转到首页
          wx.switchTab({
            url: '/pages/index/index'
          })
        }
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '生词本 - 科学记忆单词',
      path: '/pages/login/login'
    }
  }
})