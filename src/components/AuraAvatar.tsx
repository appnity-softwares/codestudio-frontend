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
    isAdmin?: boolean;
    customAura?: {
        color: string;
        pulse: number;
        ringColor?: string;
    };
}

export function AuraAvatar({ src, username, equippedAura, size = "md", className, customAura, isAdmin }: AuraAvatarProps) {

    const getAuraConfig = () => {
        if (equippedAura) {
            const aura = STORE_ITEMS.find(item => item.id === equippedAura && item.type === 'AURA');
            if (aura) {
                // Extract ring color from effect string
                const ringMatch = aura.effect?.match(/ring-([a-z]+-\d+)/);
                return {
                    ringColor: ringMatch ? ringMatch[1] : 'primary',
                    glowColor: ringMatch ? ringMatch[1] : 'primary',
                    isAdmin: aura.adminOnly || false
                };
            }
        }
        if (customAura) {
            return {
                ringColor: customAura.ringColor || customAura.color,
                glowColor: customAura.color,
                isAdmin: false
            };
        }
        // Special admin aura
        if (isAdmin) {
            return {
                ringColor: 'rose-500',
                glowColor: 'rose-500',
                isAdmin: true
            };
        }
        return null;
    };

    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-24 w-24",
        xl: "h-32 w-32"
    };

    const containerSize = {
        sm: "h-12 w-12",
        md: "h-16 w-16",
        lg: "h-32 w-32",
        xl: "h-40 w-40"
    };

    const ringSize = {
        sm: 2,
        md: 2.5,
        lg: 3,
        xl: 4
    };

    const auraConfig = getAuraConfig();

    if (!auraConfig) {
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

    const glowIntensity = {
        sm: { blur: 8, spread: 4 },
        md: { blur: 12, spread: 6 },
        lg: { blur: 20, spread: 10 },
        xl: { blur: 25, spread: 15 }
    };

    // Map Tailwind color to RGB for box-shadow
    const colorToRgb: Record<string, string> = {
        'cyan-400': '34, 211, 238',
        'cyan-500': '6, 182, 212',
        'amber-400': '251, 191, 36',
        'yellow-400': '250, 204, 21',
        'purple-600': '147, 51, 234',
        'purple-500': '168, 85, 247',
        'rose-500': '244, 63, 94',
        'rose-400': '251, 113, 133',
        'emerald-400': '52, 211, 153',
        'emerald-500': '16, 185, 129',
        'blue-500': '59, 130, 246',
        'blue-400': '96, 165, 250',
        'pink-500': '236, 72, 153',
        'pink-400': '244, 114, 182',
        'indigo-500': '99, 102, 241',
        'orange-500': '249, 115, 22',
        'red-500': '239, 68, 68',
        'primary': 'var(--primary-rgb)'
    };

    const rgbColor = colorToRgb[auraConfig.glowColor] || colorToRgb['primary'];
    const ringRgb = colorToRgb[auraConfig.ringColor] || rgbColor;

    return (
        <div className={cn("relative flex items-center justify-center shrink-0", containerSize[size], className)}>
            {/* Outer Glow Layer */}
            <motion.div
                animate={{
                    opacity: [0.4, 0.7, 0.4],
                    scale: [1, 1.08, 1],
                }}
                transition={{
                    duration: auraConfig.isAdmin ? 1.5 : 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full z-0"
                style={{
                    background: `radial-gradient(circle, rgba(${rgbColor}, 0.3) 0%, rgba(${rgbColor}, 0.1) 50%, transparent 70%)`,
                    filter: `blur(${glowIntensity[size].blur}px)`,
                }}
            />

            {/* Inner Glow Ring */}
            <motion.div
                animate={{
                    boxShadow: [
                        `0 0 ${glowIntensity[size].spread}px rgba(${ringRgb}, 0.6), inset 0 0 ${glowIntensity[size].spread / 2}px rgba(${ringRgb}, 0.2)`,
                        `0 0 ${glowIntensity[size].spread * 2}px rgba(${ringRgb}, 0.8), inset 0 0 ${glowIntensity[size].spread}px rgba(${ringRgb}, 0.3)`,
                        `0 0 ${glowIntensity[size].spread}px rgba(${ringRgb}, 0.6), inset 0 0 ${glowIntensity[size].spread / 2}px rgba(${ringRgb}, 0.2)`,
                    ]
                }}
                transition={{
                    duration: auraConfig.isAdmin ? 1 : 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={cn("relative rounded-full z-10 overflow-hidden", sizeClasses[size])}
                style={{
                    border: `${ringSize[size]}px solid rgba(${ringRgb}, 0.9)`,
                }}
            >
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                    <img
                        src={src || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`}
                        alt={username}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Premium Shine Sweep */}
                {(size === 'lg' || size === 'xl') && (
                    <motion.div
                        animate={{ x: ["-150%", "250%"] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            repeatDelay: 4,
                            ease: "easeInOut"
                        }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 z-40 pointer-events-none"
                    />
                )}
            </motion.div>

        </div>
    );
}

