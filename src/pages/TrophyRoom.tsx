import { useQuery } from "@tanstack/react-query";
import { usersAPI, systemAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ThreeBadge } from "@/components/ThreeBadge";
import { Trophy, Star, Target, Zap, Crown, Hexagon } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function TrophyRoom() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Fetch user's achievements
    const { data: badgeData } = useQuery({
        queryKey: ['badges', user?.username],
        queryFn: () => usersAPI.getBadges(user?.username || ""),
        enabled: !!user?.username,
    });

    // Fetch platform stats for the bottom row
    const { data: statsData } = useQuery({
        queryKey: ['landing-stats'],
        queryFn: () => systemAPI.getLandingStats(),
    });

    const allBadges = badgeData?.badges || [];
    const unlockedTrophies = allBadges.filter((b: any) => b.unlocked && b.type === "TROPHY");
    const totalPossibleTrophies = allBadges.filter((b: any) => b.type === "TROPHY").length || 4;
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
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight font-headline text-foreground">
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
                        <div className="text-foreground font-black text-xl font-headline">{unlockedTrophies.length} / {totalPossibleTrophies}</div>
                    </div>
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
            <div className="pt-20 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-10 stats-row">
                {[
                    { label: "Global Reputation", value: `${authority?.score || 0} AP`, icon: Star, color: "text-blue-400" },
                    { label: "Logic Entropy", value: `${statsData?.totalSnippets || 0}`, icon: Zap, color: "text-purple-400" },
                    { label: "Total Architects", value: `${statsData?.totalUsers || 0}`, icon: Target, color: "text-emerald-400" },
                    { label: "Authority Level", value: authority?.rank || "NOVICE", icon: Crown, color: "text-amber-400" },
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
                    <h4 className="text-lg font-bold text-foreground">Vault Access Protocols</h4>
                    <p className="text-sm text-muted-foreground">Generate keys for your vault or enter a key from another developer to view their showcase.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const key = `VAULT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                            navigator.clipboard.writeText(key);
                            toast({
                                title: "Access Key Generated",
                                description: `Key: ${key} copied to clipboard.`,
                            });
                        }}
                        className="px-6 py-4 rounded-xl bg-card text-foreground font-black uppercase tracking-widest text-xs border border-border hover:border-primary/50 transition-colors"
                    >
                        Generate Key
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            const key = window.prompt("ENTER VAULT ACCESS KEY:");
                            if (key && key.startsWith('VAULT-')) {
                                toast({
                                    title: "Access Initialized",
                                    description: "Secure handshake successful. Redirecting to shared vault...",
                                });
                                // Logic for redirecting or loading other user's badges would go here
                            } else if (key) {
                                toast({
                                    title: "Invalid Protocol",
                                    description: "Entered key does not match vault handshake format.",
                                    variant: "destructive"
                                });
                            }
                        }}
                        className="px-6 py-4 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        Enter Key
                    </motion.button>
                </div>
            </div>
        </div>
    );
}

