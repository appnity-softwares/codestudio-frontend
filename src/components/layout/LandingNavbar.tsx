import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    User,
    LogOut,
    Settings,
    ShieldCheck,
    ChevronDown
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AuraAvatar } from "@/components/AuraAvatar";
import { Logo } from "@/components/ui/Logo";

export function LandingNavbar() {
    const { isAuthenticated, user, signOut } = useAuth();
    const navigate = useNavigate();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
            <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Logo />
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-white/40">
                    <a href="/#features" className="hover:text-white transition-colors">Features</a>
                    <a href="/#rankings" className="hover:text-white transition-colors">Rankings</a>
                    <a href="/practice" className="hover:text-white transition-colors">Arena</a>
                    <Link to="/changelog" className="hover:text-white transition-colors">Changelog</Link>
                </div>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <Link to="/feed">
                                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] px-6 h-9 rounded-lg shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    Enter Studio
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2 group outline-none">
                                        <AuraAvatar
                                            src={user?.image}
                                            username={user?.username || ""}
                                            xp={user?.xp || 0}
                                            size="sm"
                                            className="ring-2 ring-white/5 group-hover:ring-primary/40 transition-all"
                                        />
                                        <ChevronDown className="h-4 w-4 text-white/40 group-hover:text-white transition-colors" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 mt-2 bg-[#0c0c0e] border-white/10 text-white shadow-2xl">
                                    <DropdownMenuLabel className="font-bold px-3 py-3 border-b border-white/5">
                                        <div className="flex flex-col space-y-0.5">
                                            <span className="text-xs font-black text-primary uppercase tracking-widest">Signed In As</span>
                                            <span className="text-sm font-bold truncate">@{user?.username}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <div className="p-1">
                                        <DropdownMenuItem onClick={() => navigate(`/u/${user?.username}`)} className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-white/5">
                                            <User className="mr-2 h-4 w-4 opacity-70" /> <span className="text-xs font-bold">Profile Portfolio</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-white/5">
                                            <Settings className="mr-2 h-4 w-4 opacity-70" /> <span className="text-xs font-bold">Settings</span>
                                        </DropdownMenuItem>
                                        {isAdmin && (
                                            <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-white/5 text-amber-400">
                                                <ShieldCheck className="mr-2 h-4 w-4" /> <span className="text-xs font-bold">Admin Console</span>
                                            </DropdownMenuItem>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator className="bg-white/5" />
                                    <div className="p-1">
                                        <DropdownMenuItem onClick={signOut} className="rounded-lg py-2.5 px-3 cursor-pointer hover:bg-red-500/10 text-red-500">
                                            <LogOut className="mr-2 h-4 w-4" /> <span className="text-xs font-bold">Sign Out</span>
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <>
                            <Link to="/auth/signin">
                                <Button variant="ghost" className="text-white/40 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest">
                                    Sign In
                                </Button>
                            </Link>
                            <Link to="/auth/signup">
                                <Button className="bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px] px-6 h-9 rounded-lg transition-all active:scale-95">
                                    Join Studio
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
