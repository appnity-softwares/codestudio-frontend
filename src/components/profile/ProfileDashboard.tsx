import { Card, CardContent } from "@/components/ui/card";
import { Heart, Bookmark, Users, TrendingUp, Clock, Code2, Sparkles } from "lucide-react";
import { SnippetCard } from "@/components/SnippetCard";
import { ActivityTimeline } from "./ActivityTimeline";
import { calculateLevel } from "@/lib/xp";
import { motion } from "framer-motion";

interface ProfileDashboardProps {
    profileUser: any;
    dashboardSnippets: any[];
}

export function ProfileDashboard({ profileUser, dashboardSnippets }: ProfileDashboardProps) {
    const levelInfo = calculateLevel(profileUser.xp || 0);

    const followerCount = "--";
    const likesReceived = "--";
    const savesReceived = "--";

    const displayStats = [
        { label: "Likes Received", value: likesReceived, icon: Heart, color: "text-muted-foreground opacity-50 grayscale" },
        { label: "Saves", value: savesReceived, icon: Bookmark, color: "text-muted-foreground opacity-50 grayscale" },
        { label: "Followers", value: followerCount, icon: Users, color: "text-muted-foreground opacity-50 grayscale" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Level Progress Stats */}
            <div className="p-1 rounded-3xl bg-gradient-to-br from-primary/20 via-transparent to-purple-500/20 border border-white/5">
                <Card className="border-none bg-black/40 backdrop-blur-3xl p-6 rounded-[1.4rem]">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Experience & Mastery</h3>
                                    <p className="text-[10px] text-muted-foreground">Level up by contributing code and engaging with the community.</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-4xl font-black text-white italic">LVL {levelInfo.level}</span>
                                    <span className="text-xs font-mono text-muted-foreground">
                                        {Math.floor(levelInfo.currentXP)} / {levelInfo.nextLevelXP} XP (NEXT)
                                    </span>
                                </div>
                                <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelInfo.progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:w-72">
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total XP</p>
                                <p className="text-xl font-black text-white">{profileUser.xp || 0}</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col justify-center">
                                <p className="text-[10px] text-muted-foreground uppercase font-bold">Next Rank</p>
                                <p className="text-xl font-black text-white">LVL {levelInfo.level + 1}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

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

            {/* 1. About Section */}
            {profileUser.bio && (
                <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Users className="h-4 w-4 text-primary" />
                        <h3 className="font-black text-white italic tracking-tight">About</h3>
                    </div>
                    <p className="text-white/70 leading-relaxed text-sm">{profileUser.bio}</p>
                </Card>
            )}

            {/* 2. Pinned Snippet (Featured) */}
            {profileUser.pinnedSnippet && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <h3 className="font-black text-white italic tracking-tight uppercase">Featured Work</h3>
                    </div>
                    {/* Render with isFeatured forced to true visually or rely on data */}
                    <SnippetCard snippet={{ ...profileUser.pinnedSnippet, isFeatured: true }} />
                </div>
            )}

            {/* 3. Analytics (Placeholder) */}
            {/* ... */}

            <div className="p-6 rounded-xl bg-muted/5 border border-dashed border-border flex flex-col items-center text-center space-y-3">
                <TrendingUp className="h-8 w-8 text-muted-foreground/30" />
                <div>
                    <h4 className="text-sm font-bold font-headline text-muted-foreground">Analytics Offline</h4>
                    <p className="text-xs text-muted-foreground/50 font-mono mt-1">
                        Detailed engagement metrics will generally be available<br />after the public beta launch.
                    </p>
                </div>
            </div>

            {/* 4. Activity Timeline */}
            <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-white italic tracking-tight">Recent Activity</h3>
                </div>
                <ActivityTimeline limit={5} />
            </Card>

            {/* 5. Recent Snippets */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <h3 className="font-black text-white italic tracking-tight">Recent Snippets</h3>
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
