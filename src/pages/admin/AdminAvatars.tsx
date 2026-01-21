"use client";

import { useState, useEffect } from "react";
import { Trash2, Search, Image as ImageIcon, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { usersAPI, adminAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface AvatarSeed {
    id: number;
    seed: string;
    style: string;
    addedBy: string;
    createdAt: string;
}

export default function AdminAvatars() {
    const { toast } = useToast();
    const [avatars, setAvatars] = useState<AvatarSeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newSeed, setNewSeed] = useState("");
    const [newStyle, setNewStyle] = useState("avataaars");
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAvatars = async () => {
        try {
            setIsLoading(true);
            const response = await usersAPI.getAvatars();
            setAvatars(response.avatars);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to load avatars.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAvatars();
    }, []);

    const handleAddAvatar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSeed) return;

        setIsAdding(true);
        try {
            await adminAPI.createAvatar(newSeed, newStyle);
            toast({ title: "Success", description: "Avatar seed added to collection." });
            setNewSeed("");
            fetchAvatars();
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to add avatar.", variant: "destructive" });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDeleteAvatar = async (id: number) => {
        if (!confirm("Remove this seed from collection?")) return;

        try {
            await adminAPI.deleteAvatar(id.toString());
            toast({ title: "Avatar Removed", description: "Collection updated." });
            setAvatars(avatars.filter(a => a.id !== id));
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const filtered = avatars.filter(a =>
        a.seed.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.style.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Avatar Collection</h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add New Seed */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">Add New Seed</CardTitle>
                        <CardDescription>Add a DiceBear seed to the platform collection.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddAvatar} className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Seed Name</label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 text-[10px] uppercase font-bold text-primary hover:bg-primary/10"
                                        onClick={() => setNewSeed(Math.random().toString(36).substring(7))}
                                    >
                                        Randomize
                                    </Button>
                                </div>
                                <Input
                                    value={newSeed}
                                    onChange={(e) => setNewSeed(e.target.value)}
                                    placeholder="e.g. Felix, Aneka"
                                    className="bg-black/20"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Quick Suggestions</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {["Oliver", "Luna", "Oscar", "Milo", "Maya", "Coco", "Zeus", "Nala"].map(s => (
                                        <Button
                                            key={s}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-6 px-2 text-[10px] border-white/5 bg-white/5 hover:bg-white/10"
                                            onClick={() => setNewSeed(s)}
                                        >
                                            {s}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Style</label>
                                <select
                                    value={newStyle}
                                    onChange={(e) => setNewStyle(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm focus:ring-1 focus:ring-primary outline-none"
                                >
                                    <option value="avataaars">Avataaars</option>
                                    <option value="bottts">Bottts</option>
                                    <option value="pixel-art">Pixel Art</option>
                                    <option value="big-smile">Big Smile</option>
                                    <option value="lorelei">Lorelei</option>
                                    <option value="micah">Micah</option>
                                    <option value="notionists">Notionists</option>
                                    <option value="open-peeps">Open Peeps</option>
                                </select>
                            </div>

                            {newSeed && (
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-white/5 animate-in zoom-in duration-300">
                                    <img
                                        src={`https://api.dicebear.com/7.x/${newStyle}/svg?seed=${newSeed}`}
                                        alt="Preview"
                                        className="h-24 w-24 drop-shadow-2xl"
                                    />
                                    <p className="mt-2 text-[10px] text-muted-foreground font-mono">{newStyle}:{newSeed}</p>
                                </div>
                            )}

                            <Button type="submit" className="w-full h-11" disabled={isAdding || !newSeed}>
                                {isAdding ? "Adding..." : "Add to Collection"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Collection List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search seeds..."
                            className="pl-10 bg-surface border-white/5"
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {isLoading ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="h-32 bg-muted/20 animate-pulse rounded-xl" />
                            ))
                        ) : filtered.map((avatar, idx) => (
                            <div key={avatar.id || `virtual-${idx}`} className="group relative bg-surface border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors">
                                <div className="flex flex-col items-center gap-3">
                                    <img
                                        src={`https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`}
                                        alt={avatar.seed}
                                        className="h-16 w-16"
                                    />
                                    <div className="text-center">
                                        <p className="text-xs font-bold truncate max-w-full">{avatar.seed}</p>
                                        <Badge variant="outline" className="text-[8px] uppercase px-1 h-3 mt-1">
                                            {avatar.style}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDeleteAvatar(avatar.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {!isLoading && filtered.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-xl">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                            <p className="text-muted-foreground">No avatars found in collection.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
