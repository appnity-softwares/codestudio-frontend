import { Button } from "@/components/ui/button";
import { Theme } from "@/context/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Save, LogOut, Loader2, Palette, Database, Camera, Github, Instagram } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useState, useRef } from "react";
import { uploadAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ProfileSettingsProps {
    name: string;
    setName: (name: string) => void;
    username: string;
    setUsername: (username: string) => void;
    bio: string;
    setBio: (bio: string) => void;
    visibility: string;
    setVisibility: (v: string) => void;
    onSave: () => void;
    isLoading: boolean;
    signOut: () => void;
    theme: Theme | undefined;
    setTheme: (theme: Theme) => void;
    currentImage?: string;
    onImageUpdate?: (url: string) => void;
    githubUrl?: string;
    setGithubUrl?: (url: string) => void;
    instagramUrl?: string;
    setInstagramUrl?: (url: string) => void;
}

export function ProfileSettings({
    name, setName, username, setUsername, bio, setBio,
    visibility, setVisibility,
    onSave, isLoading, signOut, theme, setTheme,
    currentImage, onImageUpdate,
    githubUrl = "", setGithubUrl,
    instagramUrl = "", setInstagramUrl
}: ProfileSettingsProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPreviewUrl(reader.result as string);
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);
        try {
            const result = await uploadAPI.profileImage(file);
            if (result.url) {
                onImageUpdate?.(result.url);
                toast({ title: "Image uploaded successfully!" });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Upload failed" });
            setPreviewUrl(null);
        } finally {
            setIsUploading(false);
        }
    };

    const ProtocolLogo = ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Image Upload */}
                    <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="flex items-center gap-2 italic">
                                <Camera className="h-5 w-5 text-primary" />
                                Profile Avatar
                            </CardTitle>
                            <CardDescription className="text-white/30 uppercase text-[10px] tracking-widest font-black">Update your visual identity</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 pt-4">
                            <div className="flex items-center gap-6">
                                <div className="relative group">
                                    <Avatar className="h-24 w-24 border-2 border-primary/30">
                                        <AvatarImage src={previewUrl || currentImage} />
                                        <AvatarFallback className="text-2xl">{username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                    </Avatar>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? (
                                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                                        ) : (
                                            <Camera className="h-6 w-6 text-white" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-white/70 mb-2">Click the avatar to upload a new image</p>
                                    <p className="text-xs text-white/40">Supports JPG, PNG, GIF. Max 5MB.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="flex items-center gap-2 italic">
                                <Database className="h-5 w-5 text-primary" />
                                Operative Identity
                            </CardTitle>
                            <CardDescription className="text-white/30 uppercase text-[10px] tracking-widest font-black">Link your neural profile</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4 pt-4">
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase text-white/50 ml-1">Codename</Label>
                                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl bg-black/20 border-white/10" placeholder="Display Name" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase text-white/50 ml-1">Nexus ID</Label>
                                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="rounded-xl bg-black/20 border-white/10" placeholder="Username" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase text-white/50 ml-1">Neural Bio</Label>
                                <Textarea value={bio} onChange={(e) => setBio(e.target.value)} className="rounded-xl bg-black/20 border-white/10 min-h-[100px]" placeholder="Explain your core logic..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase text-white/50 ml-1 flex items-center gap-1">
                                        <Github className="h-3 w-3" /> GitHub
                                    </Label>
                                    <Input
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl?.(e.target.value)}
                                        className="rounded-xl bg-black/20 border-white/10"
                                        placeholder="https://github.com/username"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase text-white/50 ml-1 flex items-center gap-1">
                                        <Instagram className="h-3 w-3" /> Instagram
                                    </Label>
                                    <Input
                                        value={instagramUrl}
                                        onChange={(e) => setInstagramUrl?.(e.target.value)}
                                        className="rounded-xl bg-black/20 border-white/10"
                                        placeholder="https://instagram.com/username"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="flex items-center gap-2 italic">
                                <Shield className="h-5 w-5 text-primary" />
                                Security Protocols
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5">
                                <div className="space-y-0.5">
                                    <Label className="uppercase text-[10px] font-black tracking-widest">Shadow Protocol</Label>
                                    <p className="text-[10px] text-white/30 font-medium">Conceal your activity from non-operatives</p>
                                </div>
                                <Switch
                                    checked={visibility === 'PRIVATE'}
                                    onCheckedChange={(checked) => setVisibility(checked ? 'PRIVATE' : 'PUBLIC')}
                                />
                            </div>
                            <Button variant="ghost" className="w-full justify-between hover:bg-red-500/10 hover:text-red-400 group rounded-xl" onClick={signOut}>
                                <span className="uppercase text-[10px] font-black tracking-widest">Terminate Session</span>
                                <LogOut className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none bg-white/5 backdrop-blur-md p-6">
                        <CardHeader className="px-0 pt-0">
                            <CardTitle className="flex items-center gap-2 italic">
                                <Palette className="h-5 w-5 text-primary" />
                                UI Layer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setTheme('light')} className={`p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}>
                                    <div className="h-12 w-full bg-white rounded-lg mb-2 shadow-inner" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center block">Solar Protocol</span>
                                </button>
                                <button onClick={() => setTheme('dark')} className={`p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}>
                                    <div className="h-12 w-full bg-slate-900 rounded-lg mb-2 shadow-inner" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-center block">Obsidian Link</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-8 rounded-[2rem] bg-gradient-to-br from-primary/20 to-purple-600/20 border border-primary/20 relative overflow-hidden group">
                        <ProtocolLogo className="absolute -right-4 -bottom-4 h-32 w-32 text-primary/10 group-hover:scale-110 transition-transform duration-700" />
                        <h4 className="font-black italic text-white mb-2">Sync Status</h4>
                        <p className="text-[10px] text-white/50 uppercase tracking-[0.2em] mb-6">Nexus connection active</p>
                        <Button className="w-full rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 gap-2" onClick={onSave} disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Sync Configuration
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
