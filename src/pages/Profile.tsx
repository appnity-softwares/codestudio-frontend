import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Code, Users, Settings, Shield, Terminal, Trophy, Linkedin, Share2
} from "lucide-react";
import { ShareProfileModal } from "@/components/profile/ShareProfileModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersAPI, authAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useTheme } from "@/context/ThemeContext";
import { BadgeTab } from "@/components/profile/BadgeTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Profile() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser, signOut, updateUser } = useAuth();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const isMobile = useIsMobile();

    // Settings State
    const [isLoadingSettings, setIsLoadingSettings] = useState(false);
    const [name, setName] = useState("");
    const [editedUsername, setEditedUsername] = useState("");
    const [bio, setBio] = useState("");
    const [visibility, setVisibility] = useState("PUBLIC");
    const [profileImage, setProfileImage] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [instagramUrl, setInstagramUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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
        enabled: !!userId,
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
                instagramUrl,
                linkedinUrl
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
            setLinkedinUrl(profileUser.linkedinUrl || "");
        }
    }, [profileUser]);

    // 4. Fetch Summary (MVP)
    const { data: summaryData } = useQuery({
        queryKey: ['summary', username],
        queryFn: () => usersAPI.getProfileSummary(username === 'me' ? undefined : username),
        retry: false,
        staleTime: 5 * 60 * 1000,
        enabled: !!username && (username !== 'me' || !!currentUser)
    });

    // Calculate stats from snippets data strictly for real-time updates
    const snippetCount = snippets.length > 0 ? snippets.length : (summaryData?.snippets?.total || 0);
    const contestCount = summaryData?.arena?.contestsJoined || 0;

    const langStats = useMemo(() => {
        const stats = { typescript: 0, python: 0, go: 0 };
        if (snippets.length > 0) {
            snippets.forEach((s: any) => {
                const lang = s.language.toLowerCase();
                if (stats.hasOwnProperty(lang)) {
                    // @ts-ignore
                    stats[lang]++;
                }
            });
            return stats;
        }
        return summaryData?.snippets?.byLanguage || stats;
    }, [snippets, summaryData]);

    const totalSpecific = (langStats.typescript || 0) + (langStats.python || 0) + (langStats.go || 0);

    // Initial Loading State
    if (userLoading && !profileUser) {
        return (
            <div className={cn(
                "space-y-8 mx-auto pb-20 fade-in",
                isMobile ? "px-4 py-6" : "max-w-5xl p-6"
            )}>
                {/* Header Skeleton */}
                <div className={cn(
                    "flex gap-6",
                    isMobile ? "flex-col items-center text-center space-y-4" : "flex-row items-center border border-border p-6 rounded-2xl bg-surface"
                )}>
                    <Skeleton className={cn("rounded-full", isMobile ? "h-24 w-24" : "h-24 w-24 border-4 border-canvas")} />
                    <div className={cn("space-y-3", isMobile ? "items-center flex flex-col w-full" : "flex-1")}>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-4 w-full max-w-md" />
                    </div>
                </div>

                {/* Stats Skeleton */}
                <div className={cn(
                    "grid gap-4",
                    isMobile ? "grid-cols-3 bg-surface border border-border rounded-xl p-4" : "grid-cols-2"
                )}>
                    {isMobile ? (
                        <>
                            <div className="space-y-1 flex flex-col items-center"><Skeleton className="h-6 w-8" /><Skeleton className="h-2 w-12" /></div>
                            <div className="space-y-1 flex flex-col items-center border-x border-border"><Skeleton className="h-6 w-8" /><Skeleton className="h-2 w-12" /></div>
                            <div className="space-y-1 flex flex-col items-center"><Skeleton className="h-6 w-8" /><Skeleton className="h-2 w-12" /></div>
                        </>
                    ) : (
                        <>
                            <Skeleton className="h-48 w-full rounded-xl" />
                            <Skeleton className="h-48 w-full rounded-xl" />
                        </>
                    )}
                </div>
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

    // ============ MOBILE LAYOUT (Instagram-style) ============
    if (isMobile) {
        return (
            <div className="space-y-6 px-4 py-6 pb-20 fade-in">
                {/* SEO */}
                {profileUser && (
                    <SEO
                        title={`${profileUser.name || profileUser.username} (@${profileUser.username}) | CodeStudio`}
                        description={profileUser.bio || `Check out ${profileUser.name}'s developer profile on CodeStudio.`}
                        type="profile"
                        image={profileUser.image}
                        url={window.location.href}
                    />
                )}

                {/* Instagram-style Header - Centered Avatar */}
                <div className="text-center space-y-4">
                    <Avatar className="h-24 w-24 mx-auto border-4 border-primary/20 shadow-lg">
                        <AvatarImage src={profileUser.image} className="object-cover" />
                        <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                            {profileUser.username[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    <div className="space-y-1">
                        <h1 className="text-xl font-bold font-headline text-foreground">
                            {profileUser.name || profileUser.username}
                        </h1>
                        <p className="text-sm text-muted-foreground">@{profileUser.username}</p>
                        <span className="inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider border border-primary/20">
                            {profileUser.role || "Developer"}
                        </span>
                    </div>

                    {profileUser.bio && (
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed italic">
                            "{profileUser.bio}"
                        </p>
                    )}

                    <div className="flex items-center justify-center gap-3 pt-1">
                        {profileUser.githubUrl && (
                            <a
                                href={profileUser.githubUrl.startsWith('http') ? profileUser.githubUrl : `https://${profileUser.githubUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                            >
                                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                GitHub
                            </a>
                        )}
                        {profileUser.linkedinUrl && (
                            <a
                                href={profileUser.linkedinUrl.startsWith('http') ? profileUser.linkedinUrl : `https://${profileUser.linkedinUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                            >
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                            </a>
                        )}
                        {profileUser.instagramUrl && (
                            <a
                                href={profileUser.instagramUrl.startsWith('http') ? profileUser.instagramUrl : `https://${profileUser.instagramUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground bg-white/5 border border-white/10 px-3 py-1.5 rounded-full"
                            >
                                <Users className="h-3 w-3" />
                                Connect
                            </a>
                        )}
                    </div>

                    {/* Settings Button (Own Profile) */}
                    {currentUser?.id === profileUser.id && (
                        <Link to="/settings">
                            <Button variant="outline" size="sm" className="gap-2 touch-target">
                                <Settings className="h-4 w-4" /> Edit Profile
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats Row (Instagram-style) */}
                <div className="grid grid-cols-3 gap-2 bg-surface border border-border rounded-xl p-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">{snippetCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Snippets</div>
                    </div>
                    <div className="text-center border-x border-border">
                        <div className="text-2xl font-bold text-foreground">{contestCount}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Contests</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">0</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Badges</div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="snippets" className="space-y-4">
                    <TabsList className="w-full grid grid-cols-2 bg-surface border border-border">
                        <TabsTrigger value="snippets" className="gap-2 touch-target">
                            <Code className="h-4 w-4" /> Snippets
                        </TabsTrigger>
                        <TabsTrigger value="badges" className="gap-2 touch-target">
                            <Trophy className="h-4 w-4" /> Badges
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="snippets" className="space-y-4">
                        {snippets.length > 0 ? (
                            <div className="space-y-4">
                                {snippets.slice(0, 6).map((snippet: any) => (
                                    <SnippetCard key={snippet.id} snippet={snippet} className="max-w-none mx-0 mb-0" />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 border border-dashed border-white/10 rounded-xl bg-surface/30 text-center px-6">
                                <Terminal className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                <h4 className="text-base font-bold text-foreground mb-2">No Snippets Yet</h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {currentUser?.id === profileUser.id
                                        ? "Create your first snippet!"
                                        : "This developer hasn't shared any snippets yet."
                                    }
                                </p>
                                {currentUser?.id === profileUser.id && (
                                    <Link to="/create">
                                        <Button size="sm" className="touch-target">Create Snippet</Button>
                                    </Link>
                                )}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="badges">
                        <BadgeTab username={profileUser.username} />
                    </TabsContent>
                </Tabs>
            </div>
        );
    }

    // ============ DESKTOP LAYOUT ============
    return (
        <div className="space-y-8 max-w-5xl mx-auto p-6 pb-20 fade-in">
            {profileUser && (
                <SEO
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
                            profileUser.linkedinUrl,
                            profileUser.instagramUrl
                        ].filter(Boolean)
                    })}
                />
            )}

            {profileUser && (
                <BreadcrumbSchema items={[
                    { name: 'Home', item: window.location.origin },
                    { name: 'Developers', item: `${window.location.origin}/developers` },
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
                        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed italic">
                            "{profileUser.bio}"
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                        {profileUser.githubUrl && (
                            <a
                                href={profileUser.githubUrl.startsWith('http') ? profileUser.githubUrl : `https://${profileUser.githubUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors border border-border/50 px-2.5 py-1 rounded-lg bg-canvas/50"
                            >
                                <svg className="h-3 w-3 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                GitHub
                            </a>
                        )}
                        {profileUser.linkedinUrl && (
                            <a
                                href={profileUser.linkedinUrl.startsWith('http') ? profileUser.linkedinUrl : `https://${profileUser.linkedinUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-blue-400 transition-colors border border-border/50 px-2.5 py-1 rounded-lg bg-canvas/50"
                            >
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                            </a>
                        )}
                        {profileUser.instagramUrl && (
                            <a
                                href={profileUser.instagramUrl.startsWith('http') ? profileUser.instagramUrl : `https://${profileUser.instagramUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-indigo-400 transition-colors border border-border/50 px-2.5 py-1 rounded-lg bg-canvas/50"
                            >
                                <Users className="h-3 w-3" />
                                Connection
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap gap-2">
                        {currentUser?.id === profileUser.id && (
                            <Link to="/settings">
                                <Button variant="outline" size="sm" className="gap-2 font-mono text-xs uppercase tracking-wider h-10 px-4">
                                    <Settings className="h-3.5 w-3.5" /> Configure Profile
                                </Button>
                            </Link>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 font-mono text-xs uppercase tracking-wider h-10 px-4"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            <Share2 className="h-3.5 w-3.5 text-primary" /> Share
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tags Row */}
            {(profileUser.preferredLanguages?.length > 0 || profileUser.interests?.length > 0) && (
                <div className="flex flex-wrap gap-2 px-1">
                    {profileUser.preferredLanguages?.map((lang: string) => (
                        <Badge key={lang} variant="secondary" className="bg-primary/5 text-primary border-primary/20 text-[10px] py-0.5">
                            {lang}
                        </Badge>
                    ))}
                    {profileUser.interests?.map((interest: string) => (
                        <Badge key={interest} variant="outline" className="text-muted-foreground border-white/10 text-[10px] py-0.5">
                            {interest}
                        </Badge>
                    ))}
                </div>
            )}

            <ShareProfileModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                username={profileUser.username}
                displayName={profileUser.name || profileUser.username}
            />

            {/* TABS NAVIGATION */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-surface border border-border">
                    <TabsTrigger value="overview" className="gap-2">
                        <Terminal className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="snippets" className="gap-2">
                        <Code className="h-4 w-4" /> Snippets
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="gap-2">
                        <Trophy className="h-4 w-4" /> Badges & Progress
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* 2. Stats Grid */}
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

                    {/* 3. Work Showcase */}
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
                                <SnippetCard key={snippet.id} snippet={snippet} className="max-w-none mx-0 mb-0" />
                            ))}
                            {snippets.length === 0 && (
                                <div className="col-span-full py-12 border border-dashed border-white/10 rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center px-6">
                                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                        <Terminal className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-base font-bold text-foreground mb-2">No Public Snippets Yet</h4>
                                    <p className="text-sm text-muted-foreground mb-3 max-w-md">
                                        {currentUser?.id === profileUser.id
                                            ? "You haven't published any public snippets. Share your code with the community!"
                                            : "This developer hasn't shared any public snippets yet."
                                        }
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 mb-4 max-w-sm">
                                        <strong>What happens next?</strong> Published snippets appear here with their output previews, engagement metrics, and language tags.
                                    </p>
                                    {currentUser?.id === profileUser.id && (
                                        <Link to="/create">
                                            <Button variant="secondary" size="sm" className="gap-2">
                                                <Terminal className="h-3.5 w-3.5" />
                                                Create Your First Snippet
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="snippets" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                            <Code className="h-5 w-5 text-primary" />
                            All Snippets ({snippets.length})
                        </h2>
                    </div>
                    {snippets.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {snippets.map((snippet: any) => (
                                <SnippetCard key={snippet.id} snippet={snippet} className="max-w-none mx-0 mb-0" />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 border border-dashed border-white/10 rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center px-6">
                            <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-6">
                                <Code className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h4 className="text-lg font-bold text-foreground mb-2">No Snippets Found</h4>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                {currentUser?.id === profileUser.id
                                    ? "You haven't published any snippets yet. Start coding and share your work!"
                                    : "This developer hasn't posted any snippets."
                                }
                            </p>
                            {currentUser?.id === profileUser.id && (
                                <Link to="/create">
                                    <Button className="gap-2">
                                        <Terminal className="h-4 w-4" />
                                        Create New Snippet
                                    </Button>
                                </Link>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="badges" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <BadgeTab username={profileUser.username} />
                </TabsContent>
            </Tabs>

            {
                currentUser?.id === profileUser.id && (
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
                )
            }
        </div>
    );
}

