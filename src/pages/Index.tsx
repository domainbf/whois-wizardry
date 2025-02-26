
import { useState } from "react";
import DomainInput from "@/components/DomainInput";
import WhoisResult from "@/components/WhoisResult";
import { useToast } from "@/components/ui/use-toast";
import whoisServers from "@/data/whois.json";

const Index = () => {
  const [domain, setDomain] = useState("");
  const [whoisData, setWhoisData] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateDomain = (domain: string) => {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    return domainRegex.test(domain);
  };

  const getWhoisServer = (domain: string) => {
    const tld = domain.split('.').pop()?.toLowerCase();
    if (!tld) return null;
    return whoisServers[tld as keyof typeof whoisServers];
  };

  const handleWhoisLookup = async () => {
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
        title: "错误",
        description: "请输入有效的域名格式 (例如: example.com)",
        variant: "destructive",
      });
      return;
    }

    const whoisServer = getWhoisServer(trimmedDomain);
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
      const response = await fetch(`/api/whois?domain=${encodeURIComponent(trimmedDomain)}&server=${encodeURIComponent(whoisServer)}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '查询失败');
      }
      
      if (data.error) {
        setError(data.error);
        if (data.rawData) {
          setWhoisData({ rawData: data.rawData });
        }
      } else {
        setWhoisData(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "查询失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8 text-center">WHOIS域名查询</h1>
      <div className="flex flex-col items-center">
        <DomainInput
          value={domain}
          onChange={setDomain}
          onSubmit={handleWhoisLookup}
          isLoading={isLoading}
        />
        <WhoisResult data={whoisData} error={error} />
      </div>
    </div>
  );
};

export default Index;
