import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Zap, Palmtree, Ghost, Rocket, Sparkles, CheckCircle2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const ITEMS = [
    {
        id: "theme-midnight",
        name: "Midnight Nebula Theme",
        description: "Deep cosmic aesthetics with purple accents.",
        price: 2500,
        icon: Ghost,
        color: "from-purple-600 to-indigo-900"
    },
    {
        id: "theme-matrix",
        name: "Terminal Matrix Theme",
        description: "Retro hacker vibes with green phosphor glow.",
        price: 7500,
        icon: Rocket,
        color: "from-emerald-600 to-black"
    },
    {
        id: "theme-sunset",
        name: "Cyber Sunset Theme",
        description: "Vibrant orange and pink synthwave aesthetics.",
        price: 12000,
        icon: Palmtree,
        color: "from-orange-500 to-pink-600"
    },
    {
        id: "aura-shield",
        name: "Diamond Aura Reflector",
        description: "A permanent shimmering shield around your avatar.",
        price: 25000,
        icon: Sparkles,
        color: "from-cyan-400 to-blue-500"
    },
];

export default function XPStore() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [selectedItem, setSelectedItem] = useState<any>(null);

    const spendMutation = useMutation({
        mutationFn: ({ itemId, amount }: { itemId: string, amount: number }) => usersAPI.spendXP(itemId, amount),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            // Update local user state if needed, or just let re-fetch happen
            toast({
                title: "Purchase Successful!",
                description: `Unlocked ${selectedItem?.name}. ${data.xp} XP remaining.`,
            });
            setSelectedItem(null);
        },
        onError: (error: any) => {
            toast({
                title: "Transaction Failed",
                description: error.message || "Insufficient XP or network error.",
                variant: "destructive"
            });
        }
    });

    const isUnlocked = (itemId: string) => user?.purchasedComponentIds?.includes(itemId);

    return (
        <div className="container max-w-7xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-primary/20 text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">XP Trading Floor</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight font-headline text-white">
                        Developer <span className="text-primary italic">XP Store</span>
                    </h1>
                    <p className="text-white/40 max-w-xl font-medium text-lg leading-relaxed">
                        Spend your hard-earned logic points on premium aesthetics and profile artifacts.
                        No credit cards, just code.
                    </p>
                </div>

                {/* Balance Card */}
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-tr from-white/[0.05] to-transparent border border-white/10 backdrop-blur-xl min-w-[280px]">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-2">Available Balance</div>
                    <div className="flex items-end gap-3">
                        <div className="text-5xl font-black text-white font-headline">{user?.xp || 0}</div>
                        <div className="text-primary font-black mb-1.5 italic">XP</div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                        <div className="text-[10px] font-bold text-white/30 uppercase">Vault Secure</div>
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                {ITEMS.map((item) => {
                    const unlocked = isUnlocked(item.id);
                    return (
                        <motion.div
                            key={item.id}
                            whileHover={{ y: -5 }}
                            className={cn(
                                "group p-8 rounded-[3rem] border transition-all duration-500 overflow-hidden relative",
                                unlocked ? "border-emerald-500/20 bg-emerald-500/[0.02]" : "border-white/5 bg-white/[0.02] hover:border-primary/30"
                            )}
                        >
                            {/* Bg Decoration */}
                            <div className={cn(
                                "absolute top-0 right-0 w-64 h-64 blur-[100px] opacity-10 -translate-y-1/2 translate-x-1/2 pointer-events-none bg-gradient-to-br",
                                item.color
                            )} />

                            <div className="flex items-start justify-between relative z-10">
                                <div className="space-y-4 flex-1">
                                    <div className={cn(
                                        "h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl",
                                        "bg-gradient-to-br", item.color
                                    )}>
                                        <item.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-white mb-2">{item.name}</h3>
                                        <p className="text-white/40 font-medium text-sm leading-relaxed max-w-sm">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col items-end gap-4">
                                    {unlocked ? (
                                        <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-[10px] tracking-widest bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Unlocked
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-white font-black uppercase text-xl font-headline">
                                            {item.price} <span className="text-primary text-xs italic">XP</span>
                                        </div>
                                    )}

                                    <Button
                                        disabled={unlocked || (user?.xp || 0) < item.price || spendMutation.isPending}
                                        onClick={() => {
                                            setSelectedItem(item);
                                            spendMutation.mutate({ itemId: item.id, amount: item.price });
                                        }}
                                        className={cn(
                                            "h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs",
                                            unlocked ? "bg-white/5 text-white/20 cursor-not-allowed" : "bg-white text-black hover:bg-white/90"
                                        )}
                                    >
                                        {spendMutation.isPending && selectedItem?.id === item.id ? (
                                            "Authorizing..."
                                        ) : unlocked ? (
                                            "In Collection"
                                        ) : (user?.xp || 0) < item.price ? (
                                            <div className="flex items-center gap-2"><Lock className="w-3 h-3" /> Locked</div>
                                        ) : (
                                            "Unlock Now"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Why XP Store? */}
            <div className="p-10 rounded-[3rem] bg-primary/5 border border-primary/10 flex flex-col md:flex-row items-center gap-10">
                <div className="h-24 w-24 shrink-0 rounded-[2rem] bg-primary/20 flex items-center justify-center">
                    <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2 text-center md:text-left">
                    <h3 className="text-xl font-black text-white">How do I earn XP?</h3>
                    <p className="text-white/40 font-medium leading-relaxed">
                        XP is granted for solving practice problems (+50), publishing popular snippets (+10 / view),
                        and winning arena contests (+1000). Your logic has real value in this ecosystem.
                    </p>
                </div>
            </div>
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
