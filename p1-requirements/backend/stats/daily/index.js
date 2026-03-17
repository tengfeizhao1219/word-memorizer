/**
 * 每日学习统计云函数
 * 功能：生成用户每日学习统计数据
 */

const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});

const db = app.database();
const _ = db.command;

/**
 * 主函数 - 获取每日统计
 */
exports.main = async (event, context) => {
  console.log('📊 开始生成每日学习统计', event);
  
  try {
    // 1. 获取用户ID
    const { OPENID: userId } = cloud.getWXContext();
    
    if (!userId) {
      return {
        code: 401,
        message: '用户未登录',
        data: null
      };
    }
    
    // 2. 解析参数
    const { date = new Date().toISOString().split('T')[0] } = event;
    
    // 3. 获取或生成当日统计
    const dailyStats = await getOrCreateDailyStats(userId, date);
    
    // 4. 获取累计统计
    const cumulativeStats = await getCumulativeStats(userId);
    
    // 5. 获取分类统计
    const categoryStats = await getCategoryStats(userId);
    
    // 6. 获取学习趋势
    const learningTrend = await getLearningTrend(userId, 7); // 最近7天
    
    console.log('✅ 每日统计生成完成');
    
    return {
      code: 0,
      message: '获取每日统计成功',
      data: {
        date: date,
        daily: dailyStats,
        cumulative: cumulativeStats,
        categories: categoryStats,
        trend: learningTrend,
        suggestions: generateLearningSuggestions(dailyStats, cumulativeStats)
      }
    };
    
  } catch (error) {
    console.error('❌ 生成每日统计失败:', error);
    
    return {
      code: 500,
      message: '生成每日统计失败',
      data: null,
      error: error.message
    };
  }
};

/**
 * 获取或创建当日统计
 */
async function getOrCreateDailyStats(userId, date) {
  try {
    // 查找当日统计
    const existingStats = await db.collection('learning_stats')
      .where({
        userId: userId,
        date: date
      })
      .get();
    
    if (existingStats.data.length > 0) {
      return existingStats.data[0];
    }
    
    // 创建新的当日统计
    const today = new Date(date);
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    // 统计当日数据
    const [newWordsCount, reviewWordsCount, studyTime] = await Promise.all([
      // 当日新增生词数
      db.collection('words')
        .where({
          userId: userId,
          createdAt: _.gte(startOfDay).and(_.lte(endOfDay)),
          isDeleted: false
        })
        .count(),
      
      // 当日复习生词数
      db.collection('words')
        .where({
          userId: userId,
          lastReviewedAt: _.gte(startOfDay).and(_.lte(endOfDay)),
          isDeleted: false
        })
        .count(),
      
      // 估算学习时间（假设每个生词学习2分钟，每个复习1分钟）
      Promise.resolve((newWordsCount.total * 2 + reviewWordsCount.total * 1) || 0)
    ]);
    
    // 计算正确率（需要复习记录数据）
    const accuracy = await calculateDailyAccuracy(userId, startOfDay, endOfDay);
    
    // 创建统计记录
    const dailyStats = {
      userId: userId,
      date: date,
      newWords: newWordsCount.total || 0,
      reviewWords: reviewWordsCount.total || 0,
      studyTime: studyTime, // 分钟
      accuracy: accuracy,
      streakDays: await calculateStreakDays(userId, date),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await db.collection('learning_stats').add(dailyStats);
    dailyStats._id = result.id;
    
    return dailyStats;
    
  } catch (error) {
    console.error('获取或创建当日统计失败:', error);
    throw error;
  }
}

/**
 * 计算当日复习正确率
 */
async function calculateDailyAccuracy(userId, startTime, endTime) {
  try {
    // 这里需要复习记录数据，暂时返回默认值
    // 实际实现中应该查询review_records集合
    return 0.85; // 默认85%正确率
    
  } catch (error) {
    console.error('计算正确率失败:', error);
    return 0;
  }
}

/**
 * 计算连续学习天数
 */
async function calculateStreakDays(userId, currentDate) {
  try {
    let streak = 0;
    let checkDate = new Date(currentDate);
    
    while (streak < 365) { // 最多检查一年
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const stats = await db.collection('learning_stats')
        .where({
          userId: userId,
          date: dateStr
        })
        .get();
      
      if (stats.data.length === 0 || 
          (stats.data[0].newWords === 0 && stats.data[0].reviewWords === 0)) {
        break; // 当天没有学习记录
      }
      
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // 检查前一天
    }
    
    return streak;
    
  } catch (error) {
    console.error('计算连续学习天数失败:', error);
    return 0;
  }
}

/**
 * 获取累计统计
 */
async function getCumulativeStats(userId) {
  try {
    const stats = await db.collection('learning_stats')
      .where({
        userId: userId
      })
      .get();
    
    const allStats = stats.data;
    
    if (allStats.length === 0) {
      return {
        totalDays: 0,
        totalWords: 0,
        totalStudyTime: 0,
        avgAccuracy: 0,
        maxStreak: 0,
        currentStreak: 0
      };
    }
    
    // 计算累计数据
    const cumulative = {
      totalDays: allStats.length,
      totalWords: allStats.reduce((sum, stat) => sum + stat.newWords, 0),
      totalStudyTime: allStats.reduce((sum, stat) => sum + stat.studyTime, 0),
      avgAccuracy: allStats.reduce((sum, stat) => sum + stat.accuracy, 0) / allStats.length,
      maxStreak: Math.max(...allStats.map(stat => stat.streakDays || 0)),
      currentStreak: allStats[allStats.length - 1].streakDays || 0
    };
    
    return cumulative;
    
  } catch (error) {
    console.error('获取累计统计失败:', error);
    throw error;
  }
}

/**
 * 获取分类统计
 */
async function getCategoryStats(userId) {
  try {
    // 获取所有分类
    const categories = await db.collection('categories')
      .where({
        userId: userId,
        isDeleted: false
      })
      .get();
    
    // 获取每个分类的生词统计
    const categoryStatsPromises = categories.data.map(async category => {
      const wordCount = await db.collection('words')
        .where({
          userId: userId,
          categoryIds: _.in([category._id]),
          isDeleted: false
        })
        .count();
      
      return {
        id: category._id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        wordCount: wordCount.total || 0,
        // 这里可以添加更多统计信息，如掌握程度等
      };
    });
    
    const categoryStats = await Promise.all(categoryStatsPromises);
    
    // 按生词数量排序
    return categoryStats.sort((a, b) => b.wordCount - a.wordCount);
    
  } catch (error) {
    console.error('获取分类统计失败:', error);
    return [];
  }
}

/**
 * 获取学习趋势
 */
async function getLearningTrend(userId, days) {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    
    const stats = await db.collection('learning_stats')
      .where({
        userId: userId,
        date: _.gte(startDate.toISOString().split('T')[0])
      })
      .orderBy('date', 'asc')
      .get();
    
    // 生成日期范围
    const dateRange = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dateRange.unshift(date.toISOString().split('T')[0]);
    }
    
    // 构建趋势数据
    const trend = dateRange.map(date => {
      const stat = stats.data.find(s => s.date === date);
      return {
        date: date,
        newWords: stat ? stat.newWords : 0,
        reviewWords: stat ? stat.reviewWords : 0,
        studyTime: stat ? stat.studyTime : 0,
        accuracy: stat ? stat.accuracy : 0
      };
    });
    
    return trend;
    
  } catch (error) {
    console.error('获取学习趋势失败:', error);
    return [];
  }
}

/**
 * 生成学习建议
 */
function generateLearningSuggestions(dailyStats, cumulativeStats) {
  const suggestions = [];
  
  // 基于当日数据生成建议
  if (dailyStats.newWords === 0 && dailyStats.reviewWords === 0) {
    suggestions.push({
      type: 'motivation',
      title: '今天还没开始学习哦',
      message: '每天坚持学习，积少成多！建议今天至少学习5个新单词。',
      priority: 'high'
    });
  } else if (dailyStats.newWords < 5) {
    suggestions.push({
      type: 'goal',
      title: '可以增加学习量',
      message: `今天学习了 ${dailyStats.newWords} 个新单词，建议目标每天学习10-20个新单词。`,
      priority: 'medium'
    });
  }
  
  if (dailyStats.accuracy < 0.7) {
    suggestions.push({
      type: 'review',
      title: '复习正确率较低',
      message: `今日复习正确率为 ${(dailyStats.accuracy * 100).toFixed(1)}%，建议加强薄弱环节的复习。`,
      priority: 'high'
    });
  }
  
  // 基于累计数据生成建议
  if (cumulativeStats.currentStreak >= 7) {
    suggestions.push({
      type: 'achievement',
      title: '连续学习成就',
      message: `太棒了！你已经连续学习了 ${cumulativeStats.currentStreak} 天，继续保持！`,
      priority: 'low'
    });
  }
  
  if (cumulativeStats.avgAccuracy > 0.9) {
    suggestions.push({
      type: 'progress',
      title: '学习效果优秀',
      message: `平均正确率 ${(cumulativeStats.avgAccuracy * 100).toFixed(1)}%，学习效果很好！`,
      priority: 'low'
    });
  }
  
  // 确保至少有一条建议
  if (suggestions.length === 0) {
    suggestions.push({
      type: 'general',
      title: '保持良好学习习惯',
      message: '学习进度良好，继续保持每天的学习习惯。',
      priority: 'low'
    });
  }
  
  return suggestions;
}