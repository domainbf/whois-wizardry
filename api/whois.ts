import type { VercelRequest, VercelResponse } from '@vercel/node';

// 定义查询接口
interface WhoisQuery {
  domain: string;
  server: string;
}

// 定义响应接口
interface WhoisResponse {
  data?: string;
  error?: string;
}

// WHOIS 查询函数
const queryWhois = async ({ domain, server }: WhoisQuery): Promise<string> => {
  return new Promise((resolve, reject) => {
    const net = import('net');
    
    net.then(({ createConnection }) => {
      const socket = createConnection(43, server);
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
    }).catch(reject);
  });
};

// API 处理函数
const handler = async (req: VercelRequest, res: VercelResponse) => {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 验证请求方法
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持 GET 请求' });
  }

  const { domain, server } = req.query;

  // 验证参数
  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: '请提供有效的域名' });
  }

  if (!server || typeof server !== 'string') {
    return res.status(400).json({ error: '请提供有效的 WHOIS 服务器' });
  }

  try {
    // 执行 WHOIS 查询
    const data = await queryWhois({ domain, server });
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(data);
  } catch (error) {
    console.error('WHOIS 查询错误:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '查询失败'
    });
  }
};

export default handler;