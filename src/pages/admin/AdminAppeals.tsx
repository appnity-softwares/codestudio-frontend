import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldAlert, CheckCircle, Clock, Mail, User, Search, Filter } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export default function AdminAppeals() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchQuery, setSearchQuery] = useState("");

    const { data: appealData, isLoading } = useQuery({
        queryKey: ["admin-appeals"],
        queryFn: () => adminAPI.getAppeals(),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) =>
            adminAPI.updateAppealStatus(id, status),
        onSuccess: () => {
            toast({ title: "Protocol Updated", description: "Appeal status has been synchronized." });
            queryClient.invalidateQueries({ queryKey: ["admin-appeals"] });
        },
        onError: (error: any) => {
            toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
        },
    });

    const appeals = appealData?.appeals || [];
    const filteredAppeals = appeals.filter((a: any) =>
        a.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">Appeal Review Chamber</h1>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">Suspension Override Protocol</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                    <Input
                        placeholder="Search subjects by email or username..."
                        className="pl-10 h-11 bg-white/[0.03] border-white/10 rounded-xl focus:border-red-500/50 transition-all font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/10 rounded-xl">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Status: All</span>
                </div>
            </div>

            <Card className="bg-white/[0.03] border-white/10 rounded-3xl overflow-hidden">
                <CardHeader className="p-8 border-b border-white/5">
                    <CardTitle className="text-lg font-black uppercase tracking-widest flex items-center gap-3 italic">
                        <Clock className="h-5 w-5 text-red-500" />
                        Awaiting Review ({filteredAppeals.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/[0.02]">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead className="py-4 pl-8 uppercase text-[10px] font-black tracking-widest opacity-40">Status</TableHead>
                                <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest opacity-40">Subject</TableHead>
                                <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest opacity-40 w-1/3">Justification</TableHead>
                                <TableHead className="py-4 uppercase text-[10px] font-black tracking-widest opacity-40">Timestamp</TableHead>
                                <TableHead className="py-4 pr-8 uppercase text-[10px] font-black tracking-widest opacity-40 text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center">
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-4 w-1/2 bg-white/5 mx-auto rounded" />
                                            <div className="h-2 w-1/4 bg-white/5 mx-auto rounded" />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredAppeals.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="py-20 text-center italic text-muted-foreground">
                                        No appeals found in the current buffer.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAppeals.map((appeal: any) => (
                                    <TableRow key={appeal.id} className="hover:bg-white/[0.02] border-white/5 group transition-colors">
                                        <TableCell className="pl-8">
                                            {appeal.status === "PENDING" ? (
                                                <Badge className="bg-red-500/10 text-red-500 border-red-500/20 text-[9px] font-black uppercase tracking-[0.1em] px-2">
                                                    Pending
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/10 text-[9px] font-black uppercase tracking-[0.1em] px-2 opacity-60">
                                                    Processed
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-500/30 transition-colors">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white leading-none mb-1">@{appeal.username}</div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-50 uppercase font-mono">
                                                        <Mail className="h-2.5 w-2.5" />
                                                        {appeal.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="text-xs text-muted-foreground leading-relaxed italic truncate max-w-sm group-hover:text-white/70 transition-colors">
                                                "{appeal.reason}"
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-40">
                                                {formatDistanceToNow(new Date(appeal.createdAt), { addSuffix: true })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right pr-8">
                                            {appeal.status === "PENDING" ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="h-8 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-900/20 px-4"
                                                        onClick={() => updateStatusMutation.mutate({ id: appeal.id, status: "RESOLVED" })}
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        Process
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-500/60 flex items-center justify-end gap-1.5">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Handled
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

            <div className="bg-white/[0.02] border border-dashed border-white/10 p-8 rounded-3xl flex items-start gap-6">
                <ShieldAlert className="h-10 w-10 text-red-500/20 shrink-0 mt-1" />
                <div className="space-y-2">
                    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/40 leading-none">Review Protocol V1</h4>
                    <p className="text-sm text-muted-foreground/60 leading-relaxed font-medium">
                        Processing an appeal marks the request as reviewed. Admins should investigate the suspension logs manually through the User Management portal before dispatching a verdict via email or system message.
                    </p>
                </div>
            </div>
        </div>
    );
}
