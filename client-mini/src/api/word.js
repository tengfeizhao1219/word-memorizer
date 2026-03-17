/**
 * 生词相关API接口
 */

import { request } from '../utils/request'

/**
 * 获取生词列表
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getList(params = {}) {
  return request({
    url: '/word/list',
    method: 'POST',
    data: {
      action: 'list',
      ...params
    }
  })
}

/**
 * 获取今日复习生词
 * @param {Object} params 查询参数
 * @returns {Promise}
 */
export function getTodayReview(params = {}) {
  return request({
    url: '/word/list',
    method: 'POST',
    data: {
      action: 'todayReview',
      ...params
    }
  })
}

/**
 * 获取生词统计
 * @returns {Promise}
 */
export function getStats() {
  return request({
    url: '/word/list',
    method: 'POST',
    data: {
      action: 'stats'
    }
  })
}

/**
 * 添加生词
 * @param {Object} wordData 生词数据
 * @returns {Promise}
 */
export function add(wordData) {
  return request({
    url: '/word/add',
    method: 'POST',
    data: {
      action: 'add',
      wordData
    }
  })
}

/**
 * 批量添加生词
 * @param {Array} wordsData 生词数据数组
 * @returns {Promise}
 */
export function batchAdd(wordsData) {
  return request({
    url: '/word/add',
    method: 'POST',
    data: {
      action: 'batchAdd',
      wordsData
    }
  })
}

/**
 * 获取生词详情
 * @param {string} wordId 生词ID
 * @returns {Promise}
 */
export function getDetail(wordId) {
  return request({
    url: '/word/detail',
    method: 'POST',
    data: {
      action: 'getDetail',
      wordId
    }
  })
}

/**
 * 更新生词
 * @param {string} wordId 生词ID
 * @param {Object} wordData 生词数据
 * @returns {Promise}
 */
export function update(wordId, wordData) {
  return request({
    url: '/word/update',
    method: 'POST',
    data: {
      action: 'update',
      wordId,
      wordData
    }
  })
}

/**
 * 删除生词
 * @param {string} wordId 生词ID
 * @returns {Promise}
 */
export function deleteWord(wordId) {
  return request({
    url: '/word/delete',
    method: 'POST',
    data: {
      action: 'delete',
      wordId
    }
  })
}

/**
 * 搜索生词
 * @param {Object} params 搜索参数
 * @returns {Promise}
 */
export function search(params = {}) {
  return request({
    url: '/word/search',
    method: 'POST',
    data: {
      action: 'search',
      ...params
    }
  })
}

/**
 * 生词API对象
 */
export const wordApi = {
  getList,
  getTodayReview,
  getStats,
  add,
  batchAdd,
  getDetail,
  update,
  delete: deleteWord,
  search
}