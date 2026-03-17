<template>
  <view class="category-manager">
    <!-- 头部 -->
    <view class="header">
      <view class="title">分类管理</view>
      <view class="subtitle">管理你的生词分类</view>
    </view>

    <!-- 搜索和筛选 -->
    <view class="search-section">
      <u-search
        v-model="searchKeyword"
        placeholder="搜索分类"
        :show-action="false"
        @search="handleSearch"
        @clear="handleClearSearch"
      />
      <view class="filter-options">
        <u-tag
          v-for="filter in filterOptions"
          :key="filter.value"
          :text="filter.label"
          :type="activeFilter === filter.value ? 'primary' : 'info'"
          size="mini"
          @click="handleFilterChange(filter.value)"
        />
      </view>
    </view>

    <!-- 分类列表 -->
    <view class="category-list" v-if="categories.length > 0">
      <view
        v-for="category in filteredCategories"
        :key="category.id"
        class="category-item"
        @click="handleCategoryClick(category)"
      >
        <view class="category-icon" :style="{ backgroundColor: category.color }">
          <u-icon :name="category.icon" color="#fff" size="24"></u-icon>
        </view>
        <view class="category-info">
          <view class="category-name">{{ category.name }}</view>
          <view class="category-meta">
            <text class="word-count">{{ category.wordCount }} 个生词</text>
            <text class="category-desc" v-if="category.description">
              · {{ category.description }}
            </text>
          </view>
        </view>
        <view class="category-actions">
          <u-icon name="more-dot-fill" @click.stop="showActionSheet(category)"></u-icon>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <u-empty
        mode="data"
        icon="http://cdn.uviewui.com/uview/empty/data.png"
        text="暂无分类"
      >
        <view class="empty-tips">
          创建分类来更好地管理你的生词吧！
        </view>
      </u-empty>
    </view>

    <!-- 添加分类按钮 -->
    <view class="add-button">
      <u-button
        type="primary"
        shape="circle"
        icon="plus"
        @click="showCreateDialog"
      >
        添加分类
      </u-button>
    </view>

    <!-- 创建/编辑分类对话框 -->
    <u-modal
      v-model="showDialog"
      :title="isEditing ? '编辑分类' : '创建分类'"
      :show-cancel-button="true"
      :async-close="true"
      @confirm="handleDialogConfirm"
    >
      <view class="dialog-content">
        <u-form :model="formData" ref="formRef">
          <u-form-item label="分类名称" prop="name" required>
            <u-input
              v-model="formData.name"
              placeholder="请输入分类名称"
              maxlength="20"
            />
          </u-form-item>
          
          <u-form-item label="分类描述" prop="description">
            <u-input
              v-model="formData.description"
              placeholder="请输入分类描述（可选）"
              type="textarea"
              maxlength="100"
            />
          </u-form-item>
          
          <u-form-item label="分类颜色" prop="color">
            <view class="color-picker">
              <view
                v-for="color in colorOptions"
                :key="color"
                class="color-option"
                :style="{ backgroundColor: color }"
                :class="{ active: formData.color === color }"
                @click="formData.color = color"
              >
                <u-icon
                  v-if="formData.color === color"
                  name="checkmark"
                  color="#fff"
                  size="16"
                ></u-icon>
              </view>
            </view>
          </u-form-item>
          
          <u-form-item label="分类图标" prop="icon">
            <view class="icon-picker">
              <view
                v-for="icon in iconOptions"
                :key="icon"
                class="icon-option"
                :class="{ active: formData.icon === icon }"
                @click="formData.icon = icon"
              >
                <u-icon :name="icon" size="24"></u-icon>
              </view>
            </view>
          </u-form-item>
        </u-form>
      </view>
    </u-modal>

    <!-- 操作菜单 -->
    <u-action-sheet
      v-model="showActionMenu"
      :list="actionMenuItems"
      @click="handleActionMenuClick"
    ></u-action-sheet>

    <!-- 加载状态 -->
    <u-loading-page
      :loading="loading"
      loading-text="加载中..."
      bg-color="#f8f8f8"
    ></u-loading-page>
  </view>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'CategoryManager',
  
  setup() {
    const store = useStore()
    
    // 状态
    const categories = ref([])
    const searchKeyword = ref('')
    const activeFilter = ref('all')
    const loading = ref(false)
    const showDialog = ref(false)
    const isEditing = ref(false)
    const showActionMenu = ref(false)
    const currentCategory = ref(null)
    const formRef = ref(null)
    
    // 表单数据
    const formData = ref({
      name: '',
      description: '',
      color: '#4CAF50',
      icon: 'folder'
    })
    
    // 筛选选项
    const filterOptions = [
      { label: '全部', value: 'all' },
      { label: '常用', value: 'frequent' },
      { label: '最近', value: 'recent' }
    ]
    
    // 颜色选项
    const colorOptions = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63',
      '#9C27B0', '#00BCD4', '#FF5722', '#795548',
      '#607D8B', '#3F51B5', '#009688', '#FFC107',
      '#8BC34A', '#FF4081', '#9E9E9E', '#000000'
    ]
    
    // 图标选项
    const iconOptions = [
      'folder', 'home', 'briefcase', 'airplane',
      'restaurant', 'graduation-cap', 'book', 'pencil',
      'star', 'heart', 'tag', 'calendar',
      'clock', 'bell', 'settings', 'user'
    ]
    
    // 操作菜单项
    const actionMenuItems = ref([
      { text: '编辑分类', color: '#2979ff' },
      { text: '删除分类', color: '#fa3534' },
      { text: '查看生词', color: '#19be6b' }
    ])
    
    // 计算属性
    const filteredCategories = computed(() => {
      let filtered = categories.value
      
      // 搜索筛选
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(category => 
          category.name.toLowerCase().includes(keyword) ||
          (category.description && category.description.toLowerCase().includes(keyword))
        )
      }
      
      // 类型筛选
      switch (activeFilter.value) {
        case 'frequent':
          filtered = filtered.sort((a, b) => b.wordCount - a.wordCount)
          break
        case 'recent':
          filtered = filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
          break
        default:
          filtered = filtered.sort((a, b) => a.sortOrder - b.sortOrder)
      }
      
      return filtered
    })
    
    // 生命周期
    onMounted(() => {
      loadCategories()
    })
    
    // 方法
    const loadCategories = async () => {
      loading.value = true
      try {
        const response = await uni.request({
          url: '/category/list',
          method: 'GET',
          data: {
            page: 1,
            pageSize: 100
          }
        })
        
        if (response.data.code === 0) {
          categories.value = response.data.data.categories
        } else {
          uni.showToast({
            title: response.data.message || '加载失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('加载分类失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      } finally {
        loading.value = false
      }
    }
    
    const handleSearch = () => {
      // 搜索逻辑已在计算属性中处理
    }
    
    const handleClearSearch = () => {
      searchKeyword.value = ''
    }
    
    const handleFilterChange = (filter) => {
      activeFilter.value = filter
    }
    
    const handleCategoryClick = (category) => {
      // 跳转到分类详情或生词列表
      uni.navigateTo({
        url: `/pages/word-list/word-list?categoryId=${category.id}`
      })
    }
    
    const showCreateDialog = () => {
      isEditing.value = false
      formData.value = {
        name: '',
        description: '',
        color: '#4CAF50',
        icon: 'folder'
      }
      showDialog.value = true
    }
    
    const showEditDialog = (category) => {
      isEditing.value = true
      currentCategory.value = category
      formData.value = {
        name: category.name,
        description: category.description || '',
        color: category.color,
        icon: category.icon
      }
      showDialog.value = true
    }
    
    const handleDialogConfirm = async () => {
      // 表单验证
      if (!formData.value.name.trim()) {
        uni.showToast({
          title: '请输入分类名称',
          icon: 'none'
        })
        return
      }
      
      try {
        const url = isEditing.value ? '/category/update' : '/category/create'
        const method = isEditing.value ? 'PUT' : 'POST'
        
        const requestData = { ...formData.value }
        if (isEditing.value) {
          requestData.categoryId = currentCategory.value.id
        }
        
        const response = await uni.request({
          url,
          method,
          data: requestData
        })
        
        if (response.data.code === 0) {
          uni.showToast({
            title: isEditing.value ? '更新成功' : '创建成功',
            icon: 'success'
          })
          showDialog.value = false
          loadCategories() // 重新加载列表
        } else {
          uni.showToast({
            title: response.data.message || '操作失败',
            icon: 'none'
          })
        }
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
      }
    }
    
    const showActionSheet = (category) => {
      currentCategory.value = category
      showActionMenu.value = true
    }
    
    const handleActionMenuClick = (index) => {
      showActionMenu.value = false
      
      if (!currentCategory.value) return
      
      switch (index) {
        case 0: // 编辑
          showEditDialog(currentCategory.value)
          break
        case 1: // 删除
          handleDeleteCategory(currentCategory.value)
          break
        case 2: // 查看生词
          handleCategoryClick(currentCategory.value)
          break
      }
    }
    
    const handleDeleteCategory = async (category) => {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除分类 "${category.name}" 吗？`,
        success: async (res) => {
          if (res.confirm) {
            try {
              const response = await uni.request({
                url: '/category/delete',
                method: 'DELETE',
                data: { categoryId: category.id }
              })
              
              if (response.data.code === 0) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                })
                loadCategories() // 重新加载列表
              } else {
                uni.showToast({
                  title: response.data.message || '删除失败',
                  icon: 'none'
                })
              }
            } catch (error) {
              console.error('删除失败:', error)
              uni.showToast({
                title: '网络错误',
                icon: 'none'
              })
            }
          }
        }
      })
    }
    
    return {
      // 状态
      categories,
      searchKeyword,
      activeFilter,
      loading,
      showDialog,
      isEditing,
      showActionMenu,
      formData,
      formRef,
      
      // 选项
      filterOptions,
      colorOptions,
      iconOptions,
      actionMenuItems,
      
      // 计算属性
      filteredCategories,
      
      // 方法
      handleSearch,
      handleClearSearch,
      handleFilterChange,
      handleCategoryClick,
      showCreateDialog,
      handleDialogConfirm,
      showActionSheet,
      handleActionMenuClick
    }
  }
}
</script>

<style lang="scss" scoped>
.category-manager {
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 120rpx;
  
  .header {
    padding: 40rpx 32rpx 20rpx;
    
    .title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }
    
    .subtitle {
      font-size: 24rpx;
      color: #999;
      margin-top: 8rpx;
    }
  }
  
  .search-section {
    padding: 0 32rpx 20rpx;
    background-color: #fff;
    
    .filter-options {
      margin-top: 20rpx;
      display: flex;
      gap: 16rpx;
      flex-wrap: wrap;
    }
  }
  
  .category-list {
    margin-top: 20rpx;
    background-color: #fff;
    
    .category-item {
      display: flex;
      align-items: center;
      padding: 24rpx 32rpx;
      border-bottom: 1rpx solid #f0f0f0;
      
      &:last-child {
        border-bottom: none;
      }
      
      &:active {
        background-color: #f8f8f8;
      }
      
      .category-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 24rpx;
        flex-shrink: 0;
      }
      
      .category-info {
        flex: 1;
        min-width: 0;
        
        .category-name {
          font-size: 28rpx;
          font-weight: 500;
          color: #333;
          margin-bottom: 8rpx;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .category-meta {
          font-size: 22rpx;
          color: #999;
          
          .word-count {
            margin-right: 12rpx;
          }
          
          .category-desc {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
      
      .category-actions {
        margin-left: 16rpx;
        color: #999;
      }
    }
  }
  
  .empty-state {
    margin-top: 100rpx;
    
    .empty-tips {
      margin-top: 20rpx;
      font-size: 24rpx;
      color: #999;
      text-align: center;
    }
  }
  
  .add-button {
    position: fixed;
    bottom: 40rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    
    ::v-deep .u-button {
      height: 80rpx;
      font-size: 28rpx;
    }
  }
  
  .dialog-content {
    padding: 32rpx;
    
    .color-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-top: 16rpx;
      
      .color-option {
        width: 60rpx;
        height: 60rpx;
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2rpx solid transparent;
        
        &.active {
          border-color: #2979ff;
        }
      }
    }
    
    .icon-picker {
      display: flex;
      flex-wrap: wrap;
      gap: 16rpx;
      margin-top: 16rpx;
      
      .icon-option {
        width: 80rpx;
        height: 80rpx;
        border-radius: 16rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f8f8f8;
        color: #666;
        
        &.active {
          background-color: #2979ff;
          color: #fff;
        }
      }
    }
  }
}
</style>