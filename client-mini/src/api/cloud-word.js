/**
 * 生词相关API接口 - 云调用版本（免费）
 * 使用小程序云调用替代HTTP请求
 */

/**
 * 添加生词 - 云调用版本
 * @param {Object} wordData 生词数据
 * @returns {Promise}
 */
export function addWord(wordData) {
  return wx.cloud.callFunction({
    name: 'add',
    data: {
      action: 'add',
      ...wordData
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('添加生词失败:', err)
    throw err
  })
}

/**
 * 获取生词列表 - 云调用版本
 * @param {Object} params 查询参数
 * @param {number} params.page 页码
 * @param {number} params.pageSize 每页数量
 * @param {string} params.status 状态筛选
 * @param {string} params.category 分类筛选
 * @returns {Promise}
 */
export function getWordList(params = {}) {
  return wx.cloud.callFunction({
    name: 'list',
    data: {
      action: 'list',
      ...params
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取生词列表失败:', err)
    throw err
  })
}

/**
 * 获取生词详情 - 云调用版本
 * @param {string} wordId 生词ID
 * @returns {Promise}
 */
export function getWordDetail(wordId) {
  return wx.cloud.callFunction({
    name: 'detail',
    data: {
      action: 'detail',
      wordId
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('获取生词详情失败:', err)
    throw err
  })
}

/**
 * 搜索生词 - 云调用版本
 * @param {string} keyword 关键词
 * @param {Object} options 搜索选项
 * @returns {Promise}
 */
export function searchWords(keyword, options = {}) {
  return wx.cloud.callFunction({
    name: 'search',
    data: {
      action: 'search',
      keyword,
      ...options
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('搜索生词失败:', err)
    throw err
  })
}

/**
 * 导入生词 - 云调用版本
 * @param {Array} words 生词数组
 * @returns {Promise}
 */
export function importWords(words) {
  return wx.cloud.callFunction({
    name: 'import',
    data: {
      action: 'import',
      words
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('导入生词失败:', err)
    throw err
  })
}

/**
 * 导出生词 - 云调用版本
 * @param {Object} options 导出选项
 * @returns {Promise}
 */
export function exportWords(options = {}) {
  return wx.cloud.callFunction({
    name: 'export',
    data: {
      action: 'export',
      ...options
    }
  }).then(res => {
    return res.result
  }).catch(err => {
    console.error('导出生词失败:', err)
    throw err
  })
}