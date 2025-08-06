const fetch = require('node-fetch');
const { HttpsProxyAgent } = require('https-proxy-agent');

const PROXY_URL = 'http://127.0.0.1:7890';
const RPC_URL = 'https://mainnet.infura.io/v3/f9ce81237b514c03b9b0d4d2e90d1f17';

async function testProxyPostRequest() {
  console.log(`正在使用代理 ${PROXY_URL} 测试 Infura POST 请求...`);

  try {
    const agent = new HttpsProxyAgent(PROXY_URL);

    const response = await fetch(RPC_URL, {
      method: 'POST',
      agent: agent,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      if (data.result) {
        const blockNumber = parseInt(data.result, 16);
        console.log('✅ 测试成功！');
        console.log(`最新的区块号是: ${blockNumber}`);
        console.log('你的代理能够正确处理 POST 请求。');
      } else {
        console.error('❌ 测试失败：Infura 返回了错误。');
        console.error('错误详情:', data.error);
        console.log('这可能意味着代理虽然能连接，但请求内容或代理设置仍有不兼容问题。');
      }
    } else {
      console.error(`❌ 测试失败：HTTP 状态码 ${response.status}`);
      console.error('错误详情:', data);
    }

  } catch (error) {
    console.error('❌ 测试失败：无法连接到代理或 Infura。');
    console.error('错误详情:', error.message);
    console.log('这表明你的代理服务未运行、配置错误或网络存在问题。');
  }
}

testProxyPostRequest();
