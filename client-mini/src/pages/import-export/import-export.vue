<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <u-icon 
          name="arrow-left" 
          size="28" 
          color="#333" 
          @click="handleBack"
          class="back-icon"
        ></u-icon>
        <text class="page-title">导入/导出</text>
      </view>
    </view>
    
    <!-- 功能选择 -->
    <view class="function-tabs">
      <view 
        :class="['tab-item', { active: activeTab === 'import' }]"
        @click="activeTab = 'import'"
      >
        <u-icon name="upload" size="24"></u-icon>
        <text>导入</text>
      </view>
      <view 
        :class="['tab-item', { active: activeTab === 'export' }]"
        @click="activeTab = 'export'"
      >
        <u-icon name="download" size="24"></u-icon>
        <text>导出</text>
      </view>
    </view>
    
    <!-- 导入功能 -->
    <view class="import-section" v-if="activeTab === 'import'">
      <view class="section-card">
        <text class="section-title">批量导入生词</text>
        <text class="section-desc">支持从Excel、CSV文件导入，或手动粘贴数据</text>
        
        <!-- 文件上传 -->
        <view class="upload-area" @click="chooseFile">
          <view class="upload-icon">
            <u-icon name="folder-open" size="48" color="#007aff"></u-icon>
          </view>
          <text class="upload-text">点击选择文件</text>
          <text class="upload-hint">支持 .xlsx, .csv, .txt 格式</text>
          
          <view class="file-info" v-if="selectedFile">
            <u-icon name="file-text" size="24" color="#34c759"></u-icon>
            <text class="file-name">{{ selectedFile.name }}</text>
            <text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
            <u-icon 
              name="close" 
              size="20" 
              color="#ff3b30" 
              @click.stop="clearFile"
            ></u-icon>
          </view>
        </view>
        
        <!-- 导入选项 -->
        <view class="import-options">
          <text class="options-title">导入选项</text>
          
          <view class="option-item">
            <text class="option-label">文件格式</text>
            <view class="option-buttons">
              <view 
                v-for="format in importFormats" 
                :key="format.value"
                :class="['format-btn', { active: importOptions.format === format.value }]"
                @click="importOptions.format = format.value"
              >
                <text>{{ format.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="option-item">
            <text class="option-label">重复处理</text>
            <view class="option-buttons">
              <view 
                v-for="dup in duplicateOptions" 
                :key="dup.value"
                :class="['dup-btn', { active: importOptions.duplicate === dup.value }]"
                @click="importOptions.duplicate = dup.value"
              >
                <text>{{ dup.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="option-item">
            <text class="option-label">默认分类</text>
            <u-input
              v-model="importOptions.defaultCategory"
              placeholder="输入分类名称（可选）"
              :border="true"
              class="category-input"
            />
          </view>
        </view>
        
        <!-- 预览按钮 -->
        <view class="preview-btn" @click="previewImport" v-if="selectedFile">
          <u-icon name="eye" size="24" color="#007aff"></u-icon>
          <text>预览导入数据</text>
        </view>
        
        <!-- 导入按钮 -->
        <u-button 
          type="primary" 
          @click="startImport"
          :loading="importing"
          :disabled="!selectedFile"
          class="import-btn"
        >
          <u-icon name="checkmark" size="24"></u-icon>
          <text>开始导入</text>
        </u-button>
      </view>
      
      <!-- 手动输入 -->
      <view class="section-card">
        <text class="section-title">手动输入</text>
        <text class="section-desc">直接粘贴单词列表（每行一个单词）</text>
        
        <u-input
          v-model="manualInput"
          type="textarea"
          placeholder="每行输入一个单词，例如：
apple 苹果
banana 香蕉
computer 计算机"
          :border="true"
          height="200"
          class="manual-input"
        />
        
        <u-button 
          type="default" 
          @click="importManual"
          :loading="importingManual"
          :disabled="!manualInput.trim()"
          class="manual-btn"
        >
          <u-icon name="plus-circle" size="24"></u-icon>
          <text>导入手动输入</text>
        </u-button>
      </view>
      
      <!-- 导入模板 -->
      <view class="section-card">
        <text class="section-title">导入模板</text>
        <text class="section-desc">下载模板文件，按格式填写后导入</text>
        
        <view class="template-buttons">
          <view class="template-btn" @click="downloadTemplate('excel')">
            <u-icon name="file-excel" size="28" color="#34c759"></u-icon>
            <text>Excel模板</text>
          </view>
          <view class="template-btn" @click="downloadTemplate('csv')">
            <u-icon name="file-text" size="28" color="#007aff"></u-icon>
            <text>CSV模板</text>
          </view>
          <view class="template-btn" @click="downloadTemplate('anki')">
            <u-icon name="layers" size="28" color="#ff9500"></u-icon>
            <text>Anki模板</text>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 导出功能 -->
    <view class="export-section" v-if="activeTab === 'export'">
      <view class="section-card">
        <text class="section-title">导出数据</text>
        <text class="section-desc">将生词数据导出为多种格式</text>
        
        <!-- 导出选项 -->
        <view class="export-options">
          <view class="option-item">
            <text class="option-label">导出范围</text>
            <view class="option-buttons">
              <view 
                v-for="range in exportRanges" 
                :key="range.value"
                :class="['range-btn', { active: exportOptions.range === range.value }]"
                @click="exportOptions.range = range.value"
              >
                <text>{{ range.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="option-item">
            <text class="option-label">导出格式</text>
            <view class="format-grid">
              <view 
                v-for="format in exportFormats" 
                :key="format.value"
                :class="['format-card', { active: exportOptions.format === format.value }]"
                @click="exportOptions.format = format.value"
              >
                <u-icon :name="format.icon" size="32" :color="format.color"></u-icon>
                <text class="format-name">{{ format.name }}</text>
                <text class="format-desc">{{ format.desc }}</text>
              </view>
            </view>
          </view>
          
          <view class="option-item">
            <text class="option-label">包含字段</text>
            <view class="fields-grid">
              <view 
                v-for="field in exportFields" 
                :key="field.value"
                :class="['field-item', { selected: exportOptions.fields.includes(field.value) }]"
                @click="toggleExportField(field.value)"
              >
                <u-icon name="checkmark" size="16" v-if="exportOptions.fields.includes(field.value)"></u-icon>
                <text>{{ field.label }}</text>
              </view>
            </view>
          </view>
          
          <view class="option-item">
            <text class="option-label">分类筛选</text>
            <view class="categories-selector">
              <view 
                v-for="category in availableCategories" 
                :key="category"
                :class="['category-tag', { selected: exportOptions.categories.includes(category) }]"
                @click="toggleExportCategory(category)"
              >
                <text>{{ category }}</text>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 统计信息 -->
        <view class="export-stats">
          <text class="stats-title">导出统计</text>
          <view class="stats-grid">
            <view class="stat-item">
              <text class="stat-label">生词数量</text>
              <text class="stat-value">{{ exportStats.totalWords || 0 }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">分类数量</text>
              <text class="stat-value">{{ exportStats.categories || 0 }}</text>
            </view>
            <view class="stat-item">
              <text class="stat-label">文件大小</text>
              <text class="stat-value">{{ exportStats.estimatedSize || '0 KB' }}</text>
            </view>
          </view>
        </view>
        
        <!-- 导出按钮 -->
        <u-button 
          type="primary" 
          @click="startExport"
          :loading="exporting"
          class="export-btn"
        >
          <u-icon name="download" size="24"></u-icon>
          <text>开始导出</text>
        </u-button>
      </view>
      
      <!-- 导出历史 -->
      <view class="section-card">
        <text class="section-title">导出历史</text>
        <text class="section-desc">最近导出的文件记录</text>
        
        <view class="history-list" v-if="exportHistory.length > 0">
          <view 
            v-for="item in exportHistory" 
            :key="item.id"
            class="history-item"
          >
            <view class="history-info">
              <u-icon :name="getFormatIcon(item.format)" size="24" :color="getFormatColor(item.format)"></u-icon>
              <view class="history-details">
                <text class="history-name">{{ item.filename }}</text>
                <text class="history-meta">{{ formatDate(item.timestamp) }} · {{ item.size }}</text>
              </view>
            </view>
            <view class="history-actions">
              <view class="action-btn" @click="downloadExport(item)">
                <u-icon name="download" size="20" color="#007aff"></u-icon>
              </view>
              <view class="action-btn" @click="shareExport(item)">
                <u-icon name="share" size="20" color="#34c759"></u-icon>
              </view>
            </view>
          </view>
        </view>
        
        <view class="empty-history" v-else>
          <u-empty
            mode="data"
            icon="http://cdn.uviewui.com/uview/empty/data.png"
            text="暂无导出记录"
          />
        </view>
      </view>
    </view>
    
    <!-- 导入预览弹窗 -->
    <u-modal 
      v-model="showPreviewModal" 
      title="导入预览"
      :show-cancel-button="true"
      confirm-text="确认导入"
      @confirm="confirmImport"
    >
      <view class="preview-modal">
        <text class="preview-title">将导入 {{ previewData.length }} 个生词</text>
        
        <scroll-view scroll-y class="preview-list" :style="{ height: '400rpx' }">
          <view 
            v-for="(item, index) in previewData.slice(0, 20)" 
            :key="index"
            class="preview-item"
          >
            <text class="preview-word">{{ item.word }}</text>
            <text class="preview-meaning">{{ item.meaning }}</text>
            <text class="preview-status" :class="item.status">
              {{ item.status === 'new' ? '新增' : '更新' }}
            </text>
          </view>
          
          <view class="preview-more" v-if="previewData.length > 20">
            <text>... 还有 {{ previewData.length - 20 }} 个生词</text>
          </view>
        </scroll-view>
        
        <view class="preview-summary">
          <view class="summary-item">
            <text class="summary-label">新增</text>
            <text class="summary-value">{{ previewStats.new }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">更新</text>
            <text class="summary-value">{{ previewStats.update }}</text>
          </view>
          <view class="summary-item">
            <text class="summary-label">跳过</text>
            <text class="summary-value">{{ previewStats.skip }}</text>
          </view>
        </view>
      </view>
    </u-modal>
    
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
const activeTab = ref('import')
const selectedFile = ref(null)
const importing = ref(false)
const importingManual = ref(false)
const exporting = ref(false)
const showPreviewModal = ref(false)
const manualInput = ref('')

// 导入选项
const importOptions = ref({
  format: 'excel',
  duplicate: 'skip',
  defaultCategory: ''
})

const importFormats = [
  { value: 'excel', label: 'Excel' },
  { value: 'csv', label: 'CSV' },
  { value: 'txt', label: '文本' }
]

const duplicateOptions = [
  { value: 'skip', label: '跳过重复' },
  { value: 'update', label: '更新重复' },
  { value: 'both', label: '保留两者' }
]

// 导出选项
const exportOptions = ref({
  range: 'all',
  format: 'excel',
  fields: ['word', 'meaning', 'phonetic', 'category', 'status'],
  categories: []
})

const exportRanges = [
  { value: 'all', label: '全部生词' },
  { value: 'learning', label: '学习中' },
  { value: 'review', label: '待复习' },
  { value: 'mastered', label: '已掌握' }
]

const exportFormats = [
  { value: 'excel', icon: 'file-excel', color: '#34c759', name: 'Excel', desc: '标准表格格式' },
  { value: 'csv', icon: 'file-text', color: '#007aff', name: 'CSV', desc: '通用数据格式' },
  { value: 'anki', icon: 'layers', color: '#ff9500', name: 'Anki', desc: '记忆卡片格式' },
  { value: 'json', icon