// 按钮组件逻辑
Component({
  properties: {
    // 按钮类型
    type: {
      type: String,
      value: 'primary', // primary, secondary, ghost, danger
    },
    
    // 按钮尺寸
    size: {
      type: String,
      value: 'medium', // small, medium, large
    },
    
    // 按钮文字
    text: {
      type: String,
      value: '',
    },
    
    // 图标
    icon: {
      type: String,
      value: '',
    },
    
    // 右侧图标
    iconRight: {
      type: String,
      value: '',
    },
    
    // 自定义样式
    customStyle: {
      type: String,
      value: '',
    },
    
    // 是否禁用
    disabled: {
      type: Boolean,
      value: false,
    },
    
    // 是否加载中
    loading: {
      type: Boolean,
      value: false,
    },
    
    // 表单类型
    formType: {
      type: String,
      value: '',
    },
    
    // 开放能力
    openType: {
      type: String,
      value: '',
    },
    
    // 是否镂空
    plain: {
      type: Boolean,
      value: false,
    },
    
    // 按钮标识
    dataSet: {
      type: Object,
      value: {},
    },
  },

  methods: {
    // 按钮点击事件
    onTap(e) {
      if (this.data.disabled || this.data.loading) {
        return;
      }
      
      // 触发自定义点击事件
      this.triggerEvent('click', {
        event: e,
        dataset: this.data.dataSet,
      });
      
      // 触发震动反馈
      if (wx.canIUse('vibrateShort')) {
        wx.vibrateShort({
          type: 'light'
        });
      }
    },
    
    // 获取用户信息回调
    onGetUserInfo(e) {
      this.triggerEvent('getuserinfo', e.detail);
    },
    
    // 联系客服回调
    onContact(e) {
      this.triggerEvent('contact', e.detail);
    },
    
    // 获取手机号回调
    onGetPhoneNumber(e) {
      this.triggerEvent('getphonenumber', e.detail);
    },
    
    // 打开设置回调
    onOpenSetting(e) {
      this.triggerEvent('opensetting', e.detail);
    },
    
    // 打开APP回调
    onLaunchApp(e) {
      this.triggerEvent('launchapp', e.detail);
    },
    
    // 错误回调
    onError(e) {
      this.triggerEvent('error', e.detail);
    },
  },
});