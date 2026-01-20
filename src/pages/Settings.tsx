"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Lock, Trash2, Shield, Link as LinkIcon, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    const [image, setImage] = useState("");
    const [publicProfile, setPublicProfile] = useState(true);

    // Initialize state
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setUsername(user.username || "");
            setBio(user.bio || "");
            setImage(user.image || "");
            // setPublicProfile(user.visibility === "PUBLIC"); // Assuming backend supports this
        }
    }, [user]);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const response = await usersAPI.update({
                name,
                username,
                bio,
                image,
                visibility: publicProfile ? "PUBLIC" : "PRIVATE"
            });
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
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground flex items-center gap-3">
                            <User className="h-6 w-6 text-primary" />
                            Settings
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your profile and preferences
                        </p>
                    </div>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-9 gap-2"
                        onClick={signOut}
                    >
                        <LogOut className="h-4 w-4" />
                        Log Out
                    </Button>
                </div>

                {/* Profile Section */}
                <div className="space-y-6 bg-surface/30 p-6 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-white/5 pb-3">
                        <User className="h-4 w-4 text-primary" /> Profile Details
                    </div>

                    {/* Image URL Section */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-2 border-white/10">
                            <AvatarImage src={image} alt={name} className="object-cover" />
                            <AvatarFallback className="bg-white/5 text-2xl">{name?.charAt(0) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2 w-full">
                            <Label className="text-sm flex items-center gap-2">
                                <ImageIcon className="h-3 w-3" /> Profile Image URL
                            </Label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        className="pl-9 bg-black/20 border-white/10"
                                        placeholder="https://example.com/my-avatar.png"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Hosted URL Required (Imgur, GitHub Assets, etc.). We do not store files to keep the platform lightweight.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm">Display Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-black/20 border-white/10 h-10"
                                placeholder="Enter display name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-foreground">Username</Label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="bg-black/20 border-white/10 h-10"
                                placeholder="Change username (limited)"
                            />
                            <p className="text-[10px] text-muted-foreground">
                                Limited to 2 changes every 90 days.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm">Bio</Label>
                        <Input
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            maxLength={160}
                            className="bg-black/20 border-white/10 h-10"
                            placeholder="Tell us about yourself..."
                        />
                        <div className="text-xs text-right text-muted-foreground">{bio.length}/160</div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-2 px-3 h-10 bg-black/10 border border-white/5 rounded-md text-sm text-muted-foreground opacity-50 cursor-not-allowed">
                            <Lock className="h-4 w-4" />
                            {user?.email}
                        </div>
                    </div>
                </div>

                {/* Privacy Section */}
                <div className="space-y-6 bg-surface/30 p-6 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-white/5 pb-3">
                        <Shield className="h-4 w-4 text-primary" /> Privacy
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium text-foreground">Public Profile</Label>
                            <p className="text-xs text-muted-foreground">Allow others to view your profile details.</p>
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
                        className="w-full text-base font-medium h-11"
                    >
                        {isLoading ? "Saving..." : "Save Changes"}
                    </Button>

                    <Separator className="bg-white/10 my-2" />

                    <Button
                        variant="ghost"
                        onClick={handleDeleteAccount}
                        className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-sm"
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                    </Button>
                </div>
            </div>
        </div>
    );
}
