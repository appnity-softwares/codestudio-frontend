
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { Trophy, ArrowLeft, Loader2, Medal } from "lucide-react";

export default function ContestLeaderboard() {
    const { id: eventId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data, isLoading } = useQuery({
        queryKey: ['contest-leaderboard', eventId],
        queryFn: () => contestsAPI.getLeaderboard(eventId!),
        refetchInterval: 30000 // Refresh every 30s
    });

    const leaderboard = data?.leaderboard || [];

    return (
        <div className="container mx-auto py-8 max-w-4xl space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" /> Leaderboard
                    </h1>
                </div>
            </div>

            <div className="border rounded-xl bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Solved</TableHead>
                            <TableHead className="text-right">Score</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                </TableCell>
                            </TableRow>
                        ) : leaderboard.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    No submissions yet. Be the first!
                                </TableCell>
                            </TableRow>
                        ) : (
                            leaderboard.map((entry, index) => {
                                const isCurrentUser = entry.userId === user?.id;
                                return (
                                    <TableRow key={entry.userId} className={isCurrentUser ? "bg-muted/50" : ""}>
                                        <TableCell className="font-medium">
                                            {index === 0 ? (
                                                <Medal className="h-5 w-5 text-yellow-500" />
                                            ) : index === 1 ? (
                                                <Medal className="h-5 w-5 text-gray-400" />
                                            ) : index === 2 ? (
                                                <Medal className="h-5 w-5 text-amber-700" />
                                            ) : (
                                                `#${index + 1}`
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{entry.name?.charAt(0) || entry.username?.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{entry.name}</span>
                                                    <span className="text-xs text-muted-foreground">@{entry.username}</span>
                                                </div>
                                                {isCurrentUser && <Badge variant="secondary" className="ml-2 text-[10px]">YOU</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{entry.solvedCount}</TableCell>
                                        <TableCell className="text-right font-bold font-mono">{entry.totalScore}</TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
