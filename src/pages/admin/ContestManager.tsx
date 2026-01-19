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

export default function ContestManager() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-contests"],
        queryFn: adminAPI.getContests
    });

    const createMutation = useMutation({
        mutationFn: adminAPI.createContest,
        onSuccess: (newContest: any) => {
            toast({ title: "Contest Created", description: "Draft created successfully." });
            queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
            navigate(`/admin/contests/${newContest.id}`); // Go to editor
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
            case "LIVE": return "bg-green-500/10 text-green-500 border-green-500/20";
            case "UPCOMING": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
            case "ENDED": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
            case "FROZEN": return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
            default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"; // DRAFT
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
                                            <span>{contest.title}</span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">{contest.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {contest.type === "EXTERNAL" ? (
                                            <Badge variant="secondary" className="gap-1">
                                                <ExternalLink className="h-3 w-3" /> Ext
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="gap-1">
                                                <Trophy className="h-3 w-3" /> Int
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col text-sm">
                                            <span className="text-muted-foreground text-xs">Start: {format(new Date(contest.startTime), "PP p")}</span>
                                            <span className="text-muted-foreground text-xs">End: {format(new Date(contest.endTime), "PP p")}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
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
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash className="mr-2 h-4 w-4" /> Delete (Drafts only)
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
        </div>
    );
}
