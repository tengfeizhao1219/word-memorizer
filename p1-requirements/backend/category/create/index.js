/**
 * 创建分类云函数
 * 功能：创建新的生词分类
 */

const cloud = require('@cloudbase/node-sdk');

// 初始化云开发
const app = cloud.init({
  env: cloud.SYMBOL_CURRENT_ENV
});

const db = app.database();
const _ = db.command;

/**
 * 主函数 - 创建分类
 */
exports.main = async (event, context) => {
  console.log('📝 开始创建分类', event);
  
  try {
    // 1. 参数验证
    const { name, description, color, icon } = event;
    const { OPENID: userId } = cloud.getWXContext();
    
    if (!userId) {
      return {
        code: 401,
        message: '用户未登录',
        data: null
      };
    }
    
    if (!name || name.trim().length === 0) {
      return {
        code: 400,
        message: '分类名称不能为空',
        data: null
      };
    }
    
    if (name.length > 20) {
      return {
        code: 400,
        message: '分类名称不能超过20个字符',
        data: null
      };
    }
    
    // 2. 检查分类是否已存在
    const existingCategory = await db.collection('categories')
      .where({
        userId: userId,
        name: name.trim(),
        isDeleted: false
      })
      .get();
    
    if (existingCategory.data.length > 0) {
      return {
        code: 409,
        message: '分类名称已存在',
        data: null
      };
    }
    
    // 3. 生成分类数据
    const categoryData = {
      userId: userId,
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#4CAF50', // 默认绿色
      icon: icon || 'folder',     // 默认文件夹图标
      wordCount: 0,
      sortOrder: await getNextSortOrder(userId),
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // 4. 保存到数据库
    const result = await db.collection('categories').add(categoryData);
    
    console.log('✅ 分类创建成功:', result);
    
    return {
      code: 0,
      message: '分类创建成功',
      data: {
        categoryId: result.id,
        ...categoryData
      }
    };
    
  } catch (error) {
    console.error('❌ 创建分类失败:', error);
    
    return {
      code: 500,
      message: '创建分类失败',
      data: null,
      error: error.message
    };
  }
};

/**
 * 获取下一个排序序号
 */
async function getNextSortOrder(userId) {
  try {
    const result = await db.collection('categories')
      .where({
        userId: userId,
        isDeleted: false
      })
      .orderBy('sortOrder', 'desc')
      .limit(1)
      .get();
    
    if (result.data.length === 0) {
      return 1; // 第一个分类
    }
    
    return result.data[0].sortOrder + 1;
    
  } catch (error) {
    console.error('获取排序序号失败:', error);
    return 999; // 默认值
  }
}