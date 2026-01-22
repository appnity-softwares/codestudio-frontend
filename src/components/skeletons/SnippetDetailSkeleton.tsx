import { Skeleton } from "@/components/ui/skeleton";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

export function SnippetDetailSkeleton() {
    return (
        <div className="container max-w-6xl mx-auto py-6 px-4">
            <BreadcrumbSchema items={[
                { name: 'Home', item: '#' },
                { name: 'Snippets', item: '#' },
                { name: 'Loading...', item: '#' }
            ]} />

            <Skeleton className="h-8 w-16 mb-4" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-10 w-3/4" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                        </div>
                    </div>

                    {/* Tabs area */}
                    <div className="rounded-xl border border-white/10 overflow-hidden">
                        <div className="h-12 bg-muted/30 border-b border-white/10 flex items-center justify-between px-4">
                            <Skeleton className="h-8 w-40" />
                            <Skeleton className="h-8 w-24" />
                        </div>
                        <Skeleton className="h-[400px] w-full" />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Sidebar Author */}
                    <div className="p-4 rounded-xl border border-white/10 flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2 opacity-50" />
                        </div>
                    </div>

                    {/* Meta info */}
                    <div className="rounded-xl border border-white/10 p-6 space-y-6">
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-12" />
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-16" />
                                <Skeleton className="h-6 w-20" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
