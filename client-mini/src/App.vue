<template>
  <view>
    <!-- 页面内容 -->
    <router-view />
    
    <!-- 全局加载提示 -->
    <u-loading-page :loading="globalLoading" />
    
    <!-- 全局消息提示 -->
    <u-toast ref="uToast" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { useWordsStore } from './stores/words'

// 全局状态
const globalLoading = ref(false)
const uToast = ref()

// 获取Store
const userStore = useUserStore()
const wordsStore = useWordsStore()

// 应用启动时执行
onMounted(async () => {
  console.log('🚀 应用启动')
  
  try {
    // 检查登录状态
    await userStore.checkLoginStatus()
    
    // 如果已登录，加载用户数据
    if (userStore.isLoggedIn) {
      await userStore.getUserInfo()
      await wordsStore.getWordStats()
    }
  } catch (error) {
    console.error('应用启动失败:', error)
    showToast('应用启动失败，请重试', 'error')
  }
})

// 显示消息提示
const showToast = (message, type = 'info') => {
  if (uToast.value) {
    uToast.value.show({
      message,
      type
    })
  }
}

// 全局方法挂载
const app = getApp()
if (app) {
  app.globalData = {
    showToast,
    setGlobalLoading: (loading) => {
      globalLoading.value = loading
    }
  }
}

// 导出方法供全局使用
defineExpose({
  showToast,
  setGlobalLoading: (loading) => {
    globalLoading.value = loading
  }
})
</script>

<style lang="scss">
/* 全局样式 */
page {
  background-color: #f5f5f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 自定义主题变量 */
:root {
  --primary-color: #007aff;
  --success-color: #34c759;
  --warning-color: #ff9500;
  --error-color: #ff3b30;
  --text-primary: #000000;
  --text-secondary: #8e8e93;
  --background-color: #f5f5f5;
  --card-background: #ffffff;
}

/* 工具类 */
.text-primary {
  color: var(--text-primary);
}

.text-secondary {
  color: var(--text-secondary);
}

.bg-primary {
  background-color: var(--primary-color);
}

.bg-card {
  background-color: var(--card-background);
}

/* 布局类 */
.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.justify-between {
  justify-content: space-between;
}

/* 间距类 */
.m-2 {
  margin: 8px;
}

.p-2 {
  padding: 8px;
}

.mt-2 {
  margin-top: 8px;
}

.mb-2 {
  margin-bottom: 8px;
}

/* 卡片样式 */
.card {
  background-color: var(--card-background);
  border-radius: 12px;
  padding: 16px;
  margin: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 按钮样式 */
.btn {
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  text-align: center;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}
</style>