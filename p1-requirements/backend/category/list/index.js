/**
 * 获取分类列表云函数
 * 功能：获取用户的分类列表，支持分页和筛选
 */

const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});

const db = app.database();
const _ = db.command;

/**
 * 主函数 - 获取分类列表
 */
exports.main = async (event, context) => {
  console.log('📋 开始获取分类列表', event);
  
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
      page = 1,
      pageSize = 20,
      includeDeleted = false,
      sortBy = 'sortOrder',
      sortOrder = 'asc'
    } = event;
    
    // 3. 构建查询条件
    const query = {
      userId: userId
    };
    
    if (!includeDeleted) {
      query.isDeleted = false;
    }
    
    // 4. 构建排序条件
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // 5. 计算分页
    const skip = (page - 1) * pageSize;
    
    // 6. 执行查询
    const [categoriesResult, totalResult] = await Promise.all([
      // 获取分类列表
      db.collection('categories')
        .where(query)
        .orderBy(sortOptions)
        .skip(skip)
        .limit(pageSize)
        .get(),
      
      // 获取总数
      db.collection('categories')
        .where(query)
        .count()
    ]);
    
    const categories = categoriesResult.data;
    const total = totalResult.total;
    
    // 7. 格式化返回数据
    const formattedCategories = categories.map(category => ({
      id: category._id,
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      wordCount: category.wordCount || 0,
      sortOrder: category.sortOrder || 999,
      isDeleted: category.isDeleted || false,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    }));
    
    console.log(`✅ 获取到 ${formattedCategories.length} 个分类`);
    
    return {
      code: 0,
      message: '获取分类列表成功',
      data: {
        categories: formattedCategories,
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          total: total,
          totalPages: Math.ceil(total / pageSize)
        }
      }
    };
    
  } catch (error) {
    console.error('❌ 获取分类列表失败:', error);
    
    return {
      code: 500,
      message: '获取分类列表失败',
      data: null,
      error: error.message
    };
  }
};

/**
 * 获取分类统计信息
 */
async function getCategoryStats(categories) {
  try {
    const categoryIds = categories.map(cat => cat._id);
    
    if (categoryIds.length === 0) {
      return categories.map(cat => ({
        ...cat,
        stats: {
          totalWords: 0,
          masteredWords: 0,
          learningWords: 0,
          reviewWords: 0
        }
      }));
    }
    
    // 获取每个分类的生词统计
    const statsPromises = categoryIds.map(categoryId => 
      db.collection('words')
        .where({
          categoryIds: _.in([categoryId]),
          isDeleted: false
        })
        .count()
    );
    
    const statsResults = await Promise.all(statsPromises);
    
    // 合并统计信息
    return categories.map((category, index) => ({
      ...category,
      stats: {
        totalWords: statsResults[index].total || 0,
        masteredWords: 0, // 需要根据掌握程度计算
        learningWords: 0, // 需要根据学习状态计算
        reviewWords: 0    // 需要根据复习状态计算
      }
    }));
    
  } catch (error) {
    console.error('获取分类统计失败:', error);
    return categories;
  }
}