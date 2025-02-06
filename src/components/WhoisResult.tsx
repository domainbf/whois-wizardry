import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface WhoisResultProps {
  data: any | null;
  error: string | null;
}

const WhoisResult = ({ data, error }: WhoisResultProps) => {
  if (!data && !error) return null;

  if (error) {
    return (
      <Card className="w-full max-w-xl p-4 mt-4">
        <div className="text-red-500">{error}</div>
      </Card>
    );
  }

  if (data.rawData) {
    return (
      <Card className="w-full max-w-xl p-4 mt-4">
        <div className="text-amber-500 mb-4">{data.error}</div>
        <pre className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded">
          {data.rawData}
        </pre>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-xl p-4 mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>字段</TableHead>
            <TableHead>值</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.domainName && (
            <TableRow>
              <TableCell>域名</TableCell>
              <TableCell>{data.domainName}</TableCell>
            </TableRow>
          )}
          {data.registrar && (
            <TableRow>
              <TableCell>注册商</TableCell>
              <TableCell>{data.registrar}</TableCell>
            </TableRow>
          )}
          {data.creationDate && (
            <TableRow>
              <TableCell>创建时间</TableCell>
              <TableCell>{new Date(data.creationDate).toLocaleString()}</TableCell>
            </TableRow>
          )}
          {data.expirationDate && (
            <TableRow>
              <TableCell>过期时间</TableCell>
              <TableCell>{new Date(data.expirationDate).toLocaleString()}</TableCell>
            </TableRow>
          )}
          {data.nameServers && (
            <TableRow>
              <TableCell>域名服务器</TableCell>
              <TableCell>{Array.isArray(data.nameServers) ? data.nameServers.join(', ') : data.nameServers}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default WhoisResult;
