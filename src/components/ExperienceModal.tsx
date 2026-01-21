
import { useState, useEffect } from "react";
import { Monitor, Layout, Keyboard, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/context/AuthContext";

const STORAGE_KEY = "experience-modal-shown";

export function ExperienceModal() {
    const { isAuthenticated } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        // Only show once ever per browser
        const hasShown = localStorage.getItem(STORAGE_KEY);
        // Also check screen size - if already on desktop, maybe don't show or show a welcome?
        // But user asked "please open this platform in desktop", implying they might be on mobile.
        const isMobile = window.innerWidth < 1024;

        if (!hasShown && isMobile) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        localStorage.setItem(STORAGE_KEY, "true");
        setIsOpen(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 backdrop-blur-md"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20"
                    >
                        {/* Header Image/Pattern */}
                        <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center animate-pulse">
                                    <Monitor className="h-8 w-8 text-primary" />
                                </div>
                            </div>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5 text-white/50" />
                        </button>

                        <div className="p-8 pt-6">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">Upgrade Your Experience</h2>
                                <p className="text-white/50 leading-relaxed">
                                    We noticed you're on a mobile device. CodeStudio is a high-performance IDE platform designed for professional workflows.
                                </p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                        <Layout className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Full-Scale Layout</h4>
                                        <p className="text-xs text-white/40 mt-1">Multi-pane windows and advanced sidebars for maximum productivity.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                        <Keyboard className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Advanced Shortcuts</h4>
                                        <p className="text-xs text-white/40 mt-1">Full keyboard support for lightning-fast coding and navigation.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                        <Zap className="h-5 w-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm text-white">Turbo Performance</h4>
                                        <p className="text-xs text-white/40 mt-1">Optimized code execution and real-time visualization on desktop.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button
                                    size="lg"
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 rounded-2xl shadow-lg shadow-primary/20"
                                    onClick={handleClose}
                                >
                                    Proceed Anyway
                                </Button>
                                <div className="text-center">
                                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">
                                        Best experienced on Desktop
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
