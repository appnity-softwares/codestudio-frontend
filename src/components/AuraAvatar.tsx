import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { STORE_ITEMS } from "@/lib/constants";


interface AuraAvatarProps {
    src?: string;
    username: string;
    xp: number;
    equippedAura?: string | null;
    badgeCount?: number;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
    customAura?: {
        color: string;
        pulse: number;
    };
}

export function AuraAvatar({ src, username, equippedAura, size = "md", className, customAura }: AuraAvatarProps) {




    const getAuraColor = () => {
        if (equippedAura) {
            const aura = STORE_ITEMS.find(item => item.id === equippedAura && item.type === 'AURA');
            if (aura) return aura.effect;
        }
        if (customAura) return customAura.color;

        // User requested: "for normal user ... simple profile not shine ... only show shin and aura on equip"
        // So we disable the automatic XP-based auras if nothing is explicitly equipped.
        return "";
    };

    const getPulseIntensity = () => {
        if (customAura) return customAura.pulse;
        return 0;
    };

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

    const auraColor = getAuraColor() || "";
    const pulse = getPulseIntensity();
    const isCustomAura = auraColor.includes('ring');

    if (!auraColor) {
        // Simple avatar for users without aura
        return (
            <div className={cn("relative shrink-0 rounded-full overflow-hidden bg-muted", sizeClasses[size], className)}>
                <img
                    src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                    alt={username}
                    className="w-full h-full object-cover"
                />
            </div>
        );
    }

    const paddingMapping = {
        sm: "p-[1px]",
        md: "p-[1px]",
        lg: "p-[1.5px]",
        xl: "p-[1.5px]"
    };

    const ringMapping = {
        sm: "ring-1",
        md: "ring-[1px]",
        lg: "ring-[1.5px]",
        xl: "ring-[1.5px]"
    };

    // Determine cost/tier for glow intensity
    let glowFactor = 1;
    if (equippedAura) {
        const auraItem = STORE_ITEMS.find(i => i.id === equippedAura);
        if (auraItem) {
            if (auraItem.adminOnly || auraItem.cost >= 2000) glowFactor = 1.8;
            else if (auraItem.cost >= 1000) glowFactor = 1.4;
            else glowFactor = 1.0;
        }
    }

    const glowScale = {
        sm: 1 + (0.05 * glowFactor),
        md: 1 + (0.1 * glowFactor),
        lg: 1 + (0.15 * glowFactor),
        xl: 1 + (0.2 * glowFactor)
    };

    const glowBlur = {
        sm: "blur-md",
        md: "blur-xl",
        lg: "blur-2xl",
        xl: "blur-3xl"
    };

    // Helper to remove any hardcoded ring thickness from the aura string
    const processedAuraColor = auraColor
        .replace(/ring-\[?\d+px\]?/g, "") // remove ring-[1px], ring-2, etc.
        .replace(/p-\[?\d+px\]?/g, "")    // remove p-[1px], etc.
        .trim();

    return (
        <div className={cn("relative flex items-center justify-center shrink-0", containerSize[size], className)}>
            {/* 1. Primary Glow (Dynamic Flare) */}
            <motion.div
                animate={{
                    opacity: [0.2 * glowFactor, 0.5 * glowFactor, 0.2 * glowFactor],
                    scale: [1, glowScale[size], 1],
                }}
                transition={{
                    duration: 3 / Math.max(pulse, 0.5),
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={cn(
                    "absolute inset-0 rounded-full z-0",
                    glowBlur[size],
                    !isCustomAura && (processedAuraColor.includes('from') ? `bg-gradient-to-tr ${processedAuraColor}` : processedAuraColor),
                    isCustomAura && "bg-primary/40"
                )}
            />

            <div className={cn(
                "relative rounded-full transition-all duration-500 z-10 brightness-125",
                paddingMapping[size],
                ringMapping[size],
                sizeClasses[size],
                isCustomAura ? processedAuraColor : (processedAuraColor.includes('from') ? `ring-primary/50` : `ring-current`)
            )}>
                <div className="relative w-full h-full rounded-full overflow-hidden border-[1px] border-background bg-background shadow-inner">
                    <img
                        src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                        alt={username}
                        className="w-full h-full object-cover"
                    />

                    {/* Premium Sweep Shine Effect - Layer 1 */}
                    <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "linear"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 z-40 pointer-events-none"
                    />

                    {/* Premium Sweep Shine Effect - Layer 2 (Faster spark for lg/xl) */}
                    {(size === 'lg' || size === 'xl') && (
                        <motion.div
                            animate={{ x: ["-100%", "200%"] }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                repeatDelay: 4,
                                ease: "linear"
                            }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 z-40 pointer-events-none"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
