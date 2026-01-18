"use client"

import * as React from "react"
import { Copy, Check, Share2, Search, Send, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersAPI } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"

interface ShareDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    url: string;
    title: string;
}

export function ShareDialog({ open, onOpenChange, url, title }: ShareDialogProps) {
    const { user } = useAuth();
    const [copied, setCopied] = React.useState(false);
    const [following, setFollowing] = React.useState<any[]>([]);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [loading, setLoading] = React.useState(false);
    const [sentUsers, setSentUsers] = React.useState<Set<string>>(new Set());

    React.useEffect(() => {
        if (open && user) {
            const fetchFollowing = async () => {
                try {
                    setLoading(true);
                    const { following } = await usersAPI.getFollowing(user.id);
                    setFollowing(following);
                } catch (error) {
                    console.error("Failed to load following", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchFollowing();
        }
    }, [open, user]);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = (userId: string) => {
        // Simulate sending
        setSentUsers(prev => new Set(prev).add(userId));
    };

    const filteredFollowing = following.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const shareLinks = [
        { name: "WhatsApp", icon: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg", href: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}` },
        { name: "Twitter", icon: "https://abs.twimg.com/icons/apple-touch-icon-192x192.png", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
        { name: "LinkedIn", icon: "https://content.linkedin.com/content/dam/me/business/en-us/amp/brand-site/v2/bg/LI-Bug.svg.original.svg", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-[#0c0c0e] border-white/10 text-white p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 border-b border-white/5">
                    <DialogTitle className="text-xl font-bold">Share to...</DialogTitle>
                    <DialogDescription className="text-white/50">
                        Share this snippet with your friends and community.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 space-y-6">
                    {/* Social Links */}
                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                        <div className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer group" onClick={handleCopy}>
                            <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                                {copied ? <Check className="h-6 w-6 text-green-400" /> : <Copy className="h-6 w-6 text-white" />}
                            </div>
                            <span className="text-xs text-white/50 group-hover:text-white transition-colors">{copied ? "Copied" : "Copy Link"}</span>
                        </div>
                        {shareLinks.map((link) => (
                            <a key={link.name} href={link.href} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 min-w-[60px] cursor-pointer group">
                                <div className="h-14 w-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors overflow-hidden p-3.5">
                                    <img src={link.icon} alt={link.name} className="w-full h-full object-contain filter brightness-0 invert opacity-80 group-hover:opacity-100 group-hover:brightness-100 group-hover:invert-0 transition-all" />
                                </div>
                                <span className="text-xs text-white/50 group-hover:text-white transition-colors">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Label className="text-xs font-bold uppercase tracking-widest text-white/40">Share with Following</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-white/30" />
                            <Input
                                placeholder="Search friends..."
                                className="pl-9 bg-white/5 border-white/10 focus:border-white/20 text-white placeholder:text-white/20 h-10 rounded-xl"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <ScrollArea className="h-[200px] -mx-2">
                            {loading ? (
                                <div className="flex justify-center p-4">
                                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-transparent animate-spin" />
                                </div>
                            ) : filteredFollowing.length === 0 ? (
                                <div className="text-center p-8 text-white/30 text-sm">
                                    {searchQuery ? "No matching users found." : "Follow users to share directly."}
                                </div>
                            ) : (
                                <div className="space-y-1 px-2">
                                    {filteredFollowing.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-10 w-10 border border-white/10">
                                                    <AvatarImage src={u.image} />
                                                    <AvatarFallback>{u.username[0].toUpperCase()}</AvatarFallback>
                                                </Avatar>
                                                <div className="text-left">
                                                    <div className="text-sm font-medium text-white">{u.name}</div>
                                                    <div className="text-xs text-white/40">@{u.username}</div>
                                                </div>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant={sentUsers.has(u.id) ? "secondary" : "default"}
                                                className={`h-8 rounded-full px-4 text-xs font-bold ${sentUsers.has(u.id) ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : ""}`}
                                                onClick={() => handleSend(u.id)}
                                                disabled={sentUsers.has(u.id)}
                                            >
                                                {sentUsers.has(u.id) ? "Sent" : "Send"}
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="link" className="sr-only">Link</Label>
                        <div className="flex-1 flex items-center bg-black/40 border border-white/10 rounded-xl px-3 h-10 overflow-hidden">
                            <span className="text-xs text-white/40 truncate flex-1">{url}</span>
                        </div>
                        <Button size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-white text-black hover:bg-white/90" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
