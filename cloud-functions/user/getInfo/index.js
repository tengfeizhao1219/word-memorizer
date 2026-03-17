/**
 * 获取用户信息云函数
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 获取用户信息
 */
async function getUserInfo(userId) {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.data) {
      throw new Error('用户不存在');
    }
    
    // 返回用户信息（排除敏感字段）
    const userData = userDoc.data;
    const safeUserInfo = {
      _id: userData._id,
      nickname: userData.nickname,
      avatar: userData.avatar,
      stats: userData.stats,
      settings: userData.settings,
      createdAt: userData.createdAt,
      lastLoginAt: userData.lastLoginAt
    };
    
    return safeUserInfo;
  } catch (error) {
    console.error('❌ 获取用户信息失败:', error);
    throw error;
  }
}

/**
 * 更新用户设置
 */
async function updateUserSettings(userId, settings) {
  try {
    const updateData = {
      updatedAt: db.serverDate()
    };
    
    // 只更新允许的字段
    const allowedSettings = ['dailyReviewLimit', 'remindTime', 'audioEnabled', 'theme'];
    allowedSettings.forEach(key => {
      if (settings[key] !== undefined) {
        updateData[`settings.${key}`] = settings[key];
      }
    });
    
    await db.collection('users').doc(userId).update({
      data: updateData
    });
    
    // 获取更新后的用户信息
    return await getUserInfo(userId);
  } catch (error) {
    console.error('❌ 更新用户设置失败:', error);
    throw error;
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action, userId, settings } = event;
  
  try {
    // 获取当前用户ID
    const wxContext = cloud.getWXContext();
    const currentUserId = userId || context.OPENID;
    
    if (!currentUserId) {
      return {
        code: 401,
        message: '未获取到用户标识',
        data: null
      };
    }
    
    switch (action) {
      case 'getInfo':
        // 获取用户信息
        const userInfo = await getUserInfo(currentUserId);
        return {
          code: 0,
          message: '获取用户信息成功',
          data: userInfo
        };
        
      case 'updateSettings':
        // 更新用户设置
        if (!settings) {
          return {
            code: 400,
            message: '缺少设置参数',
            data: null
          };
        }
        
        const updatedUserInfo = await updateUserSettings(currentUserId, settings);
        return {
          code: 0,
          message: '更新设置成功',
          data: updatedUserInfo
        };
        
      default:
        // 默认返回用户信息
        const defaultUserInfo = await getUserInfo(currentUserId);
        return {
          code: 0,
          message: '获取用户信息成功',
          data: defaultUserInfo
        };
    }
  } catch (error) {
    console.error('❌ 用户信息云函数执行失败:', error);
    
    return {
      code: 500,
      message: '操作失败: ' + error.message,
      data: null
    };
  }
};