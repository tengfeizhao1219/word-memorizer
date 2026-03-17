const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command

/**
 * 批量导入生词
 */
exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext()
  
  try {
    const { 
      words,           // 生词数组
      options = {}     // 导入选项
    } = event
    
    if (!words || !Array.isArray(words) || words.length === 0) {
      return {
        code: 400,
        message: '生词数据不能为空'
      }
    }
    
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
    const timestamp = Date.now()
    
    // 处理导入选项
    const importOptions = {
      duplicate: options.duplicate || 'skip',  // skip, update, both
      defaultCategory: options.defaultCategory || '',
      source: options.source || 'import'
    }
    
    // 批量处理生词
    const results = {
      total: words.length,
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    }
    
    // 分批处理，避免单次操作过多
    const batchSize = 50
    const batches = []
    
    for (let i = 0; i < words.length; i += batchSize) {
      batches.push(words.slice(i, i + batchSize))
    }
    
    // 处理每个批次
    for (const batch of batches) {
      const batchResults = await processBatch(batch, userId, timestamp, importOptions)
      
      results.success += batchResults.success
      results.failed += batchResults.failed
      results.skipped += batchResults.skipped
      results.details.push(...batchResults.details)
    }
    
    // 更新用户统计
    await updateUserStats(userId, results.success)
    
    // 记录同步日志
    await logSyncOperation(userId, 'import', {
      count: results.success,
      options: importOptions,
      timestamp
    })
    
    return {
      code: 200,
      data: results,
      message: `导入完成：成功 ${results.success}，失败 ${results.failed}，跳过 ${results.skipped}`
    }
    
  } catch (error) {
    console.error('导入生词失败:', error)
    return {
      code: 500,
      message: '导入失败：' + error.message
    }
  }
}

/**
 * 处理一批生词
 */
async function processBatch(words, userId, timestamp, options) {
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    details: []
  }
  
  for (const wordData of words) {
    try {
      // 验证生词数据
      const validatedData = validateWordData(wordData)
      if (!validatedData) {
        results.failed++
        results.details.push({
          word: wordData.word || '未知',
          status: 'failed',
          reason: '数据格式错误'
        })
        continue
      }
      
      // 检查是否已存在
      const existingWord = await checkExistingWord(userId, validatedData.word)
      
      let operation = 'created'
      let wordId = null
      
      if (existingWord) {
        // 处理重复单词
        switch (options.duplicate) {
          case 'skip':
            results.skipped++
            results.details.push({
              word: validatedData.word,
              status: 'skipped',
              reason: '单词已存在'
            })
            continue
            
          case 'update':
            // 更新现有单词
            await updateWord(existingWord._id, validatedData, timestamp)
            operation = 'updated'
            wordId = existingWord._id
            break
            
          case 'both':
            // 创建新记录（即使已存在）
            wordId = await createWord(userId, validatedData, timestamp, options)
            operation = 'created'
            break
        }
      } else {
        // 创建新单词
        wordId = await createWord(userId, validatedData, timestamp, options)
        operation = 'created'
      }
      
      if (wordId) {
        results.success++
        results.details.push({
          word: validatedData.word,
          status: operation,
          wordId: wordId
        })
      }
      
    } catch (error) {
      console.error('处理生词失败:', wordData.word, error)
      results.failed++
      results.details.push({
        word: wordData.word || '未知',
        status: 'failed',
        reason: error.message
      })
    }
  }
  
  return results
}

/**
 * 验证生词数据
 */
function validateWordData(data) {
  if (!data.word || typeof data.word !== 'string' || data.word.trim() === '') {
    return null
  }
  
  const word = data.word.trim().toLowerCase()
  
  // 构建标准化的生词数据
  const validated = {
    word: word,
    originalWord: data.word.trim(),
    phoneticUs: data.phoneticUs || '',
    phoneticUk: data.phoneticUk || '',
    audioUs: data.audioUs || '',
    audioUk: data.audioUk || '',
    definitions: data.definitions || [
      {
        pos: data.pos || 'n.',
        meaning: data.meaning || '',
        examples: data.examples || []
      }
    ],
    categories: Array.isArray(data.categories) ? data.categories : 
                (data.category ? [data.category] : []),
    difficulty: ['easy', 'medium', 'hard'].includes(data.difficulty) ? data.difficulty : 'medium',
    notes: data.notes || '',
    source: {
      type: data.sourceType || 'import',
      from: data.sourceFrom || 'batch',
      url: data.sourceUrl || ''
    }
  }
  
  // 确保至少有一个有效的释义
  if (!validated.definitions[0].meaning) {
    validated.definitions[0].meaning = '待补充'
  }
  
  return validated
}

/**
 * 检查单词是否已存在
 */
async function checkExistingWord(userId, word) {
  try {
    const res = await db.collection('words')
      .where({
        userId: userId,
        word: word
      })
      .get()
    
    return res.data.length > 0 ? res.data[0] : null
  } catch (error) {
    console.error('检查单词存在失败:', error)
    return null
  }
}

/**
 * 创建新单词
 */
async function createWord(userId, wordData, timestamp, options) {
  const wordId = 'word_' + timestamp + '_' + Math.random().toString(36).substr(2, 9)
  
  // 添加默认分类
  if (options.defaultCategory && !wordData.categories.includes(options.defaultCategory)) {
    wordData.categories.push(options.defaultCategory)
  }
  
  const wordRecord = {
    _id: wordId,
    userId: userId,
    ...wordData,
    status: 'learning',
    level: 0,
    reviewCount: 0,
    lastReview: null,
    nextReview: timestamp + 24 * 60 * 60 * 1000, // 24小时后第一次复习
    easeFactor: 2.5,
    interval: 1,
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
    syncVersion: 1
  }
  
  await db.collection('words').add({
    data: wordRecord
  })
  
  // 创建初始复习记录
  await createInitialReview(userId, wordId, timestamp)
  
  return wordId
}

/**
 * 更新现有单词
 */
async function updateWord(wordId, wordData, timestamp) {
  const updateData = {
    ...wordData,
    updatedAt: timestamp,
    version: _.inc(1)
  }
  
  await db.collection('words')
    .doc(wordId)
    .update({
      data: updateData
    })
}

/**
 * 创建初始复习记录
 */
async function createInitialReview(userId, wordId, timestamp) {
  const reviewId = 'review_' + timestamp + '_' + Math.random().toString(36).substr(2, 9)
  
  const reviewRecord = {
    _id: reviewId,
    userId: userId,
    wordId: wordId,
    reviewDate: timestamp,
    quality: 0,
    nextInterval: 1,
    nextReview: timestamp + 24 * 60 * 60 * 1000,
    createdAt: timestamp
  }
  
  await db.collection('reviews').add({
    data: reviewRecord
  })
}

/**
 * 更新用户统计
 */
async function updateUserStats(userId, importedCount) {
  try {
    await db.collection('users')
      .doc(userId)
      .update({
        data: {
          wordCount: _.inc(importedCount),
          updatedAt: Date.now()
        }
      })
  } catch (error) {
    console.error('更新用户统计失败:', error)
  }
}

/**
 * 记录同步操作
 */
async function logSyncOperation(userId, operation, data) {
  const logId = 'sync_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  
  const logRecord = {
    _id: logId,
    userId: userId,
    operation: operation,
    data: data,
    timestamp: Date.now(),
    device: 'server'
  }
  
  await db.collection('sync_logs').add({
    data: logRecord
  })
}