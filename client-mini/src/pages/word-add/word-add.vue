<template>
  <view class="page-container">
    <!-- 页面头部 -->
    <view class="page-header">
      <view class="header-content">
        <u-icon 
          name="arrow-left" 
          size="28" 
          color="#333" 
          @click="handleCancel"
          class="back-icon"
        ></u-icon>
        <text class="page-title">{{ isEditMode ? '编辑生词' : '添加生词' }}</text>
        <view class="header-actions">
          <u-button 
            type="primary" 
            size="mini" 
            @click="handleSave"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ isEditMode ? '更新' : '保存' }}
          </u-button>
        </view>
      </view>
    </view>
    
    <!-- 表单内容 -->
    <scroll-view scroll-y class="form-content" :style="{ height: scrollHeight }">
      <!-- 基本信息 -->
      <view class="form-section">
        <text class="section-title">基本信息</text>
        
        <!-- 单词 -->
        <view class="form-item">
          <text class="form-label required">单词</text>
          <u-input
            v-model="formData.word"
            placeholder="输入英文单词"
            :border="true"
            @blur="checkWordDuplicate"
            :error="wordError"
            :error-message="wordErrorMsg"
          />
          <text class="form-hint" v-if="!wordError && formData.word">
            将自动检查是否已存在相同单词
          </text>
        </view>
        
        <!-- 音标 -->
        <view class="form-row">
          <view class="form-item half">
            <text class="form-label">美式音标</text>
            <u-input
              v-model="formData.phoneticUs"
              placeholder="/ɪgˈzæmpəl/"
              :border="true"
            />
          </view>
          <view class="form-item half">
            <text class="form-label">英式音标</text>
            <u-input
              v-model="formData.phoneticUk"
              placeholder="/ɪgˈzɑːmpəl/"
              :border="true"
            />
          </view>
        </view>
        
        <!-- 发音URL -->
        <view class="form-row">
          <view class="form-item half">
            <text class="form-label">美式发音URL</text>
            <u-input
              v-model="formData.audioUs"
              placeholder="https://example.com/audio-us.mp3"
              :border="true"
            />
          </view>
          <view class="form-item half">
            <text class="form-label">英式发音URL</text>
            <u-input
              v-model="formData.audioUk"
              placeholder="https://example.com/audio-uk.mp3"
              :border="true"
            />
          </view>
        </view>
      </view>
      
      <!-- 分类和难度 -->
      <view class="form-section">
        <text class="section-title">分类和难度</text>
        
        <!-- 分类 -->
        <view class="form-item">
          <text class="form-label">分类</text>
          <view class="categories-selector">
            <view 
              v-for="category in availableCategories" 
              :key="category"
              :class="['category-tag', { selected: formData.categories.includes(category) }]"
              @click="toggleCategory(category)"
            >
              <text>{{ category }}</text>
            </view>
            <view class="add-category" @click="showAddCategory = true">
              <u-icon name="plus" size="20" color="#007aff"></u-icon>
              <text>新建分类</text>
            </view>
          </view>
          
          <!-- 已选分类 -->
          <view class="selected-categories" v-if="formData.categories.length > 0">
            <text class="selected-label">已选择:</text>
            <view class="selected-tags">
              <view 
                v-for="category in formData.categories" 
                :key="category"
                class="selected-tag"
                @click="removeCategory(category)"
              >
                <text>{{ category }}</text>
                <u-icon name="close" size="16" color="#666"></u-icon>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 难度 -->
        <view class="form-item">
          <text class="form-label">难度</text>
          <view class="difficulty-options">
            <view 
              v-for="option in difficultyOptions" 
              :key="option.value"
              :class="['difficulty-option', { selected: formData.difficulty === option.value }]"
              @click="formData.difficulty = option.value"
            >
              <text>{{ option.label }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 释义和例句 -->
      <view class="form-section">
        <text class="section-title">释义和例句</text>
        
        <!-- 词性选择 -->
        <view class="form-item">
          <text class="form-label">词性</text>
          <view class="pos-options">
            <view 
              v-for="pos in posOptions" 
              :key="pos"
              :class="['pos-option', { selected: formData.definitions[0].pos === pos }]"
              @click="formData.definitions[0].pos = pos"
            >
              <text>{{ pos }}</text>
            </view>
          </view>
        </view>
        
        <!-- 释义 -->
        <view class="form-item">
          <text class="form-label required">释义</text>
          <u-input
            v-model="formData.definitions[0].meaning"
            placeholder="输入中文释义"
            type="textarea"
            :border="true"
            height="120"
            :error="!formData.definitions[0].meaning"
            error-message="释义不能为空"
          />
        </view>
        
        <!-- 例句 -->
        <view class="form-item">
          <text class="form-label">例句</text>
          <view class="examples-list">
            <view 
              v-for="(example, index) in formData.definitions[0].examples" 
              :key="index"
              class="example-item"
            >
              <view class="example-inputs">
                <u-input
                  v-model="example.en"
                  placeholder="英文例句"
                  :border="true"
                  class="example-en"
                />
                <u-input
                  v-model="example.zh"
                  placeholder="中文翻译"
                  :border="true"
                  class="example-zh"
                />
              </view>
              <u-icon 
                name="trash" 
                size="24" 
                color="#ff3b30" 
                @click="removeExample(index)"
                class="delete-example"
                v-if="formData.definitions[0].examples.length > 1"
              ></u-icon>
            </view>
          </view>
          
          <view class="add-example" @click="addExample">
            <u-icon name="plus-circle" size="24" color="#007aff"></u-icon>
            <text>添加例句</text>
          </view>
        </view>
      </view>
      
      <!-- 笔记和来源 -->
      <view class="form-section">
        <text class="section-title">笔记和来源</text>
        
        <!-- 笔记 -->
        <view class="form-item">
          <text class="form-label">笔记</text>
          <u-input
            v-model="formData.notes"
            placeholder="添加学习笔记、记忆技巧等"
            type="textarea"
            :border="true"
            height="120"
          />
        </view>
        
        <!-- 来源 -->
        <view class="form-item">
          <text class="form-label">来源</text>
          <view class="source-options">
            <view 
              v-for="source in sourceOptions" 
              :key="source.value"
              :class="['source-option', { selected: formData.source.type === source.value }]"
              @click="formData.source.type = source.value"
            >
              <text>{{ source.label }}</text>
            </view>
          </view>
          
          <u-input
            v-model="formData.source.url"
            placeholder="来源URL（可选）"
            :border="true"
            class="source-url"
            v-if="formData.source.type === 'web'"
          />
        </view>
      </view>
      
      <!-- 表单验证提示 -->
      <view class="form-validation" v-if="!formValid">
        <text class="validation-text">请填写所有必填字段（标*的字段）</text>
      </view>
      
      <!-- 底部间距 -->
      <view class="form-bottom"></view>
    </scroll-view>
    
    <!-- 添加分类弹窗 -->
    <u-modal 
      v-model="showAddCategory" 
      title="新建分类"
      :show-cancel-button="true"
      confirm-text="创建"
      @confirm="addNewCategory"
    >
      <view class="category-modal">
        <u-input
          v-model="newCategoryName"
          placeholder="输入分类名称"
          :border="true"
          class="category-input"
        />
      </view>
    </u-modal>
    
    <!-- 加载状态 -->
    <u-loading-page :loading="loading" />
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { useWordsStore } from '../../stores/words'
import { useUserStore } from '../../stores/user'

// 获取Store
const wordsStore = useWordsStore()
const userStore = useUserStore()

// 状态
const loading = ref(false)
const saving = ref(false)
const showAddCategory = ref(false)
const newCategoryName = ref('')
const wordError = ref(false)
const wordErrorMsg = ref('')
const scrollHeight = ref('0px')

// 表单数据
const formData = ref({
  word: '',
  phoneticUs: '',
  phoneticUk: '',
  audioUs: '',
  audioUk: '',
  categories: [],
  difficulty: 'medium',
  definitions: [
    {
      pos: 'n.',
      meaning: '',
      examples: [
        { en: '', zh: '' }
      ]
    }
  ],
  notes: '',
  source: {
    type: 'manual',
    from: 'mini',
    url: ''
  }
})

// 页面参数
const pageParams = ref({
  wordId: '',
  mode: 'add' // add | edit
})

// 选项配置
const difficultyOptions = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' }
]

const posOptions = ['n.', 'v.', 'adj.', 'adv.', 'prep.', 'conj.', 'interj.', 'pron.', 'num.']

const sourceOptions = [
  { value: 'manual', label: '手动添加' },
  { value: 'web', label: '网页抓取' },
  { value: 'ocr', label: 'OCR识别' },
  { value: 'import', label: '批量导入' }
]

// 可用分类（从Store或API获取）
const availableCategories = ref(['CET-4', 'CET-6', 'TOEFL', 'IELTS', '高频词汇', '商务英语', '日常用语'])

// 计算属性
const isEditMode = computed(() => pageParams.value.mode === 'edit')

const formValid = computed(() => {
  return formData.value.word.trim() !== '' && 
         formData.value.definitions[0].meaning.trim() !== '' &&
         !wordError.value
})

// 页面加载
onLoad((options) => {
  if (options.wordId && options.mode === 'edit') {
    pageParams.value.wordId = options.wordId
    pageParams.value.mode = 'edit'
  }
  
  // 计算滚动区域高度
  calcScrollHeight()
})

// 页面显示
onShow(async () => {
  if (isEditMode.value && pageParams.value.wordId) {
    await loadWordData()
  }
})

// 组件卸载
onUnmounted(() => {
  // 清理工作
})

// 计算滚动区域高度
function calcScrollHeight() {
  const systemInfo = uni.getSystemInfoSync()
  const windowHeight = systemInfo.windowHeight
  const headerHeight = 100 // 头部高度
  scrollHeight.value = `${windowHeight - headerHeight}px`
}

// 加载生词数据（编辑模式）
async function loadWordData() {
  if (!userStore.isLoggedIn) {
    uni.redirectTo({
      url: '/pages/login/login'
    })
    return
  }
  
  loading.value = true
  
  try {
    const success = await wordsStore.getWordDetail(pageParams.value.wordId)
    
    if (success && wordsStore.currentWord) {
      const word = wordsStore.currentWord
      
      // 填充表单数据
      formData.value = {
        word: word.word || '',
        phoneticUs: word.phoneticUs || '',
        phoneticUk: word.phoneticUk || '',
        audioUs: word.audioUs || '',
        audioUk: word.audioUk || '',
        categories: word.categories || [],
        difficulty: word.difficulty || 'medium',
        definitions: word.definitions || [
          {
            pos: 'n.',
            meaning: '',
            examples: [{ en: '', zh: '' }]
          }
        ],
        notes: word.notes || '',
        source: word.source || {
          type: 'manual',
          from: 'mini',
          url: ''
        }
      }
    }
  } catch (error) {
    console.error('加载生词数据失败:', error)
    showToast('加载失败', 'error')
  } finally {
    loading.value = false
  }
}

// 检查单词是否重复
async function checkWordDuplicate() {
  const word = formData.value.word.trim()
  if (!word) {
    wordError.value = false
    wordErrorMsg.value = ''
    return
  }
  
  // 如果是编辑模式且单词未改变，不检查
  if (isEditMode.value && wordsStore.currentWord && wordsStore.currentWord.word === word) {
    wordError.value = false
    wordErrorMsg.value = ''
    return
  }
  
  try {
    // 这里应该调用API检查单词是否重复
    // 暂时使用本地检查
    const existingWords = wordsStore.wordList.filter(w => 
      w.word.toLowerCase() === word.toLowerCase()
    )
    
    if (existingWords.length > 0) {
      wordError.value = true
      wordErrorMsg.value = '该单词已存在'
    } else {
      wordError.value = false
      wordErrorMsg.value = ''
    }
  } catch (error) {
    console.error('检查单词重复失败:', error)
  }
}

// 切换分类选择
function toggleCategory(category) {
  const index = formData.value.categories.indexOf(category)
  if (index === -1) {
    formData.value.categories.push(category)
  } else {
    formData.value.categories.splice(index, 1)
  }
}

// 移除分类
function removeCategory(category) {
  const index = formData.value.categories.indexOf(category)
  if (index !== -1) {
    formData.value.categories.splice(index, 1)
  }
}

// 添加新分类
function addNewCategory() {
  const category = newCategoryName.value.trim()
  if (category && !availableCategories.value.includes(category)) {
    availableCategories.value.push(category)
    formData.value.categories.push(category)
    newCategoryName.value = ''
    showAddCategory.value = false
    showToast('分类添加成功', 'success')
  }
}

// 添加例句
function addExample() {
  formData.value.definitions[0].examples.push({ en: '', zh: '' })
}

// 移除例句
function removeExample(index) {
  if (formData.value.definitions[0].examples.length > 1) {
    formData.value.definitions[0].examples.splice(index, 1)
  }
}

// 保存生词
async function handleSave() {
  if (!formValid.value) {
    showToast('请填写所有必填字段', 'error')
    return
  }
  
  if (!userStore.isLoggedIn) {
    showToast('请先登录', 'error')
    uni.redirectTo({
      url: '/pages/login/login'
    })
    return
  }
  
  saving.value = true
  
  try {
    // 准备数据
    const wordData = {
      ...formData.value,
      word: formData.value.word.trim(),
      definitions: formData.value.definitions.map(def => ({
        ...def,
        meaning: def.meaning.trim(),
        examples: def.examples.filter(ex => ex.en.trim() || ex.zh.trim())
      }))
    }
    
    let result
    
    if (isEditMode.value) {
      // 更新生词
      result = await wordsStore.updateWord(pageParams.value.wordId, wordData)
    } else {
      // 添加生词
      result = await wordsStore.addWord(wordData)
    }
    
    if (result) {
      showToast(isEditMode.value ? '更新成功' : '添加成功', 'success')
      
      // 延迟返回
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  } catch (error) {
    console.error('保存生词失败:', error)
    showToast(error.message || '保存失败', 'error')
  } finally {
    saving.value = false
  }
}

// 取消操作
function handleCancel() {
  uni.showModal({
    title: '确认取消',
    content: '确定要取消吗？所有未保存的更改将会丢失