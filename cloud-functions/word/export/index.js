const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

/**
 * 导出生词数据
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const { 
      format = 'excel',      // 导出格式：excel, csv, json, anki
      range = 'all',         // 导出范围：all, learning, review, mastered
      fields = [],           // 导出字段
      categories = [],       // 分类筛选
      options = {}           // 其他选项
    } = event
    
    // 验证用户登录状态
    const userRes = await db.collection('users')
      .where({
        _openid: OPENID
      })
      .get()
    
    if (userRes.data.length === 0) {
      return {
        code: 401,
        message: '用户不存在'
      }
    }
    
    const userId = userRes.data[0]._id
    
    // 构建查询条件
    const query = buildQuery(userId, range, categories)
    
    // 获取生词数据
    const words = await getWords(query, fields)
    
    if (words.length === 0) {
      return {
        code: 404,
        message: '没有找到符合条件的生词'
      }
    }
    
    // 根据格式处理数据
    const exportData = formatExportData(words, format, fields, options)
    
    // 生成文件名
    const filename = generateFilename(userId, format, range)
    
    // 记录导出历史
    await logExportHistory(userId, {
      format,
      range,
      count: words.length,
      filename,
      timestamp: Date.now()
    })
    
    return {
      code: 200,
      data: {
        filename,
        format,
        count: words.length,
        data: exportData,
        downloadUrl: await generateDownloadUrl(exportData, filename, format)
      },
      message: `导出成功，共 ${words.length} 个生词`
    }
    
  } catch (error) {
    console.error('导出生词失败:', error)
    return {
      code: 500,
      message: '导出失败：' + error.message
    }
  }
}

/**
 * 构建查询条件
 */
function buildQuery(userId, range, categories) {
  const query = {
    userId: userId
  }
  
  // 根据范围添加条件
  switch (range) {
    case 'learning':
      query.status = 'learning'
      break
    case 'review':
      const now = Date.now()
      query.nextReview = _.lte(now)
      break
    case 'mastered':
      query.status = 'mastered'
      break
    // 'all' 不添加额外条件
  }
  
  // 分类筛选
  if (categories && categories.length > 0) {
    query.categories = _.in(categories)
  }
  
  return query
}

/**
 * 获取生词数据
 */
async function getWords(query, fields) {
  // 构建查询字段
  const projection = {}
  const defaultFields = [
    'word', 'phoneticUs', 'phoneticUk', 'definitions', 
    'categories', 'difficulty', 'status', 'level',
    'reviewCount', 'lastReview', 'nextReview', 'notes',
    'createdAt', 'updatedAt'
  ]
  
  const selectedFields = fields.length > 0 ? fields : defaultFields
  
  selectedFields.forEach(field => {
    projection[field] = true
  })
  
  // 查询数据
  const res = await db.collection('words')
    .where(query)
    .field(projection)
    .orderBy('createdAt', 'desc')
    .get()
  
  return res.data
}

/**
 * 格式化导出数据
 */
function formatExportData(words, format, fields, options) {
  switch (format) {
    case 'excel':
      return formatExcelData(words, fields, options)
    case 'csv':
      return formatCsvData(words, fields, options)
    case 'json':
      return formatJsonData(words, fields, options)
    case 'anki':
      return formatAnkiData(words, fields, options)
    default:
      return formatExcelData(words, fields, options)
  }
}

/**
 * 格式化为Excel数据
 */
function formatExcelData(words, fields, options) {
  const headers = getHeaders(fields)
  const rows = []
  
  // 添加表头
  rows.push(headers)
  
  // 添加数据行
  words.forEach(word => {
    const row = []
    
    fields.forEach(field => {
      row.push(formatFieldValue(word, field))
    })
    
    rows.push(row)
  })
  
  return {
    type: 'excel',
    headers: headers,
    rows: rows,
    sheetName: '生词本',
    metadata: {
      total: words.length,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }
}

/**
 * 格式化为CSV数据
 */
function formatCsvData(words, fields, options) {
  const headers = getHeaders(fields)
  const rows = []
  
  // 添加表头行
  rows.push(headers.join(','))
  
  // 添加数据行
  words.forEach(word => {
    const row = []
    
    fields.forEach(field => {
      const value = formatFieldValue(word, field)
      // CSV转义处理
      const escapedValue = escapeCsvValue(value)
      row.push(escapedValue)
    })
    
    rows.push(row.join(','))
  })
  
  return {
    type: 'csv',
    content: rows.join('\n'),
    metadata: {
      total: words.length,
      exportedAt: new Date().toISOString()
    }
  }
}

/**
 * 格式化为JSON数据
 */
function formatJsonData(words, fields, options) {
  const data = words.map(word => {
    const item = {}
    
    fields.forEach(field => {
      item[field] = formatFieldValue(word, field)
    })
    
    return item
  })
  
  return {
    type: 'json',
    data: data,
    metadata: {
      total: words.length,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
  }
}

/**
 * 格式化为Anki数据
 */
function formatAnkiData(words, fields, options) {
  const ankiFields = ['word', 'meaning', 'phonetic', 'example', 'notes']
  const rows = []
  
  // Anki CSV格式：字段用制表符分隔
  words.forEach(word => {
    const row = []
    
    ankiFields.forEach(field => {
      let value = ''
      
      switch (field) {
        case 'word':
          value = word.word
          break
        case 'meaning':
          value = word.definitions?.[0]?.meaning || ''
          break
        case 'phonetic':
          value = word.phoneticUs || word.phoneticUk || ''
          break
        case 'example':
          if (word.definitions?.[0]?.examples?.length > 0) {
            const example = word.definitions[0].examples[0]
            value = `${example.en} - ${example.zh}`
          }
          break
        case 'notes':
          value = word.notes || ''
          break
      }
      
      // Anki支持HTML格式
      if (options.htmlFormat) {
        value = `<div>${value}</div>`
      }
      
      row.push(value)
    })
    
    rows.push(row.join('\t'))
  })
  
  return {
    type: 'anki',
    content: rows.join('\n'),
    fields: ankiFields,
    metadata: {
      total: words.length,
      deckName: options.deckName || '生词本',
      exportedAt: new Date().toISOString()
    }
  }
}

/**
 * 获取表头
 */
function getHeaders(fields) {
  const headerMap = {
    'word': '单词',
    'phoneticUs': '美式音标',
    'phoneticUk': '英式音标',
    'meaning': '释义',
    'pos': '词性',
    'example': '例句',
    'categories': '分类',
    'difficulty': '难度',
    'status': '状态',
    'level': '掌握等级',
    'reviewCount': '复习次数',
    'lastReview': '上次复习',
    'nextReview': '下次复习',
    'notes': '笔记',
    'createdAt': '创建时间',
    'updatedAt': '更新时间'
  }
  
  return fields.map(field => headerMap[field] || field)
}

/**
 * 格式化字段值
 */
function formatFieldValue(word, field) {
  switch (field) {
    case 'meaning':
      return word.definitions?.[0]?.meaning || ''
    case 'pos':
      return word.definitions?.[0]?.pos || ''
    case 'example':
      if (word.definitions?.[0]?.examples?.length > 0) {
        const example = word.definitions[0].examples[0]
        return `${example.en} - ${example.zh}`
      }
      return ''
    case 'categories':
      return Array.isArray(word.categories) ? word.categories.join(', ') : ''
    case 'lastReview':
    case 'nextReview':
    case 'createdAt':
    case 'updatedAt':
      return word[field] ? new Date(word[field]).toLocaleString('zh-CN') : ''
    default:
      return word[field] || ''
  }
}

/**
 * CSV转义处理
 */
function escapeCsvValue(value) {
  if (typeof value !== 'string') {
    value = String(value)
  }
  
  // 如果包含逗号、引号或换行符，需要用引号包裹
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    // 转义双引号
    value = value.replace(/"/g, '""')
    return `"${value}"`
  }
  
  return value
}

/**
 * 生成文件名
 */
function generateFilename(userId, format, range) {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rangeText = range === 'all' ? '' : `_${range}`
  
  const extensions = {
    'excel': 'xlsx',
    'csv': 'csv',
    'json': 'json',
    'anki': 'txt'
  }
  
  const ext = extensions[format] || 'txt'
  
  return `word_memorizer_${timestamp}${rangeText}.${ext}`
}

/**
 * 生成下载URL（模拟）
 */
async function generateDownloadUrl(data, filename, format) {
  // 在实际应用中，这里应该将数据上传到云存储并返回下载URL
  // 这里返回一个模拟的URL
  return `https://cloudbase.example.com/exports/${filename}?t=${Date.now()}`
}

/**
 * 记录导出历史
 */
async function logExportHistory(userId, exportInfo) {
  const historyId = 'export_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  
  const historyRecord = {
    _id: historyId,
    userId: userId,
    ...exportInfo,
    timestamp: Date.now()
  }
  
  try {
    await db.collection('export_history').add({
      data: historyRecord
    })
  } catch (error) {
    console.error('记录导出历史失败:', error)
  }
}

/**
 * 获取导出统计
 */
async function getExportStats(query) {
  try {
    const countRes = await db.collection('words')
      .where(query)
      .count()
    
    const categoriesRes = await db.collection('words')
      .where(query)
      .aggregate()
      .unwind('$categories')
      .group({
        _id: '$categories',
        count: $.sum(1)
      })
      .end()
    
    return {
      totalWords: countRes.total,
      categories: categoriesRes.list?.length || 0,
      estimatedSize: Math.ceil(countRes.total * 0.5) + ' KB' // 估算大小
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