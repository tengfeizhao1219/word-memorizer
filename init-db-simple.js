/**
 * 简化的数据库初始化脚本
 * 不需要依赖，直接输出创建集合的步骤
 */

console.log('🗄️ 数据库初始化指南');
console.log('========================================');
console.log('环境: tengfei-workstation-7czc7ab13ca3');
console.log('');

console.log('📋 需要在腾讯云控制台手动创建以下5个数据库集合:');
console.log('');

// 数据库集合配置
const collections = [
  {
    name: 'users',
    description: '用户信息表',
    permissions: {
      read: '仅创建者可读',
      write: '仅创建者可写'
    },
    indexes: [
      { field: 'userId', unique: true },
      { field: 'openid', unique: true },
      { field: 'createdAt' }
    ]
  },
  {
    name: 'words',
    description: '生词数据表',
    permissions: {
      read: '仅创建者可读',
      write: '仅创建者可写'
    },
    indexes: [
      { field: 'wordId', unique: true },
      { field: 'userId' },
      { field: 'word' },
      { field: 'status' },
      { field: 'nextReview' },
      { field: 'categories' }
    ]
  },
  {
    name: 'categories',
    description: '分类信息表',
    permissions: {
      read: '所有用户可读',
      write: '仅创建者可写'
    },
    indexes: [
      { field: 'categoryId', unique: true },
      { field: 'userId' },
      { field: 'name' }
    ]
  },
  {
    name: 'reviews',
    description: '复习记录表',
    permissions: {
      read: '仅创建者可读',
      write: '仅创建者可写'
    },
    indexes: [
      { field: 'reviewId', unique: true },
      { field: 'userId' },
      { field: 'wordId' },
      { field: 'reviewDate' }
    ]
  },
  {
    name: 'sync_logs',
    description: '同步日志表',
    permissions: {
      read: '仅创建者可读',
      write: '仅创建者可写'
    },
    indexes: [
      { field: 'syncId', unique: true },
      { field: 'userId' },
      { field: 'deviceId' },
      { field: 'syncTime' }
    ]
  }
];

// 显示集合信息
collections.forEach((collection, index) => {
  console.log(`${index + 1}. ${collection.name}`);
  console.log(`   描述: ${collection.description}`);
  console.log(`   权限: 读取=${collection.permissions.read}, 写入=${collection.permissions.write}`);
  console.log(`   索引: ${collection.indexes.map(idx => idx.field).join(', ')}`);
  console.log('');
});

console.log('🔧 创建步骤:');
console.log('1. 登录腾讯云控制台: https://console.cloud.tencent.com/');
console.log('2. 进入云开发环境: tengfei-workstation-7czc7ab13ca3');
console.log('3. 点击左侧"数据库"');
console.log('4. 点击"集合"标签页');
console.log('5. 点击"新建集合"，逐个创建以上5个集合');
console.log('6. 按照上面的权限设置配置每个集合');
console.log('');

console.log('✅ 创建完成后，运行测试验证数据库连接:');
console.log('   node test-deployment.js');
console.log('');

console.log('📞 如果遇到问题:');
console.log('1. 检查集合名称是否完全匹配');
console.log('2. 确认权限设置正确');
console.log('3. 确保环境ID正确');
console.log('');

console.log('🎉 数据库初始化完成后，项目就可以正常使用了！');