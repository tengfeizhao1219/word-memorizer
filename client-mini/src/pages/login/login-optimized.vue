<template>
  <view class="login-container">
    <!-- 背景渐变 -->
    <view class="background-gradient"></view>
    
    <!-- 登录卡片 -->
    <view class="login-card">
      <!-- 应用图标和标题 -->
      <view class="app-brand">
        <view class="app-icon">
          <text class="icon-symbol">📚</text>
        </view>
        <text class="app-name">生词本</text>
        <text class="app-tagline">科学记忆 · 高效学习</text>
      </view>
      
      <!-- 功能介绍 -->
      <view class="features-list">
        <view class="feature-item">
          <view class="feature-icon" style="background-color: rgba(0, 122, 255, 0.1);">
            <text>🧠</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">艾宾浩斯记忆曲线</text>
            <text class="feature-desc">科学安排复习时间</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" style="background-color: rgba(52, 199, 89, 0.1);">
            <text>📱</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">多端同步</text>
            <text class="feature-desc">手机、电脑随时学习</text>
          </view>
        </view>
        
        <view class="feature-item">
          <view class="feature-icon" style="background-color: rgba(255, 149, 0, 0.1);">
            <text>📊</text>
          </view>
          <view class="feature-content">
            <text class="feature-title">学习统计</text>
            <text class="feature-desc">可视化学习进度</text>
          </view>
        </view>
      </view>
      
      <!-- 登录按钮 -->
      <view class="login-actions">
        <button 
          class="wechat-login-button" 
          @click="handleWechatLogin"
          :disabled="loading"
        >
          <view class="button-content">
            <text class="wechat-icon">💚</text>
            <text class="button-text">微信一键登录</text>
          </view>
          <text class="button-arrow">→</text>
        </button>
        
        <view class="login-divider">
          <view class="divider-line"></view>
          <text class="divider-text">或</text>
          <view class="divider-line"></view>
        </view>
        
        <button class="guest-button" @click="handleGuestMode">
          <text class="button-text">先体验一下</text>
        </button>
      </view>
      
      <!-- 用户协议 -->
      <view class="agreement">
        <text class="agreement-text">登录即表示同意</text>
        <text class="agreement-link" @click="showAgreement">《用户协议》</text>
        <text class="agreement-text">和</text>
        <text class="agreement-link" @click="showPrivacy">《隐私政策》</text>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view class="loading-overlay" v-if="loading">
      <view class="loading-content">
        <view class="loading-spinner"></view>
        <text class="loading-text">登录中...</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/user'

const userStore = useUserStore()
const loading = ref(false)

// 微信登录
async function handleWechatLogin() {
  if (loading.value) return
  
  loading.value = true
  try {
    await userStore.login()
    // 登录成功后跳转到首页
    uni.switchTab({
      url: '/pages/index/index'
    })
  } catch (error) {
    console.error('微信登录失败:', error)
    uni.showToast({
      title: '登录失败，请重试',
      icon: 'none',
      duration: 2000
    })
  } finally {
    loading.value = false
  }
}

// 游客模式
function handleGuestMode() {
  uni.showToast({
    title: '游客模式功能开发中',
    icon: 'none',
    duration: 2000
  })
  // 暂时跳转到首页
  uni.switchTab({
    url: '/pages/index/index'
  })
}

// 显示用户协议
function showAgreement() {
  uni.showModal({
    title: '用户协议',
    content: '欢迎使用生词本小程序！请仔细阅读用户协议...',
    showCancel: false,
    confirmText: '我知道了'
  })
}

// 显示隐私政策
function showPrivacy() {
  uni.showModal({
    title: '隐私政策',
    content: '我们高度重视您的隐私保护...',
    showCancel: false,
    confirmText: '我知道了'
  })
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: #f5f7fa;
  position: relative;
  padding-top: env(safe-area-inset-top);
}

// 背景渐变
.background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 400rpx;
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  border-bottom-left-radius: 40rpx;
  border-bottom-right-radius: 40rpx;
}

// 登录卡片
.login-card {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 32rpx;
  margin: 200rpx 32rpx 32rpx;
  padding: 48rpx 40rpx;
  box-shadow: 0 20rpx 60rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
}

// 应用品牌
.app-brand {
  text-align: center;
  margin-bottom: 60rpx;
  
  .app-icon {
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #007aff, #5856d6);
    border-radius: 28rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24rpx;
    
    .icon-symbol {
      font-size: 64rpx;
    }
  }
  
  .app-name {
    font-size: 48rpx;
    font-weight: 700;
    color: #1d1d1f;
    display: block;
    margin-bottom: 12rpx;
  }
  
  .app-tagline {
    font-size: 28rpx;
    color: #8e8e93;
  }
}

// 功能列表
.features-list {
  margin-bottom: 60rpx;
  
  .feature-item {
    display: flex;
    align-items: center;
    padding: 32rpx;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .feature-icon {
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
    
    .feature-content {
      flex: 1;
      
      .feature-title {
        font-size: 28rpx;
        font-weight: 600;
        color: #1d1d1f;
        display: block;
        margin-bottom: 8rpx;
      }
      
      .feature-desc {
        font-size: 24rpx;
        color: #8e8e93;
      }
    }
  }
}

// 登录操作
.login-actions {
  margin-bottom: 40rpx;
  
  .wechat-login-button {
    background: #07c160;
    border-radius: 100rpx;
    padding: 32rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: none;
    margin-bottom: 32rpx;
    
    &::after {
      border: none;
    }
    
    .button-content {
      display: flex;
      align-items: center;
      
      .wechat-icon {
        font-size: 40rpx;
        margin-right: 20rpx;
      }
      
      .button-text {
        font-size: 32rpx;
        font-weight: 600;
        color: white;
      }
    }
    
    .button-arrow {
      font-size: 32rpx;
      color: white;
      opacity: 0.8;
    }
    
    &[disabled] {
      opacity: 0.7;
    }
  }
  
  .login-divider {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;
    
    .divider-line {
      flex: 1;
      height: 1rpx;
      background: rgba(0, 0, 0, 0.1);
    }
    
    .divider-text {
      font-size: 24rpx;
      color: #8e8e93;
      margin: 0 24rpx;
    }
  }
  
  .guest-button {
    background: transparent;
    border: 2rpx solid #007aff;
    border-radius: 100rpx;
    padding: 28rpx;
    
    &::after {
      border: none;
    }
    
    .button-text {
      font-size: 28rpx;
      font-weight: 600;
      color: #007aff;
    }
  }
}

// 用户协议
.agreement {
  text-align: center;
  
  .agreement-text {
    font-size: 24rpx;
    color: #8e8e93;
  }
  
  .agreement-link {
    font-size: 24rpx;
    color: #007aff;
  }
}

// 加载状态
.loading-overlay {
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
    
    .loading-spinner {
      width: 80rpx;
      height: 80rpx;
      border: 6rpx solid #f3f3f3;
      border-top: 6rpx solid #007aff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 24rpx;
    }
    
    .loading-text {
      font-size: 28rpx;
      color: #8e8e93;
    }
  }
}

// 动画
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 底部安全区域
.bottom-safe-area {
  height: env(safe-area-inset-bottom);
}
</style>