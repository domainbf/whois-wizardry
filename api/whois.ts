import type { VercelRequest, VercelResponse } from '@vercel/node';
import { parseWhoIsData } from 'whois-parsed-v2';
import net from 'net';

interface WhoisQuery {
  domain: string;
  server: string;
}

const queryWhois = async ({ domain, server }: WhoisQuery): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(43, server);
    let response = '';

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('查询超时'));
    }, 10000);

    socket.on('connect', () => {
      socket.write(`${domain}\r\n`);
    });

    socket.on('data', (data) => {
      response += data.toString();
    });

    socket.on('end', () => {
      clearTimeout(timeout);
      if (!response.trim()) {
        reject(new Error('未获取到 WHOIS 数据'));
      }
      resolve(response);
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持 GET 请求' });
  }

  const { domain, server } = req.query;

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: '请提供有效的域名' });
  }

  if (!server || typeof server !== 'string') {
    return res.status(400).json({ error: '请提供有效的 WHOIS 服务器' });
  }

  try {
    console.log(`开始查询域名: ${domain}, 服务器: ${server}`);
    const rawData = await queryWhois({ domain, server });
    console.log('获取到原始 WHOIS 数据:', rawData);
    
    if (!rawData.trim()) {
      throw new Error('WHOIS 服务器返回空数据');
    }

    try {
      const parsedData = await parseWhoIsData(rawData);
      console.log('WHOIS 数据解析完成:', parsedData);
      return res.status(200).json(parsedData);
    } catch (parseError) {
      console.error('WHOIS 数据解析错误:', parseError);
      // 如果解析失败，返回原始数据
      return res.status(200).json({
        rawData,
        error: '数据解析失败，显示原始数据',
        parseError: parseError instanceof Error ? parseError.message : String(parseError)
      });
    }
  } catch (error) {
    console.error('WHOIS 查询错误:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '查询失败',
      details: error instanceof Error ? error.stack : undefined
    });
  }
};

export default handler;