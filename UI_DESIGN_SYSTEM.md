# 单词本学习系统 - UI设计系统

## 🎯 设计目标

### 核心设计原则：
1. **简洁直观** - 学习工具应该简单易用
2. **现代美观** - 符合2026年设计趋势
3. **高效学习** - 界面不干扰学习过程
4. **一致性** - 所有页面统一设计语言
5. **移动优先** - 为微信小程序优化

## 🎨 设计系统规范

### 1. 色彩系统 (Color System)

#### 主色调 (Primary Colors):
```css
--primary-50: #f0f9ff;    /* 最浅 */
--primary-100: #e0f2fe;
--primary-200: #bae6fd;
--primary-300: #7dd3fc;
--primary-400: #38bdf8;   /* 主要按钮 */
--primary-500: #0ea5e9;   /* 品牌色 */
--primary-600: #0284c7;   /* 悬停状态 */
--primary-700: #0369a1;   /* 激活状态 */
--primary-800: #075985;
--primary-900: #0c4a6e;   /* 最深 */
```

#### 辅助色 (Secondary Colors):
```css
--success: #10b981;       /* 成功/完成 */
--warning: #f59e0b;       /* 警告/注意 */
--error: #ef4444;         /* 错误/删除 */
--info: #3b82f6;          /* 信息/提示 */
```

#### 中性色 (Neutral Colors):
```css
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### 2. 字体系统 (Typography)

#### 字体大小 (rpx单位):
```css
--text-xs: 24rpx;     /* 辅助文本 */
--text-sm: 28rpx;     /* 小文本 */
--text-base: 32rpx;   /* 正文 */
--text-lg: 36rpx;     /* 标题 */
--text-xl: 40rpx;     /* 大标题 */
--text-2xl: 48rpx;    /* 页面标题 */
--text-3xl: 56rpx;    /* 特大标题 */
```

#### 字重 (Font Weight):
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 3. 间距系统 (Spacing System)

#### 基础间距 (基于8px网格):
```css
--space-1: 8rpx;
--space-2: 16rpx;
--space-3: 24rpx;
--space-4: 32rpx;
--space-5: 40rpx;
--space-6: 48rpx;
--space-8: 64rpx;
--space-10: 80rpx;
--space-12: 96rpx;
```

### 4. 圆角系统 (Border Radius)
```css
--radius-sm: 8rpx;
--radius-md: 16rpx;
--radius-lg: 24rpx;
--radius-xl: 32rpx;
--radius-full: 9999rpx;
```

### 5. 阴影系统 (Shadow System)
```css
--shadow-sm: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
--shadow-md: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
--shadow-lg: 0 16rpx 48rpx rgba(0, 0, 0, 0.15);
--shadow-xl: 0 24rpx 64rpx rgba(0, 0, 0, 0.2);
```

## 🏗️ 组件设计规范

### 1. 按钮组件 (Buttons)

#### 主要按钮 (Primary Button):
```css
.btn-primary {
  background: var(--primary-500);
  color: white;
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  border: none;
  transition: all 0.2s;
}

.btn-primary:active {
  background: var(--primary-600);
  transform: translateY(2rpx);
}
```

#### 次要按钮 (Secondary Button):
```css
.btn-secondary {
  background: white;
  color: var(--primary-600);
  border: 2rpx solid var(--primary-300);
  border-radius: var(--radius-lg);
  padding: var(--space-3) var(--space-6);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  transition: all 0.2s;
}

.btn-secondary:active {
  background: var(--primary-50);
  border-color: var(--primary-400);
}
```

#### 文本按钮 (Text Button):
```css
.btn-text {
  background: transparent;
  color: var(--primary-600);
  border: none;
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
}
```

### 2. 卡片组件 (Cards)

#### 基础卡片:
```css
.card {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--space-4);
}
```

#### 交互卡片:
```css
.card-interactive {
  background: white;
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-4);
  transition: all 0.2s;
}

.card-interactive:active {
  box-shadow: var(--shadow-md);
  transform: translateY(-2rpx);
}
```

### 3. 输入框组件 (Inputs)

#### 文本输入框:
```css
.input {
  width: 100%;
  padding: var(--space-4);
  border: 2rpx solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: border-color 0.2s;
}

.input:focus {
  border-color: var(--primary-400);
  outline: none;
}
```

#### 文本域:
```css
.textarea {
  width: 100%;
  min-height: 200rpx;
  padding: var(--space-4);
  border: 2rpx solid var(--gray-300);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  line-height: 1.5;
  transition: border-color 0.2s;
}
```

### 4. 标签组件 (Tags/Badges)

#### 状态标签:
```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.tag-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.tag-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.tag-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--error);
}
```

## 📱 页面设计规范

### 1. 页面布局 (Page Layout)

#### 标准页面结构:
```css
.page-container {
  min-height: 100vh;
  background: var(--gray-50);
  padding: var(--space-4);
}
```

#### 页面头部:
```css
.page-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.page-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.page-subtitle {
  font-size: var(--text-base);
  color: var(--gray-600);
}
```

### 2. 内容区域 (Content Area)

#### 卡片列表布局:
```css
.content-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
```

#### 表单布局:
```css
.form-container {
  max-width: 600rpx;
  margin: 0 auto;
}

.form-group {
  margin-bottom: var(--space-5);
}

.form-label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}
```

## 🎭 交互设计规范

### 1. 加载状态 (Loading States)

#### 骨架屏:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-300) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: var(--radius-md);
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

#### 加载指示器:
```css
.loading-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid var(--gray-300);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### 2. 空状态 (Empty States)

#### 空状态容器:
```css
.empty-state {
  text-align: center;
  padding: var(--space-10) var(--space-4);
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: var(--space-4);
  color: var(--gray-400);
}

.empty-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-700);
  margin-bottom: var(--space-2);
}

.empty-description {
  font-size: var(--text-base);
  color: var(--gray-600);
  margin-bottom: var(--space-6);
}
```

## 🔄 动效设计规范

### 1. 页面过渡 (Page Transitions)
```css
.page-enter {
  opacity: 0;
  transform: translateY(20rpx);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 0.3s ease-out;
}
```

### 2. 元素出现 (Element Appear)
```css
.fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 3. 按钮反馈 (Button Feedback)
```css
.btn-press {
  transition: transform 0.1s;
}

.btn-press:active {
  transform: scale(0.98);
}
```

## 📱 响应式设计规范

### 1. 断点系统 (Breakpoints)
```css
/* 微信小程序使用rpx，1rpx = 0.5px */
/* 设计稿宽度：750rpx */

/* 小屏幕：小于 600rpx */
@media screen and (max-width: 600rpx) {
  .responsive-element {
    padding: var(--space-3);
  }
}

/* 中等屏幕：600rpx - 900rpx */
@media screen and (min-width: 600rpx) and (max-width: 900rpx) {
  .responsive-element {
    padding: var(--space-4);
  }
}

/* 大屏幕：大于 900rpx */
@media screen and (min-width: 900rpx) {
  .responsive-element {
    padding: var(--space-6);
  }
}
```

## 🎯 具体页面设计指南

### 1. 首页 (Home Page)
- 简洁的欢迎信息
- 快速操作入口
- 学习进度概览
- 今日学习目标

### 2. 单词列表页 (Word List)
- 卡片式单词展示
- 分类筛选
- 搜索功能
- 批量操作

### 3. 单词添加页 (Word Add)
- 简洁的表单
- 实时翻译集成
- 分类选择
- 示例句子

### 4. 翻译页 (Translate)
- 双语输入区域
- 语言切换
- 翻译历史
- 添加到生词本

### 5. 复习页 (Review)
- 卡片式复习
- 进度指示
- 难度调整
- 复习统计

## 📋 实施计划

### 第一阶段：基础组件 (1-2天)
1. 创建全局样式文件
2. 实现基础组件
3. 建立设计token系统

### 第二阶段：核心页面 (2-3天)
1. 首页重设计
2. 单词列表页优化
3. 翻译页面完善

### 第三阶段：高级功能 (3-4天)
1. 动效实现
2. 响应式优化
3. 用户体验测试

### 第四阶段：优化迭代 (持续)
1. 用户反馈收集
2. A/B测试
3. 性能优化

## 🚀 立即行动

### 第一步：创建全局样式
创建 `app.wxss` 中的设计系统变量

### 第二步：更新核心页面
按照新设计规范重写关键页面

### 第三步：组件化重构
提取可复用组件，确保一致性

---

**设计目标**：创建一个现代化、专业的学习工具界面，提升用户学习体验和效率。

**设计理念**：简洁不简单，美观不花哨，高效不复杂。

**更新时间**：2026-03-20 19:48