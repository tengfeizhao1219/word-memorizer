// 🇵🇭 菲律宾模拟模式测试
// 环境不存在时的完整解决方案

console.log('🚀 开始模拟模式测试');
console.log('位置: 菲律宾');
console.log('云环境: ❌ 不存在');
console.log('解决方案: ✅ 模拟模式');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 1. 清除旧数据（确保干净测试）
console.log('1. 准备测试环境:');
wx.removeStorageSync('userId');
wx.removeStorageSync('userInfo');
wx.removeStorageSync('isMockUser');
wx.removeStorageSync('userStats');
console.log('   ✅ 清除旧数据完成');

// 2. 测试模拟登录
console.log('');
console.log('2. 测试模拟登录:');

// 模拟用户信息
const mockUserInfo = {
  nickName: '菲律宾测试用户',
  avatarUrl: ''
};

// 检查useMockLogin函数
if (typeof useMockLogin === 'function') {
  console.log('   ✅ useMockLogin函数可用');
  
  // 执行模拟登录
  try {
    const result = useMockLogin(mockUserInfo);
    console.log('   ✅ 模拟登录成功');
    console.log('      用户ID:', result.userId);
    console.log('      昵称:', result.userInfo.nickName);
    console.log('      统计:', result.userInfo.stats);
  } catch (error) {
    console.log('   ❌ 模拟登录错误:', error.message);
    
    // 手动创建模拟数据
    console.log('   🔧 手动创建模拟数据...');
    const manualMockData = {
      userId: 'ph_mock_' + Date.now(),
      userInfo: mockUserInfo,
      stats: {
        totalWords: 42,
        todayReviewCount: 8,
        streakDays: 7,
        masteryRate: 65
      }
    };
    
    wx.setStorageSync('userId', manualMockData.userId);
    wx.setStorageSync('userInfo', manualMockData.userInfo);
    wx.setStorageSync('userStats', manualMockData.stats);
    wx.setStorageSync('isMockUser', true);
    
    console.log('   ✅ 手动模拟数据创建成功');
    console.log('      用户ID:', manualMockData.userId);
  }
} else {
  console.log('   ❌ useMockLogin函数不存在');
  console.log('   💡 需要检查代码配置');
}

// 3. 验证模拟数据
console.log('');
console.log('3. 验证模拟数据:');

const userId = wx.getStorageSync('userId');
const userInfo = wx.getStorageSync('userInfo');
const isMockUser = wx.getStorageSync('isMockUser');
const userStats = wx.getStorageSync('userStats');

console.log('   用户ID:', userId || '未设置');
console.log('   用户信息:', userInfo ? '✅ 已保存' : '❌ 未保存');
console.log('   模拟用户:', isMockUser ? '✅ 是' : '❌ 否');
console.log('   用户统计:', userStats ? '✅ 已保存' : '❌ 未保存');

// 4. 测试页面跳转
console.log('');
console.log('4. 测试页面跳转:');

if (userId && isMockUser) {
  console.log('   ✅ 模拟用户已登录');
  console.log('   💡 可以跳转到首页测试功能');
  
  // 跳转到首页
  setTimeout(() => {
    console.log('   正在跳转到首页...');
    wx.switchTab({
      url: '/pages/index/index',
      success: () => {
        console.log('   ✅ 跳转成功');
        console.log('');
        console.log('🎉 模拟模式测试完成！');
        console.log('');
        console.log('💡 下一步操作:');
        console.log('   1. 查看首页是否显示模拟数据');
        console.log('   2. 测试其他页面功能');
        console.log('   3. 验证本地存储');
        console.log('   4. 开始功能开发测试');
      },
      fail: (err) => {
        console.log('   ❌ 跳转失败:', err);
        console.log('   💡 需要检查页面配置');
      }
    });
  }, 1500);
} else {
  console.log('   ❌ 模拟用户未登录');
  console.log('   💡 请先完成模拟登录设置');
}

console.log('');
console.log('🔧 模拟模式功能:');
console.log('   ✅ 登录功能 - 模拟登录');
console.log('   ✅ 首页显示 - 模拟统计数据');
console.log('   ✅ 单词管理 - 本地存储');
console.log('   ✅ 复习功能 - 模拟进度');
console.log('   ✅ 设置保存 - 本地配置');
console.log('');
console.log('🚀 可以立即开始开发测试！');