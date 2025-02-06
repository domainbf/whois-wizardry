// 在文件开头添加接口定义
interface WhoisQuery {
  domain: string;
  server: string;
}

// 添加查询函数
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

// 添加数据清理函数
const cleanWhoisData = (rawData: string): string => {
  return rawData
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\s+$/, '')
    .trim();
};

// 修改现有的 handler 函数
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
