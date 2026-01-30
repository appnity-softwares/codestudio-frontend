"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AvatarSeed {
    id: number;
    seed: string;
    style: string;
}

interface AvatarPickerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (url: string) => void;
    currentImage?: string;
}

export default function AvatarPickerModal({ isOpen, onClose, onSelect, currentImage }: AvatarPickerModalProps) {
    const { toast } = useToast();
    const [avatars, setAvatars] = useState<AvatarSeed[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!isOpen) return;

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
    }, [isOpen]);

    const filteredAvatars = avatars.filter(a =>
        a.seed.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelectAvatar = (avatar: AvatarSeed) => {
        const imageUrl = `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
        onSelect(imageUrl);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-black/90 border-white/10 backdrop-blur-2xl">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic font-headline">
                            Forge Your Avatar
                        </DialogTitle>
                    </div>
                    <DialogDescription className="text-white/40 font-mono text-[10px] uppercase tracking-widest mt-1">
                        Select a unique visual identifier for the CodeStudio grid.
                    </DialogDescription>
                </DialogHeader>

                <div className="relative my-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <Input
                        placeholder="Search by seed..."
                        className="pl-10 bg-white/5 border-white/10 h-11 rounded-xl focus:border-primary/50 transition-all font-mono text-xs"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-[300px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
                            <p className="text-[10px] font-mono text-white/40 uppercase tracking-[0.2em]">Synchronizing data nodes...</p>
                        </div>
                    ) : filteredAvatars.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-white/40 italic font-mono text-sm uppercase tracking-tighter">Target seed not found in collection.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 py-2">
                            {filteredAvatars.map((avatar) => {
                                const url = `https://api.dicebear.com/7.x/${avatar.style}/svg?seed=${avatar.seed}`;
                                const isSelected = currentImage === url;
                                return (
                                    <motion.div
                                        key={avatar.id}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative group cursor-pointer"
                                        onClick={() => handleSelectAvatar(avatar)}
                                    >
                                        <Card className={`overflow-hidden border-2 transition-all duration-300 ${isSelected ? 'border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] bg-primary/5' : 'border-white/5 hover:border-white/20 bg-white/[0.02]'}`}>
                                            <CardContent className="p-2">
                                                <div className="aspect-square bg-muted/20 rounded-lg overflow-hidden relative">
                                                    <img src={url} alt={avatar.seed} className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Check className="h-6 w-6 text-white" />
                                                    </div>
                                                </div>
                                                <div className="mt-2 text-center">
                                                    <p className="text-[9px] font-mono text-white/40 truncate uppercase tracking-tighter font-bold">{avatar.seed}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full shadow-lg z-10 border border-black/50">
                                                <Check className="h-2 w-2" />
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                    <Button variant="ghost" onClick={onClose} className="text-[10px] uppercase font-black tracking-widest text-white/40 hover:text-white">
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
