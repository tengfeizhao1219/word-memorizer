// 本地云函数服务器 - 内存数据库版本
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 内存数据库
const memoryDB = {
  users: [
    {
      id: 1,
      openid: 'test_user_001',
      nickname: '测试用户',
      avatar: '',
      created_at: new Date().toISOString(),
      stats: {
        total_words: 5,
        mastered_words: 0,
        learning_words: 5
      }
    }
  ],
  words: [
    {
      id: 1,
      word: 'hello',
      translation: '你好',
      pronunciation: 'həˈləʊ',
      example: 'Hello, how are you?',
      category: 'basic',
      difficulty: 1,
      user_id: 1,
      created_at: new Date().toISOString(),
      review_count: 0,
      status: 'learning'
    },
    {
      id: 2,
      word: 'world',
      translation: '世界',
      pronunciation: 'wɜːld',
      example: 'Hello world!',
      category: 'basic',
      difficulty: 1,
      user_id: 1,
      created_at: new Date().toISOString(),
      review_count: 0,
      status: 'learning'
    },
    {
      id: 3,
      word: 'apple',
      translation: '苹果',
      pronunciation: 'ˈæpl',
      example: 'I eat an apple every day.',
      category: 'food',
      difficulty: 1,
      user_id: 1,
      created_at: new Date().toISOString(),
      review_count: 0,
      status: 'learning'
    },
    {
      id: 4,
      word: 'book',
      translation: '书',
      pronunciation: 'bʊk',
      example: 'I read a book.',
      category: 'education',
      difficulty: 1,
      user_id: 1,
      created_at: new Date().toISOString(),
      review_count: 0,
      status: 'learning'
    },
    {
      id: 5,
      word: 'computer',
      translation: '电脑',
      pronunciation: 'kəmˈpjuːtə',
      example: 'I use a computer for work.',
      category: 'technology',
      difficulty: 1,
      user_id: 1,
      created_at: new Date().toISOString(),
      review_count: 0,
      status: 'learning'
    }
  ],
  translation_history: []
};

// 本地词典
const localDictionary = {
  'hello': '你好',
  'world': '世界',
  'apple': '苹果',
  'book': '书',
  'computer': '电脑',
  'phone': '电话',
  'water': '水',
  'food': '食物',
  'time': '时间',
  'people': '人们'
};

// API路由

// 1. 登录接口
app.post('/api/login', (req, res) => {
  console.log('🔑 登录请求:', req.body);
  
  const { code, userInfo = {} } = req.body;
  
  // 模拟登录逻辑
  const user = memoryDB.users[0]; // 使用测试用户
  
  res.json({
    success: true,
    data: {
      userId: user.id,
      userInfo: {
        nickname: user.nickname,
        avatar: user.avatar,
        stats: user.stats
      }
    },
    message: '登录成功'
  });
});

// 2. 翻译接口
app.post('/api/translate', (req, res) => {
  console.log('🌐 翻译请求:', req.body);
  
  const { text, source = 'en', target = 'zh' } = req.body;
  
  if (!text) {
    return res.status(400).json({
      success: false,
      message: '缺少翻译文本'
    });
  }
  
  // 使用本地词典
  const translation = localDictionary[text.toLowerCase()] || `[本地词典] ${text}`;
  
  // 记录翻译历史
  const historyEntry = {
    id: memoryDB.translation_history.length + 1,
    user_id: 1,
    source_text: text,
    target_text: translation,
    source_lang: source,
    target_lang: target,
    timestamp: new Date().toISOString(),
    method: 'local'
  };
  
  memoryDB.translation_history.push(historyEntry);
  
  res.json({
    success: true,
    data: {
      original: text,
      translation: translation,
      service: 'local_dictionary',
      history_id: historyEntry.id
    },
    message: '翻译完成（使用本地词典）'
  });
});

// 3. 获取单词列表
app.get('/api/words', (req, res) => {
  console.log('📚 获取单词列表请求');
  
  const { userId = 1, page = 1, limit = 20 } = req.query;
  
  const userWords = memoryDB.words.filter(word => word.user_id == userId);
  
  // 分页
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedWords = userWords.slice(start, end);
  
  res.json({
    success: true,
    data: {
      words: paginatedWords,
      total: userWords.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(userWords.length / limit)
    },
    message: '获取单词列表成功'
  });
});

// 4. 添加单词
app.post('/api/words', (req, res) => {
  console.log('➕ 添加单词请求:', req.body);
  
  const { word, translation, pronunciation, example, category, userId = 1 } = req.body;
  
  if (!word) {
    return res.status(400).json({
      success: false,
      message: '单词不能为空'
    });
  }
  
  const newWord = {
    id: memoryDB.words.length + 1,
    word: word,
    translation: translation || localDictionary[word.toLowerCase()] || word,
    pronunciation: pronunciation || '',
    example: example || '',
    category: category || 'default',
    difficulty: 1,
    user_id: userId,
    created_at: new Date().toISOString(),
    review_count: 0,
    status: 'learning'
  };
  
  memoryDB.words.push(newWord);
  
  // 更新用户统计
  const user = memoryDB.users.find(u => u.id == userId);
  if (user) {
    user.stats.total_words += 1;
    user.stats.learning_words += 1;
  }
  
  res.json({
    success: true,
    data: newWord,
    message: '单词添加成功'
  });
});

// 5. 删除单词
app.delete('/api/words/:id', (req, res) => {
  console.log('🗑️ 删除单词请求:', req.params.id);
  
  const wordId = parseInt(req.params.id);
  const wordIndex = memoryDB.words.findIndex(w => w.id === wordId);
  
  if (wordIndex === -1) {
    return res.status(404).json({
      success: false,
      message: '单词不存在'
    });
  }
  
  const deletedWord = memoryDB.words.splice(wordIndex, 1)[0];
  
  // 更新用户统计
  const user = memoryDB.users.find(u => u.id == deletedWord.user_id);
  if (user) {
    user.stats.total_words -= 1;
    if (deletedWord.status === 'learning') {
      user.stats.learning_words -= 1;
    } else if (deletedWord.status === 'mastered') {
      user.stats.mastered_words -= 1;
    }
  }
  
  res.json({
    success: true,
    data: deletedWord,
    message: '单词删除成功'
  });
});

// 6. 获取用户信息
app.get('/api/user/:id', (req, res) => {
  console.log('👤 获取用户信息请求:', req.params.id);
  
  const userId = parseInt(req.params.id);
  const user = memoryDB.users.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      message: '用户不存在'
    });
  }
  
  res.json({
    success: true,
    data: {
      userInfo: {
        nickname: user.nickname,
        avatar: user.avatar,
        stats: user.stats
      }
    },
    message: '获取用户信息成功'
  });
});

// 7. 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'running',
      server_time: new Date().toISOString(),
      database_stats: {
        users: memoryDB.users.length,
        words: memoryDB.words.length,
        translation_history: memoryDB.translation_history.length
      }
    },
    message: '服务器运行正常'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log('========================================');
  console.log('🚀 本地云函数服务器已启动');
  console.log(`📡 地址: http://localhost:${PORT}`);
  console.log('========================================');
  console.log('📋 可用API端点:');
  console.log('  POST /api/login        - 用户登录');
  console.log('  POST /api/translate    - 单词翻译');
  console.log('  GET  /api/words        - 获取单词列表');
  console.log('  POST /api/words        - 添加单词');
  console.log('  DELETE /api/words/:id  - 删除单词');
  console.log('  GET  /api/user/:id     - 获取用户信息');
  console.log('  GET  /api/health       - 健康检查');
  console.log('========================================');
  console.log('💡 提示: 前端需要修改为调用本地API');
  console.log('========================================');
});