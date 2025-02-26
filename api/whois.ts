
import type { VercelRequest, VercelResponse } from '@vercel/node';
import net from 'net';

const queryWhois = async (domain: string, server: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(43, server);
    let data = '';

    socket.setTimeout(10000);

    socket.on('connect', () => {
      // 针对 Verisign 服务器的特殊处理
      const query = server.includes('verisign-grs.com') 
        ? `domain ${domain}\r\n`
        : `${domain}\r\n`;
      socket.write(query);
    });

    socket.on('data', (chunk) => {
      data += chunk.toString();
    });

    socket.on('end', () => {
      if (data.trim()) {
        resolve(data);
      } else {
        reject(new Error('No data received'));
      }
    });

    socket.on('timeout', () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });

    socket.on('error', (err) => {
      reject(err);
    });
  });
};

const extractValue = (data: string, patterns: RegExp[]): string | null => {
  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
};

const parseWhois = (data: string) => {
  const parsed: Record<string, any> = {};

  // 提取域名
  const domainName = extractValue(data, [
    /Domain Name:\s*(.+)/i,
    /domain:\s*(.+)/i
  ]);
  if (domainName) parsed.domainName = domainName;

  // 提取注册商
  const registrar = extractValue(data, [
    /Registrar:\s*(.+)/i,
    /Sponsoring Registrar:\s*(.+)/i
  ]);
  if (registrar) parsed.registrar = registrar;

  // 提取创建日期
  const creationDate = extractValue(data, [
    /Creation Date:\s*(.+)/i,
    /Created On:\s*(.+)/i,
    /Registration Time:\s*(.+)/i
  ]);
  if (creationDate) {
    try {
      parsed.creationDate = new Date(creationDate).toISOString();
    } catch (e) {
      console.error('Invalid creation date:', creationDate);
    }
  }

  // 提取过期日期
  const expirationDate = extractValue(data, [
    /Registry Expiry Date:\s*(.+)/i,
    /Expiration Date:\s*(.+)/i,
    /Registrar Registration Expiration Date:\s*(.+)/i
  ]);
  if (expirationDate) {
    try {
      parsed.expirationDate = new Date(expirationDate).toISOString();
    } catch (e) {
      console.error('Invalid expiration date:', expirationDate);
    }
  }

  // 提取域名服务器
  const nameServers: string[] = [];
  const nsRegex = /Name Server:\s*(.+)/ig;
  let nsMatch;
  while ((nsMatch = nsRegex.exec(data)) !== null) {
    if (nsMatch[1]) {
      nameServers.push(nsMatch[1].trim().toLowerCase());
    }
  }
  if (nameServers.length > 0) {
    parsed.nameServers = nameServers;
  }

  return parsed;
};

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // 允许跨域请求
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { domain, server } = req.query;

  if (!domain || typeof domain !== 'string' || !server || typeof server !== 'string') {
    res.status(400).json({ error: 'Invalid parameters' });
    return;
  }

  try {
    console.log(`Querying WHOIS for ${domain} using server ${server}`);
    const whoisData = await queryWhois(domain, server);
    
    try {
      const parsedData = parseWhois(whoisData);
      
      // 如果成功解析数据
      if (Object.keys(parsedData).length > 0) {
        res.status(200).json(parsedData);
      } else {
        // 如果没有解析出数据，返回原始数据
        res.status(200).json({
          rawData: whoisData,
          error: '无法解析WHOIS数据，显示原始响应'
        });
      }
    } catch (parseError) {
      // 解析错误时返回原始数据
      res.status(200).json({
        rawData: whoisData,
        error: '数据解析失败，显示原始响应'
      });
    }
  } catch (error) {
    console.error('WHOIS query error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : '查询失败'
    });
  }
}
