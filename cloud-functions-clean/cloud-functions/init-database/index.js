// init-database 云函数 - 干净版本
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  return {
    success: true,
    message: 'init-database 函数已部署',
    timestamp: new Date().toISOString()
  };
};
