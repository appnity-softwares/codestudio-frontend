import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Info } from "lucide-react";

export default function AdminRoles() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["role-permissions"],
        queryFn: () => adminAPI.getRolePermissions(),
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminAPI.updateRolePermission(data),
        onSuccess: () => {
            toast({ title: "Permissions Updated", description: "Role access has been modified." });
            queryClient.invalidateQueries({ queryKey: ["role-permissions"] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const moderatorPerms = data?.permissions?.find((p: any) => p.role === "MODERATOR") || {
        role: "MODERATOR",
        canManageUsers: false,
        canManageSnippets: false,
        canManageContests: false,
        canManageProblems: false,
        canViewAuditLogs: false,
        canManageSystem: false,
    };

    const handleToggle = (field: string, value: boolean) => {
        updateMutation.mutate({
            ...moderatorPerms,
            [field]: value,
        });
    };

    const permList = [
        { key: "canManageUsers", label: "User Management", description: "Can warn, suspend, and view user details." },
        { key: "canManageSnippets", label: "Snippet Management", description: "Can pin and delete snippets." },
        { key: "canManageContests", label: "Contest Management", description: "Can create and manage contests." },
        { key: "canManageProblems", label: "Problem Management", description: "Can add and edit problems/testcases." },
        { key: "canViewAuditLogs", label: "View Audit Logs", description: "Can see history of admin/moderator actions." },
        { key: "canManageSystem", label: "System Control", description: "Can toggle maintenance mode and other global settings." },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Role Access Management</h1>
                    <p className="text-muted-foreground">Define what staff members can access on the platform.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-purple-500/20 bg-purple-500/5">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-purple-500 flex items-center gap-2">
                                <ShieldCheck className="h-5 w-5" />
                                Moderator Role
                            </CardTitle>
                        </div>
                        <CardDescription>
                            Customizable permissions for the staff moderator role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {permList.map((perm) => (
                            <div key={perm.key} className="flex items-center justify-between space-x-4">
                                <div className="flex-1 space-y-0.5">
                                    <Label className="text-base">{perm.label}</Label>
                                    <p className="text-sm text-muted-foreground">{perm.description}</p>
                                </div>
                                <Switch
                                    checked={moderatorPerms[perm.key]}
                                    onCheckedChange={(checked) => handleToggle(perm.key, checked)}
                                    disabled={updateMutation.isPending}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            Role Hierarchy
                        </CardTitle>
                        <CardDescription>
                            How roles function within CodeStudio.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="p-3 rounded-lg bg-surface border border-white/5">
                            <h4 className="font-bold mb-1">Administrator</h4>
                            <p className="text-muted-foreground">Highest authority. Has access to everything, including database-level role assignment and critical system settings. Cannot be restricted.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-surface border border-white/5">
                            <h4 className="font-bold mb-1 text-purple-500">Moderator</h4>
                            <p className="text-muted-foreground">Staff role with restricted access. Permissions are controlled by Administrators using the toggles on this page.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-surface border border-white/5">
                            <h4 className="font-bold mb-1 text-blue-500">User</h4>
                            <p className="text-muted-foreground">General platform user. Can only manage their own profile, snippets, and participate in contests.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
