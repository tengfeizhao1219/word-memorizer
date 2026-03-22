/**
 * 数据库初始化云函数
 * 创建单词本学习系统所需的数据库集合
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-1g9313w0bb791de0',
  traceUser: true
});

const db = cloud.database();

/**
 * 创建数据库集合
 */
async function createCollections() {
  console.log('🗄️ 开始创建数据库集合...');
  
  const collections = [
    {
      name: 'users',
      description: '用户信息表',
      fields: [
        { name: '_id', type: 'string', required: true },
        { name: 'openid', type: 'string', required: true },
        { name: 'nickname', type: 'string' },
        { name: 'avatar', type: 'string' },
        { name: 'stats', type: 'object' },
        { name: 'settings', type: 'object' },
        { name: 'createdAt', type: 'date' },
        { name: 'updatedAt', type: 'date' },
        { name: 'lastLoginAt', type: 'date' }
      ]
    },
    {
      name: 'words',
      description: '单词数据表',
      fields: [
        { name: '_id', type: 'string', required: true },
        { name: 'userId', type: 'string', required: true },
        { name: 'word', type: 'string', required: true },
        { name: 'translation', type: 'string', required: true },
        { name: 'phonetic', type: 'string' },
        { name: 'example', type: 'string' },
        { name: 'difficulty', type: 'number' },
        { name: 'reviewCount', type: 'number' },
        { name: 'nextReview', type: 'date' },
        { name: 'createdAt', type: 'date' }
      ]
    },
    {
      name: 'translation_history',
      description: '翻译历史表',
      fields: [
        { name: '_id', type: 'string', required: true },
        { name: 'userId', type: 'string', required: true },
        { name: 'sourceText', type: 'string', required: true },
        { name: 'targetText', type: 'string', required: true },
        { name: 'sourceLang', type: 'string' },
        { name: 'targetLang', type: 'string' },
        { name: 'timestamp', type: 'date' }
      ]
    }
  ];
  
  const results = [];
  
  for (const collection of collections) {
    try {
      // 检查集合是否已存在
      const listResult = await db.listCollections();
      const exists = listResult.collections.some(col => col.name === collection.name);
      
      if (exists) {
        console.log(`   ✅ ${collection.name} 集合已存在`);
        results.push({
          name: collection.name,
          status: 'exists',
          message: '集合已存在'
        });
      } else {
        // 创建集合（通过添加文档自动创建）
        await db.collection(collection.name).add({
          data: {
            _id: 'init_' + Date.now(),
            description: collection.description,
            createdAt: db.serverDate(),
            init: true
          }
        });
        
        console.log(`   ✅ ${collection.name} 集合创建成功`);
        results.push({
          name: collection.name,
          status: 'created',
          message: '集合创建成功'
        });
      }
    } catch (error) {
      console.error(`   ❌ ${collection.name} 集合操作失败:`, error);
      results.push({
        name: collection.name,
        status: 'error',
        message: error.message,
        error: error
      });
    }
  }
  
  return results;
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action = 'create' } = event;
  
  try {
    console.log('🚀 数据库初始化函数被调用');
    console.log('   环境ID: cloud1-1g9313w0bb791de0');
    console.log('   操作类型:', action);
    
    if (action === 'create') {
      // 创建数据库集合
      const results = await createCollections();
      
      return {
        success: true,
        code: 0,
        message: '数据库初始化完成',
        data: {
          collections: results,
          timestamp: new Date().toISOString(),
          envId: 'cloud1-1g9313w0bb791de0'
        }
      };
    } else if (action === 'check') {
      // 检查数据库状态
      const listResult = await db.listCollections();
      
      return {
        success: true,
        code: 0,
        message: '数据库状态检查完成',
        data: {
          collections: listResult.collections,
          count: listResult.collections.length,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        code: 400,
        message: '不支持的操作类型',
        data: {
          supportedActions: ['create', 'check'],
          receivedAction: action
        }
      };
    }
  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    
    return {
      success: false,
      code: 500,
      message: '数据库初始化失败: ' + error.message,
      data: {
        error: error.toString(),
        timestamp: new Date().toISOString()
      }
    };
  }
};