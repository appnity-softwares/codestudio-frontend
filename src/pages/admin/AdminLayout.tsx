

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Trophy, Flag, ShieldAlert, FileText, LogOut, Users, Code, Settings, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeToken } from "@/lib/api";

export default function AdminLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        removeToken();
        navigate("/login");
    };

    const navItems = [
        { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
        { to: "/admin/users", icon: Users, label: "Users" },
        { to: "/admin/contests", icon: Trophy, label: "Contests" },
        { to: "/admin/submissions", icon: Code, label: "Submissions" },
        { to: "/admin/flags", icon: Flag, label: "Flag Review" },
        { to: "/admin/system", icon: Settings, label: "System" },
        { to: "/admin/changelog", icon: Megaphone, label: "Changelog" },
        { to: "/admin/audit-logs", icon: FileText, label: "Audit Logs" },
    ];

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-800">
                    <ShieldAlert className="h-6 w-6 text-indigo-600 mr-2" />
                    <span className="font-bold text-lg tracking-tight">CodeStudio Admin</span>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto hidden-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.exact}
                            className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
                                }`
                            }
                        >
                            <item.icon className="mr-3 h-5 w-5 flex-shrink-0 opacity-70" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10" onClick={handleLogout}>
                        <LogOut className="mr-3 h-5 w-5 opacity-70" />
                        Logout
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
