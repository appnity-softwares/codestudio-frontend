// PublicProfile.tsx - Unified with Profile.tsx layout
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, Instagram, Share2, Trophy, Terminal, Code, Shield, Copy } from "lucide-react";
import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { SnippetCard } from "@/components/SnippetCard";
import { BadgeTab } from "@/components/profile/BadgeTab";
import { Seo } from "@/components/Seo";

export default function PublicProfile() {
    const { username } = useParams<{ username: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Fetch Public Profile
    const { data, isLoading, error } = useQuery({
        queryKey: ['public-profile', username],
        queryFn: () => usersAPI.getPublicProfile(username!),
        enabled: !!username,
        retry: false
    });

    // Fetch Summary Data
    const { data: summaryData } = useQuery({
        queryKey: ['summary', username],
        queryFn: () => usersAPI.getProfileSummary(username),
        enabled: !!username,
        retry: false,
        staleTime: 5 * 60 * 1000,
    });

    // Fetch Snippets
    const { data: snippetsData } = useQuery({
        queryKey: ['user-snippets', data?.user?.id],
        queryFn: () => usersAPI.getSnippets(data?.user?.id),
        enabled: !!data?.user?.id,
        retry: false,
        staleTime: 5 * 60 * 1000
    });

    const snippets = snippetsData?.snippets || [];
    const snippetCount = summaryData?.snippets?.total || 0;
    const contestCount = summaryData?.arena?.contestsJoined || 0;
    const langStats = summaryData?.snippets?.byLanguage || { typescript: 0, python: 0, go: 0 };
    const totalSpecific = (langStats.typescript || 0) + (langStats.python || 0) + (langStats.go || 0);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="h-4 w-4 rounded-sm bg-primary animate-ping" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Shield className="h-12 w-12 text-muted-foreground/30" />
                <h3 className="text-xl font-bold font-mono">USER_NOT_FOUND</h3>
                <p className="text-muted-foreground">This user's profile is private or does not exist.</p>
                <Button onClick={() => navigate('/')} variant="outline">Go Home</Button>
            </div>
        );
    }

    const user = data.user;
    const profileUrl = window.location.href;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl);
        toast({ title: "Link copied", description: "Profile URL copied to clipboard" });
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto p-6 pb-20 fade-in">
            {user && (
                <Seo
                    title={`${user.name || user.username} (@${user.username}) | CodeStudio`}
                    description={user.bio || `Check out ${user.name}'s developer profile on CodeStudio.`}
                    type="profile"
                    image={user.image}
                    url={window.location.href}
                />
            )}

            {/* 1. Identity Header - Same as Profile.tsx */}
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center bg-surface border border-border p-6 rounded-2xl">
                <Avatar className="h-24 w-24 border-4 border-canvas shadow-lg">
                    <AvatarImage src={user.image} className="object-cover" />
                    <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                        {user.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-3xl font-bold font-headline text-foreground">
                            {user.name || user.username}
                        </h1>
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-wider border border-primary/20">
                            {user.role || "Developer"}
                        </span>
                        {/* Trust Badge */}
                        {user.trustScore >= 90 && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] uppercase font-bold tracking-wider border border-emerald-500/20">
                                High Trust
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            @{user.username}
                        </span>
                        <span>•</span>
                        <span>Joined {format(new Date(user.createdAt), 'MMM yyyy')}</span>
                    </div>

                    {user.bio && (
                        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                            {user.bio}
                        </p>
                    )}

                    {/* Social Links */}
                    <div className="flex gap-2 pt-2">
                        {user.githubUrl && (
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(user.githubUrl, '_blank')}>
                                <Github className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        {user.instagramUrl && (
                            <Button size="sm" variant="outline" className="gap-2" onClick={() => window.open(user.instagramUrl, '_blank')}>
                                <Instagram className="h-3.5 w-3.5" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Share Button */}
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs uppercase tracking-wider">
                            <Share2 className="h-3.5 w-3.5" /> Share
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Share Profile</DialogTitle>
                            <DialogDescription>
                                Scan to visit {user.name}'s profile directly.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center justify-center py-6 bg-white rounded-lg border">
                            <QRCodeSVG value={profileUrl} size={200} />
                        </div>
                        <Button type="button" variant="secondary" onClick={copyToClipboard} className="w-full">
                            <Copy className="h-4 w-4 mr-2" />
                            Copy Link
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            {/* TABS NAVIGATION - Same structure as Profile.tsx */}
            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-surface border border-border">
                    <TabsTrigger value="overview" className="gap-2">
                        <Terminal className="h-4 w-4" /> Overview
                    </TabsTrigger>
                    <TabsTrigger value="snippets" className="gap-2">
                        <Code className="h-4 w-4" /> Snippets
                    </TabsTrigger>
                    <TabsTrigger value="badges" className="gap-2">
                        <Trophy className="h-4 w-4" /> Badges
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Stats Grid - Same as Profile.tsx */}
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

                    {/* Work Showcase */}
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
                                <div className="col-span-full py-12 border border-dashed border-white/10 rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center px-6">
                                    <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                        <Terminal className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                    <h4 className="text-base font-bold text-foreground mb-2">No Public Snippets</h4>
                                    <p className="text-sm text-muted-foreground mb-3 max-w-md">
                                        This developer hasn't shared any public snippets yet.
                                    </p>
                                    <p className="text-xs text-muted-foreground/60 max-w-sm">
                                        <strong>What happens next?</strong> When they publish snippets, you'll see their code previews, outputs, and engagement stats here.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="snippets" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {snippets.map((snippet: any) => (
                            <SnippetCard key={snippet.id} snippet={snippet} />
                        ))}
                        {snippets.length === 0 && (
                            <div className="col-span-full py-12 border border-dashed border-white/10 rounded-xl bg-surface/30 flex flex-col items-center justify-center text-center px-6">
                                <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mb-4">
                                    <Terminal className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h4 className="text-base font-bold text-foreground mb-2">No Snippets Yet</h4>
                                <p className="text-sm text-muted-foreground mb-3 max-w-md">
                                    This developer hasn't published any snippets.
                                </p>
                                <p className="text-xs text-muted-foreground/60 max-w-sm">
                                    <strong>What happens next?</strong> Snippets they create will appear here as interactive code cards.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="badges" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <BadgeTab username={user.username} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
