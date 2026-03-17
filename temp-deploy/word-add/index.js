/**
 * 添加生词云函数
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 生成生词ID
 */
function generateWordId() {
  return 'word_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 验证生词数据
 */
function validateWordData(wordData) {
  const requiredFields = ['word'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!wordData[field] || wordData[field].trim() === '') {
      errors.push(`字段 "${field}" 不能为空`);
    }
  });
  
  if (wordData.word && wordData.word.length > 100) {
    errors.push('单词长度不能超过100个字符');
  }
  
  return errors;
}

/**
 * 添加生词
 */
async function addWord(userId, wordData) {
  try {
    // 验证数据
    const errors = validateWordData(wordData);
    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
    
    // 检查是否已存在相同单词
    const existingWord = await db.collection('words')
      .where({
        userId: userId,
        word: wordData.word.trim().toLowerCase()
      })
      .get();
    
    if (existingWord.data.length > 0) {
      throw new Error('该单词已存在');
    }
    
    // 生成生词ID
    const wordId = generateWordId();
    
    // 准备生词数据
    const now = db.serverDate();
    const newWord = {
      _id: wordId,
      userId: userId,
      word: wordData.word.trim(),
      phoneticUs: wordData.phoneticUs || '',
      phoneticUk: wordData.phoneticUk || '',
      audioUs: wordData.audioUs || '',
      audioUk: wordData.audioUk || '',
      definitions: wordData.definitions || [
        {
          pos: wordData.pos || '',
          meaning: wordData.meaning || '',
          examples: wordData.examples || []
        }
      ],
      categories: wordData.categories || [],
      status: 'learning',
      level: 1,
      difficulty: wordData.difficulty || 'medium',
      review: {
        nextReview: now,
        interval: 1,
        reviewCount: 0,
        lastReview: null,
        easeFactor: 2.5
      },
      source: {
        type: wordData.sourceType || 'manual',
        from: wordData.sourceFrom || 'mini',
        url: wordData.sourceUrl || ''
      },
      notes: wordData.notes || '',
      createdAt: now,
      updatedAt: now
    };
    
    // 保存到数据库
    await db.collection('words').add({
      data: newWord
    });
    
    // 更新用户统计
    await updateUserStats(userId, 'add');
    
    console.log('✅ 生词添加成功:', wordId);
    
    return {
      wordId: wordId,
      word: newWord
    };
  } catch (error) {
    console.error('❌ 添加生词失败:', error);
    throw error;
  }
}

/**
 * 批量添加生词
 */
async function batchAddWords(userId, wordsData) {
  try {
    if (!Array.isArray(wordsData) || wordsData.length === 0) {
      throw new Error('生词数据不能为空');
    }
    
    if (wordsData.length > 100) {
      throw new Error('一次最多添加100个生词');
    }
    
    const results = [];
    const errors = [];
    
    for (const wordData of wordsData) {
      try {
        const result = await addWord(userId, wordData);
        results.push(result);
      } catch (error) {
        errors.push({
          word: wordData.word,
          error: error.message
        });
      }
    }
    
    return {
      success: results,
      failed: errors
    };
  } catch (error) {
    console.error('❌ 批量添加生词失败:', error);
    throw error;
  }
}

/**
 * 更新用户统计
 */
async function updateUserStats(userId, action) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.data) {
      return;
    }
    
    const updateData = {};
    const stats = userDoc.data.stats || {};
    
    switch (action) {
      case 'add':
        updateData['stats.totalWords'] = (stats.totalWords || 0) + 1;
        updateData['stats.learningWords'] = (stats.learningWords || 0) + 1;
        break;
      case 'delete':
        updateData['stats.totalWords'] = Math.max(0, (stats.totalWords || 0) - 1);
        // 需要根据删除的单词状态更新其他统计
        break;
      case 'master':
        updateData['stats.masteredWords'] = (stats.masteredWords || 0) + 1;
        updateData['stats.learningWords'] = Math.max(0, (stats.learningWords || 0) - 1);
        break;
    }
    
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = db.serverDate();
      await userRef.update({
        data: updateData
      });
    }
  } catch (error) {
    console.error('❌ 更新用户统计失败:', error);
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action, wordData, wordsData } = event;
  
  try {
    // 获取当前用户ID
    const wxContext = cloud.getWXContext();
    const userId = context.OPENID;
    
    if (!userId) {
      return {
        code: 401,
        message: '未获取到用户标识',
        data: null
      };
    }
    
    switch (action) {
      case 'add':
        // 添加单个生词
        if (!wordData) {
          return {
            code: 400,
            message: '缺少生词数据',
            data: null
          };
        }
        
        const result = await addWord(userId, wordData);
        return {
          code: 0,
          message: '添加生词成功',
          data: result
        };
        
      case 'batchAdd':
        // 批量添加生词
        if (!wordsData || !Array.isArray(wordsData)) {
          return {
            code: 400,
            message: '缺少生词数据或数据格式不正确',
            data: null
          };
        }
        
        const batchResult = await batchAddWords(userId, wordsData);
        return {
          code: 0,
          message: '批量添加生词完成',
          data: batchResult
        };
        
      default:
        return {
          code: 400,
          message: '不支持的操作类型',
          data: null
        };
    }
  } catch (error) {
    console.error('❌ 添加生词云函数执行失败:', error);
    
    return {
      code: 500,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};