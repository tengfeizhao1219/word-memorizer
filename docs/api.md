# API 接口文档

## 接口规范

### 请求格式

```javascript
// 云函数调用
wx.cloud.callFunction({
  name: 'word/list',
  data: {
    page: 1,
    pageSize: 20,
    status: 'learning'
  }
})
```

### 响应格式

```javascript
{
  code: 0,           // 0: 成功，非 0: 失败
  message: "success", // 错误信息
  data: {},          // 业务数据
  timestamp: 1710489600000 // 时间戳
}
```

### 错误码

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 未登录 |
| 1002 | 参数错误 |
| 1003 | 权限不足 |
| 1004 | 资源不存在 |
| 1005 | 数据冲突（版本冲突） |
| 5000 | 服务器错误 |

## 用户接口

### 登录

```javascript
// 云函数：user/login
// 请求
{
  code: "微信登录 code"
}

// 响应
{
  code: 0,
  data: {
    token: "jwt_token_xxx",
    user: {
      id: "user_xxx",
      nickname: "用户昵称",
      avatar: "头像 URL",
      isNewUser: true
    }
  }
}
```

### 获取用户信息

```javascript
// 云函数：user/getInfo
// 请求
{}

// 响应
{
  code: 0,
  data: {
    id: "user_xxx",
    nickname: "用户昵称",
    avatar: "头像 URL",
    stats: {
      totalWords: 150,
      masteredWords: 45,
      streakDays: 7
    },
    settings: {
      dailyReviewLimit: 50,
      remindTime: "20:00"
    }
  }
}
```

### 更新用户设置

```javascript
// 云函数：user/updateSettings
// 请求
{
  settings: {
    dailyReviewLimit: 100,
    remindTime: "21:00"
  }
}

// 响应
{
  code: 0,
  data: {
    success: true
  }
}
```

## 生词接口

### 生词列表

```javascript
// 云函数：word/list
// 请求
{
  page: 1,
  pageSize: 20,
  status: "learning",      // 可选：learning/reviewed/mastered/all
  categoryId: "cat_xxx",   // 可选：按分类筛选
  keyword: "exam",         // 可选：搜索关键词
  sortBy: "createdAt",     // 可选：createdAt/word/nextReview
  order: "desc"            // 可选：asc/desc
}

// 响应
{
  code: 0,
  data: {
    list: [
      {
        id: "word_xxx",
        word: "example",
        phoneticUs: "/ɪgˈzæmpəl/",
        definitions: [...],
        status: "learning",
        nextReview: "2026-03-20",
        createdAt: "2026-03-15"
      }
    ],
    total: 150,
    page: 1,
    pageSize: 20
  }
}
```

### 添加生词

```javascript
// 云函数：word/add
// 请求
{
  word: "example",
  phoneticUs: "/ɪgˈzæmpəl/",
  phoneticUk: "/ɪgˈzɑːmpəl/",
  definitions: [
    {
      pos: "n.",
      meaning: "例子",
      examples: [
        { en: "This is an example.", zh: "这是一个例子。" }
      ]
    }
  ],
  categories: ["CET-4"],
  source: {
    type: "manual",
    from: "mini"
  }
}

// 响应
{
  code: 0,
  data: {
    id: "word_xxx",
    createdAt: "2026-03-15T10:00:00Z"
  }
}
```

### 更新生词

```javascript
// 云函数：word/update
// 请求
{
  id: "word_xxx",
  word: "example",
  definitions: [...],
  categories: ["CET-4", "高频"],
  version: 1 // 乐观锁版本号
}

// 响应
{
  code: 0,
  data: {
    success: true,
    version: 2
  }
}

// 错误响应（版本冲突）
{
  code: 1005,
  message: "数据已被修改，请刷新后重试"
}
```

### 删除生词

```javascript
// 云函数：word/delete
// 请求
{
  ids: ["word_xxx1", "word_xxx2"] // 支持批量删除
}

// 响应
{
  code: 0,
  data: {
    deletedCount: 2
  }
}
```

### 搜索生词

```javascript
// 云函数：word/search
// 请求
{
  keyword: "exam",
  searchIn: ["word", "definition"], // 搜索范围
  limit: 20
}

// 响应
{
  code: 0,
  data: {
    list: [...],
    total: 10
  }
}
```

### 单词查询（新增）⭐

```javascript
// 云函数：dictionary/query
// 请求 - 英文查中文
{
  query: "example",
  type: "en2zh", // en2zh: 英查汉 / zh2en: 汉查英
  options: {
    withAudio: true,       // 包含发音
    withExamples: true,    // 包含例句
    withEtymology: true,   // 包含词根词源
    withMnemonics: true    // 包含记忆技巧
  }
}

// 响应
{
  code: 0,
  data: {
    word: "example",
    phoneticUs: "/ɪgˈzæmpəl/",
    phoneticUk: "/ɪgˈzɑːmpəl/",
    audioUs: "https://xxx.com/us.mp3",
    audioUk: "https://xxx.com/uk.mp3",
    definitions: [
      {
        pos: "n.",
        meaningZh: "例子，示例",
        meaningEn: "a thing characteristic of its kind",
        examples: [
          { en: "This is an example.", zh: "这是一个例子。" }
        ]
      }
    ],
    etymology: {
      root: "ex-",
      origin: "Latin exemplum",
      breakdown: "ex- (出) + emere (拿取) → 拿出来作为榜样"
    },
    mnemonics: [
      "ex(向外) + amp(样品) + le → 拿出样品给大家看 → 例子"
    ],
    relatedWords: ["exemplify", "exemplary"],
    frequency: "高频",
    level: "CET-4"
  }
}

// 请求 - 中文查英文
{
  query: "例子",
  type: "zh2en",
  options: { ... }
}

// 响应
{
  code: 0,
  data: {
    results: [
      {
        word: "example",
        phonetic: "/ɪgˈzæmpəl/",
        audio: "https://xxx.com/us.mp3",
        pos: "n.",
        meaning: "例子，示例",
        frequency: 95,     // 使用频率 0-100
        matchScore: 100    // 匹配度
      },
      {
        word: "instance",
        phonetic: "/ˈɪnstəns/",
        ...
      }
    ]
  }
}
```

## 复习接口

### 获取今日复习

```javascript
// 云函数：review/getToday
// 请求
{
  date: "2026-03-15", // 可选，默认今天
  limit: 50           // 数量上限
}

// 响应
{
  code: 0,
  data: {
    list: [
      {
        id: "word_xxx",
        word: "example",
        definitions: [...],
        reviewCount: 3,
        lastReview: "2026-03-10",
        interval: 3
      }
    ],
    total: 25
  }
}
```

### 提交复习结果

```javascript
// 云函数：review/submit
// 请求
{
  wordId: "word_xxx",
  result: "good", // forgot/hard/good/easy
  duration: 5000  // 思考时间 (ms)
}

// 响应
{
  code: 0,
  data: {
    success: true,
    nextReview: "2026-03-20",
    interval: 3,
    easeFactor: 2.6
  }
}
```

## 同步接口

### 获取同步数据

```javascript
// 云函数：sync/pull
// 请求
{
  lastSyncAt: "2026-03-15T10:00:00Z", // 上次同步时间
  deviceId: "device_xxx"
}

// 响应
{
  code: 0,
  data: {
    changes: [
      {
        collection: "words",
        action: "update",
        docId: "word_xxx",
        data: {...},
        version: 2,
        updatedAt: "2026-03-15T11:00:00Z"
      }
    ],
    serverTime: "2026-03-15T12:00:00Z"
  }
}
```

### 推送同步数据

```javascript
// 云函数：sync/push
// 请求
{
  changes: [
    {
      collection: "words",
      action: "create",
      data: {...}
    }
  ],
  deviceId: "device_xxx"
}

// 响应
{
  code: 0,
  data: {
    success: true,
    syncedCount: 1
  }
}
```

## 接口调用示例

### 小程序端调用示例

```javascript
// utils/request.js
const request = (name, data = {}) => {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data,
      success: (res) => {
        if (res.result.code === 0) {
          resolve(res.result.data)
        } else {
          reject(new Error(res.result.message))
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}

// api/word.js
export const getWordList = (params) => {
  return request('word/list', params)
}

export const addWord = (wordData) => {
  return request('word/add', wordData)
}

export const updateWord = (id, data) => {
  return request('word/update', { id, ...data })
}

export const deleteWord = (ids) => {
  return request('word/delete', { ids })
}
```

### Web端调用示例

```javascript
// utils/request.js
import axios from 'axios'

const request = axios.create({
  baseURL: process.env.VITE_API_BASE_URL,
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const { code, message, data } = response.data
    if (code === 0) {
      return data
    } else {
      return Promise.reject(new Error(message))
    }
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default request

// api/word.js
import request from '@/utils/request'

export const getWordList = (params) => {
  return request.get('/word/list', { params })
}

export const addWord = (wordData) => {
  return request.post('/word/add', wordData)
}

export const updateWord = (id, data) => {
  return request.put(`/word/update/${id}`, data)
}

export const deleteWord = (ids) => {
  return request.delete('/word/delete', { data: { ids } })
}
```

## 接口测试

### 使用 Apifox 测试

1. 导入接口文档
2. 配置环境变量
3. 设置认证信息
4. 批量测试接口

### 使用 curl 测试

```bash
# 测试登录接口
curl -X POST https://api.example.com/user/login \
  -H "Content-Type: application/json" \
  -d '{"code": "微信登录code"}'

# 测试获取生词列表
curl -X GET "https://api.example.com/word/list?page=1&pageSize=20" \
  -H "Authorization: Bearer your_token"
```

## 接口版本管理

### 版本控制策略
- 使用 URL 路径版本：`/v1/word/list`
- 向后兼容，不破坏现有接口
- 新功能使用新版本接口

### 版本迁移
1. 保持旧版本接口可用
2. 通知客户端升级
3. 设置旧版本接口弃用时间
4. 最终移除旧版本接口