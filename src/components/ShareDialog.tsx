"use client"

import * as React from "react"
import { Check, Search, Link2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usersAPI, messagesAPI, systemAPI, API_URL } from "@/lib/api"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

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

    // URL Shortening State
    const [shortUrl, setShortUrl] = React.useState(url);
    const [isShortening, setIsShortening] = React.useState(false);

    React.useEffect(() => {
        if (open) {
            // Reset to original URL initially
            setShortUrl(url);

            // Shorten URL
            const shortenUrl = async () => {
                setIsShortening(true);
                try {
                    const response = await systemAPI.shortenURL(url);
                    // Construct full URL. Backend returns /s/CODE.
                    // We assume API_URL is http://host:port/api, so we strip /api
                    const baseUrl = API_URL.replace(/\/api\/?$/, '');
                    setShortUrl(`${baseUrl}${response.shortUrl}`);
                } catch (error) {
                    console.error("Failed to shorten URL", error);
                } finally {
                    setIsShortening(false);
                }
            };

            shortenUrl();

            // Fetch following if user logged in
            if (user) {
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
        }
    }, [open, url, user]);

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSend = async (userId: string) => {
        try {
            await messagesAPI.sendMessage(userId, `Check out this snippet: ${title}\n\n${shortUrl}`, {
                type: 'text'
            });
            setSentUsers(prev => new Set(prev).add(userId));
        } catch (error) {
            console.error("Failed to send snippet to friend", error);
        }
    };

    const filteredFollowing = following.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Limit to showing only 3 friends max to prevent overflow, unless searching
    const displayFriends = searchQuery ? filteredFollowing : filteredFollowing.slice(0, 3);

    const shareLinks = [
        {
            name: "WhatsApp",
            color: "hover:text-[#25D366] hover:bg-[#25D366]/10 hover:border-[#25D366]/20",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
            ),
            href: `https://wa.me/?text=${encodeURIComponent(title + " " + shortUrl)}`
        },
        {
            name: "X",
            color: "hover:text-white hover:bg-white/10 hover:border-white/20",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
            ),
            href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shortUrl)}`
        },
        {
            name: "LinkedIn",
            color: "hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 hover:border-[#0A66C2]/20",
            icon: (
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
            ),
            href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shortUrl)}`
        },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95%] max-w-[480px] rounded-[24px] bg-[#09090b] border-white/10 text-white p-0 shadow-2xl outline-none">
                <DialogHeader className="px-6 pt-6 pb-2 relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold">Share Snippet</DialogTitle>
                            <DialogDescription className="text-sm text-zinc-400 mt-1">
                                Share <span className="text-white font-medium">"{title}"</span> with your network.
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-6">
                    {/* Social Grid - Larger */}
                    <div className="grid grid-cols-4 gap-4 py-2">
                        <button
                            onClick={handleCopy}
                            className={cn(
                                "flex flex-col items-center gap-3 group transition-all duration-200",
                                copied ? "text-green-400" : "text-zinc-400 hover:text-white"
                            )}
                        >
                            <div className={cn(
                                "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-300 border border-transparent",
                                copied
                                    ? "bg-green-500/10 border-green-500/20 text-green-400"
                                    : "bg-zinc-900 group-hover:bg-zinc-800"
                            )}>
                                {copied ? <Check className="h-6 w-6" /> : <Link2 className="h-6 w-6" />}
                            </div>
                            <span className="text-[11px] font-medium tracking-wide">Copy</span>
                        </button>

                        {shareLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                target="_blank"
                                rel="noreferrer"
                                className={cn(
                                    "flex flex-col items-center gap-3 group transition-all duration-200 text-zinc-400",
                                    link.color
                                )}
                            >
                                <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center transition-all duration-300 border border-transparent group-hover:border-current">
                                    {link.icon}
                                </div>
                                <span className="text-[11px] font-medium tracking-wide">{link.name}</span>
                            </a>
                        ))}
                    </div>

                    <div className="h-px bg-white/5 w-full" />

                    {/* Quick Send Container */}
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <Input
                                placeholder="Search friends to send..."
                                className="pl-10 bg-zinc-900/50 border-white/5 focus:border-white/10 focus:bg-zinc-900 text-sm h-10 rounded-xl transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* List only shows up to 3 items, no scroll unless searching */}
                        <div className="space-y-1">
                            {loading ? (
                                <div className="flex justify-center py-4">
                                    <div className="h-4 w-4 rounded-full border-2 border-zinc-600 border-t-transparent animate-spin" />
                                </div>
                            ) : displayFriends.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-4 text-center">
                                    <p className="text-xs text-zinc-600">No recent friends found.</p>
                                </div>
                            ) : (
                                displayFriends.map(u => (
                                    <div key={u.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => handleSend(u.id)}>
                                        <div className="flex items-center gap-3 min-w-0">
                                            <Avatar className="h-9 w-9 border border-white/5 bg-zinc-800">
                                                <AvatarImage src={u.image} />
                                                <AvatarFallback className="text-[10px] text-zinc-400 bg-zinc-900">{u.username[0].toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="text-left min-w-0">
                                                <div className="text-sm font-medium text-zinc-300 truncate group-hover:text-white transition-colors">{u.name}</div>
                                            </div>
                                        </div>
                                        {sentUsers.has(u.id) ? (
                                            <div className="h-8 px-3 rounded-lg bg-green-500/10 text-green-500 text-xs font-bold flex items-center gap-1.5">
                                                <Check className="h-3.5 w-3.5" /> Sent
                                            </div>
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 group-hover:bg-white group-hover:text-black transition-all">
                                                <ArrowRight className="h-4 w-4" />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Shortened Link Footer */}
                    <div className="mt-2">
                        <Label className="text-[10px] uppercase font-bold text-zinc-600 tracking-wider mb-2 block pl-1">
                            {isShortening ? "Generating Short Link..." : "Short Link"}
                        </Label>
                        <div className="bg-zinc-900/80 rounded-xl p-1.5 flex items-center border border-white/5 relative group hover:border-white/10 transition-colors">
                            <div className="flex-1 px-3 min-w-0">
                                <p className={cn("text-sm truncate font-mono select-all transition-colors", isShortening ? "text-zinc-600" : "text-zinc-300")}>
                                    {shortUrl}
                                </p>
                            </div>
                            <Button
                                size="sm"
                                className={cn(
                                    "h-9 px-4 rounded-lg text-xs font-semibold transition-all",
                                    copied
                                        ? "bg-green-500 text-white shadow-[0_0_15px_-3px_rgba(34,197,94,0.4)]"
                                        : "bg-white text-black hover:scale-105"
                                )}
                                onClick={handleCopy}
                                disabled={isShortening}
                            >
                                {copied ? "Copied" : "Copy"}
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
