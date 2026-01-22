import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useShouldBlockEditor } from "@/hooks/useDeviceType";
import { DesktopRequiredModal, useDesktopRequiredDismissed } from "./DesktopRequiredModal";
import { motion } from "framer-motion";
import { Monitor } from "lucide-react";

interface DesktopOnlyGuardProps {
    children: ReactNode;
    featureName?: string;
    /** If true, redirect back instead of showing modal */
    redirectBack?: boolean;
}

/**
 * Guard component that wraps desktop-only features (like code editors)
 * Shows a modal on mobile/tablet devices explaining the feature is desktop-only
 */
export function DesktopOnlyGuard({
    children,
    featureName = "Practice Arena and Live Contests",
    redirectBack = false
}: DesktopOnlyGuardProps) {
    const shouldBlock = useShouldBlockEditor();
    const wasDismissed = useDesktopRequiredDismissed();
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (shouldBlock && !wasDismissed) {
            if (redirectBack) {
                navigate(-1);
            } else {
                setShowModal(true);
            }
        }
    }, [shouldBlock, wasDismissed, redirectBack, navigate]);

    const handleClose = () => {
        setShowModal(false);
    };

    const handleReopen = () => {
        setShowModal(true);
    };

    // On desktop, render children normally
    if (!shouldBlock) {
        return <>{children}</>;
    }

    // On mobile/tablet, we show the modal automatically first (if not dismissed)
    // But we let them "dismiss" and see the content if they really want, 
    // while showing a persistent info button to get the link back.
    return (
        <div className="relative min-h-screen">
            {children}

            {/* Minimized Info Icon (Visible when modal is closed) */}
            {!showModal && (
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handleReopen}
                    className="fixed bottom-6 right-6 z-[60] h-12 w-12 rounded-full bg-primary shadow-2xl shadow-primary/40 flex items-center justify-center border border-white/20 text-white"
                >
                    <Monitor className="h-6 w-6" />
                </motion.button>
            )}

            <DesktopRequiredModal
                isOpen={showModal}
                onClose={handleClose}
                featureName={featureName}
            />
        </div>
    );
}
