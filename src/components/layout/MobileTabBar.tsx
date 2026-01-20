import { useNavigate, useLocation } from "react-router-dom";
import { Home, Trophy, Plus, MessageSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";

interface TabItem {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    path: string;
    requiresAuth?: boolean;
}

const tabs: TabItem[] = [
    { icon: Home, label: "Feed", path: "/feed", requiresAuth: true },
    { icon: Trophy, label: "Arena", path: "/arena", requiresAuth: true },
    { icon: Plus, label: "Create", path: "/create", requiresAuth: true },
    { icon: MessageSquare, label: "Feedback", path: "/feedback", requiresAuth: false },
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

        // Handle profile tab specially - navigate to user's own profile
        if (tab.path === "/profile" && user?.username) {
            navigate(`/profile/${user.username}`);
            return;
        }

        navigate(tab.path);
    };

    const isActiveTab = (tabPath: string) => {
        if (tabPath === "/profile") {
            return location.pathname.startsWith("/profile");
        }
        return location.pathname.startsWith(tabPath);
    };

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
                                <Icon
                                    className={cn(
                                        "h-6 w-6 transition-all",
                                        isActive && "scale-110"
                                    )}
                                />
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
