import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AuraAvatarProps {
    src?: string;
    username: string;
    xp: number;
    badgeCount?: number;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    hideBadge?: boolean;
}

export function AuraAvatar({ src, username, xp, size = "md", className, hideBadge }: AuraAvatarProps) {
    // Determine Aura Level
    const getAuraColor = () => {
        if (xp >= 10000) return "from-cyan-400 via-blue-500 to-purple-600"; // Diamond
        if (xp >= 5000) return "from-yellow-300 via-amber-500 to-yellow-600"; // Gold/Elite
        if (xp >= 2000) return "from-slate-300 via-indigo-400 to-slate-500"; // Platinum
        if (xp >= 500) return "from-emerald-400 to-teal-500"; // Growth
        return "from-primary/40 to-primary/10"; // Base
    };

    const getPulseIntensity = () => {
        if (xp >= 10000) return 3;
        if (xp >= 5000) return 2;
        if (xp >= 2000) return 1.5;
        return 1;
    };

    const auraColor = getAuraColor();
    const pulse = getPulseIntensity();

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-24 w-24",
        xl: "h-32 w-32"
    };

    const containerSize = {
        sm: "h-10 w-10",
        md: "h-16 w-16",
        lg: "h-32 w-32",
        xl: "h-40 w-40"
    };

    return (
        <div className={cn("relative flex items-center justify-center", containerSize[size], className)}>
            {/* Aura Rings */}
            <motion.div
                animate={{
                    scale: [1, 1.1 * pulse, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 3 / pulse,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={cn(
                    "absolute inset-0 rounded-full bg-gradient-to-tr blur-xl",
                    auraColor
                )}
            />

            {/* Outer Orbit Line (for high XP) */}
            {xp >= 5000 && (
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 rounded-full border border-dashed border-white/20"
                />
            )}

            {/* Avatar Image */}
            <div className={cn(
                "relative rounded-2xl overflow-hidden border-2 bg-[#0c0c0e] z-10 transition-all",
                sizeClasses[size],
                xp >= 5000 ? "border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "border-white/10"
            )}>
                <img
                    src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                    alt={username}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Level Badge - Optimized for sm size */}
            {!hideBadge && (
                <div className={cn(
                    "absolute z-20 pointer-events-none",
                    size === "sm" ? "-top-0.5 -right-1" : "-top-1 -right-2"
                )}>
                    <div className={cn(
                        "rounded-full font-black text-white shadow-xl border border-white/20 flex items-center justify-center",
                        size === "sm" ? "px-1.5 h-3.5 min-w-[14px] text-[7px]" : "px-2 py-0.5 text-[9px]",
                        xp >= 10000 ? "bg-cyan-500 shadow-cyan-500/40" :
                            xp >= 5000 ? "bg-amber-500 shadow-amber-500/40" :
                                "bg-primary shadow-primary/40"
                    )}>
                        {xp}
                        {size !== "sm" && <span className="ml-0.5 text-[7px] opacity-70">XP</span>}
                    </div>
                </div>
            )}
        </div>
    );
}
