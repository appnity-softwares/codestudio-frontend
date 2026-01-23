
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
        <aside className="h-full w-full bg-[#08080a]/50 backdrop-blur-3xl flex flex-col transition-all duration-500">
            {/* 1. System Status Header */}
            <div className="h-20 border-b border-white/5 flex items-center px-6 gap-4 bg-white/[0.02]">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">System Node: Online</span>
                    </div>
                    <div className="text-[9px] font-mono text-white/20 uppercase tracking-widest pl-4">
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
                        <div className="flex items-center gap-2.5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                            <Monitor className="w-4 h-4 text-blue-400 opacity-50" />
                            <span>Interface Engine</span>
                        </div>
                        <div className="flex p-1 bg-white/[0.03] rounded-xl border border-white/5">
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
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-white/30 hover:text-white/60 hover:bg-white/5"
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
                        <div className="flex items-center gap-2.5 text-[11px] font-black text-white/40 uppercase tracking-[0.2em]">
                            <Activity className="w-4 h-4 text-primary opacity-50" />
                            <span>System Utility</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Link to="/create" className="group">
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-primary/50 hover:bg-primary/5 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 h-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <TerminalIcon className="w-6 h-6 text-primary group-hover:scale-110 group-hover:rotate-6 transition-all duration-300" />
                                <span className="text-[11px] font-black text-white group-hover:text-primary transition-colors tracking-tight">New Snippet</span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsGuideOpen(true)}
                            className="group"
                        >
                            <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all duration-300 text-center flex flex-col items-center justify-center gap-2 h-full w-full relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <HelpCircle className="w-6 h-6 text-emerald-400 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300" />
                                <span className="text-[11px] font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight">System Help</span>
                            </div>
                        </button>
                        <Link to="/badges" className="block col-span-2 group">
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm relative overflow-hidden">
                                <Medal className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                                <span className="text-[11px] font-black text-white/50 group-hover:text-amber-500 transition-colors tracking-wider uppercase">Reputation & Badges</span>
                                <ExternalLink className="w-3 h-3 ml-auto text-white/10 group-hover:text-amber-500 transition-colors" />
                            </div>
                        </Link>
                    </div>
                </div>

                {/* 4. Execution Runtime Info */}
                <div className="space-y-5">
                    <div className="flex items-center gap-2.5 text-[11px] font-black text-white uppercase tracking-[0.2em]">
                        <Cpu className="w-4 h-4 text-purple-400 opacity-50" />
                        <span>Execution Engine</span>
                    </div>
                    <div className="p-6 bg-white/[0.02] rounded-2xl border border-white/5 space-y-4 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/[0.02] to-transparent pointer-events-none" />

                        <div className="flex justify-between items-center group/item">
                            <span className="text-[11px] font-bold text-white/30 group-hover/item:text-white/50 transition-colors">Core Engine</span>
                            <span className="text-[11px] font-black text-white tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">PISTON V2.1</span>
                        </div>
                        <div className="w-full h-px bg-white/[0.03]" />

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_4px_rgba(96,165,250,0.5)]" />
                                    <span className="text-[11px] font-bold text-white/40">Python Runtime</span>
                                </div>
                                <span className="text-[10px] font-mono text-white/80">Active</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-yellow-400 shadow-[0_0_4px_rgba(250,204,21,0.5)]" />
                                    <span className="text-[11px] font-bold text-white/40">Node.js Engine</span>
                                </div>
                                <span className="text-[10px] font-mono text-white/80">Active</span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-white/[0.03] flex items-center justify-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] text-white/20 font-black uppercase tracking-[0.2em]">Sandboxed Isolated Shell</span>
                        </div>
                    </div>
                </div>

                <Link to="/feedback" className="block group">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-indigo-500/10 border border-primary/20 relative overflow-hidden transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-4 translate-x-2 -translate-y-2 opacity-10 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-30 transition-all duration-500">
                            <ShieldCheck className="w-12 h-12" />
                        </div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest mb-1">Feedback Wall</h4>
                        <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                            Contribute to the roadmap. Report bugs or request core engine features.
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
