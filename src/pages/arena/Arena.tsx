
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { eventsAPI } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Swords, Trophy, Timer, ArrowRight, BrainCircuit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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

                {/* PRACTICE TAB */}
                <TabsContent value="practice" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* Main Practice Card */}
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

                {/* CONTESTS TAB */}
                <TabsContent value="contest" className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8" /></div>
                    ) : contestEvents.length === 0 ? (
                        <div className="text-center py-12 border rounded-xl bg-muted/10">
                            <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">No Official Contests Found</h3>
                            <p className="text-muted-foreground">Check back later for upcoming events.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {contestEvents.map((event: any) => (
                                <Card key={event.id} className="flex flex-col">
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <CardTitle className="truncate pr-2">{event.title}</CardTitle>
                                            <Badge variant={event.status === 'LIVE' ? "default" : "secondary"}>{event.status}</Badge>
                                        </div>
                                        <CardDescription className="line-clamp-2 min-h-[40px]">
                                            {event.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 space-y-4">
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                            <Timer className="h-4 w-4" />
                                            {event.status === 'UPCOMING' ? (
                                                <span>Starts {formatDistanceToNow(new Date(event.startTime), { addSuffix: true })}</span>
                                            ) : event.status === 'LIVE' ? (
                                                <span className="text-green-500 font-medium">Ends {formatDistanceToNow(new Date(event.endTime), { addSuffix: true })}</span>
                                            ) : (
                                                <span>Ended {formatDistanceToNow(new Date(event.endTime), { addSuffix: true })}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-sm text-muted-foreground gap-2">
                                            <Swords className="h-4 w-4" />
                                            <span>Ranked Competition</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="w-full" disabled={event.status === 'ENDED'} onClick={() => navigate(`/arena/env/${event.id}`)}>
                                            {event.status === 'UPCOMING' ? "Register / View" : "Enter Contest"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
