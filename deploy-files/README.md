# 多端同步生词本 - 手动部署文件

## 📁 文件说明

### 用户服务
1. `user-login.zip` - 用户登录函数
2. `user-getInfo.zip` - 用户信息获取函数

### 生词服务  
3. `word-add.zip` - 添加生词函数
4. `word-list.zip` - 生词列表函数
5. `word-detail.zip` - 生词详情函数
6. `word-search.zip` - 搜索生词函数
7. `word-import.zip` - 批量导入函数
8. `word-export.zip` - 数据导出函数

### 复习服务
9. `review-getToday.zip` - 获取今日复习函数
10. `review-submit.zip` - 提交复习结果函数

## 🚀 部署步骤

### 第一步：登录腾讯云控制台
1. 访问: https://console.cloud.tencent.com/
2. 登录你的账号

### 第二步：进入云开发环境
1. 搜索"云开发"并进入
2. 选择环境: `tengfei-workstation-7czc7ab13ca3`
3. 地域: 上海

### 第三步：部署云函数
对每个zip文件:
1. 点击左侧"云函数"
2. 点击"新建云函数"
3. 输入函数名称 (如: user-login)
4. 运行环境: Node.js 16.13
5. 上传对应的zip文件
6. 点击"完成"

### 第四步：创建数据库集合
1. 点击左侧"数据库"
2. 创建5个集合:
   - users
   - words  
   - categories
   - reviews
   - sync_logs

## ⚙️ 配置说明

### 云函数配置
- 超时时间: 5-30秒 (根据函数复杂度)
- 内存: 128-512MB
- 环境变量: 无需设置
- 触发器: HTTP访问服务 (自动创建)

### 数据库权限
- 读取: 仅创建者可读
- 写入: 仅创建者可写

## 🔗 访问地址

部署完成后，可以通过以下地址访问:

```
云函数调用地址:
https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/

具体函数:
- 登录: /user/login
- 添加生词: /word/add
- 获取列表: /word/list
- 等等...
```

## 🧪 测试验证

部署完成后，运行测试脚本:
```bash
cd word-memorizer
node test-deployment.js
```

## 📞 技术支持

如遇问题:
1. 检查控制台日志
2. 验证环境配置
3. 联系开发团队