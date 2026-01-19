import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Power, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
                                    checked={item.key === "maintenance_mode" ? isEnabled(item.key) : isEnabled(item.key)}
                                    onCheckedChange={() => toggleSetting(item.key)}
                                    disabled={updateMutation.isPending}
                                />
                            </div>
                        </CardHeader>
                    </Card>
                ))}
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
