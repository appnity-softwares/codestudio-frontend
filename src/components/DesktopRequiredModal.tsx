import { useState, useEffect } from "react";
import { Monitor, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DesktopRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

const SESSION_STORAGE_KEY = "desktop-required-modal-dismissed";

export function DesktopRequiredModal({
    isOpen,
    onClose,
    featureName = "This feature"
}: DesktopRequiredModalProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy link:", err);
        }
    };

    const handleDismiss = () => {
        sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                        onClick={handleDismiss}
                    />

                    {/* Compact Modal Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className={cn(
                            "fixed bottom-4 left-4 right-4 z-[101]",
                            "bg-[#111115]/95 backdrop-blur-xl border border-white/10",
                            "rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]",
                            "overflow-hidden"
                        )}
                    >
                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-10"
                        >
                            <X className="h-4 w-4 text-white/40" />
                        </button>

                        {/* Content */}
                        <div className="p-6 text-center">
                            {/* Icon - Smaller */}
                            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Monitor className="h-6 w-6 text-primary" />
                            </div>

                            <h2 className="text-lg font-bold text-white mb-2">Desktop Required</h2>

                            <p className="text-white/50 text-[11px] mb-6 max-w-[240px] mx-auto leading-relaxed">
                                <strong>{featureName}</strong> is designed for precision. We recommend a larger screen for the best experience.
                            </p>

                            {/* Action buttons - Compact horizontal on small screens if possible, or vertical */}
                            <div className="flex flex-col gap-2">
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="w-full h-10 text-[11px] rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white/80"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-3.5 w-3.5 mr-2 text-emerald-400" />
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-3.5 w-3.5 mr-2" />
                                            Copy Link
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleDismiss}
                                    className="w-full h-10 text-[11px] rounded-xl font-bold"
                                >
                                    Dismiss & Browse
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

/**
 * Hook to check if the modal was dismissed this session
 */
export function useDesktopRequiredDismissed(): boolean {
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        setDismissed(sessionStorage.getItem(SESSION_STORAGE_KEY) === "true");
    }, []);

    return dismissed;
}
