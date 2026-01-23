import { useState, useEffect } from "react";
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
    ShoppingBag
} from "lucide-react";
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

import { Logo } from "@/components/ui/Logo";
import { AuraAvatar } from "@/components/AuraAvatar";
import { useQuery } from "@tanstack/react-query";

export function Dock() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const queryClient = useQueryClient();
    const isAdmin = user?.role === 'ADMIN';

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

    // State for collapse, initialized from localStorage
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar-collapsed");
        return saved ? JSON.parse(saved) : false;
    });

    useEffect(() => {
        localStorage.setItem("sidebar-collapsed", JSON.stringify(isCollapsed));
    }, [isCollapsed]);

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
                "h-full z-40 flex flex-col border-r border-white/5 bg-[#08080a] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] relative group/sidebar",
                isCollapsed ? "w-[80px]" : "w-[260px]"
            )}
        >
            {/* Logo Area */}
            <Link
                to="/feed"
                className={cn(
                    "flex items-center h-20 px-6 mb-2 hover:bg-white/[0.02] transition-colors relative transition-all duration-300",
                    isCollapsed ? "justify-center" : "justify-start gap-4"
                )}
            >
                <div className="w-10 h-10 flex items-center justify-center shrink-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/10 group-hover:border-primary/30 transition-all duration-300">
                    <Logo className="w-6 h-6" showText={false} />
                </div>
                {!isCollapsed && (
                    <span className="font-black text-lg tracking-tight text-white/90 font-headline animate-in fade-in slide-in-from-left-4 duration-500">
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
                                        ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(56,189,248,0.05)] border border-primary/10"
                                        : "text-white/40 hover:text-white hover:bg-white/[0.03] border border-transparent"
                                )}
                            >
                                {/* Active Accent Glow */}
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                                )}

                                <item.icon className={cn(
                                    "shrink-0 transition-all duration-300 group-hover:scale-110",
                                    isCollapsed ? "w-5 h-5" : "w-[20px] h-[20px]",
                                    isActive ? "text-primary drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" : "group-hover:text-white"
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

                                {!isActive && !isCollapsed && item.label === "Arena" && (
                                    <span className="ml-auto bg-primary/20 text-primary text-[8px] font-black px-1.5 py-0.5 rounded-md border border-primary/20 animate-pulse">
                                        NEW
                                    </span>
                                )}
                            </Link>
                        );

                        if (isCollapsed) {
                            return (
                                <Tooltip key={item.path}>
                                    <TooltipTrigger asChild>
                                        {LinkContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="flex items-center gap-2 bg-[#0c0c0e] text-white text-xs font-bold border-white/10 shadow-2xl px-3 py-2 rounded-lg">
                                        <span>{item.label}</span>
                                    </TooltipContent>
                                </Tooltip>
                            );
                        }

                        return <div key={item.path}>{LinkContent}</div>;
                    })}
                </TooltipProvider>

                {/* Global Leaderboard - Mini Widget */}
                {!isCollapsed && topUsers.length > 0 && (
                    <div className="mt-8 px-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Trophy className="h-3 w-3 text-primary" />
                                Top Creators
                            </span>
                            <div className="h-1 flex-1 bg-white/5 mx-3 rounded-full overflow-hidden">
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
                                    className="flex items-center gap-3 group/lb hover:bg-white/[0.02] p-1.5 rounded-xl transition-all"
                                >
                                    <div className="relative shrink-0">
                                        <AuraAvatar
                                            src={user.image}
                                            username={user.username}
                                            xp={user.xp || 0}
                                            size="sm"
                                        />
                                        <div className={cn(
                                            "absolute -top-1.5 -left-1.5 w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black border border-white/10 shadow-lg",
                                            idx === 0 ? "bg-amber-500 text-amber-950" :
                                                idx === 1 ? "bg-slate-400 text-slate-950" : "bg-amber-700 text-amber-100"
                                        )}>
                                            {idx + 1}
                                        </div>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[11px] font-black text-white/80 truncate group-hover/lb:text-primary transition-colors">
                                            {user.username}
                                        </span>
                                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">
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
            <div className="p-4 mt-auto space-y-4 bg-white/[0.01] border-t border-white/5">
                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "w-full flex items-center gap-3 hover:bg-white/[0.03] transition-all h-auto py-3 group/user px-2 rounded-xl",
                            isCollapsed ? "justify-center" : "justify-start px-3"
                        )}>
                            <div className="relative shrink-0">
                                <AuraAvatar
                                    src={user?.image}
                                    username={user?.username || "user"}
                                    xp={user?.xp || 0}
                                    size="sm"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#08080a] rounded-full shadow-lg shadow-emerald-500/20 z-20" />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col items-start text-left overflow-hidden">
                                    <span className="text-sm font-black truncate w-full text-white/90 tracking-tight">
                                        {user?.name || user?.username}
                                    </span>
                                    <span className="text-[10px] font-bold text-white/30 truncate w-full uppercase tracking-wider">
                                        @{user?.username}
                                    </span>
                                </div>
                            )}
                            {!isCollapsed && <MoreHorizontal className="w-4 h-4 ml-auto text-white/20 group-hover/user:text-white/50 transition-colors" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-64 mb-3 bg-[#0c0c0e] border-white/10 shadow-2xl rounded-2xl p-2" sideOffset={12}>
                        <DropdownMenuLabel className="font-normal px-3 py-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-xs font-black text-primary uppercase tracking-widest flex items-center justify-between">
                                    Active Account
                                    {user?.xp !== undefined && (
                                        <span className="text-amber-500 flex items-center gap-1">
                                            <Trophy className="h-3 w-3" />
                                            {user.xp} XP
                                        </span>
                                    )}
                                </p>
                                <p className="text-sm font-bold text-white mt-1 leading-none">{user?.name}</p>
                                <p className="text-[10px] leading-none text-white/40 mt-1">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/5 mx-2" />
                        <div className="p-1 space-y-1">
                            <DropdownMenuItem
                                onClick={() => navigate('/profile/me')}
                                onMouseEnter={() => handlePrefetch('/profile/me')}
                                className="rounded-lg py-2.5 px-3 focus:bg-white/10 focus:text-white cursor-pointer transition-colors"
                            >
                                <UserIcon className="mr-3 h-4 w-4 text-primary" /> <span className="text-[13px] font-bold">Your Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg py-2.5 px-3 focus:bg-white/10 focus:text-white cursor-pointer transition-colors">
                                <Settings className="mr-3 h-4 w-4 text-purple-400" /> <span className="text-[13px] font-bold">Preferences</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/5" />
                            <DropdownMenuItem onClick={signOut} className="rounded-lg py-2.5 px-3 text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer transition-colors">
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
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className={cn(
                            "w-full flex items-center bg-white/[0.02] hover:bg-white/[0.05] text-white/20 hover:text-white/60 transition-all h-9 rounded-xl border border-white/5",
                            isCollapsed ? "justify-center" : "justify-center"
                        )}
                    >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </Button>

                    {!isCollapsed && (
                        <div className="pt-2 px-3 pb-2 text-[9px] text-white/10 font-black animate-in fade-in duration-700">
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
