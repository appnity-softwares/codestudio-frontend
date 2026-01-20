import { SnippetCard } from "./SnippetCard";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StreamFeedProps {
    snippets: any[];
    loading?: boolean;
}

export function StreamFeed({ snippets, loading }: StreamFeedProps) {
    const isMobile = useIsMobile();

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
            {snippets.map((snippet) => (
                <SnippetCard key={snippet.id} snippet={snippet} />
            ))}

            {/* End of Stream */}
            <div className="py-12 flex flex-col items-center opacity-30">
                <div className="w-1 h-8 bg-border mb-2" />
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
                    End of Buffer
                </div>
            </div>
        </div>
    );
}
