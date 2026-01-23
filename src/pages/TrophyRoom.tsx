import { useQuery } from "@tanstack/react-query";
import { usersAPI, leaderboardAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { AuraAvatar } from "@/components/AuraAvatar"
import { useAuth } from "@/context/AuthContext";
import { ThreeBadge } from "@/components/ThreeBadge";
import { Trophy, Star, Target, Zap, Crown, Hexagon } from "lucide-react";
import { motion } from "framer-motion";

export default function TrophyRoom() {
    const { user } = useAuth();

    // Fetch user's achievements
    const { data: badgeData } = useQuery({
        queryKey: ['badges', user?.username],
        queryFn: () => usersAPI.getBadges(user?.username || ""),
        enabled: !!user?.username,
    });

    const allBadges = badgeData?.badges || [];
    const unlockedTrophies = allBadges.filter((b: any) => b.unlocked && b.type === "TROPHY");
    const authority = badgeData?.authority;


    return (
        <div className="container max-w-7xl mx-auto py-12 px-6 space-y-16 animate-in fade-in duration-1000">
            {/* Header Section */}
            <div className="flex flex-col items-center text-center space-y-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-5 rounded-[2.5rem] bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-2xl shadow-amber-500/20"
                >
                    <Trophy className="w-12 h-12 text-amber-950" strokeWidth={2.5} />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-5xl font-black tracking-tight font-headline text-foreground">
                        Sanctum of <span className="text-amber-400 italic">Excellence</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl mx-auto font-medium text-lg leading-relaxed">
                        Behold your digital legacy. Your achievements are rendered as persistent 3D artifacts
                        in our secure blockchain-validated vault.
                    </p>
                </div>

                <div className="flex items-center gap-8 py-4 px-8 rounded-2xl bg-card border border-border backdrop-blur-xl">
                    <div className="text-center">
                        <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Rank Status</div>
                        <div className="text-foreground font-black text-xl italic font-headline">{authority?.rank || "NOVICE"}</div>
                    </div>
                    <div className="h-8 w-px bg-border" />
                    <div className="text-center">
                        <div className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-1">Artifacts</div>
                        <div className="text-foreground font-black text-xl font-headline">{unlockedTrophies.length} / 4</div>
                    </div>
                </div>
            </div>

            {/* Global Leaderboard Section */}
            <div className="max-w-4xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Global Rankings</h3>
                    <Link to="/arena" className="text-xs font-bold text-primary hover:underline">View Full Arena</Link>
                </div>
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                    <LeaderboardList />
                </div>
            </div>

            {/* 3D Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                {unlockedTrophies.length > 0 ? (
                    unlockedTrophies.map((badge: any, idx: number) => (
                        <motion.div
                            key={badge.id || idx}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <ThreeBadge
                                color={badge.iconColor || "#f59e0b"} // Fallback color
                                label={badge.name}
                                subLabel={badge.description.slice(0, 30)}
                            />
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-50">
                        <Hexagon className="w-20 h-20 text-muted-foreground/20 mb-6" strokeWidth={1} />
                        <h4 className="text-xl font-black text-muted-foreground uppercase tracking-widest mb-2">Vault Empty</h4>
                        <p className="text-sm text-muted-foreground/60 max-w-sm">
                            Complete challenges, win contests, and solve problems to mint new artifacts into your showcase.
                        </p>
                    </div>
                )}
            </div>

            {/* Platform Stats Row */}
            <div className="pt-20 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-10">
                {[
                    { label: "Global Reputation", value: "98.4%", icon: Star, color: "text-blue-400" },
                    { label: "Battle Efficiency", value: "72/100", icon: Target, color: "text-emerald-400" },
                    { label: "Logic Entropy", value: "40.2k", icon: Zap, color: "text-purple-400" },
                    { label: "Authority Level", value: "Master", icon: Crown, color: "text-amber-400" },
                ].map((stat, i) => (
                    <div key={i} className="space-y-3 group">
                        <div className="flex items-center gap-3">
                            <stat.icon className={`w-5 h-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black text-foreground font-headline group-hover:translate-x-1 transition-transform">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Informational Footer */}
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-foreground">Share Your Valor</h4>
                    <p className="text-sm text-muted-foreground">Generate a unique dynamic link to showcase your 3D vault to external recruiters.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl bg-card text-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-border/5"
                >
                    Generate Vault Access Key
                </motion.button>
            </div>
        </div>
    );
}

function LeaderboardList() {
    const { data } = useQuery({
        queryKey: ['leaderboard', 'global'],
        queryFn: () => leaderboardAPI.getGlobal(),
        staleTime: 60000,
    });
    const topUsers = data?.leaderboard || [];

    if (topUsers.length === 0) return <div className="p-8 text-center text-muted-foreground text-sm">No rankings yet.</div>;

    return (
        <div className="divide-y divide-border/50">
            {topUsers.slice(0, 5).map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="w-8 flex justify-center">
                        {idx === 0 ? <Crown className="w-5 h-5 text-amber-400 fill-amber-400/20" /> :
                            idx === 1 ? <div className="text-lg font-black text-slate-400">#2</div> :
                                idx === 2 ? <div className="text-lg font-black text-amber-700">#3</div> :
                                    <div className="text-sm font-bold text-muted-foreground">#{idx + 1}</div>}
                    </div>
                    <AuraAvatar
                        src={user.image}
                        username={user.username}
                        xp={user.xp}
                        size="md"
                        className={idx === 0 ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-background" : ""}
                    />
                    <div className="flex-1 min-w-0">
                        <Link to={`/u/${user.username}`} className="block truncate hover:underline">
                            <span className="font-bold text-foreground">{user.name || user.username}</span>
                        </Link>
                        <span className="text-xs text-muted-foreground font-mono">@{user.username}</span>
                    </div>
                    <div className="text-right">
                        <div className="text-sm font-black text-primary font-mono">{user.xp.toLocaleString()} XP</div>
                        <div className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-wider">Level {user.level || 1}</div>
                    </div>
                </div>
            ))}
        </div>
    );
}
