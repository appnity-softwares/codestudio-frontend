
import { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";
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
                <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 100 }}
                        className="relative w-full max-w-sm bg-[#0c0c0e]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        {/* Compact Header */}
                        <div className="p-6 text-center">
                            <div className="h-12 w-12 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Monitor className="h-6 w-6 text-primary" />
                            </div>

                            <h2 className="text-xl font-bold text-white mb-2">Build from Desktop</h2>
                            <p className="text-sm text-white/50 leading-relaxed mb-6">
                                CodeStudio is optimized for large screens. Open on desktop for the full IDE experience.
                            </p>

                            <div className="flex flex-col gap-2">
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
                                    onClick={handleClose}
                                >
                                    Proceed Anyway
                                </Button>

                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(window.location.href);
                                    }}
                                    className="text-[10px] text-white/30 uppercase tracking-widest font-bold py-2 hover:text-white/60 transition-colors"
                                >
                                    Copy Link for Desktop
                                </button>
                            </div>
                        </div>

                        {/* Close Button - Discrete */}
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-4 w-4 text-white/30" />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
