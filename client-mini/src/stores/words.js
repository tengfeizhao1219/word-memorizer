/**
 * 生词状态管理Store
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { wordApi } from '../api/word'
import { useUserStore } from './user'

export const useWordsStore = defineStore('words', () => {
  // 依赖Store
  const userStore = useUserStore()
  
  // 状态
  const wordList = ref([])
  const todayReviewWords = ref([])
  const wordStats = ref({
    total: 0,
    learning: 0,
    mastered: 0,
    todayReview: 0,
    categories: []
  })
  const currentWord = ref(null)
  const loading = ref(false)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 1
  })

  // 计算属性
  const hasWords = computed(() => wordList.value.length > 0)
  const hasTodayReview = computed(() => todayReviewWords.value.length > 0)
  const totalWords = computed(() => wordStats.value.total)
  const todayReviewCount = computed(() => wordStats.value.todayReview)

  // 获取生词列表
  async function getWordList(options = {}) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.getList({
        ...options,
        page: options.page || pagination.value.page,
        pageSize: options.pageSize || pagination.value.pageSize
      })
      
      if (result.code === 0) {
        wordList.value = result.data.list
        pagination.value = result.data.pagination
        return true
      } else {
        throw new Error(result.message || '获取生词列表失败')
      }
    } catch (error) {
      console.error('获取生词列表失败:', error)
      showToast(error.message || '获取生词列表失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取今日复习生词
  async function getTodayReviewWords(limit = 50) {
    if (!userStore.isLoggedIn) {
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.getTodayReview({ limit })
      
      if (result.code === 0) {
        todayReviewWords.value = result.data
        return true
      } else {
        throw new Error(result.message || '获取今日复习生词失败')
      }
    } catch (error) {
      console.error('获取今日复习生词失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取生词统计
  async function getWordStats() {
    if (!userStore.isLoggedIn) {
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.getStats()
      
      if (result.code === 0) {
        wordStats.value = result.data
        return true
      } else {
        throw new Error(result.message || '获取生词统计失败')
      }
    } catch (error) {
      console.error('获取生词统计失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 添加生词
  async function addWord(wordData) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.add(wordData)
      
      if (result.code === 0) {
        // 添加成功后刷新列表和统计
        await Promise.all([
          getWordList(),
          getWordStats()
        ])
        
        showToast('添加生词成功', 'success')
        return result.data
      } else {
        throw new Error(result.message || '添加生词失败')
      }
    } catch (error) {
      console.error('添加生词失败:', error)
      showToast(error.message || '添加生词失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 批量添加生词
  async function batchAddWords(wordsData) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.batchAdd(wordsData)
      
      if (result.code === 0) {
        // 批量添加成功后刷新列表和统计
        await Promise.all([
          getWordList(),
          getWordStats()
        ])
        
        const successCount = result.data.success?.length || 0
        const failedCount = result.data.failed?.length || 0
        
        let message = `批量添加完成，成功: ${successCount}个`
        if (failedCount > 0) {
          message += `，失败: ${failedCount}个`
        }
        
        showToast(message, failedCount > 0 ? 'warning' : 'success')
        return result.data
      } else {
        throw new Error(result.message || '批量添加生词失败')
      }
    } catch (error) {
      console.error('批量添加生词失败:', error)
      showToast(error.message || '批量添加生词失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取生词详情
  async function getWordDetail(wordId) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.getDetail(wordId)
      
      if (result.code === 0) {
        currentWord.value = result.data
        return true
      } else {
        throw new Error(result.message || '获取生词详情失败')
      }
    } catch (error) {
      console.error('获取生词详情失败:', error)
      showToast(error.message || '获取生词详情失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新生词
  async function updateWord(wordId, wordData) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.update(wordId, wordData)
      
      if (result.code === 0) {
        // 更新成功后刷新列表
        await getWordList()
        
        showToast('更新生词成功', 'success')
        return true
      } else {
        throw new Error(result.message || '更新生词失败')
      }
    } catch (error) {
      console.error('更新生词失败:', error)
      showToast(error.message || '更新生词失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除生词
  async function deleteWord(wordId) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.delete(wordId)
      
      if (result.code === 0) {
        // 删除成功后刷新列表和统计
        await Promise.all([
          getWordList(),
          getWordStats()
        ])
        
        showToast('删除生词成功', 'success')
        return true
      } else {
        throw new Error(result.message || '删除生词失败')
      }
    } catch (error) {
      console.error('删除生词失败:', error)
      showToast(error.message || '删除生词失败', 'error')
      return false
    } finally {
      loading.value = false
    }
  }

  // 搜索生词
  async function searchWords(keyword, options = {}) {
    if (!userStore.isLoggedIn) {
      return false
    }
    
    loading.value = true
    
    try {
      const result = await wordApi.search({
        keyword,
        ...options
      })
      
      if (result.code === 0) {
        wordList.value = result.data.list
        pagination.value = result.data.pagination
        return true
      } else {
        throw new Error(result.message || '搜索生词失败')
      }
    } catch (error) {
      console.error('搜索生词失败:', error)
      return false
    } finally {
      loading.value = false
    }
  }

  // 清空搜索
  function clearSearch() {
    getWordList()
  }

  // 设置当前页码
  function setPage(page) {
    if (page >= 1 && page <= pagination.value.totalPages) {
      pagination.value.page = page
      getWordList({ page })
    }
  }

  // 批量导入生词
  async function importWords(words, options = {}) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return null
    }
    
    loading.value = true
    
    try {
      // 这里应该调用导入API
      // 暂时模拟导入过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const result = {
        total: words.length,
        success: words.length,
        failed: 0,
        skipped: 0,
        details: words.map(word => ({
          word: word.word || word,
          status: 'created'
        }))
      }
      
      // 导入成功后刷新列表
      await getWordList()
      
      showToast(`导入完成：成功 ${result.success} 个生词`, 'success')
      return result
    } catch (error) {
      console.error('导入生词失败:', error)
      showToast('导入生词失败', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

  // 导出生词
  async function exportWords(options = {}) {
    if (!userStore.isLoggedIn) {
      showToast('请先登录', 'error')
      return null
    }
    
    loading.value = true
    
    try {
      // 这里应该调用导出API
      // 暂时模拟导出过程
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const exportData = {
        filename: `word_memorizer_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.${options.format || 'xlsx'}`,
        format: options.format || 'excel',
        count: wordList.value.length,
        downloadUrl: 'https://example.com/export/' + Date.now()
      }
      
      showToast(`导出成功，共 ${exportData.count} 个生词`, 'success')
      return exportData
    } catch (error) {
      console.error('导出生词失败:', error)
      showToast('导出生词失败', 'error')
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取导出统计
  async function getExportStats(options = {}) {
    if (!userStore.isLoggedIn) {
      return {
        totalWords: 0,
        categories: 0,
        estimatedSize: '0 KB'
      }
    }
    
    try {
      // 这里应该调用API获取实际统计
      // 暂时返回基于本地数据的统计
      const filteredWords = filterWordsByExportOptions(options)
      
      return {
        totalWords: filteredWords.length,
        categories: getUniqueCategories(filteredWords).length,
        estimatedSize: Math.ceil(filteredWords.length * 0.5) + ' KB'
      }
    } catch (error) {
      console.error('获取导出统计失败:', error)
      return {
        totalWords: 0,
        categories: 0,
        estimatedSize: '0 KB'
      }
    }
  }

  // 根据导出选项过滤生词
  function filterWordsByExportOptions(options) {
    let filtered = [...wordList.value]
    
    // 范围筛选
    if (options.range && options.range !== 'all') {
      switch (options.range) {
        case 'learning':
          filtered = filtered.filter(word => word.status === 'learning')
          break
        case 'review':
          const now = Date.now()
          filtered = filtered.filter(word => 
            word.nextReview && word.nextReview <= now
          )
          break
        case 'mastered':
          filtered = filtered.filter(word => word.status === 'mastered')
          break
      }
    }
    
    // 分类筛选
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(word => 
        word.categories && word.categories.some(category => 
          options.categories.includes(category)
        )
      )
    }
    
    return filtered
  }

  // 获取唯一分类列表
  function getUniqueCategories(words) {
    const categories = new Set()
    
    words.forEach(word => {
      if (word.categories && Array.isArray(word.categories)) {
        word.categories.forEach(category => {
          categories.add(category)
        })
      }
    })
    
    return Array.from(categories)
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
    wordList,
    todayReviewWords,
    wordStats,
    currentWord,
    loading,
    pagination,
    
    // 计算属性
    hasWords,
    hasTodayReview,
    totalWords,
    todayReviewCount,
    
    // 方法
    getWordList,
    getTodayReviewWords,
    getWordStats,
    addWord,
    batchAddWords,
    getWordDetail,
    updateWord,
    deleteWord,
    searchWords,
    clearSearch,
    setPage,
    importWords,
    exportWords,
    getExportStats
  }
})