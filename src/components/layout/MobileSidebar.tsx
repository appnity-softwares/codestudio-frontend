"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { navSections } from "@/lib/nav-config"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Code, Menu, X, Sparkles } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useSidebar } from "@/context/SidebarContext"
import { useQuery } from "@tanstack/react-query"
import { systemAPI } from "@/lib/api"

export function MobileSidebar() {
    const [open, setOpen] = useState(false)
    const location = useLocation()
    const pathname = location.pathname
    const { user, isAuthenticated } = useAuth();
    useSidebar(); // unused but keeping hook to ensure context exists

    // Items already in MobileTabBar to filter out
    const bottomNavPaths = ['/feed', '/arena', '/community', '/messages', '/profile'];

    const { data: systemData } = useQuery({
        queryKey: ['system-status'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5,
    });
    const settings = systemData?.settings || {};
    const badgeConfigRaw = settings['sidebar_badges'] || '[]';
    let badgeConfig: string[] = [];
    try {
        badgeConfig = JSON.parse(badgeConfigRaw);
    } catch (e) {
        badgeConfig = [];
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="ghost"
                        className="mr-2 px-2 text-base hover:bg-primary/10 focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 transition-all duration-300 rounded-xl"
                    >
                        <AnimatePresence mode="wait">
                            {open ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <X className="h-5 w-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="menu"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Menu className="h-5 w-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <span className="sr-only">Toggle Menu</span>
                    </Button>
                </motion.div>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0 glass-card border-r-0">
                <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Access platform tools and settings</SheetDescription>
                </SheetHeader>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-bold text-lg mb-6 group"
                        onClick={() => setOpen(false)}
                    >
                        <motion.div
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Code className="w-6 h-6 text-primary" />
                        </motion.div>
                        <h1 className="font-headline bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            CodeStudio
                        </h1>
                        <Sparkles className="w-4 h-4 text-primary ml-auto" />
                    </Link>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-120px)] pr-4 no-scrollbar">
                        {navSections.map((section: any, sectionIndex: number) => {
                            const filteredItems = section.items.filter((link: any) => {
                                // Filter out items already in bottom nav
                                if (bottomNavPaths.some(p => link.href.startsWith(p))) return false;

                                // Standard permission checks
                                if (link.href.includes('[[username]]') && (!isAuthenticated || !user)) return false;
                                if ((link.label === 'Admin' || link.href === '/admin') && user?.role !== 'ADMIN') return false;
                                if ((link.label === 'Saved' || link.href === '/saved') && !isAuthenticated) return false;
                                if ((link.label === 'Dashboard' || link.href === '/dashboard/components') && !isAuthenticated) return false;
                                if ((link.label === 'Settings' || link.href === '/settings') && !isAuthenticated) return false;
                                if ((link.label === 'Profile') && !isAuthenticated) return false;
                                return true;
                            });

                            if (filteredItems.length === 0) {
                                return null;
                            }

                            return (
                                <motion.div
                                    key={section.title}
                                    className="flex flex-col gap-1"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: sectionIndex * 0.1 }}
                                >
                                    <h2 className="text-xs font-bold tracking-wider text-muted-foreground/70 px-3 mb-1 uppercase">
                                        {section.title}
                                    </h2>
                                    {filteredItems.map((link: any, linkIndex: number) => {
                                        const href = link.href.includes('[[username]]')
                                            ? (user?.username ? link.href.replace('[[username]]', user.username) : null)
                                            : link.href;

                                        if (!href) return null;

                                        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                                        const isMarketplace = link.label === 'Marketplace';
                                        const Icon = link.icon;
                                        const SecondaryIcon = (link as any).secondaryIcon;

                                        return (
                                            <motion.div
                                                key={link.href}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: (sectionIndex * 0.1) + (linkIndex * 0.05) }}
                                                whileHover={{ x: 4 }}
                                            >
                                                <Link
                                                    to={href}
                                                    onClick={() => setOpen(false)}
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-300 relative overflow-hidden',
                                                        'hover:text-primary hover:bg-primary/5',
                                                        isActive && 'text-primary bg-primary/10 font-medium shadow-sm',
                                                        isMarketplace && 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary'
                                                    )}
                                                >
                                                    {isActive && (
                                                        <motion.div
                                                            className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                                                            layoutId="activeMobileNav"
                                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                        />
                                                    )}
                                                    <Icon className="h-4 w-4 relative z-10" />
                                                    <span className="flex-1 text-sm font-medium relative z-10">{link.label}</span>
                                                    {badgeConfig.includes(href) && (
                                                        <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] font-black uppercase tracking-tighter animate-pulse border border-primary/20">
                                                            New
                                                        </span>
                                                    )}
                                                    {SecondaryIcon && <SecondaryIcon className="h-4 w-4 relative z-10" />}
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </motion.div>
                            )
                        })}
                    </div>
                </motion.div>
            </SheetContent>
        </Sheet>
    )
}
