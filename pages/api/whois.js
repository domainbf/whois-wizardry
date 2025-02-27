
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
    console.log(`开始查询域名: ${domain}`);
    
    // 获取域名后缀
    const tld = domain.split('.').pop().toLowerCase();
    const whoisServer = getWhoisServer(tld);
    
    if (!whoisServer) {
      return res.status(400).json({ error: `不支持的域名后缀: .${tld}` });
    }

    console.log(`使用WHOIS服务器: ${whoisServer}`);
    
    // 查询WHOIS信息
    const whoisData = await queryWhois(domain, whoisServer);
    
    if (!whoisData || whoisData.trim() === '') {
      return res.status(500).json({ error: '未收到WHOIS服务器响应' });
    }
    
    console.log(`收到WHOIS响应，长度: ${whoisData.length}字节`);
    
    // 检查是否有错误信息
    if (whoisData.includes('No match for') || whoisData.includes('NOT FOUND')) {
      return res.status(200).json({
        domain,
        whoisServer,
        error: '未找到该域名的记录',
        rawData: whoisData
      });
    }
    
    // 尝试解析数据
    try {
      const parsedData = parseWhoisData(whoisData, domain);
      console.log('WHOIS数据解析结果:', Object.keys(parsedData));
      
      // 返回结果
      return res.status(200).json({
        domain,
        whoisServer,
        data: parsedData,
        rawData: whoisData
      });
    } catch (parseError) {
      console.error('WHOIS数据解析错误:', parseError);
      
      // 如果解析失败，仍然返回原始数据
      return res.status(200).json({
        domain,
        whoisServer,
        error: '解析WHOIS数据时出错，但原始数据可用',
        rawData: whoisData
      });
    }
  } catch (error) {
    console.error('WHOIS查询错误:', error);
    return res.status(500).json({ 
      error: typeof error === 'string' ? error : error.message || '查询失败',
      details: error.stack
    });
  }
}

// WHOIS服务器查询函数 - 更加健壮的实现
function queryWhois(domain, server) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = '';
    let hasError = false;
    
    // 设置较长的超时时间
    const timeout = 15000;
    let timer = setTimeout(() => {
      if (!hasError) {
        hasError = true;
        socket.destroy();
        reject(new Error('查询超时'));
      }
    }, timeout);
    
    socket.connect(43, server, () => {
      console.log(`已连接到WHOIS服务器: ${server}`);
      
      // 针对不同的服务器可能需要不同的查询格式
      let queryString = domain;
      
      // 针对Verisign和其他特殊服务器的处理
      if (server.includes('verisign-grs.com') || server.includes('whois.nic.') || server.includes('whois.gtld.')) {
        queryString = `domain ${domain}`;
      } else if (server === 'whois.denic.de') {
        queryString = `-T dn ${domain}`;
      } else if (server === 'whois.kr') {
        queryString = `${domain}/e`;
      }
      
      console.log(`发送查询: "${queryString}"`);
      socket.write(queryString + '\r\n');
    });

    socket.on('data', (chunk) => {
      data += chunk.toString();
    });

    socket.on('close', () => {
      clearTimeout(timer);
      if (!hasError) {
        resolve(data);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timer);
      if (!hasError) {
        hasError = true;
        console.error(`WHOIS服务器连接错误: ${err.message}`);
        reject(new Error(`连接WHOIS服务器失败: ${err.message}`));
      }
    });
  });
}

// 扩展WHOIS服务器列表
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
    'cc': 'whois.verisign-grs.com',
    'tv': 'whois.verisign-grs.com',
    'me': 'whois.nic.me',
    'co': 'whois.nic.co',
    'io': 'whois.nic.io',
    'app': 'whois.nic.google',
    'dev': 'whois.nic.google',
    // 添加更多流行TLD
    'ai': 'whois.nic.ai',
    'de': 'whois.denic.de',
    'uk': 'whois.nic.uk',
    'jp': 'whois.jprs.jp',
    'fr': 'whois.nic.fr',
    'ru': 'whois.tcinet.ru',
    'eu': 'whois.eu',
    'us': 'whois.nic.us',
    'au': 'whois.auda.org.au',
    'ca': 'whois.cira.ca',
    'br': 'whois.registro.br',
    'es': 'whois.nic.es',
    'se': 'whois.iis.se',
    'nl': 'whois.domain-registry.nl',
    'dk': 'whois.dk-hostmaster.dk',
    'pl': 'whois.dns.pl',
    'it': 'whois.nic.it',
    'ch': 'whois.nic.ch',
    'kr': 'whois.kr',
    'at': 'whois.nic.at',
    'nz': 'whois.nic.nz',
    'in': 'whois.registry.in',
    'mx': 'whois.mx',
    'edu': 'whois.educause.edu',
    'gov': 'whois.dotgov.gov',
    'mil': 'whois.nic.mil',
    // 新兴TLD
    'tech': 'whois.nic.tech',
    'buzz': 'whois.nic.buzz',
    'blog': 'whois.nic.blog',
    'art': 'whois.nic.art',
    'cloud': 'whois.nic.cloud',
    'digital': 'whois.nic.digital',
    'live': 'whois.nic.live',
    'email': 'whois.nic.email',
    'game': 'whois.nic.game',
    'design': 'whois.nic.design',
    'store': 'whois.nic.store'
  };
  
  return whoisServers[tld] || null;
}

// 改进的WHOIS数据解析函数
function parseWhoisData(rawData, domainName) {
  const result = {
    // 核心信息
    domainName: extractValue(rawData, [
      /Domain Name:?\s*([^\s]+)/i, 
      /domain:\s*([^\s]+)/i,
      /Dominio:\s*([^\s]+)/i,
      new RegExp(`\\b${domainName}\\b`, 'i')
    ]) || domainName,
    
    // 注册商信息
    registrar: extractValue(rawData, [
      /Registrar:?\s*(.+)/i, 
      /Sponsoring Registrar:?\s*(.+)/i,
      /Registration Service Provider:?\s*(.+)/i,
      /Registrar Organization:?\s*(.+)/i,
      /Registrant:?\s*(.+)/i
    ]),
    
    // 状态信息
    status: extractMultipleValues(rawData, [
      /Status:?\s*(.+)/gi, 
      /Domain Status:?\s*(.+)/gi,
      /状态:?\s*(.+)/gi
    ]),
    
    // 日期信息
    creationDate: formatDate(extractValue(rawData, [
      /Creation Date:?\s*(.+)/i, 
      /Created:?\s*(.+)/i, 
      /Created On:?\s*(.+)/i,
      /Registration Time:?\s*(.+)/i,
      /Registered on:?\s*(.+)/i,
      /登记日期:?\s*(.+)/i
    ])),
    
    expirationDate: formatDate(extractValue(rawData, [
      /Registry Expiry Date:?\s*(.+)/i, 
      /Expiration Date:?\s*(.+)/i, 
      /Expiry Date:?\s*(.+)/i,
      /Expiry:?\s*(.+)/i,
      /Expires On:?\s*(.+)/i,
      /Expires:?\s*(.+)/i,
      /到期日期:?\s*(.+)/i
    ])),
    
    updatedDate: formatDate(extractValue(rawData, [
      /Updated Date:?\s*(.+)/i, 
      /Last Updated:?\s*(.+)/i,
      /Last Modified:?\s*(.+)/i,
      /Last Update:?\s*(.+)/i,
      /更新日期:?\s*(.+)/i
    ])),
    
    // 服务器信息
    nameServers: extractMultipleValues(rawData, [
      /Name Server:?\s*([^\s]+)/gi, 
      /Nserver:?\s*([^\s]+)/gi,
      /DNS:?\s*([^\s]+)/gi,
      /Nameservers:?\s*([^\s]+)/gi,
      /域名服务器:?\s*([^\s]+)/gi
    ]),
    
    // 联系人信息
    registrant: extractContact(rawData, 'Registrant'),
    admin: extractContact(rawData, 'Admin'),
    tech: extractContact(rawData, 'Tech')
  };

  // 清理空值
  return Object.fromEntries(
    Object.entries(result).filter(([, value]) => 
      value !== undefined && value !== null && 
      (Array.isArray(value) ? value.length > 0 : true) &&
      (typeof value === 'object' ? Object.keys(value).length > 0 : true)
    )
  );
}

// 改进提取单个值的函数，增加更多日志记录
function extractValue(data, patterns) {
  for (const pattern of patterns) {
    try {
      const match = data.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    } catch (err) {
      console.error(`正则表达式匹配错误 [${pattern}]:`, err.message);
    }
  }
  return null;
}

// 改进提取多个值的函数
function extractMultipleValues(data, patterns) {
  const values = [];
  
  for (const pattern of patterns) {
    try {
      let matches;
      try {
        matches = Array.from(data.matchAll(pattern));
      } catch (e) {
        // 如果浏览器不支持matchAll (例如旧版Edge)，使用传统方法
        matches = [];
        let match;
        while ((match = pattern.exec(data)) !== null) {
          matches.push(match);
        }
        // 重置正则表达式的lastIndex
        pattern.lastIndex = 0;
      }
      
      for (const match of matches) {
        if (match[1]) {
          const value = match[1].trim();
          if (!values.includes(value)) {
            values.push(value);
          }
        }
      }
    } catch (err) {
      console.error(`提取多个值时出错 [${pattern}]:`, err.message);
    }
  }
  
  return values.length > 0 ? values : null;
}

// 改进联系人信息提取函数
function extractContact(data, type) {
  const contact = {};
  
  try {
    // 尝试提取常见的联系人字段
    const fieldPatterns = {
      'name': [new RegExp(`${type}[\\s-_]*Name:?\\s*(.+)`, 'i')],
      'organization': [new RegExp(`${type}[\\s-_]*Organization:?\\s*(.+)`, 'i')],
      'email': [new RegExp(`${type}[\\s-_]*Email:?\\s*(.+)`, 'i')],
      'phone': [new RegExp(`${type}[\\s-_]*Phone:?\\s*(.+)`, 'i')],
      'street': [new RegExp(`${type}[\\s-_]*Street:?\\s*(.+)`, 'i')],
      'city': [new RegExp(`${type}[\\s-_]*City:?\\s*(.+)`, 'i')],
      'state': [new RegExp(`${type}[\\s-_]*State:?\\s*(.+)`, 'i')],
      'postalCode': [new RegExp(`${type}[\\s-_]*Postal Code:?\\s*(.+)`, 'i')],
      'country': [new RegExp(`${type}[\\s-_]*Country:?\\s*(.+)`, 'i')]
    };
    
    for (const [field, patterns] of Object.entries(fieldPatterns)) {
      const value = extractValue(data, patterns);
      if (value) {
        contact[field] = value;
      }
    }
  } catch (err) {
    console.error(`提取联系人信息时出错 [${type}]:`, err.message);
  }
  
  return Object.keys(contact).length > 0 ? contact : null;
}

// 改进日期格式化函数
function formatDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // 处理常见的日期格式问题
    let cleanDate = dateStr
      .replace(/(\d+)[\/\.-](\d+)[\/\.-](\d+)/, '$1-$2-$3') // 标准化分隔符
      .replace(/T/, ' ')                                   // 移除T分隔符
      .replace(/Z$/, ' +0000')                             // 标准化UTC标记
      .replace(/UTC$/, ' +0000')                           // 标准化UTC标记
      .trim();
      
    // 尝试解析日期
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  } catch (e) {
    console.error('日期解析错误:', e.message, dateStr);
  }
  
  return dateStr; // 如果解析失败，返回原始字符串
}
