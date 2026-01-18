import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { DesktopSidebar } from "./DesktopSidebar"
import { MobileBottomNav } from "./MobileBottomNav"
import { SidebarProvider } from "@/context/SidebarContext"
import DarkVeil from "../DarkVeil"
import SplashCursor from "../SplashCursor"

export function Layout() {
    return (
        <SidebarProvider>
            <div className="relative min-h-screen flex flex-col bg-background">
                {/* Background Animation */}
                <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                    <DarkVeil hueShift={20} speed={0.2} warpAmount={0.3} />
                </div>

                {/* Cursor Effect */}
                <SplashCursor />

                <div className="relative z-10 flex flex-col min-h-screen w-full">
                    <Header />
                    <div className="flex-1 flex w-full relative overflow-hidden">
                        <DesktopSidebar />
                        <main className="flex-1 py-6 px-4 md:px-8 min-w-0 overflow-y-auto">
                            <Outlet />
                        </main>
                    </div>
                    <MobileBottomNav />
                </div>
            </div>
        </SidebarProvider>
    )
}
