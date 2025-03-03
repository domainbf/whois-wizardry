
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
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
    
    // Auto-detect if the query is an IP address or domain
    if (isIPAddress(value)) {
      setQueryType("ip");
    } else {
      setQueryType("domain");
    }
  };

  const validateDomain = (domain: string) => {
    // 确保域名格式正确，并且不能是whois服务器本身
    if (domain.startsWith('whois.')) {
      return false;
    }
    return /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z0-9-_.]+$/.test(domain);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let cleanQuery = query.trim().toLowerCase();
    
    if (queryType === "domain") {
      // Clean domain query
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
      // IP validation is already done by isIPAddress function
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
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      // 构建API URL，使用查询参数
      let url = `https://domain-checker-service.vercel.app/api/whois?`;
      
      // Add the query parameter
      url += `query=${encodeURIComponent(cleanQuery)}`;
      
      // 添加明确的服务器参数，确保使用正确的WHOIS服务器
      if (queryType === "domain") {
        const tld = cleanQuery.split('.').pop()?.toLowerCase();
        if (tld) {
          const whoisServer = DOMAIN_WHOIS_SERVERS[tld];
          if (whoisServer) {
            url += `&server=${encodeURIComponent(whoisServer)}`;
          }
        }
      } else if (queryType === "ip") {
        const ipServer = getIPWhoisServer(cleanQuery);
        if (ipServer) {
          url += `&server=${encodeURIComponent(ipServer)}`;
        }
      }
      
      console.log("正在请求:", url);
      
      const response = await fetch(
        url,
        { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
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
      
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("JSON解析错误:", jsonError);
        throw new Error("无法解析服务器响应，请稍后重试");
      }
      
      console.log("查询结果:", data);
      
      if (data.error) {
        setError(data.error);
        toast({
          title: "查询出现问题",
          description: data.error,
          variant: "destructive",
        });
      } else {
        if (queryType === "domain") {
          const formattedData = {
            domain: cleanQuery,
            type: "domain",
            data: {
              registrar: data.registrar || "未知",
              creationDate: data.createdDate || data.creationDate,
              expirationDate: data.expiryDate || data.expirationDate,
              updatedDate: data.updatedDate,
              status: data.status,
              nameServers: data.nameServers || []
            },
            rawData: data.rawData || ""
          };
          setResult(formattedData);
        } else {
          // Handle IP address response
          const formattedData = {
            ip: cleanQuery,
            type: "ip",
            data: {
              range: data.range || data.netRange || "未知",
              organization: data.organization || data.orgName || "未知",
              country: data.country || "未知",
              cidr: data.cidr || "未知",
              created: data.created || data.creationDate,
              updated: data.updated || data.updatedDate,
            },
            rawData: data.rawData || ""
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
      
      // 在API失败的情况下，提供直接访问官方WHOIS的备选方案
      if (queryType === "domain") {
        const tld = cleanQuery.split('.').pop()?.toLowerCase();
        if (tld) {
          console.log(`建议用户访问官方WHOIS查询网站查询 ${cleanQuery}`);
          // 这里可以提供一个备选方案的UI显示
          setResult({
            domain: cleanQuery,
            type: "domain",
            fallback: true,
            officialLink: getDomainWhoisServer(cleanQuery)
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
          查询域名和IP地址的详细信息，包括注册信息、到期时间、IP归属等
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
                      <li>
                        <a 
                          href={`https://${result.officialLink}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          访问官方WHOIS服务器
                        </a>
                      </li>
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
