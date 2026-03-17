/**
 * 生词搜索云函数
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

/**
 * 搜索生词
 */
async function searchWords(userId, options = {}) {
  try {
    const {
      keyword = '',
      category = '',
      status = '',
      difficulty = '',
      page = 1,
      pageSize = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = options;
    
    // 构建查询条件
    let query = db.collection('words').where({
      userId: userId
    });
    
    // 关键词搜索
    if (keyword && keyword.trim() !== '') {
      const searchTerm = keyword.trim().toLowerCase();
      
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
        },
        {
          'definitions.examples.en': db.RegExp({
            regexp: searchTerm,
            options: 'i'
          })
        },
        {
          'definitions.examples.zh': db.RegExp({
            regexp: searchTerm,
            options: 'i'
          })
        }
      ]));
    }
    
    // 分类筛选
    if (category) {
      query = query.where({
        categories: _.in([category])
      });
    }
    
    // 状态筛选
    if (status && status !== 'all') {
      query = query.where({
        status: status
      });
    }
    
    // 难度筛选
    if (difficulty && difficulty !== 'all') {
      query = query.where({
        difficulty: difficulty
      });
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
    } else if (sortBy === 'word') {
      orderByField = 'word';
    } else if (sortBy === 'level') {
      orderByField = 'level';
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
      },
      searchInfo: {
        keyword: keyword,
        category: category,
        status: status,
        difficulty: difficulty
      }
    };
  } catch (error) {
    console.error('❌ 搜索生词失败:', error);
    throw error;
  }
}

/**
 * 获取搜索建议
 */
async function getSearchSuggestions(userId, keyword) {
  try {
    if (!keyword || keyword.trim() === '') {
      return [];
    }
    
    const searchTerm = keyword.trim().toLowerCase();
    
    // 搜索匹配的单词
    const wordResult = await db.collection('words')
      .where({
        userId: userId,
        word: db.RegExp({
          regexp: `^${searchTerm}`,
          options: 'i'
        })
      })
      .field({
        word: true,
        _id: true
      })
      .limit(10)
      .get();
    
    // 搜索匹配的释义
    const meaningResult = await db.collection('words')
      .where({
        userId: userId,
        'definitions.meaning': db.RegExp({
          regexp: searchTerm,
          options: 'i'
        })
      })
      .field({
        word: true,
        'definitions.meaning': true,
        _id: true
      })
      .limit(10)
      .get();
    
    // 合并结果
    const suggestions = new Set();
    
    // 添加单词建议
    wordResult.data.forEach(item => {
      suggestions.add(item.word);
    });
    
    // 添加释义相关的单词建议
    meaningResult.data.forEach(item => {
      suggestions.add(item.word);
    });
    
    return Array.from(suggestions).slice(0, 10);
  } catch (error) {
    console.error('❌ 获取搜索建议失败:', error);
    return [];
  }
}

/**
 * 获取高级筛选选项
 */
async function getFilterOptions(userId) {
  try {
    // 获取所有分类
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
      .limit(20)
      .end();
    
    // 获取状态统计
    const statusResult = await db.collection('words')
      .aggregate()
      .match({
        userId: userId
      })
      .group({
        _id: '$status',
        count: _.sum(1)
      })
      .end();
    
    // 获取难度统计
    const difficultyResult = await db.collection('words')
      .aggregate()
      .match({
        userId: userId
      })
      .group({
        _id: '$difficulty',
        count: _.sum(1)
      })
      .end();
    
    return {
      categories: categoriesResult.list || [],
      status: statusResult.list || [],
      difficulty: difficultyResult.list || []
    };
  } catch (error) {
    console.error('❌ 获取筛选选项失败:', error);
    return {
      categories: [],
      status: [],
      difficulty: []
    };
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
      case 'search':
        // 搜索生词
        const searchResult = await searchWords(userId, options);
        return {
          code: 0,
          message: '搜索成功',
          data: searchResult
        };
        
      case 'suggestions':
        // 获取搜索建议
        if (!options.keyword) {
          return {
            code: 400,
            message: '缺少关键词',
            data: null
          };
        }
        
        const suggestions = await getSearchSuggestions(userId, options.keyword);
        return {
          code: 0,
          message: '获取搜索建议成功',
          data: suggestions
        };
        
      case 'filterOptions':
        // 获取筛选选项
        const filterOptions = await getFilterOptions(userId);
        return {
          code: 0,
          message: '获取筛选选项成功',
          data: filterOptions
        };
        
      default:
        // 默认执行搜索
        const defaultResult = await searchWords(userId, options);
        return {
          code: 0,
          message: '搜索成功',
          data: defaultResult
        };
    }
  } catch (error) {
    console.error('❌ 搜索云函数执行失败:', error);
    
    return {
      code: 500,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};