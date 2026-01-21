import React from "react";
import { Hammer, Wrench, Clock, ShieldAlert, Loader2, ArrowRight } from "lucide-react";
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
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 overflow-hidden relative font-sans selection:bg-primary/30">
            {/* Ultra-Premium Background Depth */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[160px] animate-pulse opacity-50" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse opacity-50" style={{ animationDelay: '3s' }} />

            {/* Animated Scanning Line */}
            <motion.div
                initial={{ top: "-100%" }}
                animate={{ top: "200%" }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent z-[1] pointer-events-none"
            />

            {/* Decorative Matrix Background (Subtle) */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] pointer-events-none" />

            <div className="max-w-4xl w-full text-center relative z-10">
                {/* Status Indicator */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="mb-10 inline-flex flex-col items-center"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-black/60 border border-white/10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.15)] flex items-center justify-center relative group overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-50" />
                        <div className="absolute inset-0 bg-primary/10 blur-xl group-hover:bg-primary/30 transition-all duration-700" />
                        <Wrench className="h-9 w-9 text-primary relative z-10 animate-pulse" />
                    </div>
                    <div className="mt-4 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full">
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] animate-pulse">System Lockdown</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none">
                        CONSTRUCTION <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-400 italic font-black">IN PROGRESS</span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground/80 max-w-xl mx-auto leading-relaxed font-medium">
                        CodeStudio Core is receiving a critical hotfix. <br />
                        Compilers are in standby mode.
                    </p>
                </motion.div>

                {/* Information Modules */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left max-w-3xl mx-auto"
                >
                    <div className="group bg-white/[0.03] backdrop-blur-xl border border-white/5 p-6 rounded-3xl transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.05]">
                        <div className="flex items-center gap-3 text-primary mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Clock className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Estimated Return</span>
                        </div>
                        {settingsLoading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-white/20" />
                        ) : (
                            <p className="text-white font-mono text-sm leading-relaxed antialiased">
                                {eta}
                            </p>
                        )}
                    </div>

                    <div className="group bg-white/[0.03] backdrop-blur-xl border border-white/5 p-6 rounded-3xl transition-all duration-500 hover:border-indigo-500/30 hover:bg-white/[0.05]">
                        <div className="flex items-center gap-3 text-indigo-400 mb-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Hammer className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Active Task</span>
                        </div>
                        <p className="text-white font-mono text-sm leading-relaxed antialiased">Database Migration & Shader Optimization</p>
                    </div>

                    <div className="group bg-white/[0.03] backdrop-blur-xl border border-white/5 p-6 rounded-3xl transition-all duration-500 hover:border-amber-500/30 hover:bg-white/[0.05]">
                        <div className="flex items-center gap-3 text-amber-500 mb-4">
                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                <ShieldAlert className="h-4 w-4" />
                            </div>
                            <span className="text-[10px] uppercase font-black tracking-[0.2em]">Admin Bypass</span>
                        </div>
                        <p className="text-white font-mono text-sm leading-relaxed antialiased">Secure Entry Tunnel Active for Developers</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 space-y-8"
                >
                    <button
                        onClick={() => window.location.reload()}
                        className="px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-white/90 transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 group relative"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            Check Connection
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={() => window.location.href = '/auth/signin'}
                            className="px-4 py-2 text-white/40 hover:text-primary hover:bg-white/5 rounded-full text-[10px] font-bold uppercase tracking-[0.4em] transition-all duration-300 border border-transparent hover:border-white/10"
                        >
                            // Bypass System: Admin Login
                        </button>
                        <p className="text-[9px] text-muted-foreground/30 uppercase tracking-[0.5em] font-mono">
                            Unauthorized access is strictly logged
                        </p>
                    </div>
                </motion.div>

                {/* Footer Decor */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 1 }}
                    className="mt-20 flex flex-col items-center gap-4"
                >
                    <div className="h-px w-32 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <p className="text-[10px] font-mono text-muted-foreground/40 uppercase tracking-[0.3em]">
                        CodeStudio Core v4.2.0-STABLE-MAINT
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Maintenance;
