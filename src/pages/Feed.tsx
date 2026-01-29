import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamFeed } from "@/components/StreamFeed";
import { feedAPI } from "@/lib/api";
import { Flame, Clock, Star, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";
import SEO from "@/components/SeoMeta";
import localforage from "localforage";

type FeedBucket = 'trending' | 'new' | 'editor' | 'personal';

import { useDispatch, useSelector } from "react-redux";
import { setFeedBucket } from "@/store/slices/feedSlice";
import { RootState } from "@/store";

export default function Feed() {
    const isMobile = useIsMobile();
    const dispatch = useDispatch();

    // Select state from Redux
    const { viewBucket } = useSelector((state: RootState) => state.feed);
    const bucket = viewBucket;

    // Local cached snippets just for display smoothing
    const [cachedSnippets, setCachedSnippets] = useState<any[]>([]);

    // Helpers to dispatch actions
    const setBucket = (val: FeedBucket) => dispatch(setFeedBucket(val));

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
    });

    let snippets = (feedData?.snippets || cachedSnippets) as any[];
    const loading = (feedLoading && cachedSnippets.length === 0);

    const tabs: { id: FeedBucket; label: string; icon: React.ReactNode }[] = [
        { id: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4" /> },
        { id: 'personal', label: 'For You', icon: <Sparkles className="h-4 w-4" /> },
        { id: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
        { id: 'editor', label: 'Editor Picks', icon: <Star className="h-4 w-4" /> },
    ];

    return (
        <div className={cn(
            "min-h-full bg-canvas container max-w-[1800px] mx-auto",
            isMobile ? "py-4 px-0" : "py-8 px-4"
        )}>
            <SEO title="Live Feed" description="Discover trending code snippets and developer stories." />



            <div className="space-y-4 md:space-y-6">
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
