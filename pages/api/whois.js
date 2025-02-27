
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

  const { domain, server } = req.query;
  
  if (!domain) {
    return res.status(400).json({ error: '请提供域名参数' });
  }
  
  if (!server) {
    return res.status(400).json({ error: '请提供WHOIS服务器参数' });
  }

  try {
    console.log(`开始查询域名: ${domain}，服务器: ${server}`);
    
    // 查询WHOIS信息
    const whoisData = await queryWhois(domain, server);
    
    if (!whoisData || whoisData.trim() === '') {
      return res.status(500).json({ error: '未收到WHOIS服务器响应' });
    }
    
    console.log(`收到WHOIS响应，长度: ${whoisData.length}字节`);
    
    // 检查是否有错误信息
    if (whoisData.includes('No match for') || 
        whoisData.includes('NOT FOUND') || 
        whoisData.includes('No Data Found') || 
        whoisData.includes('No entries found')) {
      return res.status(200).json({
        domain,
        whoisServer: server,
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
        whoisServer: server,
        data: parsedData,
        rawData: whoisData
      });
    } catch (parseError) {
      console.error('WHOIS数据解析错误:', parseError);
      
      // 如果解析失败，仍然返回原始数据
      return res.status(200).json({
        domain,
        whoisServer: server,
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

// 改进的WHOIS服务器查询函数
function queryWhois(domain, server) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let data = '';
    let hasError = false;
    
    // 设置较长的超时时间
    const timeout = 20000; // 增加到20秒
    let timer = setTimeout(() => {
      if (!hasError) {
        hasError = true;
        socket.destroy();
        reject(new Error('查询超时，WHOIS服务器未响应'));
      }
    }, timeout);
    
    socket.connect(43, server, () => {
      console.log(`已连接到WHOIS服务器: ${server}`);
      
      // 针对不同的服务器可能需要不同的查询格式
      let queryString = domain;
      
      // 针对不同WHOIS服务器的专门处理
      if (server.includes('verisign-grs.com') || 
          server.includes('whois.nic.') || 
          server.includes('whois.gtld.') ||
          server.includes('whois.registry')) {
        queryString = `domain ${domain}`;
      } else if (server === 'whois.denic.de') {
        queryString = `-T dn ${domain}`;
      } else if (server === 'whois.kr') {
        queryString = `${domain}/e`;
      } else if (server === 'whois.jprs.jp') {
        queryString = `${domain}/e`;
      } else if (server.includes('afilias')) {
        queryString = `domain ${domain}`;
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

// 强化的WHOIS数据解析函数
function parseWhoisData(rawData, domainName) {
  // 预处理 - 删除可能干扰解析的特殊字符
  const processedData = rawData
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n\s+/g, ' '); // 合并多行值
  
  const result = {
    // 核心信息
    domainName: extractValue(processedData, [
      /Domain Name:?\s*([^\s]+)/i, 
      /domain:?\s*([^\s]+)/i,
      /Dominio:?\s*([^\s]+)/i,
      /Domain\s*Name\s*\.+:?\s*([^\s]+)/i,
      new RegExp(`\\b${domainName}\\b`, 'i')
    ]) || domainName,
    
    // 注册商信息
    registrar: extractValue(processedData, [
      /Registrar:?\s*(.+?)(?:\n|$)/i, 
      /Sponsoring\s*Registrar:?\s*(.+?)(?:\n|$)/i,
      /Registration\s*Service\s*Provider:?\s*(.+?)(?:\n|$)/i,
      /Registrar\s*Organization:?\s*(.+?)(?:\n|$)/i,
      /Registrar\s*Name:?\s*(.+?)(?:\n|$)/i,
      /Registrant:?\s*(.+?)(?:\n|$)/i
    ]),
    
    // 状态信息
    status: extractMultipleValues(processedData, [
      /Status:?\s*(.+?)(?:\n|$)/gi, 
      /Domain\s*Status:?\s*(.+?)(?:\n|$)/gi,
      /状态:?\s*(.+?)(?:\n|$)/gi
    ]),
    
    // 日期信息 - 增加更多模式以适应不同格式
    creationDate: formatDate(extractValue(processedData, [
      /Creation\s*Date:?\s*(.+?)(?:\n|$)/i, 
      /Created:?\s*(.+?)(?:\n|$)/i, 
      /Created\s*On:?\s*(.+?)(?:\n|$)/i,
      /Created\s*Date:?\s*(.+?)(?:\n|$)/i,
      /Registration\s*Time:?\s*(.+?)(?:\n|$)/i,
      /Registered\s*on:?\s*(.+?)(?:\n|$)/i,
      /Registered\s*Date:?\s*(.+?)(?:\n|$)/i,
      /Domain\s*Registration\s*Date:?\s*(.+?)(?:\n|$)/i,
      /登记日期:?\s*(.+?)(?:\n|$)/i
    ])),
    
    expirationDate: formatDate(extractValue(processedData, [
      /Registry\s*Expiry\s*Date:?\s*(.+?)(?:\n|$)/i, 
      /Expiration\s*Date:?\s*(.+?)(?:\n|$)/i, 
      /Expiry\s*Date:?\s*(.+?)(?:\n|$)/i,
      /Expiry:?\s*(.+?)(?:\n|$)/i,
      /Expires\s*On:?\s*(.+?)(?:\n|$)/i,
      /Expires:?\s*(.+?)(?:\n|$)/i,
      /Registrar\s*Registration\s*Expiration\s*Date:?\s*(.+?)(?:\n|$)/i,
      /Domain\s*Expiration\s*Date:?\s*(.+?)(?:\n|$)/i,
      /到期日期:?\s*(.+?)(?:\n|$)/i
    ])),
    
    updatedDate: formatDate(extractValue(processedData, [
      /Updated\s*Date:?\s*(.+?)(?:\n|$)/i, 
      /Last\s*Updated:?\s*(.+?)(?:\n|$)/i,
      /Last\s*Modified:?\s*(.+?)(?:\n|$)/i,
      /Last\s*Update:?\s*(.+?)(?:\n|$)/i,
      /Domain\s*Last\s*Updated\s*Date:?\s*(.+?)(?:\n|$)/i,
      /更新日期:?\s*(.+?)(?:\n|$)/i
    ])),
    
    // 服务器信息
    nameServers: extractMultipleValues(processedData, [
      /Name\s*Server:?\s*([^\s]+)/gi, 
      /Nserver:?\s*([^\s]+)/gi,
      /DNS:?\s*([^\s]+)/gi,
      /Nameservers:?\s*([^\s]+)/gi,
      /Name\s*Server\s*\.+:?\s*([^\s]+)/gi,
      /Domain\s*Name\s*Server:?\s*([^\s]+)/gi,
      /域名服务器:?\s*([^\s]+)/gi
    ]),
    
    // 联系人信息
    registrant: extractContact(processedData, 'Registrant'),
    admin: extractContact(processedData, 'Admin'),
    tech: extractContact(processedData, 'Tech')
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

// 增强的提取单个值的函数
function extractValue(data, patterns) {
  for (const pattern of patterns) {
    try {
      const match = data.match(pattern);
      if (match && match[1]) {
        const value = match[1].trim();
        // 过滤掉过长的无效值或纯URL
        if (value.length < 500 && !/^https?:\/\//.test(value)) {
          return value;
        }
      }
    } catch (err) {
      console.error(`正则表达式匹配错误 [${pattern}]:`, err.message);
    }
  }
  return null;
}

// 增强的提取多个值的函数
function extractMultipleValues(data, patterns) {
  const values = [];
  
  for (const pattern of patterns) {
    try {
      let matches;
      try {
        matches = Array.from(data.matchAll(pattern));
      } catch (e) {
        // 如果环境不支持matchAll，使用传统方法
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
          // 过滤掉过长的无效值或纯URL
          if (value.length < 500 && !/^https?:\/\//.test(value) && !values.includes(value)) {
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

// 改进的联系人信息提取函数
function extractContact(data, type) {
  const contact = {};
  
  try {
    // 增加更多可能的字段匹配模式
    const fieldPatterns = {
      'name': [
        new RegExp(`${type}[\\s-_]*Name:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'organization': [
        new RegExp(`${type}[\\s-_]*Organization:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Organisation:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Org:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'email': [
        new RegExp(`${type}[\\s-_]*Email:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*E-mail:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Mail:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'phone': [
        new RegExp(`${type}[\\s-_]*Phone:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Tel:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Telephone:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'address': [
        new RegExp(`${type}[\\s-_]*Address:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Street:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'city': [
        new RegExp(`${type}[\\s-_]*City:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'state': [
        new RegExp(`${type}[\\s-_]*State:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*Province:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'postalCode': [
        new RegExp(`${type}[\\s-_]*Postal[\\s-_]*Code:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*ZIP:?\\s*(.+?)(?:\\n|$)`, 'i'),
        new RegExp(`${type}[\\s-_]*ZIP[\\s-_]*Code:?\\s*(.+?)(?:\\n|$)`, 'i')
      ],
      'country': [
        new RegExp(`${type}[\\s-_]*Country:?\\s*(.+?)(?:\\n|$)`, 'i')
      ]
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

// 增强的日期格式化函数
function formatDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // 清理和标准化日期字符串
    let cleanDate = dateStr
      .replace(/before update|after update/gi, '') // 删除额外标记
      .replace(/[（\(][^）\)]*[）\)]/g, '') // 删除括号内容
      .replace(/(\d+)[\/\.-](\d+)[\/\.-](\d+)/, '$1-$2-$3') // 标准化分隔符
      .replace(/T/, ' ')                                   // 移除T分隔符
      .replace(/Z$/, ' +0000')                             // 标准化UTC标记
      .replace(/UTC$/, ' +0000')                           // 标准化UTC标记
      .replace(/CST$/, ' +0800')                           // 处理中国标准时间
      .replace(/[^\x20-\x7E]/g, '')                       // 删除非ASCII字符
      .trim();
    
    // 处理常见格式
    if (/^\d{4}.\d{2}.\d{2}$/.test(cleanDate)) {
      cleanDate += ' 00:00:00';
    }
    
    // 尝试解析日期
    const date = new Date(cleanDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }

    // 尝试处理特殊格式 (YYYY-MM-DDThh:mm:ssZ)
    const isoMatch = cleanDate.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)/);
    if (isoMatch && isoMatch[1]) {
      const isoDate = new Date(isoMatch[1]);
      if (!isNaN(isoDate.getTime())) {
        return isoDate.toISOString();
      }
    }
    
    // 处理其他特殊格式如 "23-Jan-2022"
    const monthNamesMap = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
      'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    const specialMatch = cleanDate.match(/(\d{1,2})[-\s]([a-zA-Z]{3})[-\s](\d{4})/);
    if (specialMatch) {
      const day = specialMatch[1].padStart(2, '0');
      const month = monthNamesMap[specialMatch[2].toLowerCase()];
      const year = specialMatch[3];
      
      if (month) {
        const reformatted = `${year}-${month}-${day}T00:00:00Z`;
        const specialDate = new Date(reformatted);
        if (!isNaN(specialDate.getTime())) {
          return specialDate.toISOString();
        }
      }
    }
  } catch (e) {
    console.error('日期解析错误:', e.message, dateStr);
  }
  
  return dateStr; // 如果所有解析都失败，返回原始字符串
}
