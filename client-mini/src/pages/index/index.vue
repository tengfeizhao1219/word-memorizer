<template>
  <view class="page-container">
    <!-- 用户信息区域 -->
    <view class="user-section" v-if="userStore.isLoggedIn">
      <view class="user-info">
        <u-avatar :src="userStore.avatar" size="60"></u-avatar>
        <view class="user-details">
          <text class="username">{{ userStore.nickname }}</text>
          <text class="welcome">欢迎回来！</text>
        </view>
      </view>
      
      <!-- 学习统计 -->
      <view class="stats-grid">
        <view class="stat-item" @click="navigateTo('word-list')">
          <text class="stat-value">{{ wordsStore.totalWords }}</text>
          <text class="stat-label">总生词</text>
        </view>
        <view class="stat-item" @click="navigateTo('review')">
          <text class="stat-value highlight">{{ wordsStore.todayReviewCount }}</text>
          <text class="stat-label">今日复习</text>
        </view>
        <view class="stat-item">
          <text class="stat-value">{{ userStore.stats.streakDays || 0 }}</text>
          <text class="stat-label">连续学习</text>
        </view>
      </view>
    </view>
    
    <!-- 未登录状态 -->
    <view class="login-prompt" v-else>
      <view class="prompt-content">
        <text class="prompt-title">欢迎使用生词本</text>
        <text class="prompt-desc">记录生词，科学复习，提升英语水平</text>
        <button class="login-btn" @click="navigateTo('login')">立即登录</button>
      </view>
    </view>
    
    <!-- 快速操作区域 -->
    <view class="quick-actions" v-if="userStore.isLoggedIn">
      <view class="section-title">
        <text>快速操作</text>
      </view>
      
      <view class="action-grid">
        <view class="action-item" @click="navigateTo('word-add')">
          <u-icon name="plus-circle" size="28" color="#007aff"></u-icon>
          <text>添加生词</text>
        </view>
        <view class="action-item" @click="navigateTo('review')">
          <u-icon name="clock" size="28" color="#34c759"></u-icon>
          <text>开始复习</text>
        </view>
        <view class="action-item" @click="navigateTo('word-list')">
          <u-icon name="list" size="28" color="#ff9500"></u-icon>
          <text>生词列表</text>
        </view>
        <view class="action-item" @click="navigateTo('stats')">
          <u-icon name="chart-pie" size="28" color="#5856d6"></u-icon>
          <text>学习统计</text>
        </view>
      </view>
    </view>
    
    <!-- 今日复习提醒 -->
    <view class="review-reminder" v-if="userStore.isLoggedIn && wordsStore.todayReviewCount > 0">
      <view class="reminder-header">
        <text class="reminder-title">📚 今日复习提醒</text>
        <text class="reminder-count">{{ wordsStore.todayReviewCount }}个生词待复习</text>
      </view>
      <view class="reminder-content">
        <text>根据艾宾浩斯记忆曲线，今天有{{ wordsStore.todayReviewCount }}个生词需要复习</text>
        <button class="review-btn" @click="navigateTo('review')">开始复习</button>
      </view>
    </view>
    
    <!-- 学习建议 -->
    <view class="learning-tips" v-if="userStore.isLoggedIn">
      <view class="section-title">
        <text>学习建议</text>
      </view>
      
      <view class="tips-list">
        <view class="tip-item">
          <u-icon name="checkmark-circle" size="20" color="#34c759"></u-icon>
          <text>每天坚持复习，效果更好</text>
        </view>
        <view class="tip-item">
          <u-icon name="checkmark-circle" size="20" color="#34c759"></u-icon>
          <text>添加生词时尽量包含例句</text>
        </view>
        <view class="tip-item">
          <u-icon name="checkmark-circle" size="20" color="#34c759"></u-icon>
          <text>使用分类功能管理不同主题的生词</text>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <u-loading-page :loading="userStore.loading || wordsStore.loading" />
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../stores/user'
import { useWordsStore } from '../../stores/words'

// 获取Store
const userStore = useUserStore()
const wordsStore = useWordsStore()

// 页面加载时执行
onMounted(async () => {
  // 如果已登录，加载数据
  if (userStore.isLoggedIn) {
    await loadData()
  }
})

// 加载数据
async function loadData() {
  try {
    await Promise.all([
      wordsStore.getWordStats(),
      wordsStore.getTodayReviewWords()
    ])
  } catch (error) {
    console.error('加载首页数据失败:', error)
    showToast('加载数据失败', 'error')
  }
}

// 页面跳转
function navigateTo(page) {
  const pages = {
    'login': '/pages/login/login',
    'word-list': '/pages/word-list/word-list',
    'word-add': '/pages/word-add/word-add',
    'review': '/pages/review/review',
    'stats': '/pages/stats/stats'
  }
  
  if (pages[page]) {
    uni.navigateTo({
      url: pages[page]
    })
  }
}

// 显示消息提示
function showToast(message, type = 'info') {
  uni.showToast({
    title: message,
    icon: type === 'success' ? 'success' : 'none',
    duration: 2000
  })
}
</script>

<style lang="scss" scoped>
.page-container {
  padding: 20rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 用户信息区域
.user-section {
  background: linear-gradient(135deg, #007aff, #5856d6);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  color: white;
  
  .user-info {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .user-details {
      margin-left: 20rpx;
      display: flex;
      flex-direction: column;
      
      .username {
        font-size: 36rpx;
        font-weight: bold;
        margin-bottom: 8rpx;
      }
      
      .welcome {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
  
  .stats-grid {
    display: flex;
    justify-content: space-between;
    
    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      
      .stat-value {
        font-size: 48rpx;
        font-weight: bold;
        margin-bottom: 10rpx;
        
        &.highlight {
          color: #ffd700;
        }
      }
      
      .stat-label {
        font-size: 24rpx;
        opacity: 0.9;
      }
    }
  }
}

// 登录提示
.login-prompt {
  background: white;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 30rpx;
  text-align: center;
  
  .prompt-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .prompt-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .prompt-desc {
      font-size: 28rpx;
      color: #666;
      margin-bottom: 40rpx;
      line-height: 1.5;
    }
    
    .login-btn {
      background: #007aff;
      color: white;
      border-radius: 50rpx;
      padding: 20rpx 60rpx;
      font-size: 28rpx;
      border: none;
      
      &::after {
        border: none;
      }
    }
  }
}

// 快速操作区域
.quick-actions {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
  }
  
  .action-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;
    
    .action-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 30rpx 20rpx;
      background: #f8f9fa;
      border-radius: 16rpx;
      transition: all 0.3s;
      
      &:active {
        background: #e9ecef;
        transform: scale(0.98);
      }
      
      u-icon {
        margin-bottom: 20rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #333;
      }
    }
  }
}

// 复习提醒
.review-reminder {
  background: linear-gradient(135deg, #ff9500, #ff5e3a);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  color: white;
  
  .reminder-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .reminder-title {
      font-size: 32rpx;
      font-weight: bold;
    }
    
    .reminder-count {
      font-size: 28rpx;
      background: rgba(255, 255, 255, 0.2);
      padding: 8rpx 16rpx;
      border-radius: 20rpx;
    }
  }
  
  .reminder-content {
    display: flex;
    flex-direction: column;
    
    text {
      font-size: 26rpx;
      margin-bottom: 30rpx;
      line-height: 1.5;
      opacity: 0.9;
    }
    
    .review-btn {
      background: white;
      color: #ff9500;
      border-radius: 50rpx;
      padding: 20rpx 0;
      font-size: 28rpx;
      font-weight: bold;
      border: none;
      
      &::after {
        border: none;
      }
    }
  }
}

// 学习建议
.learning-tips {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 30rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #f0f0f0;
  }
  
  .tips-list {
    .tip-item {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      u-icon {
        margin-right: 20rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #666;
        line-height: 1.5;
      }
    }
  }
}
</style>