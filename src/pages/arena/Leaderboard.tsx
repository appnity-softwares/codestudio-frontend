import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { contestsAPI, eventsAPI } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Trophy, AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaderboardEntry {
    rank: number;
    userId: string;
    username: string;
    name: string;
    avatar: string;
    trustScore: number;
    totalScore: number;
    solvedCount: number;
    totalTime: number; // minutes
    status: string; // NORMAL, UNDER_REVIEW, DISQUALIFIED
    flagsCount: number;
    problems: Record<string, ProblemStat>;
}

interface ProblemStat {
    status: string; // ACCEPTED, WRONG_ANSWER, etc.
    attempts: number;
    timeTaken: number;
    penalty: number;
}

export default function Leaderboard() {
    const { eventId } = useParams();

    const { data: eventData } = useQuery({
        queryKey: ["event", eventId],
        queryFn: () => eventsAPI.getById(eventId!),
        enabled: !!eventId
    });

    const { data: problemsData } = useQuery({
        queryKey: ["contest-problems", eventId],
        queryFn: () => contestsAPI.getProblems(eventId!),
        enabled: !!eventId
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ["leaderboard", eventId],
        queryFn: () => contestsAPI.getLeaderboard(eventId!),
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 flex justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto py-10">
                <AlertTriangle className="h-10 w-10 text-destructive mb-4" />
                <h2 className="text-xl font-bold">Failed to load leaderboard</h2>
            </div>
        );
    }

    const leaderboard = data?.leaderboard || [];
    const problems = problemsData?.problems || [];
    const event = eventData?.event;

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to={`/contest/${eventId}`}>
                            <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Arena
                            </Button>
                        </Link>
                        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                            {event?.title || "Contest"} Leaderboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Live Standings • Auto-updates every 30s
                        </p>
                    </div>
                </div>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[80px]">Rank</TableHead>
                                    <TableHead className="w-[250px]">Contestant</TableHead>
                                    <TableHead className="text-center">Solved</TableHead>
                                    <TableHead className="text-center">Score</TableHead>
                                    <TableHead className="text-center">Time</TableHead>
                                    {problems.map((p: any) => (
                                        <TableHead key={p.id} className="text-center min-w-[80px]">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold">{String.fromCharCode(65 + p.order - 1)}</span>
                                                <span className="text-[10px] font-normal text-muted-foreground hidden lg:inline-block max-w-[80px] truncate">
                                                    {p.title}
                                                </span>
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leaderboard.map((entry: LeaderboardEntry) => (
                                    <TableRow key={entry.userId} className={cn(
                                        entry.rank === 1 && "bg-yellow-500/10",
                                        entry.rank === 2 && "bg-gray-400/10",
                                        entry.rank === 3 && "bg-amber-600/10",
                                        entry.status === "UNDER_REVIEW" && "opacity-70 bg-destructive/5"
                                    )}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {entry.rank === 1 && <Trophy className="h-4 w-4 text-yellow-500" />}
                                                {entry.rank === 2 && <Trophy className="h-4 w-4 text-gray-400" />}
                                                {entry.rank === 3 && <Trophy className="h-4 w-4 text-amber-600" />}
                                                #{entry.rank}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={entry.avatar} />
                                                    <AvatarFallback>{entry.username[0]?.toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-medium flex items-center gap-2">
                                                        {entry.name || entry.username}
                                                        {entry.status === "UNDER_REVIEW" && (
                                                            <span title="Under Review (Flags Detected)">
                                                                <ShieldAlert className="h-3 w-3 text-destructive" />
                                                            </span>
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground flex gap-2">
                                                        @{entry.username}
                                                        <span className={cn(
                                                            "ml-1",
                                                            entry.trustScore < 50 ? "text-destructive" : "text-green-500"
                                                        )}>
                                                            {entry.trustScore}% Trust
                                                        </span>
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-bold text-lg text-primary">
                                            {entry.solvedCount}
                                        </TableCell>
                                        <TableCell className="text-center font-mono">
                                            {entry.totalScore}
                                        </TableCell>
                                        <TableCell className="text-center font-mono text-muted-foreground">
                                            {Math.round(entry.totalTime)}m
                                        </TableCell>

                                        {problems.map((p: any) => {
                                            const stat = entry.problems[p.id];
                                            if (!stat) {
                                                return <TableCell key={p.id} className="text-center">-</TableCell>;
                                            }

                                            const isAC = stat.status === "ACCEPTED";

                                            return (
                                                <TableCell key={p.id} className="text-center p-2">
                                                    <div className={cn(
                                                        "flex flex-col items-center justify-center rounded py-1 px-2 mx-auto w-16",
                                                        isAC ? "bg-green-500/20 text-green-500" :
                                                            stat.attempts > 0 ? "bg-red-500/20 text-red-500" : ""
                                                    )}>
                                                        {isAC ? (
                                                            <>
                                                                <span className="font-bold text-sm">+{stat.attempts > 1 ? stat.attempts - 1 : 0}</span>
                                                                <span className="text-[10px] opacity-80">{Math.round(stat.timeTaken)}m</span>
                                                            </>
                                                        ) : (
                                                            <span className="font-bold text-sm">
                                                                -{stat.attempts}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
