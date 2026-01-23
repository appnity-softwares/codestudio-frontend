import { Outlet, useLocation } from "react-router-dom";
import { Dock } from "./Dock";
import { Toolbelt } from "./Toolbelt";
import { FloatingActionButton } from "../FloatingActionButton";
import { MobileTabBar } from "./MobileTabBar";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { ExperienceModal } from "../ExperienceModal";

export function DashboardLayout() {
    const isMobile = useIsMobile();
    const location = useLocation();

    // Routes where we should hide sidebars to maximize space
    const isArenaRoom = location.pathname.includes('/arena/env/') ||
        location.pathname.includes('/arena/official/') ||
        location.pathname.includes('/contest/') ||
        location.pathname.includes('/practice/');

    const isCreatePage = location.pathname === '/create';

    const hideDock = isArenaRoom && !isMobile;
    const hideToolbelt = (isArenaRoom || isCreatePage) && !isMobile;
    const hideFloatingButtons = (isArenaRoom || isCreatePage) && !isMobile;

    return (
        <div className="relative h-screen w-screen bg-canvas overflow-hidden selection:bg-primary/20 text-primary font-sans">
            {/* Decorative Background Grid with Mask */}
            <div className="absolute inset-0 bg-grid pointer-events-none" />

            {/* Main Layout Flexbox */}
            <div className="relative z-10 h-full w-full flex overflow-hidden">
                {/* Column 1: Navigation Dock (Desktop Only) */}
                {!isMobile && !hideDock && <Dock />}

                {/* Column 2: Main Content Area (Scrollable) */}
                <main className={cn(
                    "flex-1 flex flex-col min-w-0 h-full overflow-hidden relative",
                    isMobile && "has-bottom-nav" // Add padding for bottom nav
                )}>
                    {/* Optional: We can add a sticky header here if needed for breadcrumbs */}
                    <div className={cn(
                        "flex-1 overflow-y-auto scroll-smooth-mobile",
                        isMobile && "pb-4" // Extra bottom padding on mobile
                    )}>
                        <Outlet />
                    </div>
                </main>

                {/* Column 3: Context Toolbelt (Desktop Only) */}
                {!isMobile && !hideToolbelt && (
                    <div className="hidden xl:block w-[280px] 2xl:w-[320px] flex-shrink-0 border-l border-white/5 bg-canvas/30 backdrop-blur-sm">
                        <Toolbelt />
                    </div>
                )}
            </div>

            {/* Floating Action Button */}
            {!hideFloatingButtons && <FloatingActionButton />}

            {/* Mobile Bottom Tab Navigation */}
            {isMobile && !hideFloatingButtons && <MobileTabBar />}

            <ExperienceModal />
        </div>
    );
}

