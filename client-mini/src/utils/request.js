/**
 * 网络请求封装
 */

// 基础URL - 云函数调用
const BASE_URL = ''

// 请求队列，用于处理并发请求
const requestQueue = []
let isProcessingQueue = false

/**
 * 处理请求队列
 */
async function processQueue() {
  if (isProcessingQueue || requestQueue.length === 0) {
    return
  }
  
  isProcessingQueue = true
  
  while (requestQueue.length > 0) {
    const requestItem = requestQueue.shift()
    try {
      const result = await executeRequest(requestItem.config)
      requestItem.resolve(result)
    } catch (error) {
      requestItem.reject(error)
    }
  }
  
  isProcessingQueue = false
}

/**
 * 执行请求
 */
async function executeRequest(config) {
  const {
    url,
    method = 'GET',
    data = {},
    headers = {},
    timeout = 10000
  } = config
  
  return new Promise((resolve, reject) => {
    // 显示加载提示
    uni.showLoading({
      title: '加载中...',
      mask: true
    })
    
    // 构建请求参数
    const requestConfig = {
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      method: method.toUpperCase(),
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : '',
        ...headers
      },
      timeout,
      success: (res) => {
        uni.hideLoading()
        
        // 处理响应数据
        if (res.statusCode === 200) {
          const responseData = res.data || {}
          
          // 检查业务状态码
          if (responseData.code === 0) {
            resolve(responseData)
          } else {
            // 业务错误
            handleBusinessError(responseData)
            reject(new Error(responseData.message || '请求失败'))
          }
        } else {
          // HTTP错误
          handleHttpError(res.statusCode, res.data)
          reject(new Error(`HTTP错误: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        handleNetworkError(err)
        reject(err)
      }
    }
    
    // 发送请求
    uni.request(requestConfig)
  })
}

/**
 * 处理业务错误
 */
function handleBusinessError(responseData) {
  const { code, message } = responseData
  
  console.error('业务错误:', code, message)
  
  // 根据错误码处理不同情况
  switch (code) {
    case 401:
      // 未授权，跳转到登录页
      uni.removeStorageSync('token')
      uni.removeStorageSync('userInfo')
      uni.showToast({
        title: '登录已过期，请重新登录',
        icon: 'none',
        duration: 2000
      })
      
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/login/login'
        })
      }, 1500)
      break
      
    case 403:
      // 权限不足
      uni.showToast({
        title: '权限不足',
        icon: 'none',
        duration: 2000
      })
      break
      
    case 404:
      // 资源不存在
      uni.showToast({
        title: '资源不存在',
        icon: 'none',
        duration: 2000
      })
      break
      
    case 500:
      // 服务器错误
      uni.showToast({
        title: '服务器错误，请稍后重试',
        icon: 'none',
        duration: 2000
      })
      break
      
    default:
      // 其他业务错误
      uni.showToast({
        title: message || '操作失败',
        icon: 'none',
        duration: 2000
      })
  }
}

/**
 * 处理HTTP错误
 */
function handleHttpError(statusCode, data) {
  console.error('HTTP错误:', statusCode, data)
  
  let errorMessage = '请求失败'
  
  switch (statusCode) {
    case 400:
      errorMessage = '请求参数错误'
      break
    case 401:
      errorMessage = '未授权，请重新登录'
      break
    case 403:
      errorMessage = '访问被拒绝'
      break
    case 404:
      errorMessage = '请求的资源不存在'
      break
    case 500:
      errorMessage = '服务器内部错误'
      break
    case 502:
      errorMessage = '网关错误'
      break
    case 503:
      errorMessage = '服务不可用'
      break
    case 504:
      errorMessage = '网关超时'
      break
  }
  
  uni.showToast({
    title: errorMessage,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 处理网络错误
 */
function handleNetworkError(err) {
  console.error('网络错误:', err)
  
  let errorMessage = '网络错误'
  
  if (err.errMsg) {
    if (err.errMsg.includes('timeout')) {
      errorMessage = '请求超时，请检查网络'
    } else if (err.errMsg.includes('fail')) {
      errorMessage = '网络连接失败，请检查网络设置'
    }
  }
  
  uni.showToast({
    title: errorMessage,
    icon: 'none',
    duration: 2000
  })
}

/**
 * 发起请求
 * @param {Object} config 请求配置
 * @returns {Promise}
 */
export function request(config) {
  return new Promise((resolve, reject) => {
    // 将请求加入队列
    requestQueue.push({
      config,
      resolve,
      reject
    })
    
    // 处理队列
    processQueue()
  })
}

/**
 * 上传文件
 * @param {Object} config 上传配置
 * @returns {Promise}
 */
export function uploadFile(config) {
  return new Promise((resolve, reject) => {
    const {
      url,
      filePath,
      name = 'file',
      formData = {},
      headers = {}
    } = config
    
    uni.uploadFile({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      filePath,
      name,
      formData,
      header: {
        'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : '',
        ...headers
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            resolve(data)
          } catch (error) {
            resolve(res.data)
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

/**
 * 下载文件
 * @param {Object} config 下载配置
 * @returns {Promise}
 */
export function downloadFile(config) {
  return new Promise((resolve, reject) => {
    const {
      url,
      headers = {}
    } = config
    
    uni.downloadFile({
      url: url.startsWith('http') ? url : `${BASE_URL}${url}`,
      header: {
        'Authorization': uni.getStorageSync('token') ? `Bearer ${uni.getStorageSync('token')}` : '',
        ...headers
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          reject(new Error(`下载失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}