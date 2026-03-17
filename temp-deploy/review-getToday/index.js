/**
 * 获取今日复习生词云函数
 * 基于艾宾浩斯记忆曲线 (SM-2算法)
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * SM-2算法计算下次复习间隔
 * @param {number} easeFactor 记忆难度系数 (默认2.5)
 * @param {number} interval 当前间隔天数
 * @param {number} quality 复习质量 (0-5)
 * @returns {Object} 新的间隔和难度系数
 */
function calculateNextReview(easeFactor, interval, quality) {
  // 复习质量映射
  // 5: 完美回忆
  // 4: 犹豫但正确
  // 3: 困难但正确
  // 2: 错误但能认出
  // 1: 错误但熟悉
  // 0: 完全忘记
  
  let newEaseFactor = easeFactor;
  let newInterval = interval;
  
  if (quality >= 3) {
    // 回答正确
    if (interval === 0) {
      // 第一次复习
      newInterval = 1;
    } else if (interval === 1) {
      // 第二次复习
      newInterval = 6;
    } else {
      // 后续复习
      newInterval = Math.round(interval * easeFactor);
    }
    
    // 根据回答质量调整难度系数
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  } else {
    // 回答错误，重置间隔
    newInterval = 1;
    newEaseFactor = Math.max(1.3, easeFactor - 0.2);
  }
  
  // 限制难度系数范围
  newEaseFactor = Math.max(1.3, Math.min(newEaseFactor, 2.5));
  
  return {
    interval: newInterval,
    easeFactor: newEaseFactor
  };
}

/**
 * 获取今日需要复习的生词
 */
async function getTodayReviewWords(userId, limit = 50) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // 获取今日需要复习的生词
    const result = await db.collection('words')
      .where({
        userId: userId,
        'review.nextReview': _.lte(now)
      })
      .orderBy('review.nextReview', 'asc')
      .limit(limit)
      .get();
    
    return result.data;
  } catch (error) {
    console.error('❌ 获取今日复习生词失败:', error);
    throw error;
  }
}

/**
 * 获取复习统计
 */
async function getReviewStats(userId) {
  try {
    const now = new Date();
    
    // 获取今日复习数量
    const todayReviewResult = await db.collection('words')
      .where({
        userId: userId,
        'review.nextReview': _.lte(now)
      })
      .count();
    
    // 获取未来7天复习计划
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const weeklyReviewResult = await db.collection('words')
      .aggregate()
      .match({
        userId: userId,
        'review.nextReview': _.gte(now).and(_.lte(nextWeek))
      })
      .group({
        _id: {
          $dateToString: {
            format: '%Y-%m-%d',
            date: '$review.nextReview'
          }
        },
        count: _.sum(1)
      })
      .sort({
        _id: 1
      })
      .end();
    
    // 获取复习历史统计
    const reviewHistoryResult = await db.collection('words')
      .aggregate()
      .match({
        userId: userId
      })
      .group({
        _id: '$status',
        count: _.sum(1),
        avgReviewCount: _.avg('$review.reviewCount'),
        avgLevel: _.avg('$level')
      })
      .end();
    
    return {
      todayReview: todayReviewResult.total,
      weeklyReview: weeklyReviewResult.list || [],
      reviewHistory: reviewHistoryResult.list || []
    };
  } catch (error) {
    console.error('❌ 获取复习统计失败:', error);
    throw error;
  }
}

/**
 * 提交复习结果
 */
async function submitReviewResult(userId, reviewData) {
  try {
    const { wordId, quality, reviewTime } = reviewData;
    
    if (!wordId || quality === undefined) {
      throw new Error('缺少必要参数');
    }
    
    // 验证复习质量范围
    if (quality < 0 || quality > 5) {
      throw new Error('复习质量必须在0-5之间');
    }
    
    // 获取生词信息
    const wordDoc = await db.collection('words')
      .where({
        _id: wordId,
        userId: userId
      })
      .get();
    
    if (wordDoc.data.length === 0) {
      throw new Error('生词不存在或无权访问');
    }
    
    const word = wordDoc.data[0];
    const reviewInfo = word.review || {};
    
    // 计算下次复习时间
    const now = reviewTime ? new Date(reviewTime) : new Date();
    const { interval, easeFactor } = calculateNextReview(
      reviewInfo.easeFactor || 2.5,
      reviewInfo.interval || 0,
      quality
    );
    
    // 计算下次复习时间
    const nextReview = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
    
    // 更新生词复习信息
    const updateData = {
      'review.nextReview': nextReview,
      'review.interval': interval,
      'review.easeFactor': easeFactor,
      'review.reviewCount': (reviewInfo.reviewCount || 0) + 1,
      'review.lastReview': now,
      updatedAt: db.serverDate()
    };
    
    // 根据复习质量更新掌握程度
    if (quality >= 4) {
      // 高质量回答，提升掌握程度
      updateData.level = Math.min(5, (word.level || 1) + 1);
      
      if (updateData.level >= 4) {
        updateData.status = 'mastered';
      }
    } else if (quality <= 1) {
      // 低质量回答，降低掌握程度
      updateData.level = Math.max(1, (word.level || 1) - 1);
      updateData.status = 'learning';
    }
    
    await db.collection('words').doc(wordId).update({
      data: updateData
    });
    
    // 创建复习记录
    const reviewId = 'review_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const reviewRecord = {
      _id: reviewId,
      userId: userId,
      wordId: wordId,
      word: word.word,
      quality: quality,
      interval: interval,
      easeFactor: easeFactor,
      nextReview: nextReview,
      reviewTime: now,
      createdAt: db.serverDate()
    };
    
    await db.collection('reviews').add({
      data: reviewRecord
    });
    
    console.log('✅ 复习结果提交成功:', wordId);
    
    return {
      wordId: wordId,
      nextReview: nextReview,
      interval: interval,
      easeFactor: easeFactor,
      level: updateData.level || word.level
    };
  } catch (error) {
    console.error('❌ 提交复习结果失败:', error);
    throw error;
  }
}

/**
 * 批量提交复习结果
 */
async function batchSubmitReviewResults(userId, reviewList) {
  try {
    if (!Array.isArray(reviewList) || reviewList.length === 0) {
      throw new Error('复习数据不能为空');
    }
    
    if (reviewList.length > 100) {
      throw new Error('一次最多提交100个复习结果');
    }
    
    const results = [];
    const errors = [];
    
    for (const reviewData of reviewList) {
      try {
        const result = await submitReviewResult(userId, reviewData);
        results.push(result);
      } catch (error) {
        errors.push({
          wordId: reviewData.wordId,
          error: error.message
        });
      }
    }
    
    return {
      success: results,
      failed: errors
    };
  } catch (error) {
    console.error('❌ 批量提交复习结果失败:', error);
    throw error;
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action, ...params } = event;
  
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
      case 'getToday':
        // 获取今日复习生词
        const todayWords = await getTodayReviewWords(userId, params.limit);
        return {
          code: 0,
          message: '获取今日复习生词成功',
          data: todayWords
        };
        
      case 'getStats':
        // 获取复习统计
        const stats = await getReviewStats(userId);
        return {
          code: 0,
          message: '获取复习统计成功',
          data: stats
        };
        
      case 'submit':
        // 提交单个复习结果
        if (!params.reviewData) {
          return {
            code: 400,
            message: '缺少复习数据',
            data: null
          };
        }
        
        const submitResult = await submitReviewResult(userId, params.reviewData);
        return {
          code: 0,
          message: '提交复习结果成功',
          data: submitResult
        };
        
      case 'batchSubmit':
        // 批量提交复习结果
        if (!params.reviewList || !Array.isArray(params.reviewList)) {
          return {
            code: 400,
            message: '缺少复习数据列表或格式不正确',
            data: null
          };
        }
        
        const batchResult = await batchSubmitReviewResults(userId, params.reviewList);
        return {
          code: 0,
          message: '批量提交复习结果完成',
          data: batchResult
        };
        
      default:
        // 默认获取今日复习生词
        const defaultWords = await getTodayReviewWords(userId);
        return {
          code: 0,
          message: '获取今日复习生词成功',
          data: defaultWords
        };
    }
  } catch (error) {
    console.error('❌ 复习云函数执行失败:', error);
    
    return {
      code: 500,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};