
import type { VercelRequest, VercelResponse } from '@vercel/node';
import net from 'net';

interface WhoisQuery {
  domain: string;
  server: string;
}

interface ParsedWhoisData {
  domainName?: string;
  registrar?: string;
  creationDate?: string;
  expirationDate?: string;
  updatedDate?: string;
  nameServers?: string[];
  status?: string[];
}

const parseWhoIsData = (rawData: string): ParsedWhoisData => {
  const result: ParsedWhoisData = {};
  
  // Domain Name
  const domainMatch = rawData.match(/Domain Name: *(.+)|Domain name: *(.+)|domain name: *(.+)/i);
  if (domainMatch) result.domainName = (domainMatch[1] || domainMatch[2] || domainMatch[3]).trim();
  
  // Registrar
  const registrarMatch = rawData.match(/Registrar: *(.+)|Sponsoring Registrar: *(.+)|Registrar Name: *(.+)/i);
  if (registrarMatch) result.registrar = (registrarMatch[1] || registrarMatch[2] || registrarMatch[3]).trim();
  
  // Creation Date
  const creationMatch = rawData.match(/Creation Date: *(.+)|Created On: *(.+)|Registration Time: *(.+)|Created Date: *(.+)/i);
  if (creationMatch) {
    const dateStr = (creationMatch[1] || creationMatch[2] || creationMatch[3] || creationMatch[4]).trim();
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        result.creationDate = date.toISOString();
      }
    } catch (e) {
      console.error('Date parsing error:', e);
    }
  }
  
  // Expiration Date
  const expirationMatch = rawData.match(/Registry Expiry Date: *(.+)|Expiration Date: *(.+)|Expiration Time: *(.+)|Expiry Date: *(.+)/i);
  if (expirationMatch) {
    const dateStr = (expirationMatch[1] || expirationMatch[2] || expirationMatch[3] || expirationMatch[4]).trim();
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        result.expirationDate = date.toISOString();
      }
    } catch (e) {
      console.error('Date parsing error:', e);
    }
  }
  
  // Name Servers
  const nameServers: string[] = [];
  const nsMatches = rawData.matchAll(/Name Server: *(.+)|Nameserver: *(.+)|DNS: *(.+)/ig);
  for (const match of Array.from(nsMatches)) {
    if (match[1] || match[2] || match[3]) {
      nameServers.push((match[1] || match[2] || match[3]).trim().toLowerCase());
    }
  }
  if (nameServers.length > 0) result.nameServers = nameServers;

  // Status
  const statusList: string[] = [];
  const statusMatches = rawData.matchAll(/Status: *(.+)|Domain Status: *(.+)/ig);
  for (const match of Array.from(statusMatches)) {
    if (match[1]) {
      statusList.push(match[1].trim());
    }
  }
  if (statusList.length > 0) result.status = statusList;

  return result;
};

const queryWhois = async ({ domain, server }: WhoisQuery): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`连接到 ${server} 查询域名 ${domain}`);
    const socket = net.createConnection(43, server);
    let response = '';

    socket.setTimeout(15000);

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('查询超时'));
    }, 15000);

    socket.on('connect', () => {
      console.log('已连接到 WHOIS 服务器');
      // Verisign 服务器需要特殊的查询格式
      if (server.includes('verisign-grs.com')) {
        socket.write(`domain ${domain}\r\n`);
      } else {
        socket.write(`${domain}\r\n`);
      }
    });

    socket.on('data', (data) => {
      console.log('收到 WHOIS 服务器响应');
      response += data.toString('utf8');
    });

    socket.on('end', () => {
      clearTimeout(timeout);
      if (!response) {
        reject(new Error('未收到响应'));
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
  console.log('收到请求:', req.query);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持 GET 请求' });
  }

  const { domain, server } = req.query;

  if (!domain || typeof domain !== 'string' || !server || typeof server !== 'string') {
    return res.status(400).json({ error: '无效的参数' });
  }

  try {
    const rawData = await queryWhois({ domain, server });
    console.log('原始 WHOIS 数据:', rawData);
    
    const cleanedData = cleanWhoisData(rawData);
    console.log('清理后的 WHOIS 数据:', cleanedData);
    
    if (!cleanedData) {
      return res.status(500).json({ error: '未收到有效数据' });
    }

    const parsedData = parseWhoIsData(cleanedData);
    console.log('解析后的 WHOIS 数据:', parsedData);
    
    if (Object.keys(parsedData).length === 0) {
      return res.status(200).json({
        rawData: cleanedData,
        error: '无法解析 WHOIS 数据，显示原始数据'
      });
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
