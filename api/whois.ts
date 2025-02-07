import net from 'net';
import { VercelRequest, VercelResponse } from '@vercel/node';

interface WhoisQuery {
  domain: string;
  server: string;
}

const parseWhoIsData = (rawData: string) => {
  const result: any = {};
  
  // 提取域名 - 增加多种匹配模式
  const domainMatch = rawData.match(/Domain Name: *(.+)|domain name: *(.+)/i);
  if (domainMatch) result.domainName = (domainMatch[1] || domainMatch[2]).trim();
  
  // 提取注册商 - 增加多种匹配模式
  const registrarMatch = rawData.match(/Registrar: *(.+)|Sponsoring Registrar: *(.+)/i);
  if (registrarMatch) result.registrar = (registrarMatch[1] || registrarMatch[2]).trim();
  
  // 提取创建日期 - 增加多种匹配模式
  const creationMatch = rawData.match(/Creation Date: *(.+)|Created On: *(.+)|Registration Time: *(.+)/i);
  if (creationMatch) {
    const dateStr = (creationMatch[1] || creationMatch[2] || creationMatch[3]).trim();
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        result.creationDate = date.toISOString();
      }
    } catch (e) {
      console.error('日期解析错误:', e);
    }
  }
  
  // 提取过期日期 - 增加多种匹配模式
  const expirationMatch = rawData.match(/Registry Expiry Date: *(.+)|Expiration Date: *(.+)|Expiration Time: *(.+)/i);
  if (expirationMatch) {
    const dateStr = (expirationMatch[1] || expirationMatch[2] || expirationMatch[3]).trim();
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        result.expirationDate = date.toISOString();
      }
    } catch (e) {
      console.error('日期解析错误:', e);
    }
  }
  
  // 提取域名服务器 - 增加多种匹配模式
  const nameServers: string[] = [];
  const nsMatches = rawData.matchAll(/Name Server: *(.+)|Nameserver: *(.+)/ig);
  for (const match of Array.from(nsMatches)) {
    if (match[1] || match[2]) {
      nameServers.push((match[1] || match[2]).trim().toLowerCase());
    }
  }
  if (nameServers.length > 0) result.nameServers = nameServers;

  // 如果没有提取到任何信息，返回原始数据
  if (Object.keys(result).length === 0) {
    return {
      rawData: rawData,
      error: '无法解析WHOIS数据，显示原始信息'
    };
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
      // 修改查询格式，添加特定前缀
      if (server.includes('verisign-grs.com')) {
        socket.write(`domain ${domain}\r\n`, 'utf8');
      } else {
        socket.write(`${domain}\r\n`, 'utf8');
      }
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

    const parsedData = await parseWhoIsData(cleanedData);
    // 如果返回的是原始数据，使用200状态码返回
    if (parsedData.rawData) {
      return res.status(200).json(parsedData);
    }
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('查询错误:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : '查询失败'
    });
  }
};

export default handler;
