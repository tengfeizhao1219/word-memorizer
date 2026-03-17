/**
 * 用户相关API接口
 */

import { request } from '../utils/request'

/**
 * 用户登录
 * @param {Object} data 登录数据
 * @param {string} data.code 微信登录code
 * @param {Object} data.userInfo 用户信息
 * @returns {Promise}
 */
export function login(data) {
  return request({
    url: '/user/login',
    method: 'POST',
    data: {
      action: 'login',
      ...data
    }
  })
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getInfo() {
  return request({
    url: '/user/getInfo',
    method: 'POST',
    data: {
      action: 'getInfo'
    }
  })
}

/**
 * 更新用户设置
 * @param {Object} settings 用户设置
 * @returns {Promise}
 */
export function updateSettings(settings) {
  return request({
    url: '/user/getInfo',
    method: 'POST',
    data: {
      action: 'updateSettings',
      settings
    }
  })
}

/**
 * 用户API对象
 */
export const userApi = {
  login,
  getInfo,
  updateSettings
}