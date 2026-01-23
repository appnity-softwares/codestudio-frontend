import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export function XPBurst({ amount, active }: { amount: number; active: boolean }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (active) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    return (
        <AnimatePresence>
            {visible && (
                <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0, 1, 1, 0],
                            y: -100
                        }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 2, times: [0, 0.2, 0.8, 1], ease: "easeOut" }}
                        className="flex flex-col items-center gap-2"
                    >
                        <div className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-white/20 backdrop-blur-md">
                            <Zap className="h-6 w-6 text-yellow-200 fill-yellow-200 animate-pulse" />
                            <span className="text-2xl font-black text-white tracking-wider font-mono">
                                +{amount} XP
                            </span>
                        </div>
                        <div className="text-amber-500 font-bold text-sm tracking-widest uppercase opacity-80 animate-pulse">
                            Level Up Progress
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
