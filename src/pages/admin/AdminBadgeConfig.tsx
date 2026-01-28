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
    const badgeConfigRaw = settings["sidebar_badges"] || "[]";
    let badgeConfig: string[] = [];
    try {
        badgeConfig = JSON.parse(badgeConfigRaw);
    } catch (e) {
        badgeConfig = [];
    }

    const toggleBadge = (href: string) => {
        let newConfig: string[];
        if (badgeConfig.includes(href)) {
            newConfig = badgeConfig.filter(h => h !== href);
        } else {
            newConfig = [...badgeConfig, href];
        }
        updateMutation.mutate({ key: "sidebar_badges", value: JSON.stringify(newConfig) });
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
                        <p className="text-muted-foreground font-medium text-sm">Select which navigation items should display the 'NEW' badge.</p>
                    </div>
                </div>
            </div>

            <Card className="border-blue-500/20 bg-blue-500/5 shadow-none p-4 rounded-2xl flex items-start gap-4">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700/80 font-medium">
                    This setting allows you to highlight specific features to users.
                    The 'NEW' badge will appear next to the item in the main application sidebar.
                </p>
            </Card>

            <div className="grid gap-4">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2 px-1">Main Application Sidebar</div>
                {navConfig.map((item) => {
                    const hasBadge = badgeConfig.includes(item.href);
                    return (
                        <div
                            key={item.href}
                            className={cn(
                                "group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                                hasBadge
                                    ? "bg-primary/5 border-primary/30 shadow-lg shadow-primary/5"
                                    : "bg-card border-border hover:border-primary/20"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center text-xl transition-all",
                                    hasBadge ? "bg-primary text-white scale-110" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                )}>
                                    <Sparkles className={cn("h-5 w-5", hasBadge ? "animate-pulse" : "opacity-30")} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{item.title}</h3>
                                    <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">
                                        {item.href}
                                    </code>
                                </div>
                            </div>

                            <Button
                                variant={hasBadge ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleBadge(item.href)}
                                className={cn(
                                    "rounded-xl font-bold px-6",
                                    hasBadge ? "shadow-lg shadow-primary/30" : ""
                                )}
                            >
                                {hasBadge ? "Remove Badge" : "Show Badge"}
                            </Button>
                        </div>
                    );
                })}

                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-8 mb-2 px-1">Admin Sidebar Items</div>
                {[
                    { title: "Dashboard", href: "/admin" },
                    { title: "Users", href: "/admin/users" },
                    { title: "Snippets", href: "/admin/snippets" },
                    { title: "Roadmaps", href: "/admin/roadmaps" },
                    { title: "Practice", href: "/admin/practice-problems" },
                    { title: "Contests", href: "/admin/contests" },
                    { title: "Submissions", href: "/admin/submissions" },
                    { title: "System", href: "/admin/system" },
                    { title: "Changelog", href: "/admin/changelog" },
                ].map((item) => {
                    const hasBadge = badgeConfig.includes(item.href);
                    return (
                        <div
                            key={item.href}
                            className={cn(
                                "group p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between",
                                hasBadge
                                    ? "bg-emerald-500/5 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                                    : "bg-card border-border hover:border-emerald-500/20"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "h-12 w-12 rounded-xl flex items-center justify-center text-xl transition-all",
                                    hasBadge ? "bg-emerald-500 text-white scale-110" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                                )}>
                                    <Sparkles className={cn("h-5 w-5", hasBadge ? "animate-pulse" : "opacity-30")} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-foreground">{item.title}</h3>
                                    <code className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded uppercase font-mono tracking-tighter">
                                        {item.href}
                                    </code>
                                </div>
                            </div>

                            <Button
                                variant={hasBadge ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleBadge(item.href)}
                                className={cn(
                                    "rounded-xl font-bold px-6",
                                    hasBadge ? "bg-emerald-500 hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/30 text-white" : ""
                                )}
                            >
                                {hasBadge ? "Remove Badge" : "Show Badge"}
                            </Button>
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
