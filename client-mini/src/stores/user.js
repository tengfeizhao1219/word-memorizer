/**
 * 用户状态管理Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '../api/user'

export const useUserStore = defineStore('user', () => {
  // 状态
  const userInfo = ref(null)
  const token = ref('')
  const isLoggedIn = ref(false)
  const loading = ref(false)

  // 计算属性
  const userId = computed(() => userInfo.value?._id || '')
  const nickname = computed(() => userInfo.value?.nickname || '')
  const avatar = computed(() => userInfo.value?.avatar || '')
  const stats = computed(() => userInfo.value?.stats || {})
  const settings = computed(() => userInfo.value?.settings || {})

  // 检查登录状态
  async function checkLoginStatus() {
    try {
      // 检查本地存储的token
      const localToken = uni.getStorageSync('token')
      if (localToken) {
        token.value = localToken
        isLoggedIn.value = true
        return true
      }
      
      // 检查微信登录状态
      const loginCode = await getWxLoginCode()
      if (loginCode) {
        // 尝试自动登录
        await wxLogin(loginCode)
        return true
      }
      
      return false
    } catch (error) {
      console.error('检查登录状态失败:', error)
      return false
    }
  }

  // 获取微信登录code
  function getWxLoginCode() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            resolve(res.code)
          } else {
            reject(new Error('获取登录code失败'))
          }
        },
        fail: (err) => {
          reject(err)
        }
      })
    })
  }

  // 微信登录
  async function wxLogin(code, userInfo = null) {
    loading.value = true
    
    try {
      const result = await userApi.login({
        code,
        userInfo
      })
      
      if (result.code === 0) {
        // 保存token和用户信息
        token.value = result.data.token || ''
        userInfo.value = result.data.userInfo
        
        // 保存到本地存储
        if (token.value) {
          uni.setStorageSync('token', token.value)
        }
        uni.setStorageSync('userInfo', result.data.userInfo)
        
        isLoggedIn.value = true
        
        // 显示登录成功提示
        showToast('登录成功', 'success')
        
        return true
      } else {
        throw new Error(result.message || '登录失败')
      }
    } catch (error) {
      console.error('微信登录失败:', error)
      showToast(error.message || '登录失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取用户信息
  async function getUserInfo() {
    loading.value = true
    
    try {
      const result = await userApi.getInfo()
      
      if (result.code === 0) {
        userInfo.value = result.data
        uni.setStorageSync('userInfo', result.data)
        return true
      } else {
        throw new Error(result.message || '获取用户信息失败')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      showToast(error.message || '获取用户信息失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新用户设置
  async function updateSettings(newSettings) {
    loading.value = true
    
    try {
      const result = await userApi.updateSettings(newSettings)
      
      if (result.code === 0) {
        userInfo.value = result.data
        
        // 更新本地存储
        uni.setStorageSync('userInfo', userInfo.value)
        
        showToast('设置更新成功', 'success')
        return true
      } else {
        throw new Error(result.message || '更新设置失败')
      }
    } catch (error) {
      console.error('更新设置失败:', error)
      showToast(error.message || '更新设置失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 退出登录
  function logout() {
    // 清除本地存储
    uni.removeStorageSync('token')
    uni.removeStorageSync('userInfo')
    
    // 重置状态
    userInfo.value = null
    token.value = ''
    isLoggedIn.value = false
    
    // 显示退出提示
    showToast('已退出登录', 'info')
    
    // 跳转到登录页
    uni.reLaunch({
      url: '/pages/login/login'
    })
  }

  // 显示消息提示
  function showToast(message, type = 'info') {
    uni.showToast({
      title: message,
      icon: type === 'success' ? 'success' : 'none',
      duration: 2000
    })
  }

  return {
    // 状态
    userInfo,
    token,
    isLoggedIn,
    loading,
    
    // 计算属性
    userId,
    nickname,
    avatar,
    stats,
    settings,
    
    // 方法
    checkLoginStatus,
    wxLogin,
    getUserInfo,
    updateSettings,
    logout
  }
})