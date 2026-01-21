import { useState, useEffect, useRef } from "react";
import { SnippetCard } from "./SnippetCard";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface StreamFeedProps {
    snippets: any[];
    loading?: boolean;
}

const ITEMS_PER_PAGE = 5;

export function StreamFeed({ snippets, loading }: StreamFeedProps) {
    const isMobile = useIsMobile();
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Reset visibility when snippets change (e.g. bucket switch)
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [snippets]);

    // Handle Infinite Scroll
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !loading) {
                    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, snippets.length));
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) {
            observer.observe(loadMoreRef.current);
        }

        return () => observer.disconnect();
    }, [snippets, loading]);

    const visibleSnippets = snippets.slice(0, visibleCount);
    const hasMore = visibleCount < snippets.length;

    if (loading) {
        return (
            <div className={cn(
                "mx-auto py-6 space-y-8",
                isMobile ? "w-full px-0" : "max-w-3xl px-4 md:px-0"
            )}>
                {/* Header Skeleton */}
                <div className="flex items-center justify-between px-1 mb-6">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                </div>

                {/* Card Skeletons */}
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={cn(
                        "w-full max-w-xl mx-auto space-y-4",
                        isMobile ? "px-0" : "px-4 sm:px-0"
                    )}>
                        {/* Fake Card Header */}
                        <div className="flex items-center justify-between px-4">
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-48" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                            <Skeleton className="h-5 w-16 rounded-md" />
                        </div>

                        {/* Fake Card Body */}
                        <Skeleton className={cn(
                            "w-full aspect-square",
                            isMobile ? "rounded-[1.5rem]" : "rounded-[2rem]"
                        )} />
                    </div>
                ))}
            </div>
        );
    }

    if (snippets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 border border-dashed border-white/10 rounded-3xl bg-surface/50">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-xl">⚡</span>
                </div>
                <h3 className="text-lg font-bold text-foreground font-headline mb-2">Initialize the Feed</h3>
                <p className="text-sm font-mono text-muted-foreground mb-6 text-center max-w-sm">
                    No verified snippets found in these parameters. Publish your first Code Snippet to broadcast it.
                </p>
                <a href="/create" className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full text-xs uppercase tracking-widest transition-colors shadow-lg shadow-primary/20">
                    Create Snippet
                </a>
            </div>
        );
    }

    return (
        <div className={cn(
            "mx-auto",
            isMobile ? "w-full px-0 py-0 space-y-0" : "max-w-3xl px-4 md:px-0 py-6 space-y-4"
        )}>
            {/* Feed Header */}
            <div className="flex items-center justify-between px-1 mb-6">
                <h1 className="text-sm font-bold font-mono text-primary uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-sm bg-indigo-500" />
                    Activity Stream
                </h1>
                <div className="text-[10px] font-mono text-muted-foreground">
                    LIVE • {snippets.length} ITEMS
                </div>
            </div>

            {/* List */}
            {visibleSnippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
            ))}

            {/* Load More Trigger */}
            {hasMore && (
                <div ref={loadMoreRef} className="py-10 flex justify-center">
                    <Button
                        variant="ghost"
                        className="group flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-all pb-8"
                        onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    >
                        <span className="text-[10px] font-mono uppercase tracking-[0.3em]">Load More Content</span>
                        <div className="h-10 w-[1px] bg-border group-hover:bg-primary transition-colors" />
                        <ChevronDown className="h-4 w-4 animate-bounce" />
                    </Button>
                </div>
            )}

            {/* End of Stream */}
            {!hasMore && (
                <div className="py-12 flex flex-col items-center opacity-30">
                    <div className="w-1 h-8 bg-border mb-2" />
                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                        End of Buffer
                    </div>
                </div>
            )}
        </div>
    );
}
