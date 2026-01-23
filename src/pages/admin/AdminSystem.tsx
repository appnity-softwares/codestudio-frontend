import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Power, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading system settings...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Settings className="h-6 w-6" />
                <h1 className="text-2xl font-bold">System Controls</h1>
            </div>

            {/* Deployment Zone */}
            <Card className="border-blue-200 dark:border-blue-900">
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-blue-500" />
                        <CardTitle>System Updates</CardTitle>
                    </div>
                    <CardDescription>
                        Trigger deployment scripts on the server. Requires VPS setup.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 border rounded-lg bg-card/50 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">Frontend</span>
                                <span className="text-[10px] uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">React</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Pulls latest code, builds dist, and updates assets.</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-auto"
                                onClick={() => {
                                    if (confirm("Redeploy Frontend? This takes ~2 mins.")) {
                                        redeployMutation.mutate("frontend");
                                    }
                                }}
                                disabled={redeployMutation.isPending}
                            >
                                {redeployMutation.isPending ? "Deploying..." : "Update Frontend"}
                            </Button>
                        </div>

                        <div className="p-4 border rounded-lg bg-card/50 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm">Backend</span>
                                <span className="text-[10px] uppercase bg-secondary px-2 py-0.5 rounded text-muted-foreground">Go API</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Pulls code, recompiles binary, and restarts service.</p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="w-full mt-auto"
                                onClick={() => {
                                    if (confirm("Redeploy Backend? Service will restart.")) {
                                        redeployMutation.mutate("backend");
                                    }
                                }}
                                disabled={redeployMutation.isPending}
                            >
                                {redeployMutation.isPending ? "Deploying..." : "Update Backend"}
                            </Button>
                        </div>

                        <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-200/20 flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="font-semibold text-sm text-blue-400">Full System</span>
                                <span className="text-[10px] uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded">All</span>
                            </div>
                            <p className="text-xs text-muted-foreground">Full stack update. Updates both frontend and backend.</p>
                            <Button
                                size="sm"
                                className="w-full mt-auto bg-blue-600 hover:bg-blue-700"
                                onClick={() => {
                                    if (confirm("Perform Full Redeploy? This will briefly interrupt service.")) {
                                        redeployMutation.mutate("all");
                                    }
                                }}
                                disabled={redeployMutation.isPending}
                            >
                                {redeployMutation.isPending ? "Deploying..." : "Full Redeploy"}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4">
                {settingItems.map((item) => (
                    <Card key={item.key} className={item.dangerous ? "border-red-200 dark:border-red-900" : ""}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {item.dangerous ? (
                                        <AlertTriangle className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <div>
                                        <CardTitle className="text-base">{item.title}</CardTitle>
                                        <CardDescription>{item.description}</CardDescription>
                                    </div>
                                </div>
                                <Switch
                                    checked={isEnabled(item.key)}
                                    onCheckedChange={() => toggleSetting(item.key)}
                                    disabled={updateMutation.isPending}
                                />
                            </div>
                        </CardHeader>
                        {item.key === "maintenance_mode" && isEnabled("maintenance_mode") && (
                            <CardContent className="pt-0 pb-6 border-t border-red-100 dark:border-red-950/30 mt-4">
                                <div className="space-y-4 pt-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Estimated Return Time (ETA)</label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="e.g. 20 Minutes, 2:30 PM, Tomorrow"
                                                defaultValue={settings["maintenance_eta"] || ""}
                                                className="bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50"
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
                                        <p className="text-[10px] text-red-500/60 ml-1">Visible to users on maintenance and login pages.</p>
                                    </div>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                ))}
            </div>

            {/* System Announcement Banner */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Settings className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <CardTitle className="text-base">Global Announcement Banner</CardTitle>
                                <CardDescription>Show a high-visibility update banner on the top of the feed.</CardDescription>
                            </div>
                        </div>
                        <Switch
                            checked={isEnabled("system_banner_visible")}
                            onCheckedChange={() => toggleSetting("system_banner_visible")}
                            disabled={updateMutation.isPending}
                        />
                    </div>
                </CardHeader>
                {isEnabled("system_banner_visible") && (
                    <CardContent className="space-y-4 border-t border-border/50 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                                <Input
                                    defaultValue={settings["system_banner_title"] || ""}
                                    placeholder="e.g. UPDATE V1.3: INTERACTIVE & GAMIFIED"
                                    onBlur={(e) => {
                                        if (e.target.value !== settings["system_banner_title"]) {
                                            updateMutation.mutate({ key: "system_banner_title", value: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Badge Text</label>
                                <Input
                                    defaultValue={settings["system_banner_badge"] || ""}
                                    placeholder="e.g. LIVE NOW"
                                    onBlur={(e) => {
                                        if (e.target.value !== settings["system_banner_badge"]) {
                                            updateMutation.mutate({ key: "system_banner_badge", value: e.target.value });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Content Bullets (JSON)</label>
                            <Input
                                defaultValue={settings["system_banner_content"] || ""}
                                placeholder='e.g. ["New XP System", "Bug Fixes", "Performance"]'
                                className="font-mono text-xs"
                                onBlur={(e) => {
                                    if (e.target.value !== settings["system_banner_content"]) {
                                        updateMutation.mutate({ key: "system_banner_content", value: e.target.value });
                                    }
                                }}
                            />
                            <p className="text-[10px] text-muted-foreground">Enter a JSON array of strings for bullet points.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Action Link (Optional)</label>
                            <Input
                                defaultValue={settings["system_banner_link"] || ""}
                                placeholder="e.g. /changelog or https://example.com"
                                onBlur={(e) => {
                                    if (e.target.value !== settings["system_banner_link"]) {
                                        updateMutation.mutate({ key: "system_banner_link", value: e.target.value });
                                    }
                                }}
                            />
                        </div>
                    </CardContent>
                )}
            </Card>

            {/* Feature Configuration */}
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Feature Configuration
                </h2>
                <div className="grid gap-4">
                    {featureItems.map((item) => (
                        <Card key={item.key}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <CardTitle className="text-base">{item.title}</CardTitle>
                                            <CardDescription>{item.description}</CardDescription>
                                        </div>
                                    </div>
                                    <Switch
                                        checked={isEnabled(item.key)}
                                        onCheckedChange={() => toggleSetting(item.key)}
                                        disabled={updateMutation.isPending}
                                    />
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Danger Zone */}
            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                        These actions can significantly impact the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-900">
                        <div>
                            <p className="font-medium">Emergency Lockdown</p>
                            <p className="text-sm text-muted-foreground">
                                Disable all user activity immediately. Only admins can access the site.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (confirm("Are you sure? This will lock out ALL non-admin users.")) {
                                    updateMutation.mutate({ key: "maintenance_mode", value: "true" });
                                }
                            }}
                            disabled={isEnabled("maintenance_mode") || updateMutation.isPending}
                        >
                            {isEnabled("maintenance_mode") ? "Already Locked" : "Activate Lockdown"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
