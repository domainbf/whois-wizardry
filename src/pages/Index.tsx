
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Search, ExternalLink, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import whoisServers from "@/data/whois.json";

const Index = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  // 极宽松的域名验证 - 允许更多合法域名格式
  const validateDomain = (domain: string) => {
    // 确保域名有基本结构：任何字符，至少有一个点，不以点开头或结尾
    return /^[^\s.]+(\.[^\s.]+)+$/.test(domain) && !domain.startsWith(".") && !domain.endsWith(".");
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 清理域名：移除http://或https://前缀，只保留域名部分
    let cleanDomain = domain.trim().toLowerCase();
    cleanDomain = cleanDomain.replace(/^(https?:\/\/)?(www\.)?/i, "");
    
    // 确保没有路径或查询参数
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
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      console.log("查询域名:", cleanDomain);
      
      // 获取域名后缀
      const tld = cleanDomain.split('.').pop()?.toLowerCase();
      
      // 检查是否支持该TLD
      if (!tld || !(tld in whoisServers)) {
        throw new Error(`不支持的域名后缀: .${tld}`);
      }
      
      const whoisServer = whoisServers[tld as keyof typeof whoisServers];
      
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(cleanDomain)}&server=${encodeURIComponent(whoisServer)}`);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          throw new Error(`查询失败 (HTTP ${response.status})`);
        }
        throw new Error(errorData.error || `查询失败 (HTTP ${response.status})`);
      }
      
      let data;
      try {
        data = await response.json();
        console.log("查询结果:", data);
      } catch (e) {
        console.error("解析响应JSON失败:", e);
        throw new Error("解析响应数据失败，服务器返回了无效的数据格式");
      }
      
      if (data.error) {
        setError(data.error);
        toast({
          title: "查询出现问题",
          description: data.error,
          variant: "destructive",
        });
      }
      
      setResult(data);
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
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
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
            支持格式: example.com, sub.example.co.uk, example.org 等多种域名
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
                  <TableRow>
                    <TableCell className="font-medium">WHOIS服务器</TableCell>
                    <TableCell>{result.whoisServer}</TableCell>
                  </TableRow>
                  {result.data?.registrar && (
                    <TableRow>
                      <TableCell className="font-medium">注册商</TableCell>
                      <TableCell>{result.data.registrar}</TableCell>
                    </TableRow>
                  )}
                  {result.data?.creationDate && (
                    <TableRow>
                      <TableCell className="font-medium">创建时间</TableCell>
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

            {(result.data?.registrant || result.data?.admin || result.data?.tech) && (
              <Card className="p-6">
                <h2 className="text-xl font-bold mb-4">联系人信息</h2>
                <div className="space-y-4">
                  {result.data.registrant && (
                    <div>
                      <h3 className="font-bold mb-2">注册人</h3>
                      <Table>
                        <TableBody>
                          {Object.entries(result.data.registrant).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>{value as string}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {result.data.admin && (
                    <div>
                      <h3 className="font-bold mb-2">管理员联系人</h3>
                      <Table>
                        <TableBody>
                          {Object.entries(result.data.admin).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>{value as string}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                  
                  {result.data.tech && (
                    <div>
                      <h3 className="font-bold mb-2">技术联系人</h3>
                      <Table>
                        <TableBody>
                          {Object.entries(result.data.tech).map(([key, value]) => (
                            <TableRow key={key}>
                              <TableCell className="font-medium">{key}</TableCell>
                              <TableCell>{value as string}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">原始WHOIS数据</h2>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-96">
                {result.rawData || "无原始数据"}
              </pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
