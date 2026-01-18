import { Link, useLocation } from "react-router-dom"
import { Home, Sparkles, Compass, Users, Store, Code, Bookmark, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { navConfig } from "@/lib/constants"

const iconMap: Record<string, React.ElementType> = {
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

    return (
        <aside className="hidden md:flex w-64 flex-col fixed left-0 top-16 bottom-0 border-r bg-card">
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navConfig.map((item) => {
                    const Icon = iconMap[item.icon]
                    const isActive = location.pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            )}
                        >
                            {Icon && <Icon className="h-5 w-5" />}
                            {item.title}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
