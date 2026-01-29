import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Cpu, Globe, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface VaultHandshakeProps {
    isOpen: boolean;
    username: string;
    onComplete: () => void;
}

export function VaultHandshake({ isOpen, username, onComplete }: VaultHandshakeProps) {
    const [step, setStep] = useState(0);
    const steps = [
        { icon: ShieldCheck, label: "Initializing Secure Connection...", color: "text-blue-400" },
        { icon: Lock, label: "Validating Access Token...", color: "text-amber-400" },
        { icon: Cpu, label: "Decrypting Neural Signature...", color: "text-purple-400" },
        { icon: Globe, label: "Establishing Bio-Link...", color: "text-emerald-400" },
        { icon: Zap, label: "Vault Synchronization Complete.", color: "text-amber-500" },
    ];

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            let currentStep = 0;
            const interval = setInterval(() => {
                currentStep++;
                if (currentStep < steps.length) {
                    setStep(currentStep);
                } else {
                    clearInterval(interval);
                    setTimeout(onComplete, 800);
                }
            }, 600);
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center"
                >
                    {/* Background Grid Decoration */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                    </div>

                    <div className="relative z-10 space-y-12 max-w-md w-full">
                        {/* Central Ring */}
                        <div className="relative h-48 w-48 mx-auto flex items-center justify-center">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-primary/20 rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border border-primary/40 rounded-full"
                            />

                            <motion.div
                                key={step}
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className={`h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center ${steps[step].color}`}
                            >
                                {(() => {
                                    const Icon = steps[step].icon;
                                    return <Icon className="h-10 w-10" />;
                                })()}
                            </motion.div>
                        </div>

                        <div className="space-y-4">
                            <motion.h2
                                key={username}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-2xl font-black font-headline tracking-tighter"
                            >
                                ACCESSING <span className="text-primary italic">{username.toUpperCase()}'S</span> VAULT
                            </motion.h2>

                            <div className="space-y-3">
                                <p className={`text-sm font-mono font-bold tracking-widest ${steps[step].color} transition-colors duration-300 uppercase`}>
                                    {steps[step].label}
                                </p>

                                <div className="h-1 w-full bg-muted rounded-full overflow-hidden max-w-[200px] mx-auto">
                                    <motion.div
                                        className="h-full bg-primary"
                                        initial={{ width: "0%" }}
                                        animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                                        transition={{ duration: 0.4 }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 text-[10px] text-muted-foreground/30 font-mono uppercase tracking-[0.3em]">
                            Encrypted Peer-to-Peer Protocol 7.2.1
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
