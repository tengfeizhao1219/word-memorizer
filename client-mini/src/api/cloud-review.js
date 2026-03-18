/**
 * 复习相关API接口 - 云调用版本（免费）
 * 使用小程序云调用替代HTTP请求
 */

/**
 * 获取今日复习任务 - 云调用版本
 * @returns {Promise}
 */
export function getTodayReview() {
  return wx.cloud.callFunction({
    name: 'getToday',
    data: {
      action: 'getToday'
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取今日复习失败:', err)
    throw err
  })
}

/**
 * 提交复习结果 - 云调用版本
 * @param {Object} reviewData 复习数据
 * @param {string} reviewData.wordId 生词ID
 * @param {number} reviewData.score 复习评分（0-5）
 * @param {string} reviewData.reviewType 复习类型
 * @returns {Promise}
 */
export function submitReview(reviewData) {
  return wx.cloud.callFunction({
    name: 'submit',
    data: {
      action: 'submit',
      ...reviewData
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('提交复习失败:', err)
    throw err
  })
}

/**
 * 获取复习统计 - 云调用版本
 * @returns {Promise}
 */
export function getReviewStats() {
  return wx.cloud.callFunction({
    name: 'getToday',
    data: {
      action: 'getStats'
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取复习统计失败:', err)
    throw err
  })
}

/**
 * 获取复习历史 - 云调用版本
 * @param {Object} params 查询参数
 * @param {string} params.startDate 开始日期
 * @param {string} params.endDate 结束日期
 * @returns {Promise}
 */
export function getReviewHistory(params = {}) {
  return wx.cloud.callFunction({
    name: 'getToday',
    data: {
      action: 'getHistory',
      ...params
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取复习历史失败:', err)
    throw err
  })
}