// 🎯 直接测试模拟登录
// 最简单的测试方法

console.log('🎯 直接测试模拟登录');
console.log('时间:', new Date().toLocaleString());
console.log('');

// 方法1: 直接调用页面函数
function testDirectCall() {
  console.log('1. 直接调用页面函数:');
  
  try {
    // 获取当前页面
    const pages = getCurrentPages();
    if (!pages || pages.length === 0) {
      console.log('   ⚠️ 无法获取页面，请确保在登录页面');
      return false;
    }
    
    const page = pages[pages.length - 1];
    console.log('   当前页面:', page.route);
    
    if (page && typeof page.useMockLogin === 'function') {
      console.log('   ✅ useMockLogin函数存在');
      
      // 准备测试数据
      const testUserInfo = {
        nickName: '直接测试用户',
        avatarUrl: ''
      };
      
      console.log('   🧪 调用函数...');
      const result = page.useMockLogin(testUserInfo);
      
      console.log('   ✅ 调用成功');
      console.log('      返回值:', result);
      
      if (result && result.userId) {
        console.log('   ✅ 返回数据完整');
        console.log('      用户ID:', result.userId);
        console.log('      昵称:', result.userInfo.nickName);
        return true;
      } else {
        console.log('   ❌ 返回数据不完整');
        return false;
      }
    } else {
      console.log('   ❌ useMockLogin函数不存在');
      return false;
    }
  } catch (error) {
    console.log('   ❌ 调用失败:', error.message);
    console.log('      堆栈:', error.stack);
    return false;
  }
}

// 方法2: 检查本地存储
function checkLocalStorage() {
  console.log('');
  console.log('2. 检查本地存储:');
  
  setTimeout(() => {
    const userId = wx.getStorageSync('userId');
    const userInfo = wx.getStorageSync('userInfo');
    const isMockUser = wx.getStorageSync('isMockUser');
    
    console.log('   用户ID:', userId || '未设置');
    console.log('   用户信息:', userInfo ? '✅ 已保存' : '❌ 未保存');
    console.log('   模拟用户:', isMockUser ? '✅ 是' : '❌ 否');
    
    if (userId && isMockUser) {
      console.log('   ✅ 模拟登录数据保存成功');
      return true;
    } else {
      console.log('   ❌ 模拟登录数据保存失败');
      return false;
    }
  }, 500);
}

// 方法3: 简单的手动测试
function simpleManualTest() {
  console.log('');
  console.log('3. 简单手动测试:');
  console.log('   在控制台运行以下代码:');
  console.log(`
    // 获取页面
    const pages = getCurrentPages();
    const page = pages[pages.length - 1];
    
    // 调用函数
    const result = page.useMockLogin({
      nickName: '手动测试',
      avatarUrl: ''
    });
    
    console.log('结果:', result);
  `);
}

// 运行测试
console.log('开始测试...');
console.log('----------------------------------------');

const directResult = testDirectCall();
checkLocalStorage();

console.log('');
console.log('----------------------------------------');
console.log('测试完成');

if (directResult) {
  console.log('🎉 useMockLogin函数工作正常！');
  console.log('');
  console.log('🚀 下一步:');
  console.log('   1. 等待页面自动跳转到首页');
  console.log('   2. 查看首页是否显示模拟数据');
  console.log('   3. 开始功能开发测试');
} else {
  console.log('❌ 需要进一步修复');
  console.log('');
  console.log('🔧 尝试方案:');
  console.log('   1. 重新编译小程序');
  console.log('   2. 检查控制台错误');
  console.log('   3. 运行 simpleManualTest() 中的代码');
}

simpleManualTest();