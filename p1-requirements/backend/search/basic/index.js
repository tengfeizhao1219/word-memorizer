/**
 * 基础搜索云函数
 * 功能：提供关键词搜索功能
 */

const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});

const db = app.database();
const _ = db.command;

/**
 * 主函数 - 基础搜索
 */
exports.main = async (event, context) => {
  console.log('🔍 开始基础搜索', event);
  
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
    const {
      query,
      page = 1,
      pageSize = 20,
      searchFields = ['word', 'meaning', 'example', 'notes']
    } = event;
    
    if (!query || query.trim().length === 0) {
      return {
        code: 400,
        message: '搜索关键词不能为空',
        data: null
      };
    }
    
    const searchQuery = query.trim();
    
    // 3. 保存搜索历史
    await saveSearchHistory(userId, searchQuery);
    
    // 4. 构建搜索条件
    const searchConditions = buildSearchConditions(userId, searchQuery, searchFields);
    
    // 5. 计算分页
    const skip = (page - 1) * pageSize;
    
    // 6. 执行搜索
    const [searchResult, totalResult] = await Promise.all([
      // 搜索生词
      db.collection('words')
        .where(searchConditions)
        .orderBy('createdAt', 'desc')
        .skip(skip)
        .limit(pageSize)
        .get(),
      
      // 获取总数
      db.collection('words')
        .where(searchConditions)
        .count()
    ]);
    
    const words = searchResult.data;
    const total = totalResult.total;
    
    // 7. 高亮搜索结果
    const highlightedWords = highlightSearchResults(words, searchQuery, searchFields);
    
    console.log(`✅ 搜索完成，找到 ${total} 个结果`);
    
    return {
      code: 0,
      message: '搜索成功',
      data: {
        query: searchQuery,
        results: highlightedWords,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    };
    
  } catch (error) {
    console.error('❌ 搜索失败:', error);
    
    return {
      code: 500,
      message: '搜索失败',
      data: null,
      error: error.message
    };
  }
};

/**
 * 构建搜索条件
 */
function buildSearchConditions(userId, query, searchFields) {
  const conditions = {
    userId: userId,
    isDeleted: false
  };
  
  // 如果支持全文搜索，使用全文搜索索引
  if (searchFields.includes('fulltext')) {
    return {
      ...conditions,
      $text: {
        $search: query
      }
    };
  }
  
  // 普通文本搜索
  const orConditions = searchFields.map(field => {
    const fieldCondition = {};
    fieldCondition[field] = db.command.regex({
      regex: query,
      options: 'i' // 不区分大小写
    });
    return fieldCondition;
  });
  
  return {
    ...conditions,
    $or: orConditions
  };
}

/**
 * 高亮搜索结果
 */
function highlightSearchResults(words, query, searchFields) {
  const highlightRegex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  
  return words.map(word => {
    const highlightedWord = { ...word };
    
    // 高亮匹配的字段
    searchFields.forEach(field => {
      if (word[field] && typeof word[field] === 'string') {
        highlightedWord[`${field}Highlighted`] = word[field].replace(
          highlightRegex,
          '<mark>$1</mark>'
        );
      }
    });
    
    // 计算匹配度分数
    highlightedWord.matchScore = calculateMatchScore(word, query, searchFields);
    
    return highlightedWord;
  });
}

/**
 * 计算匹配度分数
 */
function calculateMatchScore(word, query, searchFields) {
  let score = 0;
  const queryLower = query.toLowerCase();
  
  searchFields.forEach(field => {
    if (word[field] && typeof word[field] === 'string') {
      const fieldValue = word[field].toLowerCase();
      
      if (fieldValue === queryLower) {
        score += 10; // 完全匹配
      } else if (fieldValue.startsWith(queryLower)) {
        score += 5;  // 前缀匹配
      } else if (fieldValue.includes(queryLower)) {
        score += 3;  // 包含匹配
      } else if (fieldValue.replace(/[^a-zA-Z]/g, '').includes(queryLower)) {
        score += 2;  // 去除特殊字符后匹配
      }
    }
  });
  
  return score;
}

/**
 * 保存搜索历史
 */
async function saveSearchHistory(userId, query) {
  try {
    // 检查是否已有相同的搜索记录
    const existingHistory = await db.collection('search_history')
      .where({
        userId: userId,
        query: query
      })
      .get();
    
    if (existingHistory.data.length === 0) {
      // 保存新的搜索记录
      await db.collection('search_history').add({
        userId: userId,
        query: query,
        searchCount: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } else {
      // 更新搜索次数
      const historyId = existingHistory.data[0]._id;
      await db.collection('search_history').doc(historyId).update({
        searchCount: _.inc(1),
        updatedAt: new Date()
      });
    }
    
  } catch (error) {
    console.error('保存搜索历史失败:', error);
    // 不阻止主要搜索功能
  }
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}