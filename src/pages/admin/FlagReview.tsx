
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Eye, ShieldAlert, Gavel, UserX, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

export default function FlagReview() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [reason, setReason] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['admin-flags'],
        queryFn: adminAPI.getFlags
    });

    const ignoreMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => adminAPI.ignoreFlag(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
            toast({ title: "Flag Ignored" });
            setSelectedSubmission(null);
            setReason("");
        }
    });

    const warnMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => adminAPI.warnSubmission(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
            toast({ title: "Warning Issued" });
            setSelectedSubmission(null);
            setReason("");
        }
    });

    const dqMutation = useMutation({
        mutationFn: ({ id, reason }: { id: string, reason: string }) => adminAPI.disqualifySubmission(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
            toast({ title: "Submission Disqualified", variant: "destructive" });
            setSelectedSubmission(null);
            setReason("");
        }
    });

    const banUserMutation = useMutation({
        mutationFn: (id: string) => adminAPI.disqualifyUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
            toast({ title: "User Banned", variant: "destructive" });
            setSelectedSubmission(null);
        }
    });

    if (isLoading) return <div className="space-y-4"><Skeleton className="h-96 w-full" /></div>;

    return (
        <div className="flex h-[calc(100vh-100px)] gap-6">
            <div className="w-1/3 border-r pr-6 overflow-hidden flex flex-col">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-amber-500" />
                    Flagged ({data?.submissions?.length || 0})
                </h2>
                <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-4">
                        {data?.submissions?.map((sub: any) => (
                            <div
                                key={sub.id}
                                onClick={() => setSelectedSubmission(sub)}
                                className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedSubmission?.id === sub.id ? "bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20" : "bg-white hover:bg-slate-50 dark:bg-slate-900"}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-semibold text-sm truncate w-32">{sub.user?.username}</span>
                                    <Badge variant="outline" className="text-[10px]">{sub.status}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {sub.flags?.map((f: any) => (
                                        <Badge key={f.id} variant="secondary" className="text-[10px] bg-red-100 text-red-700">
                                            {f.type}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 dark:bg-slate-900/50 p-6 rounded-xl border">
                {selectedSubmission ? (
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                            <div>
                                <h3 className="text-2xl font-bold">Review Submission</h3>
                                <p className="text-sm text-muted-foreground font-mono">{selectedSubmission.id}</p>
                            </div>
                            <div className={`text-2xl font-bold ${selectedSubmission.user?.trustScore < 50 ? 'text-red-600' : 'text-green-600'}`}>
                                Trust: {selectedSubmission.user?.trustScore}%
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <Card><CardHeader className="py-2"><CardTitle className="text-xs">Metrics</CardTitle></CardHeader><CardContent className="text-xs space-y-1 pt-0">
                                <div className="flex justify-between"><span>Paste:</span> <span className="font-mono">{selectedSubmission.metrics?.pasteCount || 0}</span></div>
                                <div className="flex justify-between"><span>Blur:</span> <span className="font-mono">{selectedSubmission.metrics?.blurCount || 0}</span></div>
                            </CardContent></Card>
                            <Card><CardHeader className="py-2"><CardTitle className="text-xs">Env</CardTitle></CardHeader><CardContent className="text-xs space-y-1 pt-0">
                                <div className="flex justify-between"><span>Lang:</span> <span className="font-mono">{selectedSubmission.language}</span></div>
                                <div className="flex justify-between"><span>IP:</span> <span className="font-mono">{selectedSubmission.metrics?.ip || 'N/A'}</span></div>
                            </CardContent></Card>
                        </div>

                        <div className="flex-1 min-h-0 mb-6 flex flex-col">
                            <h4 className="font-semibold mb-2 text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> Code</h4>
                            <div className="bg-black text-slate-300 p-4 rounded-md font-mono text-xs overflow-auto flex-1"><pre>{selectedSubmission.code}</pre></div>
                        </div>

                        <div className="space-y-4 pt-4 border-t bg-white dark:bg-slate-900 p-4 rounded-lg">
                            <Textarea placeholder="Reason..." value={reason} onChange={(e) => setReason(e.target.value)} className="resize-none h-20" />
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" size="sm" onClick={() => ignoreMutation.mutate({ id: selectedSubmission.id, reason: reason || "False Positive" })}>
                                    <CheckCircle2 className="h-4 w-4 mr-2" /> Dismiss
                                </Button>
                                <Button variant="secondary" size="sm" className="bg-amber-100 text-amber-900" onClick={() => warnMutation.mutate({ id: selectedSubmission.id, reason: reason || "Suspicious" })}>
                                    <AlertCircle className="h-4 w-4 mr-2" /> Warn
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => dqMutation.mutate({ id: selectedSubmission.id, reason: reason || "Cheating" })}>
                                    <Gavel className="h-4 w-4 mr-2" /> DQ
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => { if (confirm("Ban User?")) banUserMutation.mutate(selectedSubmission.id); }}>
                                    <UserX className="h-4 w-4 mr-2" /> Ban
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">Select a submission to review</div>
                )}
            </div>
        </div>
    );
}
