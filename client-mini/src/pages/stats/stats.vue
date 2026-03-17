<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <text class="header-title">学习统计</text>
      <view class="header-actions">
        <view class="time-filter" @click="showTimeFilter = true">
          <text>{{ timeFilterLabel }}</text>
          <u-icon name="arrow-down" size="20" color="#666"></u-icon>
        </view>
      </view>
    </view>
    
    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="overview-card">
        <text class="overview-title">学习概览</text>
        
        <view class="overview-stats">
          <view class="stat-item">
            <text class="stat-value">{{ stats.totalWords || 0 }}</text>
            <text class="stat-label">总生词</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.learning || 0 }}</text>
            <text class="stat-label">学习中</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.mastered || 0 }}</text>
            <text class="stat-label">已掌握</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ stats.todayReview || 0 }}</text>
            <text class="stat-label">今日复习</text>
          </view>
        </view>
        
        <!-- 学习进度 -->
        <view class="learning-progress">
          <view class="progress-header">
            <text>掌握进度</text>
            <text>{{ masteryPercentage }}%</text>
          </view>
          <view class="progress-bar">
            <view 
              class="progress-fill" 
              :style="{ width: masteryPercentage + '%' }"
            ></view>
          </view>
          <view class="progress-labels">
            <text>学习中 {{ stats.learning || 0 }}</text>
            <text>已掌握 {{ stats.mastered || 0 }}</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 图表区域 -->
    <scroll-view scroll-y class="charts-container" :style="{ height: scrollHeight }">
      <!-- 分类统计 -->
      <view class="chart-card" v-if="stats.categories && stats.categories.length > 0">
        <view class="chart-header">
          <text class="chart-title">分类分布</text>
          <text class="chart-subtitle">按分类统计生词数量</text>
        </view>
        
        <view class="categories-list">
          <view 
            v-for="category in stats.categories.slice(0, 8)" 
            :key="category._id"
            class="category-item"
          >
            <view class="category-info">
              <text class="category-name">{{ category._id || '未分类' }}</text>
              <text class="category-count">{{ category.count }} 个</text>
            </view>
            <view class="category-bar">
              <view 
                class="bar-fill" 
                :style="{ width: getCategoryPercentage(category.count) + '%' }"
              ></view>
            </view>
          </view>
        </view>
        
        <view class="chart-footer" v-if="stats.categories.length > 8">
          <text>还有 {{ stats.categories.length - 8 }} 个分类</text>
        </view>
      </view>
      
      <!-- 复习统计 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">复习统计</text>
          <text class="chart-subtitle">最近7天复习情况</text>
        </view>
        
        <view class="review-chart">
          <view class="chart-bars">
            <view 
              v-for="(day, index) in weeklyReviewData" 
              :key="index"
              class="chart-bar"
            >
              <view class="bar-container">
                <view 
                  class="bar" 
                  :style="{ height: getBarHeight(day.count) + 'rpx' }"
                  :class="{ today: isToday(day.date) }"
                ></view>
              </view>
              <text class="bar-label">{{ formatDayLabel(day.date) }}</text>
            </view>
          </view>
          
          <view class="chart-legend">
            <view class="legend-item">
              <view class="legend-color today-color"></view>
              <text>今天</text>
            </view>
            <view class="legend-item">
              <view class="legend-color normal-color"></view>
              <text>其他日期</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 学习趋势 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">学习趋势</text>
          <text class="chart-subtitle">每日新增生词数量</text>
        </view>
        
        <view class="trend-chart">
          <view class="trend-line">
            <view 
              v-for="(point, index) in learningTrendData" 
              :key="index"
              class="trend-point"
              :style="{ left: (index * 20) + '%', bottom: getTrendHeight(point.count) + 'rpx' }"
            >
              <view class="point-tooltip">
                <text>{{ point.date }}</text>
                <text>{{ point.count }} 个</text>
              </view>
            </view>
          </view>
          
          <view class="trend-labels">
            <text v-for="(label, index) in trendLabels" :key="index">{{ label }}</text>
          </view>
        </view>
      </view>
      
      <!-- 掌握程度分布 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">掌握程度</text>
          <text class="chart-subtitle">按掌握等级分布</text>
        </view>
        
        <view class="mastery-distribution">
          <view class="distribution-bars">
            <view 
              v-for="level in 5" 
              :key="level"
              class="distribution-item"
            >
              <view class="level-info">
                <text class="level-label">Lv.{{ level }}</text>
                <text class="level-count">{{ getLevelCount(level) }} 个</text>
              </view>
              <view class="level-bar">
                <view 
                  class="level-fill" 
                  :style="{ width: getLevelPercentage(level) + '%' }"
                  :class="'level-' + level"
                ></view>
              </view>
            </view>
          </view>
          
          <view class="distribution-legend">
            <text>1-2级: 新学单词 | 3-4级: 巩固中 | 5级: 已掌握</text>
          </view>
        </view>
      </view>
      
      <!-- 学习习惯 -->
      <view class="chart-card">
        <view class="chart-header">
          <text class="chart-title">学习习惯</text>
          <text class="chart-subtitle">最佳学习时间段</text>
        </view>
        
        <view class="habit-chart">
          <view class="time-slots">
            <view 
              v-for="slot in timeSlots" 
              :key="slot.time"
              class="time-slot"
            >
              <view class="slot-info">
                <text class="slot-time">{{ slot.time }}</text>
                <text class="slot-count">{{ slot.count }} 次</text>
              </view>
              <view class="slot-bar">
                <view 
                  class="slot-fill" 
                  :style="{ width: getSlotPercentage(slot.count) + '%' }"
                ></view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 数据导出 -->
      <view class="action-card">
        <text class="action-title">数据管理</text>
        <text class="action-desc">导出学习数据或生成报告</text>
        
        <view class="action-buttons">
          <view class="action-btn export-btn" @click="exportData">
            <u-icon name="download" size="28" color="#007aff"></u-icon>
            <text>导出数据</text>
          </view>
          <view class="action-btn report-btn" @click="generateReport">
            <u-icon name="file-text" size="28" color="#34c759"></u-icon>
            <text>生成报告</text>
          </view>
          <view class="action-btn share-btn" @click="shareStats">
            <u-icon name="share" size="28" color="#ff9500"></u-icon>
            <text>分享成就</text>
          </view>
        </view>
      </view>
      
      <!-- 学习建议 -->
      <view class="suggestion-card">
        <text class="suggestion-title">📚 学习建议</text>
        
        <view class="suggestions-list">
          <view class="suggestion-item" v-if="stats.todayReview > 0">
            <u-icon name="checkmark-circle" size="20" color="#34c759"></u-icon>
            <text>今天有 {{ stats.todayReview }} 个生词需要复习</text>
          </view>
          
          <view class="suggestion-item" v-if="stats.learning > stats.mastered * 2">
            <u-icon name="info-circle" size="20" color="#ff9500"></u-icon>
            <text>学习中单词较多，建议加强复习</text>
          </view>
          
          <view class="suggestion-item" v-if="masteryPercentage < 30">
            <u-icon name="lightbulb" size="20" color="#007aff"></u-icon>
            <text>掌握率较低，建议使用艾宾浩斯复习法</text>
          </view>
          
          <view class="suggestion-item">
            <u-icon name="calendar" size="20" color="#5856d6"></u-icon>
            <text>坚持每天学习，养成良好习惯</text>
          </view>
        </view>
      </view>
      
      <!-- 底部间距 -->
      <view class="chart-bottom"></view>
    </scroll-view>
    
    <!-- 时间筛选弹窗 -->
    <u-action-sheet 
      v-model="showTimeFilter" 
      :list="timeFilterOptions"
      @click="selectTimeFilter"
    />
    
    <!-- 加载状态 -->
    <u-loading-page :loading="loading" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { useWordsStore } from '../../stores/words'
import { useUserStore } from '../../stores/user'

// 获取Store
const wordsStore = useWordsStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const stats = ref({})
const showTimeFilter = ref(false)
const timeFilter = ref('week')
const scrollHeight = ref('0px')

// 时间筛选选项
const timeFilterOptions = [
  { text: '最近7天', value: 'week' },
  { text: '最近30天', value: 'month' },
  { text: '最近90天', value: 'quarter' },
  { text: '全部时间', value: 'all' }
]

// 模拟数据
const weeklyReviewData = ref([
  { date: '03-10', count: 5 },
  { date: '03-11', count: 8 },
  { date: '03-12', count: 12 },
  { date: '03-13', count: 7 },
  { date: '03-14', count: 15 },
  { date: '03-15', count: 10 },
  { date: '03-16', count: 18 }
])

const learningTrendData = ref([
  { date: '03-10', count: 3 },
  { date: '03-11', count: 5 },
  { date: '03-12', count: 8 },
  { date: '03-13', count: 4 },
  { date: '03-14', count: 7 },
  { date: '03-15', count: 6 },
  { date: '03-16', count: 10 }
])

const timeSlots = ref([
  { time: '06:00-09:00', count: 15 },
  { time: '09:00-12:00', count: 25 },
  { time: '12:00-15:00', count: 18 },
  { time: '15:00-18:00', count: 22 },
  { time: '18:00-21:00', count: 35 },
  { time: '21:00-24:00', count: 20 }
])

// 计算属性
const timeFilterLabel = computed(() => {
  const option = timeFilterOptions.find(opt => opt.value === timeFilter.value)
  return option ? option.text : '最近7天'
})

const masteryPercentage = computed(() => {
  const total = stats.value.totalWords || 1
  const mastered = stats.value.mastered || 0
  return Math.round((mastered / total) * 100)
})

const trendLabels = computed(() => {
  return learningTrendData.value.map(item => item.date.substring(3))
})

// 页面显示
onShow(async () => {
  if (!userStore.isLoggedIn) {
    uni.redirectTo({
      url: '/pages/login/login'
    })
    return
  }
  
  await loadStats()
  calcScrollHeight()
})

// 计算滚动区域高度
function calcScrollHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const windowHeight = systemInfo.windowHeight
  const headerHeight = 120 // 头部高度
  scrollHeight.value = `${windowHeight - headerHeight}px`
}

// 加载统计数据
async function loadStats() {
  loading.value = true
  
  try {
    const success = await wordsStore.getWordStats()
    
    if (success) {
      stats.value = wordsStore.wordStats
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    showToast('加载失败', 'error')
  } finally {
    loading.value = false
  }
}

// 选择时间筛选
function selectTimeFilter(index) {
  timeFilter.value = timeFilterOptions[index].value
  showTimeFilter.value = false
  loadStats() // 重新加载数据
}

// 获取分类百分比
function getCategoryPercentage(count) {
  if (!stats.value.categories || stats.value.categories.length === 0) return 0
  
  const maxCount = Math.max(...stats.value.categories.map(c => c.count))
  if (maxCount === 0) return 0
  
  return (count / maxCount) * 100
}

// 获取柱状图高度
function getBarHeight(count) {
  const maxCount = Math.max(...weeklyReviewData.value.map(d => d.count))
  if (maxCount === 0) return 0
  
  return (count / maxCount) * 100
}

// 获取趋势图高度
function getTrendHeight(count) {
  const maxCount = Math.max(...learningTrendData.value.map(d => d.count))
  if (maxCount === 0) return 0
  
  return (count / maxCount) * 80
}

// 检查是否是今天
function isToday(dateStr) {
  const today = new Date().toISOString().slice(5, 10) // MM-DD格式
  return dateStr === today
}

// 格式化日期标签
function formatDayLabel(dateStr) {
  const [month, day] = dateStr.split('-')
  return `${month}/${day}`
}

// 获取等级数量
function getLevelCount(level) {
  // 这里应该从API获取实际数据
  // 暂时返回模拟数据
  const levelCounts = [10, 25, 30, 20, 15]
  return levelCounts[level - 1] || 0
}

// 获取等级百分比
function getLevelPercentage(level) {
  const total = getLevelCount(1) + getLevelCount(2) + getLevelCount(3) + getLevelCount(4) + getLevelCount(5)
  if (total === 0) return 0
  
  return (getLevelCount(level) / total) * 100
}

// 获取时间段百分比
function getSlotPercentage(count) {
  const maxCount = Math.max(...timeSlots.value.map(slot => slot.count))
  if (maxCount === 0) return 0
  
  return (count / maxCount) * 100
}

// 导出数据
function exportData() {
  showToast('导出功能开发中', 'info')
}

// 生成报告
function generateReport() {
  showToast('报告生成功能开发中', 'info')
}

// 分享统计
function shareStats() {
  const shareContent = `📊 我的生词本学习统计：
总生词: ${stats.value.totalWords || 0}
已掌握: ${stats.value.mastered || 0}
今日复习: ${stats.value.todayReview || 0}
掌握进度: ${masteryPercentage.value}%

继续加油！💪`
  
  uni.setClipboardData({
    data: shareContent,
    success: () => {
      showToast('统计已复制到剪贴板', 'success')
    }
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
  background-color: #f5f5f5;
}

// 页面头部
.page-header {
  background: white;
  padding: 40rpx 30rpx 20rpx;
  display: