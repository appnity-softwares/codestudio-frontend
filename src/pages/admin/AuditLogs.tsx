
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
import { Shield, Clock, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function AuditLogs() {
    const [searchTerm, setSearchTerm] = useState("");
    const { data, isLoading } = useQuery({
        queryKey: ['admin-logs'],
        queryFn: adminAPI.getAuditLogs
    });

    const logs = data?.logs || [];
    const filteredLogs = logs.filter((log: any) =>
        log.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.admin?.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Security Audit Logs</h1>
                    <p className="text-sm text-muted-foreground">Trace all administrative actions across the system.</p>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter logs..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[180px]"><div className="flex items-center gap-2"><Clock className="h-4 w-4" /> Time</div></TableHead>
                            <TableHead><div className="flex items-center gap-2"><Shield className="h-4 w-4" /> Operator</div></TableHead>
                            <TableHead><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Action</div></TableHead>
                            <TableHead>Target Entity</TableHead>
                            <TableHead>Reasoning</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <AdminTableSkeleton columns={5} rows={10} />
                        ) : filteredLogs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                    No audit logs found matching your criteria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLogs.map((log: any) => (
                                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="whitespace-nowrap font-mono text-[10px] text-muted-foreground uppercase">
                                        {format(new Date(log.createdAt), "MMM dd, HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{log.admin?.username || "System"}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono">{log.adminId.substring(0, 8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border-none">
                                            {log.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant="outline" className="w-fit text-[9px] font-bold h-4">{log.targetType}</Badge>
                                            <span className="font-mono text-[10px] text-muted-foreground truncate max-w-[120px]">{log.targetId}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs xl:max-w-md">
                                        <p className="text-sm font-medium leading-relaxed" title={log.reason}>{log.reason}</p>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
