import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Socket } from 'net';

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { domain, server } = req.query;

  if (!domain || !server) {
    return res.status(400).json({ error: '缺少必要参数' });
  }

  try {
    const whoisData = await queryWhois(domain.toString(), server.toString());
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.status(200).send(whoisData);
  } catch (error) {
    console.error('WHOIS查询错误:', error);
    return res.status(500).json({ error: '查询失败' });
  }
};

function queryWhois(domain: string, server: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const client = new Socket();
    let data = '';

    client.connect(43, server, () => {
      client.write(domain + '\r\n');
    });

    client.on('data', (chunk) => {
      data += chunk;
    });

    client.on('end', () => {
      client.destroy();
      resolve(data);
    });

    client.on('error', (err) => {
      client.destroy();
      reject(err);
    });

    // 设置超时
    client.setTimeout(10000, () => {
      client.destroy();
      reject(new Error('连接超时'));
    });
  });
}

export default handler;