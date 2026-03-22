// 测试本地API服务器
const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

async function testAllAPIs() {
  console.log('🧪 开始测试本地API服务器...');
  console.log('========================================');
  
  try {
    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthRes = await axios.get(`${API_BASE}/health`);
    console.log('✅ 健康检查:', healthRes.data.message);
    console.log('   数据库统计:', healthRes.data.data.database_stats);
    
    // 2. 测试登录
    console.log('\n2. 测试登录...');
    const loginRes = await axios.post(`${API_BASE}/login`, {
      code: 'test_code_123',
      userInfo: {
        nickname: '测试用户',
        avatar: ''
      }
    });
    console.log('✅ 登录成功:', loginRes.data.message);
    console.log('   用户ID:', loginRes.data.data.userId);
    
    const userId = loginRes.data.data.userId;
    
    // 3. 测试翻译
    console.log('\n3. 测试翻译...');
    const translateRes = await axios.post(`${API_BASE}/translate`, {
      text: 'hello',
      source: 'en',
      target: 'zh'
    });
    console.log('✅ 翻译成功:', translateRes.data.message);
    console.log('   原文:', translateRes.data.data.original);
    console.log('   翻译:', translateRes.data.data.translation);
    console.log('   服务:', translateRes.data.data.service);
    
    // 4. 测试获取单词列表
    console.log('\n4. 测试获取单词列表...');
    const wordsRes = await axios.get(`${API_BASE}/words`, {
      params: { userId, page: 1, limit: 10 }
    });
    console.log('✅ 获取单词列表成功:', wordsRes.data.message);
    console.log('   单词数量:', wordsRes.data.data.total);
    console.log('   当前页单词数:', wordsRes.data.data.words.length);
    
    // 5. 测试添加单词
    console.log('\n5. 测试添加单词...');
    const addWordRes = await axios.post(`${API_BASE}/words`, {
      word: 'test',
      translation: '测试',
      userId: userId
    });
    console.log('✅ 添加单词成功:', addWordRes.data.message);
    console.log('   添加的单词:', addWordRes.data.data.word);
    
    // 6. 测试获取用户信息
    console.log('\n6. 测试获取用户信息...');
    const userRes = await axios.get(`${API_BASE}/user/${userId}`);
    console.log('✅ 获取用户信息成功:', userRes.data.message);
    console.log('   用户昵称:', userRes.data.data.userInfo.nickname);
    console.log('   学习统计:', userRes.data.data.userInfo.stats);
    
    // 7. 测试删除单词
    console.log('\n7. 测试删除单词...');
    const wordIdToDelete = addWordRes.data.data.id;
    const deleteRes = await axios.delete(`${API_BASE}/words/${wordIdToDelete}`);
    console.log('✅ 删除单词成功:', deleteRes.data.message);
    console.log('   删除的单词:', deleteRes.data.data.word);
    
    console.log('\n========================================');
    console.log('🎉 所有API测试通过！');
    console.log('========================================');
    console.log('📋 测试总结:');
    console.log('  1. 健康检查 ✅');
    console.log('  2. 用户登录 ✅');
    console.log('  3. 单词翻译 ✅');
    console.log('  4. 获取单词列表 ✅');
    console.log('  5. 添加单词 ✅');
    console.log('  6. 获取用户信息 ✅');
    console.log('  7. 删除单词 ✅');
    console.log('========================================');
    console.log('🚀 本地API服务器功能完整，可以开始使用！');
    
  } catch (error) {
    console.error('❌ API测试失败:', error.message);
    if (error.response) {
      console.error('   响应状态:', error.response.status);
      console.error('   响应数据:', error.response.data);
    }
    process.exit(1);
  }
}

// 运行测试
testAllAPIs();