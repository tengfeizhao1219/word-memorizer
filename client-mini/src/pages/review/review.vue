<template>
  <view class="page-container">
    <!-- 复习头部 -->
    <view class="review-header">
      <view class="header-content">
        <text class="header-title">复习</text>
        <view class="header-stats">
          <text class="stats-text">
            今日复习: {{ currentIndex + 1 }}/{{ reviewWords.length }}
          </text>
        </view>
      </view>
      
      <!-- 进度条 -->
      <view class="progress-bar">
        <view 
          class="progress-fill" 
          :style="{ width: progressPercentage + '%' }"
        ></view>
      </view>
    </view>
    
    <!-- 复习内容 -->
    <view class="review-content" v-if="reviewWords.length > 0 && currentWord">
      <!-- 复习卡片 -->
      <view class="review-card" :class="{ flipped: showAnswer }">
        <!-- 卡片正面（单词） -->
        <view class="card-front" v-show="!showAnswer">
          <view class="card-content">
            <text class="word-text">{{ currentWord.word }}</text>
            
            <view class="card-hint" v-if="currentWord.phoneticUs || currentWord.phoneticUk">
              <text v-if="currentWord.phoneticUs" class="phonetic">
                美 {{ currentWord.phoneticUs }}
              </text>
              <text v-if="currentWord.phoneticUk" class="phonetic">
                英 {{ currentWord.phoneticUk }}
              </text>
            </view>
            
            <!-- 发音按钮 -->
            <view class="pronunciation-buttons" v-if="currentWord.audioUs || currentWord.audioUk">
              <view 
                class="pronounce-btn" 
                v-if="currentWord.audioUs"
                @click.stop="playAudio(currentWord.audioUs, 'us')"
              >
                <u-icon name="volume-up" size="24" color="#007aff"></u-icon>
                <text>美音</text>
              </view>
              <view 
                class="pronounce-btn" 
                v-if="currentWord.audioUk"
                @click.stop="playAudio(currentWord.audioUk, 'uk')"
              >
                <u-icon name="volume-up" size="24" color="#007aff"></u-icon>
                <text>英音</text>
              </view>
            </view>
            
            <view class="card-instruction">
              <text>点击卡片查看释义</text>
              <u-icon name="arrow-down" size="20" color="#666"></u-icon>
            </view>
          </view>
          
          <view class="card-actions">
            <view class="hint-btn" @click="showHint">
              <u-icon name="lightbulb" size="24" color="#ff9500"></u-icon>
              <text>提示</text>
            </view>
            <view class="flip-btn" @click="flipCard">
              <u-icon name="refresh" size="24" color="#007aff"></u-icon>
              <text>显示答案</text>
            </view>
          </view>
        </view>
        
        <!-- 卡片背面（释义） -->
        <view class="card-back" v-show="showAnswer">
          <view class="card-content">
            <!-- 单词信息 -->
            <view class="word-info">
              <text class="word-text">{{ currentWord.word }}</text>
              <view class="word-meta">
                <text v-if="currentWord.phoneticUs" class="phonetic">
                  {{ currentWord.phoneticUs }}
                </text>
                <view class="word-tags">
                  <view class="pos-tag">{{ currentWord.definitions[0]?.pos || 'n.' }}</view>
                  <view class="difficulty-tag" :class="currentWord.difficulty">
                    {{ getDifficultyText(currentWord.difficulty) }}
                  </view>
                </view>
              </view>
            </view>
            
            <!-- 释义 -->
            <view class="definition-section">
              <text class="section-title">释义</text>
              <text class="definition-text">
                {{ currentWord.definitions[0]?.meaning || '暂无释义' }}
              </text>
            </view>
            
            <!-- 例句 -->
            <view 
              class="examples-section" 
              v-if="currentWord.definitions[0]?.examples && currentWord.definitions[0].examples.length > 0"
            >
              <text class="section-title">例句</text>
              <view class="examples-list">
                <view 
                  v-for="(example, index) in currentWord.definitions[0].examples.slice(0, 2)" 
                  :key="index"
                  class="example-item"
                >
                  <text class="example-en">{{ example.en }}</text>
                  <text class="example-zh">{{ example.zh }}</text>
                </view>
              </view>
            </view>
            
            <!-- 笔记 -->
            <view class="notes-section" v-if="currentWord.notes">
              <text class="section-title">笔记</text>
              <text class="notes-text">{{ currentWord.notes }}</text>
            </view>
          </view>
          
          <view class="card-actions">
            <view class="flip-btn" @click="flipCard">
              <u-icon name="refresh" size="24" color="#007aff"></u-icon>
              <text>隐藏答案</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 复习质量评估 -->
      <view class="quality-assessment" v-if="showAnswer">
        <text class="assessment-title">复习质量评估</text>
        <text class="assessment-desc">根据记忆清晰程度选择</text>
        
        <view class="quality-buttons">
          <view 
            v-for="quality in qualityOptions" 
            :key="quality.value"
            :class="['quality-btn', `quality-${quality.value}`]"
            @click="submitReview(quality.value)"
          >
            <text class="quality-number">{{ quality.value }}</text>
            <text class="quality-label">{{ quality.label }}</text>
            <text class="quality-desc">{{ quality.desc }}</text>
          </view>
        </view>
        
        <!-- 质量说明 -->
        <view class="quality-explanation">
          <view class="explanation-item">
            <u-icon name="checkmark-circle" size="20" color="#34c759"></u-icon>
            <text>高质量复习会延长下次复习间隔</text>
          </view>
          <view class="explanation-item">
            <u-icon name="info-circle" size="20" color="#ff9500"></u-icon>
            <text>低质量复习会缩短间隔，加强记忆</text>
          </view>
        </view>
      </view>
      
      <!-- 复习导航 -->
      <view class="review-navigation">
        <view class="nav-btn prev-btn" @click="prevWord" :disabled="currentIndex === 0">
          <u-icon name="arrow-left" size="24" color="#666"></u-icon>
          <text>上一个</text>
        </view>
        
        <view class="nav-info">
          <text>{{ currentIndex + 1 }} / {{ reviewWords.length }}</text>
        </view>
        
        <view class="nav-btn next-btn" @click="nextWord" :disabled="currentIndex === reviewWords.length - 1">
          <text>下一个</text>
          <u-icon name="arrow-right" size="24" color="#666"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <u-empty
        mode="data"
        icon="http://cdn.uviewui.com/uview/empty/data.png"
        :text="emptyText"
      >
        <view class="empty-actions">
          <u-button 
            type="primary" 
            @click="refreshReview"
            :loading="loading"
            class="refresh-btn"
          >
            <u-icon name="refresh" size="20"></u-icon>
            <text>刷新复习列表</text>
          </u-button>
          
          <u-button 
            type="default" 
            @click="navigateTo('word-add')"
            class="add-btn"
          >
            <u-icon name="plus" size="20"></u-icon>
            <text>添加生词</text>
          </u-button>
        </view>
      </u-empty>
    </view>
    
    <!-- 复习完成弹窗 -->
    <u-modal 
      v-model="showCompletionModal" 
      title="🎉 复习完成！"
      :show-cancel-button="false"
      confirm-text="查看统计"
      @confirm="navigateTo('stats')"
    >
      <view class="completion-content">
        <text class="completion-text">
          恭喜！你已完成今日所有复习任务。
        </text>
        <view class="completion-stats">
          <view class="stat-item">
            <text class="stat-label">复习数量</text>
            <text class="stat-value">{{ completedReviews.length }}</text>
          </view>
          <view class="stat-item">
            <text class="stat-label">平均质量</text>
            <text class="stat-value">{{ averageQuality.toFixed(1) }}</text>
          </view>
        </view>
      </view>
    </u-modal>
    
    <!-- 音频播放器 -->
    <audio 
      v-if="currentAudioUrl" 
      :src="currentAudioUrl" 
      :id="audioId"
      @error="handleAudioError"
      @ended="handleAudioEnded"
    />
    
    <!-- 加载状态 -->
    <u-loading-page :loading="loading" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useWordsStore } from '../../stores/words'
import { useUserStore } from '../../stores/user'

// 获取Store
const wordsStore = useWordsStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const reviewWords = ref([])
const currentIndex = ref(0)
const showAnswer = ref(false)
const showCompletionModal = ref(false)
const currentAudioUrl = ref('')
const audioId = ref('audio_' + Date.now())
const audioContext = ref(null)
const completedReviews = ref([])

// 复习质量选项
const qualityOptions = [
  { value: 5, label: '完美回忆', desc: '立即想起，毫不费力' },
  { value: 4, label: '犹豫正确', desc: '稍作思考后正确' },
  { value: 3, label: '困难正确', desc: '努力回忆后正确' },
  { value: 2, label: '错误但熟', desc: '错误但感觉熟悉' },
  { value: 1, label: '错误陌生', desc: '错误且感觉陌生' },
  { value: 0, label: '完全忘记', desc: '毫无印象' }
]

// 计算属性
const currentWord = computed(() => {
  return reviewWords.value[currentIndex.value] || null
})

const progressPercentage = computed(() => {
  if (reviewWords.value.length === 0) return 0
  return ((currentIndex.value + 1) / reviewWords.value.length) * 100
})

const emptyText = computed(() => {
  if (loading.value) return '加载中...'
  return '今日没有需要复习的生词'
})

const averageQuality = computed(() => {
  if (completedReviews.value.length === 0) return 0
  const sum = completedReviews.value.reduce((total, review) => total + review.quality, 0)
  return sum / completedReviews.value.length
})

// 页面显示
onShow(async () => {
  if (!userStore.isLoggedIn) {
    uni.redirectTo({
      url: '/pages/login/login'
    })
    return
  }
  
  await loadReviewWords()
})

// 组件卸载
onUnmounted(() => {
  // 清理音频
  if (audioContext.value) {
    audioContext.value.stop()
    audioContext.value.destroy()
  }
})

// 加载复习生词
async function loadReviewWords() {
  loading.value = true
  
  try {
    const success = await wordsStore.getTodayReviewWords()
    
    if (success) {
      reviewWords.value = wordsStore.todayReviewWords
      currentIndex.value = 0
      showAnswer.value = false
      completedReviews.value = []
    }
  } catch (error) {
    console.error('加载复习生词失败:', error)
    showToast('加载失败', 'error')
  } finally {
    loading.value = false
  }
}

// 刷新复习列表
async function refreshReview() {
  await loadReviewWords()
}

// 播放音频
function playAudio(audioUrl, type) {
  if (!audioUrl) {
    showToast('暂无发音', 'info')
    return
  }
  
  try {
    currentAudioUrl.value = audioUrl
    
    // 使用uni.createInnerAudioContext
    if (audioContext.value) {
      audioContext.value.stop()
      audioContext.value.destroy()
    }
    
    audioContext.value = uni.createInnerAudioContext()
    audioContext.value.src = audioUrl
    audioContext.value.play()
    
    showToast(`播放${type === 'us' ? '美式' : '英式'}发音`, 'success')
  } catch (error) {
    console.error('播放音频失败:', error)
    showToast('播放失败', 'error')
  }
}

// 音频错误处理
function handleAudioError() {
  showToast('音频播放失败', 'error')
}

// 音频播放结束
function handleAudioEnded() {
  currentAudioUrl.value = ''
}

// 翻转卡片
function flipCard() {
  showAnswer.value = !showAnswer.value
}

// 显示提示
function showHint() {
  if (!currentWord.value) return
  
  const hints = [
    `词性: ${currentWord.value.definitions[0]?.pos || '未知'}`,
    `分类: ${currentWord.value.categories?.join(', ') || '未分类'}`,
    `难度: ${getDifficultyText(currentWord.value.difficulty)}`
  ]
  
  uni.showModal({
    title: '记忆提示',
    content: hints.join('\n'),
    showCancel: false,
    confirmText: '知道了'
  })
}

// 提交复习结果
async function submitReview(quality) {
  if (!currentWord.value) return
  
  try {
    // 记录复习结果
    completedReviews.value.push({
      wordId: currentWord.value._id,
      word: currentWord.value.word,
      quality: quality,
      timestamp: new Date()
    })
    
    // 显示反馈
    const feedback = getQualityFeedback(quality)
    showToast(feedback, 'success')
    
    // 自动进入下一个单词
    setTimeout(() => {
      nextWord()
    }, 800)
  } catch (error) {
    console.error('提交复习结果失败:', error)
    showToast('提交失败', 'error')
  }
}

// 获取质量反馈
function getQualityFeedback(quality) {
  const feedbacks = {
    5: '完美！记忆非常牢固',
    4: '很好！稍作思考就想起',
    3: '不错！虽然困难但正确',
    2: '需要加强记忆',
    1: '记忆不够牢固',
    0: '完全忘记，需要重点复习'
  }
  return feedbacks[quality] || '复习完成'
}

// 上一个单词
function prevWord() {
  if (currentIndex.value > 0) {
    currentIndex.value--
    showAnswer.value = false
  }
}

// 下一个单词
function nextWord() {
  if (currentIndex.value < reviewWords.value.length - 1) {
    currentIndex.value++
    showAnswer.value = false
  } else {
    // 复习完成
    showCompletionModal.value = true
  }
}

// 页面跳转
function navigateTo(page) {
  const pages = {
    'word-add': '/pages/word-add/word-add',
    'stats': '/pages/stats/stats'
  }
  
  if (pages[page]) {
    uni.navigateTo({
      url: pages[page]
    })
  }
}

// 工具函数
function getDifficultyText(difficulty) {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || '未知'
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
}

// 复习头部
.review-header {
  background: white;
  padding: 40rpx 30rpx 30rpx;
  border-bottom-left-radius: 30rpx;
  border-bottom-right-radius: 30rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  
  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    
    .header-title {
      font-size: 40rpx;
      font-weight: bold;
      color: #333;
    }
    
    .header-stats {
      .stats-text {
        font-size: 26rpx;
        color: #666;
        background: #f8f9fa;
        padding: 8rpx 16rpx;
        border-radius: 20rpx;
      }
    }
  }
  
  .progress-bar {
    height: 8rpx;
    background: #f0f0f0;
    border-radius: 4rpx;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background: