
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, ArrowRight, BrainCircuit } from "lucide-react";
import { OfficialContestCard } from "@/components/OfficialContestCard";

export default function Arena() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("practice");

    // Fetch All Events
    const { data, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: () => eventsAPI.getAll()
    });

    const events = data?.events || [];

    // Filter Events
    const activeContests = events.filter((e: any) => e.id !== 'practice-arena-mvp' && e.status !== 'ENDED');


    return (
        <div className="container mx-auto py-8 max-w-5xl space-y-8">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Arena</h1>
                <p className="text-muted-foreground">
                    Sharpen your skills or compete for glory.
                </p>
            </div>

            <Tabs defaultValue="practice" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="practice">Practice Arena</TabsTrigger>
                    <TabsTrigger value="contest">Official Contests</TabsTrigger>
                </TabsList>

                {/* PRACTICE TAB (Reverted to Original) */}
                <TabsContent value="practice" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Card className="col-span-full bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-2xl flex items-center gap-2">
                                            <BrainCircuit className="h-6 w-6 text-primary" />
                                            Practice Arena
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            Improve your coding skills with our curated list of algorithm problems.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="outline" className="px-3 py-1">Always Open</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Unlimited Submissions
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        No Time Pressure
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Instant Feedback
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                        Master Validation
                                    </li>
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate(`/arena/env/practice-arena-mvp`)}>
                                    Enter Practice Arena <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </TabsContent>

                {/* CONTESTS TAB (Polished) */}
                <TabsContent value="contest" className="space-y-12">
                    {/* Active/Upcoming Contests */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-primary" />
                                Live & Upcoming
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                        ) : activeContests.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
                                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No Active Contests</h3>
                                <p className="text-muted-foreground">Check back later for upcoming events.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeContests.map((event: any) => (
                                    <OfficialContestCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* My Contest History Section */}
                    <ContestHistorySection />
                </TabsContent>
            </Tabs>
        </div >
    );
}

function ContestHistorySection() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-contest-history'],
        queryFn: () => import("@/lib/api").then(m => m.usersAPI.getContestHistory())
    });

    const history = data?.history || [];

    if (isLoading) return <div className="py-8 text-center text-muted-foreground text-sm">Loading history...</div>;
    if (history.length === 0) return null;

    return (
        <div className="space-y-4 pt-8 border-t border-border">
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-muted-foreground" />
                My Contest History
            </h2>
            <div className="grid gap-4">
                {history.map((contest: any) => (
                    <div key={contest.id} className="group flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-card/30 border border-white/5 hover:bg-card/50 transition-all gap-4">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center font-bold text-muted-foreground text-sm">
                                #{contest.rank}
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{contest.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>Score: {contest.score}</span>
                                    <span>•</span>
                                    <span className="capitalize">{contest.status.toLowerCase()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            {/* Badge Logic Mock */}
                            {contest.rank === 1 && <Badge className="bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 border-yellow-500/50">Winner</Badge>}
                            {contest.rank <= 3 && contest.rank > 1 && <Badge className="bg-gray-400/20 text-gray-400 border-white/20">Podium</Badge>}

                            <Button variant="ghost" size="sm" onClick={() => window.location.href = `/arena/contest/${contest.id}/leaderboard`}>
                                Leaderboard <ArrowRight className="ml-2 h-3 w-3" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
