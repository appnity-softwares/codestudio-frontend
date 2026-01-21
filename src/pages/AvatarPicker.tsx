"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Shield, Search, RefreshCw, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AvatarSeed {
    id: number;
    seed: string;
    style: string;
}

export default function AvatarPickerPage() {
    const { user, updateUser } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [avatars, setAvatars] = useState<AvatarSeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchAvatars = async () => {
            try {
                const response = await usersAPI.getAvatars();
                setAvatars(response.avatars);
            } catch (error) {
                console.error(error);
                toast({ title: "Error", description: "Failed to load avatars.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchAvatars();
    }, []);

    const filteredAvatars = avatars.filter(a =>
        a.seed.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectAvatar = async (avatar: AvatarSeed) => {
        setIsSaving(true);
        const imageUrl = `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
        try {
            const response = await usersAPI.update({ image: imageUrl });
            updateUser(response.user);
            toast({ title: "Success", description: "Profile picture updated!" });
            navigate(-1);
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to update profile picture.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-canvas text-foreground p-6 md:p-12 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <Shield className="h-7 w-7 text-primary" /> Select Avatar
                        </h1>
                        <p className="text-muted-foreground">Choose from our curated collection of DiceBear avatars.</p>
                    </div>
                </div>
            </div>

            <div className="relative mb-8 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by seed..."
                    className="pl-10 bg-surface border-white/10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={isSaving}
                />
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                    <p className="text-muted-foreground">Initializing collection...</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredAvatars.map((avatar) => {
                        const url = `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
                        const isSelected = user?.image === url;
                        return (
                            <motion.div
                                key={avatar.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`relative group cursor-pointer ${isSaving ? 'pointer-events-none' : ''}`}
                                onClick={() => handleSelectAvatar(avatar)}
                            >
                                <Card className={`overflow-hidden border-2 transition-colors ${isSelected ? 'border-primary' : 'border-white/5 hover:border-white/20'}`}>
                                    <CardContent className="p-0">
                                        <div className="aspect-square bg-muted/30">
                                            <img src={url} alt={avatar.seed} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="p-3 text-center bg-surface">
                                            <p className="text-sm font-medium truncate">{avatar.seed}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                                {isSelected && (
                                    <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {!isLoading && filteredAvatars.length === 0 && (
                <div className="text-center py-20">
                    <p className="text-muted-foreground italic">Target seed not found in collection.</p>
                </div>
            )}
        </div>
    );
}
