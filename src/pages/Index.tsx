
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Search, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

// 支持的顶级域名及其WHOIS服务器
const WHOIS_SERVERS = {
  "com": "whois.verisign-grs.com",
  "net": "whois.verisign-grs.com",
  "org": "whois.pir.org",
  "io": "whois.nic.io",
  "co": "whois.nic.co",
  "ai": "whois.nic.ai",
  "app": "whois.nic.google",
  "dev": "whois.nic.google",
  "xyz": "whois.nic.xyz",
  "me": "whois.nic.me",
  "info": "whois.afilias.net",
  "biz": "whois.biz",
  "cn": "whois.cnnic.cn",
  "jp": "whois.jprs.jp",
  "uk": "whois.nic.uk",
  "ru": "whois.tcinet.ru",
  "de": "whois.denic.de",
  "fr": "whois.nic.fr"
};

const Index = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  // 简单域名验证
  const validateDomain = (domain: string) => {
    return /^[a-zA-Z0-9][a-zA-Z0-9-_.]*\.[a-zA-Z0-9-_.]+$/.test(domain);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清理域名：移除前缀和路径
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/i, "");
    cleanDomain = cleanDomain.split('/')[0].split('?')[0].split('#')[0];
    
    if (!cleanDomain) {
      toast({
        title: "错误",
        description: "请输入域名",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateDomain(cleanDomain)) {
      toast({
        title: "格式错误",
        description: "请输入有效的域名格式 (例如: example.com)",
        variant: "destructive",
      });
      return;
    }

    // 获取顶级域名
    const tld = cleanDomain.split('.').pop()?.toLowerCase();
    
    if (!tld || !WHOIS_SERVERS[tld as keyof typeof WHOIS_SERVERS]) {
      toast({
        title: "不支持的域名",
        description: `当前不支持 .${tld} 后缀的域名查询`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log(`查询域名: ${cleanDomain}`);
      
      // 使用直接服务器端查询，而不是通过本地API
      const response = await fetch(`https://domain-checker-service.vercel.app/api/whois?domain=${encodeURIComponent(cleanDomain)}`);
      
      if (!response.ok) {
        throw new Error(`查询失败 (HTTP ${response.status})`);
      }
      
      const data = await response.json();
      console.log("查询结果:", data);
      
      if (data.error) {
        setError(data.error);
        toast({
          title: "查询出现问题",
          description: data.error,
          variant: "destructive",
        });
      } else {
        // 处理数据
        const formattedData = {
          domain: cleanDomain,
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
      }
    } catch (err) {
      console.error("WHOIS查询错误:", err);
      const errorMessage = err instanceof Error ? err.message : "查询失败，请稍后重试";
      setError(errorMessage);
      toast({
        title: "查询失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "未知";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString; // 如果无法解析为日期，返回原始字符串
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-6">WHOIS 域名查询工具</h1>
        <p className="text-center text-muted-foreground mb-8">
          查询域名的注册信息、到期时间、注册商等详细信息
        </p>
        
        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <Input
              type="text"
              placeholder="输入域名 (例如: example.com)"
              value={domain}
              onChange={handleDomainChange}
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
            支持的域名后缀: .com .net .org .io .co .ai .app .dev .xyz .me 等
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
            <h2 className="text-xl font-bold mb-2 text-destructive">查询失败</h2>
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {result && !loading && (
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">域名信息</h2>
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
        )}
      </div>
    </div>
  );
};

export default Index;
