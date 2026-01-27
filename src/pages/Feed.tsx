"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamFeed } from "@/components/StreamFeed";
import { snippetsAPI, feedAPI, systemAPI, authAPI, usersAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Flame, Clock, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/useMediaQuery";
import SEO from "@/components/SeoMeta";
import localforage from "localforage";

type FeedBucket = 'trending' | 'new' | 'editor' | 'personal';

import { useDispatch, useSelector } from "react-redux";
import { setFeedBucket, setSearchQuery, setFeedFilter } from "@/store/slices/feedSlice";
import { RootState } from "@/store";

export default function Feed() {
    const isMobile = useIsMobile();
    const dispatch = useDispatch();

    // Select state from Redux
    const { viewBucket, searchQuery, filters } = useSelector((state: RootState) => state.feed);
    const bucket = viewBucket;
    const search = searchQuery;
    const language = filters.language;
    const type = filters.type;
    const difficulty = filters.difficulty;

    // Local cached snippets just for display smoothing
    const [cachedSnippets, setCachedSnippets] = useState<any[]>([]);

    // Helpers to dispatch actions
    const setBucket = (val: FeedBucket) => dispatch(setFeedBucket(val));
    const setSearch = (val: string) => dispatch(setSearchQuery(val));
    const setLanguage = (val: string) => dispatch(setFeedFilter({ key: 'language', value: val }));
    const setType = (val: string) => dispatch(setFeedFilter({ key: 'type', value: val }));
    const setDifficulty = (val: string) => dispatch(setFeedFilter({ key: 'difficulty', value: val }));

    // System Config
    const { data: systemData } = useQuery({
        queryKey: ['system-status'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5,
    });
    const settings = systemData?.settings || {};
    const bannerVisible = settings['system_banner_visible'] === 'true';
    const bannerTitle = settings['system_banner_title'];
    const bannerBadge = settings['system_banner_badge'];
    const bannerLink = settings['system_banner_link'];
    let bannerItems: string[] = [];
    try {
        if (settings['system_banner_content']) {
            bannerItems = JSON.parse(settings['system_banner_content']);
        }
    } catch (e) {
        bannerItems = [settings['system_banner_content']];
    }

    const [showBanner, setShowBanner] = useState(() => {
        // We key the dismissal by title so new banners reappear
        const key = `dismissed_banner_${settings['system_banner_title'] || 'v1'}`;
        // If it's valid title and not dismissed, show it
        return !!settings['system_banner_title'] && !localStorage.getItem(key);
    });

    // Update showBanner when settings load (if meaningful change)
    useEffect(() => {
        if (bannerVisible && bannerTitle) {
            const key = `dismissed_banner_${bannerTitle}`;
            if (!localStorage.getItem(key)) {
                setShowBanner(true);
            }
        }
    }, [bannerVisible, bannerTitle]);

    // Load from cache on mount
    useEffect(() => {
        const loadCache = async () => {
            const cached = await localforage.getItem(`feed_${bucket}`);
            if (cached) {
                setCachedSnippets(cached as any[]);
            }
        };
        loadCache();
    }, [bucket]);

    // Use Smart Feed API for bucket-based feeds
    const { data: feedData, isLoading: feedLoading } = useQuery({
        queryKey: ['feed', bucket],
        queryFn: async () => {
            try {
                const res = await feedAPI.get(bucket);
                if (res.snippets) {
                    await localforage.setItem(`feed_${bucket}`, res.snippets);
                }
                return res;
            } catch (err) {
                const cached = await localforage.getItem(`feed_${bucket}`);
                if (cached) return { snippets: cached, bucket };
                throw err;
            }
        },
        enabled: !search && language === 'all' && type === 'all' && difficulty === 'all',
    });

    // Use traditional search API when filters are active
    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ['snippets', search, language, type, difficulty],
        queryFn: () => snippetsAPI.getAll({
            search,
            ...(language !== 'all' ? { language } : {}),
            ...(type !== 'all' ? { type } : {}),
            ...(difficulty !== 'all' ? { difficulty } : {}),
        }),
        enabled: !!(search || language !== 'all' || type !== 'all' || difficulty !== 'all'),
    });

    const { data: userData, isLoading: userSnippetsLoading } = useQuery({
        queryKey: ['user-me-snippets'],
        queryFn: async () => {
            const me = await authAPI.me();
            const res = await usersAPI.getSnippets(me.user.id);
            return res.snippets;
        },
        enabled: bucket === 'personal'
    });

    const isFiltering = !!(search || language !== 'all' || type !== 'all' || difficulty !== 'all');
    let snippets = (isFiltering ? (searchData?.snippets || []) : (feedData?.snippets || cachedSnippets)) as any[];

    // Personalization logic: Mix in user snippets if 'personal'
    if (!isFiltering && bucket === 'personal') {
        snippets = userData || [];
    }
    const loading = isFiltering ? searchLoading : (bucket === 'personal' ? userSnippetsLoading : (feedLoading && cachedSnippets.length === 0));

    const tabs: { id: FeedBucket; label: string; icon: React.ReactNode }[] = [
        { id: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4" /> },
        { id: 'personal', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
        { id: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
        { id: 'editor', label: 'Editor Picks', icon: <Star className="h-4 w-4" /> },
    ];

    const isVaultKey = search.startsWith('VAULT-');

    return (
        <div className={cn(
            "min-h-full bg-canvas container max-w-[1800px] mx-auto",
            isMobile ? "py-4 px-0" : "py-8 px-4"
        )}>
            <SEO title="Live Feed" description="Discover trending code snippets and developer stories." />

            <AnimatePresence>
                {bannerVisible && showBanner && bannerTitle && (
                    <motion.div
                        key={bannerTitle}
                        initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                        exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                        className="overflow-hidden px-4"
                    >
                        <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-purple-500/10 border border-primary/20 shadow-2xl backdrop-blur-xl group overflow-hidden">
                            {/* Decorative Blobs */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-all duration-1000" />

                            <div className="relative flex flex-col md:flex-row items-center gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shrink-0">
                                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-xl font-black text-foreground mb-2 flex items-center gap-2 justify-center md:justify-start uppercase tracking-tight">
                                        {bannerTitle}
                                        {bannerBadge && (
                                            <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">{bannerBadge}</span>
                                        )}
                                    </h2>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        {bannerItems.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full",
                                                    idx % 3 === 0 ? "bg-emerald-500" : idx % 3 === 1 ? "bg-blue-500" : "bg-amber-500"
                                                )} />
                                                <span>{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {bannerLink && (
                                        <a
                                            href={bannerLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                                        >
                                            READ MORE
                                        </a>
                                    )}
                                    <button
                                        onClick={() => {
                                            setShowBanner(false);
                                            localStorage.setItem(`dismissed_banner_${bannerTitle}`, 'true');
                                        }}
                                        className={cn(
                                            "px-6 py-2.5 bg-card text-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm border border-border",
                                            bannerLink && "bg-transparent text-foreground border border-border hover:bg-muted"
                                        )}
                                    >
                                        GOT IT!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                {/* Main Feed Column - Full Width */}
                <div className="space-y-6">
                    {/* v1.3: Responsive Tab Navigation */}
                    {!isMobile && (
                        <div className="px-4">
                            <div className="flex items-center gap-2 p-1 bg-surface/50 rounded-xl border border-border/50 w-fit">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setBucket(tab.id)}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                            bucket === tab.id
                                                ? "bg-primary text-primary-foreground shadow-md"
                                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                        )}
                                    >
                                        {tab.icon}
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filter Bar */}
                    {!isMobile && (
                        <div className={cn(
                            "flex flex-col gap-4 bg-muted/30 rounded-xl border border-border shadow-sm backdrop-blur-sm p-4 md:flex-row items-center justify-between"
                        )}>
                            <div className="relative w-full md:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search snippets..."
                                    className={cn(
                                        "pl-10 h-10 text-sm bg-background border-border focus:border-primary/50 transition-all placeholder:text-muted-foreground/50 rounded-lg text-foreground font-mono",
                                        isVaultKey && "ring-2 ring-primary/50 text-primary font-bold"
                                    )}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                {isVaultKey && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2"
                                    >
                                        <Badge className="bg-primary text-primary-foreground text-[8px] animate-pulse">VAULT KEY DETECTED</Badge>
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="w-[110px] h-10 text-xs uppercase font-extrabold tracking-wider bg-background border-border text-foreground hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="ALGORITHM">Algo</SelectItem>
                                        <SelectItem value="UTILITY">Utility</SelectItem>
                                        <SelectItem value="EXAMPLE">Example</SelectItem>
                                        <SelectItem value="VISUAL">Visual</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={difficulty} onValueChange={setDifficulty}>
                                    <SelectTrigger className="w-[110px] h-10 text-xs uppercase font-extrabold tracking-wider bg-background border-border text-foreground hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Diff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Diff</SelectItem>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={language} onValueChange={setLanguage}>
                                    <SelectTrigger className="w-[120px] h-10 text-xs uppercase font-extrabold tracking-wider bg-background border-border text-foreground hover:border-primary/50 transition-colors">
                                        <SelectValue placeholder="Language" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Langs</SelectItem>
                                        <SelectItem value="javascript">JS</SelectItem>
                                        <SelectItem value="typescript">TS</SelectItem>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="go">Go</SelectItem>
                                        <SelectItem value="react">React</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {/* Feed Content */}
                    <div className="pb-20">
                        {snippets.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Flame className="h-8 w-8 text-primary/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No snippets yet</h3>
                                <p className="text-sm text-muted-foreground max-w-md mb-4">
                                    The feed is empty right now. Be the first to share a code snippet!
                                </p>
                                <p className="text-xs text-muted-foreground/60 max-w-sm mb-6">
                                    <strong>What happens next?</strong> When developers publish snippets, they'll appear here sorted by trending, new, or editor picks.
                                </p>
                                <a href="/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Create your first snippet →
                                </a>
                            </div>
                        ) : (
                            <StreamFeed snippets={snippets} loading={loading} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
