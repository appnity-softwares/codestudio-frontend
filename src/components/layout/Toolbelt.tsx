
import { useState } from "react";
import {
    TerminalIcon,
    Cpu,
    Activity,
    Medal,
    ExternalLink,
    ShieldCheck,
    Moon,
    Sun,
    Monitor,
    HelpCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { useTheme } from "@/context/ThemeContext";
import { cn } from "@/lib/utils";
import { SystemGuideModal } from "@/components/SystemGuideModal";

import { systemAPI } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function Toolbelt() {
    const { theme, setTheme } = useTheme();
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    // System Config
    const { data: systemData } = useQuery({
        queryKey: ['system-status'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5,
    });
    const settings = systemData?.settings || {};
    const showInterfaceEngine = settings['feature_interface_engine'] !== "false";

    return (
        <aside className="h-full w-full bg-surface/90 backdrop-blur-3xl flex flex-col transition-all duration-500 border-l border-border">
            {/* 1. System Status Header */}
            <div className="h-20 border-b border-border flex items-center px-6 gap-4 bg-muted/30">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/90">System Node: Online</span>
                    </div>
                    <div className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest pl-4">
                        Build v2.1.0-Stable
                    </div>
                </div>
                <div className="ml-auto">
                    <div className="p-1.5 bg-primary/5 rounded-lg border border-primary/20 flex items-center justify-center">
                        <Logo showText={false} className="h-4 w-4 scale-75" />
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-10 overflow-y-auto flex-1 custom-scrollbar">

                {/* 2. System Theme Control */}
                {showInterfaceEngine && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2.5 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            <Monitor className="w-4 h-4 text-blue-400 opacity-70" />
                            <span>Interface Engine</span>
                        </div>
                        <div className="flex p-1 bg-muted/40 rounded-xl border border-border">
                            {[
                                { id: 'light', icon: Sun, label: 'Light' },
                                { id: 'dark', icon: Moon, label: 'Dark' },
                                { id: 'system', icon: Monitor, label: 'Auto' },
                            ].map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id as any)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all duration-300",
                                        theme === t.id
                                            ? "bg-primary text-primary-foreground shadow-md"
                                            : "text-muted-foreground hover:text-foreground hover:bg-surface"
                                    )}
                                >
                                    <t.icon className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3. Quick Actions */}
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                            <Activity className="w-4 h-4 text-primary opacity-70" />
                            <span>System Utility</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/create" className="group">
                            <div className="p-5 rounded-2xl bg-muted/40 border border-border hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <TerminalIcon className="w-6 h-6 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                                <span className="text-[11px] font-black text-foreground group-hover:text-primary transition-colors tracking-tight">New Snippet</span>
                            </div>
                        </Link>
                        <Link
                            to="/help"
                            className="group"
                        >
                            <div className="p-5 rounded-2xl bg-muted/40 border border-border hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-sm transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 h-full w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <HelpCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300" />
                                <span className="text-[11px] font-black text-foreground group-hover:text-emerald-500 transition-colors tracking-tight">System Help</span>
                            </div>
                        </Link>
                        <Link to="/badges" className="block col-span-2 group">
                            <div className="p-4 rounded-xl bg-muted/30 border border-border hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm relative overflow-hidden">
                                <Medal className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-black text-muted-foreground group-hover:text-amber-500 transition-colors tracking-wider uppercase">Reputation & Badges</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-muted-foreground group-hover:text-amber-500 transition-colors" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 4. Execution Runtime Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2.5 text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                        <Cpu className="w-4 h-4 text-purple-400 opacity-70" />
                        <span>Execution Engine</span>
                    </div>
                    <div className="p-6 bg-muted/30 rounded-2xl border border-border space-y-4 shadow-sm relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.05] to-transparent pointer-events-none" />

                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">Core Engine</span>
                            <span className="text-[11px] font-black text-foreground tracking-widest bg-muted/50 px-2 py-0.5 rounded border border-border">PISTON V2.1</span>
                        </div>
                        <div className="w-full h-px bg-border" />

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.5)]" />
                                    <span className="text-[11px] font-bold text-muted-foreground">Python Runtime</span>
                                </div>
                                <span className="text-[10px] font-mono text-foreground/80">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.5)]" />
                                    <span className="text-[11px] font-bold text-muted-foreground">Node.js Engine</span>
                                </div>
                                <span className="text-[10px] font-mono text-foreground/80">Active</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-[0.2em]">Sandboxed Isolated Shell</span>
                        </div>
                    </div>
                </div>

                <Link to="/feedback" className="block group">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-indigo-500/5 border border-primary/20 relative overflow-hidden transition-all hover:scale-[1.02] shadow-sm">
                        <div className="absolute top-0 right-0 p-4 translate-x-2 -translate-y-2 opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-30 transition-all duration-500">
                            <ShieldCheck className="w-12 h-12 text-foreground" />
                        </div>
                        <h4 className="text-[11px] font-black text-foreground uppercase tracking-widest mb-1">Feedback Wall</h4>
                        <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Feedback visibility is influenced by community votes and trust score.
                        </p>
                    </div>
                </Link>
            </div>

            <SystemGuideModal
                isOpen={isGuideOpen}
                onClose={() => setIsGuideOpen(false)}
            />
        </aside>
    );
}
