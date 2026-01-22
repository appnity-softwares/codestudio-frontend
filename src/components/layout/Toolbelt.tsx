import {
    TerminalIcon,
    Cpu,
    Activity,
    Medal
} from "lucide-react";
import { Link } from "react-router-dom";

export function Toolbelt() {
    // const { user: currentUser } = useAuth();
    // const [isExpanded, setIsExpanded] = useState(false);

    // MVP Toolbelt (Right Sidebar)
    // 1. System Status
    // 2. Quick Links
    // 3. Execution Environment

    return (
        <aside className="h-full w-[300px] bg-canvas border-l border-border hidden lg:flex flex-col">
            {/* 1. System Status */}
            <div className="h-14 border-b border-border flex items-center px-4 gap-4 bg-surface/30">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>SYSTEM: ONLINE</span>
                </div>
                <div className="ml-auto text-[10px] font-mono text-muted-foreground opacity-50">
                    v1.0.0-MVP
                </div>
            </div>

            <div className="p-4 space-y-6 overflow-y-auto flex-1">
                {/* 2. Quick Links */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-white uppercase tracking-widest">
                        <Activity className="w-4 h-4 text-primary" />
                        <span>Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/create" className="block">
                            <div className="p-4 rounded-xl bg-surface border border-white/10 hover:border-primary hover:bg-white/5 transition-all text-center cursor-pointer h-full flex flex-col items-center justify-center group shadow-sm">
                                <TerminalIcon className="w-6 h-6 mb-2 text-primary group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-white group-hover:text-primary transition-colors">Create Snippet</span>
                            </div>
                        </Link>
                        <Link to="/badges" className="block">
                            <div className="p-4 rounded-xl bg-surface border border-white/10 hover:border-amber-500 hover:bg-white/5 transition-all text-center cursor-pointer h-full flex flex-col items-center justify-center group shadow-sm">
                                <Medal className="w-6 h-6 mb-2 text-amber-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors">Badges</span>
                            </div>
                        </Link>
                        <Link to="/changelog" className="block col-span-2">
                            <div className="p-3 rounded-lg bg-surface border border-white/10 hover:border-emerald-500 hover:bg-white/5 transition-all text-center cursor-pointer flex items-center justify-center gap-2 group shadow-sm">
                                <Activity className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">View Changelog</span>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 3. Execution Environment Info */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold text-white uppercase tracking-widest">
                        <Cpu className="w-4 h-4 text-purple-400" />
                        <span>Execution Runtime</span>
                    </div>
                    <div className="p-5 bg-surface/50 rounded-xl border border-white/10 space-y-3 shadow-inner">
                        <div className="flex justify-between items-center text-xs font-medium">
                            <span className="text-muted-foreground">Engine</span>
                            <span className="text-white font-bold tracking-wide">Piston v2</span>
                        </div>
                        <div className="w-full h-px bg-white/5" />
                        <div className="flex justify-between items-center text-xs font-medium">
                            <span className="text-muted-foreground">Python</span>
                            <span className="text-white font-mono">v3.10</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-medium">
                            <span className="text-muted-foreground">Node.js</span>
                            <span className="text-white font-mono">v18.x</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-medium">
                            <span className="text-muted-foreground">Go</span>
                            <span className="text-white font-mono">v1.20</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/10 text-[10px] text-white/40 text-center uppercase tracking-wider font-bold">
                            Sandboxed Environment
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
