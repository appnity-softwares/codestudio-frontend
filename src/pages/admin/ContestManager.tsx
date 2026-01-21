import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Loader2,
    Plus,
    MoreVertical,
    Trophy,
    ExternalLink,
    Edit,
    Trash
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ContestManager() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [contestToDelete, setContestToDelete] = useState<string | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["admin-contests"],
        queryFn: adminAPI.getContests
    });

    const createMutation = useMutation({
        mutationFn: adminAPI.createContest,
        onSuccess: (newContest: any) => {
            toast({ title: "Contest Created", description: "Draft created successfully." });
            queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
            navigate(`/admin/contests/${newContest.contest.id}`); // Correctly access the nested ID
        },
        onError: (err: any) => {
            toast({ title: "Failed to create", description: err.message, variant: "destructive" });
        }
    });

    const startMutation = useMutation({
        mutationFn: adminAPI.startContest,
        onSuccess: () => {
            toast({ title: "Contest Started", description: "The contest is now LIVE." });
            queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
        }
    });

    const endMutation = useMutation({
        mutationFn: adminAPI.endContest,
        onSuccess: () => {
            toast({ title: "Contest Ended", description: "The contest has been ended." });
            queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: adminAPI.deleteContest,
        onSuccess: () => {
            toast({ title: "Contest Deleted", description: "The contest has been removed safely." });
            queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
        },
        onError: (err: any) => {
            toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
        }
    });

    const handleCreate = () => {
        // Create a default draft
        createMutation.mutate({
            title: "New Untitled Contest",
            description: "# New Contest\nDescribe your contest here.",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(), // +1 hour
            type: "INTERNAL",
            banner: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80"
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "LIVE": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
            case "UPCOMING": return "bg-sky-500/10 text-sky-400 border-sky-500/20";
            case "ENDED": return "bg-white/5 text-muted-foreground border-white/10";
            case "FROZEN": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
            default: return "bg-amber-500/10 text-amber-500 border-amber-500/20"; // DRAFT
        }
    };

    if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
                    <p className="text-muted-foreground">Manage contests, problems, and lifecycle.</p>
                </div>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                    {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Create Contest
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Contests</CardTitle>
                    <CardDescription>
                        {data?.contests?.length || 0} total contests found
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Status</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Schedule</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data?.contests?.map((contest: any) => (
                                <TableRow key={contest.id}>
                                    <TableCell>
                                        <Badge variant="outline" className={getStatusColor(contest.status)}>
                                            {contest.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span className="text-white/90 font-headline">{contest.title}</span>
                                            <span className="text-[10px] font-mono text-muted-foreground/50 tracking-tighter hover:text-primary transition-colors cursor-help" title={contest.id}>
                                                {contest.id.slice(0, 8)}...{contest.id.slice(-4)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {contest.type === "EXTERNAL" ? (
                                            <Badge variant="secondary" className="gap-1 bg-white/5 border-white/10 text-purple-400 text-[10px] font-mono uppercase tracking-tighter">
                                                <ExternalLink className="h-3 w-3" /> External
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1 bg-white/5 border-white/10 text-blue-400 text-[10px] font-mono uppercase tracking-tighter">
                                                <Trophy className="h-3 w-3" /> Internal
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                <span className="text-muted-foreground text-[10px] font-mono">Start: {format(new Date(contest.startTime), "PP p")}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                <span className="text-muted-foreground text-[10px] font-mono">End: {format(new Date(contest.endTime), "PP p")}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-[10px] font-mono uppercase tracking-tighter">
                                        {format(new Date(contest.createdAt), "PP")}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link to={`/admin/contests/${contest.id}`}>
                                                <Button variant="ghost" size="icon">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Lifecycle</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => startMutation.mutate(contest.id)} disabled={contest.status === "LIVE"}>
                                                        Start Contest
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => endMutation.mutate(contest.id)} disabled={contest.status === "ENDED"}>
                                                        End Contest
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator className="bg-white/5" />
                                                    <DropdownMenuItem
                                                        className="text-rose-400 focus:text-rose-400 focus:bg-rose-400/10"
                                                        onClick={() => setContestToDelete(contest.id)}
                                                        disabled={contest.status === "LIVE"}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete Contest
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation */}
            <AlertDialog open={!!contestToDelete} onOpenChange={(open) => !open && setContestToDelete(null)}>
                <AlertDialogContent className="bg-surface border-white/10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-white">Nuke Contest Path?</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This will permanently remove the contest structure. If there are active registrations
                            this might fail on the backend to prevent data corruption.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-white">Retreat</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (contestToDelete) {
                                    deleteMutation.mutate(contestToDelete);
                                    setContestToDelete(null);
                                }
                            }}
                            className="bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                        >
                            Confirm Deletion
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
