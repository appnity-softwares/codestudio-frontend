"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Terminal, Lock, Trash2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/context/AuthContext";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
    const { user, signOut, updateUser } = useAuth();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [publicProfile, setPublicProfile] = useState(true);

    // Initialize state
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setUsername(user.username || "");
            setBio(user.bio || "");
            // setPublicProfile(user.visibility === "PUBLIC"); // Assuming backend supports this
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const response = await usersAPI.update({ name, bio, visibility: publicProfile ? "PUBLIC" : "PRIVATE" });
            updateUser(response.user);
            toast({ title: "SYSTEM_UPDATE: SUCCESS", description: "Identity parameters updated." });
        } catch (error) {
            console.error(error);
            toast({ title: "SYSTEM_ERROR", description: "Write operation failed.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = () => {
        // MVP: Just a toast for now to avoid accidental deletions during dev.
        // Or implement verify modal. For strict MVP request, "Delete Account (confirm modal)" was requested.
        const confirmed = window.confirm("CRITICAL WARNING: This action is irreversible. Confirm account deletion?");
        if (confirmed) {
            toast({ title: "DESTRUCTION_SEQUENCE", description: "Account termination request queued (Mock).", variant: "destructive" });
            // In real app: await usersAPI.deleteAccount(); signOut();
        }
    };

    return (
        <div className="min-h-screen bg-canvas text-foreground p-4 md:p-8 max-w-3xl mx-auto">
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-2xl font-bold font-mono tracking-tight flex items-center gap-3">
                            <Terminal className="h-6 w-6 text-primary" />
                            SYS_CONFIG
                        </h1>
                        <p className="text-xs text-muted-foreground font-mono mt-1 opacity-70">
                            /etc/user/profile_config
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 font-mono text-xs gap-2"
                        onClick={signOut}
                    >
                        <LogOut className="h-3 w-3" />
                        TERMINATE_SESSION
                    </Button>
                </div>

                {/* Identity Matrix */}
                <div className="space-y-6 bg-surface/30 p-6 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-3">
                        <User className="h-3.5 w-3.5" /> Identity_Matrix
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Display_Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-black/20 border-white/10 font-mono text-xs h-9 focus-visible:ring-primary/20"
                                placeholder="Enter display name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-mono text-muted-foreground uppercase">Codename (Immutable)</Label>
                            <Input
                                value={username}
                                disabled
                                className="bg-black/10 border-white/5 font-mono text-xs h-9 opacity-50 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">Bio_Data (Max 160)</Label>
                        <Input
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={160}
                            className="bg-black/20 border-white/10 font-mono text-xs h-9 focus-visible:ring-primary/20"
                            placeholder="Brief system description..."
                        />
                        <div className="text-[10px] text-right text-muted-foreground font-mono">{bio.length}/160</div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-mono text-muted-foreground uppercase">Email_Uplink (Locked)</Label>
                        <div className="flex items-center gap-2 px-3 h-9 bg-black/10 border border-white/5 rounded-md text-xs font-mono text-muted-foreground opacity-50 cursor-not-allowed">
                            <Lock className="h-3 w-3" />
                            {user?.email}
                        </div>
                    </div>
                </div>

                {/* Visibility */}
                <div className="space-y-6 bg-surface/30 p-6 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest border-b border-white/5 pb-3">
                        <Shield className="h-3.5 w-3.5" /> Visibility_Protocol
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold font-mono text-foreground">Public_Reach</Label>
                            <p className="text-xs text-muted-foreground font-mono">Allow external nodes to query your profile data.</p>
                        </div>
                        <Switch
                            checked={publicProfile}
                            onCheckedChange={setPublicProfile}
                            className="data-[state=checked]:bg-primary"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 pt-4">
                    <Button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="w-full font-mono font-bold tracking-wider"
                    >
                        {isLoading ? "WRITING..." : "EXECUTE_UPDATE"}
                    </Button>

                    <Separator className="bg-white/10 my-2" />

                    <Button
                        variant="ghost"
                        onClick={handleDeleteAccount}
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive font-mono text-xs opacity-70 hover:opacity-100"
                    >
                        <Trash2 className="h-3 w-3 mr-2" />
                        INITIATE_ACCOUNT_DESTRUCTION
                    </Button>
                </div>
            </div>
        </div>
    );
}
