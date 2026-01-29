import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle, XCircle, User, ExternalLink, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

export default function AdminReports() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { data: reportData, isLoading } = useQuery({
        queryKey: ["admin-reports"],
        queryFn: () => adminAPI.getReports(),
    });

    const resolveMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: 'RESOLVED' | 'DISMISSED' }) =>
            adminAPI.resolveReport(id, status),
        onSuccess: (_, variables) => {
            toast({
                title: variables.status === 'RESOLVED' ? "Report Resolved" : "Report Dismissed",
                description: `The report has been marked as ${variables.status.toLowerCase()}.`,
            });
            queryClient.invalidateQueries({ queryKey: ["admin-reports"] });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const reports = reportData?.reports || [];
    const pendingCount = reports.filter((r: any) => r.status === "PENDING").length;

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-headline">Community Moderation</h1>
                        <p className="text-muted-foreground font-medium text-sm">Review and resolve user-submitted reports.</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xl font-black">{pendingCount}</div>
                        <div className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Pending Reports</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-border/50 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-sm font-bold flex items-center gap-2 font-mono uppercase tracking-widest">
                            <MessageSquare className="h-4 w-4" /> Incident Reports
                        </CardTitle>
                        <CardDescription>
                            Users report violations of community guidelines. Resolve them to maintain platform integrity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/10">
                                <TableRow>
                                    <TableHead className="w-[150px]">Status</TableHead>
                                    <TableHead>Reporter</TableHead>
                                    <TableHead>Target</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Reported</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12">
                                            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                                            <p className="text-xs text-muted-foreground mt-2 uppercase font-black tracking-widest">Scanning Reports...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : reports.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic font-medium">
                                            Clean slate! No incidents reported.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    reports.map((report: any) => (
                                        <TableRow key={report.id} className="group hover:bg-muted/5 transition-colors">
                                            <TableCell>
                                                {report.status === "PENDING" ? (
                                                    <Badge className="bg-amber-500 hover:bg-amber-600 animate-pulse text-[9px] uppercase font-black tracking-widest">
                                                        Pending Review
                                                    </Badge>
                                                ) : report.status === "RESOLVED" ? (
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] uppercase font-black tracking-widest">
                                                        Resolved
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-[9px] uppercase font-black tracking-widest opacity-50">
                                                        Dismissed
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                                        {report.reporter?.image ? (
                                                            <img src={report.reporter.image} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User className="h-3 w-3" />
                                                        )}
                                                    </div>
                                                    <div className="text-xs">
                                                        <div className="font-bold">{report.reporter?.name || "System"}</div>
                                                        <div className="text-muted-foreground leading-none">@{report.reporter?.username}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter shrink-0">
                                                        {report.targetType}
                                                    </Badge>
                                                    <div className="text-xs truncate max-w-[150px] font-mono">
                                                        {report.targetId}
                                                    </div>
                                                    {report.targetType === "USER" && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            onClick={() => navigate(`/admin/users?search=${report.targetId}`)}
                                                        >
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-xs font-medium max-w-xs leading-relaxed italic">
                                                    "{report.reason}"
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {report.status === "PENDING" && (
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 rounded-lg border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 text-[10px] font-black uppercase tracking-widest"
                                                            onClick={() => resolveMutation.mutate({ id: report.id, status: 'RESOLVED' })}
                                                            disabled={resolveMutation.isPending}
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Mark Resolved
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-8 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 text-[10px] font-black uppercase tracking-widest"
                                                            onClick={() => resolveMutation.mutate({ id: report.id, status: 'DISMISSED' })}
                                                            disabled={resolveMutation.isPending}
                                                        >
                                                            <XCircle className="h-3.5 w-3.5 mr-1" /> Dismiss
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-muted/20 border border-dashed border-border p-6 rounded-2xl flex items-center gap-4">
                <ShieldAlert className="h-8 w-8 text-muted-foreground/30 shrink-0" />
                <div className="text-xs space-y-1">
                    <p className="font-bold uppercase tracking-widest">Protocol Guidance</p>
                    <p className="text-muted-foreground leading-relaxed">
                        Resolving a report signifies that administrative action (Warning, Suspension, or Deletion) has been evaluated or taken. Dismissing a report indicates a false positive or non-violating incident. All resolution actions are recorded in the system audit logs.
                    </p>
                </div>
            </div>
        </div>
    );
}
