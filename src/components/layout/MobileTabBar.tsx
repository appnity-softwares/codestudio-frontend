import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, Globe, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { AuraAvatar } from "@/components/AuraAvatar";

interface TabItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    requiresAuth?: boolean;
}

const tabs: TabItem[] = [
    { icon: Home, label: "Feed", path: "/feed", requiresAuth: true },
    { icon: Trophy, label: "Arena", path: "/arena", requiresAuth: true },
    { icon: MessageSquare, label: "Messages", path: "/messages", requiresAuth: true },
    { icon: Globe, label: "Community", path: "/community", requiresAuth: false },
    { icon: User, label: "Profile", path: "/profile", requiresAuth: true },
];

export function MobileTabBar() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isAuthenticated } = useAuth();

    const handleTabClick = (tab: TabItem) => {
        if (tab.requiresAuth && !isAuthenticated) {
            navigate("/auth/signin");
            return;
        }

        // Handle profile tab specially - navigate to user's own profile via /u/username
        if (tab.path === "/profile" && user?.username) {
            navigate(`/u/${user.username}`);
            return;
        }

        navigate(tab.path);
    };

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "/profile") {
            return location.pathname.startsWith("/u/");
        }
        return location.pathname.startsWith(tabPath);
    };

    if (location.pathname === "/feedback") {
        return null;
    }

    return (
        <nav
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50",
                "bg-[#0a0a0c]/95 backdrop-blur-xl",
                "border-t border-white/[0.06]",
                "pb-safe" // Safe area for iOS/Android
            )}
        >
            <div className="flex items-center justify-around h-[72px] max-w-lg mx-auto px-2">
                {tabs.map((tab) => {
                    const isActive = isActiveTab(tab.path);
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.path}
                            onClick={() => handleTabClick(tab)}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 flex-1 py-2 touch-target",
                                "transition-all duration-200 active:scale-95",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className="relative">
                                {tab.label === "Profile" && isAuthenticated && user ? (
                                    <AuraAvatar
                                        src={user.image}
                                        username={user.username || "user"}
                                        xp={user.xp || 0}
                                        size="sm"
                                        hideBadge
                                        className={cn(
                                            "transition-all",
                                            isActive && "ring-2 ring-primary ring-offset-2 ring-offset-[#0a0a0c]"
                                        )}
                                    />
                                ) : (
                                    <Icon
                                        className={cn(
                                            "h-6 w-6 transition-all",
                                            isActive && "scale-110"
                                        )}
                                    />
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                                    />
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-[10px] font-medium",
                                    isActive && "text-primary font-semibold"
                                )}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
