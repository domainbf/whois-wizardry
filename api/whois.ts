// 文件路径: /api/whois.ts

import net from 'net';
import { VercelRequest, VercelResponse } from '@vercel/node';

interface WhoisQuery {
  domain: string;
  server: string;
}

const parseWhoIsData = (rawData: string) => {
  const result: any = {};
  
  // Domain Name
  const domainMatch = rawData.match(/Domain Name: *(.+)|Domain name: *(.+)|domain name: *(.+)/i);
  if (domainMatch) result.domainName = (domainMatch[1] || domainMatch[2] || domainMatch[3]).trim();
  
  // Registrar
  const registrarMatch = rawData.match(/Registrar: *(.+)|Registrar IANA ID: *(.+)|Sponsoring Registrar: *(.+)/i);
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
  const statusMatches = rawData.matchAll(/Status: *(.+)/ig);
  for (const match of Array.from(statusMatches)) {
    if (match[1]) {
      statusList.push(match[1].trim());
    }
  }
  if (statusList.length > 0) result.status = statusList;

  if (Object.keys(result).length === 0) {
    return {
      rawData: rawData,
      error: 'Unable to parse WHOIS data, showing raw data'
    };
  }

  return result;
};

const queryWhois = async ({ domain, server }: WhoisQuery): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to ${server} for domain ${domain}`); // Debug log
    const socket = net.createConnection(43, server);
    let response = '';

    socket.setTimeout(15000);

    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error('Query timeout'));
    }, 15000);

    socket.on('connect', () => {
      console.log('Connected to WHOIS server'); // Debug log
      if (server.includes('verisign-grs.com')) {
        socket.write(`domain ${domain}\r\n`, 'utf8');
      } else {
        socket.write(`${domain}\r\n`, 'utf8');
      }
    });

    socket.on('data', (data) => {
      console.log('Received data from WHOIS server'); // Debug log
      response += data.toString('utf8');
    });

    socket.on('end', () => {
      clearTimeout(timeout);
      if (!response) {
        reject(new Error('No response received'));
      } else {
        resolve(response);
      }
    });

    socket.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Connection error: ${err.message}`));
    });

    socket.on('timeout', () => {
      socket.destroy();
      clearTimeout(timeout);
      reject(new Error('Connection timeout'));
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
  console.log('Received request:', req.query); // Debug log

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Only GET requests are supported' });
  }

  const { domain, server } = req.query;

  if (!domain || typeof domain !== 'string' || !server || typeof server !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  try {
    const rawData = await queryWhois({ domain, server });
    console.log('Raw WHOIS data:', rawData); // Debug log
    
    const cleanedData = cleanWhoisData(rawData);
    console.log('Cleaned WHOIS data:', cleanedData); // Debug log
    
    if (!cleanedData) {
      return res.status(500).json({ error: 'No valid data received' });
    }

    const parsedData = await parseWhoIsData(cleanedData);
    console.log('Parsed WHOIS data:', parsedData); // Debug log
    
    return res.status(200).json(parsedData);
  } catch (error) {
    console.error('Query error:', error);
    return res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Query failed'
    });
  }
};

export default handler;
