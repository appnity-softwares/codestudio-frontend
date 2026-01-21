import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export function SuccessBurst({ active }: { active: boolean }) {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; color: string; size: number }[]>([]);

    useEffect(() => {
        if (active) {
            const newParticles = Array.from({ length: 40 }).map((_, i) => ({
                id: i,
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 400,
                color: ["#7c3aed", "#ec4899", "#3b82f6", "#10b981", "#fbbf24"][Math.floor(Math.random() * 5)],
                size: Math.random() * 8 + 4
            }));
            setParticles(newParticles);
            const timer = setTimeout(() => setParticles([]), 2000);
            return () => clearTimeout(timer);
        }
    }, [active]);

    return (
        <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
            <AnimatePresence>
                {particles.map((p) => (
                    <motion.div
                        key={p.id}
                        initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                        animate={{
                            x: p.x,
                            y: p.y,
                            scale: 1,
                            opacity: 0,
                            rotate: Math.random() * 360
                        }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="absolute rounded-sm"
                        style={{
                            backgroundColor: p.color,
                            width: p.size,
                            height: p.size
                        }}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
