/**
 * AI连通性测试脚本
 * 
 * 此脚本用于测试与OpenAI API的连接是否正常工作
 * 它会发送一个简单的请求并打印响应结果
 */

// 确保正确加载环境变量，指定.env文件路径
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const axios = require('axios');

// 从环境变量中获取API配置
const AI_BASE_URL = process.env.AI_BASE_URL;
const AI_API_KEY = process.env.AI_API_KEY;

// 检查环境变量是否存在
if (!AI_BASE_URL || !AI_API_KEY) {
  console.error('错误: 请确保在.env文件中设置了AI_BASE_URL和AI_API_KEY');
  process.exit(1);
}

console.log('开始测试AI连接...');
console.log(`使用API基础URL: ${AI_BASE_URL}`);
console.log('API密钥: ', AI_API_KEY.substring(0, 5) + '...' + AI_API_KEY.substring(AI_API_KEY.length - 4));

// 创建一个简单的请求函数
async function testAIConnection() {
  try {
    // 创建请求配置
    const requestConfig = {
      method: 'post',
      url: `${AI_BASE_URL}/v1/chat/completions`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      data: {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '你是一个有用的助手。'
          },
          {
            role: 'user',
            content: '你好，这是一个连接测试。请回复"连接成功！"'
          }
        ],
        max_tokens: 50
      }
    };

    console.log('发送测试请求...');
    const response = await axios(requestConfig);
    
    console.log('\n=== 测试结果 ===');
    console.log('状态码:', response.status);
    console.log('响应头:', JSON.stringify(response.headers, null, 2));
    
    if (response.data && response.data.choices && response.data.choices.length > 0) {
      const message = response.data.choices[0].message;
      console.log('\n回复内容:');
      console.log(message.content);
      
      console.log('\n模型信息:');
      console.log('使用的模型:', response.data.model);
      console.log('使用的tokens:', response.data.usage.total_tokens);
      
      console.log('\n✅ AI连接测试成功!');
    } else {
      console.log('\n⚠️ 收到响应但格式不符合预期:');
      console.log(JSON.stringify(response.data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ AI连接测试失败!');
    
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('错误状态码:', error.response.status);
      console.error('错误信息:', error.response.data);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('没有收到响应。可能是网络问题或API端点不可达。');
      console.error(error.message);
    } else {
      // 设置请求时发生了错误
      console.error('请求设置错误:', error.message);
    }
    
    console.error('\n调试信息:');
    if (error.config) {
      console.error('请求URL:', error.config.url);
      console.error('请求方法:', error.config.method);
      console.error('请求头:', JSON.stringify(error.config.headers, null, 2));
    }
  }
}

// 执行测试
testAIConnection()
  .then(() => {
    console.log('\n测试完成。');
  })
  .catch(err => {
    console.error('执行测试时发生未捕获的错误:', err);
  });
