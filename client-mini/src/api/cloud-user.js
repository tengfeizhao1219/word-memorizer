/**
 * 用户相关API接口 - 云调用版本（免费）
 * 使用小程序云调用替代HTTP请求
 */

/**
 * 用户登录 - 云调用版本
 * @param {Object} data 登录数据
 * @param {string} data.code 微信登录code
 * @param {Object} data.userInfo 用户信息
 * @returns {Promise}
 */
export function login(data) {
  return wx.cloud.callFunction({
    name: 'login',
    data: {
      action: 'login',
      ...data
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('登录失败:', err)
    throw err
  })
}

/**
 * 获取用户信息 - 云调用版本
 * @returns {Promise}
 */
export function getInfo() {
  return wx.cloud.callFunction({
    name: 'getInfo',
    data: {
      action: 'getInfo'
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取用户信息失败:', err)
    throw err
  })
}

/**
 * 更新用户设置 - 云调用版本
 * @param {Object} settings 用户设置
 * @returns {Promise}
 */
export function updateSettings(settings) {
  return wx.cloud.callFunction({
    name: 'getInfo', // 注意：这里使用getInfo函数，实际应该有一个updateSettings函数
    data: {
      action: 'updateSettings',
      settings
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('更新设置失败:', err)
    throw err
  })
}

/**
 * 获取用户统计信息 - 云调用版本
 * @returns {Promise}
 */
export function getStats() {
  return wx.cloud.callFunction({
    name: 'getInfo',
    data: {
      action: 'getStats'
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取统计信息失败:', err)
    throw err
  })
}