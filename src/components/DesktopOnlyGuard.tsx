import { useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useShouldBlockEditor } from "@/hooks/useDeviceType";
import { DesktopRequiredModal, useDesktopRequiredDismissed } from "./DesktopRequiredModal";

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
        // Navigate back to previous page after dismissing
        navigate(-1);
    };

    // On desktop, render children normally
    if (!shouldBlock) {
        return <>{children}</>;
    }

    // On mobile/tablet, show modal and don't render the actual content
    return (
        <>
            {/* Show a placeholder or empty state behind the modal */}
            <div className="flex items-center justify-center h-screen bg-background">
                <div className="text-center p-6">
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>

            <DesktopRequiredModal
                isOpen={showModal}
                onClose={handleClose}
                featureName={featureName}
            />
        </>
    );
}
