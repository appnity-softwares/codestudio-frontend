import {
    Users,
    TerminalIcon,
    Cpu,
    Activity
} from "lucide-react";

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
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Activity className="w-3 h-3" />
                        <span>Quick Actions</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <a href="/" className="block">
                            <div className="p-3 rounded bg-surface border border-border hover:border-primary/50 transition-colors text-center cursor-pointer">
                                <TerminalIcon className="w-5 h-5 mx-auto mb-1 text-primary" />
                                <span className="text-[10px] font-mono">Create Snippet</span>
                            </div>
                        </a>
                        <a href="/arena" className="block">
                            <div className="p-3 rounded bg-surface border border-border hover:border-primary/50 transition-colors text-center cursor-pointer">
                                <Users className="w-5 h-5 mx-auto mb-1 text-orange-400" />
                                <span className="text-[10px] font-mono">Arena</span>
                            </div>
                        </a>
                    </div>
                </div>

                {/* 3. Execution Environment Info */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        <Cpu className="w-3 h-3" />
                        <span>Execution Runtime</span>
                    </div>
                    <div className="p-4 bg-surface rounded-sm border border-border space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-muted-foreground">Engine</span>
                            <span className="text-primary">Piston v2 (Sandboxed)</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-muted-foreground">Python</span>
                            <span className="text-foreground">v3.10</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-muted-foreground">Node.js</span>
                            <span className="text-foreground">v18.x</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-mono">
                            <span className="text-muted-foreground">Go</span>
                            <span className="text-foreground">v1.20</span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-border text-[10px] text-muted-foreground/50 text-center italic">
                            Strict memory/time limits active.
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
