import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { usersAPI, systemAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ThreeBadge } from "@/components/ThreeBadge";
import { Trophy, Star, Zap, Crown, Hexagon, X, ShieldAlert, Key, Lock as LockIcon, Info, ChevronRight, Award } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { VaultHandshake } from "@/components/VaultHandshake";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function TrophyRoom() {
    const { user } = useAuth();
    const { toast } = useToast();

    // Vault State
    const [targetUsername, setTargetUsername] = useState<string | null>(null);
    const [showHandshake, setShowHandshake] = useState(false);
    const [handshakeTarget, setHandshakeTarget] = useState("");
    const [showProtocolInfo, setShowProtocolInfo] = useState(false);

    // Initialize targetUsername when user loaded
    useEffect(() => {
        if (user?.username && !targetUsername) {
            setTargetUsername(user.username);
        }
    }, [user, targetUsername]);

    // Fetch achievements for target user
    const { data: badgeData, isLoading } = useQuery({
        queryKey: ['badges', targetUsername],
        queryFn: () => usersAPI.getBadges(targetUsername || ""),
        enabled: !!targetUsername,
    });

    // Fetch platform stats
    const { data: statsData } = useQuery({
        queryKey: ['landing-stats'],
        queryFn: () => systemAPI.getLandingStats(),
    });

    const allBadges = badgeData?.badges || [];
    const unlockedTrophies = allBadges.filter((b: any) => b.unlocked && (b.type === "TROPHY" || b.type === "ACHIEVEMENT"));
    const totalPossibleTrophies = allBadges.filter((b: any) => b.type === "TROPHY" || b.type === "ACHIEVEMENT").length || 4;
    const authority = badgeData?.authority;

    const isViewingSelf = targetUsername === user?.username;

    const handleGenerateKey = async () => {
        try {
            const { vaultKey } = await usersAPI.generateVaultKey();
            navigator.clipboard.writeText(vaultKey);
            toast({
                title: "Access Key Generated",
                description: "Your secure vault key has been copied to clipboard.",
            });
        } catch (error) {
            toast({
                title: "Protocol Error",
                description: "Failed to generate secure access key.",
                variant: "destructive"
            });
        }
    };

    const handleEnterKey = async () => {
        const key = window.prompt("ENTER VAULT ACCESS KEY:");
        if (key && key.startsWith('VAULT-')) {
            try {
                const { username } = await usersAPI.verifyVaultKey(key);

                if (username.toLowerCase() === user?.username?.toLowerCase()) {
                    toast({ title: "Local Access", description: "You are already in your own vault." });
                    return;
                }

                setHandshakeTarget(username);
                setShowHandshake(true);
            } catch (error) {
                toast({
                    title: "Access Denied",
                    description: "Invalid or expired vault protocol key.",
                    variant: "destructive"
                });
            }
        } else if (key) {
            toast({
                title: "Invalid Protocol",
                description: "Entered key does not match vault handshake format.",
                variant: "destructive"
            });
        }
    };

    const onHandshakeComplete = () => {
        setTargetUsername(handshakeTarget.toLowerCase());
        setShowHandshake(false);
        toast({
            title: "Handshake Successful",
            description: `Now viewing ${handshakeTarget}'s sanctum.`,
        });
    };

    const handleExitVault = () => {
        setTargetUsername(user?.username || null);
        toast({ title: "Vault Exited", description: "Returning to your personal sanctum." });
    };

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 selection:text-foreground">
            <VaultHandshake
                isOpen={showHandshake}
                username={handshakeTarget}
                onComplete={onHandshakeComplete}
            />

            {/* Viewing Banner */}
            <AnimatePresence>
                {!isViewingSelf && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-primary px-6 py-2.5 rounded-full shadow-2xl shadow-primary/40 border border-white/20 backdrop-blur-md"
                    >
                        <div className="flex items-center gap-2 text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                            <ShieldAlert className="h-4 w-4" />
                            READ-ONLY ACCESS: {targetUsername?.toUpperCase()}
                        </div>
                        <button
                            onClick={handleExitVault}
                            className="bg-black/20 hover:bg-black/40 p-1 rounded-full transition-colors"
                        >
                            <X className="h-4 w-4 text-white" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* HERO SECTION / COMMAND CENTER */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
                </div>

                <div className="container max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
                        {/* Title & Identity Area */}
                        <div className="space-y-8 max-w-2xl">
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                className="flex items-center gap-3"
                            >
                                <div className={cn(
                                    "p-3 rounded-2xl shadow-xl transition-all duration-700",
                                    isViewingSelf
                                        ? "bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-amber-500/20"
                                        : "bg-gradient-to-tr from-primary to-blue-400 shadow-primary/20"
                                )}>
                                    <Trophy className={cn("w-6 h-6", isViewingSelf ? "text-amber-950" : "text-white")} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/70 leading-none">
                                        {isViewingSelf ? "Authenticated Protocol" : "Guest Handshake Active"}
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest leading-none">
                                        Security Tier 4 • Encrypted
                                    </div>
                                </div>
                            </motion.div>

                            <div className="space-y-4">
                                <motion.h1
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-5xl sm:text-7xl font-black tracking-tighter font-headline leading-[0.9]"
                                >
                                    {isViewingSelf ? "Your " : `${targetUsername}'s `}
                                    <span className={cn(
                                        "italic font-serif block mt-2",
                                        isViewingSelf ? "text-amber-400" : "text-primary"
                                    )}>Digital Sanctum</span>
                                </motion.h1>

                                <motion.p
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-muted-foreground text-lg font-medium leading-relaxed max-w-lg"
                                >
                                    {isViewingSelf
                                        ? "A persistent showcase of your architectural milestones and logical triumphs, rendered as verified digital artifacts."
                                        : "Observing a verified set of platform achievements. These relics represent proven expertise within the DevConnect ecosystem."
                                    }
                                </motion.p>
                            </div>

                            {/* Vault Controls Integrated in Hero */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex flex-wrap items-center gap-4 pt-4"
                            >
                                {isViewingSelf ? (
                                    <>
                                        <Button
                                            onClick={handleEnterKey}
                                            className="px-8 h-14 rounded-2xl bg-primary text-primary-foreground font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-[0_20px_50px_-15px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_25px_60px_-12px_rgba(var(--primary-rgb),0.4)]"
                                        >
                                            <ShieldAlert className="h-5 w-5" />
                                            Enter Another Vault
                                        </Button>
                                        <Button
                                            onClick={handleGenerateKey}
                                            className="px-8 h-14 rounded-2xl bg-card border border-border hover:border-primary/50 text-foreground font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 group shadow-xl hover:shadow-primary/5 shadow-black/5"
                                        >
                                            <Key className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                            Copy My Access Key
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        onClick={handleExitVault}
                                        className="px-8 h-14 rounded-2xl bg-card border border-border hover:border-destructive/30 text-foreground font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-xl hover:shadow-destructive/5"
                                    >
                                        <X className="h-5 w-5 text-destructive" />
                                        Exit Guest View
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowProtocolInfo(!showProtocolInfo)}
                                    className={cn(
                                        "h-14 w-14 rounded-2xl transition-all active:scale-90",
                                        showProtocolInfo ? "bg-primary/10 text-primary" : "bg-muted/50 hover:bg-muted"
                                    )}
                                >
                                    <Info className="h-6 w-6" />
                                </Button>
                            </motion.div>
                        </div>

                        {/* Stats Panel Area */}
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-full lg:w-fit"
                        >
                            <div className="grid grid-cols-2 gap-4 p-10 rounded-[3rem] bg-card/30 backdrop-blur-3xl border border-white/5 shadow-2xl relative group overflow-hidden">
                                {/* Gloss effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                                {/* Stats Grid */}
                                <div className="space-y-8 relative z-10">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Reputation</div>
                                        <div className="text-4xl font-black text-blue-400 font-headline tabular-nums">{authority?.score || 0}<span className="text-[10px] uppercase opacity-40 ml-1">AP</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Logic Entropy</div>
                                        <div className="text-4xl font-black text-purple-400 font-headline tabular-nums">{statsData?.totalSnippets || 0}</div>
                                    </div>
                                </div>
                                <div className="space-y-8 pl-8 border-l border-border/50 relative z-10">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Unlocked</div>
                                        <div className="text-4xl font-black text-emerald-400 font-headline tabular-nums">{unlockedTrophies.length}<span className="text-base text-muted-foreground/40 font-medium ml-1">/{totalPossibleTrophies}</span></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Current Role</div>
                                        <div className="text-2xl font-black text-amber-400 font-headline italic uppercase tracking-tight">{authority?.rank || "NOVICE"}</div>
                                    </div>
                                </div>

                                {/* Decorative Background Elements */}
                                <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Hexagon className="w-32 h-32" strokeWidth={1} />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Protocol Information Overlay */}
                    <AnimatePresence>
                        {showProtocolInfo && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden mt-12"
                            >
                                <div className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-[2.5rem] p-10">
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                            <Info className="h-5 w-5" />
                                        </div>
                                        <h3 className="text-xl font-black uppercase tracking-widest">Artifact Acquisition Protocols</h3>
                                    </div>
                                    <div className="grid md:grid-cols-3 gap-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-amber-500 font-black text-xs uppercase tracking-tighter">
                                                <Star className="h-5 w-5" /> Bronze Tier
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                                Automatically minted upon completing your first problem in the <span className="text-foreground">Practice Arena</span>. Represents the initiation into the system's logic.
                                            </p>
                                        </div>
                                        <div className="space-y-4 border-x border-border/50 px-10">
                                            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-tighter">
                                                <Award className="h-5 w-5" /> Silver Tier
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                                Awarded for winning <span className="text-foreground">Sanctioned Contests</span> or maintaining a top 100 position in global rankings. Proof of architectural mastery.
                                            </p>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase tracking-tighter">
                                                <Zap className="h-5 w-5" /> Gold Tier
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                                Conferred to architects with significant <span className="text-foreground">Open Source contributions</span> and Master rank. The pinnacle of digital authority.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* SHOWCASE GRID */}
            <main className="container max-w-7xl mx-auto py-12 px-6">
                <div className="flex items-center justify-between mb-16 px-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-foreground">
                                Verified <span className="text-primary italic">Relics</span>
                            </h2>
                            <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent" />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.4em]">Persistent Milestone Geometry</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 lg:gap-20 min-h-[500px]">
                    {isLoading ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="relative mb-8">
                                <Hexagon className="h-20 w-20 text-primary/10 animate-spin-slow" />
                                <Zap className="h-8 w-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <p className="font-mono text-[10px] text-muted-foreground tracking-[0.5em] uppercase">Decrypting_Vault_Data...</p>
                        </div>
                    ) : unlockedTrophies.length > 0 ? (
                        unlockedTrophies.map((badge: any, idx: number) => (
                            <motion.div
                                key={badge.id || idx}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                className="relative group"
                            >
                                {/* Hover Glow */}
                                <div className="absolute inset-x-0 -inset-y-10 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                                <div className="relative">
                                    <div className="aspect-square relative transform group-hover:scale-105 transition-transform duration-700 ease-out">
                                        <ThreeBadge
                                            color={badge.iconColor || "#f59e0b"}
                                            label={badge.name}
                                            subLabel={badge.description.slice(0, 40) + "..."}
                                        />
                                    </div>

                                    {/* Badge Metadata Footer */}
                                    <div className="mt-8 mx-auto w-fit flex items-center gap-4 px-6 py-3 rounded-2xl bg-muted/30 border border-border/50 backdrop-blur-md group-hover:border-primary/50 transition-colors">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground leading-none mb-1">Authenticity</span>
                                            <span className="text-[9px] text-emerald-400 font-bold uppercase leading-none">Verified • On-Chain</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                            <div className="relative mb-12">
                                <Hexagon className="w-32 h-32 text-muted-foreground/5" strokeWidth={0.5} />
                                <LockIcon className="w-10 h-10 text-muted-foreground/10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <h4 className="text-3xl font-black text-muted-foreground/40 uppercase tracking-[0.3em] mb-4 leading-none">Vault Restricted</h4>
                            <p className="text-muted-foreground/30 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-widest">
                                {isViewingSelf
                                    ? "No relics found. Engage in architectural challenges to populate your sanctum."
                                    : "Empty showcase. This architect has not yet validated their milestones."
                                }
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* PLATFORM STATISTICS FOOTER */}
            <footer className="container max-w-7xl mx-auto pb-24 px-6 mt-20">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/50 to-transparent mb-20" />

                <div className="grid md:grid-cols-3 gap-16">
                    <div className="space-y-6">
                        <div className="p-5 rounded-[2rem] bg-card border border-border shadow-2xl w-fit">
                            <ShieldAlert className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-black uppercase tracking-widest text-sm">Security Handshake V4</h4>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                All displayed artifacts are cryptographically verified against the architect's unique signature. Tamper-evident and persistent.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end space-y-8">
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">Verified Network Capacity</div>
                            <div className="text-4xl font-black font-headline tabular-nums">{statsData?.totalUsers || 0} <span className="text-xs uppercase opacity-30 font-sans">Architects</span></div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">System Logic Integrity</div>
                            <div className="text-4xl font-black font-headline text-emerald-400 tabular-nums">99.99%</div>
                        </div>
                    </div>

                    <div className="flex flex-col justify-end">
                        <div className="p-8 rounded-[2rem] bg-primary/5 border border-primary/10 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-20">
                                <Crown className="h-10 w-10 text-primary" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Authority Protocol</div>
                                <p className="text-xs text-muted-foreground font-medium italic leading-relaxed">
                                    "Your artifacts are a testament to your logical persistence. Maintain the entropy of your brilliance."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                .font-headline {
                    font-family: var(--font-headline, inherit);
                }
            `}</style>
        </div>
    );
}
