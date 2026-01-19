
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
    const contestEvents = events.filter((e: any) => e.id !== 'practice-arena-mvp');

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
                <TabsContent value="contest" className="space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
                    ) : contestEvents.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl bg-muted/10 border-dashed">
                            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-medium">No Official Contests Found</h3>
                            <p className="text-muted-foreground">Check back later for upcoming events.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contestEvents.map((event: any) => (
                                <OfficialContestCard key={event.id} event={event} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
