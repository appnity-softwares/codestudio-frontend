import { Outlet } from "react-router-dom";
import { Dock } from "./Dock";
import { Toolbelt } from "./Toolbelt";
import { FloatingActionButton } from "../FloatingActionButton";

export function DashboardLayout() {
    return (
        <div className="relative h-screen w-screen bg-canvas overflow-hidden selection:bg-primary/20 text-primary font-sans">
            {/* Decorative Background Grid with Mask */}
            <div className="absolute inset-0 bg-grid pointer-events-none" />

            {/* Main Layout Grid */}
            <div className="relative z-10 h-full w-full grid grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr_300px] overflow-hidden">
                {/* Column 1: Navigation Dock */}
                <Dock />

                {/* Column 2: Main Content Area (Scrollable) */}
                <main className="flex flex-col min-w-0 h-full overflow-hidden relative">
                    {/* Optional: We can add a sticky header here if needed for breadcrumbs */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <Outlet />
                    </div>
                </main>

                {/* Column 3: Context Toolbelt (Desktop Only) */}
                <Toolbelt />
            </div>

            {/* Floating Action Button */}
            <FloatingActionButton />
        </div>
    );
}
