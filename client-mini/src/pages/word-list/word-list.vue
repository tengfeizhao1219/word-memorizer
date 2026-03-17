<template>
  <view class="page-container">
    <!-- 搜索栏 -->
    <view class="search-section">
      <view class="search-bar">
        <u-search
          v-model="searchKeyword"
          placeholder="搜索单词或释义"
          :show-action="false"
          @search="handleSearch"
          @clear="handleClearSearch"
        ></u-search>
        <u-icon 
          name="filter" 
          size="24" 
          color="#666" 
          @click="showFilterModal = true"
          class="filter-icon"
        ></u-icon>
      </view>
      
      <!-- 搜索建议 -->
      <view class="search-suggestions" v-if="showSuggestions && searchSuggestions.length > 0">
        <scroll-view scroll-y class="suggestions-list">
          <view 
            v-for="(suggestion, index) in searchSuggestions" 
            :key="index"
            class="suggestion-item"
            @click="selectSuggestion(suggestion)"
          >
            <text>{{ suggestion }}</text>
          </view>
        </scroll-view>
      </view>
    </view>
    
    <!-- 筛选标签 -->
    <view class="filter-tags" v-if="activeFilters.length > 0">
      <scroll-view scroll-x class="tags-scroll">
        <view class="tags-container">
          <view 
            v-for="filter in activeFilters" 
            :key="filter.key"
            class="filter-tag"
            @click="removeFilter(filter.key)"
          >
            <text>{{ filter.label }}</text>
            <u-icon name="close" size="16" color="#666"></u-icon>
          </view>
          <view class="clear-all" @click="clearAllFilters">
            <text>清空</text>
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 统计信息 -->
    <view class="stats-bar" v-if="wordsStore.wordStats.total > 0">
      <view class="stat-item">
        <text class="stat-label">总数</text>
        <text class="stat-value">{{ wordsStore.wordStats.total }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">学习中</text>
        <text class="stat-value">{{ wordsStore.wordStats.learning }}</text>
      </view>
      <view class="stat-item">
        <text class="stat-label">已掌握</text>
        <text class="stat-value">{{ wordsStore.wordStats.mastered }}</text>
      </view>
      <view class="stat-item" @click="navigateTo('review')">
        <text class="stat-label">今日复习</text>
        <text class="stat-value highlight">{{ wordsStore.wordStats.todayReview }}</text>
      </view>
    </view>
    
    <!-- 生词列表 -->
    <view class="word-list" v-if="wordsStore.wordList.length > 0">
      <view 
        v-for="word in wordsStore.wordList" 
        :key="word._id"
        class="word-card"
        @click="viewWordDetail(word._id)"
      >
        <view class="word-header">
          <view class="word-info">
            <text class="word-text">{{ word.word }}</text>
            <view class="word-meta">
              <text class="phonetic" v-if="word.phoneticUs">{{ word.phoneticUs }}</text>
              <view class="tags">
                <view 
                  v-for="(category, idx) in word.categories.slice(0, 2)" 
                  :key="idx"
                  class="category-tag"
                >
                  <text>{{ category }}</text>
                </view>
                <view v-if="word.categories.length > 2" class="more-tag">
                  <text>+{{ word.categories.length - 2 }}</text>
                </view>
              </view>
            </view>
          </view>
          <view class="word-status">
            <view :class="['status-badge', word.status]">
              <text>{{ getStatusText(word.status) }}</text>
            </view>
            <view class="level-indicator">
              <text>Lv.{{ word.level || 1 }}</text>
            </view>
          </view>
        </view>
        
        <view class="word-content">
          <text class="meaning" v-if="word.definitions && word.definitions[0]">
            {{ word.definitions[0].meaning }}
          </text>
          
          <view class="word-actions">
            <view class="action-btn" @click.stop="startReview(word._id)">
              <u-icon name="play-circle" size="20" color="#007aff"></u-icon>
              <text>复习</text>
            </view>
            <view class="action-btn" @click.stop="editWord(word._id)">
              <u-icon name="edit-pen" size="20" color="#666"></u-icon>
              <text>编辑</text>
            </view>
            <view class="action-btn" @click.stop="showDeleteConfirm(word._id)">
              <u-icon name="trash" size="20" color="#ff3b30"></u-icon>
              <text>删除</text>
            </view>
          </view>
        </view>
        
        <view class="word-footer">
          <text class="create-time">添加于 {{ formatDate(word.createdAt) }}</text>
          <text 
            v-if="word.review && word.review.nextReview" 
            class="next-review"
            :class="{ 'due-soon': isDueSoon(word.review.nextReview) }"
          >
            下次复习: {{ formatDate(word.review.nextReview, 'short') }}
          </text>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="wordsStore.pagination.page < wordsStore.pagination.totalPages">
        <u-button 
          type="primary" 
          plain 
          @click="loadMore"
          :loading="wordsStore.loading"
        >
          加载更多
        </u-button>
      </view>
      
      <!-- 分页信息 -->
      <view class="pagination-info" v-if="wordsStore.pagination.totalPages > 1">
        <text>第 {{ wordsStore.pagination.page }} 页 / 共 {{ wordsStore.pagination.totalPages }} 页</text>
      </view>
    </view>
    
    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <u-empty
        mode="data"
        icon="http://cdn.uviewui.com/uview/empty/data.png"
        :text="emptyText"
      >
        <view class="empty-actions">
          <u-button 
            type="primary" 
            @click="navigateTo('word-add')"
            class="add-btn"
          >
            <u-icon name="plus" size="20"></u-icon>
            <text>添加第一个生词</text>
          </u-button>
          
          <u-button 
            type="default" 
            @click="handleImport"
            class="import-btn"
          >
            <u-icon name="download" size="20"></u-icon>
            <text>批量导入</text>
          </u-button>
        </view>
      </u-empty>
    </view>
    
    <!-- 添加按钮 -->
    <view class="floating-action" @click="navigateTo('word-add')">
      <u-icon name="plus" size="28" color="#fff"></u-icon>
    </view>
    
    <!-- 筛选弹窗 -->
    <u-modal 
      v-model="showFilterModal" 
      title="高级筛选"
      :show-cancel-button="true"
      confirm-text="应用筛选"
      @confirm="applyFilters"
    >
      <view class="filter-modal-content">
        <!-- 状态筛选 -->
        <view class="filter-group">
          <text class="filter-label">状态</text>
          <view class="filter-options">
            <view 
              v-for="status in statusOptions" 
              :key="status.value"
              :class="['filter-option', { active: filters.status === status.value }]"
              @click="filters.status = filters.status === status.value ? '' : status.value"
            >
              <text>{{ status.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 难度筛选 -->
        <view class="filter-group">
          <text class="filter-label">难度</text>
          <view class="filter-options">
            <view 
              v-for="difficulty in difficultyOptions" 
              :key="difficulty.value"
              :class="['filter-option', { active: filters.difficulty === difficulty.value }]"
              @click="filters.difficulty = filters.difficulty === difficulty.value ? '' : difficulty.value"
            >
              <text>{{ difficulty.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 排序方式 -->
        <view class="filter-group">
          <text class="filter-label">排序方式</text>
          <view class="filter-options">
            <view 
              v-for="sort in sortOptions" 
              :key="sort.value"
              :class="['filter-option', { active: filters.sortBy === sort.value }]"
              @click="filters.sortBy = sort.value"
            >
              <text>{{ sort.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 排序方向 -->
        <view class="filter-group">
          <text class="filter-label">排序方向</text>
          <view class="filter-options">
            <view 
              :class="['filter-option', { active: filters.sortOrder === 'desc' }]"
              @click="filters.sortOrder = 'desc'"
            >
              <text>降序</text>
            </view>
            <view 
              :class="['filter-option', { active: filters.sortOrder === 'asc' }]"
              @click="filters.sortOrder = 'asc'"
            >
              <text>升序</text>
            </view>
          </view>
        </view>
      </view>
    </u-modal>
    
    <!-- 删除确认弹窗 -->
    <u-modal 
      v-model="showDeleteModal" 
      :title="`删除生词「${deleteWordInfo.word}」`"
      :content="`确定要删除这个生词吗？删除后无法恢复。`"
      :show-cancel-button="true"
      confirm-text="删除"
      confirm-color="#ff3b30"
      @confirm="confirmDelete"
    />
    
    <!-- 加载状态 -->
    <u-loading-page :loading="wordsStore.loading && !isSearching" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useWordsStore } from '../../stores/words'
import { useUserStore } from '../../stores/user'

// 获取Store
const wordsStore = useWordsStore()
const userStore = useUserStore()

// 状态
const searchKeyword = ref('')
const showSuggestions = ref(false)
const searchSuggestions = ref([])
const showFilterModal = ref(false)
const showDeleteModal = ref(false)
const deleteWordInfo = ref({ _id: '', word: '' })
const isSearching = ref(false)

// 筛选条件
const filters = ref({
  status: '',
  difficulty: '',
  sortBy: 'createdAt',
  sortOrder: 'desc'
})

// 选项配置
const statusOptions = [
  { value: 'learning', label: '学习中' },
  { value: 'reviewed', label: '已复习' },
  { value: 'mastered', label: '已掌握' }
]

const difficultyOptions = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' }
]

const sortOptions = [
  { value: 'createdAt', label: '添加时间' },
  { value: 'word', label: '单词字母' },
  { value: 'level', label: '掌握程度' },
  { value: 'nextReview', label: '下次复习' }
]

// 计算属性
const activeFilters = computed(() => {
  const filtersList = []
  
  if (filters.value.status) {
    const status = statusOptions.find(s => s.value === filters.value.status)
    if (status) {
      filtersList.push({ key: 'status', label: `状态: ${status.label}` })
    }
  }
  
  if (filters.value.difficulty) {
    const difficulty = difficultyOptions.find(d => d.value === filters.value.difficulty)
    if (difficulty) {
      filtersList.push({ key: 'difficulty', label: `难度: ${difficulty.label}` })
    }
  }
  
  if (searchKeyword.value) {
    filtersList.push({ key: 'keyword', label: `搜索: ${searchKeyword.value}` })
  }
  
  return filtersList
})

const emptyText = computed(() => {
  if (isSearching.value || activeFilters.value.length > 0) {
    return '没有找到匹配的生词'
  }
  return '还没有添加生词'
})

// 页面加载时执行
onMounted(async () => {
  if (userStore.isLoggedIn) {
    await loadData()
  } else {
    // 未登录，跳转到登录页
    uni.redirectTo({
      url: '/pages/login/login'
    })
  }
})

// 监听筛选条件变化
watch(filters, () => {
  if (userStore.isLoggedIn) {
    loadData()
  }
}, { deep: true })

// 加载数据
async function loadData() {
  try {
    const params = {
      ...filters.value
    }
    
    if (searchKeyword.value) {
      params.search = searchKeyword.value
    }
    
    await wordsStore.getWordList(params)
  } catch (error) {
    console.error('加载生词列表失败:', error)
    showToast('加载失败', 'error')
  }
}

// 搜索处理
async function handleSearch() {
  isSearching.value = true
  showSuggestions.value = false
  await loadData()
}

// 清除搜索
function handleClearSearch() {
  searchKeyword.value = ''
  isSearching.value = false
  loadData()
}

// 获取搜索建议
async function getSearchSuggestions() {
  if (!searchKeyword.value.trim()) {
    searchSuggestions.value = []
    return
  }
  
  try {
    // 这里可以调用搜索建议API
    // 暂时使用本地过滤
    const allWords = wordsStore.wordList
    const suggestions = new Set()
    
    allWords.forEach(word => {
      if (word.word.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
        suggestions.add(word.word)
      }
      
      if (word.definitions && word.definitions[0] && 
          word.definitions[0].meaning.toLowerCase().includes(searchKeyword.value.toLowerCase())) {
        suggestions.add(word.word)
      }
    })
    
    searchSuggestions.value = Array.from(suggestions).slice(0, 5)
    showSuggestions.value = true
  } catch (error) {
    console.error('获取搜索建议失败:', error)
  }
}

// 选择搜索建议
function selectSuggestion(suggestion) {
  searchKeyword.value = suggestion
  showSuggestions.value = false
  handleSearch()
}

// 应用筛选
function applyFilters() {
  showFilterModal.value = false
  loadData()
}

// 移除筛选
function removeFilter(filterKey) {
  if (filterKey === 'keyword') {
    searchKeyword.value = ''
  } else if (filterKey === 'status') {
    filters.value.status = ''
  } else if (filterKey === 'difficulty') {
    filters.value.difficulty = ''
  }
}

// 清空所有筛选
function clearAllFilters() {
  searchKeyword.value = ''
  filters.value = {
    status: '',
    difficulty: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  }
}

// 查看生词详情
function viewWordDetail(wordId) {
  uni.navigateTo({
    url: `/pages/word-detail/word-detail?wordId=${wordId}`
  })
}

// 开始复习
function startReview(wordId) {
  uni.navigateTo({
    url: `/pages/review/review?wordId=${wordId}`
  })
}

// 编辑生词
function editWord(wordId) {
  uni.navigateTo({
    url: `/pages/word-add/word-add?wordId=${wordId}&mode=edit`
  })
}

// 显示删除确认
function showDeleteConfirm(wordId, wordText = '') {
  deleteWordInfo.value = {
    _id: wordId,
    word: wordText || '未知单词'
  }
  showDeleteModal.value = true
}

// 确认删除
async function confirmDelete() {
  try {
    await wordsStore.deleteWord(deleteWordInfo.value._id)
    showDeleteModal.value = false
    showToast('删除成功', 'success')
  } catch (error) {
    console.error('删除生词失败:', error)
    showToast('删除失败', 'error')
  }
}

// 加载更多
async function loadMore() {
  if (wordsStore.pagination.page >= wordsStore.pagination.totalPages) {
    return
  }
  
  try {
    const nextPage = wordsStore.pagination.page + 1
    await wordsStore.setPage(nextPage)
  } catch (error) {
    console.error('加载更多失败:', error)
    showToast('加载失败', 'error')
  }
}

// 处理导入
function handleImport() {
  showToast('导入功能开发中', 'info')
}

// 页面跳转
function navigateTo(page) {
  const pages = {
    'word-add': '/pages/word-add/word-add',
    'review': '/pages/review/review'
  }
  
  if (pages[page]) {
    uni.navigateTo({
      url: pages[page]
    })
  }
}

// 工具函数
function getStatusText(status) {
  const statusMap = {
    'learning': '学习中',
    'reviewed': '已复习',
    'mastered': '已掌握'
  }
  return statusMap[status] || '未知'
}

function formatDate(dateString, format = 'long') {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (format === 'short') {
    // 显示相对时间
    if (diffDays === 0) {
      return '今天'
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)}周前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  } else {
    // 完整日期
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }
}

function isDueSoon(nextReviewDate) {
  if (!nextReviewDate) return false
  
  const nextReview = new Date(nextReviewDate)
  const now = new Date()
  const diffHours = (nextReview - now) / (1000 * 60 * 60)
  
  return diffHours <= 24 // 24小时内需要复习
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
  padding-bottom: 100rpx;
  min-height: 100vh;
  background-color: #f5f5f5;
}

// 搜索区域
.search-section {
  background: white;
  padding: 20rpx 30rpx;
  position: relative;
  
  .search-bar {
    display: flex;
    align-items: center;
    
    :deep(.u-search) {
      flex: 1;
    }
    
    .filter-icon {
      margin-left: 20rpx;
      padding: 10rpx;
    }
  }
  
  .search-suggestions {
    position: absolute;
    top: 100rpx;
    left: 30rpx;
    right: 30rpx;
    background: white;
    border-radius: 12rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
    z-index: 100;
    max-height: 400rpx;
    
    .suggestions-list {
      max-height: 400rpx;
      
      .suggestion-item {
        padding: 20rpx 30rpx;
        border-bottom: 1rpx solid #f0f0f0;
        
        &:last-child {
          border-bottom: none;
        }
        
        &:active {
          background-color: #f8f9fa;
        }
        
        text {
          font-size: 28rpx;
          color: #333;
        }
      }
    }
  }
}

// 筛选标签
.filter-tags {
  background: white;
  padding: 20rpx 30rpx;
  border-top: 1rpx solid #f0f0f0;
  
  .tags-scroll {
    white-space: nowrap;
    
    .tags-container {
      display: inline-flex;
      align-items: center;
      gap: 20rpx;
      
      .filter-tag {
        display: inline-flex;
        align-items: center;
        background: #f8f9fa;
        border-radius: 20rpx;
        padding: 8rpx 16rpx;
        font-size: 24rpx;
        color: #666;
        
        u-icon {
          margin-left: 8rpx;
        }
        
        &:active {
          background: #e9ecef;
        }
      }
      
      .clear-all {
        color: #007aff;
        font-size: 24rpx;
        padding: 8rpx 16rpx;
        
        &:active {
          opacity: 0.7;
        }
      }
    }
  }
}

// 统计栏
.stats-bar {
  display: flex;
  background: white;
  padding: 30rpx;
  margin: 20rpx 30rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  .stat-item {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .stat-label {
      font-size: 24rpx;
      color: #666;
      margin-bottom: 10rpx;
    }
    
    .stat-value {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      
      &.highlight {
        color: #ff9500;
      }
    }
  }
}

// 生词列表
.word-list {
  padding: 0 30rpx;
  
  .word-card {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    &:active {
      background: #f8f9fa;
    }
    
    .word-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20rpx;
      
      .word-info {
        flex: 1;
        
        .word-text {
          font-size: 40rpx;
          font-weight: bold;
          color: #333;
          margin-bottom: 10rpx;
          display: block;
        }
        
        .word-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10rpx;
          
          .phonetic {
            font-size: 24rpx;
            color: #666;
            font-style: italic;
          }
          
          .tags {
            display: flex;
            gap: 8rpx;
            
            .category-tag {
              background: #e3f2fd;
              color: #007aff;
              font-size: 20rpx;
              padding: 4rpx 12rpx;
              border-radius: 12rpx;
            }
            
            .more-tag {
              background: #f5f5f5;
              color: #666;
              font-size: 20rpx;
              padding: 4rpx 12rpx;
              border-radius: 12rpx;
            }
          }
        }
      }
      
      .word-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 8rpx;
        
        .status-badge {
          font-size: 20rpx;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
          
          &.learning {
            background: #fff3e0;
            color: #ff9800;
          }
          
          &.reviewed {
            background: #e8f5e9;
            color: #4caf50;
          }
          
          &.mastered {
            background: #e3f2fd;
            color: #2196f3;
          }
        }
        
        .level-indicator {
          font-size: 20rpx;
          color: #666;
          background: #f5f5f5;
          padding: 4rpx 12rpx;
          border-radius: 12rpx;
        }
      }
    }
    
    .word-content {
      .meaning {
        font-size: 28rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 20rpx;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .word-actions {
        display: flex;
        gap: 20rpx;
        padding-top: 20rpx;
        border-top: 1rpx solid #f0f0f0;
        
        .action-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10rpx;
          border-radius: 12rpx;
          
          &:active {
            background: #f8f9fa;
          }
          
          u-icon {
            margin-bottom: 8rpx;
          }
          
          text {
            font-size: 22rpx;
            color: #666;
          }
        }
      }
    }
    
    .word-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 20rpx;
      padding-top: 20rpx;
      border-top: 1rpx solid #f0f0f0;
      font-size: 22rpx;
      color: #999;
      
      .next-review {
        &.due-soon {
          color: #ff9500;
          font-weight: 500;
        }
      }
    }
  }
  
  .load-more {
    padding: 40rpx 0;
    text-align: center;
  }
  
  .pagination-info {
    text-align: center;
    font-size: 24rpx;
    color: #666;
    padding: 20rpx 0;
  }
}

// 空状态
.empty-state {
  padding: 100rpx 30rpx;
  
  .empty-actions {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    margin-top: 40rpx;
    
    .add-btn, .import-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10rpx;
    }
  }
}

// 浮动按钮
.floating-action {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background: linear-gradient(135deg, #007aff, #5856d6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(0, 122, 255, 0.3);
  z-index: 100;
  
  &:active {
    transform: scale(0.95);
  }
}

// 筛选弹窗内容
.filter-modal-content {
  padding: 20rpx 0;
  
  .filter-group {
    margin-bottom: 40rpx;
    
    .filter-label {
      display: block;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 20rpx;
    }
    
    .filter-options {
      display: flex;
      flex-wrap: wrap;
      gap: 20rpx;
      
      .filter-option {
        padding: 16rpx 32rpx;
        background: #f8f9fa;
        border-radius: 12rpx;
        font-size: 26rpx;
        color: #666;
        
        &.active {
          background: #007aff;
          color: white;
        }
        
        &:active {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>