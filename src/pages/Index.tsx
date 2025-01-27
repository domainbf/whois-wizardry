import { useState } from "react";
import DomainInput from "@/components/DomainInput";
import WhoisResult from "@/components/WhoisResult";
import { useToast } from "@/components/ui/use-toast";
import whoisServers from "@/data/whois.json";

const Index = () => {
  const [domain, setDomain] = useState("");
  const [whoisData, setWhoisData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getWhoisServer = (domain: string) => {
    const tld = domain.split('.').pop()?.toLowerCase();
    if (!tld) return null;
    return whoisServers[tld as keyof typeof whoisServers];
  };

  const handleWhoisLookup = async () => {
    if (!domain.trim()) {
      toast({
        title: "错误",
        description: "请输入域名",
        variant: "destructive",
      });
      return;
    }

    const whoisServer = getWhoisServer(domain);
    if (!whoisServer) {
      toast({
        title: "错误",
        description: "不支持该域名后缀",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setWhoisData(null);

    try {
      const response = await fetch(
        `/api/whois?domain=${encodeURIComponent(domain)}&server=${encodeURIComponent(whoisServer)}`,
        {
          headers: {
            'Accept': 'text/plain',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '查询失败' }));
        throw new Error(errorData.error || '查询失败');
      }

      const data = await response.text();
      setWhoisData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "查询失败，请稍后重试";
      setError(errorMessage);
      toast({
        title: "查询失败",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">WHOIS 查询工具</h1>
        <p className="text-slate-600">输入域名查询注册信息</p>
      </div>
      
      <DomainInput
        value={domain}
        onChange={setDomain}
        onSubmit={handleWhoisLookup}
        isLoading={isLoading}
      />
      
      <WhoisResult data={whoisData} error={error} />
    </div>
  );
};

export default Index;