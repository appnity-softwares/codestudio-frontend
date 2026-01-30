import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield, Eye, EyeOff, Users, Lock, Globe, Sparkles,
    MessageSquare, Search, Trophy, Code, MapPin, Calendar,
    Link2, BarChart3, Github, Heart, Zap, ChevronDown, ChevronUp,
    Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    VisibilityMode,
    PrivacySettings as PrivacySettingsType,
    DEFAULT_PUBLIC_PRIVACY,
    DEFAULT_PRIVATE_PRIVACY,
    DEFAULT_HYBRID_PRIVACY
} from "@/types";

interface PrivacySettingsProps {
    visibility: VisibilityMode;
    setVisibility: (v: VisibilityMode) => void;
    privacySettings: PrivacySettingsType;
    setPrivacySettings: (settings: PrivacySettingsType) => void;
}

const VISIBILITY_MODES = [
    {
        value: "PUBLIC" as VisibilityMode,
        label: "Public",
        icon: Globe,
        description: "Your profile is visible to everyone",
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        borderColor: "border-emerald-500/30",
        glowColor: "shadow-emerald-500/20"
    },
    {
        value: "HYBRID" as VisibilityMode,
        label: "Hybrid",
        icon: Sparkles,
        description: "Customize what information to share",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        borderColor: "border-purple-500/30",
        glowColor: "shadow-purple-500/20"
    },
    {
        value: "PRIVATE" as VisibilityMode,
        label: "Private",
        icon: Lock,
        description: "Only linked users can see your profile",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        borderColor: "border-red-500/30",
        glowColor: "shadow-red-500/20"
    }
];

const PRIVACY_SECTIONS = [
    {
        id: "profile",
        title: "Profile Information",
        description: "Control what profile details others can see",
        icon: Users,
        settings: [
            { key: "showBio", label: "Bio", description: "Your personal description", icon: Heart },
            { key: "showCity", label: "Location", description: "Your city or region", icon: MapPin },
            { key: "showJoinDate", label: "Join Date", description: "When you joined the platform", icon: Calendar },
            { key: "showSocialLinks", label: "Social Links", description: "GitHub, LinkedIn, Instagram links", icon: Link2 }
        ]
    },
    {
        id: "stats",
        title: "Stats & Activity",
        description: "Choose which stats to display publicly",
        icon: BarChart3,
        settings: [
            { key: "showStats", label: "Profile Stats", description: "Snippets, contests, XP", icon: Trophy },
            { key: "showBadges", label: "Badges", description: "Earned achievements", icon: Zap },
            { key: "showGithubStats", label: "GitHub Stats", description: "Contribution graph and repos", icon: Github },
            { key: "showSnippets", label: "Snippets", description: "Your code snippets", icon: Code }
        ]
    },
    {
        id: "social",
        title: "Social & Connections",
        description: "Manage your social visibility",
        icon: Users,
        settings: [
            { key: "showLinkers", label: "Linkers Count", description: "Show who follows you", icon: Users },
            { key: "showLinked", label: "Linked Count", description: "Show who you follow", icon: Link2 },
            { key: "showLanguages", label: "Languages", description: "Your coding languages", icon: Code },
            { key: "showInterests", label: "Interests", description: "Your tech interests", icon: Heart }
        ]
    },
    {
        id: "discovery",
        title: "Discovery & Messaging",
        description: "Control how people find and contact you",
        icon: Search,
        settings: [
            { key: "showActivityStatus", label: "Activity Status", description: "Show when you're online", icon: Eye },
            { key: "searchVisible", label: "Search Visibility", description: "Appear in developer search", icon: Search },
            { key: "showInLeaderboards", label: "Leaderboards", description: "Appear in public leaderboards", icon: Trophy }
        ]
    }
];

export function PrivacySettings({
    visibility,
    setVisibility,
    privacySettings,
    setPrivacySettings
}: PrivacySettingsProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(["profile"]);

    // Apply default settings when visibility mode changes
    const handleVisibilityChange = (newVisibility: VisibilityMode) => {
        setVisibility(newVisibility);

        // Apply default presets based on mode
        switch (newVisibility) {
            case "PUBLIC":
                setPrivacySettings(DEFAULT_PUBLIC_PRIVACY);
                break;
            case "PRIVATE":
                setPrivacySettings(DEFAULT_PRIVATE_PRIVACY);
                break;
            case "HYBRID":
                // Keep current settings or apply hybrid defaults
                setPrivacySettings(DEFAULT_HYBRID_PRIVACY);
                break;
        }
    };

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        );
    };

    const updateSetting = (key: string, value: boolean) => {
        setPrivacySettings({
            ...privacySettings,
            [key]: value
        });
    };

    // Count enabled settings per section
    const getEnabledCount = (sectionId: string) => {
        const section = PRIVACY_SECTIONS.find(s => s.id === sectionId);
        if (!section) return { enabled: 0, total: 0 };

        const enabled = section.settings.filter(
            setting => privacySettings[setting.key as keyof PrivacySettingsType]
        ).length;

        return { enabled, total: section.settings.length };
    };

    return (
        <TooltipProvider delayDuration={200}>
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Mode Selector */}
                <Card className="border-none bg-white/5 backdrop-blur-md overflow-hidden">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-base italic">
                            <Shield className="h-5 w-5 text-primary" />
                            Privacy Mode
                        </CardTitle>
                        <CardDescription className="text-white/30 uppercase text-[10px] tracking-widest font-black">
                            Choose your visibility level
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-6">
                        <div className="grid grid-cols-3 gap-3">
                            {VISIBILITY_MODES.map((mode) => {
                                const Icon = mode.icon;
                                const isSelected = visibility === mode.value;

                                return (
                                    <motion.button
                                        key={mode.value}
                                        onClick={() => handleVisibilityChange(mode.value)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "relative p-4 rounded-xl border-2 transition-all duration-300",
                                            "flex flex-col items-center gap-2 text-center",
                                            isSelected
                                                ? cn(mode.borderColor, mode.bgColor, "shadow-lg", mode.glowColor)
                                                : "border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30"
                                        )}
                                    >
                                        {isSelected && (
                                            <motion.div
                                                layoutId="privacy-mode-indicator"
                                                className={cn(
                                                    "absolute inset-0 rounded-xl",
                                                    mode.bgColor,
                                                    "opacity-30"
                                                )}
                                                initial={false}
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}

                                        <div className={cn(
                                            "relative z-10 p-3 rounded-xl",
                                            isSelected ? mode.bgColor : "bg-white/5"
                                        )}>
                                            <Icon className={cn(
                                                "h-5 w-5 transition-colors",
                                                isSelected ? mode.color : "text-white/50"
                                            )} />
                                        </div>

                                        <span className={cn(
                                            "relative z-10 text-[11px] font-black uppercase tracking-wider transition-colors",
                                            isSelected ? "text-white" : "text-white/50"
                                        )}>
                                            {mode.label}
                                        </span>

                                        {isSelected && (
                                            <motion.p
                                                initial={{ opacity: 0, y: 5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative z-10 text-[9px] text-white/40 px-2"
                                            >
                                                {mode.description}
                                            </motion.p>
                                        )}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {/* Mode Status Bar */}
                        <div className={cn(
                            "mt-4 p-3 rounded-xl border flex items-center gap-3",
                            visibility === "PUBLIC" && "bg-emerald-500/5 border-emerald-500/20",
                            visibility === "HYBRID" && "bg-purple-500/5 border-purple-500/20",
                            visibility === "PRIVATE" && "bg-red-500/5 border-red-500/20"
                        )}>
                            {visibility === "PUBLIC" && (
                                <>
                                    <Eye className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs text-white/60">
                                        Everyone can view your full profile. All information is visible.
                                    </span>
                                </>
                            )}
                            {visibility === "HYBRID" && (
                                <>
                                    <Sparkles className="h-4 w-4 text-purple-500" />
                                    <span className="text-xs text-white/60">
                                        Customize exactly what to show. Perfect for selective sharing.
                                    </span>
                                </>
                            )}
                            {visibility === "PRIVATE" && (
                                <>
                                    <EyeOff className="h-4 w-4 text-red-500" />
                                    <span className="text-xs text-white/60">
                                        Only linked users can see your profile. Maximum privacy.
                                    </span>
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Granular Settings - Only show for HYBRID mode */}
                <AnimatePresence>
                    {visibility === "HYBRID" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-2 px-1">
                                <Sparkles className="h-4 w-4 text-purple-500" />
                                <h3 className="text-sm font-bold text-white/80">Granular Privacy Controls</h3>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3.5 w-3.5 text-white/30" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="max-w-[200px]">
                                        <p className="text-xs">Fine-tune exactly what information is visible to non-linked users.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            {PRIVACY_SECTIONS.map((section) => {
                                const SectionIcon = section.icon;
                                const isExpanded = expandedSections.includes(section.id);
                                const { enabled, total } = getEnabledCount(section.id);

                                return (
                                    <Card
                                        key={section.id}
                                        className={cn(
                                            "border-none bg-white/5 backdrop-blur-md overflow-hidden transition-all",
                                            isExpanded && "ring-1 ring-purple-500/20"
                                        )}
                                    >
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-purple-500/10">
                                                    <SectionIcon className="h-4 w-4 text-purple-400" />
                                                </div>
                                                <div className="text-left">
                                                    <h4 className="text-sm font-bold text-white/90">{section.title}</h4>
                                                    <p className="text-[10px] text-white/40">{section.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge
                                                    variant="outline"
                                                    className={cn(
                                                        "text-[10px] border-white/10",
                                                        enabled === total && "border-emerald-500/30 text-emerald-500",
                                                        enabled === 0 && "border-red-500/30 text-red-500",
                                                        enabled > 0 && enabled < total && "border-purple-500/30 text-purple-500"
                                                    )}
                                                >
                                                    {enabled}/{total}
                                                </Badge>
                                                {isExpanded
                                                    ? <ChevronUp className="h-4 w-4 text-white/30" />
                                                    : <ChevronDown className="h-4 w-4 text-white/30" />
                                                }
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <div className="px-4 pb-4 space-y-2">
                                                        {section.settings.map((setting) => {
                                                            const SettingIcon = setting.icon;
                                                            const isEnabled = privacySettings[setting.key as keyof PrivacySettingsType] as boolean;

                                                            return (
                                                                <div
                                                                    key={setting.key}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-3 rounded-xl border transition-all",
                                                                        isEnabled
                                                                            ? "bg-emerald-500/5 border-emerald-500/20"
                                                                            : "bg-black/20 border-white/5"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3">
                                                                        <div className={cn(
                                                                            "p-1.5 rounded-lg transition-colors",
                                                                            isEnabled ? "bg-emerald-500/10" : "bg-white/5"
                                                                        )}>
                                                                            <SettingIcon className={cn(
                                                                                "h-3.5 w-3.5 transition-colors",
                                                                                isEnabled ? "text-emerald-400" : "text-white/30"
                                                                            )} />
                                                                        </div>
                                                                        <div>
                                                                            <Label className="text-xs font-bold text-white/80">
                                                                                {setting.label}
                                                                            </Label>
                                                                            <p className="text-[10px] text-white/30">{setting.description}</p>
                                                                        </div>
                                                                    </div>
                                                                    <Switch
                                                                        checked={isEnabled}
                                                                        onCheckedChange={(checked) => updateSetting(setting.key, checked)}
                                                                        className="data-[state=checked]:bg-emerald-500"
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </Card>
                                );
                            })}

                            {/* Message Settings - Special handling */}
                            <Card className="border-none bg-white/5 backdrop-blur-md p-4">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-blue-500/10">
                                        <MessageSquare className="h-4 w-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white/90">Who Can Message You</h4>
                                        <p className="text-[10px] text-white/40">Control who can send you direct messages</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { value: "everyone", label: "Everyone", icon: Globe },
                                        { value: "linked", label: "Linked Only", icon: Users },
                                        { value: "none", label: "Nobody", icon: Lock }
                                    ].map((option) => {
                                        const OptionIcon = option.icon;
                                        const isSelected = privacySettings.allowMessages === option.value;

                                        return (
                                            <button
                                                key={option.value}
                                                onClick={() => setPrivacySettings({
                                                    ...privacySettings,
                                                    allowMessages: option.value as "everyone" | "linked" | "none"
                                                })}
                                                className={cn(
                                                    "p-3 rounded-xl border transition-all flex flex-col items-center gap-2",
                                                    isSelected
                                                        ? "bg-blue-500/10 border-blue-500/30"
                                                        : "bg-black/20 border-white/10 hover:border-white/20"
                                                )}
                                            >
                                                <OptionIcon className={cn(
                                                    "h-4 w-4",
                                                    isSelected ? "text-blue-400" : "text-white/30"
                                                )} />
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-wider",
                                                    isSelected ? "text-blue-400" : "text-white/50"
                                                )}>
                                                    {option.label}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </Card>

                            {/* Quick Actions */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPrivacySettings(DEFAULT_PUBLIC_PRIVACY)}
                                    className="flex-1 h-9 text-[10px] font-bold uppercase tracking-wider border-white/10 hover:bg-emerald-500/10 hover:border-emerald-500/20 hover:text-emerald-400"
                                >
                                    <Eye className="h-3.5 w-3.5 mr-2" />
                                    Show All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPrivacySettings(DEFAULT_PRIVATE_PRIVACY)}
                                    className="flex-1 h-9 text-[10px] font-bold uppercase tracking-wider border-white/10 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400"
                                >
                                    <EyeOff className="h-3.5 w-3.5 mr-2" />
                                    Hide All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPrivacySettings(DEFAULT_HYBRID_PRIVACY)}
                                    className="flex-1 h-9 text-[10px] font-bold uppercase tracking-wider border-white/10 hover:bg-purple-500/10 hover:border-purple-500/20 hover:text-purple-400"
                                >
                                    <Sparkles className="h-3.5 w-3.5 mr-2" />
                                    Balanced
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </TooltipProvider>
    );
}
