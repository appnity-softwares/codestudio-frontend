
import { motion } from "framer-motion";

export function PageLoader() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas/80 backdrop-blur-md">
            <div className="flex flex-col items-center gap-4">
                <div className="relative h-16 w-16">
                    <motion.div
                        className="absolute inset-0 rounded-xl border-2 border-primary/20"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <motion.div
                        className="absolute inset-0 rounded-xl border-t-2 border-primary"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-xl">
                        CS
                    </div>
                </div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs font-mono uppercase tracking-[0.3em] text-primary/50"
                >
                    Loading Data...
                </motion.p>
            </div>
        </div>
    );
}
