# P1需求部署指南

## 📋 部署概览

**部署内容**: P1优先级需求（分类管理、搜索功能、学习统计）  
**部署环境**: tengfei-workstation-7czc7ab13ca3 (上海)  
**预计时间**: 15-20分钟  
**部署方式**: 自动化脚本 + 手动验证  

---

## 🚀 第一步：环境准备

### 1.1 检查云开发环境
```bash
# 检查cloudbase-cli是否安装
cloudbase --version

# 如果未安装，安装cloudbase-cli
npm install -g @cloudbase/cli

# 检查登录状态
cloudbase login --check

# 如果未登录，扫码登录
cloudbase login
```

### 1.2 确认环境信息
```
环境名称: tengfei-workstation
环境ID: tengfei-workstation-7czc7ab13ca3
地域: 上海 (ap-shanghai)
```

---

## 📦 第二步：部署P1需求云函数

### 2.1 部署分类管理云函数
```bash
# 进入P1需求目录
cd /home/admin/.openclaw/workspace/word-memorizer/p1-requirements

# 部署分类管理函数
cloudbase functions:deploy category-create \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/category/create

cloudbase functions:deploy category-list \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/category/list

cloudbase functions:deploy category-update \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/category/update

cloudbase functions:deploy category-delete \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/category/delete
```

### 2.2 部署搜索功能云函数
```bash
# 部署搜索函数
cloudbase functions:deploy search-basic \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/search/basic

cloudbase functions:deploy search-advanced \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/search/advanced

cloudbase functions:deploy search-suggestions \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/search/suggestions
```

### 2.3 部署学习统计云函数
```bash
# 部署统计函数
cloudbase functions:deploy stats-daily \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/stats/daily

cloudbase functions:deploy stats-weekly \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/stats/weekly

cloudbase functions:deploy stats-categories \
  --env tengfei-workstation-7czc7ab13ca3 \
  --path backend/stats/categories
```

### 2.4 使用自动化部署脚本
```bash
# 运行自动化部署脚本
cd /home/admin/.openclaw/workspace/word-memorizer/p1-requirements
bash deployment/deploy-all.sh
```

---

## 🗄️ 第三步：初始化数据库

### 3.1 运行数据库初始化脚本
```bash
# 进入项目根目录
cd /home/admin/.openclaw/workspace/word-memorizer

# 运行P1需求数据库初始化
node p1-requirements/docs/DATABASE_DESIGN.js
```

### 3.2 验证数据库集合
登录腾讯云控制台，检查以下集合是否创建成功：
- ✅ `categories` - 分类管理
- ✅ `search_history` - 搜索历史
- ✅ `learning_stats` - 学习统计
- ✅ `words`集合已更新 - 添加了分类相关字段

### 3.3 创建数据库索引
检查以下索引是否创建成功：
- ✅ `categories`集合索引
- ✅ `words`集合新增索引
- ✅ 全文搜索索引（如果支持）

---

## 🎨 第四步：部署前端页面

### 4.1 集成分类管理页面
```bash
# 将分类管理页面复制到小程序项目
cp p1-requirements/frontend/category-manager.vue \
   client-mini/src/pages/category-manager/category-manager.vue

# 更新页面配置文件
# 在 client-mini/pages.json 中添加：
# {
#   "path": "pages/category-manager/category-manager",
#   "style": {
#     "navigationBarTitleText": "分类管理"
#   }
# }
```

### 4.2 集成搜索功能页面
```bash
# 创建搜索页面目录
mkdir -p client-mini/src/pages/search

# 复制搜索页面组件
cp p1-requirements/frontend/search-page.vue \
   client-mini/src/pages/search/search.vue
```

### 4.3 集成学习统计页面
```bash
# 创建统计页面目录
mkdir -p client-mini/src/pages/stats

# 复制统计页面组件
cp p1-requirements/frontend/stats-page.vue \
   client-mini/src/pages/stats/stats.vue
```

### 4.4 更新路由配置
编辑 `client-mini/pages.json`，添加以下页面配置：
```json
{
  "pages": [
    // ... 原有页面
    {
      "path": "pages/category-manager/category-manager",
      "style": {
        "navigationBarTitleText": "分类管理",
        "enablePullDownRefresh": true
      }
    },
    {
      "path": "pages/search/search",
      "style": {
        "navigationBarTitleText": "搜索",
        "enablePullDownRefresh": false
      }
    },
    {
      "path": "pages/stats/stats",
      "style": {
        "navigationBarTitleText": "学习统计",
        "enablePullDownRefresh": true
      }
    }
  ]
}
```

---

## 🧪 第五步：测试验证

### 5.1 运行自动化测试
```bash
# 运行P1需求测试脚本
cd /home/admin/.openclaw/workspace/word-memorizer/p1-requirements
node testing/run-all-tests.js
```

### 5.2 手动测试步骤

#### 5.2.1 分类管理功能测试
1. **创建分类**
   - 点击"添加分类"按钮
   - 输入分类名称、描述
   - 选择颜色和图标
   - 确认创建成功

2. **编辑分类**
   - 点击分类右侧菜单
   - 选择"编辑分类"
   - 修改分类信息
   - 确认更新成功

3. **删除分类**
   - 点击分类右侧菜单
   - 选择"删除分类"
   - 确认删除
   - 验证分类已移除

4. **分类筛选**
   - 在生词列表页面
   - 点击分类筛选
   - 验证按分类筛选功能

#### 5.2.2 搜索功能测试
1. **关键词搜索**
   - 在搜索页面输入关键词
   - 验证实时搜索建议
   - 验证搜索结果
   - 验证搜索结果高亮

2. **高级筛选**
   - 打开高级筛选面板
   - 设置多个筛选条件
   - 验证筛选结果
   - 验证排序功能

3. **搜索历史**
   - 多次搜索不同关键词
   - 查看搜索历史记录
   - 验证历史记录正确性

#### 5.2.3 学习统计测试
1. **每日统计**
   - 进入统计页面
   - 验证当日学习数据
   - 验证图表显示

2. **累计统计**
   - 查看累计学习数据
   - 验证连续学习天数
   - 验证学习趋势

3. **分类统计**
   - 查看分类学习情况
   - 验证分类数据准确性

4. **学习建议**
   - 查看个性化建议
   - 验证建议合理性

### 5.3 API接口测试
使用以下命令测试API接口：
```bash
# 测试分类管理API
curl -X POST https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/category/create \
  -H "Content-Type: application/json" \
  -d '{"name":"测试分类","color":"#4CAF50"}'

# 测试搜索API
curl -X GET "https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/search?query=test"

# 测试统计API
curl -X GET https://tengfei-workstation-7czc7ab13ca3.ap-shanghai.app.tcloudbase.com/stats/daily
```

---

## 🔧 第六步：问题排查

### 6.1 常见问题及解决方案

#### 问题1：云函数部署失败
**症状**: 部署时出现权限错误或超时
**解决方案**:
```bash
# 1. 检查登录状态
cloudbase login --check

# 2. 检查环境权限
cloudbase env:list

# 3. 增加部署超时时间
cloudbase functions:deploy ... --timeout 60
```

#### 问题2：数据库初始化失败
**症状**: 数据库集合创建失败
**解决方案**:
```bash
# 1. 检查数据库权限
# 2. 手动创建集合
# 3. 检查网络连接
```

#### 问题3：前端页面无法访问
**症状**: 页面加载失败或空白
**解决方案**:
1. 检查页面路由配置
2. 检查组件引入路径
3. 查看控制台错误信息

#### 问题4：API接口返回错误
**症状**: API调用返回非200状态码
**解决方案**:
1. 检查云函数日志
2. 验证请求参数
3. 检查数据库连接

### 6.2 日志查看
```bash
# 查看云函数日志
cloudbase functions:log category-create \
  --env tengfei-workstation-7czc7ab13ca3 \
  --limit 100

# 查看数据库操作日志
# 在腾讯云控制台查看
```

---

## 📊 第七步：部署验证清单

### 部署前检查
- [ ] cloudbase-cli已安装并登录
- [ ] 环境权限确认
- [ ] 网络连接正常
- [ ] 代码已提交到GitHub

### 部署过程检查
- [ ] 云函数部署成功（10个函数）
- [ ] 数据库初始化成功
- [ ] 前端页面集成成功
- [ ] 配置文件更新完成

### 功能验证检查
- [ ] 分类管理功能正常
- [ ] 搜索功能正常
- [ ] 学习统计功能正常
- [ ] API接口返回正确
- [ ] 前端页面交互正常

### 性能验证检查
- [ ] 页面加载时间 < 2秒
- [ ] API响应时间 < 500ms
- [ ] 搜索性能良好
- [ ] 内存使用正常

---

## 🚀 第八步：上线后监控

### 8.1 监控指标
- **错误率**: API错误率 < 1%
- **响应时间**: P95 < 1秒
- **使用量**: 日活跃用户、API调用次数
- **资源使用**: 云函数内存、数据库存储

### 8.2 告警设置
在腾讯云控制台设置以下告警：
1. **云函数错误率告警** - 错误率 > 5%
2. **数据库连接数告警** - 连接数 > 80%
3. **存储空间告警** - 使用率 > 80%

### 8.3 备份策略
1. **数据库备份**: 每日自动备份
2. **代码备份**: GitHub自动同步
3. **配置备份**: 环境变量导出备份

---

## 📞 支持与维护

### 问题反馈渠道
1. **GitHub Issues**: 技术问题反馈
2. **腾讯云工单**: 云服务问题
3. **用户反馈**: 小程序内反馈

### 紧急联系方式
- **技术负责人**: AI Assistant
- **部署时间**: 2026-03-18
- **最后更新**: 2026-03-18 01:30

### 维护计划
- **每日**: 检查错误日志
- **每周**: 性能优化检查
- **每月**: 功能更新和优化

---

## 🎉 部署完成确认

当所有检查项都通过后，P1需求部署完成。请记录以下信息：

**部署完成时间**: _______________  
**部署人员**: AI Assistant  
**验证人员**: _______________  
**GitHub提交**: https://github.com/tengfeizhao1219/word-memorizer/commit/________  

**备注**: 部署过程中遇到的问题和解决方案

---

**下一步**: 开始P2优先级需求开发，或进行用户体验优化。