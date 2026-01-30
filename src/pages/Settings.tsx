"use client";

import { useState, useEffect } from "react";
import { User, LogOut, Lock, Trash2, Shield, Link as LinkIcon, Image as ImageIcon, RefreshCw, Terminal } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAuth } from "@/context/AuthContext";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "@/components/ui/tag-input";
import { useDispatch } from "react-redux";
import { setUserData } from "@/store/slices/userSlice";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PrivacySettings } from "@/components/profile/PrivacySettings";
import { VisibilityMode, PrivacySettings as PrivacySettingsType, DEFAULT_PUBLIC_PRIVACY, DEFAULT_PRIVATE_PRIVACY, DEFAULT_HYBRID_PRIVACY } from "@/types";

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [bio, setBio] = useState("");
    const [image, setImage] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [languages, setLanguages] = useState<string[]>([]);
    const [interests, setInterests] = useState<string[]>([]);
    const [visibility, setVisibility] = useState<VisibilityMode>("PUBLIC");
    const [privacySettings, setPrivacySettings] = useState<PrivacySettingsType>(DEFAULT_PUBLIC_PRIVACY);

    // Initialize state
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setUsername(user.username || "");
            setBio(user.bio || "");

            // Only show image URL if it's NOT a DiceBear system URL
            const isDiceBear = (user.image || "").includes("api.dicebear.com");
            setImage(isDiceBear ? "" : (user.image || ""));

            setGithubUrl(user.githubUrl || "");
            setLinkedinUrl(user.linkedinUrl || "");
            setInstagramUrl(user.instagramUrl || "");

            // Format arrays safely (Postgres/GORM might return {} for empty arrays)
            const getArray = (val: any): string[] => {
                if (!val) return [];
                if (Array.isArray(val)) return val;
                if (typeof val === 'string') return val.split(",").map(s => s.trim()).filter(Boolean);
                return [];
            };

            setLanguages(getArray(user.preferredLanguages));
            setInterests(getArray(user.interests));

            // Handle visibility mode
            const userVisibility = user.visibility as VisibilityMode;
            if (userVisibility === "PUBLIC" || userVisibility === "PRIVATE" || userVisibility === "HYBRID") {
                setVisibility(userVisibility);
                // Set default privacy settings based on visibility mode
                switch (userVisibility) {
                    case "PUBLIC":
                        setPrivacySettings(DEFAULT_PUBLIC_PRIVACY);
                        break;
                    case "PRIVATE":
                        setPrivacySettings(DEFAULT_PRIVATE_PRIVACY);
                        break;
                    case "HYBRID":
                        // For hybrid, try to load saved settings or use default
                        setPrivacySettings(user.privacySettings || DEFAULT_HYBRID_PRIVACY);
                        break;
                }
            }
            console.log("Profile Data Loaded:", { languages: user.preferredLanguages, interests: user.interests });
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
                githubUrl,
                linkedinUrl,
                instagramUrl,
                languages: languages,
                interests: interests,
                visibility: visibility,
                privacySettings: privacySettings,
                githubStatsVisible: privacySettings.showGithubStats
            });
            updateUser(response.user);
            // Sync to Redux for instant global update
            if (response.user) {
                const { xp, level, streak, inventory, equippedAura, unlockedThemes, influence, avatar } = response.user;
                dispatch(setUserData({
                    xp: xp || 0,
                    level: level || 1,
                    streak: streak || 0,
                    inventory: inventory || [],
                    equippedAura: equippedAura || null,
                    unlockedThemes: unlockedThemes || ['default'],
                    influence: influence || 15,
                    profileImage: avatar || image || null
                }));
            }
            toast({ title: "SYSTEM_UPDATE: SUCCESS", description: "Identity parameters updated." });
            setTimeout(() => navigate("/profile/me"), 1500);
        } catch (error) {
            console.error(error);
            toast({ title: "Update Failed", description: "Could not sync profile settings.", variant: "destructive" });
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
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-surface/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
                        <LogOut className="h-5 w-5 rotate-180" />
                    </Button>
                    <h1 className="text-lg font-bold font-headline">Settings_</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-6 space-y-8 fade-in">

                {/* Profile Section */}
                <div className="space-y-6 bg-surface p-6 rounded-xl border border-border transition-all shadow-sm group hover:border-primary/20">
                    <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-3">
                        <User className="h-4 w-4 text-primary" /> Identity Matrix
                    </div>

                    {/* Image URL Section */}
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 relative">
                            <Avatar className="h-24 w-24 border-2 border-border group-hover:border-primary/50 transition-colors">
                                <AvatarImage src={image || user?.image} alt={name} className="object-cover" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl">
                                    {name?.charAt(0) || "U"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-2 -right-2 bg-background border border-border p-1.5 rounded-full shadow-sm">
                                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <div>
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
                                    <ImageIcon className="h-3.5 w-3.5" /> Profile Picture
                                </Label>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Link to="/settings/avatars">
                                        <Button variant="outline" size="sm" className="h-9 px-4 gap-2 border-border hover:bg-muted/50">
                                            <RefreshCw className="h-3.5 w-3.5" /> Pick from Collection
                                        </Button>
                                    </Link>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase py-1 px-2 bg-muted/30 rounded">or</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 px-4 text-xs font-semibold hover:bg-primary/10 hover:text-primary transition-colors"
                                        onClick={() => setImage(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || 'user'}`)}
                                    >
                                        Use Default
                                    </Button>
                                </div>
                            </div>

                            <div className="pt-2 space-y-2">
                                <Label className="text-[10px] text-muted-foreground uppercase">Custom Image URL</Label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="image"
                                        value={image}
                                        onChange={(e) => setImage(e.target.value)}
                                        className="pl-9 bg-background border-border h-9 text-xs"
                                        placeholder={user?.image?.includes("api.dicebear.com") ? "Using Collection Avatar" : "https://example.com/custom-avatar.png"}
                                    />
                                </div>
                                {user?.image?.includes("api.dicebear.com") && !image && (
                                    <div className="text-[10px] text-muted-foreground mt-1 ml-1 flex items-center gap-1 transition-all">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        Platform default active. Enter URL to override.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm">Display Name</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-background border-border h-10"
                                placeholder="Enter display name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm text-foreground">Username</Label>
                            <Input
                                value={username}
                                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                className="bg-background border-border h-10"
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
                            className="bg-background border-border h-10"
                            placeholder="Tell us about yourself..."
                        />
                        <div className="text-xs text-right text-muted-foreground">{bio.length}/160</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">GitHub</Label>
                            <Input
                                value={githubUrl}
                                onChange={(e) => setGithubUrl(e.target.value)}
                                className="bg-background border-border"
                                placeholder="GitHub URL"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">LinkedIn</Label>
                            <Input
                                value={linkedinUrl}
                                onChange={(e) => setLinkedinUrl(e.target.value)}
                                className="bg-background border-border"
                                placeholder="LinkedIn URL"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">External Connection</Label>
                            <Input
                                value={instagramUrl}
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                className="bg-background border-border"
                                placeholder="Website/Insta URL"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <Terminal className="h-4 w-4 text-primary" /> Skills & Stack
                            </Label>
                            <TagInput
                                tags={languages}
                                setTags={setLanguages}
                                placeholder="React, Go, Python..."
                                suggestions={["React", "TypeScript", "Go", "Python", "Node.js", "Docker", "AWS", "Rust", "Java"]}
                            />
                            <p className="text-[10px] text-muted-foreground italic">Add your primary tech stack for profile matching.</p>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-primary" /> Core Interests
                            </Label>
                            <TagInput
                                tags={interests}
                                setTags={setInterests}
                                placeholder="AI, UI/UX, Blockchain..."
                                suggestions={["AI/ML", "Web3", "UI/UX", "Cloud Architecture", "Game Dev", "Open Source"]}
                            />
                            <p className="text-[10px] text-muted-foreground italic">What are you passionate about building?</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Email</Label>
                        <div className="flex items-center gap-2 px-3 h-10 bg-muted/20 border border-border rounded-md text-sm text-muted-foreground opacity-50 cursor-not-allowed">
                            <Lock className="h-4 w-4" />
                            {user?.email}
                        </div>
                    </div>
                </div>

                {/* Privacy Section - Hybrid Mode */}
                <PrivacySettings
                    visibility={visibility}
                    setVisibility={setVisibility}
                    privacySettings={privacySettings}
                    setPrivacySettings={setPrivacySettings}
                />

                {/* Blocked Users Section */}
                <BlockedUsersSection />

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

function BlockedUsersSection() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['blocked-users'],
        queryFn: () => usersAPI.getBlockedUsers(),
    });

    const unblockMutation = useMutation({
        mutationFn: (username: string) => usersAPI.unblock(username),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blocked-users'] });
            toast({ title: "User Unblocked" });
        },
        onError: () => toast({ title: "Failed to unblock", variant: "destructive" })
    });

    if (isLoading) return <div className="p-4 text-center text-xs text-muted-foreground">Loading blocked users...</div>;

    const blocked = data?.blocked || [];

    return (
        <div className="space-y-6 bg-surface p-6 rounded-xl border border-border transition-all shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground border-b border-border pb-3">
                <Shield className="h-4 w-4 text-red-400" /> Blocked Users
            </div>

            {blocked.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                    No blocked users.
                </div>
            ) : (
                <div className="space-y-4">
                    {blocked.map((u: any) => (
                        <div key={u.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background/50">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={u.image} />
                                    <AvatarFallback>{u.username[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">{u.username}</p>
                                    <p className="text-[10px] text-muted-foreground">Blocked</p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs hover:text-red-400 hover:bg-red-400/10"
                                onClick={() => unblockMutation.mutate(u.username)}
                                disabled={unblockMutation.isPending}
                            >
                                Unblock
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
