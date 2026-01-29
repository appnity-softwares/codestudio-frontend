import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Info, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { navConfig } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default function AdminBadgeConfig() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["admin-system-settings"],
        queryFn: () => adminAPI.getSystemSettings(),
    });

    const updateMutation = useMutation({
        mutationFn: (data: { key: string; value: string }) =>
            adminAPI.updateSystemSettings(data.key, data.value),
        onSuccess: () => {
            toast({ title: "Configuration Saved", description: "Sidebar badges have been updated." });
            queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const settings = settingsData?.settings || {};
    const badgeConfigRaw = settings["dock_badges"] || "{}";
    let badgeConfig: Record<string, string> = {};
    try {
        badgeConfig = JSON.parse(badgeConfigRaw);
    } catch (e) {
        badgeConfig = {};
    }

    const updateBadge = (href: string, text: string) => {
        const newConfig = { ...badgeConfig };
        if (text.trim() === "") {
            delete newConfig[href];
        } else {
            newConfig[href] = text.trim();
        }
        updateMutation.mutate({ key: "dock_badges", value: JSON.stringify(newConfig) });
    };

    if (isLoading) return <div className="p-10 text-center">Loading configuration...</div>;

    return (
        <div className="space-y-8 max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-headline">Sidebar Badge Control</h1>
                        <p className="text-muted-foreground font-medium text-sm">Customize 'NEW', 'HOT', or 'BETA' badges for sidebar items.</p>
                    </div>
                </div>
            </div>

            <Card className="border-blue-500/20 bg-blue-500/5 shadow-none p-4 rounded-2xl flex items-start gap-4">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700/80 font-medium">
                    Enter text (e.g. "NEW", "HOT", "BETA") to display a badge. Clear the text to remove the badge.
                </p>
            </Card>

            <div className="grid gap-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 px-1">Navigation Items</div>
                {navConfig.map((item) => {
                    const currentBadge = badgeConfig[item.href] || "";
                    return (
                        <div
                            key={item.href}
                            className={cn(
                                "group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                                currentBadge
                                    ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                                    : "bg-card border-border hover:border-primary/20"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center text-xl transition-all",
                                    currentBadge ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                )}>
                                    <Sparkles className={cn("h-5 w-5", currentBadge ? "animate-pulse" : "opacity-30")} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground flex items-center gap-2">
                                        {item.title}
                                        {currentBadge && (
                                            <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded uppercase font-black">
                                                {currentBadge}
                                            </span>
                                        )}
                                    </h3>
                                    <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">
                                        {item.href}
                                    </code>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => updateBadge(item.href, "NEW")} className="text-[10px]">Pre: NEW</Button>
                                <Button size="sm" variant="outline" onClick={() => updateBadge(item.href, "HOT")} className="text-[10px]">Pre: HOT</Button>
                                <div className="h-8 w-[1px] bg-border mx-1"></div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Custom..."
                                        className="h-9 w-24 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        defaultValue={currentBadge}
                                        onBlur={(e) => updateBadge(item.href, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                updateBadge(item.href, e.currentTarget.value);
                                            }
                                        }}
                                    />
                                    {currentBadge && (
                                        <Button size="sm" variant="ghost" className="h-9 px-2 text-destructive hover:text-destructive" onClick={() => updateBadge(item.href, "")}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-8 border-t border-border flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="rounded-xl mr-auto gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to System
                </Button>
            </div>
        </div>
    );
}
