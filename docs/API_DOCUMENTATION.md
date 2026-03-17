# 多端同步生词本 - API接口文档

## 📋 接口概览

### 基础信息
```
基础URL: https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com
环境ID: tengfei-workstation-7czc7ab13ca3
地域: 上海 (ap-shanghai)
```

### 接口分类
1. **用户服务** - 用户认证和信息管理
2. **生词服务** - 生词CRUD和搜索
3. **复习服务** - 艾宾浩斯复习系统
4. **数据服务** - 导入导出和统计

---

## 🔐 用户服务接口

### 1.1 用户登录
```
POST /user/login

请求参数:
{
  "code": "微信登录code"
}

响应成功:
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "userId": "user_123456789",
    "token": "jwt_token_here",
    "userInfo": {
      "nickName": "用户昵称",
      "avatarUrl": "头像URL"
    }
  }
}

响应错误:
{
  "code": 401,
  "message": "登录失败"
}
```

### 1.2 获取用户信息
```
GET /user/getInfo

请求头:
Authorization: Bearer {token}

响应成功:
{
  "code": 0,
  "data": {
    "userId": "user_123456789",
    "userInfo": {
      "nickName": "用户昵称",
      "avatarUrl": "头像URL",
      "wordCount": 150,
      "learningCount": 80,
      "masteredCount": 70,
      "streakDays": 15
    }
  }
}
```

---

## 📚 生词服务接口

### 2.1 添加生词
```
POST /word/add

请求参数:
{
  "word": "example",
  "phoneticUs": "/ɪgˈzæmpəl/",
  "phoneticUk": "/ɪgˈzɑːmpəl/",
  "audioUs": "https://example.com/audio-us.mp3",
  "audioUk": "https://example.com/audio-uk.mp3",
  "definitions": [
    {
      "pos": "n.",
      "meaning": "例子，范例",
      "examples": [
        {
          "en": "This is a good example.",
          "zh": "这是一个好例子。"
        }
      ]
    }
  ],
  "categories": ["CET-4", "高频词汇"],
  "difficulty": "medium",
  "notes": "记忆技巧",
  "source": {
    "type": "manual",
    "from": "mini"
  }
}

响应成功:
{
  "code": 0,
  "data": {
    "wordId": "word_123456789",
    "createdAt": 1678886400000
  }
}
```

### 2.2 获取生词列表
```
GET /word/list

查询参数:
page=1&limit=20&status=learning&category=CET-4&sort=createdAt&order=desc

响应成功:
{
  "code": 0,
  "data": {
    "words": [
      {
        "_id": "word_123456789",
        "word": "example",
        "phoneticUs": "/ɪgˈzæmpəl/",
        "definitions": [...],
        "status": "learning",
        "level": 3,
        "nextReview": 1678886400000,
        "createdAt": 1678886400000
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

### 2.3 获取生词详情
```
GET /word/detail/{wordId}

响应成功:
{
  "code": 0,
  "data": {
    "_id": "word_123456789",
    "word": "example",
    "phoneticUs": "/ɪgˈzæmpəl/",
    "phoneticUk": "/ɪgˈzɑːmpəl/",
    "audioUs": "...",
    "audioUk": "...",
    "definitions": [...],
    "categories": ["CET-4"],
    "difficulty": "medium",
    "status": "learning",
    "level": 3,
    "reviewCount": 5,
    "lastReview": 1678886400000,
    "nextReview": 1678972800000,
    "easeFactor": 2.5,
    "interval": 7,
    "notes": "记忆技巧",
    "source": {...},
    "createdAt": 1678886400000,
    "updatedAt": 1678886400000
  }
}
```

### 2.4 更新生词
```
PUT /word/detail/{wordId}

请求参数: (同添加接口，部分字段)

响应成功:
{
  "code": 0,
  "data": {
    "updatedAt": 1678886400000,
    "version": 2
  }
}
```

### 2.5 删除生词
```
DELETE /word/detail/{wordId}

响应成功:
{
  "code": 0,
  "message": "删除成功"
}
```

### 2.6 搜索生词
```
GET /word/search

查询参数:
q=exam&category=CET-4&status=learning&page=1&limit=20

响应成功:
{
  "code": 0,
  "data": {
    "words": [...],
    "pagination": {...},
    "suggestions": ["example", "examination", "examine"]
  }
}
```

---

## 🔄 复习服务接口

### 3.1 获取今日复习
```
GET /review/getToday

响应成功:
{
  "code": 0,
  "data": {
    "words": [
      {
        "_id": "word_123456789",
        "word": "example",
        "phoneticUs": "/ɪgˈzæmpəl/",
        "definitions": [...],
        "reviewInfo": {
          "reviewCount": 5,
          "lastReview": 1678886400000,
          "nextReview": 1678972800000,
          "easeFactor": 2.5,
          "interval": 7
        }
      }
    ],
    "stats": {
      "total": 25,
      "new": 5,
      "review": 20,
      "estimatedTime": 30
    }
  }
}
```

### 3.2 提交复习结果
```
POST /review/submit

请求参数:
{
  "wordId": "word_123456789",
  "quality": 4, // 0-5分
  "reviewTime": 1678886400000
}

响应成功:
{
  "code": 0,
  "data": {
    "nextReview": 1679068800000,
    "newInterval": 10,
    "newEaseFactor": 2.6,
    "newLevel": 4
  }
}
```

---

## 📊 数据服务接口

### 4.1 批量导入
```
POST /word/import

请求参数:
{
  "words": [
    {
      "word": "apple",
      "meaning": "苹果",
      "category": "基础词汇"
    },
    ...
  ],
  "options": {
    "duplicate": "skip", // skip, update, both
    "defaultCategory": "导入词汇"
  }
}

响应成功:
{
  "code": 0,
  "data": {
    "total": 100,
    "success": 95,
    "failed": 3,
    "skipped": 2,
    "details": [...]
  }
}
```

### 4.2 数据导出
```
POST /word/export

请求参数:
{
  "format": "excel", // excel, csv, json, anki
  "range": "all", // all, learning, review, mastered
  "fields": ["word", "meaning", "category"],
  "categories": ["CET-4", "CET-6"]
}

响应成功:
{
  "code": 0,
  "data": {
    "filename": "word_memorizer_20240317.xlsx",
    "format": "excel",
    "count": 150,
    "downloadUrl": "https://...",
    "estimatedSize": "75KB"
  }
}
```

### 4.3 学习统计
```
GET /stats/overview

响应成功:
{
  "code": 0,
  "data": {
    "totalWords": 150,
    "learning": 80,
    "mastered": 70,
    "todayReview": 25,
    "categories": [
      {"_id": "CET-4", "count": 50},
      {"_id": "CET-6", "count": 40}
    ],
    "weeklyReview": [
      {"date": "03-10", "count": 15},
      {"date": "03-11", "count": 20}
    ],
    "masteryDistribution": [
      {"level": 1, "count": 20},
      {"level": 2, "count": 30}
    ]
  }
}
```

---

## ⚙️ 接口规范

### 请求头
```
Content-Type: application/json
Authorization: Bearer {token} (需要认证的接口)
```

### 响应格式
```json
{
  "code": 0,          // 0表示成功，其他表示错误
  "message": "描述信息",
  "data": {}          // 响应数据
}
```

### 错误码
```
0    : 成功
400  : 请求参数错误
401  : 未授权/登录失效
403  : 权限不足
404  : 资源不存在
500  : 服务器内部错误
```

### 分页参数
```
page    : 页码，从1开始
limit   : 每页数量，默认20，最大100
sort    : 排序字段
order   : 排序方向，asc/desc
```

---

## 🔒 安全认证

### JWT Token
```
获取: 通过/user/login接口获取
使用: 放在Authorization头中
格式: Bearer {token}
有效期: 7天
```

### 权限控制
- 用户只能访问自己的数据
- 管理员有特殊权限
- 公开接口无需认证

---

## 🧪 测试接口

### 健康检查
```
GET /health

响应:
{
  "status": "ok",
  "timestamp": 1678886400000,
  "version": "1.0.0",
  "environment": "production"
}
```

### 性能监控
```
GET /metrics

响应: (Prometheus格式)
# HELP api_requests_total Total API requests
# TYPE api_requests_total counter
api_requests_total{method="GET",endpoint="/word/list"} 150
```

---

## 📞 技术支持

### 接口调试
1. 使用Postman测试
2. 查看请求日志
3. 分析错误响应

### 问题排查
```
常见问题:
1. 401错误: 检查token是否有效
2. 400错误: 检查请求参数
3. 500错误: 服务器内部错误，查看日志
```

### 版本管理
```
API版本: v1
兼容性: 向后兼容
弃用通知: 提前30天通知
```

---

## 🚀 快速开始

### 示例请求
```bash
# 用户登录
curl -X POST https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/user/login \
  -H "Content-Type: application/json" \
  -d '{"code": "wx_login_code"}'

# 获取生词列表
curl -X GET "https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/word/list?page=1&limit=20" \
  -H "Authorization: Bearer your_token"
```

### 客户端集成
```javascript
// 小程序端示例
wx.request({
  url: 'https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/word/list',
  header: {
    'Authorization': 'Bearer ' + token
  },
  success: (res) => {
    console.log(res.data)
  }
})
```

---

## 📈 性能指标

### 响应时间
```
P95响应时间: < 500ms
P99响应时间: < 1000ms
可用性: 99.9%
```

### 限流策略
```
默认限流: 100请求/分钟/用户
突发流量: 允许短时间超限
全局限流: 保护后端服务
```

**API文档版本: 1.0.0 | 最后更新: 2026-03-17**