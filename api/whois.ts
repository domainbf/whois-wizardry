import net from 'net';
import { VercelRequest, VercelResponse } from '@vercel/node';

interface WhoisQuery {
  domain: string;
  server: string;
}

const parseWhoIsData = (rawData: string) => {
  const result: any = {};
  
  // 提取域名
  const domainMatch = rawData.match(/Domain Name: *(.+)/i);
  if (domainMatch) result.domainName = domainMatch[1].trim();
  
  // 提取注册商
  const registrarMatch = rawData.match(/Registrar: *(.+)/i);
  if (registrarMatch) result.registrar = registrarMatch[1].trim();
  
  // 提取创建日期
  const creationMatch = rawData.match(/Creation Date: *(.+)/i);
  if (creationMatch) {
    const date = new Date(creationMatch[1].trim());
    if (!isNaN(date.getTime())) {
      result.creationDate = date.toISOString();
    }
  }
  
  // 提取过期日期
  const expirationMatch = rawData.match(/Registry Expiry Date: *(.+)/i);
  if (expirationMatch) {
    const date = new Date(expirationMatch[1].trim());
    if (!isNaN(date.getTime())) {
      result.expirationDate = date.toISOString();
    }
  }
  
  // 提取域名服务器
  const nameServers: string[] = [];
  const nsMatches = rawData.matchAll(/Name Server: *(.+)/ig);
  for (const match of nsMatches) {
    if (match[1]) nameServers.push(match[1].trim());
  }
  if (nameServers.length > 0) result.nameServers = nameServers;

  // 如果没有提取到任何信息，抛出错误
  if (Object.keys(result).length === 0) {
    throw new Error('无法解析WHOIS数据');
  }

  return result;
};

const queryWhois = async ({ domain, server }: WhoisQuery): Promise<string> => {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection(43, server);
    let response = '';

    socket.setTimeout(15000);

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('查询超时'));
    }, 15000);

    socket.on('connect', () => {
      socket.write(`${domain}\r\n`, 'utf8');
    });

    socket.on('data', (data) => {
      response += data.toString('utf8');
    });

    socket.on('end', () => {
      clearTimeout(timeout);
      if (!response) {
        reject(new Error('未收到响应数据'));
      } else {
        resolve(response);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`连接错误: ${err.message}`));
    });

    socket.on('timeout', () => {
      socket.destroy();
      clearTimeout(timeout);
      reject(new Error('连接超时'));
    });
  });
};

const cleanWhoisData = (rawData: string): string => {
  return rawData
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+$/, '')
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
    
    if (!cleanedData) {
      return res.status(500).json({ error: '未获取到有效数据' });
    }

    try {
      const parsedData = await parseWhoIsData(cleanedData);
      return res.status(200).json(parsedData);
    } catch (parseError) {
      console.error('解析错误:', parseError);
      return res.status(200).json({
        rawData: cleanedData,
        error: '解析WHOIS数据失败，显示原始信息'
      });
    }
  } catch (error) {
    console.error('查询错误:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '查询失败'
    });
  }
};

export default handler;
