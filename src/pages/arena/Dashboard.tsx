
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { eventsAPI, registrationsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, ArrowRight, Ticket, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { CountdownTimer } from "@/components/CountdownTimer";

export default function ArenaDashboard() {

    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['events'],
        queryFn: () => eventsAPI.getAll()
    });

    const events = data?.events || [];

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase())
    );

    const liveEvents = filteredEvents.filter(e => e.status === 'LIVE');
    const upcomingEvents = filteredEvents.filter(e => e.status === 'UPCOMING');
    const pastEvents = filteredEvents.filter(e => e.status === 'ENDED');

    return (
        <div className="container mx-auto py-8 space-y-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
                        Arena
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Compete in algorithmic contests and climb the leaderboard.
                    </p>
                </div>
                {/* Admin Create Button could go here */}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search contests..."
                    className="pl-10 max-w-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Tabs defaultValue="all" className="w-full">
                <TabsList>
                    <TabsTrigger value="all">All Events</TabsTrigger>
                    <TabsTrigger value="live">Live ({liveEvents.length})</TabsTrigger>
                    <TabsTrigger value="upcoming">Upcoming ({upcomingEvents.length})</TabsTrigger>
                    <TabsTrigger value="tickets">My Tickets</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6 space-y-8">
                    {isLoading && (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Card key={i} className="flex flex-col h-full">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <Skeleton className="h-5 w-16" />
                                            <Skeleton className="h-5 w-12" />
                                        </div>
                                        <Skeleton className="h-6 w-3/4" />
                                        <Skeleton className="h-4 w-full mt-2" />
                                    </CardHeader>
                                    <CardContent className="flex-grow space-y-3">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-40" />
                                    </CardContent>
                                    <CardFooter>
                                        <Skeleton className="h-10 w-full" />
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!isLoading && liveEvents.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                Live Now
                            </h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {liveEvents.map(event => <EventCard key={event.id} event={event} />)}
                            </div>
                        </section>
                    )}

                    {!isLoading && upcomingEvents.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Upcoming</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                            </div>
                        </section>
                    )}

                    {!isLoading && pastEvents.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-semibold mb-4">Past Contests</h2>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                            </div>
                        </section>
                    )}

                    {!isLoading && filteredEvents.length === 0 && (
                        <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                            <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold">No Events Found</h3>
                            <p className="text-muted-foreground">Check back later for upcoming contests.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="live" className="mt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {liveEvents.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                </TabsContent>
                <TabsContent value="upcoming" className="mt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                </TabsContent>
                <TabsContent value="past" className="mt-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                    </div>
                </TabsContent>

                <TabsContent value="tickets" className="mt-6">
                    <MyTicketsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function EventCard({ event }: { event: any }) {
    const isLive = event.status === 'LIVE';
    const isUpcoming = event.status === 'UPCOMING';

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-shadow border-muted/50">
            <CardHeader>
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={isLive ? "destructive" : isUpcoming ? "default" : "secondary"}>
                        {event.status}
                    </Badge>
                    {event.price > 0 ? (
                        <Badge variant="outline" className="text-green-500 border-green-500/50">
                            ₹{event.price}
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-blue-500 border-blue-500/50">
                            Free
                        </Badge>
                    )}
                </div>
                <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                <CardDescription className="line-clamp-2">{event.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.startTime), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{format(new Date(event.startTime), "h:mm a")} - {format(new Date(event.endTime), "h:mm a")}</span>
                </div>
                {isUpcoming && (
                    <div className="text-xs font-mono bg-muted/50 p-2 rounded text-center">
                        <span className="text-muted-foreground mr-2">Starts in</span>
                        <CountdownTimer targetDate={new Date(event.startTime)} />
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full group">
                    <Link to={`/arena/events/${event.id}`}>
                        {isLive ? "Enter Contest" : isUpcoming ? "Register Now" : "View Details"}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}

function MyTicketsTab() {
    const { data, isLoading } = useQuery({
        queryKey: ['my-registrations'],
        queryFn: registrationsAPI.getMyRegistrations
    });

    const registrations = data?.registrations || [];

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            </div>
        );
    }

    if (registrations.length === 0) {
        return (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
                <Ticket className="h-10 w-10 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">No Tickets Yet</h3>
                <p className="text-muted-foreground">Register for an event to see your ticket here.</p>
            </div>
        );
    }

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {registrations.map((reg: any) => (
                <div key={reg.id} className="relative group">
                    <div className="absolute top-2 right-2 z-10 w-auto">
                        <Badge className="bg-green-500 hover:bg-green-600 shadow-md">Ticket: {reg.id.slice(0, 8)}</Badge>
                    </div>
                    {/* Reuse EventCard but pass the event object from registration */}
                    <EventCard event={reg.event} />
                </div>
            ))}
        </div>
    );
}
