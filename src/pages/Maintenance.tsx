import React from "react";
import { Clock, ArrowRight, Server } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";
import { Logo } from "@/components/ui/Logo";

const Maintenance: React.FC = () => {
    const { data: settingsData } = useQuery({
        queryKey: ["public-system-status"],
        queryFn: () => systemAPI.getPublicStatus(),
    });

    const settings = settingsData?.settings || {};
    const eta = settings["maintenance_eta"] || "~ 20 Minutes";

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 relative font-sans">
            {/* Simple Ambient Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 flex flex-col items-center gap-6"
                >
                    <Logo className="scale-150 mb-4" />

                    <div className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Scheduled Maintenance</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-center space-y-6 mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                        We're refining the <span className="text-primary italic">CodeStudio</span> experience.
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-lg mx-auto">
                        The platform is currently offline for critical updates. We'll be back online in just a moment.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
                >
                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Clock className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">Expected Back</p>
                            <p className="text-white font-bold">{eta}</p>
                        </div>
                    </div>

                    <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <Server className="h-5 w-5" />
                        </div>
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/60">System Status</p>
                            <p className="text-blue-400 font-bold italic">Syncing Shaders</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="mt-12 flex flex-col items-center gap-6"
                >
                    <button
                        onClick={() => window.location.reload()}
                        className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-white/90 transition-all flex items-center gap-2 group shadow-xl shadow-white/5"
                    >
                        Try Connecting Again
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <button
                        onClick={() => window.location.href = '/auth/signin'}
                        className="text-muted-foreground/40 hover:text-primary transition-colors text-[10px] font-bold uppercase tracking-[0.3em]"
                    >
                        // Developer Bypass
                    </button>
                </motion.div>
            </div>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] font-mono text-muted-foreground/20 uppercase tracking-[0.4em]">
                CodeStudio Infrastructure Service v4.2
            </div>
        </div>
    );
};

export default Maintenance;
