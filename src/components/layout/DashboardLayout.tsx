import { Outlet, useLocation } from "react-router-dom";
import { Dock } from "./Dock";
import { Toolbelt } from "./Toolbelt";
import { MobileTabBar } from "./MobileTabBar";
import { GlobalHeader } from "./GlobalHeader";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ExperienceModal } from "../ExperienceModal";
import { SystemGuideModal } from "../SystemGuideModal";
import { useState, useEffect } from "react";


export function DashboardLayout() {
    const isMobile = useIsMobile();
    const location = useLocation();
    const [isGuideOpen, setIsGuideOpen] = useState(false);

    useEffect(() => {
        const hasSeenGuide = localStorage.getItem("skip_system_guide") === "true";
        if (!hasSeenGuide) {
            setIsGuideOpen(true);
        }
    }, []);

    const handleCloseGuide = () => {
        localStorage.setItem("skip_system_guide", "true");
        setIsGuideOpen(false);
    };

    // Routes where we should hide sidebars to maximize space
    const isArenaRoom = location.pathname.includes('/arena/env/') ||
        location.pathname.includes('/arena/official/') ||
        location.pathname.includes('/contest/') ||
        location.pathname.includes('/practice/');

    const isCreatePage = location.pathname === '/create';
    const isHelpPage = location.pathname === '/help';
    const isFeedbackPage = location.pathname === '/feedback';

    const hideDock = (isArenaRoom || isHelpPage) && !isMobile;
    const hideToolbelt = (isArenaRoom || isCreatePage || isHelpPage) && !isMobile;
    const hideFloatingButtons = (isArenaRoom || isCreatePage || isHelpPage) && !isMobile;

    return (
        <div className="relative h-screen w-screen bg-canvas overflow-hidden selection:bg-primary/20 text-primary font-sans flex flex-col">
            {/* Global Mobile Header */}
            {isMobile && <GlobalHeader />}

            {/* Main Layout Flexbox */}
            <div className="relative z-10 flex-1 flex overflow-hidden">
                {/* Column 1: Navigation Dock (Desktop Only) */}
                {!isMobile && !hideDock && <Dock />}

                {/* Column 2: Main Content Area (Scrollable) */}
                <main className={cn(
                    "flex-1 flex flex-col min-w-0 h-full overflow-hidden relative",
                    isMobile && !isFeedbackPage && "has-bottom-nav" // Add padding for bottom nav
                )}>
                    {/* Optional: We can add a sticky header here if needed for breadcrumbs */}
                    <div className={cn(
                        "flex-1 flex flex-col",
                        !isFeedbackPage && "overflow-y-auto scroll-smooth-mobile",
                        isMobile && !isFeedbackPage && "pb-4" // Extra bottom padding on mobile
                    )}>
                        <Outlet />
                    </div>
                </main>

                {/* Column 3: Context Toolbelt (Desktop Only) */}
                {!isMobile && !hideToolbelt && (
                    <div className="hidden xl:block w-[280px] 2xl:w-[320px] flex-shrink-0 border-l border-border bg-canvas/30 backdrop-blur-sm">
                        <Toolbelt />
                    </div>
                )}
            </div>

            {/* Mobile Bottom Tab Navigation */}
            {isMobile && !hideFloatingButtons && <MobileTabBar />}

            <ExperienceModal />
            <SystemGuideModal isOpen={isGuideOpen} onClose={handleCloseGuide} />
        </div>
    );
}

