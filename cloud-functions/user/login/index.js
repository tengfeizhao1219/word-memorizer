/**
 * 用户登录云函数
 * 处理微信登录和用户信息获取
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

/**
 * 生成用户ID
 */
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 处理微信登录
 */
async function handleWechatLogin(openid, userInfo) {
  try {
    // 检查用户是否已存在
    const userResult = await db.collection('users')
      .where({
        openid: openid
      })
      .get();
    
    let userId;
    
    if (userResult.data.length === 0) {
      // 新用户，创建记录
      userId = generateUserId();
      
      const newUser = {
        _id: userId,
        openid: openid,
        unionid: userInfo.unionId || '',
        nickname: userInfo.nickName || '',
        avatar: userInfo.avatarUrl || '',
        email: '',
        phone: '',
        stats: {
          totalWords: 0,
          masteredWords: 0,
          learningWords: 0,
          totalReviews: 0,
          streakDays: 0
        },
        settings: {
          dailyReviewLimit: 50,
          remindTime: '20:00',
          audioEnabled: true,
          theme: 'light'
        },
        createdAt: db.serverDate(),
        updatedAt: db.serverDate(),
        lastLoginAt: db.serverDate()
      };
      
      await db.collection('users').add({
        data: newUser
      });
      
      console.log('✅ 新用户创建成功:', userId);
    } else {
      // 老用户，更新登录时间
      userId = userResult.data[0]._id;
      
      await db.collection('users').doc(userId).update({
        data: {
          lastLoginAt: db.serverDate(),
          nickname: userInfo.nickName || userResult.data[0].nickname,
          avatar: userInfo.avatarUrl || userResult.data[0].avatar,
          updatedAt: db.serverDate()
        }
      });
      
      console.log('✅ 用户登录成功:', userId);
    }
    
    // 获取完整的用户信息
    const userDoc = await db.collection('users').doc(userId).get();
    
    return {
      success: true,
      userId: userId,
      userInfo: userDoc.data
    };
  } catch (error) {
    console.error('❌ 处理微信登录失败:', error);
    throw error;
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { action, code, userInfo } = event;
  
  try {
    // 获取微信 openid
    const wxContext = cloud.getWXContext();
    const { OPENID, UNIONID } = wxContext;
    
    if (!OPENID) {
      return {
        success: false,
        code: 401,
        message: '未获取到用户标识',
        data: null
      };
    }
    
    // 处理登录
    const result = await handleWechatLogin(OPENID, userInfo || {});
    
    return {
      success: true,
      code: 0,
      message: '登录成功',
      data: {
        userId: result.userId,
        userInfo: result.userInfo,
        openid: OPENID,
        unionid: UNIONID || ''
      }
    };
  } catch (error) {
    console.error('❌ 登录云函数执行失败:', error);
    
    return {
      success: false,
      code: 500,
      message: '登录失败: ' + error.message,
      data: null
    };
  }
};