import { Link, useLocation } from "react-router-dom";
import {
    Home,
    User,
    Settings,
    Zap,
    ShieldCheck,
    Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";

export function Dock() {
    const location = useLocation();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN';

    const navItems = [
        { icon: Home, label: "Stream", path: "/feed", shortcut: "⌘1" },
        { icon: Trophy, label: "Arena", path: "/arena", shortcut: "⌘2" },
    ];

    const bottomItems = [
        ...(isAdmin ? [{ icon: ShieldCheck, label: "Admin", path: "/admin" }] : []),
        { icon: User, label: "Profile", path: "/profile/me" },
        { icon: Settings, label: "Settings", path: "/settings" },
    ];

    return (
        <aside className="h-full w-16 bg-canvas border-r border-border flex flex-col items-center py-4 z-40">
            {/* Logo Mark */}
            <div className="mb-8">
                <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                    <Zap className="w-4 h-4 fill-current" />
                </div>
            </div>

            {/* Main Nav */}
            <nav className="flex-1 flex flex-col gap-4 w-full px-2">
                <TooltipProvider delayDuration={0}>
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <Tooltip key={item.path}>
                                <TooltipTrigger asChild>
                                    <Link
                                        to={item.path}
                                        className={cn(
                                            "w-10 h-10 rounded-md flex items-center justify-center transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                                        )}
                                    >
                                        {isActive && (
                                            <div className="absolute left-0 w-0.5 h-6 rounded-r-full bg-primary" />
                                        )}
                                        <item.icon className="w-5 h-5" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" className="flex items-center gap-2 bg-surface text-xs font-mono border-border">
                                    <span>{item.label}</span>
                                    {item.shortcut && (
                                        <span className="text-muted-foreground bg-white/5 px-1 rounded-[2px]">{item.shortcut}</span>
                                    )}
                                </TooltipContent>
                            </Tooltip>
                        );
                    })}
                </TooltipProvider>
            </nav>

            {/* Bottom Actions */}
            <div className="flex flex-col gap-4 w-full px-2 mt-auto">
                {bottomItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center transition-colors text-muted-foreground hover:text-foreground hover:bg-surface-hover",
                            location.pathname.startsWith(item.path) && "text-primary bg-primary/10"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                    </Link>
                ))}
            </div>
        </aside>
    );
}
