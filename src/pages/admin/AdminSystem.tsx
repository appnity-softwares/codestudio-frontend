import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Power, AlertTriangle, CheckCircle, RefreshCw, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminSystem() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch system settings
    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["admin-system-settings"],
        queryFn: () => adminAPI.getSystemSettings(),
    });

    // Update setting mutation
    const updateMutation = useMutation({
        mutationFn: (data: { key: string; value: string }) =>
            adminAPI.updateSystemSettings(data.key, data.value),
        onSuccess: (_, variables) => {
            toast({ title: "Setting Updated", description: `${variables.key} has been updated.` });
            queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Redeploy Mutation
    const redeployMutation = useMutation({
        mutationFn: (mode: string) => adminAPI.triggerRedeploy(mode),
        onSuccess: (data) => {
            toast({ title: "Deployment Triggered", description: data.message });
        },
        onError: (error: any) => {
            toast({ title: "Deployment Error", description: error.message, variant: "destructive" });
        },
    });

    const settings = settingsData?.settings || {};

    const toggleSetting = (key: string) => {
        const currentValue = settings[key] === "true";
        updateMutation.mutate({ key, value: (!currentValue).toString() });
    };

    const isEnabled = (key: string) => settings[key] === "true";

    const settingItems = [
        {
            key: "maintenance_mode",
            title: "Maintenance Mode",
            description: "When enabled, only admins can access the platform. Users see a maintenance message.",
            icon: Power,
            dangerous: true,
        },
        {
            key: "submissions_enabled",
            title: "Submissions Enabled",
            description: "Allow users to submit solutions to contest problems.",
            icon: CheckCircle,
            dangerous: false,
        },
        {
            key: "snippets_enabled",
            title: "Snippet Creation",
            description: "Allow users to create and share code snippets.",
            icon: CheckCircle,
            dangerous: false,
        },
        {
            key: "contests_enabled",
            title: "Contests Active",
            description: "Enable contest participation and registration.",
            icon: CheckCircle,
            dangerous: false,
        },
        {
            key: "registration_open",
            title: "User Registration",
            description: "Allow new users to sign up for accounts.",
            icon: CheckCircle,
            dangerous: false,
        },
    ];

    // Feature Toggles
    const featureItems = [
        {
            key: "feature_sidebar_xp_store",
            title: "XP Store Sidebar",
            description: "Show the XP Store in the main sidebar.",
            icon: CheckCircle
        },
        {
            key: "feature_sidebar_trophy_room",
            title: "Trophy Room Sidebar",
            description: "Show the Trophy Room in the main sidebar.",
            icon: CheckCircle
        },
        {
            key: "feature_sidebar_practice",
            title: "Practice Sidebar",
            description: "Show Practice Challenges in the main sidebar.",
            icon: CheckCircle
        },
        {
            key: "feature_sidebar_feedback",
            title: "Feedback Sidebar",
            description: "Show Feedback Wall in the main sidebar.",
            icon: CheckCircle
        },
        {
            key: "feature_sidebar_roadmaps",
            title: "Roadmaps Sidebar",
            description: "Show Roadmaps in the main sidebar.",
            icon: CheckCircle
        },
        {
            key: "feature_sidebar_community",
            title: "Community Sidebar",
            description: "Show Community/Discover in the main sidebar.",
            icon: CheckCircle
        },
        {
            key: "feature_interface_engine",
            title: "Interface Engine",
            description: "Enable the theme switcher/customizer in the Toolbelt.",
            icon: CheckCircle
        }
    ];

    // Helper Component for the Redesigned UX
    const SystemToggleCard = ({ item, enabled, onToggle, isPending, children }: { item: any, enabled: boolean, onToggle: () => void, isPending: boolean, children?: React.ReactNode }) => {
        let statusColor = "text-muted-foreground";
        let statusBg = "bg-muted";
        let borderColor = "border-border";
        let cardBg = "bg-card";

        if (enabled) {
            if (item.dangerous) {
                statusColor = "text-red-500";
                statusBg = "bg-red-500/10";
                borderColor = "border-red-500/30";
                cardBg = "bg-red-500/5";
            } else {
                statusColor = "text-emerald-500";
                statusBg = "bg-emerald-500/10";
                borderColor = "border-emerald-500/30";
                cardBg = "bg-emerald-500/5";
            }
        }

        return (
            <div className={cn("rounded-2xl border transition-all duration-300 overflow-hidden", borderColor, cardBg)}>
                <div className="p-6 flex flex-col sm:flex-row items-start justify-between gap-6">
                    <div className="flex gap-5">
                        <div className={cn("shrink-0 p-3 rounded-xl flex items-center justify-center", statusBg)}>
                            <item.icon className={cn("h-6 w-6", statusColor)} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                                {item.description}
                            </p>
                            <div className="pt-2 flex items-center gap-2">
                                <div className={cn("h-2 w-2 rounded-full animate-pulse", enabled ? (item.dangerous ? "bg-red-500" : "bg-emerald-500") : "bg-stone-400")} />
                                <span className={cn("text-[10px] uppercase font-black tracking-widest", statusColor)}>
                                    {enabled ? "System Active" : "System Disabled"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                        <div className="flex items-center gap-3 bg-background/50 p-1.5 rounded-full border border-border/50 backdrop-blur-sm">
                            <span className={cn("text-[10px] font-bold uppercase transition-colors px-2", !enabled ? "text-muted-foreground" : "text-muted-foreground/30")}>
                                Off
                            </span>
                            <Switch
                                checked={enabled}
                                onCheckedChange={onToggle}
                                disabled={isPending}
                                className={cn(
                                    "data-[state=checked]:bg-primary",
                                    enabled && item.dangerous && "data-[state=checked]:bg-red-500",
                                    enabled && !item.dangerous && "data-[state=checked]:bg-emerald-500"
                                )}
                            />
                            <span className={cn("text-[10px] font-bold uppercase transition-colors px-2", enabled ? (item.dangerous ? "text-red-500" : "text-emerald-500") : "text-muted-foreground/30")}>
                                On
                            </span>
                        </div>
                    </div>
                </div>
                {children && <div className="border-t border-border/10 bg-background/20 px-6 py-4">{children}</div>}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading system settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center gap-3 border-b border-border pb-6">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Settings className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-black font-headline">System Controls</h1>
                    <p className="text-muted-foreground font-medium text-sm">Manage global configurations and feature flags.</p>
                </div>
            </div>

            {/* System Manual Access */}
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20 shadow-sm rounded-2xl overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                            <BookOpen className="h-5 w-5 text-indigo-500" />
                            System Manual & Documentation
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Access the comprehensive guide on platform features, XP system, and administration.
                        </p>
                    </div>
                    <Button onClick={() => window.open('/help', '_blank')} variant="secondary" className="gap-2 bg-background hover:bg-muted rounded-xl font-bold">
                        Open Manual <ExternalLink className="h-4 w-4" />
                    </Button>
                </div>
            </Card>

            {/* Deployment Zone */}
            <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" /> Deployment Operations
                </h2>
                <Card className="border-blue-500/20 bg-blue-500/5 shadow-none group">
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 border border-border/50 rounded-2xl bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm">Frontend Layer</span>
                                    <span className="text-[9px] uppercase font-black bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">React</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">Pulls latest code, builds dist, and updates assets.</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-auto rounded-xl font-bold"
                                    onClick={() => {
                                        if (confirm("Redeploy Frontend? This takes ~2 mins.")) redeployMutation.mutate("frontend");
                                    }}
                                    disabled={redeployMutation.isPending}
                                >
                                    {redeployMutation.isPending ? "Deploying..." : "Update Frontend"}
                                </Button>
                            </div>

                            <div className="p-5 border border-border/50 rounded-2xl bg-card flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm">Backend Layer</span>
                                    <span className="text-[9px] uppercase font-black bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">Go API</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">Pulls code, recompiles binary, and restarts service.</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-auto rounded-xl font-bold"
                                    onClick={() => {
                                        if (confirm("Redeploy Backend? Service will restart.")) redeployMutation.mutate("backend");
                                    }}
                                    disabled={redeployMutation.isPending}
                                >
                                    {redeployMutation.isPending ? "Deploying..." : "Update Backend"}
                                </Button>
                            </div>

                            <div className="p-5 border border-blue-500/30 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent flex flex-col gap-4 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-sm text-blue-500">Full Pipeline</span>
                                    <span className="text-[9px] uppercase font-black bg-blue-500 text-white px-2 py-0.5 rounded-full">All</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">Complete system synchronization and rebuild.</p>
                                <Button
                                    size="sm"
                                    className="w-full mt-auto bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-500/20"
                                    onClick={() => {
                                        if (confirm("Perform Full Redeploy? This will briefly interrupt service.")) redeployMutation.mutate("all");
                                    }}
                                    disabled={redeployMutation.isPending}
                                >
                                    {redeployMutation.isPending ? "Deploying..." : "Reference Full Redeploy"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-start">
                <div className="space-y-4">
                    <h2 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Power className="h-4 w-4" /> Core Availability
                    </h2>
                    <div className="space-y-4">
                        {settingItems.map((item) => (
                            <SystemToggleCard
                                key={item.key}
                                item={item}
                                enabled={isEnabled(item.key)}
                                onToggle={() => toggleSetting(item.key)}
                                isPending={updateMutation.isPending}
                            >
                                {item.key === "maintenance_mode" && isEnabled("maintenance_mode") && (
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-xs font-bold uppercase tracking-widest text-red-500 ml-1">Estimated Return Time (ETA)</label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="e.g. 20 Minutes, 2:30 PM"
                                                    defaultValue={settings["maintenance_eta"] || ""}
                                                    className="bg-card border-red-200 dark:border-red-900"
                                                    onBlur={(e) => {
                                                        if (e.target.value !== settings["maintenance_eta"]) {
                                                            updateMutation.mutate({ key: "maintenance_eta", value: e.target.value });
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => updateMutation.mutate({ key: "maintenance_eta", value: "Fixed Soon" })}
                                                >
                                                    Reset
                                                </Button>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium italic">This message will be broadcast to all users trying to access protected routes.</p>
                                        </div>
                                    </div>
                                )}
                            </SystemToggleCard>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" /> Feature Flags
                    </h2>
                    <div className="space-y-4">
                        {featureItems.map((item) => (
                            <SystemToggleCard
                                key={item.key}
                                item={item}
                                enabled={isEnabled(item.key)}
                                onToggle={() => toggleSetting(item.key)}
                                isPending={updateMutation.isPending}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* System Announcement Banner */}
            <div className="space-y-4">
                <h2 className="text-lg font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" /> Broadcast System
                </h2>
                <SystemToggleCard
                    item={{
                        key: "system_banner_visible",
                        title: "Global Announcement Banner",
                        description: "Injects a high-visibility alert at the top of the feed and dashboard for all users.",
                        icon: AlertTriangle
                    }}
                    enabled={isEnabled("system_banner_visible")}
                    onToggle={() => toggleSetting("system_banner_visible")}
                    isPending={updateMutation.isPending}
                >
                    {isEnabled("system_banner_visible") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                                <Input
                                    defaultValue={settings["system_banner_title"] || ""}
                                    placeholder="e.g. MAINTENANCE SCHEDULED"
                                    className="bg-background"
                                    onBlur={(e) => {
                                        if (e.target.value !== settings["system_banner_title"]) {
                                            updateMutation.mutate({ key: "system_banner_title", value: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badge (Optional)</label>
                                <Input
                                    defaultValue={settings["system_banner_badge"] || ""}
                                    placeholder="e.g. URGENT"
                                    className="bg-background"
                                    onBlur={(e) => {
                                        if (e.target.value !== settings["system_banner_badge"]) {
                                            updateMutation.mutate({ key: "system_banner_badge", value: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2 col-span-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content Bullets (JSON)</label>
                                <Input
                                    defaultValue={settings["system_banner_content"] || ""}
                                    placeholder='e.g. ["Servers restarting at 2PM", "Save your work"]'
                                    className="font-mono text-xs bg-background"
                                    onBlur={(e) => {
                                        if (e.target.value !== settings["system_banner_content"]) {
                                            updateMutation.mutate({ key: "system_banner_content", value: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </SystemToggleCard>
            </div>

            {/* Danger Zone */}
            <div className="pt-8 mt-8 border-t border-border">
                <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader>
                        <CardTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" /> Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible or high-impact system actions. Proceed with caution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-background/50 backdrop-blur-sm">
                            <div>
                                <p className="font-bold text-foreground">Emergency Lockdown Protocol</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Instantly revokes access for all non-admin users. Use only during security breaches.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                className="font-bold shadow-lg shadow-red-500/20"
                                onClick={() => {
                                    if (confirm("Are you sure? This will lock out ALL non-admin users.")) {
                                        updateMutation.mutate({ key: "maintenance_mode", value: "true" });
                                    }
                                }}
                                disabled={isEnabled("maintenance_mode") || updateMutation.isPending}
                            >
                                {isEnabled("maintenance_mode") ? "Lockdown Active" : "Initiate Lockdown"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
