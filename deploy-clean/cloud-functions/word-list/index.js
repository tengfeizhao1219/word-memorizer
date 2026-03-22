// word-list 云函数 - 干净版本
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  return {
    success: true,
    message: 'word-list 函数已部署',
    note: '这是干净版本，不包含任何密钥'
  };
};
