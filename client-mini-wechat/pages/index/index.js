// pages/index/index.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 用户信息
    isLoggedIn: false,
    avatar: '',
    nickname: '用户',
    streakDays: 0,
    
    // 学习数据
    totalWords: 0,
    todayReviewCount: 0,
    masteryRate: 0,
    
    // 最近添加的生词
    recentWords: [
      {
        id: '1',
        word: 'example',
        meaning: '例子',
        status: 'learning'
      },
      {
        id: '2',
        word: 'memory',
        meaning: '记忆',
        status: 'reviewing'
      },
      {
        id: '3',
        word: 'efficient',
        meaning: '高效的',
        status: 'mastered'
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.checkLoginStatus()
    this.loadUserData()
    this.loadWordsData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    this.checkLoginStatus()
    this.loadUserData()
    this.loadWordsData()
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    const isLoggedIn = !!userInfo
    
    this.setData({
      isLoggedIn: isLoggedIn,
      avatar: userInfo?.avatarUrl || '',
      nickname: userInfo?.nickName || '用户'
    })
  },

  /**
   * 加载用户数据
   */
  loadUserData() {
    if (!this.data.isLoggedIn) return
    
    // 模拟用户数据
    this.setData({
      streakDays: 7,
      masteryRate: 0.75
    })
  },

  /**
   * 加载生词数据
   */
  loadWordsData() {
    if (!this.data.isLoggedIn) return
    
    // 模拟生词数据
    this.setData({
      totalWords: 42,
      todayReviewCount: 8
    })
  },

  /**
   * 导航到登录页面
   */
  navigateToLogin() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  /**
   * 导航到生词列表
   */
  navigateToWordList() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/word-list/word-list'
    })
  },

  /**
   * 导航到复习页面
   */
  navigateToReview() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/review/review'
    })
  },

  /**
   * 导航到添加生词
   */
  navigateToWordAdd() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/word-add/word-add'
    })
  },

  /**
   * 导航到统计页面
   */
  navigateToStats() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/stats/stats'
    })
  },

  /**
   * 导航到导入导出
   */
  navigateToImportExport() {
    if (!this.data.isLoggedIn) {
      this.navigateToLogin()
      return
    }
    
    wx.navigateTo({
      url: '/pages/import-export/import-export'
    })
  },

  /**
   * 查看生词详情
   */
  viewWordDetail(e) {
    const wordId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?id=${wordId}`
    })
  },

  /**
   * 显示设置
   */
  showSettings() {
    wx.showToast({
      title: '设置功能开发中',
      icon: 'none'
    })
  },

  /**
   * 获取状态颜色
   */
  getStatusColor(status) {
    const colors = {
      'learning': '#ff9500',
      'reviewing': '#007aff',
      'mastered': '#34c759'
    }
    return colors[status] || '#8e8e93'
  },

  /**
   * 获取状态文本
   */
  getStatusText(status) {
    const texts = {
      'learning': '学习中',
      'reviewing': '复习中',
      'mastered': '已掌握'
    }
    return texts[status] || '未知'
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '生词本 - 科学记忆，高效学习',
      path: '/pages/index/index'
    }
  }
})