
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2, AlertTriangle, Globe, Cpu } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import { 
  DOMAIN_WHOIS_SERVERS, 
  isIPAddress, 
  getIPWhoisServer,
  getDomainWhoisServer
} from "@/data/whoisServers";

const Index = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryType, setQueryType] = useState<"domain" | "ip">("domain");
  const { toast } = useToast();

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (isIPAddress(value)) {
      setQueryType("ip");
    } else {
      setQueryType("domain");
    }
  };

  const validateDomain = (domain: string) => {
    if (domain.startsWith('whois.')) {
      return false;
    }
    return /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z0-9-_.]+$/.test(domain);
  };

  const extractWhoisData = (rawData: string) => {
    console.log("Extracting data from raw WHOIS response:", rawData);
    
    if (!rawData || typeof rawData !== 'string') {
      console.error("Invalid WHOIS raw data:", rawData);
      return {};
    }
    
    const data: Record<string, any> = {};
    
    // Check if this is an error response
    if (rawData.includes("No match for domain") || 
        rawData.includes("No match for") || 
        rawData.includes("NOT FOUND") ||
        rawData.includes("No Data Found") ||
        rawData.includes("Domain not found")) {
      data.error = "域名未注册或无法获取信息";
      return data;
    }
    
    // Normalize line endings and remove extra spaces
    const normalizedData = rawData.replace(/\r\n/g, '\n').replace(/\n+/g, '\n');
    
    // Handle Verisign (.com, .net) responses which have a specific format
    if (rawData.includes('Whois Server Version 2.0') || 
        rawData.includes('whois.verisign-grs.com')) {
      console.log("Detected Verisign WHOIS format");
      
      // Extract the second WHOIS lookup for Verisign responses
      const referralWhoisMatch = normalizedData.match(/Registrar WHOIS Server:\s*(.+?)(?:\n|$)/);
      if (referralWhoisMatch && referralWhoisMatch[1]) {
        data.registrarWhoisServer = referralWhoisMatch[1].trim();
      }

      // Try to extract domain information
      const domainMatch = normalizedData.match(/Domain Name:\s*(.+?)(?:\n|$)/);
      if (domainMatch && domainMatch[1]) {
        data.domainName = domainMatch[1].trim();
      }

      // Extract registrar information
      const registrarMatch = normalizedData.match(/Registrar:\s*(.+?)(?:\n|$)/);
      if (registrarMatch && registrarMatch[1]) {
        data.registrar = registrarMatch[1].trim();
      }

      // Extract dates
      const createdMatch = normalizedData.match(/Creation Date:\s*(.+?)(?:\n|$)/);
      if (createdMatch && createdMatch[1]) {
        data.creationDate = createdMatch[1].trim();
      }

      const updatedMatch = normalizedData.match(/Updated Date:\s*(.+?)(?:\n|$)/);
      if (updatedMatch && updatedMatch[1]) {
        data.updatedDate = updatedMatch[1].trim();
      }

      const expiryMatch = normalizedData.match(/Registry Expiry Date:\s*(.+?)(?:\n|$)/) || 
                          normalizedData.match(/Registrar Registration Expiration Date:\s*(.+?)(?:\n|$)/);
      if (expiryMatch && expiryMatch[1]) {
        data.expirationDate = expiryMatch[1].trim();
      }

      // Extract name servers (may be multiple)
      const nameServers: string[] = [];
      const nameServerRegex = /Name Server:\s*(.+?)(?:\n|$)/g;
      let nsMatch;
      while ((nsMatch = nameServerRegex.exec(normalizedData)) !== null) {
        if (nsMatch[1] && nsMatch[1].trim()) {
          nameServers.push(nsMatch[1].trim().toLowerCase());
        }
      }
      if (nameServers.length > 0) {
        data.nameServers = nameServers;
      }
      
      // Extract domain status
      const statusValues: string[] = [];
      const statusRegex = /Domain Status:\s*(.+?)(?:\n|$)/g;
      let statusMatch;
      while ((statusMatch = statusRegex.exec(normalizedData)) !== null) {
        if (statusMatch[1] && statusMatch[1].trim()) {
          statusValues.push(statusMatch[1].trim());
        }
      }
      if (statusValues.length > 0) {
        data.status = statusValues;
      }
    } 
    // For Chinese domains (.cn)
    else if (normalizedData.includes('CNNIC WHOIS') || 
             normalizedData.includes('域名信息') || 
             normalizedData.includes('注册商')) {
      console.log("Detected Chinese WHOIS format");
      
      // Try specific Chinese patterns
      const cnRegistrarMatch = normalizedData.match(/注册商:\s*(.+?)(?:\n|$)/) || 
                             normalizedData.match(/Registrar:\s*(.+?)(?:\n|$)/);
      if (cnRegistrarMatch && cnRegistrarMatch[1]) {
        data.registrar = cnRegistrarMatch[1].trim();
      }
      
      const cnCreationMatch = normalizedData.match(/注册时间:\s*(.+?)(?:\n|$)/) || 
                            normalizedData.match(/Registration Date:\s*(.+?)(?:\n|$)/) ||
                            normalizedData.match(/注册日期:\s*(.+?)(?:\n|$)/);
      if (cnCreationMatch && cnCreationMatch[1]) {
        data.creationDate = cnCreationMatch[1].trim();
      }
      
      const cnExpirationMatch = normalizedData.match(/过期时间:\s*(.+?)(?:\n|$)/) || 
                              normalizedData.match(/Expiration Date:\s*(.+?)(?:\n|$)/) ||
                              normalizedData.match(/到期日期:\s*(.+?)(?:\n|$)/);
      if (cnExpirationMatch && cnExpirationMatch[1]) {
        data.expirationDate = cnExpirationMatch[1].trim();
      }
      
      // Extract name servers
      const nameServers: string[] = [];
      const nsRegex = /DNS服务器:\s*(.+?)(?:\n|$)/g;
      let nsMatch;
      while ((nsMatch = nsRegex.exec(normalizedData)) !== null) {
        if (nsMatch[1] && nsMatch[1].trim()) {
          nameServers.push(nsMatch[1].trim().toLowerCase());
        }
      }
      if (nameServers.length === 0) {
        // Try alternative pattern
        const nsRegex2 = /Name Server:\s*(.+?)(?:\n|$)/g;
        while ((nsMatch = nsRegex2.exec(normalizedData)) !== null) {
          if (nsMatch[1] && nsMatch[1].trim()) {
            nameServers.push(nsMatch[1].trim().toLowerCase());
          }
        }
      }
      if (nameServers.length > 0) {
        data.nameServers = nameServers;
      }
      
      // Extract status
      const cnStatusMatch = normalizedData.match(/状态:\s*(.+?)(?:\n|$)/) ||
                          normalizedData.match(/Domain Status:\s*(.+?)(?:\n|$)/);
      if (cnStatusMatch && cnStatusMatch[1]) {
        data.status = cnStatusMatch[1].trim();
      }
    }
    // General case for other WHOIS formats
    else {
      console.log("Processing general WHOIS format");
      
      // Try generic patterns for all fields
      
      // Domain name
      const domainNameMatch = normalizedData.match(/Domain Name:\s*(.+?)(?:\n|$)/);
      if (domainNameMatch && domainNameMatch[1]) {
        data.domainName = domainNameMatch[1].trim();
      }
      
      // Registrar patterns
      const registrarPatterns = [
        /Registrar:\s*(.+?)(?:\n|$)/,
        /Registrar Name:\s*(.+?)(?:\n|$)/,
        /Sponsoring Registrar:\s*(.+?)(?:\n|$)/,
        /Registration Service Provider:\s*(.+?)(?:\n|$)/,
        /Sponsoring Registrar Organization:\s*(.+?)(?:\n|$)/,
        /Registrant:\s*(.+?)(?:\n|$)/,
        /Holder:\s*(.+?)(?:\n|$)/
      ];
      
      for (const pattern of registrarPatterns) {
        const match = normalizedData.match(pattern);
        if (match && match[1] && match[1].trim()) {
          data.registrar = match[1].trim();
          break;
        }
      }
      
      // Creation date patterns
      const creationPatterns = [
        /Creation Date:\s*(.+?)(?:\n|$)/,
        /Created:\s*(.+?)(?:\n|$)/,
        /Created On:\s*(.+?)(?:\n|$)/,
        /Created Date:\s*(.+?)(?:\n|$)/,
        /Registration Date:\s*(.+?)(?:\n|$)/,
        /Domain Registration Date:\s*(.+?)(?:\n|$)/,
        /Domain Create Date:\s*(.+?)(?:\n|$)/,
        /Registration Time:\s*(.+?)(?:\n|$)/,
        /Registered on:\s*(.+?)(?:\n|$)/,
        /registered:\s*(.+?)(?:\n|$)/
      ];
      
      for (const pattern of creationPatterns) {
        const match = normalizedData.match(pattern);
        if (match && match[1] && match[1].trim()) {
          data.creationDate = match[1].trim();
          break;
        }
      }
      
      // Expiration date patterns
      const expirationPatterns = [
        /Expiration Date:\s*(.+?)(?:\n|$)/,
        /Registry Expiry Date:\s*(.+?)(?:\n|$)/,
        /Expiry Date:\s*(.+?)(?:\n|$)/,
        /Registrar Registration Expiration Date:\s*(.+?)(?:\n|$)/,
        /Domain Expiration Date:\s*(.+?)(?:\n|$)/,
        /Expires On:\s*(.+?)(?:\n|$)/,
        /Expires:\s*(.+?)(?:\n|$)/,
        /Expiry:\s*(.+?)(?:\n|$)/,
        /expire:\s*(.+?)(?:\n|$)/
      ];
      
      for (const pattern of expirationPatterns) {
        const match = normalizedData.match(pattern);
        if (match && match[1] && match[1].trim()) {
          data.expirationDate = match[1].trim();
          break;
        }
      }
      
      // Updated date patterns
      const updatedPatterns = [
        /Updated Date:\s*(.+?)(?:\n|$)/,
        /Last Updated On:\s*(.+?)(?:\n|$)/,
        /Last Modified:\s*(.+?)(?:\n|$)/,
        /Last Update:\s*(.+?)(?:\n|$)/,
        /Updated:\s*(.+?)(?:\n|$)/,
        /modified:\s*(.+?)(?:\n|$)/
      ];
      
      for (const pattern of updatedPatterns) {
        const match = normalizedData.match(pattern);
        if (match && match[1] && match[1].trim()) {
          data.updatedDate = match[1].trim();
          break;
        }
      }
      
      // Extract name servers
      const nameServers: string[] = [];
      
      // Try different name server patterns
      const nsPatterns = [
        /Name Server:\s*(.+?)(?:\n|$)/g,
        /nserver:\s*(.+?)(?:\n|$)/g,
        /Name Servers:\s*(.+?)(?:\n|$)/g,
        /Nameservers:\s*(.+?)(?:\n|$)/g,
        /DNS:\s*(.+?)(?:\n|$)/g
      ];
      
      for (const pattern of nsPatterns) {
        let nsMatch;
        while ((nsMatch = pattern.exec(normalizedData)) !== null) {
          if (nsMatch[1] && nsMatch[1].trim()) {
            nameServers.push(nsMatch[1].trim().toLowerCase());
          }
        }
        if (nameServers.length > 0) break;
      }
      
      // Special case: if name servers are listed in a block
      if (nameServers.length === 0) {
        const nsBlockMatch = normalizedData.match(/Name Servers:([\s\S]*?)(?:\n\n|\n[^\s]|$)/);
        if (nsBlockMatch && nsBlockMatch[1]) {
          const nsBlock = nsBlockMatch[1].trim();
          const nsLines = nsBlock.split('\n');
          for (const line of nsLines) {
            const trimmedLine = line.trim();
            if (trimmedLine && trimmedLine.includes('.')) {
              nameServers.push(trimmedLine.toLowerCase());
            }
          }
        }
      }
      
      if (nameServers.length > 0) {
        data.nameServers = nameServers;
      }
      
      // Extract status
      const statusValues: string[] = [];
      const statusRegex = /Domain Status:\s*(.+?)(?:\n|$)/g;
      let statusMatch;
      while ((statusMatch = statusRegex.exec(normalizedData)) !== null) {
        if (statusMatch[1] && statusMatch[1].trim()) {
          statusValues.push(statusMatch[1].trim());
        }
      }
      
      if (statusValues.length === 0) {
        const statusPatterns = [
          /Status:\s*(.+?)(?:\n|$)/,
          /Domain Status:\s*(.+?)(?:\n|$)/
        ];
        
        for (const pattern of statusPatterns) {
          const match = normalizedData.match(pattern);
          if (match && match[1] && match[1].trim()) {
            statusValues.push(match[1].trim());
            break;
          }
        }
      }
      
      if (statusValues.length > 0) {
        data.status = statusValues;
      }
    }
    
    console.log("Extracted WHOIS data:", data);
    return data;
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let cleanQuery = query.trim().toLowerCase();
    
    if (queryType === "domain") {
      cleanQuery = cleanQuery.replace(/^(https?:\/\/)?(www\.)?/i, "");
      cleanQuery = cleanQuery.split('/')[0].split('?')[0].split('#')[0];
      
      if (!cleanQuery) {
        toast({
          title: "错误",
          description: "请输入域名或IP地址",
          variant: "destructive",
        });
        return;
      }
      
      if (!validateDomain(cleanQuery)) {
        toast({
          title: "格式错误",
          description: "请输入有效的域名格式 (例如: example.com)，不要输入WHOIS服务器地址",
          variant: "destructive",
        });
        return;
      }

      const tld = cleanQuery.split('.').pop()?.toLowerCase();
      
      if (!tld || !DOMAIN_WHOIS_SERVERS[tld]) {
        toast({
          title: "不支持的域名",
          description: `当前不支持 .${tld} 后缀的域名查询`,
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!isIPAddress(cleanQuery)) {
        toast({
          title: "格式错误",
          description: "请输入有效的IP地址格式",
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      let url = `/api/whois?query=${encodeURIComponent(cleanQuery)}`;
      
      url += `&type=${queryType}`;
      
      if (queryType === "domain") {
        const tld = cleanQuery.split('.').pop()?.toLowerCase();
        if (tld && DOMAIN_WHOIS_SERVERS[tld]) {
          url += `&server=${encodeURIComponent(DOMAIN_WHOIS_SERVERS[tld])}`;
        }
      } else if (queryType === "ip") {
        const server = getIPWhoisServer(cleanQuery);
        url += `&server=${encodeURIComponent(server)}`;
      }
      
      console.log("Sending WHOIS request:", url);
      
      const response = await fetch(
        url,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Cache-Control': 'no-cache'
          }
        }
      ).catch(error => {
        console.error("Fetch error:", error);
        throw new Error(error.message || "网络请求失败，请检查网络连接");
      });
      
      clearTimeout(timeoutId);
      
      if (!response || !response.ok) {
        const status = response?.status || "未知";
        const statusText = response?.statusText || "未知错误";
        throw new Error(`查询失败 (HTTP ${status}: ${statusText})`);
      }
      
      const text = await response.text();
      console.log("Raw response:", text);
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (jsonError) {
        console.error("JSON parse error, trying to extract directly from text:", jsonError);
        data = {
          rawData: text
        };
      }
      
      console.log("Processed data:", data);
      
      if (data.error) {
        setError(data.error);
        toast({
          title: "查询出现问题",
          description: data.error,
          variant: "destructive",
        });
      } else {
        if (queryType === "domain") {
          let formattedData;
          
          if (data.rawData || (!data.registrar && !data.creationDate)) {
            const rawData = data.rawData || data.raw || text;
            const extractedData = extractWhoisData(rawData);
            
            formattedData = {
              domain: cleanQuery,
              type: "domain",
              data: {
                registrar: extractedData.registrar || "未知",
                creationDate: extractedData.creationDate || "未知",
                expirationDate: extractedData.expirationDate || "未知",
                updatedDate: extractedData.updatedDate || "未知",
                status: extractedData.status || "未知",
                nameServers: extractedData.nameServers || []
              },
              rawData: rawData
            };
          } else {
            formattedData = {
              domain: cleanQuery,
              type: "domain",
              data: {
                registrar: data.registrar || data.registrarName || "未知",
                creationDate: data.creationDate || data.createdDate || data.created || "未知",
                expirationDate: data.expirationDate || data.expiryDate || data.expires || "未知",
                updatedDate: data.updatedDate || data.updated || "未知",
                status: data.status || data.domainStatus || "未知",
                nameServers: data.nameServers || data.nameServer || []
              },
              rawData: data.rawData || data.raw || text || ""
            };
          }
          
          setResult(formattedData);
        } else {
          const formattedData = {
            ip: cleanQuery,
            type: "ip",
            data: {
              range: data.range || data.netRange || "未知",
              organization: data.organization || data.orgName || "未知",
              country: data.country || "未知",
              cidr: data.cidr || "未知",
              created: data.created || data.creationDate || "未知",
              updated: data.updated || data.updatedDate || "未知",
            },
            rawData: data.rawData || data.raw || text || ""
          };
          setResult(formattedData);
        }
      }
    } catch (err) {
      console.error("WHOIS查询错误:", err);
      const errorMessage = err instanceof Error 
        ? err.message 
        : "查询失败，请稍后重试";
      
      setError(errorMessage);
      toast({
        title: "查询失败",
        description: errorMessage + "。您可以尝试直接访问官方WHOIS查询网站。",
        variant: "destructive",
      });
      
      if (queryType === "domain") {
        const tld = cleanQuery.split('.').pop()?.toLowerCase();
        if (tld) {
          const whoisServer = DOMAIN_WHOIS_SERVERS[tld];
          console.log(`��议用户访问官方WHOIS查询网站查询 ${cleanQuery}`);
          setResult({
            domain: cleanQuery,
            type: "domain",
            fallback: true,
            officialLink: whoisServer || null,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "未知";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const renderDomainInfo = () => {
    if (!result || result.type !== "domain") return null;
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Globe className="h-5 w-5" />
            域名信息
          </h2>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">域名</TableCell>
                <TableCell>{result.domain}</TableCell>
              </TableRow>
              {result.data?.registrar && (
                <TableRow>
                  <TableCell className="font-medium">注册商</TableCell>
                  <TableCell>{result.data.registrar}</TableCell>
                </TableRow>
              )}
              {result.data?.creationDate && (
                <TableRow>
                  <TableCell className="font-medium">注册时间</TableCell>
                  <TableCell>{formatDate(result.data.creationDate)}</TableCell>
                </TableRow>
              )}
              {result.data?.expirationDate && (
                <TableRow>
                  <TableCell className="font-medium">到期时间</TableCell>
                  <TableCell>{formatDate(result.data.expirationDate)}</TableCell>
                </TableRow>
              )}
              {result.data?.updatedDate && (
                <TableRow>
                  <TableCell className="font-medium">更新时间</TableCell>
                  <TableCell>{formatDate(result.data.updatedDate)}</TableCell>
                </TableRow>
              )}
              {result.data?.status && (
                <TableRow>
                  <TableCell className="font-medium">状态</TableCell>
                  <TableCell>
                    {Array.isArray(result.data.status) 
                      ? result.data.status.join(", ") 
                      : result.data.status}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {result.data?.nameServers && result.data.nameServers.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">域名服务器</h2>
            <ul className="list-disc pl-6 space-y-1">
              {Array.isArray(result.data.nameServers) 
                ? result.data.nameServers.map((ns: string, i: number) => (
                    <li key={i}>{ns}</li>
                  ))
                : <li>{result.data.nameServers}</li>
              }
            </ul>
          </Card>
        )}

        {result.rawData && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">原始WHOIS数据</h2>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-96">
              {result.rawData}
            </pre>
          </Card>
        )}
      </div>
    );
  };

  const renderIPInfo = () => {
    if (!result || result.type !== "ip") return null;
    
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            IP地址信息
          </h2>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">IP地址</TableCell>
                <TableCell>{result.ip}</TableCell>
              </TableRow>
              {result.data?.range && (
                <TableRow>
                  <TableCell className="font-medium">IP范围</TableCell>
                  <TableCell>{result.data.range}</TableCell>
                </TableRow>
              )}
              {result.data?.cidr && (
                <TableRow>
                  <TableCell className="font-medium">CIDR</TableCell>
                  <TableCell>{result.data.cidr}</TableCell>
                </TableRow>
              )}
              {result.data?.organization && (
                <TableRow>
                  <TableCell className="font-medium">组织</TableCell>
                  <TableCell>{result.data.organization}</TableCell>
                </TableRow>
              )}
              {result.data?.country && (
                <TableRow>
                  <TableCell className="font-medium">国家/地区</TableCell>
                  <TableCell>{result.data.country}</TableCell>
                </TableRow>
              )}
              {result.data?.created && (
                <TableRow>
                  <TableCell className="font-medium">分配时间</TableCell>
                  <TableCell>{formatDate(result.data.created)}</TableCell>
                </TableRow>
              )}
              {result.data?.updated && (
                <TableRow>
                  <TableCell className="font-medium">更新时间</TableCell>
                  <TableCell>{formatDate(result.data.updated)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {result.rawData && (
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">原始WHOIS数据</h2>
            <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-96">
              {result.rawData}
            </pre>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">WHOIS 查询工具</h1>
        <p className="text-center text-muted-foreground mb-8">
          查询域名和IP地址的详细信���，包括注册信息、到期时间、IP归属等
        </p>
        
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <Input
              type="text"
              placeholder="输入域名或IP地址 (例如: example.com 或 8.8.8.8)"
              value={query}
              onChange={handleQueryChange}
              className="flex-1 font-mono"
            />
            <Button type="submit" disabled={loading} className="whitespace-nowrap">
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              查询
            </Button>
          </form>
          <div className="mt-2 text-xs text-muted-foreground">
            {queryType === "domain" ? (
              <span>支持查询常见域名后缀，例如: .com .net .org .cn .io .co 等</span>
            ) : (
              <span>支持查询 IPv4 和 IPv6 地址</span>
            )}
          </div>
        </Card>

        {loading && (
          <Card className="p-6 mb-8 flex justify-center items-center">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <p>正在查询WHOIS服务器，请稍候...</p>
          </Card>
        )}

        {error && !loading && (
          <Card className="p-6 mb-8 border-destructive">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h2 className="text-xl font-bold mb-2 text-destructive">查询失败</h2>
                <p className="text-destructive">{error}</p>
                {result?.fallback && (
                  <div className="mt-3">
                    <p className="text-sm mb-2">您可以尝试通过以下方式查询:</p>
                    <ul className="list-disc pl-6 space-y-1">
                      {result.officialLink && (
                        <li>
                          <a 
                            href={`http://${result.officialLink}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            访问官方WHOIS服务器
                          </a>
                        </li>
                      )}
                      <li>
                        <a 
                          href={`https://who.is/whois/${result.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          访问 who.is 查询
                        </a>
                      </li>
                      <li>
                        <a 
                          href={`https://lookup.icann.org/lookup?q=${result.domain}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          访问 ICANN Lookup
                        </a>
                      </li>
                    </ul>
                  </div>
                )}
                <p className="text-sm mt-2 text-muted-foreground">
                  提示: 请确保输入格式正确，并且网络连接稳定。如果问题持续存在，可能是WHOIS服务器暂时不可用。
                </p>
              </div>
            </div>
          </Card>
        )}

        {result && !loading && !result.fallback && (
          result.type === "domain" ? renderDomainInfo() : renderIPInfo()
        )}
      </div>
    </div>
  );
};

export default Index;
