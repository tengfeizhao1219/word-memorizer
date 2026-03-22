// 首页逻辑 - 基于WordMemeray设计
Page({
  data: {
    // 用户信息
    userInfo: null,
    
    // 查询相关
    queryWord: '',
    queryResult: null,
    searching: false,
    
    // 学习统计
    userStats: {
      totalWords: 0,
      masteredWords: 0,
      streakDays: 0,
      todayWords: 0,
      learningProgress: 0
    },
    
    // 最近学习
    recentWords: [],
    
    // 当前标签页
    currentTab: 'home',
    
    // 页面状态
    pageLoaded: false
  },

  onLoad() {
    console.log('WordMemeray风格首页加载');
    this.initPage();
  },

  onShow() {
    console.log('首页显示');
    this.loadUserData();
    this.loadRecentWords();
  },

  onReady() {
    // 页面渲染完成
    setTimeout(() => {
      this.setData({ pageLoaded: true });
    }, 300);
  },

  // 初始化页面
  initPage() {
    this.checkLoginStatus();
    this.loadUserData();
    this.loadRecentWords();
    
    // 显示欢迎动画
    this.showWelcomeAnimation();
  },

  // 检查登录状态
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  // 加载用户数据
  loadUserData() {
    try {
      // 加载学习统计
      const stats = wx.getStorageSync('userStats') || {
        totalWords: 0,
        masteredWords: 0,
        streakDays: 0,
        todayWords: 0,
        learningProgress: 0
      };
      
      // 模拟一些数据（实际应从后端获取）
      if (stats.totalWords === 0) {
        stats.totalWords = Math.floor(Math.random() * 50) + 10;
        stats.masteredWords = Math.floor(stats.totalWords * 0.7);
        stats.streakDays = Math.floor(Math.random() * 30) + 1;
        stats.todayWords = Math.floor(Math.random() * 10) + 1;
        stats.learningProgress = Math.floor(Math.random() * 100);
        
        wx.setStorageSync('userStats', stats);
      }
      
      this.setData({ userStats: stats });
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  },

  // 加载最近学习的单词
  loadRecentWords() {
    try {
      const words = wx.getStorageSync('userWords') || [];
      const recentWords = words.slice(0, 5).map(word => ({
        ...word,
        id: word.id || Date.now() + Math.random(),
        formattedTime: this.formatTime(word.createdAt || Date.now())
      }));
      
      this.setData({ recentWords });
    } catch (error) {
      console.error('加载最近单词失败:', error);
    }
  },

  // 查询输入变化
  onQueryInput(e) {
    const queryWord = e.detail.value;
    this.setData({ queryWord });
  },

  // 清空查询
  clearQuery() {
    this.setData({ 
      queryWord: '',
      queryResult: null 
    });
    
    // 震动反馈
    this.vibrate('light');
  },

  // 执行查询
  async onSearch() {
    const { queryWord } = this.data;
    
    if (!queryWord.trim()) {
      this.showToast('请输入要查询的单词', 'warning');
      return;
    }
    
    // 开始查询
    this.setData({ searching: true });
    
    try {
      // 震动反馈
      this.vibrate('medium');
      
      // 模拟网络延迟
      await this.delay(500);
      
      // 调用查询API
      const result = await this.queryWordAPI(queryWord);
      
      if (result.success) {
        this.setData({ queryResult: result.data });
        this.showToast('查询成功', 'success');
      } else {
        this.showToast(result.message || '查询失败', 'error');
      }
    } catch (error) {
      console.error('查询出错:', error);
      this.showToast('查询服务暂时不可用', 'error');
    } finally {
      this.setData({ searching: false });
    }
  },

  // 查询单词API
  async queryWordAPI(word) {
    // 模拟API调用
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟的单词数据
        const dictionary = {
          'hello': { chinese: '你好', details: '用于打招呼的常用语', example: 'Hello, how are you?' },
          'world': { chinese: '世界', details: '地球和所有生物的总称', example: 'Hello world!' },
          'thank': { chinese: '感谢', details: '表达感激之情', example: 'Thank you very much.' },
          'good': { chinese: '好的', details: '表示肯定或赞扬', example: 'Good job!' },
          'morning': { chinese: '早晨', details: '一天中的上午时段', example: 'Good morning!' },
          'night': { chinese: '夜晚', details: '一天中的晚上时段', example: 'Good night!' },
          'love': { chinese: '爱', details: '深厚的情感', example: 'I love you.' },
          'study': { chinese: '学习', details: '获取知识或技能的过程', example: 'I study English every day.' },
          'book': { chinese: '书', details: '装订成册的著作', example: 'This is an interesting book.' },
          'computer': { chinese: '计算机', details: '用于处理数据的电子设备', example: 'I work on a computer.' }
        };
        
        const lowerWord = word.toLowerCase();
        
        if (dictionary[lowerWord]) {
          resolve({
            success: true,
            data: {
              english: word,
              chinese: dictionary[lowerWord].chinese,
              details: dictionary[lowerWord].details,
              example: dictionary[lowerWord].example
            }
          });
        } else {
          resolve({
            success: true,
            data: {
              english: word,
              chinese: `[未找到] ${word}`,
              details: '该单词不在本地词典中',
              example: '请尝试其他单词或连接网络使用在线翻译'
            }
          });
        }
      }, 300);
    });
  },

  // 添加到生词本
  addToWordList() {
    const { queryResult } = this.data;
    
    if (!queryResult) {
      this.showToast('没有可添加的单词', 'warning');
      return;
    }
    
    // 获取单词信息
    const wordData = {
      english: queryResult.english,
      chinese: queryResult.chinese,
      details: queryResult.details,
      example: queryResult.example,
      source: 'query',
      createdAt: Date.now(),
      difficulty: 'normal',
      reviewCount: 0,
      lastReviewed: null
    };
    
    // 保存到本地存储
    try {
      const words = wx.getStorageSync('userWords') || [];
      
      // 检查是否已存在
      const exists = words.some(word => 
        word.english.toLowerCase() === wordData.english.toLowerCase()
      );
      
      if (exists) {
        this.showToast('该单词已在生词本中', 'info');
        return;
      }
      
      words.unshift(wordData);
      wx.setStorageSync('userWords', words);
      
      // 更新统计
      this.updateStatsAfterAdd();
      
      // 更新最近单词列表
      this.loadRecentWords();
      
      // 震动反馈
      this.vibrate('heavy');
      
      // 显示成功提示
      this.showToast('已添加到生词本', 'success');
      
      // 清空查询结果
      this.setData({ queryResult: null });
    } catch (error) {
      console.error('添加到生词本失败:', error);
      this.showToast('添加到生词本失败', 'error');
    }
  },

  // 添加单词后更新统计
  updateStatsAfterAdd() {
    try {
      const stats = wx.getStorageSync('userStats') || this.data.userStats;
      stats.totalWords += 1;
      stats.todayWords += 1;
      stats.learningProgress = Math.min(100, stats.learningProgress + 5);
      
      wx.setStorageSync('userStats', stats);
      this.setData({ userStats: stats });
    } catch (error) {
      console.error('更新统计失败:', error);
    }
  },

  // 查看单词详情
  viewWordDetail(e) {
    const wordId = e.currentTarget.dataset.id;
    
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?id=${wordId}`
    });
  },

  // 切换标签页
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab });
    
    // 导航到对应页面
    switch (tab) {
      case 'translate':
        this.goToTranslate();
        break;
      case 'wordbook':
        this.goToWordList();
        break;
      case 'review':
        this.goToReview();
        break;
      case 'reminder':
        this.goToReminder();
        break;
    }
    
    // 震动反馈
    this.vibrate('light');
  },

  // 导航到其他页面
  goToTranslate() {
    wx.navigateTo({
      url: '/pages/translate/translate'
    });
  },

  goToWordList() {
    wx.navigateTo({
      url: '/pages/word-list/word-list'
    });
  },

  goToReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  },

  goToReminder() {
    wx.navigateTo({
      url: '/pages/reminder/reminder'
    });
  },

  goToWordAdd() {
    wx.navigateTo({
      url: '/pages/word-add/word-add'
    });
  },

  // 用户登录
  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      const userInfo = e.detail.userInfo;
      this.setData({ userInfo });
      wx.setStorageSync('userInfo', userInfo);
      this.showToast('登录成功', 'success');
      
      // 关闭登录提示
      setTimeout(() => {
        this.setData({ userInfo });
      }, 500);
    }
  },

  // 显示欢迎动画
  showWelcomeAnimation() {
    // 这里可以添加一些动画效果
    console.log('显示欢迎动画');
  },

  // 工具函数
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 今天
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
    
    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return '昨天';
    }
    
    // 一周内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return days[date.getDay()];
    }
    
    // 更早
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    });
  },

  // 显示提示
  showToast(message, type = 'info') {
    wx.showToast({
      title: message,
      icon: type === 'success' ? 'success' : 'none',
      duration: 2000
    });
  },

  // 震动反馈
  vibrate(type = 'light') {
    if (wx.canIUse('vibrateShort')) {
      const vibrateMap = {
        light: 'light',
        medium: 'medium',
        heavy: 'heavy'
      };
      
      wx.vibrateShort({
        type: vibrateMap[type] || 'light'
      });
    }
  },

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    // 重新加载数据
    this.loadUserData();
    this.loadRecentWords();
    
    // 停止下拉刷新
    setTimeout(() => {
      wx.stopPullDownRefresh();
      this.showToast('刷新完成', 'success');
    }, 1000);
  },

  // 页面分享
  onShareAppMessage() {
    return {
      title: '单词本学习系统',
      path: '/pages/index/index',
      imageUrl: '/static/share-image.jpg'
    };
  }
});