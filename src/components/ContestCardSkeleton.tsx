
import { Card } from "@/components/ui/card";

export function ContestCardSkeleton() {
    return (
        <Card className="col-span-full border-l-4 border-l-muted border-border/50 bg-muted/5 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-center">
                <div className="flex-1 p-6 space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-5 w-20 bg-muted rounded-full" />
                        <div className="h-5 w-16 bg-muted rounded-full" />
                    </div>

                    <div className="space-y-2">
                        <div className="h-8 w-3/4 bg-muted rounded-lg" />
                        <div className="h-4 w-1/2 bg-muted rounded-md" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-1">
                                <div className="h-3 w-16 bg-muted rounded" />
                                <div className="h-5 w-24 bg-muted rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:border-l border-t md:border-t-0 md:w-[280px] flex flex-col justify-center space-y-4 bg-muted/5">
                    <div className="h-10 w-full bg-muted rounded-lg" />
                    <div className="h-10 w-full bg-muted rounded-lg" />
                </div>
            </div>
        </Card>
    );
}
