// 本地API适配器 - 替换腾讯云调用
const LOCAL_API_BASE = 'http://localhost:3000/api';

// 模拟wx.cloud API
const localCloud = {
  init: function(options) {
    console.log('🌐 使用本地API服务器，环境:', options.env);
    return this;
  },
  
  database: function() {
    return {
      collection: function(name) {
        return new LocalCollection(name);
      },
      config: {}
    };
  },
  
  callFunction: function(options) {
    return new Promise((resolve, reject) => {
      const { name, data } = options;
      
      console.log(`📞 调用本地云函数: ${name}`, data);
      
      // 映射云函数名到本地API
      const apiMap = {
        'login': { method: 'POST', url: '/login' },
        'translate': { method: 'POST', url: '/translate' },
        'word': { method: 'GET', url: '/words' }
      };
      
      const apiConfig = apiMap[name];
      if (!apiConfig) {
        reject({ errMsg: `云函数 ${name} 未实现` });
        return;
      }
      
      // 调用本地API
      wx.request({
        url: LOCAL_API_BASE + apiConfig.url,
        method: apiConfig.method,
        data: data,
        success: (res) => {
          console.log(`✅ 本地API调用成功: ${name}`, res.data);
          resolve({ result: res.data });
        },
        fail: (err) => {
          console.error(`❌ 本地API调用失败: ${name}`, err);
          reject(err);
        }
      });
    });
  }
};

// 本地集合类
class LocalCollection {
  constructor(name) {
    this.name = name;
    this.apiMap = {
      'users': { method: 'GET', url: '/user' },
      'words': { method: 'GET', url: '/words' }
    };
  }
  
  add(options) {
    return new Promise((resolve, reject) => {
      const { data } = options;
      
      if (this.name === 'words') {
        // 调用添加单词API
        wx.request({
          url: LOCAL_API_BASE + '/words',
          method: 'POST',
          data: data,
          success: (res) => {
            console.log('✅ 添加数据成功:', res.data);
            resolve({ _id: Date.now().toString(), ...res.data.data });
          },
          fail: reject
        });
      } else {
        reject({ errMsg: `集合 ${this.name} 的add操作未实现` });
      }
    });
  }
  
  where(conditions) {
    this.conditions = conditions;
    return this;
  }
  
  get() {
    return new Promise((resolve, reject) => {
      if (this.name === 'words') {
        // 获取单词列表
        const userId = this.conditions ? this.conditions.user_id : 1;
        
        wx.request({
          url: LOCAL_API_BASE + '/words',
          method: 'GET',
          data: { userId },
          success: (res) => {
            console.log('✅ 获取数据成功:', res.data.data.words.length, '条记录');
            resolve({
              data: res.data.data.words.map(word => ({
                _id: word.id.toString(),
                ...word
              }))
            });
          },
          fail: reject
        });
      } else {
        reject({ errMsg: `集合 ${this.name} 的get操作未实现` });
      }
    });
  }
  
  count() {
    return new Promise((resolve, reject) => {
      if (this.name === 'words') {
        wx.request({
          url: LOCAL_API_BASE + '/words',
          method: 'GET',
          success: (res) => {
            resolve({ total: res.data.data.total });
          },
          fail: reject
        });
      } else {
        resolve({ total: 0 });
      }
    });
  }
  
  doc(id) {
    this.docId = id;
    return this;
  }
  
  remove() {
    return new Promise((resolve, reject) => {
      if (this.name === 'words' && this.docId) {
        wx.request({
          url: LOCAL_API_BASE + '/words/' + this.docId,
          method: 'DELETE',
          success: (res) => {
            console.log('✅ 删除数据成功:', res.data);
            resolve({ stats: { removed: 1 } });
          },
          fail: reject
        });
      } else {
        reject({ errMsg: '删除操作未实现' });
      }
    });
  }
  
  update(options) {
    return new Promise((resolve, reject) => {
      reject({ errMsg: 'update操作未实现，请使用其他方法' });
    });
  }
}

// 导出
module.exports = {
  localCloud,
  LOCAL_API_BASE
};

// 使用说明：
// 1. 在app.js中替换: const cloud = require('./local-api-adapter').localCloud;
// 2. 启动本地服务器: node local-server/server.js
// 3. 在微信开发者工具中设置不校验合法域名（开发设置）