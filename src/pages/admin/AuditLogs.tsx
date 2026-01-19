
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AuditLogs() {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: adminAPI.getAuditLogs
    });

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <div className="border rounded-md bg-white dark:bg-slate-900 shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Time</TableHead>
                            <TableHead>Admin</TableHead>
                            <TableHead>Action</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Reason</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data?.logs?.map((log: any) => (
                            <TableRow key={log.id}>
                                <TableCell className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                    {format(new Date(log.createdAt), "PP p")}
                                </TableCell>
                                <TableCell className="font-medium">{log.admin?.username || log.adminId}</TableCell>
                                <TableCell>
                                    <Badge variant="outline">{log.action}</Badge>
                                </TableCell>
                                <TableCell className="font-mono text-xs">{log.targetType}: {log.targetId}</TableCell>
                                <TableCell className="max-w-md truncate" title={log.reason}>{log.reason}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
