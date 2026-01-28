import { Link, useLocation } from "react-router-dom"
import { Home, Sparkles, Compass, Users, Store, Code, Bookmark, Bot } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { navConfig } from "@/lib/constants"
import { systemAPI } from "@/lib/api"
import { Badge } from "@/components/ui/badge"

const iconMap: Record<string, any> = {
    Home,
    Sparkles,
    Compass,
    Users,
    Store,
    Code,
    Bookmark,
    Bot,
}

export function Sidebar() {
    const location = useLocation()

    const { data: statusData } = useQuery({
        queryKey: ["public-system-status"],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const settings = statusData?.settings || {};
    const badgeConfigRaw = settings["sidebar_badges"] || "[]";
    let badgeConfig: string[] = [];
    try {
        badgeConfig = JSON.parse(badgeConfigRaw);
    } catch (e) {
        badgeConfig = [];
    }

    return (
        <aside className="hidden md:flex w-64 flex-col fixed left-0 top-16 bottom-0 border-r bg-card">
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navConfig.map((item) => {
                    const Icon = iconMap[item.icon]
                    const isActive = location.pathname === item.href
                    const hasBadge = (badgeConfig as string[]).includes(item.href)

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                            <span className="flex-1">{item.title}</span>
                            {hasBadge && (
                                <Badge
                                    className="bg-primary text-[10px] px-1.5 py-0 h-4 font-black uppercase tracking-tighter shadow-lg shadow-primary/20 animate-pulse group-hover:animate-none"
                                >
                                    New
                                </Badge>
                            )}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
