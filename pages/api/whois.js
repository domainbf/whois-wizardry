
import net from 'net';
import { DOMAIN_WHOIS_SERVERS, IP_WHOIS_SERVERS } from '../../src/data/whoisServers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持GET请求' });
  }

  const { query, type = 'domain' } = req.query;

  if (!query) {
    return res.status(400).json({ error: '请提供查询参数' });
  }

  try {
    let whoisServer;
    let whoisQuery = query;

    if (type === 'domain') {
      const tld = query.split('.').pop()?.toLowerCase();
      whoisServer = DOMAIN_WHOIS_SERVERS[tld];
      
      if (!whoisServer) {
        return res.status(400).json({ error: `不支持查询 .${tld} 类型的域名` });
      }
    } else {
      // IP查询
      whoisServer = IP_WHOIS_SERVERS.default;
    }

    const whoisData = await performWhoisLookup(whoisServer, whoisQuery);
    
    if (whoisData.includes('No match for') || whoisData.includes('No entries found')) {
      return res.status(404).json({ 
        error: '未找到该域名信息',
        rawData: whoisData
      });
    }

    // 尝试解析WHOIS数据
    const parsedData = parseWhoisData(whoisData, type, query);
    
    return res.status(200).json({
      ...parsedData,
      rawData: whoisData
    });
  } catch (error) {
    console.error('WHOIS查询错误:', error);
    return res.status(500).json({ 
      error: '查询WHOIS服务器时出错: ' + (error.message || '未知错误'),
      details: error.toString()
    });
  }
}

async function performWhoisLookup(server, query) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    let data = '';
    
    // 设置超时时间为10秒
    client.setTimeout(10000);
    
    client.connect(43, server, () => {
      // 发送查询，添加换行符
      client.write(query + '\r\n');
    });
    
    client.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    client.on('close', () => {
      resolve(data);
    });
    
    client.on('timeout', () => {
      client.destroy();
      reject(new Error('连接WHOIS服务器超时'));
    });
    
    client.on('error', (err) => {
      client.destroy();
      reject(err);
    });
  });
}

function parseWhoisData(data, type, query) {
  if (type === 'domain') {
    return parseDomainWhois(data, query);
  } else {
    return parseIPWhois(data, query);
  }
}

function parseDomainWhois(data, domain) {
  const result = {
    domain: domain,
    registrar: extractValue(data, ['Registrar:', 'Sponsoring Registrar:', 'Registrant Name:', '注册商:']),
    creationDate: extractValue(data, ['Creation Date:', 'Created On:', 'Registration Time:', '注册时间:']),
    expirationDate: extractValue(data, ['Registry Expiry Date:', 'Expiration Date:', 'Expiry Date:', '到期时间:']),
    updatedDate: extractValue(data, ['Updated Date:', 'Last Updated On:', '更新时间:']),
    status: extractMultiValue(data, ['Domain Status:', 'Status:', '域名状态:']),
    nameServers: extractMultiValue(data, ['Name Server:', 'Nameservers:', 'Name servers:', '域名服务器:'])
  };
  
  return result;
}

function parseIPWhois(data, ip) {
  const result = {
    ip: ip,
    range: extractValue(data, ['NetRange:', 'inetnum:', 'IP范围:']),
    organization: extractValue(data, ['Organization:', 'org-name:', 'OrgName:', '组织名称:']),
    country: extractValue(data, ['Country:', 'country:', '国家/地区:']),
    cidr: extractValue(data, ['CIDR:', 'cidr:']),
    created: extractValue(data, ['RegDate:', 'created:']),
    updated: extractValue(data, ['Updated:', 'last-modified:'])
  };
  
  return result;
}

function extractValue(data, keys) {
  for (const key of keys) {
    const regex = new RegExp(`${key}\\s*(.+)`, 'i');
    const match = data.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return null;
}

function extractMultiValue(data, keys) {
  const values = [];
  
  for (const key of keys) {
    const regex = new RegExp(`${key}\\s*(.+)`, 'gi');
    let match;
    
    while ((match = regex.exec(data)) !== null) {
      if (match[1] && match[1].trim()) {
        values.push(match[1].trim());
      }
    }
  }
  
  return values.length > 0 ? values : null;
}
