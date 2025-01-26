import { Card } from "@/components/ui/card";

interface WhoisResultProps {
  data: string | null;
  error: string | null;
}

const WhoisResult = ({ data, error }: WhoisResultProps) => {
  if (!data && !error) return null;

  return (
    <Card className="w-full max-w-xl p-4 mt-4">
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <pre className="whitespace-pre-wrap font-mono text-sm overflow-auto max-h-[600px]">
          {data}
        </pre>
      )}
    </Card>
  );
};

export default WhoisResult;