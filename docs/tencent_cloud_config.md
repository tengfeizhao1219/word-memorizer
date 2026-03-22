# 单词本学习系统 - 腾讯云环境配置

## 🎯 环境信息（用户提供）

### 核心配置
- **环境ID**: `cloud1-1g9313w0bb791de0`
- **服务端API Key**: `eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJhdWQiOiJ0ZW5nZmVpLXdvcmtzcGFjZS03ZWY5bWE4Yjc2NzBlYSIsImV4cCI6MTc4MTc3NTU4OSwiaWF0IjoxNzczOTk5NTg5LCJhdF9oYXNoIjoiZ0ZBRHJiUzRTZUsxRTFTZkZvZEVrdyIsInByb2plY3RfaWQiOiJ0ZW5nZmVpLXdvcmtzcGFjZS03ZWY5bWE4Yjc2NzBlYSIsIm1ldGEiOnsicGxhdGZvcm0iOiJBcGlLZXkifSwiYWRtaW5pc3RyYXRvcl9pZCI6IjIwMzQ5MTc4NDk2OTc1NzA4MTgiLCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF9zZXJ2ZXIiLCJpc19zeXN0ZW1fYWRtaW4iOnRydWV9.hqMT8WiMuHwTf_CGW51K1YyG9iOFbYiy3edpdVtILss929RdUbqHnpeILJiyFcPh5IFeebsixbSDhJp7KYLDd49anrfCpOIICeJoyhuvd2tkfPG6IbdxbgrJr2iyGmRIrRC490nvYhoMwvr1NufPZVSLRFNbRBIb8D2qzp4KzVumobd7kTLiR6JCHpWnhPj_83SQ6rwZjiXNxq_eRP1PkKnRJ8md7pNRQqK7YzgXCyAb7vC2JD_saHRBHV7-4t_jlFBlKnKWW4DYtcpq78ST7g3O4hecbyij7h-7b6s9_0lCfXHif-hC3j0U6Brz9SALRkoXDPDqCVtKU3vkvYxjiw`
- **地域**: 默认上海 (`ap-shanghai`)
- **创建时间**: 2026-03-20 17:48
- **用途**: 单词本学习系统专用环境

### 技术详情
- **环境类型**: 按量计费（有免费额度）
- **管理员ID**: `2034917849697570818`
- **客户端类型**: `client_server`
- **系统管理员**: `true`
- **平台**: `ApiKey`

### 有效期
- **签发时间**: 2026-03-20 17:48 (Unix: 1773999589)
- **过期时间**: 2026-03-20 17:48 + 90天 (Unix: 1781775589)
- **有效期**: 约90天

## 🔧 配置更新

### 需要更新的文件

#### 1. 小程序配置文件
```javascript
// client-mini-wechat/app.js
wx.cloud.init({
  env: 'cloud1-1g9313w0bb791de0', // 新环境ID
  traceUser: true
});
```

#### 2. 云函数配置文件
```json
// cloud-functions/config.json
{
  "envId": "cloud1-1g9313w0bb791de0",
  "region": "ap-shanghai"
}
```

#### 3. 测试脚本更新
```javascript
// 所有测试脚本中的环境ID
const envId = 'cloud1-1g9313w0bb791de0';
```

### 立即更新小程序配置

让我更新小程序的云开发初始化配置：

<｜DSML｜function_calls>
<｜DSML｜invoke name="edit">
<｜DSML｜parameter name="path" string="true">word-memorizer/client-mini-wechat/app.js