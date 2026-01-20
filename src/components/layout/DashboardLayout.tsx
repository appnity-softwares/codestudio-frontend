import { Outlet } from "react-router-dom";
import { Dock } from "./Dock";
import { Toolbelt } from "./Toolbelt";
import { FloatingActionButton } from "../FloatingActionButton";
import { MobileTabBar } from "./MobileTabBar";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
    const isMobile = useIsMobile();

    return (
        <div className="relative h-screen w-screen bg-canvas overflow-hidden selection:bg-primary/20 text-primary font-sans">
            {/* Decorative Background Grid with Mask */}
            <div className="absolute inset-0 bg-grid pointer-events-none" />

            {/* Main Layout Flexbox */}
            <div className="relative z-10 h-full w-full flex overflow-hidden">
                {/* Column 1: Navigation Dock (Desktop Only) */}
                {!isMobile && <Dock />}

                {/* Column 2: Main Content Area (Scrollable) */}
                <main className={cn(
                    "flex-1 flex flex-col min-w-0 h-full overflow-hidden relative",
                    isMobile && "has-bottom-nav" // Add padding for bottom nav
                )}>
                    {/* Optional: We can add a sticky header here if needed for breadcrumbs */}
                    <div className={cn(
                        "flex-1 overflow-y-auto scrollbar-hide scroll-smooth-mobile",
                        isMobile && "pb-4" // Extra bottom padding on mobile
                    )}>
                        <Outlet />
                    </div>
                </main>

                {/* Column 3: Context Toolbelt (Desktop Only) */}
                {!isMobile && (
                    <div className="hidden lg:block w-[300px] flex-shrink-0 border-l border-border bg-canvas/50">
                        <Toolbelt />
                    </div>
                )}
            </div>

            {/* Floating Action Button (Desktop Only) */}
            {!isMobile && <FloatingActionButton />}

            {/* Mobile Bottom Tab Navigation */}
            {isMobile && <MobileTabBar />}
        </div>
    );
}

