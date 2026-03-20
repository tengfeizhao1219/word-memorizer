// 腾讯云翻译云函数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 腾讯云翻译SDK
const TencentCloud = require("tencentcloud-sdk-nodejs");
const TmtClient = TencentCloud.tmt.v20180321.Client;

// 本地词典（降级方案）
const localDictionary = {
  // 英文 -> 中文
  'en': {
    'hello': '你好',
    'world': '世界',
    'apple': '苹果',
    'book': '书',
    'computer': '电脑',
    'phone': '电话',
    'water': '水',
    'food': '食物',
    'time': '时间',
    'people': '人们',
    'student': '学生',
    'teacher': '老师',
    'school': '学校',
    'home': '家',
    'work': '工作',
    'love': '爱',
    'friend': '朋友',
    'family': '家庭',
    'city': '城市',
    'country': '国家'
  },
  // 中文 -> 英文
  'zh': {
    '你好': 'hello',
    '世界': 'world',
    '苹果': 'apple',
    '书': 'book',
    '电脑': 'computer',
    '电话': 'phone',
    '水': 'water',
    '食物': 'food',
    '时间': 'time',
    '人们': 'people',
    '学生': 'student',
    '老师': 'teacher',
    '学校': 'school',
    '家': 'home',
    '工作': 'work',
    '爱': 'love',
    '朋友': 'friend',
    '家庭': 'family',
    '城市': 'city',
    '国家': 'country'
  }
};

// 腾讯云翻译配置
const getTranslationClient = () => {
  try {
    // 从环境变量获取密钥（优先）
    let secretId = process.env.TENCENT_SECRET_ID;
    let secretKey = process.env.TENCENT_SECRET_KEY;
    
    // 必须通过环境变量配置密钥
    if (!secretId || !secretKey) {
      console.error('腾讯云翻译API密钥未配置，请设置环境变量 TENCENT_SECRET_ID 和 TENCENT_SECRET_KEY');
      console.error('将使用本地词典降级方案');
      return null;
    }
    
    return new TmtClient({
      credential: {
        secretId: secretId,
        secretKey: secretKey,
      },
      region: "ap-shanghai",
      profile: {
        httpProfile: {
          endpoint: "tmt.tencentcloudapi.com",
        },
      },
    });
  } catch (error) {
    console.error('创建翻译客户端失败:', error);
    return null;
  }
};

// 本地降级翻译
function fallbackTranslate(text, source, target) {
  console.log(`使用本地词典降级翻译: ${text} (${source}→${target})`);
  
  // 英文 -> 中文
  if (source === 'en' && target === 'zh') {
    const translated = localDictionary.en[text.toLowerCase()];
    if (translated) {
      return {
        original: text,
        translated: translated,
        source: source,
        target: target,
        isFallback: true,
        confidence: 'high'
      };
    }
  }
  
  // 中文 -> 英文
  if (source === 'zh' && target === 'en') {
    const translated = localDictionary.zh[text];
    if (translated) {
      return {
        original: text,
        translated: translated,
        source: source,
        target: target,
        isFallback: true,
        confidence: 'high'
      };
    }
  }
  
  // 简单规则降级（用于开发测试）
  if (source === 'en' && target === 'zh') {
    return {
      original: text,
      translated: `[本地] ${text} 的翻译`,
      source: source,
      target: target,
      isFallback: true,
      confidence: 'low'
    };
  }
  
  if (source === 'zh' && target === 'en') {
    return {
      original: text,
      translated: `[Local] Translation of ${text}`,
      source: source,
      target: target,
      isFallback: true,
      confidence: 'low'
    };
  }
  
  // 默认降级
  return {
    original: text,
    translated: '翻译服务暂不可用',
    source: source,
    target: target,
    isFallback: true,
    confidence: 'none'
  };
}

// 主函数
exports.main = async (event, context) => {
  console.log('翻译云函数被调用:', {
    text: event.text,
    source: event.source,
    target: event.target,
    timestamp: new Date().toISOString()
  });
  
  const { text, source = 'zh', target = 'en' } = event;
  
  // 参数验证
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: '缺少文本参数或参数类型错误',
      code: 'INVALID_PARAMETER'
    };
  }
  
  if (text.length > 1000) {
    return {
      success: false,
      error: '文本过长，最大支持1000字符',
      code: 'TEXT_TOO_LONG'
    };
  }
  
  // 尝试使用腾讯云翻译
  try {
    const client = getTranslationClient();
    
    if (!client) {
      console.warn('翻译客户端创建失败，使用降级方案');
      const fallbackResult = fallbackTranslate(text, source, target);
      return {
        success: true,
        data: fallbackResult,
        message: '使用本地词典翻译'
      };
    }
    
    const params = {
      SourceText: text,
      Source: source,
      Target: target,
      ProjectId: 0,
    };
    
    console.log('调用腾讯云翻译API:', params);
    
    const result = await client.TextTranslate(params);
    
    console.log('腾讯云翻译API响应:', {
      requestId: result.RequestId,
      targetText: result.TargetText,
      source: result.Source,
      target: result.Target
    });
    
    return {
      success: true,
      data: {
        original: text,
        translated: result.TargetText,
        source: source,
        target: target,
        requestId: result.RequestId,
        isFallback: false,
        confidence: 'high',
        provider: 'tencent'
      },
      message: '翻译成功'
    };
    
  } catch (error) {
    console.error('腾讯云翻译失败:', {
      error: error.message,
      code: error.code,
      text: text,
      source: source,
      target: target
    });
    
    // 降级方案
    const fallbackResult = fallbackTranslate(text, source, target);
    
    return {
      success: true, // 仍然返回成功，因为有降级方案
      data: fallbackResult,
      error: error.message,
      code: error.code,
      message: '翻译服务暂时不可用，已使用备用方案'
    };
  }
};

// 测试函数（开发阶段使用）
exports.test = async () => {
  const testCases = [
    { text: 'hello', source: 'en', target: 'zh' },
    { text: '世界', source: 'zh', target: 'en' },
    { text: 'apple', source: 'en', target: 'zh' },
    { text: 'book', source: 'en', target: 'zh' }
  ];
  
  const results = [];
  
  for (const testCase of testCases) {
    try {
      const result = await exports.main(testCase);
      results.push({
        test: testCase,
        result: result
      });
    } catch (error) {
      results.push({
        test: testCase,
        error: error.message
      });
    }
  }
  
  return results;
};