import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Socket } from 'net';

interface WhoisResponse {
  success: boolean;
  data?: string;
  error?: string;
}

async function queryWhois(domain: string, server: string): Promise<WhoisResponse> {
  return new Promise((resolve) => {
    const client = new Socket();
    let data = '';

    // 设置超时
    const timeout = setTimeout(() => {
      client.destroy();
      resolve({ success: false, error: '查询超时' });
    }, 10000);

    client.connect(43, server, () => {
      client.write(domain + '\r\n');
    });

    client.on('data', (chunk) => {
      data += chunk;
    });

    client.on('end', () => {
      clearTimeout(timeout);
      client.destroy();
      resolve({ success: true, data });
    });

    client.on('error', (err) => {
      clearTimeout(timeout);
      client.destroy();
      resolve({ success: false, error: `查询失败: ${err.message}` });
    });
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允许' });
  }

  const { domain, server } = req.query;

  // 验证参数
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: '缺少域名参数' });
  }

  if (!server || typeof server !== 'string') {
    return res.status(400).json({ error: '缺少WHOIS服务器参数' });
  }

  try {
    const result = await queryWhois(domain, server);

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    // 设置正确的内容类型
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(result.data);
  } catch (error) {
    console.error('WHOIS查询错误:', error);
    return res.status(500).json({ error: '服务器内部错误' });
  }
}