import { Card, CardContent } from "@/components/ui/card";
import { Heart, Bookmark, Users, TrendingUp, Clock } from "lucide-react";
// import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { SnippetCard } from "@/components/SnippetCard";
import { ActivityTimeline } from "./ActivityTimeline";
// import { useQuery } from "@tanstack/react-query";
// import { usersAPI } from "@/lib/api";
// import { useAuth } from "@/context/AuthContext";

interface ProfileDashboardProps {
    profileUser: any;
    dashboardSnippets: any[];
}

export function ProfileDashboard({ profileUser: _profileUser, dashboardSnippets }: ProfileDashboardProps) {
    // const { user: currentUser } = useAuth();
    // const isOwnProfile = currentUser?.id === profileUser?.id;

    // MVP: Stats are disabled to prevent fake data/429s.
    // const { data: stats, isLoading } = useQuery({ queryKey: ['user-stats'], queryFn: () => usersAPI.getStats(), enabled: isOwnProfile });

    const followerCount = "--"; // stats?.followers ?? 0;
    const likesReceived = "--"; // stats?.likesReceived ?? 0;
    const savesReceived = "--"; // stats?.savesReceived ?? 0;

    const displayStats = [
        { label: "Likes Received", value: likesReceived, icon: Heart, color: "text-muted-foreground opacity-50 grayscale" },
        { label: "Saves", value: savesReceived, icon: Bookmark, color: "text-muted-foreground opacity-50 grayscale" },
        { label: "Followers", value: followerCount, icon: Users, color: "text-muted-foreground opacity-50 grayscale" },
    ];

    // MVP: Fake chart data removed
    // const chartData = ...

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {displayStats.map((stat) => (
                    <Card key={stat.label} className="border-none bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg cursor-not-allowed">
                        <CardContent className="p-6 opacity-70">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2 rounded-xl ${stat.color} bg-white/5`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                {/* {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />} */}
                            </div>
                            <h4 className="text-2xl font-black text-white">{stat.value}</h4>
                            <p className="text-xs text-white/50">{stat.label}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Engagement Rate & Analytics Hidden for MVP */}
            {/* 
            {isOwnProfile && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20">
                    <div>
                        <p className="text-xs text-white/50 uppercase tracking-widest font-mono">Avg. Engagement per Snippet</p>
                        <p className="text-2xl font-black text-primary">{engagementRate}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-primary/50" />
                </div>
            )}
            
            <Card className="border-none bg-white/5 backdrop-blur-md p-8">
                 ... (Chart removed) ...
            </Card> 
            */}

            <div className="p-6 rounded-xl bg-muted/5 border border-dashed border-border flex flex-col items-center text-center space-y-3">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                <div>
                    <h4 className="text-sm font-bold font-headline text-muted-foreground">Analytics Offline</h4>
                    <p className="text-xs text-muted-foreground/50 font-mono mt-1">
                        Detailed engagement metrics will generally be available<br />after the public beta launch.
                    </p>
                </div>
            </div>

            {/* Activity Timeline */}
            <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-white italic tracking-tight">Recent Activity</h3>
                </div>
                <ActivityTimeline limit={5} />
            </Card>

            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-white italic tracking-tight">High Engagement Objects</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardSnippets.map((snippet) => (
                        <SnippetCard key={snippet.id} snippet={snippet} />
                    ))}
                    {dashboardSnippets.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                            <p className="text-sm font-mono">No snippets yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
