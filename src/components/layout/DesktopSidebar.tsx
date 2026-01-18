import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { navSections } from '@/lib/nav-config';
import { ScrollArea } from '../ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

export function DesktopSidebar() {
    const location = useLocation();
    const pathname = location.pathname;
    const { user, isAuthenticated } = useAuth();
    const { width, setWidth, isCollapsed, setIsCollapsed } = useSidebar();
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Minimum and maximum width constraints
    const MIN_WIDTH = 80;
    const MAX_WIDTH = 320;
    const COLLAPSED_WIDTH = 80;

    const startResizing = useCallback(() => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent: MouseEvent) => {
            if (isResizing && sidebarRef.current) {
                const newWidth = mouseMoveEvent.clientX - sidebarRef.current.getBoundingClientRect().left;
                if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
                    setWidth(newWidth);
                    setIsCollapsed(false);
                }
            }
        },
        [isResizing, setWidth, setIsCollapsed]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    // Responsive width handling
    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth < 768;
            if (isMobile && !isCollapsed) {
                setWidth(COLLAPSED_WIDTH);
                setIsCollapsed(true);
            }
        };

        handleResize(); // Run on mount
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isCollapsed, setWidth, setIsCollapsed]);

    const toggleCollapse = () => {
        if (isCollapsed) {
            setWidth(240);
            setIsCollapsed(false);
        } else {
            setWidth(COLLAPSED_WIDTH);
            setIsCollapsed(true);
        }
    };

    const isSlim = width < 180;

    return (
        <motion.aside
            ref={sidebarRef}
            className="flex flex-col sticky top-16 h-[calc(100vh-4rem)] border-r glass-card shrink-0 group overflow-hidden"
            style={{ width: isCollapsed ? COLLAPSED_WIDTH : width }}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
            {/* Premium Resizer Handle with Glow */}
            <motion.div
                className="absolute right-0 top-0 w-1.5 h-full cursor-ew-resize z-50 flex items-center justify-center group/resizer"
                onMouseDown={startResizing}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}
            >
                <motion.div
                    className="w-[2px] h-12 bg-border rounded-full"
                    whileHover={{
                        backgroundColor: 'rgba(99, 102, 241, 0.5)',
                        boxShadow: '0 0 8px rgba(99, 102, 241, 0.5)'
                    }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>

            {/* Premium Collapse Toggle with Animation */}
            <div className={cn("flex items-center px-4 py-3 h-[60px] border-b border-border/40", isSlim ? "justify-center" : "justify-between")}>
                {!isSlim && (
                    <motion.div
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                            Navigation
                        </span>
                    </motion.div>
                )}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleCollapse}
                        className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 rounded-xl"
                    >
                        <AnimatePresence mode="wait">
                            {isCollapsed || isSlim ? (
                                <motion.div
                                    key="open"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <PanelLeftOpen className="h-5 w-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <PanelLeftClose className="h-5 w-5" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Button>
                </motion.div>
            </div>

            <ScrollArea className="flex-1">
                <nav className="grid items-start gap-4 p-4">
                    {navSections.map((section, sectionIndex) => {
                        const sectionHasVisibleItems = section.items.some(link => {
                            if (link.href.includes('[[username]]') && (!isAuthenticated || !user)) return false;
                            if ((link.label === 'Admin' || link.href === '/admin') && user?.role !== 'ADMIN') return false;
                            if ((link.label === 'Saved' || link.href === '/saved') && !isAuthenticated) return false;
                            if ((link.label === 'Dashboard' || link.href === '/dashboard/components') && !isAuthenticated) return false;
                            if ((link.label === 'Settings' || link.href === '/settings') && !isAuthenticated) return false;
                            if ((link.label === 'Profile') && !isAuthenticated) return false;
                            return true;
                        });

                        if (!sectionHasVisibleItems) return null;

                        return (
                            <motion.div
                                key={sectionIndex}
                                className="grid gap-1"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: sectionIndex * 0.1 }}
                            >
                                <AnimatePresence>
                                    {!isSlim && (
                                        <motion.h2
                                            className="px-2 text-xs font-bold tracking-wider text-muted-foreground/70 mb-2 uppercase"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {section.title}
                                        </motion.h2>
                                    )}
                                </AnimatePresence>
                                {section.items.map((link, linkIndex) => {
                                    const href = link.href.includes('[[username]]')
                                        ? (user?.username ? link.href.replace('[[username]]', user.username) : null)
                                        : link.href;

                                    if (!href) return null;
                                    if ((link.label === 'Admin' || link.href === '/admin') && user?.role !== 'ADMIN') return null;
                                    if ((link.label === 'Saved' || link.href === '/saved') && !isAuthenticated) return null;
                                    if ((link.label === 'Dashboard' || link.href === '/dashboard/components') && !isAuthenticated) return null;
                                    if ((link.label === 'Settings' || link.href === '/settings') && !isAuthenticated) return null;

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
                                                className={cn(
                                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all duration-300 relative overflow-hidden group/link',
                                                    'hover:text-primary hover:bg-primary/5',
                                                    isActive && 'text-primary bg-primary/10 font-medium shadow-sm',
                                                    isMarketplace && 'bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary',
                                                    isSlim ? 'flex-col justify-center px-2 py-3 text-center gap-1.5' : 'flex-row'
                                                )}
                                            >
                                                {isActive && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent"
                                                        layoutId="activeNav"
                                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                    />
                                                )}
                                                <Icon className={cn("shrink-0 relative z-10", isSlim ? "h-5 w-5" : "h-4 w-4")} />
                                                <AnimatePresence>
                                                    {isSlim ? (
                                                        <motion.span
                                                            className="text-[10px] truncate w-full font-medium relative z-10"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            {link.label}
                                                        </motion.span>
                                                    ) : (
                                                        <motion.span
                                                            className="flex-1 text-sm truncate font-medium relative z-10"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                        >
                                                            {link.label}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                                {SecondaryIcon && !isSlim && <SecondaryIcon className="h-4 w-4 opacity-70 relative z-10" />}
                                            </Link>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        );
                    })}
                </nav>
            </ScrollArea>
        </motion.aside>
    );
}

