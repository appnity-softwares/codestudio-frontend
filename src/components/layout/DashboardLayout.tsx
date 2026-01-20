import { Outlet } from "react-router-dom";
import { Dock } from "./Dock";
import { Toolbelt } from "./Toolbelt";
import { FloatingActionButton } from "../FloatingActionButton";

export function DashboardLayout() {
    return (
        <div className="relative h-screen w-screen bg-canvas overflow-hidden selection:bg-primary/20 text-primary font-sans">
            {/* Decorative Background Grid with Mask */}
            <div className="absolute inset-0 bg-grid pointer-events-none" />

            {/* Main Layout Flexbox */}
            <div className="relative z-10 h-full w-full flex overflow-hidden">
                {/* Column 1: Navigation Dock (Sidebar) */}
                <Dock />

                {/* Column 2: Main Content Area (Scrollable) */}
                <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
                    {/* Optional: We can add a sticky header here if needed for breadcrumbs */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <Outlet />
                    </div>
                </main>

                {/* Column 3: Context Toolbelt (Desktop Only) */}
                <div className="hidden lg:block w-[300px] flex-shrink-0 border-l border-border bg-canvas/50">
                    <Toolbelt />
                </div>
            </div>

            {/* Floating Action Button */}
            <FloatingActionButton />
        </div>
    );
}
