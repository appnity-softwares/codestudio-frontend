import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { activityAPI } from "@/lib/api";
import { Heart, UserPlus, Code, MessageCircle, Trophy, Clock, Loader2, GitFork, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface ActivityTimelineProps {
    userId?: string;
    limit?: number;
    showFilters?: boolean;
}

const activityIcons: Record<string, React.ReactNode> = {
    NEW_SNIPPET: <Code className="h-3 w-3" />,
    FOLLOW: <UserPlus className="h-3 w-3" />,
    LIKE: <Heart className="h-3 w-3" />,
    COMMENT: <MessageCircle className="h-3 w-3" />,
    ACHIEVEMENT: <Trophy className="h-3 w-3" />,
    NEW_USER: <UserPlus className="h-3 w-3" />,
    FORK: <GitFork className="h-3 w-3" />,
};

const activityColors: Record<string, string> = {
    NEW_SNIPPET: "bg-blue-500/20 text-blue-400",
    FOLLOW: "bg-green-500/20 text-green-400",
    LIKE: "bg-red-500/20 text-red-400",
    COMMENT: "bg-purple-500/20 text-purple-400",
    ACHIEVEMENT: "bg-yellow-500/20 text-yellow-400",
    NEW_USER: "bg-cyan-500/20 text-cyan-400",
    FORK: "bg-indigo-500/20 text-indigo-400",
};

export function ActivityTimeline({ limit = 8, showFilters = true }: ActivityTimelineProps) {
    const [filter, setFilter] = useState<'all' | 'following' | 'snippets'>('all');

    const { data, isLoading } = useQuery({
        queryKey: ['activity-feed', filter],
        queryFn: () => activityAPI.getFeed({
            following: filter === 'following',
            type: filter === 'snippets' ? 'NEW_SNIPPET' : undefined
        }),
    });

    const activities = data?.activities?.slice(0, limit) || [];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showFilters && (
                <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl self-start w-fit">
                    {[
                        { id: 'all', label: 'All', icon: Clock },
                        { id: 'following', label: 'Following', icon: Users },
                        { id: 'snippets', label: 'Snippets', icon: Code },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as any)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                filter === f.id
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                    : "text-muted-foreground hover:bg-white/5"
                            )}
                        >
                            <f.icon className="h-3 w-3" />
                            {f.label}
                        </button>
                    ))}
                </div>
            )}

            {activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border border-dashed rounded-2xl bg-white/5">
                    <Clock className="h-8 w-8 opacity-20 mb-2" />
                    <p className="text-xs font-mono uppercase tracking-widest">No matching activity</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {activities.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-white/[0.08] transition-all group">
                            <div className={cn(
                                "p-2 rounded-xl shrink-0 shadow-inner",
                                activityColors[activity.type] || 'bg-white/10'
                            )}>
                                {activityIcons[activity.type] || <Clock className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex items-center justify-between gap-2">
                                    <Link to={`/profile/${activity.actor?.username}`} className="flex items-center gap-2 group/actor">
                                        <Avatar className="h-6 w-6 border border-white/10 group-hover/actor:border-primary/50 transition-colors">
                                            <AvatarImage src={activity.actor?.image} />
                                            <AvatarFallback className="text-[10px] font-black">
                                                {activity.actor?.username?.[0]?.toUpperCase() || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-[11px] font-black tracking-tight group-hover/actor:text-primary transition-colors uppercase">
                                            @{activity.actor?.username}
                                        </span>
                                    </Link>
                                    <span className="text-[9px] font-mono text-white/30 whitespace-nowrap">
                                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-[11px] text-white/60 mt-1.5 leading-relaxed font-medium">
                                    {activity.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
