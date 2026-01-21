
import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Trophy, Flag, ShieldAlert, FileText, LogOut, Users, Code, Settings, Megaphone, Zap, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { removeToken } from "@/lib/api";

export default function AdminLayout() {

    const navItems = [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { to: "/admin/users", icon: Users, label: "Users" },
        { to: "/admin/practice-problems", icon: Code, label: "Practice Problems" },
        { to: "/admin/contests", icon: Trophy, label: "Contests" },
        { to: "/admin/submissions", icon: FileText, label: "Submissions" },
        { to: "/admin/flags", icon: Flag, label: "Flag Review" },
        { to: "/admin/system", icon: Settings, label: "System" },
        { to: "/admin/avatars", icon: ImageIcon, label: "Avatars" },
        { to: "/admin/changelog", icon: Megaphone, label: "Changelog" },
        { to: "/admin/audit-logs", icon: FileText, label: "Audit Logs" },
    ];

    const quickLinks = [
        { to: "/feed", icon: Zap, label: "Live Feed" },
        { to: "/practice", icon: Code, label: "Practice Arena" },
        { to: "/badges", icon: Trophy, label: "Badges System" },
    ];

    return (
        <div className="flex h-screen bg-canvas text-foreground font-sans selection:bg-primary/20">
            {/* Sidebar */}
            <aside className="w-64 bg-surface border-r border-white/5 flex flex-col shadow-2xl relative z-20">
                <div className="h-16 flex items-center px-6 border-b border-white/5 bg-black/20">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/30 mr-3 shadow-lg">
                        <ShieldAlert className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-base tracking-tight font-headline text-white/90">CodeStudio Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar pt-6">
                    <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-4 px-3">Management</div>
                    {navItems.map((item) => (
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
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="px-4 py-6 border-t border-white/5 bg-black/10">
                    <div className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.2em] mb-3 px-2">Exit Portal</div>
                    {quickLinks.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className="flex items-center px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 rounded-lg transition-all"
                        >
                            <item.icon className="mr-3 h-4 w-4 opacity-50" />
                            {item.label}
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
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative">
                {/* Decorative Background Grid */}
                <div className="absolute inset-0 bg-grid pointer-events-none opacity-20" />

                <div className="h-full overflow-y-auto custom-scrollbar relative z-10 px-8 py-10">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
