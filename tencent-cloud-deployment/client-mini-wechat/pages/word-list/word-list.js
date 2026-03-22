// 单词列表页面逻辑
Page({
  data: {
    totalWords: 0,
    dueWords: 0,
    masteredWords: 0,
    currentFilter: 'all',
    words: [],
    loading: true
  },

  onLoad() {
    this.loadWordList();
  },

  onShow() {
    // 页面显示时刷新数据
    this.loadWordList();
  },

  // 加载单词列表
  async loadWordList() {
    this.setData({ loading: true });
    
    try {
      // 云开发已经在app.js中初始化，这里直接使用
      const db = wx.cloud.database();
      
      // 获取当前用户ID（这里需要实际登录逻辑）
      const userId = wx.getStorageSync('userId') || 'test_user';
      
      // 查询单词列表
      const result = await db.collection('words')
        .where({
          userId: userId
        })
        .orderBy('createdAt', 'desc')
        .get();
      
      const words = result.data || [];
      
      // 计算统计信息
      const totalWords = words.length;
      const dueWords = words.filter(w => w.status === 'due').length;
      const masteredWords = words.filter(w => w.status === 'mastered').length;
      
      // 格式化单词数据
      const formattedWords = words.map(word => ({
        id: word._id,
        word: word.word || '',
        phonetic: word.phonetic || '',
        meaning: word.meaning || word.definitions?.[0] || '暂无释义',
        due: word.status === 'due',
        mastered: word.status === 'mastered',
        reviewCount: word.reviewCount || 0,
        nextReview: word.nextReview || ''
      }));
      
      this.setData({
        totalWords,
        dueWords,
        masteredWords,
        words: formattedWords,
        loading: false
      });
      
    } catch (error) {
      console.error('加载单词列表失败:', error);
      
      // 使用模拟数据（开发阶段）
      const mockWords = [
        {
          id: '1',
          word: 'hello',
          phonetic: '/həˈləʊ/',
          meaning: '你好，问候语',
          due: true,
          mastered: false,
          reviewCount: 3
        },
        {
          id: '2',
          word: 'world',
          phonetic: '/wɜːld/',
          meaning: '世界，地球',
          due: false,
          mastered: true,
          reviewCount: 5
        }
      ];
      
      this.setData({
        totalWords: 2,
        dueWords: 1,
        masteredWords: 1,
        words: mockWords,
        loading: false
      });
    }
  },

  // 设置筛选条件
  setFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentFilter: filter });
    
    // 这里可以根据筛选条件过滤单词列表
    // 实际实现需要根据filter重新查询或过滤数据
  },

  // 查看单词详情
  viewWordDetail(e) {
    const wordId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/word-detail/word-detail?id=${wordId}`
    });
  },

  // 跳转到添加单词页面
  goToAddWord() {
    wx.navigateTo({
      url: '/pages/word-add/word-add'
    });
  },

  // 开始复习
  startReview() {
    wx.navigateTo({
      url: '/pages/review/review'
    });
  }
});