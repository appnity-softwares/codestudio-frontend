import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Power, AlertTriangle, RefreshCw,
    BookOpen, ExternalLink, Sparkles, Layout, Shield,
    Terminal, Zap, Globe, Database, Cpu, Activity,
    Lock, MessageSquare, Share2, BarChart3, Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function AdminSystem() {
    const navigate = useNavigate();
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
            toast({ title: "SYSTEM_SYNC_COMPLETE", description: `${variables.key} has been synchronized across all nodes.` });
            queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
        },
        onError: (error: any) => {
            toast({ title: "SYNC_ERROR", description: error.message, variant: "destructive" });
        },
    });

    // Redeploy Mutation
    const redeployMutation = useMutation({
        mutationFn: (mode: string) => adminAPI.triggerRedeploy(mode),
        onSuccess: (data) => {
            toast({ title: "DEPLOYMENT_SEQUENCE_INITIATED", description: data.message });
        },
        onError: (error: any) => {
            toast({ title: "DEPLOYMENT_FAILURE", description: error.message, variant: "destructive" });
        },
    });

    const settings = settingsData?.settings || {};

    const toggleSetting = (key: string) => {
        const currentValue = settings[key] === "true";
        updateMutation.mutate({ key, value: (!currentValue).toString() });
    };

    const isEnabled = (key: string) => settings[key] === "true";

    const coreSettings = [
        {
            key: "maintenance_mode",
            title: "Maintenance Mode",
            description: "Instant platform lockdown. Only administrators can bypass the gate.",
            icon: Power,
            dangerous: true,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
            hoverColor: "hover:border-red-500/30"
        },
        {
            key: "registration_open",
            title: "Open Registration",
            description: "Allow new identities to be created on the network.",
            icon: Shield,
            dangerous: false,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            hoverColor: "hover:border-emerald-500/30"
        },
        {
            key: "submissions_enabled",
            title: "Task Submissions",
            description: "Enable the submission engine for active challenges.",
            icon: Cpu,
            dangerous: false,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            hoverColor: "hover:border-blue-500/30"
        },
        {
            key: "snippets_enabled",
            title: "Neural Snippets",
            description: "Enable snippet creation and distributed sharing.",
            icon: Terminal,
            dangerous: false,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            hoverColor: "hover:border-purple-500/30"
        },
    ];

    const sidebarFeatures = [
        { key: "feature_sidebar_xp_store", title: "XP Store Link", icon: Zap },
        { key: "feature_sidebar_trophy_room", title: "Trophy Room", icon: Shield },
        { key: "feature_sidebar_practice", title: "Practice Hub", icon: Cpu },
        { key: "feature_sidebar_feedback", title: "Feedback Wall", icon: MessageSquare },
        { key: "feature_sidebar_roadmaps", title: "Mission Roadmaps", icon: Layout },
        { key: "feature_sidebar_community", title: "Community Relay", icon: Globe },
        { key: "feature_sidebar_leaderboard", title: "Global Leaderboard", icon: BarChart3 },
    ];

    const storeFeatures = [
        {
            key: "feature_store_powerups",
            title: "Neural Boosters",
            description: "Show 'Powerups' tab in the XP Store for performance enhancements.",
            icon: Zap,
            color: "text-amber-500",
            bgColor: "bg-amber-500/10"
        },
        {
            key: "feature_store_themes",
            title: "IDE Protocol Skins",
            description: "Enable the 'IDE Themes' aesthetic customization tab in the store.",
            icon: Layout,
            color: "text-cyan-500",
            bgColor: "bg-cyan-500/10"
        }
    ];

    const socialFeatures = [
        { key: "feature_social_chat", title: "Encrypted Messaging", icon: MessageSquare },
        { key: "feature_social_follow", title: "Connection Protocol", icon: Share2 },
        { key: "feature_social_feed", title: "Intelligence Stream", icon: Radio },
        { key: "feature_github_stats", title: "GitHub Sync", icon: Globe },
    ];

    const SystemStatusCard = ({ item, enabled, onToggle, isPending, children, fullWidth = false }: any) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "group relative rounded-2xl border transition-all duration-300 overflow-hidden",
                enabled
                    ? (item.dangerous ? "border-red-500/30 bg-red-500/5 shadow-[0_0_20px_-10px_rgba(239,68,68,0.2)]" : "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_-10px_rgba(16,185,129,0.2)]")
                    : "border-border bg-card",
                fullWidth ? "col-span-full" : ""
            )}
        >
            <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                            enabled ? (item.dangerous ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500") : "bg-muted text-muted-foreground"
                        )}>
                            <item.icon className="h-6 w-6" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold text-foreground flex items-center gap-2">
                                {item.title}
                                {item.dangerous && enabled && (
                                    <span className="text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black animate-pulse uppercase tracking-tighter">
                                        CRITICAL
                                    </span>
                                )}
                            </h3>
                            <p className="text-xs text-muted-foreground leading-snug max-w-md italic">
                                {item.description}
                            </p>
                        </div>
                    </div>
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
                </div>
                {children && <div className="mt-6 pt-6 border-t border-border/10">{children}</div>}
            </div>

            {/* Visual Pulse for active things */}
            {enabled && (
                <div className={cn(
                    "absolute bottom-0 left-0 right-0 h-[2px] opacity-30",
                    item.dangerous ? "bg-red-500" : "bg-emerald-500"
                )} />
            )}
        </motion.div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm font-black italic tracking-widest text-primary animate-pulse uppercase">Syncing with Core...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-24">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                        <Cpu className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black italic tracking-tight font-headline uppercase leading-none">System_OS</h1>
                        <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Platform Orchestration Layer v4.0.2</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                        <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Pulse: Operational</span>
                    </div>
                    <Button onClick={() => window.open('/help', '_blank')} variant="outline" className="gap-2 rounded-xl h-10 border-border/50 bg-card/50 backdrop-blur-sm">
                        <BookOpen className="h-4 w-4" /> Log Manual
                    </Button>
                </div>
            </div>

            {/* Top Stats/Operations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2 border-primary/20 bg-primary/5 overflow-hidden group">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-primary">
                            <RefreshCw className="h-4 w-4" /> Deployment Pipeline
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { label: "UI_LAYER", mode: "frontend", icon: Layout },
                                { label: "CORE_API", mode: "backend", icon: Database },
                                { label: "FULL_SYNC", mode: "all", icon: Radio, highlight: true }
                            ].map((op) => (
                                <Button
                                    key={op.mode}
                                    variant={op.highlight ? "default" : "outline"}
                                    className={cn(
                                        "h-auto py-4 flex flex-col gap-2 rounded-xl group/btn",
                                        op.highlight ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-primary/20 hover:bg-primary/10 transition-colors"
                                    )}
                                    onClick={() => {
                                        if (confirm(`INITIATE DEPLOYMENT: ${op.label}?`)) redeployMutation.mutate(op.mode);
                                    }}
                                    disabled={redeployMutation.isPending}
                                >
                                    <op.icon className={cn("h-5 w-5", !op.highlight && "text-primary group-hover/btn:scale-110 transition-transform")} />
                                    <span className="text-[10px] font-black tracking-widest">{op.label}</span>
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/30 backdrop-blur-md overflow-hidden" onClick={() => navigate("/admin/badge-config")}>
                    <CardHeader>
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-emerald-500" /> New Identifiers
                        </CardTitle>
                        <CardDescription className="text-[10px] uppercase font-bold text-muted-foreground/50">Sidebar Badge Orchestration</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center p-6">
                        <Button variant="outline" className="w-full h-12 rounded-xl font-black italic gap-2 group">
                            Configure Badges <ExternalLink className="h-4 w-4 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="core" className="space-y-6">
                <TabsList className="bg-muted/50 p-1 rounded-2xl border border-border/50 backdrop-blur-md overflow-x-auto inline-flex w-auto">
                    <TabsTrigger value="core" className="rounded-xl px-6 py-2 content-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Cpu className="h-4 w-4" /> Core Systems
                    </TabsTrigger>
                    <TabsTrigger value="store" className="rounded-xl px-6 py-2 content-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Zap className="h-4 w-4" /> XP Store
                    </TabsTrigger>
                    <TabsTrigger value="navigation" className="rounded-xl px-6 py-2 content-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Layout className="h-4 w-4" /> Navigation
                    </TabsTrigger>
                    <TabsTrigger value="social" className="rounded-xl px-6 py-2 content-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Globe className="h-4 w-4" /> Social Relay
                    </TabsTrigger>
                    <TabsTrigger value="broadcast" className="rounded-xl px-6 py-2 content-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm">
                        <Activity className="h-4 w-4" /> Broadcast
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="core" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {coreSettings.map((item) => (
                            <SystemStatusCard
                                key={item.key}
                                item={item}
                                enabled={isEnabled(item.key)}
                                onToggle={() => toggleSetting(item.key)}
                                isPending={updateMutation.isPending}
                            >
                                {item.key === "maintenance_mode" && isEnabled("maintenance_mode") && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                                <Activity className="h-3 w-3" /> Broadcast ETA
                                            </label>
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="OS_STATUS: Recovering..."
                                                    defaultValue={settings["maintenance_eta"] || ""}
                                                    className="bg-background border-red-500/20 h-10 rounded-xl"
                                                    onBlur={(e) => {
                                                        if (e.target.value !== settings["maintenance_eta"]) {
                                                            updateMutation.mutate({ key: "maintenance_eta", value: e.target.value });
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="rounded-xl"
                                                    onClick={() => updateMutation.mutate({ key: "maintenance_eta", value: "Fixed Soon" })}
                                                >
                                                    Default
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </SystemStatusCard>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="store" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {storeFeatures.map((item) => (
                            <SystemStatusCard
                                key={item.key}
                                item={item}
                                enabled={isEnabled(item.key)}
                                onToggle={() => toggleSetting(item.key)}
                                isPending={updateMutation.isPending}
                            />
                        ))}
                        <Card className="col-span-full border-primary/20 bg-primary/5 p-8 flex flex-col items-center text-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black uppercase tracking-widest">Store Economy Layer</h3>
                                <p className="text-xs text-muted-foreground mt-1 max-w-lg">Advanced store settings including inventory caps, aura pricing, and theme acquisition multipliers are available in the Shop Config panel.</p>
                            </div>
                            <Button variant="outline" className="rounded-xl h-10 gap-2 border-primary/30 hover:bg-primary/10 font-black italic">
                                Access Shop Config <ExternalLink className="h-4 w-4" />
                            </Button>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="navigation" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {sidebarFeatures.map((item: any) => (
                            <div
                                key={item.key}
                                onClick={() => toggleSetting(item.key)}
                                className={cn(
                                    "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                                    isEnabled(item.key) ? "border-primary/30 bg-primary/5" : "border-border bg-card/50 opacity-60 hover:opacity-100"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-8 w-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110",
                                        isEnabled(item.key) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <item.icon className="h-4 w-4" />
                                    </div>
                                    <span className="text-xs font-bold uppercase tracking-wide">{item.title}</span>
                                </div>
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    isEnabled(item.key) ? "bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" : "bg-muted-foreground/30"
                                )} />
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="social" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {socialFeatures.map((item: any) => (
                            <div
                                key={item.key}
                                onClick={() => toggleSetting(item.key)}
                                className={cn(
                                    "p-6 rounded-2xl border transition-all cursor-pointer flex flex-col gap-4 group",
                                    isEnabled(item.key) ? "border-primary/30 bg-primary/5 shadow-md" : "border-border bg-card/30"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className={cn(
                                        "h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110",
                                        isEnabled(item.key) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                                    )}>
                                        <item.icon className="h-5 w-5" />
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter",
                                        isEnabled(item.key) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/50"
                                    )}>
                                        {isEnabled(item.key) ? "Active" : "Disabled"}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase tracking-widest">{item.title}</h4>
                                    <div className={cn("h-1 w-full mt-2 rounded-full overflow-hidden bg-muted")}>
                                        <motion.div
                                            initial={false}
                                            animate={{ width: isEnabled(item.key) ? "100%" : "0%" }}
                                            className="h-full bg-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="broadcast" className="mt-0">
                    <SystemStatusCard
                        item={{
                            key: "system_banner_visible",
                            title: "Global Intelligence Broadcast",
                            description: "Inject a high-priority system-wide alert across all dashboard interfaces.",
                            icon: AlertTriangle
                        }}
                        enabled={isEnabled("system_banner_visible")}
                        onToggle={() => toggleSetting("system_banner_visible")}
                        isPending={updateMutation.isPending}
                        fullWidth
                    >
                        {isEnabled("system_banner_visible") && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in zoom-in-95">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Transmission Title</label>
                                    <Input
                                        defaultValue={settings["system_banner_title"] || ""}
                                        placeholder="e.g. CORE_RECOSTRUCTION_IN_PROGRESS"
                                        className="bg-background/50 border-border/50 h-10 rounded-xl"
                                        onBlur={(e) => {
                                            if (e.target.value !== settings["system_banner_title"]) {
                                                updateMutation.mutate({ key: "system_banner_title", value: e.target.value });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Priority Token (Badge)</label>
                                    <Input
                                        defaultValue={settings["system_banner_badge"] || ""}
                                        placeholder="e.g. PRIORITY_0"
                                        className="bg-background/50 border-border/50 h-10 rounded-xl"
                                        onBlur={(e) => {
                                            if (e.target.value !== settings["system_banner_badge"]) {
                                                updateMutation.mutate({ key: "system_banner_badge", value: e.target.value });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Payload Content (JSON Array)</label>
                                    <Input
                                        defaultValue={settings["system_banner_content"] || ""}
                                        placeholder='e.g. ["SYSTEM_STABILITY: 99%", "REBOOT_SCHEDULED: 14:00"]'
                                        className="font-mono text-[10px] bg-background/50 border-border/50 h-10 rounded-xl"
                                        onBlur={(e) => {
                                            if (e.target.value !== settings["system_banner_content"]) {
                                                updateMutation.mutate({ key: "system_banner_content", value: e.target.value });
                                            }
                                        }}
                                    />
                                    <p className="text-[9px] text-muted-foreground italic px-1">Expects a valid JSON string array for bulleted highlights.</p>
                                </div>
                            </div>
                        )}
                    </SystemStatusCard>
                </TabsContent>
            </Tabs>

            {/* Danger Zone */}
            <div className="pt-12">
                <div className="flex items-center gap-2 mb-4 text-red-500/50">
                    <Activity className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protocol Overrides</span>
                </div>
                <Card className="border-red-500/20 bg-red-500/5 overflow-hidden">
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex gap-6">
                            <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-black italic tracking-tight text-foreground uppercase">Emergency Lockdown Protocol</h3>
                                <p className="text-sm text-muted-foreground max-w-xl">
                                    Instantly revokes access for all non-privileged identities. Use ONLY during high-threat security breaches. This action is logged globally with a TRIPLE-RED priority.
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="destructive"
                            size="lg"
                            className="h-14 px-10 font-black italic shadow-xl shadow-red-500/20 rounded-2xl group"
                            onClick={() => {
                                if (confirm("INITIATE LOCKDOWN? This will sever all user connections.")) {
                                    updateMutation.mutate({ key: "maintenance_mode", value: "true" });
                                }
                            }}
                            disabled={isEnabled("maintenance_mode") || updateMutation.isPending}
                        >
                            {isEnabled("maintenance_mode") ? (
                                <span className="flex items-center gap-2">REDACTED_ACCESS_ACTIVE</span>
                            ) : (
                                <span className="flex items-center gap-2 group-hover:scale-105 transition-transform">INITIATE LOCKDOWN <Lock className="h-5 w-5" /></span>
                            )}
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
