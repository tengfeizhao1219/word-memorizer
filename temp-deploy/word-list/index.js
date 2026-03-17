/**
 * 生词列表查询云函数
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 获取生词列表
 */
async function getWordList(userId, options = {}) {
  try {
    const {
      page = 1,
      pageSize = 20,
      status,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    // 构建查询条件
    let query = db.collection('words').where({
      userId: userId
    });
    
    // 状态筛选
    if (status && status !== 'all') {
      query = query.where({
        status: status
      });
    }
    
    // 分类筛选
    if (category) {
      query = query.where({
        categories: _.in([category])
      });
    }
    
    // 搜索筛选
    if (search && search.trim() !== '') {
      const searchTerm = search.trim().toLowerCase();
      query = query.where(_.or([
        {
          word: db.RegExp({
            regexp: searchTerm,
            options: 'i'
          })
        },
        {
          'definitions.meaning': db.RegExp({
            regexp: searchTerm,
            options: 'i'
          })
        },
        {
          notes: db.RegExp({
            regexp: searchTerm,
            options: 'i'
          })
        }
      ]));
    }
    
    // 计算总数
    const countResult = await query.count();
    const total = countResult.total;
    
    // 计算分页
    const skip = (page - 1) * pageSize;
    
    // 排序
    let orderByField = sortBy;
    let orderByDirection = sortOrder === 'asc' ? 'asc' : 'desc';
    
    // 特殊排序处理
    if (sortBy === 'nextReview') {
      orderByField = 'review.nextReview';
    }
    
    // 获取数据
    const dataResult = await query
      .orderBy(orderByField, orderByDirection)
      .skip(skip)
      .limit(pageSize)
      .get();
    
    return {
      list: dataResult.data,
      pagination: {
        page: page,
        pageSize: pageSize,
        total: total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  } catch (error) {
    console.error('❌ 获取生词列表失败:', error);
    throw error;
  }
}

/**
 * 获取今日需要复习的生词
 */
async function getTodayReviewWords(userId, limit = 50) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
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
 * 获取生词统计
 */
async function getWordStats(userId) {
  try {
    // 获取各种状态的生词数量
    const [totalResult, learningResult, masteredResult, reviewResult] = await Promise.all([
      db.collection('words').where({ userId: userId }).count(),
      db.collection('words').where({ 
        userId: userId,
        status: 'learning'
      }).count(),
      db.collection('words').where({ 
        userId: userId,
        status: 'mastered'
      }).count(),
      db.collection('words').where({ 
        userId: userId,
        'review.nextReview': _.lte(new Date())
      }).count()
    ]);
    
    // 获取分类统计
    const categoriesResult = await db.collection('words')
      .aggregate()
      .match({
        userId: userId
      })
      .unwind('$categories')
      .group({
        _id: '$categories',
        count: _.sum(1)
      })
      .sort({
        count: -1
      })
      .limit(10)
      .end();
    
    return {
      total: totalResult.total,
      learning: learningResult.total,
      mastered: masteredResult.total,
      todayReview: reviewResult.total,
      categories: categoriesResult.list || []
    };
  } catch (error) {
    console.error('❌ 获取生词统计失败:', error);
    throw error;
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action, ...options } = event;
  
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
      case 'list':
        // 获取生词列表
        const wordList = await getWordList(userId, options);
        return {
          code: 0,
          message: '获取生词列表成功',
          data: wordList
        };
        
      case 'todayReview':
        // 获取今日复习生词
        const todayWords = await getTodayReviewWords(userId, options.limit);
        return {
          code: 0,
          message: '获取今日复习生词成功',
          data: todayWords
        };
        
      case 'stats':
        // 获取生词统计
        const stats = await getWordStats(userId);
        return {
          code: 0,
          message: '获取生词统计成功',
          data: stats
        };
        
      default:
        // 默认返回生词列表
        const defaultList = await getWordList(userId, options);
        return {
          code: 0,
          message: '获取生词列表成功',
          data: defaultList
        };
    }
  } catch (error) {
    console.error('❌ 生词列表云函数执行失败:', error);
    
    return {
      code: 500,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};