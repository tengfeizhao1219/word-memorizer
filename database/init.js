/**
 * 数据库初始化脚本
 * 用于创建集合和索引
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 创建用户集合
 */
async function createUsersCollection() {
  try {
    // 创建集合
    await db.createCollection('users');
    console.log('✅ 用户集合创建成功');
    
    // 创建索引
    await db.collection('users').createIndex({
      openid: 1
    }, {
      unique: true,
      name: 'openid_unique'
    });
    
    await db.collection('users').createIndex({
      email: 1
    }, {
      unique: true,
      sparse: true,
      name: 'email_unique'
    });
    
    await db.collection('users').createIndex({
      lastLoginAt: -1
    }, {
      name: 'last_login_desc'
    });
    
    console.log('✅ 用户集合索引创建成功');
  } catch (error) {
    console.error('❌ 创建用户集合失败:', error);
  }
}

/**
 * 创建生词集合
 */
async function createWordsCollection() {
  try {
    // 创建集合
    await db.createCollection('words');
    console.log('✅ 生词集合创建成功');
    
    // 创建索引
    await db.collection('words').createIndex({
      userId: 1,
      createdAt: -1
    }, {
      name: 'user_words_desc'
    });
    
    await db.collection('words').createIndex({
      userId: 1,
      word: 1
    }, {
      unique: true,
      name: 'user_word_unique'
    });
    
    await db.collection('words').createIndex({
      userId: 1,
      'review.nextReview': 1
    }, {
      name: 'next_review_asc'
    });
    
    await db.collection('words').createIndex({
      userId: 1,
      status: 1
    }, {
      name: 'user_status'
    });
    
    console.log('✅ 生词集合索引创建成功');
  } catch (error) {
    console.error('❌ 创建生词集合失败:', error);
  }
}

/**
 * 创建分类集合
 */
async function createCategoriesCollection() {
  try {
    // 创建集合
    await db.createCollection('categories');
    console.log('✅ 分类集合创建成功');
    
    // 创建索引
    await db.collection('categories').createIndex({
      userId: 1,
      name: 1
    }, {
      unique: true,
      name: 'user_category_unique'
    });
    
    console.log('✅ 分类集合索引创建成功');
  } catch (error) {
    console.error('❌ 创建分类集合失败:', error);
  }
}

/**
 * 创建复习记录集合
 */
async function createReviewsCollection() {
  try {
    // 创建集合
    await db.createCollection('reviews');
    console.log('✅ 复习记录集合创建成功');
    
    // 创建索引
    await db.collection('reviews').createIndex({
      userId: 1,
      wordId: 1,
      createdAt: -1
    }, {
      name: 'user_word_reviews_desc'
    });
    
    await db.collection('reviews').createIndex({
      userId: 1,
      createdAt: -1
    }, {
      name: 'user_reviews_desc'
    });
    
    console.log('✅ 复习记录集合索引创建成功');
  } catch (error) {
    console.error('❌ 创建复习记录集合失败:', error);
  }
}

/**
 * 创建同步日志集合
 */
async function createSyncLogsCollection() {
  try {
    // 创建集合
    await db.createCollection('sync_logs');
    console.log('✅ 同步日志集合创建成功');
    
    // 创建索引
    await db.collection('sync_logs').createIndex({
      userId: 1,
      createdAt: -1
    }, {
      name: 'user_sync_logs_desc'
    });
    
    console.log('✅ 同步日志集合索引创建成功');
  } catch (error) {
    console.error('❌ 创建同步日志集合失败:', error);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始初始化数据库...');
  
  try {
    // 创建所有集合
    await createUsersCollection();
    await createWordsCollection();
    await createCategoriesCollection();
    await createReviewsCollection();
    await createSyncLogsCollection();
    
    console.log('🎉 数据库初始化完成！');
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
  }
}

// 执行初始化
if (require.main === module) {
  main();
}

module.exports = {
  main
};