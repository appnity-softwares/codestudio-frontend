import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usersAPI } from "@/lib/api";
import { Calendar, Trophy, BarChart2, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

interface ContestHistoryItem {
    id: string;
    title: string;
    rank: number;
    score: number;
    status: string;
    startTime: string;
    endTime: string;
    rulesAccepted: boolean;
}

export function ContestHistory() {
    const [history, setHistory] = useState<ContestHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const { history } = await usersAPI.getContestHistory();
                setHistory(history || []);
            } catch (err) {
                console.error("Failed to fetch contest history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-muted-foreground">Loading contest history...</div>;
    }

    return (
        <div className="container mx-auto max-w-4xl py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Contest History</h1>
                    <p className="text-muted-foreground">Your journey through the CodeStudio Arena.</p>
                </div>
                <Button variant="outline" asChild>
                    <Link to="/arena">Go to Arena</Link>
                </Button>
            </div>

            {history.length === 0 ? (
                <Card className="bg-muted/30 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <Trophy className="h-12 w-12 text-muted-foreground/50 mb-4" />
                        <h3 className="text-lg font-semibold">No contests yet</h3>
                        <p className="text-muted-foreground mb-4">You haven't participated in any contests yet.</p>
                        <Button asChild>
                            <Link to="/arena">Explore Contests</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {history.map((contest) => (
                        <Card key={contest.id} className="overflow-hidden bg-card/50 hover:bg-card transition-colors border-white/5">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center p-6 gap-4">
                                {/* Status Icon */}
                                <div className="flex-shrink-0 mt-1 sm:mt-0">
                                    {contest.status === "ENDED" ? (
                                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                        </div>
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                            <BarChart2 className="h-5 w-5 text-blue-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Main Content */}
                                <div className="flex-grow min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <h3 className="text-lg font-semibold truncate hover:text-primary transition-colors">
                                            <Link to={`/arena/contest/${contest.id}/leaderboard`}>
                                                {contest.title}
                                            </Link>
                                        </h3>
                                        <Badge variant={contest.status === 'ENDED' ? 'secondary' : 'default'} className="text-xs">
                                            {contest.status}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{format(new Date(contest.startTime), "MMM d, yyyy")}</span>
                                        </div>
                                        {contest.rank > 0 && (
                                            <div className="flex items-center gap-1 text-primary font-medium">
                                                <Trophy className="h-3.5 w-3.5" />
                                                <span>Rank #{contest.rank}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto mt-2 sm:mt-0 border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6 justify-between sm:justify-end">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold tabular-nums">{contest.score}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Score</div>
                                    </div>

                                    <Button variant="ghost" size="sm" asChild className="ml-2">
                                        <Link to={`/arena/contest/${contest.id}/leaderboard`}>
                                            View Leaderboard
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
