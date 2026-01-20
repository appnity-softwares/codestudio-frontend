import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
    Calendar,
    Timer,
    Trophy,
    Users,
    Shield,
    ArrowRight,
    Swords,
    Lock,
    CheckCircle2,
    ExternalLink
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OfficialContestCardProps {
    event: any;
}

export function OfficialContestCard({ event }: OfficialContestCardProps) {
    const navigate = useNavigate();

    const isLive = event.status === 'LIVE';
    const isUpcoming = event.status === 'UPCOMING';

    const isRegistered = event.isRegistered;

    return (
        <Card className={cn(
            "col-span-full border-l-4 transition-all duration-300",
            isLive ? "border-l-green-500 bg-gradient-to-r from-green-500/5 via-background to-background" :
                isUpcoming ? "border-l-yellow-500 bg-gradient-to-r from-yellow-500/5 via-background to-background" :
                    "border-l-muted border-border/50 bg-muted/5"
        )}>
            <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-1 p-6 space-y-4">
                    {/* Header Section */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 mb-1">
                            <Badge variant="outline" className={cn(
                                "uppercase font-bold tracking-wider text-[10px]",
                                isLive ? "border-green-500 text-green-500 bg-green-500/10" :
                                    isUpcoming ? "border-yellow-500 text-yellow-500 bg-yellow-500/10" :
                                        "text-muted-foreground border-muted-foreground"
                            )}>
                                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />}
                                {event.status}
                            </Badge>

                            <Badge variant="secondary" className="text-[10px] gap-1">
                                <Swords className="h-3 w-3" /> Ranked
                            </Badge>

                            <Badge variant="secondary" className="text-[10px] gap-1 bg-violet-500/10 text-violet-500 border-violet-500/20">
                                <Shield className="h-3 w-3" /> Protected
                            </Badge>

                            {event.isExternal && (
                                <Badge variant="outline" className="text-[10px] gap-1 border-blue-500 text-blue-500 bg-blue-500/10 uppercase font-bold">
                                    <ExternalLink className="h-3 w-3" /> {event.externalPlatform || 'Hosted Externally'}
                                </Badge>
                            )}
                        </div>

                        <h3 className="text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {event.title}
                        </h3>
                        <p className="text-muted-foreground max-w-2xl line-clamp-2">
                            {event.description}
                        </p>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                                <Timer className="h-3 w-3" />
                                {isLive ? "Ends In" : isUpcoming ? "Starts In" : "Ended"}
                            </p>
                            <p className={cn("font-mono font-medium", isLive ? "text-green-500" : "text-foreground")}>
                                {isLive
                                    ? formatDistanceToNow(new Date(event.endTime))
                                    : isUpcoming
                                        ? formatDistanceToNow(new Date(event.startTime))
                                        : formatDistanceToNow(new Date(event.endTime), { addSuffix: true })
                                }
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                                <Users className="h-3 w-3" /> Participants
                            </p>
                            <p className="font-mono font-medium">
                                {event.participantCount || 0}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                                <Trophy className="h-3 w-3" /> Points
                            </p>
                            <p className="font-mono font-medium">
                                {event.totalPoints || "TBD"}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> Date
                            </p>
                            <p className="font-mono font-medium truncate">
                                {new Date(event.startTime).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Section */}
                <div className="p-6 md:border-l border-t md:border-t-0 md:w-[280px] flex flex-col justify-center space-y-4 bg-muted/5">
                    {/* User Status */}
                    {isRegistered ? (
                        <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-2 rounded-lg text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Registered
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-muted-foreground px-3 py-2 rounded-lg text-sm font-medium">
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                            Not Registered
                        </div>
                    )}

                    {isUpcoming ? (
                        <Button className="w-full" size="lg" onClick={() => navigate(`/arena/official/${event.id}`)}>
                            {event.isExternal ? "View Details" : "Register / Rules"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : isLive ? (
                        <Button
                            className="w-full bg-green-600 hover:bg-green-500 text-white"
                            size="lg"
                            onClick={() => navigate(`/arena/official/${event.id}`)}
                        >
                            {event.isExternal ? "Join External Contest" : "Enter Contest"}
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => navigate(`/arena/official/${event.id}`)}>
                            View Results
                        </Button>
                    )}

                    {isUpcoming && <p className="text-xs text-center text-muted-foreground">
                        <Lock className="h-3 w-3 inline mr-1" />
                        Arena locked until start
                    </p>}
                </div>
            </div>
        </Card>
    );
}
