import { useQuery } from "@tanstack/react-query";
import { activityAPI } from "@/lib/api";
import { Heart, UserPlus, Code, MessageCircle, Trophy, Clock, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

interface ActivityTimelineProps {
    userId?: string;
    limit?: number;
}

const activityIcons: Record<string, React.ReactNode> = {
    NEW_SNIPPET: <Code className="h-3 w-3" />,
    FOLLOW: <UserPlus className="h-3 w-3" />,
    LIKE: <Heart className="h-3 w-3" />,
    COMMENT: <MessageCircle className="h-3 w-3" />,
    ACHIEVEMENT: <Trophy className="h-3 w-3" />,
    NEW_USER: <UserPlus className="h-3 w-3" />,
};

const activityColors: Record<string, string> = {
    NEW_SNIPPET: "bg-blue-500/20 text-blue-400",
    FOLLOW: "bg-green-500/20 text-green-400",
    LIKE: "bg-red-500/20 text-red-400",
    COMMENT: "bg-purple-500/20 text-purple-400",
    ACHIEVEMENT: "bg-yellow-500/20 text-yellow-400",
    NEW_USER: "bg-cyan-500/20 text-cyan-400",
};

export function ActivityTimeline({ limit = 8 }: ActivityTimelineProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['activity-feed'],
        queryFn: () => activityAPI.getFeed(),
    });

    const activities = data?.activities?.slice(0, limit) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 opacity-20 mb-2" />
                <p className="text-xs font-mono">No recent activity</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {activities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <div className={`p-1.5 rounded-lg ${activityColors[activity.type] || 'bg-white/10'}`}>
                        {activityIcons[activity.type] || <Clock className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <Link to={`/profile/${activity.actor?.username}`} className="flex items-center gap-2 group">
                                <Avatar className="h-5 w-5">
                                    <AvatarImage src={activity.actor?.image} />
                                    <AvatarFallback className="text-[8px]">
                                        {activity.actor?.username?.[0]?.toUpperCase() || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs font-medium group-hover:text-primary transition-colors">
                                    {activity.actor?.name || activity.actor?.username}
                                </span>
                            </Link>
                        </div>
                        <p className="text-xs text-white/60 mt-0.5 truncate">{activity.message}</p>
                        <p className="text-[10px] text-white/30 mt-1">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
}
