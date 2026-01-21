import React from "react";
import { Hammer, Wrench, Clock, ShieldAlert, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";

const Maintenance: React.FC = () => {
    const { data: settingsData, isLoading: settingsLoading } = useQuery({
        queryKey: ["public-system-status"],
        queryFn: () => systemAPI.getPublicStatus(),
    });

    const settings = settingsData?.settings || {};
    const eta = settings["maintenance_eta"] || "~ 20 Minutes";

    return (
        <div className="min-h-screen bg-canvas flex items-center justify-center p-6 overflow-hidden relative font-sans">
            {/* Animated Glow Patterns */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

            {/* Decorative Grid Line */}
            <div className="absolute inset-0 bg-grid opacity-20" />

            <div className="max-w-2xl w-full text-center relative z-10">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-surface border border-white/10 shadow-2xl relative group"
                >
                    <div className="absolute inset-0 bg-primary/20 blur-xl group-hover:bg-primary/40 transition-colors rounded-3xl" />
                    <Wrench className="h-10 w-10 text-primary relative z-10 animate-spin" style={{ animationDuration: '4s' }} />
                </motion.div>

                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter"
                >
                    CONSTRUCTION <br />
                    <span className="text-primary italic">IN PROGRESS</span>
                </motion.h1>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-muted-foreground mb-12 max-w-lg mx-auto leading-relaxed"
                >
                    CodeStudio is currently receiving a critical core upgrade.
                    Our compilers are resting, but we'll be back online shortly.
                </motion.p>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left mb-12"
                >
                    <div className="bg-surface/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Clock className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">ETA</span>
                        </div>
                        {settingsLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-white/40" />
                        ) : (
                            <p className="text-white font-mono text-sm leading-tight">{eta}</p>
                        )}
                    </div>

                    <div className="bg-surface/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 text-indigo-400 mb-2">
                            <Hammer className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Task</span>
                        </div>
                        <p className="text-white font-mono text-sm leading-tight">Database Optim.</p>
                    </div>

                    <div className="bg-surface/50 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                        <div className="flex items-center gap-3 text-amber-500 mb-2">
                            <ShieldAlert className="h-4 w-4" />
                            <span className="text-[10px] uppercase font-bold tracking-widest leading-none">Admin</span>
                        </div>
                        <p className="text-white font-mono text-sm leading-tight">Bypass Available</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95"
                    >
                        Try Again
                    </button>
                    <div className="mt-6">
                        <button
                            onClick={() => window.location.href = '/auth/signin'}
                            className="text-white/40 hover:text-white/80 text-xs font-mono uppercase tracking-[0.3em] transition-colors"
                        >
                            // Force Admin Entry
                        </button>
                    </div>
                    <p className="mt-4 text-[10px] text-muted-foreground uppercase tracking-widest">
                        Redirects to system check
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-16 flex flex-col items-center gap-4"
                >
                    <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
                        CodeStudio Core v4.2.0-maint
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Maintenance;
