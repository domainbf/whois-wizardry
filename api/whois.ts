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
      resolve(response);
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
};

const cleanWhoisData = (rawData: string): string => {
  return rawData
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();
};

const handler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持GET请求' });
  }

  const { domain, server } = req.query;

  if (!domain || typeof domain !== 'string' || !server || typeof server !== 'string') {
    return res.status(400).json({ error: '参数无效' });
  }

  try {
    const rawData = await queryWhois({ domain, server });
    const cleanedData = cleanWhoisData(rawData);
    
    try {
      const parsedData = await parseWhoIsData(cleanedData);
      return res.status(200).json(parsedData);
    } catch (parseError) {
      return res.status(200).json({
        rawData: cleanedData,
        error: '无法解析WHOIS数据，显示原始信息'
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '查询失败'
    });
  }
};

export default handler;
