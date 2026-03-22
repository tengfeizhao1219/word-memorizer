// 首页逻辑 - 单词本学习系统
Page({
  data: {
    // 用户信息
    userInfo: null,
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    
    // 学习统计
    stats: {
      totalWords: 0,
      masteredWords: 0,
      streakDays: 0,
      todayLearned: 0
    },
    
    // 今日目标
    dailyGoal: {
      target: 10,
      completed: 0,
      progress: 0
    },
    
    // 最近学习单词
    recentWords: [],
    
    // 复习数量
    reviewCount: 0,
    
    // 当前页面
    currentPage: 'index',
    
    // 加载状态
    loading: true,
    refreshing: false
  },

  onLoad() {
    console.log('首页加载');
    
    // 检查微信版本
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
    
    // 初始化数据
    this.initData();
  },

  onShow() {
    console.log('首页显示');
    // 刷新数据
    this.refreshData();
  },

  onPullDownRefresh() {
    console.log('下拉刷新');
    this.setData({ refreshing: true });
    this.refreshData().finally(() => {
      wx.stopPullDownRefresh();
      this.setData({ refreshing: false });
    });
  },

  // 初始化数据
  async initData() {
    try {
      // 检查登录状态
      await this.checkLoginStatus();
      
      // 加载用户数据
      await this.loadUserData();
      
      // 加载学习数据
      await this.loadLearningData();
      
      // 加载最近单词
      await this.loadRecentWords();
      
      // 加载复习数量
      await this.loadReviewCount();
      
    } catch (error) {
      console.error('初始化数据失败:', error);
      wx.showToast({
        title: '数据加载失败',
        icon: 'error'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 刷新数据
  async refreshData() {
    try {
      // 并行加载所有数据
      await Promise.all([
        this.loadUserData(),
        this.loadLearningData(),
        this.loadRecentWords(),
        this.loadReviewCount()
      ]);
      
      wx.showToast({
        title: '刷新成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('刷新数据失败:', error);
      wx.showToast({
        title: '刷新失败',
        icon: 'error'
      });
    }
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      // 检查本地存储
      const userInfo = wx.getStorageSync('userInfo');
      if (userInfo) {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
        return true;
      }
      
      // 检查云开发登录状态
      const auth = wx.getStorageSync('auth');
      if (auth && auth.openid) {
        // 已登录，获取用户信息
        await this.getUserInfoFromCloud();
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('检查登录状态失败:', error);
      return false;
    }
  },

  // 从云端获取用户信息
  async getUserInfoFromCloud() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          action: 'getUserInfo'
        }
      });
      
      if (result.result && result.result.success) {
        const userInfo = result.result.data;
        wx.setStorageSync('userInfo', userInfo);
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  },

  // 加载用户数据
  async loadUserData() {
    if (!this.data.hasUserInfo) return;
    
    try {
      // 这里可以加载用户的个性化设置
      // 暂时使用模拟数据
      const settings = wx.getStorageSync('userSettings') || {
        dailyGoal: 10,
        notification: true,
        theme: 'light'
      };
      
      this.setData({
        'dailyGoal.target': settings.dailyGoal
      });
      
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  },

  // 加载学习数据
  async loadLearningData() {
    try {
      // 尝试从云端获取统计数据
      let stats = null;
      
      if (this.data.hasUserInfo) {
        try {
          const result = await wx.cloud.callFunction({
            name: 'word',
            data: {
              action: 'getStats'
            }
          });
          
          if (result.result && result.result.success) {
            stats = result.result.data;
          }
        } catch (cloudError) {
          console.warn('云端统计数据获取失败，使用本地数据:', cloudError);
        }
      }
      
      // 如果没有云端数据，使用本地数据
      if (!stats) {
        const localWords = wx.getStorageSync('words') || [];
        const today = new Date().toDateString();
        
        stats = {
          totalWords: localWords.length,
          masteredWords: localWords.filter(w => w.mastered).length,
          streakDays: this.calculateStreakDays(localWords),
          todayLearned: localWords.filter(w => {
            const wordDate = new Date(w.createdAt).toDateString();
            return wordDate === today;
          }).length
        };
      }
      
      // 更新今日目标完成情况
      const dailyGoal = {
        ...this.data.dailyGoal,
        completed: stats.todayLearned,
        progress: Math.min(stats.todayLearned / this.data.dailyGoal.target * 100, 100)
      };
      
      this.setData({
        stats: stats,
        dailyGoal: dailyGoal
      });
      
    } catch (error) {
      console.error('加载学习数据失败:', error);
    }
  },

  // 计算连续学习天数
  calculateStreakDays(words) {
    if (!words || words.length === 0) return 0;
    
    // 按日期分组
    const dateMap = {};
    words.forEach(word => {
      const date = new Date(word.createdAt).toDateString();
      dateMap[date] = true;
    });
    
    // 计算连续天数
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) { // 最多检查一年
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toDateString();
      
      if (dateMap[dateStr]) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  },

  // 加载最近单词
  async loadRecentWords() {
    try {
      let recentWords = [];
      
      if (this.data.hasUserInfo) {
        try {
          const result = await wx.cloud.callFunction({
            name: 'word',
            data: {
              action: 'getRecent',
              limit: 5
            }
          });
          
          if (result.result && result.result.success) {
            recentWords = result.result.data;
          }
        } catch (cloudError) {
          console.warn('云端最近单词获取失败，使用本地数据:', cloudError);
        }
      }
      
      // 如果没有云端数据，使用本地数据
      if (recentWords.length === 0) {
        const localWords = wx.getStorageSync('words') || [];
        recentWords = localWords
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(word => ({
            id: word.id || word._id,
            english: word.english,
            chinese: word.chinese,
            difficulty: word.difficulty || 'normal',
            createdAt: word.createdAt
          }));
      }
      
      this.setData({ recentWords });
      
    } catch (error) {
      console.error('加载最近单词失败:', error);
    }
  },

  // 加载复习数量
  async loadReviewCount() {
    try {
      let reviewCount = 0;
      
      if (this.data.hasUserInfo) {
        try {
          const result = await wx.cloud.callFunction({
            name: 'review',
            data: {
              action: 'getReviewCount'
            }
          });
          
          if (result.result && result.result.success) {
            reviewCount = result.result.data.count || 0;
          }
        } catch (cloudError) {
          console.warn('云端复习数量获取失败，使用本地计算:', cloudError);
        }
      }
      
      // 本地计算复习数量
      if (reviewCount === 0) {
        const localWords = wx.getStorageSync('words') || [];
        const now = Date.now();
        
        reviewCount = localWords.filter(word => {
          if (word.mastered) return false;
          
          const lastReviewed = word.lastReviewed ? new Date(word.lastReviewed).getTime() : 0;
          const interval = this.getReviewInterval(word.difficulty);
          
          return now - lastReviewed > interval;
        }).length;
      }
      
      this.setData({ reviewCount });
      
    } catch (error) {
      console.error('加载复习数量失败:', error);
      this.setData({ reviewCount: 0 });
    }
  },

  // 获取复习间隔（毫秒）
  getReviewInterval(difficulty) {
    const intervals = {
      easy: 3 * 24 * 60 * 60 * 1000, // 3天
      normal: 24 * 60 * 60 * 1000,   // 1天
      hard: 12 * 60 * 60 * 1000      // 12小时
    };
    
    return intervals[difficulty] || intervals.normal;
  },

  // 微信登录
  onGetUserInfo(e) {
    console.log('获取用户信息:', e);
    
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      
      // 保存到本地
      wx.setStorageSync('userInfo', userInfo);
      
      // 更新数据
      this.setData({
        userInfo: userInfo,
        hasUserInfo: true
      });
      
      // 尝试云登录
      this.cloudLogin(userInfo);
      
      // 刷新数据
      this.refreshData();
      
    } else {
      wx.showToast({
        title: '登录取消',
        icon: 'none'
      });
    }
  },

  // 云登录
  async cloudLogin(userInfo) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          action: 'login',
          userInfo: userInfo
        }
      });
      
      if (result.result && result.result.success) {
        console.log('云登录成功:', result.result);
        
        // 保存认证信息
        wx.setStorageSync('auth', {
          openid: result.result.data.openid,
          sessionKey: result.result.data.session_key
        });
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      }
    } catch (error) {
      console.error('云登录失败:', error);
      wx.showToast({
        title: '登录失败，使用本地模式',
        icon: 'none'
      });
    }
  },

  // 格式化时间
  formatTime(timestamp) {
    if (!timestamp) return '刚刚';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 今天内
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    // 昨天
    if (diff < 2 * 24 * 60 * 60 * 1000) {
      return '昨天';
    }
    
    // 一周内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}天前`;
    }
    
    // 更早
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${month}-${day}`;
  },

  // 页面跳转
  goToWordAdd() {
    wx.navigateTo({
      url: '/pages/word-add/word-add'
    });
  },

  goToTranslate() {
    wx.navigateTo({
      url: '/pages/translate/translate'
    });
  },

  goToReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },

  goToWordList() {
    wx.navigateTo({
      url: '/pages/word-list/word-list'
    });
  },

  goToStats() {
    wx.navigateTo({
      url: '/pages/stats/stats'
    });
  },

  goToTest() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  viewWordDetail(e) {
    const wordId = e.currentTarget.dataset.id;
    if (wordId) {
      wx.navigateTo({
        url: `/pages/word-detail/word-detail?id=${wordId}`
      });
    }
  },

  switchToIndex() {
    // 已经在首页，可以添加刷新逻辑
    this.refreshData();
  },

  // 分享功能
  onShareAppMessage() {
    return {
      title: '单词本学习系统 - 高效背单词工具',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.jpg'
    };
  },

  onShareTimeline() {
    return {
      title: '我正在使用单词本学习系统背单词，你也来试试吧！',
      query: ''
    };
  }
});