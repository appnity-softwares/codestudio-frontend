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
    MessageSquare
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { feedAPI, authAPI } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";

export function Dock() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const queryClient = useQueryClient();
    const isAdmin = user?.role === 'ADMIN';

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

    const navGroups = [
        {
            title: "MAIN",
            items: [
                { icon: Home, label: "Feed", path: "/feed", shortcut: "⌘1" },
                { icon: Trophy, label: "Arena", path: "/arena", shortcut: "⌘2" },
            ]
        },
        {
            title: "BUILD",
            items: [
                { icon: Dumbbell, label: "Practice", path: "/practice", shortcut: "⌘P" },
            ]
        },
        {
            title: "COMMUNITY",
            items: [
                { icon: Globe, label: "Discover", path: "/community", shortcut: "⌘3" },
                { icon: MessageSquare, label: "Feedback Wall", path: "/feedback", shortcut: "⌘F" },
            ]
        },
        {
            title: "SYSTEM",
            items: [
                // Settings moved to user menu
                ...(isAdmin ? [{ icon: ShieldCheck, label: "Admin Panel", path: "/admin" }] : [])
            ]
        }
    ];

    // Filter out empty groups
    const activeGroups = navGroups.filter(g => g.items.length > 0);

    return (
        <aside
            className={cn(
                "h-full z-40 flex flex-col border-r border-white/5 bg-[#08080a] transition-all duration-300 ease-in-out relative group/sidebar",
                isCollapsed ? "w-[70px]" : "w-[240px]"
            )}
        >
            {/* Logo Area */}
            <Link
                to="/feed"
                className={cn(
                    "flex items-center h-16 px-4 mb-2 hover:bg-white/[0.02] transition-colors",
                    isCollapsed ? "justify-center" : "justify-start gap-3"
                )}
            >
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                    <Logo className="w-8 h-8" showText={false} />
                </div>
                {!isCollapsed && (
                    <span className="font-bold tracking-tight text-foreground/90 font-headline animate-in fade-in slide-in-from-left-2 duration-300">
                        CodeStudio
                    </span>
                )}
            </Link>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-8 scrollbar-hide">
                <TooltipProvider delayDuration={0}>
                    {activeGroups.map((group, idx) => (
                        <div key={idx} className="space-y-1">
                            {!isCollapsed && (
                                <h3 className="px-4 mb-2 text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] font-headline select-none">
                                    {group.title}
                                </h3>
                            )}
                            <div className="space-y-0.5">
                                {group.items.map((item) => {
                                    const isActive = location.pathname.startsWith(item.path);

                                    const LinkContent = (
                                        <Link
                                            to={item.path}
                                            onMouseEnter={() => handlePrefetch(item.path)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative overflow-hidden",
                                                isCollapsed ? "justify-center px-0 w-10 h-10 mx-auto" : "w-full",
                                                isActive
                                                    ? "bg-primary/10 text-primary font-medium"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                            )}
                                        >
                                            {/* Active Left Border for Expanded Mode */}
                                            {isActive && !isCollapsed && (
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] bg-primary rounded-r-full shadow-[0_0_12px_rgba(124,58,237,0.5)]" />
                                            )}

                                            <item.icon className={cn(
                                                "shrink-0 transition-colors",
                                                isCollapsed ? "w-5 h-5" : "w-[18px] h-[18px]",
                                                isActive ? "text-primary" : "group-hover:text-foreground"
                                            )} />

                                            {!isCollapsed && (
                                                <span className="truncate text-sm">{item.label}</span>
                                            )}
                                        </Link>
                                    );

                                    if (isCollapsed) {
                                        return (
                                            <Tooltip key={item.path}>
                                                <TooltipTrigger asChild>
                                                    {LinkContent}
                                                </TooltipTrigger>
                                                <TooltipContent side="right" className="flex items-center gap-2 bg-popover text-popover-foreground text-xs font-medium border-border shadow-xl translate-x-1">
                                                    <span>{item.label}</span>
                                                </TooltipContent>
                                            </Tooltip>
                                        );
                                    }

                                    return <div key={item.path}>{LinkContent}</div>;
                                })}
                            </div>
                        </div>
                    ))}
                </TooltipProvider>
            </div>

            {/* Bottom: User Menu & Toggle */}
            <div className="p-3 mt-auto space-y-2">
                {/* User Menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className={cn(
                            "w-full flex items-center gap-3 hover:bg-muted/50 transition-all h-auto py-2",
                            isCollapsed ? "justify-center px-0" : "justify-start px-3"
                        )}>
                            <Avatar className="h-8 w-8 rounded-full border border-border/50 shrink-0">
                                <AvatarImage src={user?.image} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {user?.username?.[0]?.toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                            {!isCollapsed && (
                                <div className="flex flex-col items-start text-left overflow-hidden">
                                    <span className="text-sm font-medium truncate w-full text-foreground/90">
                                        {user?.name || user?.username}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate w-full">
                                        @{user?.username}
                                    </span>
                                </div>
                            )}
                            {!isCollapsed && <MoreHorizontal className="w-4 h-4 ml-auto text-muted-foreground/50" />}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-56 mb-2" sideOffset={10}>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => navigate('/profile/me')}
                            onMouseEnter={() => handlePrefetch('/profile/me')}
                        >
                            <UserIcon className="mr-2 h-4 w-4" /> Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                            <LogOut className="mr-2 h-4 w-4" /> Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "w-full flex items-center hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all h-8",
                        isCollapsed ? "justify-center" : "justify-center" // Center the chevron in both cases essentially, or make it a bar
                    )}
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>

                {!isCollapsed && (
                    <div className="pt-2 px-3 pb-2 text-[10px] text-muted-foreground/20 font-medium animate-in fade-in duration-500">
                        <div className="flex items-center justify-between pt-2">
                            <span>v1.2.0</span>
                            <a
                                href="https://appnity.co.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors flex items-center gap-1"
                            >
                                Appnity Softwares
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
