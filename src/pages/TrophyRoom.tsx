import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ThreeBadge } from "@/components/ThreeBadge";
import { Trophy, Star, Target, Zap, Crown, Hexagon, Sparkles } from "lucide-react";
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

    // Map backend badges to specific colors/labels for 3D rendering
    const premiumAchievements = [
        { id: 'early_adopter', color: '#f59e0b', label: "Pioneer", subLabel: "Early Access Elite" },
        { id: '1_snippet', color: '#3b82f6', label: "Creator", subLabel: "First Logic Node" },
        { id: '25_snippets', color: '#8b5cf6', label: "Architect", subLabel: "Master System Designer" },
        { id: 'contest_winner', color: '#ec4899', label: "Champion", subLabel: "Arena Dominator" },
        { id: '1_practice_solved', color: '#10b981', label: "Solver", subLabel: "Algorithm Logic OK" },
    ];

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
                    <h1 className="text-5xl font-black tracking-tight font-headline text-white">
                        Sanctum of <span className="text-amber-400 italic">Excellence</span>
                    </h1>
                    <p className="text-white/40 max-w-xl mx-auto font-medium text-lg leading-relaxed">
                        Behold your digital legacy. Your achievements are rendered as persistent 3D artifacts
                        in our secure blockchain-validated vault.
                    </p>
                </div>

                <div className="flex items-center gap-8 py-4 px-8 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl">
                    <div className="text-center">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Rank Status</div>
                        <div className="text-white font-black text-xl italic font-headline">{authority?.rank || "NOVICE"}</div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="text-center">
                        <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Artifacts</div>
                        <div className="text-white font-black text-xl font-headline">{unlockedTrophies.length} / 4</div>
                    </div>
                </div>
            </div>

            {/* 3D Showcase Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
                {premiumAchievements.map((ach, idx) => {
                    const isUnlocked = allBadges.some((b: any) => b.condition === ach.id && b.unlocked);

                    return (
                        <motion.div
                            key={ach.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            {!isUnlocked ? (
                                <div className="h-[300px] w-full rounded-3xl bg-white/[0.01] border border-dashed border-white/10 flex flex-col items-center justify-center p-8 grayscale opacity-50 relative group">
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" />
                                    <Hexagon className="w-16 h-16 text-white/10 mb-6 group-hover:scale-110 transition-transform" strokeWidth={1} />
                                    <div className="relative z-20 text-center">
                                        <h4 className="text-white/20 font-black uppercase tracking-[0.2em] mb-2">{ach.label} Locked</h4>
                                        <p className="text-[10px] text-white/10 font-bold max-w-[150px]">Requires specific neural pattern verification to unlock</p>
                                    </div>
                                    <Sparkles className="absolute top-4 right-4 w-4 h-4 text-white/5" />
                                </div>
                            ) : (
                                <ThreeBadge
                                    color={ach.color}
                                    label={ach.label}
                                    subLabel={ach.subLabel}
                                />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Platform Stats Row */}
            <div className="pt-20 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-10">
                {[
                    { label: "Global Reputation", value: "98.4%", icon: Star, color: "text-blue-400" },
                    { label: "Battle Efficiency", value: "72/100", icon: Target, color: "text-emerald-400" },
                    { label: "Logic Entropy", value: "40.2k", icon: Zap, color: "text-purple-400" },
                    { label: "Authority Level", value: "Master", icon: Crown, color: "text-amber-400" },
                ].map((stat, i) => (
                    <div key={i} className="space-y-3 group">
                        <div className="flex items-center gap-3">
                            <stat.icon className={`w-5 h-5 ${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20">{stat.label}</span>
                        </div>
                        <div className="text-3xl font-black text-white font-headline group-hover:translate-x-1 transition-transform">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Informational Footer */}
            <div className="bg-primary/5 border border-primary/10 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Share Your Valor</h4>
                    <p className="text-sm text-white/40">Generate a unique dynamic link to showcase your 3D vault to external recruiters.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 rounded-xl bg-white text-black font-black uppercase tracking-widest text-xs shadow-xl shadow-white/5"
                >
                    Generate Vault Access Key
                </motion.button>
            </div>
        </div>
    );
}
