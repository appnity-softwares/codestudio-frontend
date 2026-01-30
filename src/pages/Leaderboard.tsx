import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Star, Target, Users, LayoutDashboard, Search, ExternalLink, Zap } from "lucide-react";
import { leaderboardAPI, systemAPI, feedAPI } from "@/lib/api";
import { AuraAvatar } from "@/components/AuraAvatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import SEO from "@/components/SeoMeta";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Leaderboard() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<"global" | "arena" | "creators">("global");

    const { data: globalData, isLoading: globalLoading } = useQuery({
        queryKey: ['leaderboard', 'global'],
        queryFn: () => leaderboardAPI.getGlobal(),
    });

    const { data: trendingData } = useQuery({
        queryKey: ['feed', 'trending'],
        queryFn: () => feedAPI.get('trending'),
    });

    const trendingSnippets = trendingData?.snippets || [];

    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['landing-stats'],
        queryFn: () => systemAPI.getLandingStats(),
    });

    const leaderboard = globalData?.leaderboard || [];
    const topContestants = statsData?.topContestants || [];

    const filteredGlobal = leaderboard.filter((u: any) =>
        u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const tabs = [
        { id: "global", label: "Global XP", icon: Trophy, description: "Top users by total experience earned" },
        { id: "arena", label: "Arena Scorers", icon: Target, description: "Top performers in competitive arena" },
        { id: "creators", label: "Top Creators", icon: Star, description: "Devs with the most popular snippets" },
    ];

    return (
        <div className="min-h-full bg-canvas py-8 px-4 md:px-8 space-y-8 max-w-7xl mx-auto">
            <SEO title="Leaderboard" description="See the top performers in the CodeStudio ecosystem." />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic flex items-center gap-3">
                        <Trophy className="h-10 w-10 text-primary" /> Hall of Fame
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-lg">
                        Recognizing the elite logic architects of the nexus. Compete, contribute, and claim your spot.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-10 h-10 bg-surface/50 border-border focus:border-primary/50 transition-all rounded-xl"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Platform Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary/20 rounded-2xl">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest">Active Architects</p>
                            <h3 className="text-2xl font-black text-foreground">{statsData?.totalUsers || "..."}</h3>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-500/20 rounded-2xl">
                            <Zap className="h-6 w-6 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Logic Blocks</p>
                            <h3 className="text-2xl font-black text-foreground">{statsData?.totalSnippets || "..."}</h3>
                        </div>
                    </div>
                </div>
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 backdrop-blur-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-500/20 rounded-2xl">
                            <Target className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest">Arena Trials</p>
                            <h3 className="text-2xl font-black text-foreground">{statsData?.totalSubmissions || "..."}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <TooltipProvider>
                <div className="flex flex-wrap gap-2 p-1.5 bg-surface/50 border border-border rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <Tooltip key={tab.id}>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground shadow-lg scale-[1.02]"
                                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    )}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-popover text-popover-foreground border-border">
                                <p>{tab.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
            </TooltipProvider>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rankings List */}
                <div className="lg:col-span-2 space-y-4">
                    {(activeTab === "global" || activeTab === "creators") && (
                        <div className="space-y-4">
                            {globalLoading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-20 rounded-2xl bg-surface animate-pulse border border-border" />
                                ))
                            ) : filteredGlobal.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-50">
                                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="font-bold">No users detected in the matrix.</p>
                                </div>
                            ) : (
                                filteredGlobal.map((user: any, idx: number) => (
                                    <motion.div
                                        key={user.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative"
                                    >
                                        <Card className="border-border bg-surface/50 hover:bg-surface hover:border-primary/30 transition-all duration-300 rounded-2xl overflow-hidden shadow-sm">
                                            <CardContent className="p-0">
                                                <Link to={`/u/${user.username}`} className="flex items-center gap-6 p-4">
                                                    <div className="flex items-center justify-center w-10 text-xl font-black font-headline italic opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all">
                                                        #{idx + 1}
                                                    </div>

                                                    <div className="relative shrink-0">
                                                        <AuraAvatar
                                                            src={user.image}
                                                            username={user.username}
                                                            xp={user.xp || 0}
                                                            equippedAura={user.equippedAura}
                                                            size="md"
                                                        />
                                                        {idx < 3 && (
                                                            <div className={cn(
                                                                "absolute -top-1 -left-1 w-6 h-6 rounded-lg flex items-center justify-center border-2 border-surface",
                                                                idx === 0 ? "bg-amber-400 text-amber-950" :
                                                                    idx === 1 ? "bg-slate-400 text-slate-950" : "bg-amber-700 text-amber-100"
                                                            )}>
                                                                <Star className="h-3 w-3 fill-current" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-lg group-hover:text-primary transition-colors truncate">
                                                                {user.name || user.username}
                                                            </h4>
                                                            {idx === 0 && <span className="px-2 py-0.5 rounded text-[8px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">Grandmaster</span>}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                                                    </div>

                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <span className="text-xl font-black text-foreground">
                                                            {activeTab === 'creators' ? (user.snippetsCount || 0) : user.xp?.toLocaleString()}
                                                            <span className="text-[10px] text-primary ml-1 uppercase">{activeTab === 'creators' ? 'Blocks' : 'XP'}</span>
                                                        </span>
                                                        <div className="flex gap-1">
                                                            <div className="h-1 w-20 bg-muted rounded-full overflow-hidden">
                                                                <div className="h-full bg-primary" style={{ width: `${Math.min(100, ((activeTab === 'creators' ? (user.snippetsCount || 0) : user.xp) / ((activeTab === 'creators' ? (leaderboard[0]?.snippetsCount || 1) : leaderboard[0]?.xp) || 1)) * 100)}%` }} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "arena" && (
                        <div className="space-y-4">
                            {statsLoading ? (
                                [1, 2, 3].map(i => (
                                    <div key={i} className="h-24 rounded-2xl bg-surface animate-pulse" />
                                ))
                            ) : topContestants.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl opacity-50">
                                    <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                    <p className="font-bold">The Arena is cooling down. No active scorers yet.</p>
                                </div>
                            ) : (
                                topContestants.map((user: any, idx: number) => (
                                    <motion.div
                                        key={user.username || idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group"
                                    >
                                        <Card className="border-border bg-gradient-to-r from-amber-500/5 to-transparent hover:from-amber-500/10 transition-all rounded-2xl relative overflow-hidden">
                                            <CardContent className="p-6 flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="text-2xl font-black italic text-amber-500 opacity-20 group-hover:opacity-100 transition-opacity">#{idx + 1}</div>
                                                    <div className="flex items-center gap-4">
                                                        <AuraAvatar username={user.username} xp={0} equippedAura={user.equippedAura} size="md" />
                                                        <div>
                                                            <h4 className="font-black text-lg text-foreground">{user.username}</h4>
                                                            <p className="text-xs text-amber-500/60 font-black uppercase">Arena Warrior</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-muted-foreground uppercase mb-1">Total Submissions</p>
                                                    <span className="text-2xl font-black text-amber-500 font-headline italic tracking-tighter">
                                                        {user.submissionsCount || 0} <span className="text-xs">SOLVES</span>
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column - Highlight & Rules */}
                <div className="space-y-6">
                    <Card className="border-none bg-primary text-primary-foreground shadow-2xl rounded-[2rem] overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                        <div className="absolute top-0 right-0 p-8 opacity-20 -rotate-12 translate-x-12 -translate-y-8 group-hover:rotate-0 transition-transform duration-700">
                            <Trophy className="h-40 w-40" />
                        </div>
                        <CardHeader className="relative z-10">
                            <CardTitle className="text-3xl font-black italic tracking-tighter uppercase font-headline">Arena Season 1</CardTitle>
                            <CardDescription className="text-primary-foreground/80 font-bold">The battle for logic supremacy is live.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-80">
                                    <span>Season Progress</span>
                                    <span>{Math.min(99, Math.floor(((statsData?.totalUsers || 0) / 1000) * 100))}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/20 rounded-full">
                                    <div className="h-full bg-white" style={{ width: `${Math.min(100, ((statsData?.totalUsers || 0) / 1000) * 100)}%` }} />
                                </div>
                            </div>
                            <Button className="w-full bg-white text-primary hover:bg-white/90 font-black rounded-xl py-6 group">
                                <Link to="/arena" className="flex items-center justify-center gap-2">
                                    ENTER THE ARENA <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-surface/50 border-border rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Ranking Metrics</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-blue-500">XP</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Global Experience</p>
                                    <p className="text-xs text-muted-foreground">Earned by publishing snippets and getting likes/copies.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-amber-500">AS</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Arena Score</p>
                                    <p className="text-xs text-muted-foreground">The cumulative score of all your accepted trial submissions.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className="text-[10px] font-bold text-purple-500">AR</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">Authority Rank</p>
                                    <p className="text-xs text-muted-foreground">Permanent reputation unlocked at specific XP milestones.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pro Tip */}
                    <div className="p-6 rounded-3xl bg-surface/30 border border-border/50 border-dashed">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-2">
                            <LayoutDashboard className="h-3 w-3" /> Pro_Protocol
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Creators receive <span className="text-primary font-bold">50 XP</span> for every verified copy of their logic blocks. Precision pays.
                        </p>
                    </div>

                    <Card className="bg-surface/50 border-border rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Trending Logic</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {trendingSnippets.slice(0, 5).map((snippet: any) => (
                                <Link key={snippet.id} to={`/snippets/${snippet.id}`} className="flex items-center gap-3 group cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                        <Zap className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold truncate group-hover:text-primary transition-colors">{snippet.title}</p>
                                        <p className="text-[10px] text-muted-foreground">by @{snippet.author?.username || 'anon'}</p>
                                    </div>
                                </Link>
                            ))}
                            {trendingSnippets.length === 0 && (
                                <p className="text-xs text-muted-foreground text-center py-4 italic">No anomalies detected.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Button({ children, className, ...props }: any) {
    return (
        <button
            className={cn(
                "inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all active:scale-95 disabled:opacity-50",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
