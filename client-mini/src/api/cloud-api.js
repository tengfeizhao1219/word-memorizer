/**
 * 统一云调用API入口（免费方案）
 * 使用小程序云调用替代HTTP请求，避免HTTP访问服务费用
 */

import * as cloudUser from './cloud-user.js'
import * as cloudWord from './cloud-word.js'
import * as cloudReview from './cloud-review.js'

// 导出所有云调用API
export default {
  // 用户相关
  user: {
    login: cloudUser.login,
    getInfo: cloudUser.getInfo,
    updateSettings: cloudUser.updateSettings,
    getStats: cloudUser.getStats
  },
  
  // 生词相关
  word: {
    add: cloudWord.addWord,
    list: cloudWord.getWordList,
    detail: cloudWord.getWordDetail,
    search: cloudWord.searchWords,
    import: cloudWord.importWords,
    export: cloudWord.exportWords
  },
  
  // 复习相关
  review: {
    getToday: cloudReview.getTodayReview,
    submit: cloudReview.submitReview,
    getStats: cloudReview.getReviewStats,
    getHistory: cloudReview.getReviewHistory
  },
  
  // 工具函数
  utils: {
    /**
     * 测试云函数连接
     * @returns {Promise}
     */
    testConnection() {
      return wx.cloud.callFunction({
        name: 'login',
        data: { action: 'test' }
      }).then(res => {
        console.log('云函数连接测试成功:', res)
        return res.result
      }).catch(err => {
        console.error('云函数连接测试失败:', err)
        throw err
      })
    },
    
    /**
     * 获取云环境信息
     * @returns {Object}
     */
    getEnvInfo() {
      return {
        envId: wx.cloud.env,
        version: '1.0.0',
        apiType: 'cloud-function',
        isFree: true
      }
    }
  }
}