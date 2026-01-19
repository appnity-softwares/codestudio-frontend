import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, RefreshCw, Flag } from "lucide-react";

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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

export default function AdminSubmissions() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [contestFilter, setContestFilter] = useState("__all__");
    const [verdictFilter, setVerdictFilter] = useState("__all__");
    const [flaggedOnly, setFlaggedOnly] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Fetch submissions
    const { data: submissionsData, isLoading } = useQuery({
        queryKey: ["admin-submissions", page, contestFilter, verdictFilter, flaggedOnly],
        queryFn: () => adminAPI.getSubmissions({
            page,
            contestId: contestFilter !== "__all__" ? contestFilter : undefined,
            verdict: verdictFilter !== "__all__" ? verdictFilter : undefined,
            flagged: flaggedOnly ? "true" : undefined,
        }),
    });

    // Fetch contests for filter dropdown
    const { data: contestsData } = useQuery({
        queryKey: ["admin-contests"],
        queryFn: () => adminAPI.getContests(),
    });

    // Restore submission mutation
    const restoreMutation = useMutation({
        mutationFn: (data: { id: string; reason: string }) =>
            adminAPI.restoreSubmission(data.id, data.reason),
        onSuccess: () => {
            toast({ title: "Submission Restored", description: "The submission has been restored." });
            queryClient.invalidateQueries({ queryKey: ["admin-submissions"] });
            setDetailOpen(false);
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const submissions = submissionsData?.submissions || [];
    const pagination = submissionsData?.pagination;

    const getVerdictBadge = (status: string) => {
        const styles: Record<string, string> = {
            ACCEPTED: "bg-green-500",
            WRONG_ANSWER: "bg-red-500",
            TIME_LIMIT_EXCEEDED: "bg-yellow-500",
            RUNTIME_ERROR: "bg-orange-500",
            PENDING: "bg-blue-500",
            DISQUALIFIED: "bg-purple-500",
        };
        return <Badge className={styles[status] || "bg-gray-500"}>{status.replace(/_/g, " ")}</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Submission Browser</h1>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <Select value={contestFilter} onValueChange={setContestFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Contests" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">All Contests</SelectItem>
                        {contestsData?.contests?.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={verdictFilter} onValueChange={setVerdictFilter}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Verdicts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="__all__">All Verdicts</SelectItem>
                        <SelectItem value="ACCEPTED">Accepted</SelectItem>
                        <SelectItem value="WRONG_ANSWER">Wrong Answer</SelectItem>
                        <SelectItem value="TIME_LIMIT_EXCEEDED">TLE</SelectItem>
                        <SelectItem value="RUNTIME_ERROR">Runtime Error</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="DISQUALIFIED">Disqualified</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    variant={flaggedOnly ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFlaggedOnly(!flaggedOnly)}
                >
                    <Flag className="h-4 w-4 mr-2" />
                    Flagged Only
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        setContestFilter("__all__");
                        setVerdictFilter("__all__");
                        setFlaggedOnly(false);
                    }}
                >
                    Clear Filters
                </Button>
            </div>

            {/* Submissions Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Problem</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Verdict</TableHead>
                            <TableHead>Runtime</TableHead>
                            <TableHead>Flags</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : submissions.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                    No submissions found
                                </TableCell>
                            </TableRow>
                        ) : (
                            submissions.map((sub: any) => (
                                <TableRow key={sub.id}>
                                    <TableCell className="font-medium">
                                        {sub.User?.username || sub.userId}
                                    </TableCell>
                                    <TableCell>{sub.Problem?.title || sub.problemId}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{sub.language}</Badge>
                                    </TableCell>
                                    <TableCell>{getVerdictBadge(sub.status)}</TableCell>
                                    <TableCell>{sub.runtime?.toFixed(0) || "-"} ms</TableCell>
                                    <TableCell>
                                        {sub.flags?.length > 0 ? (
                                            <Badge variant="destructive">{sub.flags.length}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(sub.createdAt).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedSubmission(sub);
                                                setDetailOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Submission Details</DialogTitle>
                        <DialogDescription>
                            {selectedSubmission?.User?.username} - {selectedSubmission?.Problem?.title}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedSubmission && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="font-medium">Status:</span>
                                    <div className="mt-1">{getVerdictBadge(selectedSubmission.status)}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Language:</span>
                                    <div className="mt-1">{selectedSubmission.language}</div>
                                </div>
                                <div>
                                    <span className="font-medium">Runtime:</span>
                                    <div className="mt-1">{selectedSubmission.runtime?.toFixed(0) || "-"} ms</div>
                                </div>
                                <div>
                                    <span className="font-medium">Test Cases:</span>
                                    <div className="mt-1">{selectedSubmission.testCasesPassed}/{selectedSubmission.totalTestCases}</div>
                                </div>
                            </div>

                            {/* Code */}
                            <div>
                                <span className="font-medium text-sm">Code:</span>
                                <pre className="mt-2 p-4 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto text-sm max-h-64">
                                    {selectedSubmission.code}
                                </pre>
                            </div>

                            {/* Flags */}
                            {selectedSubmission.flags?.length > 0 && (
                                <div>
                                    <span className="font-medium text-sm">Flags:</span>
                                    <div className="mt-2 space-y-2">
                                        {selectedSubmission.flags.map((flag: any) => (
                                            <div key={flag.id} className="p-3 rounded border bg-red-50 dark:bg-red-900/10">
                                                <Badge variant="destructive">{flag.type}</Badge>
                                                <p className="mt-1 text-sm">{flag.details}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        {selectedSubmission?.status === "DISQUALIFIED" && (
                            <Button
                                variant="outline"
                                onClick={() => restoreMutation.mutate({ id: selectedSubmission.id, reason: "Admin restore" })}
                                disabled={restoreMutation.isPending}
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Restore Submission
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
