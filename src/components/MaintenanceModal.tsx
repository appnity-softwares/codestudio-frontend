import React from "react";
import { Wrench, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    eta?: string;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose, eta }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md bg-[#0c0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        <div className="relative p-8">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-white transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>

                            <div className="flex flex-col items-center text-center space-y-6">
                                <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-xl animate-pulse" />
                                    <Wrench className="h-10 w-10 text-primary relative z-10 animate-spin" style={{ animationDuration: '4s' }} />
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tight text-white uppercase tracking-wider">
                                        Under Maintenance
                                    </h2>
                                    <p className="text-muted-foreground">
                                        We are currently performing a scheduled core upgrade. Access for non-admin users is temporarily restricted.
                                    </p>
                                </div>

                                {eta && (
                                    <div className="w-full bg-white/5 border border-white/5 p-4 rounded-xl flex items-center justify-center gap-3">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <div className="text-left">
                                            <p className="text-[10px] uppercase font-bold tracking-widest text-primary leading-none">Estimated Back Online</p>
                                            <p className="text-white font-mono text-sm mt-1">{eta}</p>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    className="w-full bg-white text-black hover:bg-white/90 font-bold"
                                    onClick={onClose}
                                >
                                    Understood
                                </Button>

                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    Please try again in a few minutes
                                </p>
                            </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="bg-primary/5 border-t border-white/5 px-8 py-3">
                            <p className="text-[10px] font-mono text-primary/60 text-center uppercase tracking-widest">
                                System Code: 503_SERVICE_MAINTENANCE
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default MaintenanceModal;
