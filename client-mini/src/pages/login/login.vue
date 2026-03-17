<template>
  <view class="page-container">
    <!-- 登录背景 -->
    <view class="login-background">
      <view class="background-shape shape-1"></view>
      <view class="background-shape shape-2"></view>
      <view class="background-shape shape-3"></view>
    </view>
    
    <!-- 登录内容 -->
    <view class="login-content">
      <!-- 应用Logo和标题 -->
      <view class="app-header">
        <view class="app-logo">
          <text class="logo-text">📚</text>
        </view>
        <text class="app-title">生词本</text>
        <text class="app-subtitle">多端同步，科学记忆</text>
      </view>
      
      <!-- 登录表单 -->
      <view class="login-form">
        <!-- 微信登录按钮 -->
        <button 
          class="wechat-login-btn" 
          @click="handleWechatLogin"
          :disabled="loading"
        >
          <view class="btn-content">
            <u-icon name="weixin-fill" size="40" color="#fff"></u-icon>
            <text class="btn-text">微信一键登录</text>
          </view>
        </button>
        
        <!-- 其他登录方式 -->
        <view class="other-login-options">
          <text class="option-divider">或</text>
          
          <view class="options-grid">
            <button class="option-btn" @click="handleTestLogin">
              <u-icon name="account" size="32" color="#007aff"></u-icon>
              <text>测试账号登录</text>
            </button>
            
            <button class="option-btn" @click="navigateTo('index')">
              <u-icon name="home" size="32" color="#666"></u-icon>
              <text>先看看</text>
            </button>
          </view>
        </view>
        
        <!-- 用户协议 -->
        <view class="agreement">
          <text class="agreement-text">
            登录即表示同意
            <text class="link" @click="showAgreement">《用户协议》</text>
            和
            <text class="link" @click="showPrivacy">《隐私政策》</text>
          </text>
        </view>
      </view>
      
      <!-- 功能介绍 -->
      <view class="features">
        <view class="section-title">
          <text>核心功能</text>
        </view>
        
        <view class="features-grid">
          <view class="feature-item">
            <u-icon name="bookmark" size="32" color="#007aff"></u-icon>
            <text class="feature-title">生词记录</text>
            <text class="feature-desc">随时随地记录生词</text>
          </view>
          
          <view class="feature-item">
            <u-icon name="sync" size="32" color="#34c759"></u-icon>
            <text class="feature-title">多端同步</text>
            <text class="feature-desc">小程序与Web端实时同步</text>
          </view>
          
          <view class="feature-item">
            <u-icon name="chart-line" size="32" color="#ff9500"></u-icon>
            <text class="feature-title">科学复习</text>
            <text class="feature-desc">艾宾浩斯记忆曲线</text>
          </view>
          
          <view class="feature-item">
            <u-icon name="stats-bars" size="32" color="#5856d6"></u-icon>
            <text class="feature-title">学习统计</text>
            <text class="feature-desc">可视化学习进度</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <u-loading-page :loading="loading" />
    
    <!-- 协议弹窗 -->
    <u-modal 
      v-model="showAgreementModal" 
      :title="modalTitle" 
      :content="modalContent"
      :show-cancel-button="true"
      confirm-text="同意"
      @confirm="handleAgreementConfirm"
    />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/user'

// 获取Store
const userStore = useUserStore()

// 状态
const loading = ref(false)
const showAgreementModal = ref(false)
const modalTitle = ref('')
const modalContent = ref('')

// 微信登录
async function handleWechatLogin() {
  if (loading.value) return
  
  loading.value = true
  
  try {
    // 获取用户信息授权
    const userInfo = await getUserInfo()
    
    // 获取登录code
    const loginCode = await getLoginCode()
    
    // 调用登录接口
    const success = await userStore.wxLogin(loginCode, userInfo)
    
    if (success) {
      // 登录成功，跳转到首页
      setTimeout(() => {
        uni.switchTab({
          url: '/pages/index/index'
        })
      }, 1500)
    }
  } catch (error) {
    console.error('微信登录失败:', error)
    showToast(error.message || '登录失败', 'error')
  } finally {
    loading.value = false
  }
}

// 获取用户信息
function getUserInfo() {
  return new Promise((resolve, reject) => {
    uni.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        resolve(res.userInfo)
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// 获取登录code
function getLoginCode() {
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

// 测试账号登录
async function handleTestLogin() {
  showToast('测试账号功能开发中', 'info')
}

// 显示用户协议
function showAgreement() {
  modalTitle.value = '用户协议'
  modalContent.value = `
  欢迎使用生词本服务！

  1. 服务说明
  生词本是一款多端同步的英语学习工具，帮助用户记录和复习生词。

  2. 用户责任
  用户应妥善保管账号信息，不得将账号借给他人使用。

  3. 隐私保护
  我们承诺保护用户隐私，不会泄露用户个人信息。

  4. 服务变更
  我们保留随时修改或中断服务的权利。

  详细协议内容请访问官方网站查看。
  `
  showAgreementModal.value = true
}

// 显示隐私政策
function showPrivacy() {
  modalTitle.value = '隐私政策'
  modalContent.value = `
  隐私政策

  1. 信息收集
  我们收集的信息包括：微信昵称、头像、学习数据等。

  2. 信息使用
  收集的信息仅用于提供和改进服务，不会用于其他商业用途。

  3. 数据安全
  我们采取合理的安全措施保护用户数据。

  4. 数据删除
  用户可随时联系客服删除个人数据。

  详细隐私政策请访问官方网站查看。
  `
  showAgreementModal.value = true
}

// 协议确认
function handleAgreementConfirm() {
  showAgreementModal.value = false
  showToast('已阅读并同意', 'success')
}

// 页面跳转
function navigateTo(page) {
  const pages = {
    'index': '/pages/index/index'
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
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  position: relative;
  overflow: hidden;
}

// 登录背景
.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  
  .background-shape {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    
    &.shape-1 {
      width: 300rpx;
      height: 300rpx;
      top: -150rpx;
      right: -150rpx;
    }
    
    &.shape-2 {
      width: 200rpx;
      height: 200rpx;
      bottom: 100rpx;
      left: -100rpx;
    }
    
    &.shape-3 {
      width: 150rpx;
      height: 150rpx;
      bottom: 300rpx;
      right: 50rpx;
    }
  }
}

// 登录内容
.login-content {
  position: relative;
  z-index: 1;
  padding: 60rpx 40rpx;
}

// 应用头部
.app-header {
  text-align: center;
  margin-bottom: 80rpx;
  
  .app-logo {
    width: 120rpx;
    height: 120rpx;
    background: linear-gradient(135deg, #007aff, #5856d6);
    border-radius: 30rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 30rpx;
    
    .logo-text {
      font-size: 60rpx;
    }
  }
  
  .app-title {
    display: block;
    font-size: 48rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 10rpx;
  }
  
  .app-subtitle {
    display: block;
    font-size: 28rpx;
    color: #666;
  }
}

// 登录表单
.login-form {
  background: white;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  
  .wechat-login-btn {
    background: #07c160;
    border-radius: 50rpx;
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    margin-bottom: 40rpx;
    
    &::after {
      border: none;
    }
    
    &:disabled {
      opacity: 0.7;
    }
    
    .btn-content {
      display: flex;
      align-items: center;
      
      .btn-text {
        color: white;
        font-size: 32rpx;
        font-weight: 500;
        margin-left: 20rpx;
      }
    }
  }
}

// 其他登录方式
.other-login-options {
  .option-divider {
    display: block;
    text-align: center;
    color: #999;
    font-size: 26rpx;
    margin-bottom: 40rpx;
    position: relative;
    
    &::before,
    &::after {
      content: '';
      position: absolute;
      top: 50%;
      width: 30%;
      height: 1rpx;
      background: #eee;
    }
    
    &::before {
      left: 0;
    }
    
    &::after {
      right: 0;
    }
  }
  
  .options-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
    
    .option-btn {
      background: #f8f9fa;
      border-radius: 25rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      
      &::after {
        border: none;
      }
      
      u-icon {
        margin-right: 10rpx;
      }
      
      text {
        font-size: 26rpx;
        color: #333;
      }
    }
  }
}

// 用户协议
.agreement {
  margin-top: 40rpx;
  text-align: center;
  
  .agreement-text {
    font-size: 24rpx;
    color: #999;
    line-height: 1.5;
    
    .link {
      color: #007aff;
    }
  }
}

// 功能介绍
.features {
  background: white;
  border-radius: 30rpx;
  padding: 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  
  .section-title {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 40rpx;
    text-align: center;
  }
  
  .features-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;
    
    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 30rpx 20rpx;
      background: #f8f9fa;
      border-radius: 20rpx;
      
      u-icon {
        margin-bottom: 20rpx;
      }
      
      .feature-title {
        font-size: 28rpx;
        font-weight: 500;
        color: #333;
        margin-bottom: 10rpx;
      }
      
      .feature-desc {
        font-size: 22rpx;
        color: #666;
        line-height: 1.4;
      }
    }
  }
}
</style>