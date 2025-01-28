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
              <TableCell className="font-medium">域名</TableCell>
              <TableCell>{data.domainName}</TableCell>
            </TableRow>
          )}
          {data.registrar && (
            <TableRow>
              <TableCell className="font-medium">注册商</TableCell>
              <TableCell>{data.registrar}</TableCell>
            </TableRow>
          )}
          {data.creationDate && (
            <TableRow>
              <TableCell className="font-medium">创建日期</TableCell>
              <TableCell>{new Date(data.creationDate).toLocaleString()}</TableCell>
            </TableRow>
          )}
          {data.expirationDate && (
            <TableRow>
              <TableCell className="font-medium">过期日期</TableCell>
              <TableCell>{new Date(data.expirationDate).toLocaleString()}</TableCell>
            </TableRow>
          )}
          {data.updatedDate && (
            <TableRow>
              <TableCell className="font-medium">更新日期</TableCell>
              <TableCell>{new Date(data.updatedDate).toLocaleString()}</TableCell>
            </TableRow>
          )}
          {data.nameServers && (
            <TableRow>
              <TableCell className="font-medium">域名服务器</TableCell>
              <TableCell>{data.nameServers.join(', ')}</TableCell>
            </TableRow>
          )}
          {data.status && (
            <TableRow>
              <TableCell className="font-medium">状态</TableCell>
              <TableCell>{Array.isArray(data.status) ? data.status.join(', ') : data.status}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

export default WhoisResult;