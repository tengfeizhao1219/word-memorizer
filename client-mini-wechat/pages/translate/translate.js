// 翻译页面逻辑
Page({
  data: {
    // 语言选择
    languages: ['中文', 'English'],
    languageCodes: ['zh', 'en'],
    fromIndex: 0, // 中文
    toIndex: 1,   // 英文
    
    // 输入和状态
    inputText: '',
    translating: false,
    
    // 翻译结果
    translationResult: null,
    canAddToWordList: false,
    
    // 历史记录
    translationHistory: [],
    
    // 错误状态
    errorMessage: '',
    showError: false
  },

  onLoad() {
    this.loadTranslationHistory();
  },

  onShow() {
    // 页面显示时刷新历史记录
    this.loadTranslationHistory();
  },

  // 加载翻译历史
  loadTranslationHistory() {
    try {
      const history = wx.getStorageSync('translationHistory') || [];
      this.setData({ translationHistory: history.slice(0, 20) }); // 只显示最近20条
    } catch (error) {
      console.error('加载翻译历史失败:', error);
    }
  },

  // 保存翻译历史
  saveTranslationHistory(translation) {
    try {
      const history = wx.getStorageSync('translationHistory') || [];
      
      // 添加时间戳
      const record = {
        ...translation,
        timestamp: Date.now()
      };
      
      // 添加到历史记录开头
      history.unshift(record);
      
      // 只保存最近50条
      const limitedHistory = history.slice(0, 50);
      
      wx.setStorageSync('translationHistory', limitedHistory);
      this.setData({ translationHistory: limitedHistory.slice(0, 20) });
      
    } catch (error) {
      console.error('保存翻译历史失败:', error);
    }
  },

  // 输入处理
  onInput(e) {
    const text = e.detail.value;
    this.setData({ inputText: text });
    
    // 实时检查是否可以添加到生词本
    this.checkCanAddToWordList(text);
  },

  // 清空输入
  clearInput() {
    this.setData({ 
      inputText: '',
      translationResult: null,
      errorMessage: '',
      showError: false
    });
  },

  // 切换语言方向
  switchLanguages() {
    const { fromIndex, toIndex } = this.data;
    this.setData({
      fromIndex: toIndex,
      toIndex: fromIndex
    });
    
    // 如果有翻译结果，也交换
    if (this.data.translationResult) {
      const { original, translated, source, target } = this.data.translationResult;
      this.setData({
        translationResult: {
          original: translated,
          translated: original,
          source: target,
          target: source,
          isFallback: this.data.translationResult.isFallback,
          provider: this.data.translationResult.provider
        }
      });
    }
  },

  // 语言选择变化
  onFromChange(e) {
    this.setData({ fromIndex: e.detail.value });
  },

  onToChange(e) {
    this.setData({ toIndex: e.detail.value });
  },

  // 检查是否可以添加到生词本
  checkCanAddToWordList(text) {
    if (!text) {
      this.setData({ canAddToWordList: false });
      return;
    }
    
    // 简单规则：英文单词（只包含字母和空格）
    const isEnglishWord = /^[a-zA-Z\s]+$/.test(text.trim());
    
    // 或者中文词汇（2-10个中文字符）
    const isChineseWord = /^[\u4e00-\u9fa5]{2,10}$/.test(text.trim());
    
    this.setData({ 
      canAddToWordList: isEnglishWord || isChineseWord 
    });
  },

  // 执行翻译
  async doTranslate() {
    const { inputText, fromIndex, toIndex, languageCodes } = this.data;
    
    if (!inputText.trim()) {
      wx.showToast({
        title: '请输入要翻译的文本',
        icon: 'none'
      });
      return;
    }

    this.setData({ 
      translating: true,
      errorMessage: '',
      showError: false
    });

    wx.showLoading({
      title: '翻译中...',
      mask: true
    });

    try {
      const source = languageCodes[fromIndex];
      const target = languageCodes[toIndex];
      
      console.log('调用翻译云函数:', { text: inputText, source, target });
      
      const result = await wx.cloud.callFunction({
        name: 'translate',
        data: {
          text: inputText.trim(),
          source: source,
          target: target
        }
      });

      wx.hideLoading();

      if (result.result && result.result.success) {
        const translation = result.result.data;
        
        // 保存到历史记录
        this.saveTranslationHistory(translation);
        
        this.setData({
          translationResult: translation,
          translating: false
        });
        
        // 检查是否可以添加到生词本
        this.checkCanAddToWordList(inputText);
        
        wx.showToast({
          title: translation.isFallback ? '使用本地词典翻译' : '翻译成功',
          icon: 'success',
          duration: 2000
        });
        
      } else {
        throw new Error(result.result?.error || '翻译失败');
      }

    } catch (error) {
      console.error('翻译调用失败:', error);
      wx.hideLoading();
      
      this.setData({
        translating: false,
        errorMessage: error.message || '翻译服务暂时不可用',
        showError: true
      });
      
      // 使用本地降级
      const fallbackTranslation = this.localFallbackTranslate(
        inputText.trim(), 
        languageCodes[fromIndex], 
        languageCodes[toIndex]
      );
      
      this.setData({
        translationResult: fallbackTranslation
      });
      
      // 保存降级翻译到历史
      this.saveTranslationHistory(fallbackTranslation);
      
      wx.showToast({
        title: '使用本地词典翻译',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 本地降级翻译
  localFallbackTranslate(text, source, target) {
    const localDict = {
      'en': {
        'hello': '你好',
        'world': '世界',
        'apple': '苹果',
        'book': '书',
        'computer': '电脑'
      },
      'zh': {
        '你好': 'hello',
        '世界': 'world',
        '苹果': 'apple',
        '书': 'book',
        '电脑': 'computer'
      }
    };

    if (source === 'en' && target === 'zh') {
      const translated = localDict.en[text.toLowerCase()];
      if (translated) {
        return {
          original: text,
          translated: translated,
          source: source,
          target: target,
          isFallback: true,
          provider: 'local'
        };
      }
    }

    if (source === 'zh' && target === 'en') {
      const translated = localDict.zh[text];
      if (translated) {
        return {
          original: text,
          translated: translated,
          source: source,
          target: target,
          isFallback: true,
          provider: 'local'
        };
      }
    }

    // 通用降级
    return {
      original: text,
      translated: source === 'en' ? `[Local] ${text}` : `[本地] ${text}`,
      source: source,
      target: target,
      isFallback: true,
      provider: 'local'
    };
  },

  // 朗读文本
  speakText(e) {
    const text = e.currentTarget.dataset.text;
    
    if (wx.createInnerAudioContext) {
      const innerAudioContext = wx.createInnerAudioContext();
      // 这里可以集成TTS服务
      // 暂时使用提示
      wx.showToast({
        title: '朗读功能开发中',
        icon: 'none'
      });
    } else {
      wx.showToast({
        title: '当前版本不支持朗读',
        icon: 'none'
      });
    }
  },

  // 添加到生词本
  addToWordList() {
    const { translationResult, inputText } = this.data;
    
    if (!translationResult) return;
    
    // 跳转到添加单词页面，携带翻译数据
    wx.navigateTo({
      url: `/pages/word-add/word-add?word=${encodeURIComponent(inputText)}&translation=${encodeURIComponent(translationResult.translated)}&source=${translationResult.source}&target=${translationResult.target}`
    });
  },

  // 复制翻译
  copyTranslation() {
    const { translationResult } = this.data;
    
    if (!translationResult) return;
    
    wx.setClipboardData({
      data: translationResult.translated,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 使用历史记录
  useHistory(e) {
    const index = e.currentTarget.dataset.index;
    const historyItem = this.data.translationHistory[index];
    
    if (historyItem) {
      // 设置对应的语言索引
      const fromIndex = this.data.languageCodes.indexOf(historyItem.source);
      const toIndex = this.data.languageCodes.indexOf(historyItem.target);
      
      this.setData({
        inputText: historyItem.original,
        fromIndex: fromIndex >= 0 ? fromIndex : 0,
        toIndex: toIndex >= 0 ? toIndex : 1,
        translationResult: historyItem
      });
      
      // 滚动到顶部
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    }
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有翻译历史记录吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('translationHistory');
            this.setData({ translationHistory: [] });
            wx.showToast({
              title: '历史记录已清空',
              icon: 'success'
            });
          } catch (error) {
            wx.showToast({
              title: '清空失败',
              icon: 'error'
            });
          }
        }
      }
    });
  },

  // 格式化时间
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 今天内
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
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
    return date.toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit'
    });
  },

  // 页面跳转
  goToWordAdd() {
    wx.navigateTo({
      url: '/pages/word-add/word-add'
    });
  },

  goToWordList() {
    wx.navigateTo({
      url: '/pages/word-list/word-list'
    });
  },

  goToTest() {
    wx.navigateTo({
      url: '/pages/test/test'
    });
  }
});