import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Code, Users, Settings, Shield, Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Seo } from "@/components/Seo";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersAPI, authAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useTheme } from "@/context/ThemeContext";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser, signOut, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();

    // Settings State
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [name, setName] = useState("");
    const [editedUsername, setEditedUsername] = useState("");
    const [bio, setBio] = useState("");
    const [visibility, setVisibility] = useState("PUBLIC");
    const [profileImage, setProfileImage] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");

    const queryClient = useQueryClient();

    // 1. Fetch User
    const { data: userResponse, isLoading: userLoading } = useQuery({
        queryKey: ['user', username],
        queryFn: () => {
            if (username === 'me') {
                return authAPI.me();
            }
            return usersAPI.getById(username!);
        },
        retry: false
    });

    const profileUser = userResponse?.user ? { ...userResponse.user, isFollowing: userResponse.isFollowing } : null;

    // 2. Fetch Snippets
    const userId = profileUser?.id;

    const { data: snippetsData } = useQuery({
        queryKey: ['user-snippets', userId],
        queryFn: () => usersAPI.getSnippets(userId),
        enabled: !!userId, // strictly dependent on resolved user ID
        retry: false,
        staleTime: 5 * 60 * 1000
    });
    const snippets = snippetsData?.snippets || [];

    // 3. Settings Handler
    const handleSaveSettings = async () => {
        setIsLoadingSettings(true);
        try {
            const response = await usersAPI.update({
                name,
                username: editedUsername,
                bio,
                visibility,
                image: profileImage,
                githubUrl,
                instagramUrl
            });
            updateUser(response.user);
            toast({ title: "Configuration synced successfully" });
            queryClient.invalidateQueries({ queryKey: ['user', username] });
        } catch (error) {
            toast({ title: "Sync failed", variant: "destructive" });
        } finally {
            setIsLoadingSettings(false);
        }
    };

    // 4. Initialize Settings State
    useEffect(() => {
        if (currentUser && currentUser.id === profileUser?.id) {
            setName(currentUser.name || "");
            setEditedUsername(currentUser.username || "");
            setBio(currentUser.bio || "");
            setVisibility(currentUser.visibility || "PUBLIC");
        }
    }, [currentUser, profileUser]);

    // Sync image and social links
    useEffect(() => {
        if (profileUser) {
            setProfileImage(profileUser.image || "");
            setGithubUrl(profileUser.githubUrl || "");
            setInstagramUrl(profileUser.instagramUrl || "");
        }
    }, [profileUser]);

    // 4. Fetch Summary (MVP)
    const { data: summaryData } = useQuery({
        queryKey: ['summary', username],
        queryFn: () => usersAPI.getProfileSummary(username === 'me' ? undefined : username),
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: !!username && (username !== 'me' || !!currentUser) // Don't fetch 'me' if logged out
    });

    // MVP Defaults (0 if missing)
    const snippetCount = summaryData?.snippets?.total || 0;
    const langStats = summaryData?.snippets?.byLanguage || { typescript: 0, python: 0, go: 0 };
    const contestCount = summaryData?.arena?.contestsJoined || 0;

    // Calculate percentages for the bar
    const totalSpecific = (langStats.typescript || 0) + (langStats.python || 0) + (langStats.go || 0);

    // Initial Loading State
    if (userLoading && !profileUser) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="h-4 w-4 rounded-sm bg-primary animate-ping" />
            </div>
        );
    }

    // User Not Found State
    if (!profileUser) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Users className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-xl font-bold font-mono">USER_NOT_FOUND</h3>
                <Button onClick={() => window.history.back()} variant="outline">RETURN_</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-6 pb-20 fade-in">
            {profileUser && (
                <Seo
                    title={`${profileUser.name || profileUser.username} (@${profileUser.username}) | CodeStudio`}
                    description={profileUser.bio || `Check out ${profileUser.name}'s developer profile on CodeStudio.`}
                    type="profile"
                    image={profileUser.image}
                    url={window.location.href}
                    schema={JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Person",
                        "name": profileUser.name || profileUser.username,
                        "alternateName": profileUser.username,
                        "description": profileUser.bio,
                        "image": profileUser.image,
                        "url": window.location.href,
                        "sameAs": [
                            profileUser.githubUrl,
                            profileUser.instagramUrl
                        ].filter(Boolean)
                    })}
                />
            )}

            {profileUser && (
                <BreadcrumbSchema items={[
                    { name: 'Home', item: window.location.origin },
                    { name: 'Developers', item: `${window.location.origin}/developers` }, // Or similar listing
                    { name: profileUser.username, item: window.location.href }
                ]} />
            )}

            {/* 1. Identity Header */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-surface border border-border p-6 rounded-2xl">
                <Avatar className="h-24 w-24 border-4 border-canvas shadow-lg">
                    <AvatarImage src={profileUser.image} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {profileUser.username[0].toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold font-headline text-foreground">
                            {profileUser.name || profileUser.username}
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider border border-primary/20">
                            {profileUser.role || "Developer"}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            @{profileUser.username}
                        </span>
                        <span>•</span>
                        <span>Joined {format(new Date(profileUser.createdAt), 'MMM yyyy')}</span>
                    </div>

                    {profileUser.bio && (
                        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {profileUser.bio}
                        </p>
                    )}
                </div>

                {currentUser?.id === profileUser.id && (
                    <Link to="/settings">
                        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs uppercase tracking-wider">
                            <Settings className="h-3.5 w-3.5" /> Configure
                        </Button>
                    </Link>
                )}
            </div>

            {/* 2. Stats Grid (Snippet Summary & Arena Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Snippet Summary */}
                <div className="bg-surface border border-border resize-none p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Code className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-foreground">Snippet Summary</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground">{snippetCount}</span>
                        <span className="text-sm text-muted-foreground font-mono">Total Snippets</span>
                    </div>

                    {/* Language Distribution Bar */}
                    <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden flex">
                        <div style={{ width: `${totalSpecific ? ((langStats.typescript || 0) / totalSpecific) * 100 : 0}%` }} className="h-full bg-blue-500 transition-all duration-500" />
                        <div style={{ width: `${totalSpecific ? ((langStats.python || 0) / totalSpecific) * 100 : 0}%` }} className="h-full bg-yellow-500 transition-all duration-500" />
                        <div style={{ width: `${totalSpecific ? ((langStats.go || 0) / totalSpecific) * 100 : 0}%` }} className="h-full bg-green-500 transition-all duration-500" />
                    </div>

                    <div className="flex gap-4 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> TypeScript ({langStats.typescript || 0})
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> Python ({langStats.python || 0})
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Go ({langStats.go || 0})
                        </span>
                    </div>
                </div>

                {/* Arena Summary */}
                <div className="bg-surface border border-border p-6 rounded-xl space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-4 w-4 text-orange-500" />
                        <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-foreground">Arena Summary</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-foreground">{contestCount}</span>
                        <span className="text-sm text-muted-foreground font-mono">Contests Joined</span>
                    </div>
                    <div className="p-3 bg-canvas border border-border/50 rounded-lg">
                        <p className="text-xs text-muted-foreground font-mono text-center">
                            {contestCount > 0 ? "Active in the Arena." : "No contest history available yet."}
                        </p>
                    </div>
                </div>
            </div>

            {/* 3. Work Showcase (Pinned/Recent Snippets) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                    <h2 className="text-lg font-bold font-headline flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-primary" />
                        Work Showcase
                    </h2>
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Latest 3 Public Snippets
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {snippets.slice(0, 3).map((snippet: any) => (
                        <SnippetCard key={snippet.id} snippet={snippet} />
                    ))}
                    {snippets.length === 0 && (
                        <div className="col-span-full py-12 border border-dashed border-white/10 rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center">
                            <div className="h-10 w-10 rounded-full bg-muted/20 flex items-center justify-center mb-3">
                                <Terminal className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <h4 className="text-sm font-bold text-foreground mb-1">Index Empty</h4>
                            <p className="text-xs text-muted-foreground font-mono mb-4">
                                You haven't published any public snippets yet.
                            </p>
                            {currentUser?.id === profileUser.id && (
                                <Link to="/create">
                                    <Button variant="secondary" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-widest">
                                        Initialize Snippet
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {currentUser?.id === profileUser.id && (
                <div className="hidden">
                    {/* Hidden Components for future features or settings only accessible via route */}
                    <ProfileSettings
                        name={name} setName={setName}
                        username={editedUsername} setUsername={setEditedUsername}
                        bio={bio} setBio={setBio}
                        visibility={visibility} setVisibility={setVisibility}
                        onSave={handleSaveSettings} isLoading={isLoadingSettings}
                        signOut={signOut!} theme={theme} setTheme={setTheme}
                        currentImage={profileImage} onImageUpdate={setProfileImage}
                        githubUrl={githubUrl} setGithubUrl={setGithubUrl}
                        instagramUrl={instagramUrl} setInstagramUrl={setInstagramUrl}
                    />
                </div>
            )}
        </div>
    );
}
