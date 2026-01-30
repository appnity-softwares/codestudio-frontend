import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Github, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HamsterLoader } from "@/components/shared/HamsterLoader";

export default function GithubSettings() {
    const { user, refreshUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    // Initial state based on current user settings or defaults
    const [settings, setSettings] = useState({
        show_bio: true,
        show_company: true,
        show_location: true,
        show_blog: true,
        show_twitter: true,
        show_stats: true,
        show_repos: true,
        show_languages: true
    });

    useEffect(() => {
        if (user?.githubStats) {
            try {
                const stats = JSON.parse(user.githubStats);
                if (stats.settings) {
                    setSettings(stats.settings);
                }
            } catch (e) {
                console.error("Failed to parse GitHub settings", e);
            }
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/profile/github/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(settings)
            });

            if (!response.ok) throw new Error("Failed to update settings");

            await refreshUser();
            toast({ title: "GitHub preference updated" });
        } catch (error) {
            toast({ title: "Update failed", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return <HamsterLoader fullPage />;

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4 space-y-8 fade-in">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="h-12 w-12 rounded-xl bg-surface border border-border flex items-center justify-center">
                    <Github className="h-6 w-6 text-foreground" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold font-headline">GitHub Configuration</h1>
                    <p className="text-muted-foreground text-sm">Control what information from GitHub is displayed on your profile.</p>
                </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="bio" className="text-base font-bold">Bio & Description</Label>
                        <p className="text-xs text-muted-foreground">Show your GitHub bio text.</p>
                    </div>
                    <Switch
                        id="bio"
                        checked={settings.show_bio}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_bio: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="company" className="text-base font-bold">Company / Organization</Label>
                        <p className="text-xs text-muted-foreground">Display your current workplace or organization.</p>
                    </div>
                    <Switch
                        id="company"
                        checked={settings.show_company}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_company: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="location" className="text-base font-bold">Location</Label>
                        <p className="text-xs text-muted-foreground">Show your geographical location.</p>
                    </div>
                    <Switch
                        id="location"
                        checked={settings.show_location}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_location: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="stats" className="text-base font-bold">Key Metrics</Label>
                        <p className="text-xs text-muted-foreground">Followers, Following, and Total Stars count.</p>
                    </div>
                    <Switch
                        id="stats"
                        checked={settings.show_stats}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_stats: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="repos" className="text-base font-bold">Top Repositories</Label>
                        <p className="text-xs text-muted-foreground">Show your top 3 starred repositories.</p>
                    </div>
                    <Switch
                        id="repos"
                        checked={settings.show_repos}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_repos: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="blog" className="text-base font-bold">Blog / Website</Label>
                        <p className="text-xs text-muted-foreground">Display your linked website or blog.</p>
                    </div>
                    <Switch
                        id="blog"
                        checked={settings.show_blog}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_blog: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="twitter" className="text-base font-bold">Twitter / X</Label>
                        <p className="text-xs text-muted-foreground">Show your Twitter handle.</p>
                    </div>
                    <Switch
                        id="twitter"
                        checked={settings.show_twitter}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_twitter: c }))}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <Label htmlFor="languages" className="text-base font-bold">Language Stack</Label>
                        <p className="text-xs text-muted-foreground">Display your most used programming languages.</p>
                    </div>
                    <Switch
                        id="languages"
                        checked={settings.show_languages}
                        onCheckedChange={(c) => setSettings(prev => ({ ...prev, show_languages: c }))}
                    />
                </div>
            </div>

            <div className="flex gap-4">
                <Button onClick={handleSave} disabled={isLoading} className="gap-2 min-w-[120px]">
                    {isLoading ? <HamsterLoader size={4} className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
        </div>
    );
}
