/**
 * 翻译云函数
 * 使用腾讯云翻译服务
 */

const cloud = require('wx-server-sdk');

// 初始化云开发
cloud.init({
  env: 'cloud1-1g9313w0bb791de0',
  traceUser: true
});

// 腾讯云翻译服务配置
const tencentcloud = require("tencentcloud-sdk-nodejs");

// 注意：这里使用环境变量，不在代码中硬编码密钥
const TmtClient = tencentcloud.tmt.v20180321.Client;

/**
 * 获取腾讯云翻译客户端
 */
function getTranslationClient() {
  // 从环境变量获取密钥
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;
  const region = process.env.TENCENT_REGION || 'ap-shanghai';
  
  if (!secretId || !secretKey) {
    throw new Error('缺少腾讯云密钥配置，请检查环境变量 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY');
  }
  
  const clientConfig = {
    credential: {
      secretId: secretId,
      secretKey: secretKey,
    },
    region: region,
    profile: {
      httpProfile: {
        endpoint: "tmt.tencentcloudapi.com",
      },
    },
  };
  
  return new TmtClient(clientConfig);
}

/**
 * 调用腾讯云翻译API
 */
async function translateText(text, sourceLang = 'en', targetLang = 'zh') {
  try {
    const client = getTranslationClient();
    
    const params = {
      SourceText: text,
      Source: sourceLang,
      Target: targetLang,
      ProjectId: 0
    };
    
    const response = await client.TextTranslate(params);
    
    return {
      success: true,
      sourceText: text,
      targetText: response.TargetText,
      sourceLang: sourceLang,
      targetLang: targetLang,
      requestId: response.RequestId
    };
  } catch (error) {
    console.error('❌ 腾讯云翻译失败:', error);
    
    // 如果腾讯云翻译失败，返回模拟翻译结果
    const mockTranslations = {
      'hello': '你好',
      'world': '世界',
      'apple': '苹果',
      'book': '书',
      'computer': '电脑',
      'phone': '手机',
      'water': '水',
      'food': '食物',
      'time': '时间',
      'day': '天'
    };
    
    const mockResult = mockTranslations[text.toLowerCase()];
    
    if (mockResult) {
      return {
        success: true,
        sourceText: text,
        targetText: mockResult,
        sourceLang: sourceLang,
        targetLang: targetLang,
        isMock: true,
        message: '使用模拟翻译（腾讯云翻译服务可能未开通）'
      };
    } else {
      return {
        success: false,
        sourceText: text,
        error: error.message,
        code: error.code || 'TRANSLATION_ERROR',
        message: '翻译失败，请检查腾讯云翻译服务配置'
      };
    }
  }
}

/**
 * 云函数入口
 */
exports.main = async (event, context) => {
  const { text, source = 'en', target = 'zh' } = event;
  
  try {
    console.log('🔤 翻译请求:', { text, source, target });
    
    if (!text) {
      return {
        success: false,
        code: 400,
        message: '缺少翻译文本',
        data: null
      };
    }
    
    // 执行翻译
    const result = await translateText(text, source, target);
    
    if (result.success) {
      console.log('✅ 翻译成功:', result.targetText);
      
      return {
        success: true,
        code: 0,
        message: '翻译成功',
        data: {
          sourceText: result.sourceText,
          targetText: result.targetText,
          sourceLang: result.sourceLang,
          targetLang: result.targetLang,
          isMock: result.isMock || false,
          timestamp: new Date().toISOString()
        }
      };
    } else {
      console.log('❌ 翻译失败:', result.error);
      
      return {
        success: false,
        code: 500,
        message: result.message || '翻译失败',
        data: {
          error: result.error,
          code: result.code
        }
      };
    }
  } catch (error) {
    console.error('❌ 翻译云函数执行失败:', error);
    
    return {
      success: false,
      code: 500,
      message: '翻译服务异常: ' + error.message,
      data: {
        error: error.toString(),
        timestamp: new Date().toISOString()
      }
    };
  }
};