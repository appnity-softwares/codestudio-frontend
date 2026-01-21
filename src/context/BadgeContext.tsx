import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SuccessBurst } from '../components/SuccessBurst';
import { Award, Star, Trophy, Zap, Shield, Target, Code, MessageSquare, CheckCircle2, Crown, Flame, Medal } from 'lucide-react';
import { Button } from '../components/ui/button';

const ICON_MAP: Record<string, any> = {
    "award": Award,
    "zap": Zap,
    "shield": Shield,
    "trophy": Trophy,
    "activity": Zap,
    "target": Target,
    "code": Code,
    "star": Star,
    "message-square": MessageSquare,
    "check-circle": CheckCircle2,
    "crown": Crown,
    "flame": Flame,
    "medal": Medal,
};

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface BadgeContextType {
    celebrate: (badges: Badge[]) => void;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function BadgeProvider({ children }: { children: React.ReactNode }) {
    const [activeBadges, setActiveBadges] = useState<Badge[]>([]);
    const [showBurst, setShowBurst] = useState(false);

    const celebrate = useCallback((badges: Badge[]) => {
        if (!badges || badges.length === 0) return;
        setActiveBadges(badges);
        setShowBurst(true);
        setTimeout(() => setShowBurst(false), 3000);
    }, []);

    return (
        <BadgeContext.Provider value={{ celebrate }}>
            {children}
            <SuccessBurst active={showBurst} />
            <AnimatePresence>
                {activeBadges.length > 0 && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-[#0a0a0c] border border-primary/40 rounded-3xl p-8 max-w-sm w-full text-center relative overflow-hidden shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
                            <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />

                            <motion.div
                                initial={{ y: -20, rotate: -10 }}
                                animate={{ y: 0, rotate: 0 }}
                                transition={{ type: "spring", bounce: 0.6 }}
                                className="flex justify-center mb-6"
                            >
                                <div className="p-4 bg-primary/20 rounded-2xl border border-primary/30">
                                    <Award className="h-12 w-12 text-primary" />
                                </div>
                            </motion.div>

                            <h2 className="text-3xl font-black text-white mb-1">Badge Unlocked!</h2>
                            <p className="text-sm text-slate-400 mb-6 font-mono tracking-wider uppercase">Level Up Recorded</p>

                            <div className="space-y-4 my-6">
                                {activeBadges.map(badge => {
                                    const Icon = ICON_MAP[badge.icon.toLowerCase()] || Award;
                                    return (
                                        <motion.div
                                            key={badge.id}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4 text-left relative group overflow-hidden"
                                        >
                                            <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                                                <Icon className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-white text-sm">{badge.name}</div>
                                                <div className="text-xs text-slate-400 line-clamp-1">{badge.description}</div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={() => setActiveBadges([])}
                                className="w-full font-bold h-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                Awesome!
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </BadgeContext.Provider>
    );
}

export function useBadgeCelebration() {
    const context = useContext(BadgeContext);
    if (!context) throw new Error("useBadgeCelebration must be used within BadgeProvider");
    return context;
}
