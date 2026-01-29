
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy, Flag, ShieldAlert, FileText, LogOut, Users, Code, Settings, Megaphone, Zap, Image as ImageIcon, BookOpen, Menu, Sparkles, MessageSquare } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { removeToken, systemAPI } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

import { Logo } from "@/components/ui/Logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export default function AdminLayout() {
    const { data: statusData } = useQuery({
        queryKey: ["public-system-status"],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 5 * 60 * 1000,
    });

    const settings = statusData?.settings || {};
    const badgeConfigRaw = settings["sidebar_badges"] || "[]";
    let badgeConfig: string[] = [];
    try {
        badgeConfig = JSON.parse(badgeConfigRaw);
    } catch (e) {
        badgeConfig = [];
    }

    const navItems = [
        // Overview
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true, category: "Core" },
        { to: "/admin/audit-logs", icon: FileText, label: "Audit Logs", category: "Core" },
        { to: "/admin/reports", icon: Flag, label: "Incident Reports", category: "Core" },

        // Users
        { to: "/admin/users", icon: Users, label: "Users", category: "Users" },
        { to: "/admin/roles", icon: ShieldAlert, label: "Roles", category: "Users" },
        { to: "/admin/chat", icon: MessageSquare, label: "System Chat", category: "Users" },
        { to: "/admin/appeals", icon: ShieldAlert, label: "Appeals", category: "Users" },

        // Content
        { to: "/admin/snippets", icon: Code, label: "Snippets", category: "Economy" },
        { to: "/admin/roadmaps", icon: BookOpen, label: "Roadmaps", category: "Economy" },
        { to: "/admin/practice-problems", icon: Code, label: "Practice", category: "Economy" },
        { to: "/admin/contests", icon: Trophy, label: "Contests", category: "Economy" },
        { to: "/admin/submissions", icon: FileText, label: "Submissions", category: "Economy" },

        // Customization
        { to: "/admin/auras", icon: Sparkles, label: "Aura Studio", category: "Styling" },
        { to: "/admin/avatars", icon: ImageIcon, label: "Avatar Vault", category: "Styling" },
        { to: "/admin/badge-config", icon: Trophy, label: "Badge Logic", category: "Styling" },

        // Infrastructure
        { to: "/admin/system", icon: Settings, label: "Settings", category: "System" },
        { to: "/admin/changelog", icon: Megaphone, label: "Changelog", category: "System" },
    ];

    const quickLinks = [
        { to: "/feed", icon: Zap, label: "Live Feed" },
        { to: "/practice", icon: Code, label: "Arena" },
        { to: "/badges", icon: Trophy, label: "Badges" },
    ];

    const SidebarContent = () => (
        <>
            <div className="h-16 flex items-center px-6 border-b border-white/5 bg-black/20 gap-3">
                <Logo className="scale-90 origin-left" />
            </div>

            <nav className="flex-1 p-4 space-y-8 overflow-y-auto custom-scrollbar pt-6 pb-12">
                {["Core", "Users", "Economy", "Styling", "System"].map((category) => (
                    <div key={category} className="space-y-1.5">
                        <div className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] mb-3 px-3">
                            {category}
                        </div>
                        {navItems.filter(item => item.category === category).map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.exact}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-300 group ${isActive
                                        ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                    }`
                                }
                            >
                                <item.icon className={cn(
                                    "mr-3 h-[18px] w-[18px] transition-transform duration-300 group-hover:scale-110",
                                    "opacity-80"
                                )} />
                                <span className="flex-1">{item.label}</span>
                                {badgeConfig.includes(item.to) && (
                                    <Badge className="bg-white/20 text-white text-[9px] px-1.5 py-0 h-4 border-none font-bold uppercase tracking-tighter animate-pulse">
                                        New
                                    </Badge>
                                )}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="px-4 py-6 border-t border-white/5 bg-black/10">
                <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-3 px-2">Exit Portal</div>
                {quickLinks.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all group"
                    >
                        <item.icon className="mr-3 h-4 w-4 opacity-50" />
                        <span className="flex-1">{item.label}</span>
                        {badgeConfig.includes(item.to) && (
                            <Badge className="bg-primary text-primary-foreground text-[8px] px-1 py-0 h-3.5 border-none font-black uppercase tracking-tighter animate-bounce group-hover:animate-none">
                                New
                            </Badge>
                        )}
                    </NavLink>
                ))}

                <button
                    onClick={() => {
                        removeToken();
                        window.location.href = '/auth/signin';
                    }}
                    className="w-full flex items-center px-3 py-2.5 mt-4 text-sm font-medium text-red-500/80 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all transition-colors group"
                >
                    <LogOut className="mr-3 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                    System Logout
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-canvas text-foreground font-sans selection:bg-primary/20">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 bg-surface border-r border-white/5 flex-col shadow-2xl relative z-20">
                <SidebarContent />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between px-4 h-16 border-b border-border bg-surface z-30">
                    <Logo className="scale-75 origin-left" />
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r-border bg-surface w-64">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Decorative Background Grid */}
                <div className="absolute inset-0 bg-grid pointer-events-none opacity-20" />

                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-4 lg:p-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
