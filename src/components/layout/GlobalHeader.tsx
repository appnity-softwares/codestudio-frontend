import { Link, useLocation } from "react-router-dom";
import { Plus, Flame, Clock, Star, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileSidebar } from "./MobileSidebar";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setFeedBucket } from "@/store/slices/feedSlice";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";
import { NotificationBell } from "@/components/layout/NotificationBell";

type FeedBucket = 'trending' | 'new' | 'editor' | 'personal';

export function GlobalHeader() {
    const isMobile = useIsMobile();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const dispatch = useDispatch();
    const { viewBucket } = useSelector((state: RootState) => state.feed);

    const { data: systemData } = useQuery({
        queryKey: ['system-status'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5,
    });
    const settings = systemData?.settings || {};
    const showNotifications = settings['feature_notifications_enabled'] !== 'false'; // Default to true

    if (!isMobile) return null;

    const isFeedPage = location.pathname === '/feed' || location.pathname === '/';

    const tabs: { id: FeedBucket; label: string; icon: React.ReactNode }[] = [
        { id: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4" /> },
        { id: 'personal', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
        { id: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
        { id: 'editor', label: 'Editor Picks', icon: <Star className="h-4 w-4" /> },
    ];

    const currentTab = tabs.find(t => t.id === viewBucket) || tabs[0];

    // Routes where we should hide sidebars to maximize space
    const isArenaRoom = location.pathname.includes('/arena/env/') ||
        location.pathname.includes('/arena/official/') ||
        location.pathname.includes('/contest/') ||
        location.pathname.includes('/practice/') ||
        location.pathname === '/feedback';

    if (isArenaRoom) return null;

    return (
        <header className="sticky top-0 z-50 w-full bg-canvas/80 backdrop-blur-xl border-b border-border/50 px-3 h-16 flex items-center justify-between">
            <div className="flex items-center gap-1 flex-1">
                <MobileSidebar />

                {isFeedPage ? (
                    <Select value={viewBucket} onValueChange={(val) => dispatch(setFeedBucket(val as any))}>
                        <SelectTrigger className="border-none bg-transparent shadow-none p-0 h-auto focus:ring-0 w-auto gap-2">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-primary/10 rounded-lg">
                                    {currentTab.icon}
                                </div>
                                <span className="font-headline font-black text-lg tracking-tighter uppercase italic">
                                    {currentTab.label}
                                </span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            {tabs.map((tab) => (
                                <SelectItem key={tab.id} value={tab.id} className="font-bold">
                                    <div className="flex items-center gap-2">
                                        {tab.icon}
                                        <span>{tab.label}</span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="font-headline font-black text-lg tracking-tighter uppercase italic truncate max-w-[150px]">
                            {location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'Home'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-1">
                {showNotifications && (
                    <div className="mr-2">
                        <NotificationBell />
                    </div>
                )}

                {isAuthenticated ? (
                    <Link to="/create">
                        <Button variant="ghost" size="icon" className="h-10 w-10 bg-primary/10 text-primary rounded-xl border border-primary/20">
                            <Plus className="h-5 w-5" />
                        </Button>
                    </Link>
                ) : (
                    <Link to="/auth/signin">
                        <Button size="sm" className="rounded-xl px-4 text-xs font-bold">
                            LOGIN
                        </Button>
                    </Link>
                )}
            </div>
        </header>
    );
}
