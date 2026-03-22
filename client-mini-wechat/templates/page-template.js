// 页面模板逻辑
Component({
  properties: {
    // 页面配置
    pageTitle: {
      type: String,
      value: '',
    },
    
    pageSubtitle: {
      type: String,
      value: '',
    },
    
    pageClass: {
      type: String,
      value: '',
    },
    
    // 头部配置
    showHeader: {
      type: Boolean,
      value: true,
    },
    
    showBackButton: {
      type: Boolean,
      value: false,
    },
    
    backText: {
      type: String,
      value: '返回',
    },
    
    // 状态配置
    loading: {
      type: Boolean,
      value: false,
    },
    
    loadingText: {
      type: String,
      value: '',
    },
    
    error: {
      type: Boolean,
      value: false,
    },
    
    errorTitle: {
      type: String,
      value: '',
    },
    
    errorDesc: {
      type: String,
      value: '',
    },
    
    showRetryButton: {
      type: Boolean,
      value: true,
    },
    
    empty: {
      type: Boolean,
      value: false,
    },
    
    emptyIcon: {
      type: String,
      value: '',
    },
    
    emptyTitle: {
      type: String,
      value: '',
    },
    
    emptyDesc: {
      type: String,
      value: '',
    },
    
    // 底部配置
    showFooter: {
      type: Boolean,
      value: false,
    },
    
    // 浮动按钮配置
    showFAB: {
      type: Boolean,
      value: false,
    },
    
    fabText: {
      type: String,
      value: '',
    },
    
    fabIcon: {
      type: String,
      value: '',
    },
    
    // 提示配置
    showToast: {
      type: Boolean,
      value: false,
    },
    
    toastType: {
      type: String,
      value: 'info', // success, error, warning, info
    },
    
    toastMessage: {
      type: String,
      value: '',
    },
    
    // 模态框配置
    showModal: {
      type: Boolean,
      value: false,
    },
    
    modalTitle: {
      type: String,
      value: '',
    },
    
    showModalFooter: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    // 内部状态
    toastTimer: null,
  },

  methods: {
    // 返回按钮点击
    goBack() {
      this.triggerEvent('back');
      
      // 尝试使用微信导航返回
      if (wx.canIUse('navigateBack')) {
        wx.navigateBack();
      }
    },
    
    // 重试按钮点击
    onRetry() {
      this.triggerEvent('retry');
    },
    
    // 浮动按钮点击
    onFABClick() {
      this.triggerEvent('fabclick');
    },
    
    // 关闭模态框
    closeModal() {
      this.setData({ showModal: false });
      this.triggerEvent('modalclose');
    },
    
    // 打开模态框
    openModal() {
      this.setData({ showModal: true });
      this.triggerEvent('modalopen');
    },
    
    // 阻止事件冒泡
    stopPropagation() {
      // 空函数，用于阻止事件冒泡
    },
    
    // 显示提示
    showToast(message, type = 'info', duration = 3000) {
      this.setData({
        showToast: true,
        toastMessage: message,
        toastType: type,
      });
      
      // 清除之前的定时器
      if (this.data.toastTimer) {
        clearTimeout(this.data.toastTimer);
      }
      
      // 设置自动隐藏
      this.data.toastTimer = setTimeout(() => {
        this.setData({ showToast: false });
      }, duration);
    },
    
    // 隐藏提示
    hideToast() {
      this.setData({ showToast: false });
      
      if (this.data.toastTimer) {
        clearTimeout(this.data.toastTimer);
        this.data.toastTimer = null;
      }
    },
    
    // 显示加载状态
    showLoading(text = '') {
      this.setData({
        loading: true,
        loadingText: text,
        error: false,
        empty: false,
      });
    },
    
    // 隐藏加载状态
    hideLoading() {
      this.setData({ loading: false });
    },
    
    // 显示错误状态
    showError(title = '', desc = '') {
      this.setData({
        error: true,
        errorTitle: title,
        errorDesc: desc,
        loading: false,
        empty: false,
      });
    },
    
    // 隐藏错误状态
    hideError() {
      this.setData({ error: false });
    },
    
    // 显示空状态
    showEmpty(icon = '', title = '', desc = '') {
      this.setData({
        empty: true,
        emptyIcon: icon,
        emptyTitle: title,
        emptyDesc: desc,
        loading: false,
        error: false,
      });
    },
    
    // 隐藏空状态
    hideEmpty() {
      this.setData({ empty: false });
    },
    
    // 重置所有状态
    resetState() {
      this.setData({
        loading: false,
        error: false,
        empty: false,
        showToast: false,
        showModal: false,
      });
      
      if (this.data.toastTimer) {
        clearTimeout(this.data.toastTimer);
        this.data.toastTimer = null;
      }
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
    
    // 检查网络状态
    checkNetwork() {
      return new Promise((resolve) => {
        wx.getNetworkType({
          success: (res) => {
            resolve(res.networkType !== 'none');
          },
          fail: () => {
            resolve(false);
          }
        });
      });
    },
    
    // 页面滚动
    scrollToTop() {
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300
      });
    },
    
    // 页面滚动到底部
    scrollToBottom() {
      wx.pageScrollTo({
        scrollTop: 99999,
        duration: 300
      });
    },
    
    // 复制文本到剪贴板
    copyToClipboard(text, successMessage = '已复制') {
      return new Promise((resolve, reject) => {
        wx.setClipboardData({
          data: text,
          success: () => {
            this.showToast(successMessage, 'success');
            this.vibrate('light');
            resolve();
          },
          fail: (error) => {
            this.showToast('复制失败', 'error');
            reject(error);
          }
        });
      });
    },
  },

  lifetimes: {
    attached() {
      console.log('页面模板已附加');
    },
    
    detached() {
      // 清理定时器
      if (this.data.toastTimer) {
        clearTimeout(this.data.toastTimer);
        this.data.toastTimer = null;
      }
    },
  },
});