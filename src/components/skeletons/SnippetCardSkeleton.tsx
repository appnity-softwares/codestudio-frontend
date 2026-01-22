import { Skeleton } from "@/components/ui/skeleton";

export function SnippetCardSkeleton() {
    return (
        <div className="w-full max-w-xl mx-auto mb-10 px-4 sm:px-0">
            <div className="bg-[#121214] border border-white/10 rounded-[1.5rem] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-white/[0.04]">
                    <div className="flex items-start justify-between">
                        <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-2 w-2 rounded-full" />
                                <Skeleton className="h-6 w-3/4" />
                            </div>
                            <Skeleton className="h-4 w-full opacity-50" />
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                            <Skeleton className="h-5 w-16" />
                            <Skeleton className="h-5 w-12" />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="relative w-full h-[320px] sm:h-[400px] bg-black/50">
                    <Skeleton className="h-full w-full" />

                    {/* Controls Placeholder */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <Skeleton className="h-10 w-48 rounded-full" />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-white/[0.02] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-2 w-16" />
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>
            </div>
        </div>
    );
}
