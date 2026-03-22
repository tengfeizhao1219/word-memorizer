// 初始化数据库集合云函数
const cloud = require('wx-server-sdk');

// 直接初始化（跳过环境变量）
cloud.init({
  env: 'cloud1-1g9313w0bb791de0',
  traceUser: true
});

const db = cloud.database();

// 需要创建的集合配置
const collections = [
  {
    name: 'users',
    description: '用户表',
    // 权限配置：所有用户可读，仅创建者可写
    permissions: {
      read: true,  // 所有用户可读
      write: false // 仅创建者可写
    },
    // 索引配置
    indexes: [
      { key: { openid: 1 }, unique: true, name: 'openid_index' },
      { key: { created_at: -1 }, name: 'created_at_index' }
    ]
  },
  {
    name: 'words',
    description: '单词表',
    permissions: {
      read: true,
      write: false
    },
    indexes: [
      { key: { user_id: 1, word: 1 }, unique: true, name: 'user_word_index' },
      { key: { user_id: 1, next_review: 1 }, name: 'review_index' },
      { key: { difficulty: 1 }, name: 'difficulty_index' }
    ]
  },
  {
    name: 'translation_history',
    description: '翻译历史表',
    permissions: {
      read: true,
      write: false
    },
    indexes: [
      { key: { user_id: 1, timestamp: -1 }, name: 'user_history_index' },
      { key: { source_text: 1 }, name: 'source_text_index' }
    ]
  }
];

// 主函数
exports.main = async (event, context) => {
  const { action = 'check' } = event;
  
  console.log(`🚀 数据库初始化函数 - 动作: ${action}`);
  console.log(`环境ID: cloud1-1g9313w0bb791de0`);
  
  try {
    if (action === 'create') {
      return await createCollections();
    } else if (action === 'check') {
      return await checkCollections();
    } else if (action === 'clean') {
      return await cleanCollections();
    } else {
      return {
        success: false,
        error: `未知动作: ${action}`,
        supportedActions: ['create', 'check', 'clean']
      };
    }
  } catch (error) {
    console.error('❌ 数据库初始化错误:', error);
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
};

// 检查集合是否存在
async function checkCollections() {
  console.log('🔍 检查数据库集合状态...');
  
  const results = [];
  
  for (const collection of collections) {
    try {
      // 尝试访问集合
      const result = await db.collection(collection.name).count();
      
      results.push({
        name: collection.name,
        description: collection.description,
        exists: true,
        count: result.total,
        status: '✅ 已存在'
      });
      
      console.log(`   ✅ ${collection.name}: 存在 (${result.total} 条记录)`);
    } catch (error) {
      if (error.errCode === 'DATABASE_COLLECTION_NOT_EXIST' || 
          error.message.includes('collection not exist')) {
        results.push({
          name: collection.name,
          description: collection.description,
          exists: false,
          count: 0,
          status: '❌ 不存在'
        });
        
        console.log(`   ❌ ${collection.name}: 不存在`);
      } else {
        results.push({
          name: collection.name,
          description: collection.description,
          exists: false,
          count: 0,
          status: `⚠️  检查错误: ${error.message}`
        });
        
        console.log(`   ⚠️  ${collection.name}: 检查错误 - ${error.message}`);
      }
    }
  }
  
  return {
    success: true,
    action: 'check',
    timestamp: new Date().toISOString(),
    envId: 'cloud1-1g9313w0bb791de0',
    collections: results,
    summary: {
      total: collections.length,
      exists: results.filter(r => r.exists).length,
      missing: results.filter(r => !r.exists).length
    }
  };
}

// 创建集合（通过插入测试数据）
async function createCollections() {
  console.log('🚀 创建数据库集合...');
  
  const results = [];
  
  for (const collection of collections) {
    try {
      // 先检查是否已存在
      try {
        await db.collection(collection.name).count();
        
        results.push({
          name: collection.name,
          description: collection.description,
          created: false,
          reason: '已存在',
          status: '✅ 已存在（跳过创建）'
        });
        
        console.log(`   ✅ ${collection.name}: 已存在，跳过创建`);
        continue;
      } catch (error) {
        // 集合不存在，继续创建
      }
      
      // 创建集合（通过插入一条测试数据）
      const testData = getTestData(collection.name);
      
      const result = await db.collection(collection.name).add({
        data: testData
      });
      
      results.push({
        name: collection.name,
        description: collection.description,
        created: true,
        recordId: result._id,
        testData: testData,
        status: '✅ 创建成功'
      });
      
      console.log(`   ✅ ${collection.name}: 创建成功 (记录ID: ${result._id})`);
      
      // 等待一下避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      results.push({
        name: collection.name,
        description: collection.description,
        created: false,
        error: error.message,
        status: `❌ 创建失败: ${error.message}`
      });
      
      console.log(`   ❌ ${collection.name}: 创建失败 - ${error.message}`);
    }
  }
  
  return {
    success: true,
    action: 'create',
    timestamp: new Date().toISOString(),
    envId: 'cloud1-1g9313w0bb791de0',
    collections: results,
    summary: {
      total: collections.length,
      created: results.filter(r => r.created).length,
      failed: results.filter(r => !r.created).length,
      skipped: results.filter(r => r.reason === '已存在').length
    }
  };
}

// 清理测试数据
async function cleanCollections() {
  console.log('🧹 清理测试数据...');
  
  const results = [];
  
  for (const collection of collections) {
    try {
      // 删除所有标记为测试的数据
      const deleteResult = await db.collection(collection.name)
        .where({
          is_test: true
        })
        .remove();
      
      results.push({
        name: collection.name,
        description: collection.description,
        cleaned: true,
        deletedCount: deleteResult.deleted,
        status: `✅ 清理成功 (删除 ${deleteResult.deleted} 条测试数据)`
      });
      
      console.log(`   ✅ ${collection.name}: 清理成功 (删除 ${deleteResult.deleted} 条)`);
    } catch (error) {
      results.push({
        name: collection.name,
        description: collection.description,
        cleaned: false,
        error: error.message,
        status: `❌ 清理失败: ${error.message}`
      });
      
      console.log(`   ❌ ${collection.name}: 清理失败 - ${error.message}`);
    }
  }
  
  return {
    success: true,
    action: 'clean',
    timestamp: new Date().toISOString(),
    envId: 'cloud1-1g9313w0bb791de0',
    collections: results
  };
}

// 获取测试数据
function getTestData(collectionName) {
  const now = new Date();
  const testData = {
    is_test: true,
    created_at: now,
    updated_at: now,
    test_note: '这是初始化创建的测试数据，可以删除'
  };
  
  switch (collectionName) {
    case 'users':
      return {
        ...testData,
        openid: 'test_openid_' + Date.now(),
        nickname: '测试用户',
        avatar: 'https://example.com/avatar.jpg',
        last_login: now
      };
      
    case 'words':
      return {
        ...testData,
        user_id: 'test_user_id',
        word: 'hello',
        translation: '你好',
        example: 'Hello, how are you?',
        difficulty: 1,
        review_count: 0,
        last_reviewed: null,
        next_review: now
      };
      
    case 'translation_history':
      return {
        ...testData,
        user_id: 'test_user_id',
        source_text: 'hello',
        target_text: '你好',
        source_lang: 'en',
        target_lang: 'zh',
        timestamp: now,
        service: 'test'
      };
      
    default:
      return testData;
  }
}

// 导出辅助函数（用于测试）
module.exports = {
  checkCollections,
  createCollections,
  cleanCollections,
  getTestData
};