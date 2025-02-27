
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

const Index = () => {
  const [domain, setDomain] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomain(e.target.value);
  };

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedDomain = domain.trim().toLowerCase();
    
    if (!trimmedDomain) {
      toast({
        title: "错误",
        description: "请输入域名",
        variant: "destructive",
      });
      return;
    }
    
    if (!validateDomain(trimmedDomain)) {
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
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(trimmedDomain)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "查询失败");
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "查询失败，请稍后重试");
      toast({
        title: "查询失败",
        description: err instanceof Error ? err.message : "查询失败，请稍后重试",
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
      return date.toLocaleString();
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
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="输入域名 (例如: example.com)"
              value={domain}
              onChange={handleDomainChange}
              className="flex-1 font-mono"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              查询
            </Button>
          </form>
        </Card>

        {error && (
          <Card className="p-6 mb-8 border-destructive">
            <p className="text-destructive">{error}</p>
          </Card>
        )}

        {result && (
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
                  {result.data.registrar && (
                    <TableRow>
                      <TableCell className="font-medium">注册商</TableCell>
                      <TableCell>{result.data.registrar}</TableCell>
                    </TableRow>
                  )}
                  {result.data.creationDate && (
                    <TableRow>
                      <TableCell className="font-medium">创建时间</TableCell>
                      <TableCell>{formatDate(result.data.creationDate)}</TableCell>
                    </TableRow>
                  )}
                  {result.data.expirationDate && (
                    <TableRow>
                      <TableCell className="font-medium">到期时间</TableCell>
                      <TableCell>{formatDate(result.data.expirationDate)}</TableCell>
                    </TableRow>
                  )}
                  {result.data.updatedDate && (
                    <TableRow>
                      <TableCell className="font-medium">更新时间</TableCell>
                      <TableCell>{formatDate(result.data.updatedDate)}</TableCell>
                    </TableRow>
                  )}
                  {result.data.status && (
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

            {result.data.nameServers && (
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

            {(result.data.registrant || result.data.admin || result.data.tech) && (
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
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">原始WHOIS数据</h2>
              <pre className="whitespace-pre-wrap bg-muted p-4 rounded-md text-xs font-mono overflow-auto max-h-96">
                {result.rawData}
              </pre>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
