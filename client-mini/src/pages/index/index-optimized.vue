<template>
  <view class="page-container">
    <!-- 状态栏背景 -->
    <view class="status-bar-bg"></view>
    
    <!-- 用户信息卡片 (苹果风格毛玻璃效果) -->
    <view class="user-card" v-if="userStore.isLoggedIn">
      <view class="user-header">
        <u-avatar :src="userStore.avatar" size="70" shape="circle"></u-avatar>
        <view class="user-info">
          <text class="user-name">{{ userStore.nickname }}</text>
          <text class="user-greeting">今天也要加油哦 ✨</text>
        </view>
        <view class="streak-badge">
          <text class="streak-days">{{ userStore.stats.streakDays || 0 }}</text>
          <text class="streak-label">天</text>
        </view>
      </view>
      
      <!-- 学习数据统计 -->
      <view class="stats-container">
        <view class="stat-item" @click="navigateTo('word-list')">
          <text class="stat-number">{{ wordsStore.totalWords }}</text>
          <text class="stat-title">总生词</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item" @click="navigateTo('review')">
          <text class="stat-number highlight">{{ wordsStore.todayReviewCount }}</text>
          <text class="stat-title">待复习</text>
        </view>
        <view class="stat-divider"></view>
        <view class="stat-item">
          <text class="stat-number">{{ Math.round(wordsStore.masteryRate * 100) || 0 }}%</text>
          <text class="stat-title">掌握率</text>
        </view>
      </view>
    </view>
    
    <!-- 未登录状态 -->
    <view class="welcome-card" v-else>
      <view class="welcome-content">
        <view class="app-icon">
          <text class="icon-text">📚</text>
        </view>
        <text class="welcome-title">生词本</text>
        <text class="welcome-subtitle">科学记忆，高效学习</text>
        <text class="welcome-desc">基于艾宾浩斯记忆曲线，让单词记忆更轻松</text>
        <button class="login-button" @click="navigateTo('login')">
          <text class="button-text">开始使用</text>
          <text class="button-icon">→</text>
        </button>
      </view>
    </view>
    
    <!-- 主要功能入口 (苹果风格网格) -->
    <view class="features-section" v-if="userStore.isLoggedIn">
      <text class="section-title">功能</text>
      <view class="features-grid">
        <view class="feature-card" @click="navigateTo('word-add')" :style="{ backgroundColor: '#5ac8fa' }">
          <text class="feature-icon">➕</text>
          <text class="feature-name">添加生词</text>
        </view>
        <view class="feature-card" @click="navigateTo('review')" :style="{ backgroundColor: '#34c759' }">
          <text class="feature-icon">📖</text>
          <text class="feature-name">开始复习</text>
        </view>
        <view class="feature-card" @click="navigateTo('word-list')" :style="{ backgroundColor: '#ff9500' }">
          <text class="feature-icon">📋</text>
          <text class="feature-name">生词列表</text>
        </view>
        <view class="feature-card" @click="navigateTo('stats')" :style="{ backgroundColor: '#af52de' }">
          <text class="feature-icon">📊</text>
          <text class="feature-name">学习统计</text>
        </view>
        <view class="feature-card" @click="navigateTo('import-export')" :style="{ backgroundColor: '#5856d6' }">
          <text class="feature-icon">🔄</text>
          <text class="feature-name">导入导出</text>
        </view>
        <view class="feature-card" @click="showSettings" :style="{ backgroundColor: '#8e8e93' }">
          <text class="feature-icon">⚙️</text>
          <text class="feature-name">设置</text>
        </view>
      </view>
    </view>
    
    <!-- 今日复习提醒 (苹果风格通知卡片) -->
    <view class="reminder-card" v-if="userStore.isLoggedIn && wordsStore.todayReviewCount > 0">
      <view class="reminder-header">
        <text class="reminder-icon">⏰</text>
        <view class="reminder-info">
          <text class="reminder-title">复习提醒</text>
          <text class="reminder-time">今天 · 建议完成</text>
        </view>
        <text class="reminder-count">{{ wordsStore.todayReviewCount }}个</text>
      </view>
      <text class="reminder-message">根据记忆曲线，今天有{{ wordsStore.todayReviewCount }}个生词需要复习</text>
      <button class="reminder-button" @click="navigateTo('review')">
        <text class="button-text">开始复习</text>
      </button>
    </view>
    
    <!-- 学习建议 (苹果风格列表) -->
    <view class="tips-section" v-if="userStore.isLoggedIn">
      <text class="section-title">学习建议</text>
      <view class="tips-list">
        <view class="tip-item">
          <view class="tip-icon" style="background-color: rgba(52, 199, 89, 0.1);">
            <text>🎯</text>
          </view>
          <view class="tip-content">
            <text class="tip-title">设定每日目标</text>
            <text class="tip-desc">每天学习5-10个新单词效果最佳</text>
          </view>
        </view>
        <view class="tip-item">
          <view class="tip-icon" style="background-color: rgba(0, 122, 255, 0.1);">
            <text>⏰</text>
          </view>
          <view class="tip-content">
            <text class="tip-title">定时复习</text>
            <text class="tip-desc">利用碎片时间多次复习效果更好</text>
          </view>
        </view>
        <view class="tip-item">
          <view class="tip-icon" style="background-color: rgba(255, 149, 0, 0.1);">
            <text>🔗</text>
          </view>
          <view class="tip-content">
            <text class="tip-title">联想记忆</text>
            <text class="tip-desc">结合图片和例句记忆更牢固</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 底部导航占位 -->
    <view class="bottom-safe-area"></view>
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
    'stats': '/pages/stats/stats',
    'import-export': '/pages/import-export/import-export'
  }
  
  if (pages[page]) {
    uni.navigateTo({
      url: pages[page]
    })
  }
}

// 显示设置
function showSettings() {
  uni.showToast({
    title: '设置功能开发中',
    icon: 'none',
    duration: 2000
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
</script>

<style lang="scss" scoped>
.page-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);
  padding: 0 24rpx;
  padding-top: env(safe-area-inset-top);
}

// 状态栏背景
.status-bar-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: env(safe-area-inset-top);
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  z-index: 1000;
}

// 用户卡片 (苹果毛玻璃效果)
.user-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 40rpx 32rpx;
  margin-top: 32rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
  
  .user-header {
    display: flex;
    align-items: center;
    margin-bottom: 40rpx;
    
    .user-info {
      flex: 1;
      margin-left: 24rpx;
      
      .user-name {
        font-size: 36rpx;
        font-weight: 600;
        color: #1d1d1f;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .user-greeting {
        font-size: 26rpx;
        color: #8e8e93;
      }
    }
    
    .streak-badge {
      background: linear-gradient(135deg, #ffd700, #ff9500);
      border-radius: 20rpx;
      padding: 12rpx 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 80rpx;
      
      .streak-days {
        font-size: 32rpx;
        font-weight: 700;
        color: white;
      }
      
      .streak-label {
        font-size: 20rpx;
        color: rgba(255, 255, 255, 0.9);
        margin-top: 2rpx;
      }
    }
  }
  
  .stats-container {
    display: flex;
    align-items: center;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 20rpx;
    padding: 24rpx;
    
    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      
      .stat-number {
        font-size: 44rpx;
        font-weight: 700;
        color: #1d1d1f;
        margin-bottom: 8rpx;
        
        &.highlight {
          color: #ff3b30;
        }
      }
      
      .stat-title {
        font-size: 24rpx;
        color: #8e8e93;
      }
    }
    
    .stat-divider {
      width: 1rpx;
      height: 40rpx;
      background: rgba(0, 0, 0, 0.1);
      margin: 0 20rpx;
    }
  }
}

// 欢迎卡片
.welcome-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 80rpx 40rpx;
  margin-top: 80rpx;
  margin-bottom: 32rpx;
  text-align: center;
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.04);
  
  .welcome-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .app-icon {
      width: 120rpx;
      height: 120rpx;
      background: linear-gradient(135deg, #007aff, #5856d6);
      border-radius: 28rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 32rpx;
      
      .icon-text {
        font-size: 60rpx;
      }
    }
    
    .welcome-title {
      font-size: 48rpx;
      font-weight: 700;
      color: #1d1d1f;
      margin-bottom: 16rpx;
    }
    
    .welcome-subtitle {
      font-size: 32rpx;
      color: #1d1d1f;
      margin-bottom: 16rpx;
      font-weight: 500;
    }
    
    .welcome-desc {
      font-size: 26rpx;
      color: #8e8e93;
      margin-bottom: 48rpx;
      line-height: 1.5;
      max-width: 80%;
    }
    
    .login-button {
      background: #007aff;
      border-radius: 100rpx;
      padding: 24rpx 48rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      min-width: 240rpx;
      
      &::after {
        border: none;
      }
      
      .button-text {
        font-size: 32rpx;
        font-weight: 600;
        color: white;
        margin-right: 12rpx;
      }
      
      .button-icon {
        font-size: 28rpx;
        color: white;
      }
    }
  }
}

// 功能区域
.features-section {
  margin-bottom: 32rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 24rpx;
    display: block;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    
    .feature-card {
      aspect-ratio: 1;
      border-radius: 24rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      
      &:active {
        transform: scale(0.95);
        opacity: 0.9;
      }
      
      .feature-icon {
        font-size: 48rpx;
        margin-bottom: 16rpx;
      }
      
      .feature-name {
        font-size: 24rpx;
        font-weight: 600;
        color: white;
        text-align: center;
        padding: 0 12rpx;
      }
    }
  }
}

// 复习提醒卡片
.reminder-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24rpx;
  padding: 32rpx;
  margin-bottom: 32rpx;
  border: 1rpx solid rgba(255, 149, 0, 0.2);
  box-shadow: 0 8rpx 32rpx rgba(255, 149, 0, 0.08);
  
  .reminder-header {
    display: flex;
    align-items: center;
    margin-bottom: 24rpx;
    
    .reminder-icon {
      font-size: 40rpx;
      margin-right: 20rpx;
    }
    
    .reminder-info {
      flex: 1;
      
      .reminder-title {
        font-size: 32rpx;
        font-weight: 600;
        color: #1d1d1f;
        display: block;
        margin-bottom: 4rpx;
      }
      
      .reminder-time {
        font-size: 24rpx;
        color: #8e8e93;
      }
    }
    
    .reminder-count {
      background: rgba(255, 59, 48, 0.1);
      color: #ff3b30;
      font-size: 28rpx;
      font-weight: 600;
      padding: 8rpx 20rpx;
      border-radius: 20rpx;
    }
  }
  
  .reminder-message {
    font-size: 26rpx;
    color: #1d1d1f;
    line-height: 1.5;
    margin-bottom: 32rpx;
    display: block;
  }
  
  .reminder-button {
    background: #ff9500;
    border-radius: 100rpx;
    padding: 24rpx;
    border: none;
    
    &::after {
      border: none;
    }
    
    .button-text {
      font-size: 32rpx;
      font-weight: 600;
      color: white;
    }
  }
}

// 学习建议区域
.tips-section {
  margin-bottom: 32rpx;
  
  .section-title {
    font-size: 32rpx;
    font-weight: 700;
    color: #1d1d1f;
    margin-bottom: 24rpx;
    display: block;
  }
  
  .tips-list {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 24rpx;
    overflow: hidden;
    border: 1rpx solid rgba(255, 255, 255, 0.2);
    
    .tip-item {
      display: flex;
      align-items: center;
      padding: 32rpx;
      border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
      
      &:last-child {
        border-bottom: none;
      }
      
      .tip-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        
        text {
          font-size: 40rpx;
        }
      }
      
      .tip-content {
        flex: 1;
        
        .tip-title {
          font-size: 28rpx;
          font-weight: 600;
          color: #1d1d1f;
          display: block;
          margin-bottom: 8rpx;
        }
        
        .tip-desc {
          font-size: 24rpx;
          color: #8e8e93;
          line-height: 1.4;
        }
      }
    }
  }
}

// 底部安全区域
.bottom-safe-area {
  height: calc(env(safe-area-inset-bottom) + 100rpx);
}

// 加载状态
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .loading-content {
    text-align: center;
    
    .loading-icon {
      font-size: 60rpx;
      margin-bottom: 24rpx;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #8e8e93;
    }
  }
}