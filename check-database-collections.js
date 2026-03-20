/**
 * 检查数据库集合是否存在
 * 用于诊断云函数调用失败问题
 */

// 在微信开发者工具控制台运行此代码

async function checkDatabaseCollections() {
  console.log('🔍 开始检查数据库集合')
  console.log('时间:', new Date().toLocaleString())
  console.log('')
  
  // 1. 检查云开发初始化
  console.log('1. 检查云开发初始化:')
  if (!wx.cloud) {
    console.log('  ❌ wx.cloud 不存在')
    console.log('  💡 请确保已开启云开发能力')
    return
  }
  
  console.log('  ✅ wx.cloud 存在')
  
  // 初始化云开发
  try {
    wx.cloud.init({
      env: 'tengfei-workstation-7czc7ab13ca3',
      traceUser: true
    })
    console.log('  ✅ 云开发初始化成功')
  } catch (error) {
    console.log('  ❌ 云开发初始化失败:', error.message)
    return
  }
  
  console.log('')
  
  // 2. 检查数据库连接
  console.log('2. 检查数据库连接:')
  try {
    const db = wx.cloud.database()
    console.log('  ✅ 数据库对象获取成功')
    
    // 3. 检查必需集合
    const requiredCollections = [
      'users',
      'words', 
      'categories',
      'reviews',
      'sync_logs'
    ]
    
    console.log('3. 检查必需集合:')
    console.log('   需要以下5个集合:')
    requiredCollections.forEach(col => console.log(`    - ${col}`))
    
    console.log('')
    console.log('4. 测试集合访问:')
    
    for (const collectionName of requiredCollections) {
      try {
        // 尝试访问集合
        const result = await db.collection(collectionName).count()
        console.log(`  ✅ ${collectionName}: 存在 (${result.total}个文档)`)
      } catch (error) {
        if (error.errCode === 'DATABASE_PERMISSION_DENIED') {
          console.log(`  ⚠️ ${collectionName}: 权限不足 (需要设置数据库权限)`)
        } else if (error.errCode === 'DATABASE_COLLECTION_NOT_EXIST') {
          console.log(`  ❌ ${collectionName}: 集合不存在`)
        } else {
          console.log(`  ❌ ${collectionName}: 访问失败 - ${error.message}`)
        }
      }
    }
    
    console.log('')
    console.log('5. 测试云函数调用:')
    
    // 测试云函数调用
    try {
      const testResult = await wx.cloud.callFunction({
        name: 'login',
        data: {
          action: 'test',
          test: true
        }
      })
      console.log('  ✅ 云函数调用成功:', testResult)
    } catch (error) {
      console.log('  ❌ 云函数调用失败:', error.message)
      console.log('     错误详情:', error)
    }
    
  } catch (error) {
    console.log('  ❌ 数据库连接失败:', error.message)
  }
  
  console.log('')
  console.log('🎯 检查完成')
  console.log('')
  console.log('💡 建议:')
  console.log('  1. 确保在腾讯云控制台创建了所有必需集合')
  console.log('  2. 设置数据库权限为 "所有用户可读，仅创建者可写"')
  console.log('  3. 重新部署云函数')
  console.log('  4. 重启微信开发者工具')
}

// 运行检查
checkDatabaseCollections().catch(console.error)

// 导出函数供手动调用
module.exports = { checkDatabaseCollections }