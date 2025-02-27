
// 创建一个简单的代理API，调用可靠的外部WHOIS服务
import axios from 'axios';

export default async function handler(req, res) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持GET请求' });
  }

  const { domain } = req.query;
  
  if (!domain) {
    return res.status(400).json({ error: '请提供域名参数' });
  }

  try {
    // 使用可靠的外部WHOIS API服务
    const apiResponse = await axios.get(`https://domain-checker-service.vercel.app/api/whois?domain=${encodeURIComponent(domain)}`);
    
    return res.status(200).json(apiResponse.data);
  } catch (error) {
    console.error('WHOIS查询错误:', error);
    
    let errorMessage = '查询失败，请稍后重试';
    let statusCode = 500;
    
    if (error.response) {
      statusCode = error.response.status;
      errorMessage = error.response.data?.error || `查询失败 (HTTP ${statusCode})`;
    } else if (error.request) {
      errorMessage = '无法连接到WHOIS服务器，请检查网络连接';
    }
    
    return res.status(statusCode).json({ error: errorMessage });
  }
}
