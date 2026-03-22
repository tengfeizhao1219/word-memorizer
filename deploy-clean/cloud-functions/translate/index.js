// 腾讯云翻译云函数 - 完全干净版本
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 腾讯云翻译SDK
const TencentCloud = require("tencentcloud-sdk-nodejs");
const TmtClient = TencentCloud.tmt.v20180321.Client;

// 从环境变量读取配置
const secretId = process.env.TENCENT_SECRET_ID;
const secretKey = process.env.TENCENT_SECRET_KEY;
const region = process.env.TENCENT_REGION || 'ap-shanghai';

// 本地词典（降级方案）
const localDictionary = {
  'en': { 'hello': '你好', 'world': '世界', 'apple': '苹果', 'book': '书' },
  'zh': { '你好': 'hello', '世界': 'world', '苹果': 'apple', '书': 'book' }
};

exports.main = async (event, context) => {
  const { text, source = 'en', target = 'zh' } = event;
  
  if (!text) return { success: false, error: '缺少文本参数' };
  
  console.log(`翻译: "${text}" (${source} → ${target})`);
  
  try {
    // 尝试腾讯云翻译（如果配置了密钥）
    if (secretId && secretKey) {
      try {
        const client = new TmtClient({
          credential: { secretId, secretKey },
          region: region,
          profile: { httpProfile: { endpoint: 'tmt.tencentcloudapi.com' } }
        });
        
        const response = await client.TextTranslate({
          SourceText: text,
          Source: source,
          Target: target,
          ProjectId: 0
        });
        
        if (response.TargetText) {
          return { success: true, data: response.TargetText, service: 'tencent' };
        }
      } catch (cloudError) {
        console.log('腾讯云翻译失败:', cloudError.message);
      }
    }
    
    // 降级到本地词典
    if (localDictionary[source] && localDictionary[source][text.toLowerCase()]) {
      return {
        success: true,
        data: localDictionary[source][text.toLowerCase()],
        service: 'local'
      };
    }
    
    return { success: false, error: '翻译失败' };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
};
