
// Next.js API route
import net from 'net';

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
    // 获取域名后缀
    const tld = domain.split('.').pop().toLowerCase();
    const whoisServer = getWhoisServer(tld);
    
    if (!whoisServer) {
      return res.status(400).json({ error: `不支持的域名后缀: .${tld}` });
    }

    // 查询WHOIS信息
    const whoisData = await queryWhois(domain, whoisServer);
    
    // 尝试解析数据
    const parsedData = parseWhoisData(whoisData, tld);
    
    // 返回结果
    return res.status(200).json({
      domain,
      whoisServer,
      data: parsedData,
      rawData: whoisData
    });
  } catch (error) {
    console.error('WHOIS查询错误:', error);
    return res.status(500).json({ 
      error: typeof error === 'string' ? error : error.message || '查询失败' 
    });
  }
}

// WHOIS服务器查询函数
function queryWhois(domain, server) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = '';
    
    socket.connect(43, server, () => {
      // 针对不同的服务器可能需要不同的查询格式
      let queryString = domain;
      
      // 针对Verisign的特殊处理
      if (server.includes('verisign-grs.com')) {
        queryString = `domain ${domain}`;
      }
      
      socket.write(queryString + '\r\n');
    });

    socket.on('data', (chunk) => {
      data += chunk.toString();
    });

    socket.on('close', () => {
      resolve(data);
    });

    socket.on('error', (err) => {
      reject(`连接WHOIS服务器失败: ${err.message}`);
    });

    // 设置超时
    socket.setTimeout(10000, () => {
      socket.destroy();
      reject('查询超时');
    });
  });
}

// 根据TLD获取WHOIS服务器
function getWhoisServer(tld) {
  const whoisServers = {
    'com': 'whois.verisign-grs.com',
    'net': 'whois.verisign-grs.com',
    'org': 'whois.pir.org',
    'info': 'whois.afilias.net',
    'biz': 'whois.biz',
    'cn': 'whois.cnnic.cn',
    'xyz': 'whois.nic.xyz',
    'top': 'whois.nic.top',
    'vip': 'whois.nic.vip',
    'club': 'whois.nic.club',
    'shop': 'whois.nic.shop',
    'wang': 'whois.gtld.knet.cn',
    'xin': 'whois.gtld.knet.cn',
    'site': 'whois.nic.site',
    'ltd': 'whois.gtld.knet.cn',
    'online': 'whois.nic.online',
    'cc': 'ccwhois.verisign-grs.com',
    'tv': 'tvwhois.verisign-grs.com',
    'me': 'whois.nic.me',
    'co': 'whois.nic.co',
    'io': 'whois.nic.io',
    'app': 'whois.nic.google',
    'dev': 'whois.nic.google'
  };
  
  return whoisServers[tld] || null;
}

// 解析WHOIS数据
function parseWhoisData(rawData, tld) {
  // 基本结构
  const result = {
    domainName: extractValue(rawData, [/Domain Name:?\s*([^\s]+)/i, /Domain:?\s*([^\s]+)/i]),
    registrar: extractValue(rawData, [/Registrar:?\s*(.+)/i, /Sponsoring Registrar:?\s*(.+)/i]),
    status: extractMultipleValues(rawData, [/Status:?\s*(.+)/gi, /Domain Status:?\s*(.+)/gi]),
    creationDate: formatDate(extractValue(rawData, [/Creation Date:?\s*(.+)/i, /Created:?\s*(.+)/i, /Registration Time:?\s*(.+)/i])),
    expirationDate: formatDate(extractValue(rawData, [/Registry Expiry Date:?\s*(.+)/i, /Expiration Date:?\s*(.+)/i, /Expiry Date:?\s*(.+)/i])),
    updatedDate: formatDate(extractValue(rawData, [/Updated Date:?\s*(.+)/i, /Last Updated:?\s*(.+)/i])),
    nameServers: extractMultipleValues(rawData, [/Name Server:?\s*([^\s]+)/gi, /DNS:?\s*([^\s]+)/gi]),
    registrant: extractContact(rawData, 'Registrant'),
    admin: extractContact(rawData, 'Admin'),
    tech: extractContact(rawData, 'Tech')
  };
  
  // 根据TLD进行特殊处理
  if (tld === 'cn') {
    // 针对中国域名的特殊处理
    result.registrantName = extractValue(rawData, [/Registrant:?\s*(.+)/i]);
  }
  
  // 过滤掉undefined值
  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => value !== undefined)
  );
}

// 提取单个值
function extractValue(data, patterns) {
  for (const pattern of patterns) {
    const match = data.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return undefined;
}

// 提取多个值
function extractMultipleValues(data, patterns) {
  const values = [];
  
  for (const pattern of patterns) {
    const matches = data.matchAll(pattern);
    for (const match of Array.from(matches)) {
      if (match[1]) {
        const value = match[1].trim();
        if (!values.includes(value)) {
          values.push(value);
        }
      }
    }
  }
  
  return values.length > 0 ? values : undefined;
}

// 提取联系人信息
function extractContact(data, type) {
  const contact = {};
  
  const name = extractValue(data, [new RegExp(`${type}[\\s-_]*Name:?\\s*(.+)`, 'i')]);
  const org = extractValue(data, [new RegExp(`${type}[\\s-_]*Organization:?\\s*(.+)`, 'i')]);
  const email = extractValue(data, [new RegExp(`${type}[\\s-_]*Email:?\\s*(.+)`, 'i')]);
  
  if (name) contact.name = name;
  if (org) contact.organization = org;
  if (email) contact.email = email;
  
  return Object.keys(contact).length > 0 ? contact : undefined;
}

// 格式化日期
function formatDate(dateStr) {
  if (!dateStr) return undefined;
  
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.error('日期解析错误:', e);
  }
  
  return dateStr; // 如果解析失败，返回原始字符串
}
