import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home,
    Trophy,
    Globe,
    ChevronLeft,
    ChevronRight,
    Dumbbell,
    LogOut,
    Settings,
    User as UserIcon,
    MoreHorizontal,
    ShieldCheck,
    MessageSquare,
    BookOpen,
    Award,
    ShoppingBag,
    Check
} from "lucide-react";
import { claimQuestReward } from "@/store/slices/userSlice";
import { useBadgeCelebration } from "@/context/BadgeContext";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { feedAPI, authAPI, leaderboardAPI, systemAPI } from "@/lib/api";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Logo } from "@/components/ui/Logo";
import { AuraAvatar } from "@/components/AuraAvatar";

import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { RootState } from "@/store";

export function Dock() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const queryClient = useQueryClient();
    const isAdmin = user?.role === 'ADMIN';

    // Redux UI State
    const dispatch = useDispatch();
    const isCollapsed = useSelector((state: RootState) => state.ui.sidebarCollapsed);
    const userXP = useSelector((state: RootState) => state.user.xp);
    const userQuests = useSelector((state: RootState) => state.user.quests) || [];
    const setIsCollapsed = () => dispatch(toggleSidebar());
    const { celebrateXP } = useBadgeCelebration();

    const handleClaimQuest = (questId: string) => {
        dispatch(claimQuestReward(questId));
        celebrateXP(20); // Bonus burst visual
    };

    // System Config
    const { data: systemData } = useQuery({
        queryKey: ['system-status'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5, // 5 mins
    });
    const settings = systemData?.settings || {};
    const isFeatureEnabled = (key: string, defaultVal = true) => {
        if (!settings[key]) return defaultVal;
        return settings[key] === "true";
    };

    const handlePrefetch = (path: string) => {
        if (path === '/feed') {
            queryClient.prefetchQuery({
                queryKey: ['feed', 'trending'],
                queryFn: () => feedAPI.get('trending'),
                staleTime: 60000,
            });
        }
        if (path === '/profile/me') {
            queryClient.prefetchQuery({
                queryKey: ['user', 'me'],
                queryFn: () => authAPI.me(),
                staleTime: 60000,
            });
        }
    };

    const { data: lbData } = useQuery({
        queryKey: ['leaderboard', 'global'],
        queryFn: () => leaderboardAPI.getGlobal(),
        staleTime: 60000,
    });
    const topUsers = lbData?.leaderboard?.slice(0, 3) || [];

    const navItems = [
        { icon: Home, label: "Feed", path: "/feed" },
        { icon: Trophy, label: "Arena", path: "/arena" },
        ...(isFeatureEnabled('feature_sidebar_practice') ? [{ icon: Dumbbell, label: "Practice", path: "/practice" }] : []),
        ...(isFeatureEnabled('feature_sidebar_roadmaps') ? [{ icon: BookOpen, label: "Roadmaps", path: "/roadmaps" }] : []),
        ...(isFeatureEnabled('feature_sidebar_community') ? [{ icon: Globe, label: "Discover", path: "/community" }] : []),
        ...(isFeatureEnabled('feature_sidebar_trophy_room') ? [{ icon: Award, label: "Trophy Room", path: "/trophy-room" }] : []),
        ...(isFeatureEnabled('feature_sidebar_xp_store') ? [{ icon: ShoppingBag, label: "XP Store", path: "/xp-store" }] : []),
        ...(isFeatureEnabled('feature_sidebar_feedback') ? [{ icon: MessageSquare, label: "Feedback Wall", path: "/feedback" }] : []),
        ...(isAdmin ? [{ icon: ShieldCheck, label: "Admin Panel", path: "/admin" }] : [])
    ];

    return (
        <aside
            className={cn(
                "h-full z-40 flex flex-col border-r border-border bg-surface/95 backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative group/sidebar",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Logo Area */}
            <Link
                to="/feed"
                className={cn(
                    "flex items-center h-20 px-6 mb-2 hover:bg-muted/50 transition-colors relative transition-all duration-300",
                    isCollapsed ? "justify-center" : "justify-start gap-4"
                )}
            >
                <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-primary/10 rounded-xl border border-primary/10 group-hover:border-primary/30 transition-all duration-300">
                    <Logo className="w-6 h-6" showText={false} />
                </div>
                {!isCollapsed && (
                    <span className="font-black text-lg tracking-tight text-foreground font-headline animate-in fade-in slide-in-from-left-4 duration-500">
                        Code<span className="text-primary italic">Studio</span>
                    </span>
                )}
            </Link>

            {/* Navigation Items - No Categories */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-hide">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);

                        const LinkContent = (
                            <Link
                                key={item.path}
                                to={item.path}
                                onMouseEnter={() => handlePrefetch(item.path)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                    isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "w-full",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm border border-primary/10"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent"
                                )}
                            >
                                {/* Active Accent Glow */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                                )}

                                <item.icon className={cn(
                                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                                    isCollapsed ? "w-5 h-5" : "w-[20px] h-[20px]",
                                    isActive ? "text-primary drop-shadow-sm" : "group-hover:text-foreground"
                                )} />

                                {!isCollapsed && (
                                    <span className={cn(
                                        "truncate text-[13px] font-bold tracking-tight transition-all",
                                        isActive ? "text-primary font-black" : "text-inherit"
                                    )}>
                                        {item.label}
                                    </span>
                                )}

                                {isActive && !isCollapsed && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(56,189,248,0.8)] animate-pulse" />
                                )}

                                {!isActive && !isCollapsed && (
                                    <>
                                        {item.label === "Arena" && (
                                            <span className="ml-auto bg-primary/20 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-md border border-primary/20 animate-pulse">
                                                NEW
                                            </span>
                                        )}
                                        {(() => {
                                            if (item.label === "Arena") return null; // Handled above for legacy support
                                            try {
                                                const badgeConfig = JSON.parse(settings['dock_badges'] || '{}');
                                                const badgeText = badgeConfig[item.path];
                                                if (badgeText) {
                                                    return (
                                                        <span className="ml-auto bg-amber-500/20 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-md border border-amber-500/20 animate-pulse uppercase">
                                                            {badgeText}
                                                        </span>
                                                    );
                                                }
                                            } catch (e) {
                                                // ignore parsing error
                                            }
                                            return null;
                                        })()}
                                    </>
                                )}
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {LinkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="flex items-center gap-2 bg-popover text-popover-foreground text-xs font-bold border-border shadow-xl px-3 py-2 rounded-lg">
                                        <span>{item.label}</span>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return <div key={item.path}>{LinkContent}</div>;
                    })}

                    {/* Daily Quests Popover */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative w-full",
                                    isCollapsed ? "justify-center px-0 w-12 h-12 mx-auto" : "justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                <Award className={cn(
                                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                                    isCollapsed ? "w-5 h-5" : "w-[20px] h-[20px]",
                                    "text-amber-500"
                                )} />
                                {!isCollapsed && <span className="text-[13px] font-bold tracking-tight">Daily Quests</span>}

                                {/* Notification Dot if any quest is ready to claim */}
                                {userQuests.some(q => q.progress >= q.total && !q.claimed) && (
                                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent side="right" align="start" className="w-80 p-0 border-border bg-card/95 backdrop-blur-xl ml-4">
                            <div className="p-4 border-b border-border">
                                <h4 className="font-bold flex items-center gap-2">
                                    <Award className="h-4 w-4 text-amber-500" />
                                    Daily Quests
                                </h4>
                                <p className="text-xs text-muted-foreground">Complete tasks to earn XP.</p>
                            </div>
                            <div className="p-4 space-y-4">
                                {userQuests.map((quest) => (
                                    <div key={quest.id} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className={cn(quest.claimed ? "text-muted-foreground line-through" : "text-foreground")}>
                                                {quest.label}
                                            </span>
                                            {quest.claimed ? (
                                                <span className="text-emerald-500 flex items-center gap-1"><Check className="h-3 w-3" /> Done</span>
                                            ) : quest.progress >= quest.total ? (
                                                <Button
                                                    size="sm"
                                                    className="h-6 text-[10px] px-2 bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20"
                                                    onClick={() => handleClaimQuest(quest.id)}
                                                >
                                                    Claim
                                                </Button>
                                            ) : (
                                                <span className="text-amber-500">+{quest.reward} XP</span>
                                            )}
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn("h-full transition-all duration-500", quest.claimed ? "bg-emerald-500" : "bg-amber-500")}
                                                style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                </TooltipProvider>

                {/* Global Leaderboard - Mini Widget */}
                {!isCollapsed && topUsers.length > 0 && (
                    <div className="mt-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                                <Trophy className="h-3 w-3 text-primary" />
                                Top Creators
                            </span>
                            <div className="h-1 flex-1 bg-muted mx-3 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: '40%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                />
                            </div>
                        </div>
                        <div className="space-y-3">
                            {topUsers.map((user, idx) => (
                                <Link
                                    to={`/u/${user.username}`}
                                    key={user.id}
                                    className="flex items-center gap-3 group/lb hover:bg-muted/50 p-1.5 rounded-xl transition-all"
                                >
                                    <div className="relative shrink-0">
                                        <AuraAvatar
                                            src={user.image}
                                            username={user.username}
                                            xp={user.xp || 0}
                                            size="sm"
                                        />
                                        <div className={cn(
                                            "absolute -top-1.5 -left-1.5 w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black border border-border shadow-sm",
                                            idx === 0 ? "bg-amber-500 text-amber-950" :
                                                idx === 1 ? "bg-slate-400 text-slate-950" : "bg-amber-700 text-amber-100"
                                        )}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-black text-foreground truncate group-hover/lb:text-primary transition-colors">
                                            {user.username}
                                        </span>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            {user.xp} <span className="text-[7px]">XP</span>
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom: User Menu & Toggle */}
            <div className="p-4 mt-auto space-y-4 bg-muted/20 border-t border-border">
                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "w-full flex items-center gap-3 hover:bg-muted/50 transition-all h-auto py-3 group/user px-2 rounded-xl",
                            isCollapsed ? "justify-center" : "justify-start px-3"
                        )}>
                            <div className="relative shrink-0">
                                <AuraAvatar
                                    src={user?.image}
                                    username={user?.username || "user"}
                                    xp={userXP || user?.xp || 0}
                                    size="sm"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-surface rounded-full shadow-sm z-20" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col items-start text-left overflow-hidden">
                                    <span className="text-sm font-black truncate w-full text-foreground tracking-tight">
                                        {user?.name || user?.username}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground truncate w-full uppercase tracking-wider">
                                        @{user?.username}
                                    </span>
                                </div>
                            )}
                            {!isCollapsed && <MoreHorizontal className="w-4 h-4 ml-auto text-muted-foreground group-hover/user:text-foreground transition-colors" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-64 mb-3" sideOffset={12}>
                        <DropdownMenuLabel className="font-normal px-3 py-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center justify-between">
                                    Active Account
                                    {userXP !== undefined && (
                                        <span className="text-amber-500 flex items-center gap-1">
                                            <Trophy className="h-3 w-3" />
                                            {userXP} XP
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm font-bold text-foreground mt-1 leading-none">{user?.name}</p>
                                <p className="text-[10px] leading-none text-muted-foreground mt-1">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <div className="p-1 space-y-1">
                            <DropdownMenuItem
                                onClick={() => navigate('/profile/me')}
                                onMouseEnter={() => handlePrefetch('/profile/me')}
                                className="rounded-lg py-2.5 px-3 cursor-pointer"
                            >
                                <UserIcon className="mr-3 h-4 w-4 text-primary" /> <span className="text-[13px] font-bold">Your Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg py-2.5 px-3 cursor-pointer">
                                <Settings className="mr-3 h-4 w-4 text-purple-400" /> <span className="text-[13px] font-bold">Preferences</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut} className="rounded-lg py-2.5 px-3 text-red-500 focus:text-red-500 cursor-pointer">
                                <LogOut className="mr-3 h-4 w-4" /> <span className="text-[13px] font-bold">Sign Out</span>
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex flex-col gap-2">


                    {/* Toggle Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={setIsCollapsed}
                        className={cn(
                            "w-full flex items-center bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all h-9 rounded-xl border border-border",
                            isCollapsed ? "justify-center" : "justify-center"
                        )}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>

                    {!isCollapsed && (
                        <div className="pt-2 px-3 pb-2 text-[9px] text-muted-foreground/40 font-black animate-in fade-in duration-700">
                            <div className="flex items-center justify-between pt-2">
                                <span className="tracking-[0.2em] uppercase">R3 Build</span>
                                <a
                                    href="https://appnity.co.in"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary transition-colors flex items-center gap-1 opacity-50 hover:opacity-100"
                                >
                                    APPNITY
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}
