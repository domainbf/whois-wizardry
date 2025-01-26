import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface DomainInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const DomainInput = ({ value, onChange, onSubmit, isLoading }: DomainInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-xl">
      <Input
        type="text"
        placeholder="输入域名 (例如: example.com)"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="font-mono"
      />
      <Button type="submit" disabled={isLoading}>
        {isLoading ? (
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
        ) : (
          <Search className="w-4 h-4" />
        )}
      </Button>
    </form>
  );
};

export default DomainInput;