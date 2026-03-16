# 数据库设计文档

## 数据库概览

### 集合列表

| 集合名 | 说明 | 预估数据量 | 主要索引 |
|--------|------|------------|----------|
| users | 用户信息 | 1000+ | openid(唯一), email(唯一) |
| words | 生词记录 | 10万+ | userId+word(复合唯一), userId+status |
| categories | 分类/标签 | 5000+ | userId+name(复合唯一) |
| reviews | 复习记录 | 50万+ | userId, wordId, reviewedAt |
| sync_logs | 同步日志 | 100万+ | userId, syncedAt |

### 数据库初始化脚本

```javascript
// database/init.js
const db = wx.cloud.database();

// 创建集合和索引
async function initDatabase() {
  // users 集合索引
  await db.collection('users').createIndex({
    keys: { openid: 1 },
    unique: true
  });
  
  // words 集合索引
  await db.collection('words').createIndex({
    keys: { userId: 1, word: 1 },
    unique: true
  });
  await db.collection('words').createIndex({
    keys: { userId: 1, status: 1 }
  });
  await db.collection('words').createIndex({
    keys: { userId: 1, 'review.nextReview': 1 }
  });
  
  // categories 集合索引
  await db.collection('categories').createIndex({
    keys: { userId: 1, name: 1 },
    unique: true
  });
  
  console.log('数据库初始化完成');
}

initDatabase();
```

## 详细设计

### users 集合

```javascript
{
  _id: "user_6a8f9b2c3d4e5f",           // 主键
  openid: "oXXXX_微信 openid",          // 微信 openid，唯一索引
  unionid: "uXXXX_微信 unionid",        // 微信 unionid（可选）
  nickname: "用户昵称",                  // 昵称
  avatar: "https://xxx.com/avatar.jpg", // 头像 URL
  email: "user@example.com",            // 邮箱（Web 登录用）
  phone: "",                            // 手机号（可选）
  
  // 学习统计
  stats: {
    totalWords: 150,                    // 总生词数
    masteredWords: 45,                  // 已掌握
    learningWords: 105,                 // 学习中
    totalReviews: 500,                  // 总复习次数
    streakDays: 7                       // 连续学习天数
  },
  
  // 设置
  settings: {
    dailyReviewLimit: 50,               // 每日复习上限
    remindTime: "20:00",                // 提醒时间
    audioEnabled: true,                 // 发音开关
    theme: "light"                      // 主题
  },
  
  // 元数据
  createdAt: ISODate("2026-03-15T10:00:00Z"),
  updatedAt: ISODate("2026-03-15T10:00:00Z"),
  lastLoginAt: ISODate("2026-03-15T10:00:00Z"),
  
  // 索引
  // openid: 唯一索引
  // email: 唯一索引
  // lastLoginAt: 普通索引
}
```

### words 集合

```javascript
{
  _id: "word_1a2b3c4d5e6f",             // 主键
  userId: "user_6a8f9b2c3d4e5f",        // 所属用户，索引
  
  // 单词信息
  word: "example",                      // 单词本身
  phoneticUs: "/ɪgˈzæmpəl/",            // 美式音标
  phoneticUk: "/ɪgˈzɑːmpəl/",           // 英式音标
  audioUs: "cloud://xxx-us.mp3",        // 美式发音 URL
  audioUk: "cloud://xxx-uk.mp3",        // 英式发音 URL
  
  // 释义
  definitions: [                        // 支持多释义
    {
      pos: "n.",                        // 词性
      meaning: "例子，示例",             // 中文释义
      examples: [                       // 例句
        {
          en: "This is an example.",
          zh: "这是一个例子。"
        }
      ]
    }
  ],
  
  // 分类
  categories: ["CET-4", "高频词汇"],    // 分类/标签
  
  // 学习状态
  status: "learning",                   // learning/reviewed/mastered
  level: 1,                             // 掌握程度 1-5
  difficulty: "medium",                 // 难度 easy/medium/hard
  
  // 复习计划 (艾宾浩斯)
  review: {
    nextReview: ISODate("2026-03-20T10:00:00Z"), // 下次复习时间
    interval: 1,                        // 间隔天数
    reviewCount: 3,                     // 已复习次数
    lastReview: ISODate("2026-03-15T10:00:00Z"), // 上次复习时间
    easeFactor: 2.5                     // 记忆难度系数 (SM-2 算法)
  },
  
  // 来源
  source: {
    type: "manual",                     // manual/ocr/import
    from: "web",                        // mini/web
    url: ""                             // 来源 URL（可选）
  },
  
  // 元数据
  createdAt: ISODate("2026-03-15T10:00:00Z"),
  updatedAt: ISODate("2026-03-15T10:00:00Z"),
  syncedAt: ISODate("2026-03-15T10:00:00Z"), // 同步时间
  version: 1,                           // 版本号（乐观锁）
  
  // 索引
  // userId: 普通索引
  // word: 普通索引
  // status: 普通索引
  // review.nextReview: 普通索引
  // categories: 数组索引
  // (userId, word): 复合唯一索引
}
```

### categories 集合

```javascript
{
  _id: "cat_1a2b3c4d",
  userId: "user_xxx",                   // 所属用户
  name: "CET-4",                        // 分类名称
  color: "#3498db",                     // 分类颜色
  icon: "book",                         // 图标
  parentId: null,                       // 父分类（支持层级）
  order: 1,                             // 排序
  wordCount: 50,                        // 单词数量（冗余）
  createdAt: ISODate("2026-03-15T10:00:00Z"),
  
  // 索引
  // (userId, name): 复合唯一索引
}
```

### reviews 集合

```javascript
{
  _id: "rev_1a2b3c4d",
  userId: "user_xxx",
  wordId: "word_xxx",
  
  // 复习结果
  result: "good",                       // forgot/hard/good/easy
  duration: 5000,                       // 思考时间 (ms)
  
  // 复习后状态
  newInterval: 3,                       // 新间隔
  newEaseFactor: 2.6,                   // 新难度系数
  
  reviewedAt: ISODate("2026-03-15T10:00:00Z"),
  
  // 索引
  // userId: 普通索引
  // wordId: 普通索引
  // reviewedAt: 普通索引
}
```

### sync_logs 集合

```javascript
{
  _id: "sync_1a2b3c4d",
  userId: "user_xxx",
  deviceId: "device_xxx",               // 设备 ID
  platform: "mini",                     // mini/web
  
  // 同步内容
  changes: [
    {
      collection: "words",
      action: "update",                 // create/update/delete
      docId: "word_xxx",
      version: 2
    }
  ],
  
  // 同步结果
  status: "success",                    // success/failed
  syncedAt: ISODate("2026-03-15T10:00:00Z"),
  
  // 索引
  // userId: 普通索引
  // syncedAt: 普通索引
}
```

## 数据库操作示例

### 查询示例

```javascript
// 查询用户的生词列表（分页）
const getWordList = async (userId, page = 1, pageSize = 20) => {
  const db = wx.cloud.database();
  const result = await db.collection('words')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .get();
  
  return result.data;
};

// 查询今日需要复习的单词
const getTodayReviews = async (userId) => {
  const db = wx.cloud.database();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const result = await db.collection('words')
    .where({
      userId,
      'review.nextReview': db.command.lte(today)
    })
    .orderBy('review.nextReview', 'asc')
    .limit(50)
    .get();
  
  return result.data;
};

// 搜索单词
const searchWords = async (userId, keyword) => {
  const db = wx.cloud.database();
  const result = await db.collection('words')
    .where({
      userId,
      $or: [
        { word: db.RegExp({ regexp: keyword, options: 'i' }) },
        { 'definitions.meaning': db.RegExp({ regexp: keyword, options: 'i' }) }
      ]
    })
    .get();
  
  return result.data;
};
```

### 更新示例

```javascript
// 添加生词（乐观锁）
const addWord = async (userId, wordData) => {
  const db = wx.cloud.database();
  const now = new Date();
  
  const word = {
    userId,
    ...wordData,
    status: 'learning',
    review: {
      nextReview: now,
      interval: 1,
      reviewCount: 0,
      lastReview: null,
      easeFactor: 2.5
    },
    createdAt: now,
    updatedAt: now,
    syncedAt: now,
    version: 1
  };
  
  const result = await db.collection('words').add({ data: word });
  return result._id;
};

// 更新生词（乐观锁）
const updateWord = async (wordId, updates, currentVersion) => {
  const db = wx.cloud.database();
  const now = new Date();
  
  try {
    const result = await db.collection('words').doc(wordId).update({
      data: {
        ...updates,
        updatedAt: now,
        syncedAt: now,
        version: currentVersion + 1
      }
    });
    
    return { success: true, version: currentVersion + 1 };
  } catch (error) {
    if (error.errCode === -502002) { // 版本冲突
      return { success: false, conflict: true };
    }
    throw error;
  }
};

// 提交复习结果
const submitReview = async (userId, wordId, result, duration) => {
  const db = wx.cloud.database();
  const now = new Date();
  
  // 获取当前单词
  const wordDoc = await db.collection('words').doc(wordId).get();
  const word = wordDoc.data;
  
  // 计算下次复习时间
  const reviewResult = calculateNextReview(
    result,
    word.review.interval,
    word.review.easeFactor
  );
  
  // 更新单词
  await db.collection('words').doc(wordId).update({
    data: {
      'review.nextReview': reviewResult.nextReview,
      'review.interval': reviewResult.nextInterval,
      'review.easeFactor': reviewResult.nextEaseFactor,
      'review.reviewCount': word.review.reviewCount + 1,
      'review.lastReview': now,
      updatedAt: now
    }
  });
  
  // 记录复习日志
  await db.collection('reviews').add({
    data: {
      userId,
      wordId,
      result,
      duration,
      newInterval: reviewResult.nextInterval,
      newEaseFactor: reviewResult.nextEaseFactor,
      reviewedAt: now
    }
  });
  
  return reviewResult;
};
```

### 删除示例

```javascript
// 删除生词（支持批量）
const deleteWords = async (wordIds) => {
  const db = wx.cloud.database();
  const _ = db.command;
  
  const result = await db.collection('words')
    .where({ _id: _.in(wordIds) })
    .remove();
  
  return result.stats.removed;
};

// 软删除（标记删除）
const softDeleteWord = async (wordId) => {
  const db = wx.cloud.database();
  const now = new Date();
  
  await db.collection('words').doc(wordId).update({
    data: {
      status: 'deleted',
      updatedAt: now,
      syncedAt: now
    }
  });
};
```

## 数据库优化建议

### 索引优化

1. **复合索引**：为常用查询组合创建复合索引
2. **覆盖索引**：确保查询可以通过索引完成，避免回表
3. **定期分析**：使用 `explain()` 分析查询性能

### 查询优化

1. **分页查询**：使用 `skip()` 和 `limit()` 实现分页
2. **字段选择**：使用 `field()` 只选择需要的字段
3. **避免全表扫描**：确保查询条件能使用索引

### 数据模型优化

1. **冗余字段**：适当使用冗余字段减少关联查询
2. **数组长度控制**：控制数组长度，避免文档过大
3. **文档大小**：控制单个文档大小，避免超过 16MB 限制

### 事务处理

```javascript
// 使用事务处理关联操作
const transferCategory = async (userId, fromCategoryId, toCategoryId) => {
  const db = wx.cloud.database();
  
  // 开始事务
  const transaction = await db.startTransaction();
  
  try {
    // 更新单词分类
    await transaction.collection('words').where({
      userId,
      categories: fromCategoryId
    }).update({
      data: {
        categories: db.command.pull(fromCategoryId).push(toCategoryId)
      }
    });
    
    // 更新分类统计
    await transaction.collection('categories').doc(fromCategoryId).update({
      data: {
        wordCount: db.command.inc(-1)
      }
    });
    
    await transaction.collection('categories').doc(toCategoryId).update({
      data: {
        wordCount: db.command.inc(1)
      }
    });
    
    // 提交事务
    await transaction.commit();
    
    return { success: true };
  } catch (error) {
    // 回滚事务
    await transaction.rollback();
    throw error;
  }
};
```

## 数据备份与恢复

### 备份脚本

```javascript
// scripts/backup.js
const backupDatabase = async () => {
  const collections = ['users', 'words', 'categories', 'reviews', 'sync_logs'];
  const backupData = {};
  
  for (const collection of collections) {
    const result = await db.collection(collection).get();
    backupData[collection] = result.data;
  }
  
  // 保存到云存储
  const fileName = `backup-${Date.now()}.json`;
  await wx.cloud.uploadFile({
    cloudPath: `backups/${fileName}`,
    filePath: JSON.stringify(backupData)
  });
  
  console.log(`备份完成: ${fileName}`);
};
```

### 恢复脚本

```javascript
// scripts/restore.js
const restoreDatabase = async (backupFile) => {
  // 从云存储下载备份文件
  const fileContent = await wx.cloud.downloadFile({
    fileID: backupFile
  });
  
  const backupData = JSON.parse(fileContent);
  
  for (const [collection, data] of Object.entries(backupData)) {
    // 清空集合
    await db.collection(collection).where({}).remove();
    
    // 批量插入数据
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await db.collection(collection).add({
        data: batch
      });
    }
  }
  
  console.log('数据恢复完成');
};
```

## 性能监控

### 查询性能监控

```javascript
// 监控慢查询
const monitorSlowQueries = async () => {
  const slowQueries = [];
  
  // 记录执行时间超过 100ms 的查询
  const startTime = Date.now();
  const result = await db.collection('words')
    .where({ status: 'learning' })
    .get();
  const endTime = Date.now();
  
  if (endTime - startTime > 100) {
    slowQueries.push({
      collection: 'words',
      query: { status: 'learning' },
      duration: endTime - startTime,
      timestamp: new Date()
    });
  }
  
  return slowQueries;
};
```

### 存储空间监控

```javascript
// 监控存储空间使用情况
const monitorStorage = async () => {
  const stats = await db.stats();
  
  return {
    totalSize: stats.size,
    usedSize: stats.storageSize,
    freeSize: stats.freeStorage