/**
 * 生词详情云函数
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 获取生词详情
 */
async function getWordDetail(userId, wordId) {
  try {
    const wordDoc = await db.collection('words')
      .where({
        _id: wordId,
        userId: userId
      })
      .get();
    
    if (wordDoc.data.length === 0) {
      throw new Error('生词不存在或无权访问');
    }
    
    return wordDoc.data[0];
  } catch (error) {
    console.error('❌ 获取生词详情失败:', error);
    throw error;
  }
}

/**
 * 更新生词
 */
async function updateWord(userId, wordId, updateData) {
  try {
    // 检查生词是否存在
    const wordDoc = await db.collection('words')
      .where({
        _id: wordId,
        userId: userId
      })
      .get();
    
    if (wordDoc.data.length === 0) {
      throw new Error('生词不存在或无权访问');
    }
    
    // 构建更新数据
    const updateFields = {};
    const now = db.serverDate();
    
    // 允许更新的字段
    const allowedFields = [
      'word', 'phoneticUs', 'phoneticUk', 'audioUs', 'audioUk',
      'definitions', 'categories', 'status', 'level', 'difficulty',
      'notes'
    ];
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields[field] = updateData[field];
      }
    });
    
    // 如果更新了单词，需要检查是否重复
    if (updateData.word && updateData.word !== wordDoc.data[0].word) {
      const existingWord = await db.collection('words')
        .where({
          userId: userId,
          word: updateData.word.trim().toLowerCase(),
          _id: db.command.neq(wordId)
        })
        .get();
      
      if (existingWord.data.length > 0) {
        throw new Error('该单词已存在');
      }
      
      updateFields.word = updateData.word.trim();
    }
    
    // 添加更新时间
    updateFields.updatedAt = now;
    
    // 执行更新
    await db.collection('words').doc(wordId).update({
      data: updateFields
    });
    
    console.log('✅ 生词更新成功:', wordId);
    
    // 获取更新后的数据
    const updatedWord = await getWordDetail(userId, wordId);
    
    return updatedWord;
  } catch (error) {
    console.error('❌ 更新生词失败:', error);
    throw error;
  }
}

/**
 * 删除生词
 */
async function deleteWord(userId, wordId) {
  try {
    // 检查生词是否存在
    const wordDoc = await db.collection('words')
      .where({
        _id: wordId,
        userId: userId
      })
      .get();
    
    if (wordDoc.data.length === 0) {
      throw new Error('生词不存在或无权访问');
    }
    
    // 获取生词状态，用于更新用户统计
    const wordStatus = wordDoc.data[0].status;
    
    // 删除生词
    await db.collection('words').doc(wordId).remove();
    
    console.log('✅ 生词删除成功:', wordId);
    
    // 更新用户统计
    await updateUserStats(userId, 'delete', wordStatus);
    
    return true;
  } catch (error) {
    console.error('❌ 删除生词失败:', error);
    throw error;
  }
}

/**
 * 批量删除生词
 */
async function batchDeleteWords(userId, wordIds) {
  try {
    if (!Array.isArray(wordIds) || wordIds.length === 0) {
      throw new Error('生词ID列表不能为空');
    }
    
    if (wordIds.length > 50) {
      throw new Error('一次最多删除50个生词');
    }
    
    const results = [];
    const errors = [];
    
    for (const wordId of wordIds) {
      try {
        await deleteWord(userId, wordId);
        results.push(wordId);
      } catch (error) {
        errors.push({
          wordId: wordId,
          error: error.message
        });
      }
    }
    
    return {
      success: results,
      failed: errors
    };
  } catch (error) {
    console.error('❌ 批量删除生词失败:', error);
    throw error;
  }
}

/**
 * 更新用户统计
 */
async function updateUserStats(userId, action, wordStatus = null) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.data) {
      return;
    }
    
    const updateData = {};
    const stats = userDoc.data.stats || {};
    
    switch (action) {
      case 'delete':
        updateData['stats.totalWords'] = Math.max(0, (stats.totalWords || 0) - 1);
        
        // 根据删除的单词状态更新其他统计
        if (wordStatus === 'learning') {
          updateData['stats.learningWords'] = Math.max(0, (stats.learningWords || 0) - 1);
        } else if (wordStatus === 'mastered') {
          updateData['stats.masteredWords'] = Math.max(0, (stats.masteredWords || 0) - 1);
        }
        break;
        
      case 'updateStatus':
        if (wordStatus === 'mastered') {
          updateData['stats.masteredWords'] = (stats.masteredWords || 0) + 1;
          updateData['stats.learningWords'] = Math.max(0, (stats.learningWords || 0) - 1);
        } else if (wordStatus === 'learning') {
          updateData['stats.learningWords'] = (stats.learningWords || 0) + 1;
          updateData['stats.masteredWords'] = Math.max(0, (stats.masteredWords || 0) - 1);
        }
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
  const { action, wordId, updateData, wordIds } = event;
  
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
      case 'getDetail':
        // 获取生词详情
        if (!wordId) {
          return {
            code: 400,
            message: '缺少生词ID',
            data: null
          };
        }
        
        const wordDetail = await getWordDetail(userId, wordId);
        return {
          code: 0,
          message: '获取生词详情成功',
          data: wordDetail
        };
        
      case 'update':
        // 更新生词
        if (!wordId || !updateData) {
          return {
            code: 400,
            message: '缺少生词ID或更新数据',
            data: null
          };
        }
        
        const updatedWord = await updateWord(userId, wordId, updateData);
        return {
          code: 0,
          message: '更新生词成功',
          data: updatedWord
        };
        
      case 'delete':
        // 删除生词
        if (!wordId) {
          return {
            code: 400,
            message: '缺少生词ID',
            data: null
          };
        }
        
        await deleteWord(userId, wordId);
        return {
          code: 0,
          message: '删除生词成功',
          data: null
        };
        
      case 'batchDelete':
        // 批量删除生词
        if (!wordIds || !Array.isArray(wordIds)) {
          return {
            code: 400,
            message: '缺少生词ID列表或格式不正确',
            data: null
          };
        }
        
        const batchResult = await batchDeleteWords(userId, wordIds);
        return {
          code: 0,
          message: '批量删除生词完成',
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
    console.error('❌ 生词详情云函数执行失败:', error);
    
    return {
      code: 500,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};