import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { CardTitle } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import {
    Loader2, Award, Zap, Shield, Trophy, Activity, Lock, Target,
    Code, Star, MessageSquare, CheckCircle2, Crown, Flame, Medal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Icon mapping
const ICON_MAP: Record<string, any> = {
    "award": Award,
    "zap": Zap,
    "shield": Shield,
    "trophy": Trophy,
    "activity": Activity,
    "target": Target,
    "code": Code,
    "star": Star,
    "message-square": MessageSquare,
    "check-circle": CheckCircle2,
    "crown": Crown,
    "flame": Flame,
    "medal": Medal,
    "lock": Lock,
};

// Perks Definition
const INFLUENCE_PERKS = [
    { score: 100, title: "Explorer", desc: "Unlock Profile Flair", icon: Star, color: "text-blue-400" },
    { score: 500, title: "Contributor", desc: "Vote on Roadmap", icon: MessageSquare, color: "text-emerald-400" },
    { score: 1000, title: "Rising Star", desc: "Highlight Comments", icon: Zap, color: "text-amber-400" },
    { score: 5000, title: "Architect", desc: "Create Challenges", icon: Crown, color: "text-purple-400" },
];

const UNLOCK_GUIDE: Record<string, string[]> = {
    '1_snippet': [
        "Visit the 'Create' section in your dashboard",
        "Develop an original code snippet or useful utility",
        "Successfully execute and publish your work to the feed"
    ],
    '1_practice_solved': [
        "Head over to the 'Challenges' arena",
        "Select a problem and write a solution in the workspace",
        "Pass all hidden test cases to secure the achievement"
    ],
    'feedback_given': [
        "Join the conversation at the 'Feedback Wall'",
        "Post a meaningful suggestion, bug report, or feature idea",
        "Help the ecosystem grow with your active participation"
    ],
    '1_contest': [
        "Check the 'Arena' for any upcoming official contests",
        "Register for an event and join when the timer hits zero",
        "Submit at least one valid solution during the live event"
    ],
    '5_snippets': [
        "Continue sharing your expertise with the community",
        "Publish 5 unique snippets to the public feed",
        "Recognized as an active content creator"
    ],
    '25_snippets': [
        "Reach the elite tier of platform contributors",
        "Maintain a personal library of 25+ verified snippets",
        "Awarded to master-level engineers and architects"
    ],
    '5_practice_solved': [
        "Sharpen your skills in the Challenges Arena",
        "Solve 5 different problems with optimized solutions",
        "A stepping stone to competitive mastery"
    ],
    '25_practice_solved': [
        "Demonstrate superior algorithmic knowledge",
        "Acquire 'Accepted' status on 25 different challenges",
        "Verified as a top-tier problem solver"
    ],
    '5_feedback': [
        "Significantly impact the platform's development",
        "Submit 5 helpful suggestions or verified reports",
        "Become a foundation of the community wall"
    ],
    '5_contests': [
        "Become a regular in live competitive events",
        "Successfully participate in 5 official Arena contests",
        "Awarded for consistency and competitive spirit"
    ],
    'early_adopter': [
        "Join CodeStudio during the initial launch phase",
        "Establish an active profile during the Beta window",
        "Reserved exclusively for our first 1,000 pioneers"
    ],
    'contest_winner': [
        "Participate in any ranked Arena competition",
        "Outperform all rivals to reach the #1 global position",
        "Official leaderboard verification of your dominance"
    ],
    'competitor': [
        "Enter at least three separate Arena tournaments",
        "Maintain high-quality submissions across all events",
        "Demonstrate consistent competitive drive and skill"
    ]
};

export default function Badges() {
    const { user: authUser } = useAuth();
    const username = authUser?.username;

    const { data, isLoading, error } = useQuery({
        queryKey: ['badges', username],
        queryFn: () => usersAPI.getBadges(username!),
        enabled: !!username,
    });

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>;

    if (error || !username) {
        return (
            <div className="p-8">
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg">
                    <div className="font-bold mb-1">Error</div>
                    <div>Failed to load badges. Please log in.</div>
                </div>
            </div>
        )
    }

    const { badges, influence } = data || {};
    const currentScore = Number(influence?.score || 0);

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-12 animate-in fade-in duration-500 pb-20">
            {/* Header / Influence Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 border border-white/10 shadow-2xl p-8 md:p-12 text-center md:text-left group">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/30 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 max-w-2xl">
                        <div>
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white">
                                    {influence?.rank || 'Novice'}
                                </h1>
                                {authUser?.role === 'ADMIN' && (
                                    <UIBadge variant="secondary" className="bg-amber-400/20 text-amber-300 border-amber-400/50 px-3 py-1 text-xs">ADMIN</UIBadge>
                                )}
                            </div>
                            <p className="text-xl text-slate-300 font-light leading-relaxed">
                                Your influence score unlocks exclusive perks and showcases your mastery.
                                Climb the ranks by solving problems and helping the community.
                            </p>
                        </div>

                        {/* Stats Breakdown */}
                        <div className="grid grid-cols-3 gap-4 pt-2">
                            {[
                                { label: "Trust Score", value: influence?.breakdown?.trust || 0, color: "text-white" },
                                { label: "Snippet Points", value: `+${influence?.breakdown?.snippets || 0}`, color: "text-emerald-400" },
                                { label: "Badge Points", value: `+${influence?.breakdown?.badges || 0}`, color: "text-purple-400" }
                            ].map((stat, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-center hover:bg-white/10 transition-colors">
                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">{stat.label}</div>
                                    <div className={cn("text-2xl font-mono font-bold", stat.color)}>{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Big Score Display */}
                    <div className="relative flex flex-col items-center justify-center p-8 rounded-full border border-white/10 bg-black/20 backdrop-blur-sm aspect-square w-64 h-64 shadow-[0_0_50px_rgba(124,58,237,0.3)]">
                        <Trophy className="absolute top-4 text-yellow-500/20 w-12 h-12" />
                        <div className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter">
                            {currentScore.toLocaleString()}
                        </div>
                        <div className="text-sm font-bold text-primary tracking-[0.3em] uppercase mt-2">Influence</div>

                        {/* Progress Ring (Visual Only) */}
                        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-2">
                            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/5" />
                            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/50"
                                strokeDasharray="300" strokeDashoffset="100" strokeLinecap="round" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Perks Progression */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Crown className="w-6 h-6 text-yellow-500" />
                    <h2 className="text-2xl font-bold text-foreground">Rank Benefits</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {INFLUENCE_PERKS.map((perk) => {
                        const isUnlocked = currentScore >= perk.score;
                        return (
                            <div key={perk.score} className={cn(
                                "relative p-6 rounded-xl border transition-all duration-300 overflow-hidden",
                                isUnlocked
                                    ? "bg-gradient-to-br from-surface to-background border-primary/30 shadow-lg shadow-primary/5"
                                    : "bg-surface/30 border-white/5 opacity-60 grayscale"
                            )}>
                                {isUnlocked && <div className="absolute inset-0 bg-primary/5" />}
                                <div className="flex items-center justify-between mb-4 relative z-10">
                                    <perk.icon className={cn("w-8 h-8", perk.color)} />
                                    {isUnlocked ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    ) : (
                                        <span className="text-xs font-mono text-muted-foreground">{perk.score} pts</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg mb-1 relative z-10">{perk.title}</h3>
                                <p className="text-sm text-muted-foreground relative z-10">{perk.desc}</p>

                                {/* Progress Bar for Locked */}
                                {!isUnlocked && (
                                    <div className="mt-4 h-1 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white/20"
                                            style={{ width: `${Math.min((currentScore / perk.score) * 100, 100)}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Badges Grid */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Medal className="w-6 h-6 text-indigo-500" />
                    <h2 className="text-2xl font-bold text-foreground">Achievements</h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {badges?.map((badge: any) => {
                        const Icon = ICON_MAP[badge.icon] || Award;
                        const isUnlocked = badge.unlocked;
                        const progressPercent = badge.threshold > 0
                            ? Math.min((badge.progress / badge.threshold) * 100, 100)
                            : (isUnlocked ? 100 : 0);

                        return (
                            <motion.div
                                key={badge.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className={cn(
                                    "relative group rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
                                    isUnlocked
                                        ? "bg-surface border-indigo-500/20 hover:border-indigo-500/50"
                                        : "bg-surface/40 border-white/5 hover:bg-surface/60"
                                )}
                            >
                                {/* Glow Effect for Unlocked */}
                                {isUnlocked && (
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20" />
                                )}

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={cn(
                                        "p-3 rounded-2xl shadow-inner",
                                        isUnlocked
                                            ? "bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-inset ring-white/10"
                                            : "bg-slate-900/50 text-slate-600"
                                    )}>
                                        <Icon className="w-8 h-8" strokeWidth={1.5} />
                                    </div>
                                    {isUnlocked ? (
                                        <UIBadge variant="outline" className="border-indigo-500/30 text-indigo-400 bg-indigo-500/5 uppercase tracking-wider text-[10px]">Unlocked</UIBadge>
                                    ) : (
                                        <Lock className="w-5 h-5 text-slate-700" />
                                    )}
                                </div>

                                <CardTitle className={cn("mb-2 relative z-10", isUnlocked ? "text-foreground" : "text-muted-foreground/60")}>
                                    {badge.name}
                                </CardTitle>
                                <div className="text-sm text-muted-foreground mb-6 min-h-[60px] relative z-10 space-y-4">
                                    <p className="leading-relaxed">{badge.description}</p>
                                    {!isUnlocked && (
                                        <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1 w-1 rounded-full bg-indigo-500" />
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">How to unlock</p>
                                            </div>
                                            <div className="space-y-2.5">
                                                {(UNLOCK_GUIDE[badge.condition] || ["Perform designated activities", "Meet achievement criteria", "Verified by platform curators"]).map((step: string, idx: number) => (
                                                    <div key={idx} className="flex gap-4 items-start group/step">
                                                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-[9px] font-mono text-indigo-400 group-hover/step:bg-indigo-500 group-hover/step:text-white transition-all duration-300">
                                                            {idx + 1}
                                                        </div>
                                                        <p className="text-xs text-slate-400 leading-normal group-hover/step:text-slate-200 transition-colors pt-0.5">
                                                            {step}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Progress Section */}
                                <div className="space-y-2 relative z-10">
                                    {!isUnlocked && badge.threshold > 0 && (
                                        <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                            <span>Progress</span>
                                            <span>{badge.progress} / {badge.threshold}</span>
                                        </div>
                                    )}
                                    {isUnlocked && (
                                        <div className="text-xs text-indigo-400/80 font-mono flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Earned {new Date(badge.unlockedAt).toLocaleDateString()}
                                        </div>
                                    )}

                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${progressPercent}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={cn(
                                                "h-full rounded-full transition-all",
                                                isUnlocked ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-slate-700"
                                            )}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
