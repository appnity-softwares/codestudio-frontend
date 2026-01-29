
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowRight, BrainCircuit, Monitor } from "lucide-react";
import { OfficialContestCard } from "@/components/OfficialContestCard";
import { ContestCardSkeleton } from "@/components/ContestCardSkeleton";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { DesktopRequiredModal } from "@/components/DesktopRequiredModal";
import { cn } from "@/lib/utils";

export default function Arena() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("practice");
    const isMobile = useIsMobile();
    const [showDesktopModal, setShowDesktopModal] = useState(false);

    // Fetch All Events
    const { data, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: () => eventsAPI.getAll(),
        staleTime: 60000, // 1 minute stale time to match backend cache
        gcTime: 120000,   // 2 minutes garbage collection
    });

    // Filter Events using useMemo for performance
    const { activeContests, pastContests } = useMemo(() => {
        const events = data?.events || [];
        return {
            activeContests: events.filter((e: any) => e.id !== 'practice-arena-mvp' && e.status !== 'ENDED'),
            pastContests: events.filter((e: any) => e.id !== 'practice-arena-mvp' && e.status === 'ENDED')
        };
    }, [data]);


    // Handle Enter Practice Arena with mobile check
    const handleEnterPractice = () => {
        if (isMobile) {
            setShowDesktopModal(true);
            return;
        }
        navigate('/arena/env/practice-arena-mvp');
    };

    return (
        <>
            <div className={cn(
                "container mx-auto py-8 max-w-5xl space-y-8",
                isMobile && "px-4 py-6" // Mobile padding adjustments
            )}>
                <div className="space-y-2">
                    <h1 className={cn(
                        "font-bold tracking-tight",
                        isMobile ? "text-2xl" : "text-3xl"
                    )}>Arena</h1>
                    <p className="text-muted-foreground">
                        Sharpen your skills or compete for glory.
                    </p>
                </div>

                <Tabs defaultValue="practice" value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className={cn(
                        "grid w-full max-w-[600px]",
                        isMobile ? "grid-cols-2" : "grid-cols-3" // Hide past tab on mobile to save space
                    )}>
                        <TabsTrigger value="practice">Practice</TabsTrigger>
                        <TabsTrigger value="contest">Contests</TabsTrigger>
                        {!isMobile && <TabsTrigger value="past">Past Contests</TabsTrigger>}
                    </TabsList>

                    {/* PRACTICE TAB */}
                    <TabsContent value="practice" className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            <Card className="col-span-full bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
                                <CardHeader>
                                    <div className={cn(
                                        "flex gap-3",
                                        isMobile ? "flex-col" : "items-center justify-between"
                                    )}>
                                        <div className="space-y-1">
                                            <CardTitle className={cn(
                                                "flex items-center gap-2",
                                                isMobile ? "text-xl" : "text-2xl"
                                            )}>
                                                <BrainCircuit className="h-6 w-6 text-primary" />
                                                Practice Arena
                                            </CardTitle>
                                            <CardDescription className="text-base">
                                                Improve your coding skills with our curated list of algorithm problems.
                                            </CardDescription>
                                        </div>
                                        <Badge variant="outline" className="px-3 py-1 w-fit">Always Open</Badge>
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

                                    {/* Mobile notice */}
                                    {isMobile && (
                                        <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-white/5 flex items-start gap-3">
                                            <Monitor className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Practice Arena is best experienced on desktop for full keyboard and editor support.
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        size="lg"
                                        className={cn("touch-target", isMobile ? "w-full" : "w-auto")}
                                        onClick={handleEnterPractice}
                                    >
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
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => <ContestCardSkeleton key={i} />)}
                                </div>
                            ) : activeContests.length === 0 ? (
                                <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed px-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                                        <Trophy className="h-7 w-7 text-primary/50" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">No Active Contests</h3>
                                    <p className="text-sm text-muted-foreground mb-3 max-w-md mx-auto">
                                        There are no live or upcoming contests at the moment.
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 max-w-sm mx-auto">
                                        <strong>What happens next?</strong> When contests are scheduled, they'll appear here with countdown timers, rules, and registration options.
                                    </p>
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

                    {/* PAST CONTESTS TAB */}
                    <TabsContent value="past" className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-muted-foreground">
                                <BrainCircuit className="h-5 w-5" />
                                Past Contests
                            </h2>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => <ContestCardSkeleton key={i} />)}
                            </div>
                        ) : pastContests.length === 0 ? (
                            <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
                                <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">No Past Contests</h3>
                                <p className="text-muted-foreground">Historical events will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 opacity-90 hover:opacity-100 transition-opacity">
                                {pastContests.map((event: any) => (
                                    <OfficialContestCard key={event.id} event={event} />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Desktop Required Modal */}
            <DesktopRequiredModal
                isOpen={showDesktopModal}
                onClose={() => setShowDesktopModal(false)}
                featureName="Practice Arena"
            />
        </>
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

