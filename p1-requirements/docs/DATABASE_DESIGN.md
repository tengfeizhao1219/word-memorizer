/**
 * P1需求数据库初始化脚本
 * 创建分类管理、搜索功能、学习统计所需的数据库集合和索引
 */

const cloud = require('@cloudbase/node-sdk');

// 云开发环境配置
const app = cloud.init({
  env: process.env.TCB_ENV || 'tengfei-workstation-7czc7ab13ca3'
});

const db = app.database();

async function initDatabase() {
  console.log('🚀 开始初始化P1需求数据库...');
  
  try {
    // 1. 创建categories集合
    await initCategoriesCollection();
    
    // 2. 更新words集合
    await updateWordsCollection();
    
    // 3. 创建search_history集合
    await initSearchHistoryCollection();
    
    // 4. 创建learning_stats集合
    await initLearningStatsCollection();
    
    // 5. 创建全文搜索索引
    await createFullTextIndex();
    
    console.log('✅ P1需求数据库初始化完成！');
    
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    process.exit(1);
  }
}

/**
 * 创建categories集合
 */
async function initCategoriesCollection() {
  console.log('📁 创建categories集合...');
  
  const collectionName = 'categories';
  
  try {
    // 检查集合是否存在
    const collections = await db.listCollections();
    const exists = collections.some(col => col.name === collectionName);
    
    if (!exists) {
      // 创建集合
      await db.createCollection(collectionName);
      console.log(`✅ 创建 ${collectionName} 集合成功`);
    } else {
      console.log(`ℹ️ ${collectionName} 集合已存在`);
    }
    
    // 创建索引
    await db.collection(collectionName).createIndex({
      userId: 1
    }, { name: 'idx_userId' });
    
    await db.collection(collectionName).createIndex({
      userId: 1,
      name: 1
    }, { 
      name: 'idx_userId_name',
      unique: true 
    });
    
    await db.collection(collectionName).createIndex({
      userId: 1,
      isDeleted: 1,
      sortOrder: 1
    }, { name: 'idx_userId_deleted_order' });
    
    console.log(`✅ ${collectionName} 集合索引创建完成`);
    
  } catch (error) {
    console.error(`❌ 初始化 ${collectionName} 集合失败:`, error);
    throw error;
  }
}

/**
 * 更新words集合
 */
async function updateWordsCollection() {
  console.log('📝 更新words集合...');
  
  const collectionName = 'words';
  
  try {
    // 检查集合是否存在
    const collections = await db.listCollections();
    const exists = collections.some(col => col.name === collectionName);
    
    if (!exists) {
      console.error(`❌ ${collectionName} 集合不存在，请先初始化基础数据库`);
      throw new Error('Words collection not found');
    }
    
    // 为现有文档添加新字段的默认值
    const updateResult = await db.collection(collectionName)
      .where({
        categoryIds: db.command.exists(false)
      })
      .update({
        categoryIds: [],
        difficulty: 'beginner',
        masteryLevel: 0,
        lastReviewedAt: null,
        reviewCount: 0,
        searchKeywords: []
      });
    
    console.log(`✅ 更新 ${updateResult.updated} 个文档添加新字段`);
    
    // 创建新索引
    await db.collection(collectionName).createIndex({
      categoryIds: 1
    }, { name: 'idx_categoryIds' });
    
    await db.collection(collectionName).createIndex({
      difficulty: 1
    }, { name: 'idx_difficulty' });
    
    await db.collection(collectionName).createIndex({
      masteryLevel: -1
    }, { name: 'idx_masteryLevel' });
    
    await db.collection(collectionName).createIndex({
      lastReviewedAt: -1
    }, { name: 'idx_lastReviewedAt' });
    
    console.log(`✅ ${collectionName} 集合更新完成`);
    
  } catch (error) {
    console.error(`❌ 更新 ${collectionName} 集合失败:`, error);
    throw error;
  }
}

/**
 * 创建search_history集合
 */
async function initSearchHistoryCollection() {
  console.log('🔍 创建search_history集合...');
  
  const collectionName = 'search_history';
  
  try {
    // 检查集合是否存在
    const collections = await db.listCollections();
    const exists = collections.some(col => col.name === collectionName);
    
    if (!exists) {
      // 创建集合
      await db.createCollection(collectionName);
      console.log(`✅ 创建 ${collectionName} 集合成功`);
    } else {
      console.log(`ℹ️ ${collectionName} 集合已存在`);
    }
    
    // 创建索引
    await db.collection(collectionName).createIndex({
      userId: 1,
      createdAt: -1
    }, { name: 'idx_userId_createdAt' });
    
    await db.collection(collectionName).createIndex({
      userId: 1,
      query: 1
    }, { name: 'idx_userId_query' });
    
    // 设置TTL索引，自动删除30天前的搜索记录
    await db.collection(collectionName).createIndex({
      createdAt: 1
    }, { 
      name: 'idx_createdAt_ttl',
      expireAfterSeconds: 30 * 24 * 60 * 60 // 30天
    });
    
    console.log(`✅ ${collectionName} 集合索引创建完成`);
    
  } catch (error) {
    console.error(`❌ 初始化 ${collectionName} 集合失败:`, error);
    throw error;
  }
}

/**
 * 创建learning_stats集合
 */
async function initLearningStatsCollection() {
  console.log('📊 创建learning_stats集合...');
  
  const collectionName = 'learning_stats';
  
  try {
    // 检查集合是否存在
    const collections = await db.listCollections();
    const exists = collections.some(col => col.name === collectionName);
    
    if (!exists) {
      // 创建集合
      await db.createCollection(collectionName);
      console.log(`✅ 创建 ${collectionName} 集合成功`);
    } else {
      console.log(`ℹ️ ${collectionName} 集合已存在`);
    }
    
    // 创建索引
    await db.collection(collectionName).createIndex({
      userId: 1,
      date: -1
    }, { 
      name: 'idx_userId_date',
      unique: true  // 每个用户每天只能有一条统计记录
    });
    
    await db.collection(collectionName).createIndex({
      userId: 1,
      'cumulative.streakDays': -1
    }, { name: 'idx_userId_streakDays' });
    
    console.log(`✅ ${collectionName} 集合索引创建完成`);
    
  } catch (error) {
    console.error(`❌ 初始化 ${collectionName} 集合失败:`, error);
    throw error;
  }
}

/**
 * 创建全文搜索索引
 */
async function createFullTextIndex() {
  console.log('🔎 创建全文搜索索引...');
  
  try {
    // 创建words集合的全文搜索索引
    await db.createCollectionIndex('words', {
      name: 'idx_fulltext_search',
      definition: {
        mappings: {
          dynamic: false,
          fields: {
            word: {
              type: 'string',
              analyzer: 'lucene.standard',
              searchAnalyzer: 'lucene.standard'
            },
            meaning: {
              type: 'string',
              analyzer: 'lucene.standard',
              searchAnalyzer: 'lucene.standard'
            },
            example: {
              type: 'string',
              analyzer: 'lucene.standard',
              searchAnalyzer: 'lucene.standard'
            },
            notes: {
              type: 'string',
              analyzer: 'lucene.standard',
              searchAnalyzer: 'lucene.standard'
            },
            searchKeywords: {
              type: 'string',
              analyzer: 'lucene.standard',
              searchAnalyzer: 'lucene.standard'
            }
          }
        }
      }
    });
    
    console.log('✅ 全文搜索索引创建完成');
    
  } catch (error) {
    console.error('❌ 创建全文搜索索引失败:', error);
    // 全文搜索索引可能在某些环境下不支持，不影响主要功能
    console.log('ℹ️ 全文搜索索引创建失败，将使用普通文本搜索');
  }
}

/**
 * 初始化默认分类
 */
async function initDefaultCategories(userId) {
  console.log('🏷️ 初始化默认分类...');
  
  const defaultCategories = [
    {
      name: '日常用语',
      description: '日常生活中常用的英语表达',
      color: '#4CAF50',
      icon: 'home',
      sortOrder: 1
    },
    {
      name: '工作商务',
      description: '工作场景和商务交流用语',
      color: '#2196F3',
      icon: 'briefcase',
      sortOrder: 2
    },
    {
      name: '旅行交通',
      description: '旅行和交通相关的英语词汇',
      color: '#FF9800',
      icon: 'airplane',
      sortOrder: 3
    },
    {
      name: '餐饮美食',
      description: '餐厅点餐和美食相关的词汇',
      color: '#E91E63',
      icon: 'restaurant',
      sortOrder: 4
    },
    {
      name: '学术专业',
      description: '学术研究和专业领域的词汇',
      color: '#9C27B0',
      icon: 'graduation-cap',
      sortOrder: 5
    }
  ];
  
  try {
    const categoriesCollection = db.collection('categories');
    
    for (const category of defaultCategories) {
      // 检查是否已存在
      const existing = await categoriesCollection
        .where({
          userId: userId,
          name: category.name,
          isDeleted: false
        })
        .get();
      
      if (existing.data.length === 0) {
        // 创建默认分类
        await categoriesCollection.add({
          ...category,
          userId: userId,
          wordCount: 0,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        console.log(`✅ 创建默认分类: ${category.name}`);
      }
    }
    
    console.log('✅ 默认分类初始化完成');
    
  } catch (error) {
    console.error('❌ 初始化默认分类失败:', error);
  }
}

// 执行初始化
if (require.main === module) {
  initDatabase().then(() => {
    console.log('\n🎉 P1需求数据库初始化脚本执行完成！');
    console.log('\n📋 初始化总结:');
    console.log('   ✅ categories 集合 - 分类管理');
    console.log('   ✅ words 集合更新 - 添加分类和搜索字段');
    console.log('   ✅ search_history 集合 - 搜索历史记录');
    console.log('   ✅ learning_stats 集合 - 学习统计数据');
    console.log('   ✅ 全文搜索索引 - 增强搜索功能');
    console.log('\n🚀 下一步: 部署云函数和前端页面');
  }).catch(error => {
    console.error('❌ 初始化失败:', error);
    process.exit(1);
  });
}

module.exports = {
  initDatabase,
  initDefaultCategories
};