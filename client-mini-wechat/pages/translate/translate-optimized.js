// 翻译页面逻辑 - 优化版
Page({
  data: {
    // 语言选择
    languages: ['中文', 'English', '日语', '韩语', '法语', '德语', '西班牙语'],
    languageCodes: ['zh', 'en', 'ja', 'ko', 'fr', 'de', 'es'],
    fromIndex: 0, // 中文
    toIndex: 1,   // 英文
    
    // 输入和状态
    inputText: '',
    translating: false,
    showLoading: false,
    
    // 翻译结果
    translationResult: null,
    canAddToWordList: false,
    
    // 历史记录
    translationHistory: [],
    
    // UI状态
    showSuccessToast: false,
    showErrorToast: false,
    toastMessage: '',
    
    // 动画状态
    animationClass: '',
    
    // 页面状态
    pageLoaded: false
  },

  onLoad() {
    console.log('翻译页面加载');
    this.initPage();
  },

  onShow() {
    console.log('翻译页面显示');
    this.loadTranslationHistory();
  },

  onReady() {
    // 页面渲染完成
    setTimeout(() => {
      this.setData({ pageLoaded: true });
    }, 300);
  },

  // 初始化页面
  initPage() {
    this.loadTranslationHistory();
    this.checkNetworkStatus();
    
    // 显示欢迎动画
    this.showWelcomeAnimation();
  },

  // 显示欢迎动画
  showWelcomeAnimation() {
    this.setData({ animationClass: 'welcome-animation' });
    
    setTimeout(() => {
      this.setData({ animationClass: '' });
    }, 1000);
  },

  // 检查网络状态
  checkNetworkStatus() {
    wx.getNetworkType({
      success: (res) => {
        console.log('网络类型:', res.networkType);
        if (res.networkType === 'none') {
          this.showToast('网络未连接，将使用本地词典', 'warning');
        }
      }
    });
  },

  // 加载翻译历史
  loadTranslationHistory() {
    try {
      const history = wx.getStorageSync('translationHistory') || [];
      this.setData({ 
        translationHistory: history.slice(0, 20).map(item => ({
          ...item,
          formattedTime: this.formatTime(item.timestamp)
        }))
      });
    } catch (error) {
      console.error('加载翻译历史失败:', error);
      this.showToast('加载历史记录失败', 'error');
    }
  },

  // 保存翻译历史
  saveTranslationHistory(translation) {
    try {
      const history = wx.getStorageSync('translationHistory') || [];
      
      // 避免重复保存相同的翻译
      const isDuplicate = history.some(item => 
        item.original === translation.original && 
        item.translated === translation.translated
      );
      
      if (!isDuplicate) {
        const newItem = {
          ...translation,
          timestamp: Date.now(),
          source: this.data.languages[this.data.fromIndex],
          target: this.data.languages[this.data.toIndex]
        };
        
        history.unshift(newItem);
        
        // 只保存最近100条记录
        const trimmedHistory = history.slice(0, 100);
        wx.setStorageSync('translationHistory', trimmedHistory);
        
        // 更新显示的历史记录
        this.setData({
          translationHistory: trimmedHistory.slice(0, 20).map(item => ({
            ...item,
            formattedTime: this.formatTime(item.timestamp)
          }))
        });
      }
    } catch (error) {
      console.error('保存翻译历史失败:', error);
    }
  },

  // 语言选择变化
  onFromChange(e) {
    const index = e.detail.value;
    this.setData({ fromIndex: index });
    
    // 如果源语言和目标语言相同，自动切换目标语言
    if (index === this.data.toIndex) {
      const newToIndex = (index + 1) % this.data.languages.length;
      this.setData({ toIndex: newToIndex });
    }
    
    this.showToast(`已切换源语言为: ${this.data.languages[index]}`, 'info');
  },

  onToChange(e) {
    const index = e.detail.value;
    this.setData({ toIndex: index });
    
    // 如果目标语言和源语言相同，自动切换源语言
    if (index === this.data.fromIndex) {
      const newFromIndex = (index + 1) % this.data.languages.length;
      this.setData({ fromIndex: newFromIndex });
    }
    
    this.showToast(`已切换目标语言为: ${this.data.languages[index]}`, 'info');
  },

  // 交换语言
  switchLanguages() {
    const { fromIndex, toIndex } = this.data;
    this.setData({
      fromIndex: toIndex,
      toIndex: fromIndex
    });
    
    // 如果有输入文本，自动重新翻译
    if (this.data.inputText && this.data.translationResult) {
      setTimeout(() => {
        this.doTranslate();
      }, 300);
    }
    
    this.showToast('已交换翻译方向', 'info');
  },

  // 输入文本变化
  onInput(e) {
    const text = e.detail.value;
    this.setData({ inputText: text });
    
    // 实时检查是否可以添加到单词本
    if (text && this.data.translationResult) {
      const canAdd = this.checkCanAddToWordList(text, this.data.translationResult.translated);
      this.setData({ canAddToWordList: canAdd });
    }
  },

  // 清空输入
  clearInput() {
    this.setData({ 
      inputText: '',
      translationResult: null,
      canAddToWordList: false 
    });
    
    // 震动反馈
    this.vibrate('light');
  },

  // 执行翻译
  async doTranslate() {
    const { inputText, fromIndex, toIndex } = this.data;
    
    if (!inputText.trim()) {
      this.showToast('请输入要翻译的文本', 'warning');
      return;
    }
    
    if (inputText.length > 500) {
      this.showToast('文本过长，请控制在500字符以内', 'warning');
      return;
    }
    
    // 开始翻译
    this.setData({ 
      translating: true,
      showLoading: true 
    });
    
    try {
      // 震动反馈
      this.vibrate('medium');
      
      // 模拟网络延迟
      await this.delay(300);
      
      // 调用翻译API
      const result = await this.callTranslateAPI(inputText, fromIndex, toIndex);
      
      if (result.success) {
        const translationResult = {
          original: inputText,
          translated: result.translation,
          provider: result.provider,
          timestamp: Date.now()
        };
        
        this.setData({
          translationResult,
          canAddToWordList: this.checkCanAddToWordList(inputText, result.translation)
        });
        
        // 保存到历史记录
        this.saveTranslationHistory(translationResult);
        
        // 显示成功提示
        this.showToast('翻译成功', 'success');
        
        // 自动滚动到结果区域
        this.scrollToResult();
      } else {
        this.showToast(result.message || '翻译失败', 'error');
      }
    } catch (error) {
      console.error('翻译出错:', error);
      this.showToast('翻译服务暂时不可用', 'error');
    } finally {
      this.setData({ 
        translating: false,
        showLoading: false 
      });
    }
  },

  // 调用翻译API
  async callTranslateAPI(text, fromIndex, toIndex) {
    const sourceLang = this.data.languageCodes[fromIndex];
    const targetLang = this.data.languageCodes[toIndex];
    
    // 检查是否是中英文互译
    const isChineseEnglish = (sourceLang === 'zh' && targetLang === 'en') || 
                           (sourceLang === 'en' && targetLang === 'zh');
    
    if (isChineseEnglish) {
      // 尝试调用腾讯云翻译
      try {
        const tencentResult = await this.callTencentTranslate(text, sourceLang, targetLang);
        if (tencentResult.success) {
          return {
            success: true,
            translation: tencentResult.translation,
            provider: 'tencent'
          };
        }
      } catch (error) {
        console.warn('腾讯云翻译失败，使用本地词典:', error);
      }
    }
    
    // 使用本地词典
    return this.callLocalDictionary(text, sourceLang, targetLang);
  },

  // 调用腾讯云翻译
  async callTencentTranslate(text, sourceLang, targetLang) {
    return new Promise((resolve) => {
      wx.cloud.callFunction({
        name: 'translate',
        data: {
          text: text,
          source: sourceLang,
          target: targetLang
        },
        success: (res) => {
          if (res.result && res.result.success) {
            resolve({
              success: true,
              translation: res.result.translation
            });
          } else {
            resolve({ success: false });
          }
        },
        fail: (error) => {
          console.error('腾讯云翻译调用失败:', error);
          resolve({ success: false });
        }
      });
    });
  },

  // 调用本地词典
  callLocalDictionary(text, sourceLang, targetLang) {
    // 简单的本地词典（示例）
    const dictionary = {
      'hello': '你好',
      'world': '世界',
      'thank you': '谢谢',
      'good morning': '早上好',
      'good night': '晚安',
      '我爱你': 'I love you',
      '谢谢': 'thank you',
      '你好': 'hello',
      '世界': 'world'
    };
    
    const key = text.toLowerCase();
    const translation = dictionary[key] || `[本地词典] ${text}`;
    
    return {
      success: true,
      translation: translation,
      provider: 'local'
    };
  },

  // 检查是否可以添加到单词本
  checkCanAddToWordList(original, translated) {
    // 只允许中英文单词（长度适中）
    const isReasonableLength = original.length <= 50 && translated.length <= 50;
    const isWordLike = original.split(' ').length <= 3 && translated.split(' ').length <= 3;
    
    return isReasonableLength && isWordLike;
  },

  // 添加到单词本
  addToWordList() {
    const { translationResult, fromIndex, toIndex } = this.data;
    
    if (!translationResult || !this.data.canAddToWordList) {
      this.showToast('无法添加此翻译到单词本', 'warning');
      return;
    }
    
    // 获取单词信息
    const wordData = {
      english: fromIndex === 1 ? translationResult.original : translationResult.translated,
      chinese: fromIndex === 0 ? translationResult.original : translationResult.translated,
      source: 'translation',
      createdAt: Date.now(),
      difficulty: 'normal'
    };
    
    // 保存到本地存储
    try {
      const words = wx.getStorageSync('userWords') || [];
      words.unshift(wordData);
      wx.setStorageSync('userWords', words);
      
      // 震动反馈
      this.vibrate('heavy');
      
      // 显示成功提示
      this.showToast('已添加到单词本', 'success');
      
      // 更新状态
      this.setData({ canAddToWordList: false });
    } catch (error) {
      console.error('添加到单词本失败:', error);
      this.showToast('添加到单词本失败', 'error');
    }
  },

  // 朗读文本
  speakText(e) {
    const text = e.currentTarget.dataset.text;
    
    if (!text) {
      this.showToast('没有可朗读的文本', 'warning');
      return;
    }
    
    // 检查TTS支持
    if (wx.canIUse('createInnerAudioContext')) {
      // 这里可以集成TTS服务
      this.showToast('朗读功能开发中', 'info');
    } else {
      this.showToast('当前设备不支持朗读', 'warning');
    }
  },

  // 复制翻译
  copyTranslation() {
    const { translationResult } = this.data;
    
    if (!translationResult) {
      this.showToast('没有可复制的内容', 'warning');
      return;
    }
    
    wx.setClipboardData({
      data: translationResult.translated,
      success: () => {
        this.showToast('已复制到剪贴板', 'success');
        this.vibrate('light');
      },
      fail: () => {
        this.showToast('复制失败', 'error');
      }
    });
  },

  // 使用历史记录
  useHistory(e) {
    const index = e.currentTarget.dataset.index;
    const historyItem = this.data.translationHistory[index];
    
    if (historyItem) {
      this.setData({
        inputText: historyItem.original,
        fromIndex: this.data.languages.indexOf(historyItem.source),
        toIndex: this.data.languages.indexOf(historyItem.target)
      });
      
      // 自动翻译
      setTimeout(() => {
        this.doTranslate();
      }, 500);
      
      this.showToast('已加载历史记录', 'info');
    }
  },

  // 清空历史记录
  clearHistory() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有翻译历史吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            wx.removeStorageSync('translationHistory');
            this.setData({ translationHistory: [] });
            this.showToast('历史记录已清空', 'success');
            this.vibrate('medium');
          } catch (error) {
            console.error('清空历史记录失败:', error);
            this.showToast('清空失败', 'error');
          }
        }
      }
    });
  },

  // 显示教程
  showTutorial() {
    wx.showModal({
      title: '使用教程',
      content: '1. 选择源语言和目标语言\n2. 输入要翻译的文本\n3. 点击翻译按钮\n4. 可将结果加入单词本学习',
      showCancel: false,
      confirmText: '知道了'
    });
  },

  // 导航到其他页面
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
    this.setData({
      showSuccessToast: type === 'success',
      showErrorToast: type === 'error',
      toastMessage: message
    });
    
    // 自动隐藏
    setTimeout(() => {
      this.setData({
        showSuccessToast: false,
        showErrorToast: false,
        toastMessage: ''
      });
    }, 3000);
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

  // 滚动到结果区域
  scrollToResult() {
    // 在微信小程序中，可以使用选择器滚动到指定元素
    // 这里使用页面滚动
    wx.pageScrollTo({
      scrollTop: 500,
      duration: 300
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    console.log('下拉刷新');
    
    // 重新加载历史记录
    this.loadTranslationHistory();
    
    // 停止下拉刷新
    setTimeout(() => {
      wx.stopPullDownRefresh();
      this.showToast('刷新完成', 'success');
    }, 1000);
  },

  // 上拉加载更多
  onReachBottom() {
    console.log('上拉加载更多');
    // 这里可以加载更多历史记录
    this.showToast('已加载所有历史记录', 'info');
  }
});