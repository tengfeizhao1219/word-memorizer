// 添加单词页面逻辑
Page({
  data: {
    englishWord: '',
    chineseMeaning: '',
    phonetic: '',
    example: '',
    categoryIndex: 0,
    categories: ['未分类', '日常用语', '工作词汇', '学术词汇', '技术术语'],
    translationResult: null,
    canSave: false,
    loading: false
  },

  // 输入处理
  onEnglishInput(e) {
    this.setData({ englishWord: e.detail.value });
    this.checkCanSave();
  },

  onChineseInput(e) {
    this.setData({ chineseMeaning: e.detail.value });
    this.checkCanSave();
  },

  onPhoneticInput(e) {
    this.setData({ phonetic: e.detail.value });
  },

  onExampleInput(e) {
    this.setData({ example: e.detail.value });
  },

  onCategoryChange(e) {
    this.setData({ categoryIndex: e.detail.value });
  },

  // 检查是否可以保存
  checkCanSave() {
    const canSave = this.data.englishWord.trim() !== '' && 
                   this.data.chineseMeaning.trim() !== '';
    this.setData({ canSave });
  },

  // 翻译单词
  async translateWord() {
    const word = this.data.englishWord.trim();
    if (!word) {
      wx.showToast({
        title: '请输入英文单词',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 这里会调用翻译云函数
      // 暂时使用模拟数据
      const mockTranslation = {
        original: word,
        translated: this.getMockTranslation(word),
        source: 'en',
        target: 'zh'
      };

      this.setData({
        translationResult: mockTranslation,
        loading: false
      });

      wx.showToast({
        title: '翻译成功',
        icon: 'success'
      });

    } catch (error) {
      console.error('翻译失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '翻译失败，请手动输入',
        icon: 'none'
      });
    }
  },

  // 模拟翻译（开发阶段）
  getMockTranslation(word) {
    const mockDict = {
      'hello': '你好',
      'world': '世界',
      'apple': '苹果',
      'book': '书',
      'computer': '电脑',
      'phone': '电话',
      'water': '水',
      'food': '食物',
      'time': '时间',
      'people': '人们'
    };
    return mockDict[word.toLowerCase()] || '未找到翻译';
  },

  // 使用翻译结果
  useTranslation() {
    if (this.data.translationResult) {
      this.setData({
        chineseMeaning: this.data.translationResult.translated
      });
      this.checkCanSave();
      wx.showToast({
        title: '已使用翻译',
        icon: 'success'
      });
    }
  },

  // 保存单词
  async saveWord() {
    if (!this.data.canSave) return;

    const wordData = {
      word: this.data.englishWord.trim(),
      meaning: this.data.chineseMeaning.trim(),
      phonetic: this.data.phonetic.trim(),
      example: this.data.example.trim(),
      category: this.data.categories[this.data.categoryIndex],
      status: 'due', // 待复习
      reviewCount: 0,
      createdAt: new Date(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1天后复习
    };

    try {
      // 这里会调用云函数保存到数据库
      // 暂时使用本地存储
      const words = wx.getStorageSync('words') || [];
      words.unshift({
        ...wordData,
        id: Date.now().toString()
      });
      wx.setStorageSync('words', words);

      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });

      // 清空表单
      this.setData({
        englishWord: '',
        chineseMeaning: '',
        phonetic: '',
        example: '',
        categoryIndex: 0,
        translationResult: null,
        canSave: false
      });

      // 延迟返回
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      });
    }
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});