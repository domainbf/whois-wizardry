import { useState } from "react";
import DomainInput from "@/components/DomainInput";
import WhoisResult from "@/components/WhoisResult";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [domain, setDomain] = useState("");
  const [whoisData, setWhoisData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleWhoisLookup = async () => {
    if (!domain) {
      toast({
        title: "错误",
        description: "请输入域名",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setWhoisData(null);

    try {
      const response = await fetch(`https://whois.freeaiapi.xyz/?domain=${encodeURIComponent(domain)}`);
      
      if (!response.ok) {
        throw new Error("查询失败");
      }

      const data = await response.text();
      setWhoisData(data);
    } catch (err) {
      setError("查询失败,请稍后重试");
      toast({
        title: "错误",
        description: "查询失败,请稍后重试",
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