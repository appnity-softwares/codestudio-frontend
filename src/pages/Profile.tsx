import { useState, useEffect, useMemo } from "react";
import { calculateLevel } from "@/lib/xp";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
    Code, Users, Settings, Shield, Terminal, Trophy, Linkedin, Share2, Plus, UserPlus, UserMinus, MessageSquare, Calendar, MapPin, Github, RefreshCw, Info
} from "lucide-react";
import { ShareProfileModal } from "@/components/profile/ShareProfileModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SeoMeta";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usersAPI, authAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import { format } from "date-fns";
import { ProfileSettings } from "@/components/profile/ProfileSettings";
import { useTheme } from "@/context/ThemeContext";
import { BadgeTab } from "@/components/profile/BadgeTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { useSystemSettings } from "@/hooks/useSystemSettings";
import { HamsterLoader } from "@/components/shared/HamsterLoader";

export default function Profile() {
    const { username } = useParams<{ username: string }>();
    const { user: currentUser, signOut, updateUser } = useAuth();
    const { openChatWith } = useChat();
    const { theme, setTheme } = useTheme();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { isFeatureEnabled } = useSystemSettings();
    const githubEnabled = isFeatureEnabled("feature_github_stats");

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
    const [githubStatsVisible, setGithubStatsVisible] = useState(true);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const queryClient = useQueryClient();

    // 1. Fetch User
    const { data: userResponse, isLoading: userLoading } = useQuery({
        // ... (existing query options)
        queryKey: ['user', username],
        queryFn: () => {
            if (username === 'me') {
                return authAPI.me();
            }
            return usersAPI.getById(username!);
        },
        retry: false,
        enabled: !!username && username !== 'undefined'
    });

    const profileUser = userResponse?.user ? { ...userResponse.user, isFollowing: userResponse.isFollowing } : null;

    // ... (levelInfo, linkStatus logic)

    const levelInfo = useMemo(() => {
        if (!profileUser) return null;
        return calculateLevel(profileUser.xp || 0);
    }, [profileUser?.xp]);

    const { data: linkStatus } = useQuery({
        queryKey: ['link-status', profileUser?.id],
        queryFn: () => usersAPI.checkLinkStatus(profileUser.id),
        enabled: !!profileUser && !!currentUser && currentUser.id !== profileUser.id,
        retry: false
    });

    const isLinked = linkStatus?.linked || false;
    const isPending = linkStatus?.status === 'PENDING';

    const { mutate: toggleLink, isPending: isLinkPending } = useMutation({
        mutationFn: async ({ currentIsLinked, currentIsPending }: { currentIsLinked: boolean, currentIsPending: boolean }) => {
            if (!profileUser?.id) throw new Error("Missing user identity");
            if (currentIsLinked || currentIsPending) {
                return await usersAPI.unfollow(profileUser.id);
            } else {
                return await usersAPI.follow(profileUser.id);
            }
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['link-status', profileUser?.id] });
            queryClient.invalidateQueries({ queryKey: ['user', username] });

            const wasActionLinking = !variables.currentIsLinked && !variables.currentIsPending;

            toast({
                title: wasActionLinking
                    ? (profileUser?.visibility === 'PRIVATE' ? "Request Sent" : "Link Established")
                    : "Link Severed",
                description: wasActionLinking
                    ? `Identity protocol initialized with @${profileUser?.username}`
                    : `Link with @${profileUser?.username} has been archived`
            });
        },
        onError: (err: any) => {
            console.error("Link mutation failed:", err);
            toast({
                title: "Protocol Fault",
                description: err.message || "The linking operation was interrupted.",
                variant: "destructive"
            });
        }
    });

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
                linkedinUrl,
                githubStatsVisible
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
            setGithubStatsVisible(currentUser.githubStatsVisible !== false);
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
        enabled: !!username && username !== 'undefined' && (username !== 'me' || !!currentUser)
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
        return <HamsterLoader fullPage size={20} />;
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
                        {levelInfo && (
                            <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold tracking-wider border border-emerald-500/20">
                                LVL {levelInfo.level}
                            </span>
                        )}
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

                    {/* Settings & Admin Buttons (Own Profile) */}
                    {currentUser?.id === profileUser.id ? (
                        <div className="flex flex-col gap-2 w-full max-w-xs mx-auto">
                            <Link to="/settings" className="w-full">
                                <Button variant="outline" size="sm" className="w-full gap-2 h-11 rounded-xl">
                                    <Settings className="h-4 w-4" /> Edit Profile
                                </Button>
                            </Link>
                            <Link to="/create" className="w-full">
                                <Button size="sm" className="w-full gap-2 h-11 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                                    <Plus className="h-4 w-4" /> Create Snippet
                                </Button>
                            </Link>
                            {currentUser?.role === 'ADMIN' && (
                                <Link to="/admin" className="w-full">
                                    <Button variant="secondary" size="sm" className="w-full gap-2 h-11 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                                        <Shield className="h-4 w-4" /> Admin Control Panel
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2 w-full max-w-xs mx-auto">
                            <Button
                                onClick={() => toggleLink({ currentIsLinked: isLinked, currentIsPending: isPending })}
                                disabled={isLinkPending}
                                className={cn(
                                    "flex-1 gap-2 h-11 rounded-xl transition-all duration-300 font-black uppercase tracking-widest text-[10px]",
                                    isLinked
                                        ? "bg-muted text-muted-foreground border border-border"
                                        : "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                )}
                            >
                                {isLinkPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : isLinked ? <UserMinus className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                                {isLinkPending ? "Syncing.." : isLinked ? "Unlink" : isPending ? "Wait.." : "Link"}
                            </Button>
                            <Button
                                onClick={() => openChatWith(profileUser.id)}
                                variant="outline"
                                className="h-11 w-11 p-0 rounded-xl border-border"
                            >
                                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>
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
                        <div className="text-2xl font-bold text-foreground">{profileUser.linkersCount || 0}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Linkers</div>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="snippets" className="space-y-4">
                    <TabsList className="w-full grid grid-cols-3 bg-muted/30 border border-border p-1 h-12 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="gap-1.5 transition-all text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                        >
                            <Terminal className="h-3.5 w-3.5" /> Info
                        </TabsTrigger>
                        <TabsTrigger
                            value="snippets"
                            className="gap-1.5 transition-all text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                        >
                            <Code className="h-3.5 w-3.5" /> Code
                        </TabsTrigger>
                        <TabsTrigger
                            value="badges"
                            className="gap-1.5 transition-all text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                        >
                            <Trophy className="h-3.5 w-3.5" /> Badges
                        </TabsTrigger>
                        {githubEnabled && (
                            <TabsTrigger
                                value="github"
                                className="gap-1.5 transition-all text-[10px] font-black uppercase tracking-tight data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
                            >
                                <Github className="h-3.5 w-3.5" /> GitHub
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                        {/* Mobile Overview Content */}
                        <div className="bg-surface border border-border p-4 rounded-xl space-y-3">
                            <h3 className="text-[10px] font-black text-white/40 uppercase tracking-widest">About Developer</h3>
                            <p className="text-sm text-foreground leading-relaxed">{profileUser.bio || "No bio provided."}</p>
                            <div className="pt-2 flex flex-wrap gap-2">
                                {profileUser.preferredLanguages?.map((l: string) => (
                                    <span key={l} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">{l}</span>
                                ))}
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="snippets" className="space-y-4">
                        {snippets.length > 0 ? (
                            <div className="space-y-4">
                                {snippets.slice(0, 6).map((snippet: any) => (
                                    <SnippetCard key={snippet.id} snippet={snippet} className="max-w-none mx-0 mb-0" />
                                ))}
                            </div>
                        ) : (
                            <div className="py-12 border border-dashed border-border rounded-xl bg-surface/30 text-center px-6">
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

                    {githubEnabled && (
                        <TabsContent value="github">
                            {profileUser.githubStats ? (
                                <GithubStats stats={JSON.parse(profileUser.githubStats)} isOwn={currentUser?.id === profileUser.id} />
                            ) : (
                                <div className="py-12 border border-dashed border-border rounded-xl bg-surface/30 text-center px-6">
                                    <Github className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                                    <h4 className="text-base font-bold text-foreground mb-2">GitHub Not Linked</h4>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {currentUser?.id === profileUser.id
                                            ? "Connect your GitHub account to showcase your stats, repositories, and languages."
                                            : "This developer hasn't linked their GitHub account yet."
                                        }
                                    </p>
                                    {currentUser?.id === profileUser.id && (
                                        <Button
                                            onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/github`}
                                            className="gap-2"
                                        >
                                            <Github className="h-4 w-4" /> Connect GitHub
                                        </Button>
                                    )}
                                </div>
                            )}
                        </TabsContent>
                    )}
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
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-surface border border-border p-6 rounded-2xl relative overflow-hidden">
                {/* Aura Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative">
                    {/* Replace standard Avatar with AuraAvatar if available, else standard */}
                    <Link to="/settings/avatars" className="block relative group">
                        <Avatar className={cn("h-24 w-24 border-4 border-canvas shadow-lg transition-transform group-hover:scale-105",
                            currentUser?.equippedAura === 'aura_neon_cyberpunk' && "ring-4 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)]",
                            currentUser?.equippedAura === 'aura_golden_master' && "ring-4 ring-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.6)]",
                            currentUser?.equippedAura === 'aura_void_walker' && "ring-4 ring-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.6)]",
                        )}>
                            <AvatarImage src={profileUser.image} className="object-cover" />
                            <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                                {profileUser.username[0].toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        {currentUser?.id === profileUser.id && (
                            <div className="absolute bottom-0 right-0 bg-background border border-border p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <Settings className="h-3 w-3 text-muted-foreground" />
                            </div>
                        )}
                    </Link>
                </div>

                <div className="flex-1 space-y-4 relative z-10">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold font-headline text-foreground tracking-tight">
                            {profileUser.name || profileUser.username}
                        </h1>
                        {levelInfo && (
                            <div className="flex flex-col gap-1 min-w-[120px]">
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-black tracking-widest border border-primary/20 shadow-[0_0_10px_rgba(var(--primary),0.1)]">
                                        Level {levelInfo.level}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                                        {levelInfo.progress}%
                                    </span>
                                </div>
                                <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden border border-white/5 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${levelInfo.progress}%` }}
                                        transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
                                        className="h-full bg-gradient-to-r from-primary via-purple-500 to-primary/80 relative"
                                    />
                                </div>
                            </div>
                        )}
                        {currentUser?.influence && currentUser.influence > 50 && (
                            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 text-[10px] uppercase font-bold tracking-wider border border-purple-500/20 flex items-center gap-1">
                                <Shield className="h-3 w-3" /> High Influence
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            @{profileUser.username}
                        </span>

                        <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <Calendar className="h-3.5 w-3.5 opacity-50" />
                            Joined {format(new Date(profileUser.createdAt), 'MMMM yyyy')}
                        </span>

                        {profileUser.city && (
                            <span className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                <MapPin className="h-3.5 w-3.5 opacity-50" />
                                {profileUser.city}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-8 py-1">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
                                {profileUser.linkersCount || 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Linkers</span>
                        </div>
                        <div className="w-px h-8 bg-border/40" />
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-foreground tabular-nums group-hover:text-primary transition-colors">
                                {profileUser.linkedCount || 0}
                            </span>
                            <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Linked</span>
                        </div>
                    </div>

                    {profileUser.bio && (
                        <p className="text-sm text-muted-foreground max-w-xl leading-relaxed italic border-l-2 border-primary/20 pl-4 py-1">
                            "{profileUser.bio}"
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        {profileUser.githubUrl && (
                            <a
                                href={profileUser.githubUrl.startsWith('http') ? profileUser.githubUrl : `https://${profileUser.githubUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-all border border-border/50 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                                GitHub
                            </a>
                        )}
                        {profileUser.linkedinUrl && (
                            <a
                                href={profileUser.linkedinUrl.startsWith('http') ? profileUser.linkedinUrl : `https://${profileUser.linkedinUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-blue-400 transition-all border border-border/50 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <Linkedin className="h-3.5 w-3.5" />
                                LinkedIn
                            </a>
                        )}
                        {profileUser.instagramUrl && (
                            <a
                                href={profileUser.instagramUrl.startsWith('http') ? profileUser.instagramUrl : `https://${profileUser.instagramUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-[10px] font-bold text-muted-foreground hover:text-indigo-400 transition-all border border-border/50 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
                            >
                                <Users className="h-3.5 w-3.5" />
                                Connection
                            </a>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-4 self-stretch md:self-auto justify-start items-end">
                    <div className="flex flex-wrap gap-2 justify-end">
                        {currentUser?.id === profileUser.id && (
                            <Link to="/settings">
                                <Button variant="outline" size="sm" className="gap-2 font-mono text-[10px] font-black uppercase tracking-widest h-11 px-4 border-white/10 hover:bg-white/5 transition-all">
                                    <Settings className="h-4 w-4" /> Configure Profile
                                </Button>
                            </Link>
                        )}
                        {currentUser?.id !== profileUser.id && (
                            <Button
                                variant={isLinked ? "outline" : "default"}
                                size="sm"
                                className={cn(
                                    "gap-2 font-mono text-[10px] font-black uppercase tracking-widest h-11 px-6 transition-all",
                                    !isLinked && "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_4px_20px_rgba(var(--primary),0.2)]",
                                    isLinked && "border-primary/20 text-primary hover:bg-primary/5"
                                )}
                                onClick={() => toggleLink({ currentIsLinked: isLinked, currentIsPending: isPending })}
                                disabled={isLinkPending}
                            >
                                {isLinkPending ? (
                                    <HamsterLoader size={4} className="h-4 w-4" />
                                ) : isLinked ? (
                                    <>
                                        <UserMinus className="h-4 w-4" /> Unlink
                                    </>
                                ) : isPending ? (
                                    <>
                                        <Info className="h-4 w-4" /> Requested
                                    </>
                                ) : (
                                    <>
                                        <UserPlus className="h-4 w-4" /> Link
                                    </>
                                )}
                            </Button>
                        )}
                        {currentUser?.id !== profileUser.id && (
                            <Button
                                variant="secondary"
                                size="sm"
                                className="gap-2 font-mono text-[10px] font-black uppercase tracking-widest h-11 px-5 border border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                                onClick={() => openChatWith({ user: profileUser, unreadCount: 0 })}
                            >
                                <MessageSquare className="h-4 w-4 text-primary" /> Message
                            </Button>
                        )}
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2 font-mono text-[10px] font-black uppercase tracking-widest h-11 px-4 border border-white/5 bg-white/5 hover:bg-white/10 transition-all"
                            onClick={() => setIsShareModalOpen(true)}
                        >
                            <Share2 className="h-4 w-4 text-primary" /> Share
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
                <TabsList className="bg-muted/30 border border-border p-1 h-14 rounded-2xl">
                    <TabsTrigger
                        value="overview"
                        className="gap-2 px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-xl transition-all duration-300"
                    >
                        <Terminal className="h-3.5 w-3.5" /> Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="snippets"
                        className="gap-2 px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-xl transition-all duration-300"
                    >
                        <Code className="h-3.5 w-3.5" /> Snippets
                    </TabsTrigger>
                    <TabsTrigger
                        value="badges"
                        className="gap-2 px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-xl transition-all duration-300"
                    >
                        <Trophy className="h-3.5 w-3.5" /> Badges & Progress
                    </TabsTrigger>
                    {githubEnabled && profileUser.githubUrl && (
                        <TabsTrigger
                            value="github"
                            className="gap-2 px-8 font-black uppercase tracking-widest text-[10px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm rounded-xl transition-all duration-300"
                        >
                            <Github className="h-3.5 w-3.5" /> GitHub Stats
                        </TabsTrigger>
                    )}
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
                                <div className="col-span-full py-12 border border-dashed border-border rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center px-6">
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
                        <div className="py-20 border border-dashed border-border rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center px-6">
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

                {/* GitHub Stats Tab Content */}
                {githubEnabled && profileUser.githubUrl && (
                    <TabsContent value="github" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {(() => {
                            // Extract username from URL safely
                            const githubUsername = profileUser.githubUrl.split('/').pop() || '';
                            const themeString = theme === 'dark' ? 'radical' : 'default'; // 'radical' is a nice dark theme for stats

                            return (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-2">
                                                <Github className="h-4 w-4" /> General Stats
                                            </h3>
                                            <img
                                                src={`https://github-readme-stats.vercel.app/api?username=${githubUsername}&show_icons=true&theme=${themeString}&hide_border=true&bg_color=00000000`}
                                                alt="GitHub Stats"
                                                className="w-full h-auto rounded-xl border border-border bg-surface"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-2">
                                                <Code className="h-4 w-4" /> Top Languages
                                            </h3>
                                            <img
                                                src={`https://github-readme-stats.vercel.app/api/top-langs/?username=${githubUsername}&layout=compact&theme=${themeString}&hide_border=true&bg_color=00000000`}
                                                alt="Top Languages"
                                                className="w-full h-auto rounded-xl border border-border bg-surface"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <h3 className="text-sm font-bold font-mono uppercase tracking-widest text-foreground flex items-center gap-2 mb-4">
                                            <Calendar className="h-4 w-4" /> Contribution Streak
                                        </h3>
                                        <img
                                            src={`https://github-readme-streak-stats.herokuapp.com/?user=${githubUsername}&theme=${themeString}&hide_border=true&background=00000000`}
                                            alt="GitHub Streak"
                                            className="w-full h-auto rounded-xl border border-border bg-surface"
                                        />
                                    </div>
                                </div>
                            );
                        })()}
                    </TabsContent>
                )}
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

// --- Sub-components ---

function GithubStats({ stats, isOwn }: { stats: any, isOwn: boolean }) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Github className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold font-headline">GitHub Engineering Metrics</h2>
                </div>
                {isOwn && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 h-9 text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5"
                        onClick={async () => {
                            try {
                                const resp = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/users/profile/github/sync`, {
                                    method: 'POST',
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
                                });
                                if (resp.ok) {
                                    window.location.reload();
                                }
                            } catch (e) { }
                        }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Sync Latest
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-1 shadow-sm">
                    <div className="text-3xl font-black text-foreground">{stats.public_repos || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Public Repositories</div>
                </div>
                <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-1 shadow-sm">
                    <div className="text-3xl font-black text-foreground">{stats.followers || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">GitHub followers</div>
                </div>
                <div className="bg-surface border border-border p-6 rounded-xl text-center space-y-1 shadow-sm">
                    <div className="text-3xl font-black text-foreground">{stats.stars_received || 0}</div>
                    <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Stars Received</div>
                </div>
            </div>

            {stats.top_languages && stats.top_languages.length > 0 && (
                <div className="bg-surface border border-border p-8 rounded-xl space-y-6 shadow-sm">
                    <h3 className="text-sm font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                        <Code className="h-4 w-4 text-primary" /> Technology Stack Distribution
                    </h3>
                    <div className="space-y-4">
                        {stats.top_languages.map((lang: string) => (
                            <div key={lang} className="space-y-1.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span>{lang}</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/20 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        className="h-full bg-primary/40 rounded-full"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-40">
                    Last Compiled: {new Date(stats.last_updated_at).toLocaleString()}
                </p>
            </div>
        </div>
    );
}

