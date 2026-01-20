import { useState, useEffect } from "react";
import { Monitor, Keyboard, Zap, Copy, Check, X } from "lucide-react";
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

                    {/* Bottom Sheet Modal */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className={cn(
                            "fixed bottom-0 left-0 right-0 z-[101]",
                            "bg-[#14141a] border-t border-white/10",
                            "rounded-t-3xl shadow-2xl",
                            "pb-safe" // Safe area for iOS
                        )}
                    >
                        {/* Handle bar */}
                        <div className="flex justify-center pt-3 pb-2">
                            <div className="w-10 h-1 rounded-full bg-white/20" />
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5 text-white/50" />
                        </button>

                        {/* Content */}
                        <div className="px-6 pb-8 pt-2 text-center">
                            {/* Icon */}
                            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                                <Monitor className="h-8 w-8 text-primary" />
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-white mb-2">
                                Desktop Required
                            </h2>

                            {/* Description */}
                            <p className="text-white/60 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                                {featureName} is optimized for larger screens to ensure the best coding experience.
                            </p>

                            {/* Benefits list */}
                            <div className="flex flex-col gap-3 mb-8 max-w-xs mx-auto">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Keyboard className="h-4 w-4 text-white/70" />
                                    </div>
                                    <span className="text-sm text-white/80">Full keyboard support</span>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Monitor className="h-4 w-4 text-white/70" />
                                    </div>
                                    <span className="text-sm text-white/80">Powerful code editor</span>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Zap className="h-4 w-4 text-white/70" />
                                    </div>
                                    <span className="text-sm text-white/80">Faster code execution</span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={handleCopyLink}
                                    variant="outline"
                                    className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white touch-target"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="h-4 w-4 mr-2 text-emerald-400" />
                                            Link Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="h-4 w-4 mr-2" />
                                            Copy Link to Open on Desktop
                                        </>
                                    )}
                                </Button>

                                <Button
                                    onClick={handleDismiss}
                                    className="w-full h-12 rounded-xl touch-target"
                                >
                                    Got it
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
