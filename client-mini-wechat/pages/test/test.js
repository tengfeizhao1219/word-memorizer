// 测试页面逻辑
Page({
  data: {
    // 测试状态
    cloudInitStatus: 'pending',
    cloudInitText: '未测试',
    dbStatus: 'pending',
    dbText: '未测试',
    functionStatus: 'pending',
    functionText: '未测试',
    storageText: '未测试',
    
    // 环境信息
    envInfo: {
      envId: '',
      appId: '',
      platform: '',
      version: ''
    }
  },

  onLoad() {
    this.loadEnvInfo();
  },

  // 加载环境信息
  loadEnvInfo() {
    const systemInfo = wx.getSystemInfoSync();
    const envInfo = {
      envId: wx.cloud?.DYNAMIC_CURRENT_ENV || '未获取',
      appId: wx.getAccountInfoSync?.().miniProgram?.appId || '未获取',
      platform: systemInfo.platform,
      version: systemInfo.version,
      SDKVersion: systemInfo.SDKVersion
    };
    
    this.setData({ envInfo });
  },

  // 测试云开发初始化
  async testCloudInit() {
    this.setData({
      cloudInitStatus: 'testing',
      cloudInitText: '测试中...'
    });

    try {
      // 云开发已经在app.js初始化，这里只是验证
      const cloud = wx.cloud;
      
      if (cloud && cloud.DYNAMIC_CURRENT_ENV) {
        this.setData({
          cloudInitStatus: 'success',
          cloudInitText: `成功，环境: ${cloud.DYNAMIC_CURRENT_ENV}`
        });
        wx.showToast({ title: '云开发初始化成功', icon: 'success' });
      } else {
        throw new Error('云开发未初始化');
      }
    } catch (error) {
      console.error('云开发初始化测试失败:', error);
      this.setData({
        cloudInitStatus: 'fail',
        cloudInitText: `失败: ${error.message}`
      });
      wx.showToast({ title: '云开发初始化失败', icon: 'error' });
    }
  },

  // 测试数据库连接
  async testDatabase() {
    this.setData({
      dbStatus: 'testing',
      dbText: '测试中...'
    });

    try {
      const db = wx.cloud.database();
      
      // 尝试查询一个集合（集合可能不存在，这是正常的）
      const result = await db.collection('test_collection').count();
      
      this.setData({
        dbStatus: 'success',
        dbText: `成功，数据库连接正常`
      });
      wx.showToast({ title: '数据库连接成功', icon: 'success' });
      
    } catch (error) {
      // 数据库连接成功，但集合可能不存在
      if (error.errCode === -501007) { // 集合不存在错误
        this.setData({
          dbStatus: 'success',
          dbText: '连接正常（集合未创建）'
        });
        wx.showToast({ title: '数据库连接正常', icon: 'success' });
      } else {
        console.error('数据库连接测试失败:', error);
        this.setData({
          dbStatus: 'fail',
          dbText: `失败: ${error.message}`
        });
        wx.showToast({ title: '数据库连接失败', icon: 'error' });
      }
    }
  },

  // 测试云函数调用
  async testCloudFunction() {
    this.setData({
      functionStatus: 'testing',
      functionText: '测试中...'
    });

    try {
      const result = await wx.cloud.callFunction({
        name: 'login',
        data: {
          action: 'test',
          userInfo: {
            nickName: '测试用户',
            avatarUrl: ''
          }
        }
      });

      this.setData({
        functionStatus: 'success',
        functionText: `成功: ${result.result?.message || '云函数调用成功'}`
      });
      wx.showToast({ title: '云函数调用成功', icon: 'success' });
      
    } catch (error) {
      console.error('云函数调用测试失败:', error);
      
      let errorText = error.message;
      if (error.errCode === -501000) {
        errorText = '环境不存在或配置错误';
      } else if (error.errCode === -404011) {
        errorText = '云函数未部署';
      }
      
      this.setData({
        functionStatus: 'fail',
        functionText: `失败: ${errorText}`
      });
      wx.showToast({ title: '云函数调用失败', icon: 'error' });
    }
  },

  // 测试本地存储
  testStorage() {
    try {
      const testData = {
        timestamp: Date.now(),
        message: '测试存储数据'
      };
      
      wx.setStorageSync('test_data', testData);
      const readData = wx.getStorageSync('test_data');
      
      if (readData && readData.timestamp === testData.timestamp) {
        this.setData({
          storageText: `成功，存储大小: ${JSON.stringify(testData).length} 字节`
        });
        wx.showToast({ title: '本地存储测试成功', icon: 'success' });
      } else {
        throw new Error('存储读取不一致');
      }
    } catch (error) {
      console.error('本地存储测试失败:', error);
      this.setData({
        storageText: `失败: ${error.message}`
      });
      wx.showToast({ title: '本地存储测试失败', icon: 'error' });
    }
  },

  // 清除存储
  clearStorage() {
    try {
      wx.removeStorageSync('test_data');
      this.setData({ storageText: '已清除测试数据' });
      wx.showToast({ title: '存储已清除', icon: 'success' });
    } catch (error) {
      wx.showToast({ title: '清除失败', icon: 'error' });
    }
  },

  // 跳转到页面
  goToPage(e) {
    const page = e.currentTarget.dataset.page;
    const url = page === 'index' ? '/pages/index/index' : `/pages/${page}/${page}`;
    
    wx.navigateTo({
      url: url,
      fail: (err) => {
        console.error('页面跳转失败:', err);
        wx.showToast({ title: '页面跳转失败', icon: 'error' });
      }
    });
  },

  // 运行全部测试
  async runAllTests() {
    wx.showLoading({ title: '运行全部测试中...' });
    
    await this.testCloudInit();
    await this.testDatabase();
    await this.testCloudFunction();
    this.testStorage();
    
    wx.hideLoading();
    
    // 显示测试结果摘要
    const results = [
      `云开发: ${this.data.cloudInitStatus === 'success' ? '✅' : '❌'}`,
      `数据库: ${this.data.dbStatus === 'success' ? '✅' : '❌'}`,
      `云函数: ${this.data.functionStatus === 'success' ? '✅' : '❌'}`,
      `本地存储: ${this.data.storageText.includes('成功') ? '✅' : '❌'}`
    ];
    
    wx.showModal({
      title: '测试结果',
      content: results.join('\n'),
      showCancel: false
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});