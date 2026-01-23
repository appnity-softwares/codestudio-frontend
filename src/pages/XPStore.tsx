import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { spendXP, equipAura } from "@/store/slices/userSlice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Sparkles, Palette, Zap, ArrowLeft, Trophy, Lock, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const STORE_ITEMS = [
    {
        id: 'aura_neon_cyberpunk',
        name: 'Neon Cyberpunk',
        description: 'A glowing cyan and magenta border for your avatar.',
        type: 'AURA',
        cost: 500,
        previewClass: 'ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
    },
    {
        id: 'aura_golden_master',
        name: 'Golden Master',
        description: 'Elite gold aura for top-tier developers.',
        type: 'AURA',
        cost: 1200,
        previewClass: 'ring-2 ring-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.6)]'
    },
    {
        id: 'aura_void_walker',
        name: 'Void Walker',
        description: 'Deep purple shadows that pulse with dark energy.',
        type: 'AURA',
        cost: 2000,
        previewClass: 'ring-2 ring-purple-600 shadow-[0_0_20px_rgba(147,51,234,0.4)]'
    },
    {
        id: 'theme_dracula',
        name: 'Dracula Theme',
        description: 'A dark theme for vampires and night owls.',
        type: 'THEME',
        cost: 300,
        color: '#282a36'
    },
    {
        id: 'theme_monokai_pro',
        name: 'Monokai Pro',
        description: 'Professional, high-contrast colorful theme.',
        type: 'THEME',
        cost: 300,
        color: '#2d2a2e'
    },
    {
        id: 'boost_showcase_slot',
        name: 'Feed Showcase Slot',
        description: 'Pin one of your snippets to the top of the feed for 24h.',
        type: 'BOOST',
        cost: 150,
        icon: Zap
    }
];

export default function XPStore() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { toast } = useToast();
    const user = useSelector((state: RootState) => state.user);
    const [activeTab, setActiveTab] = useState("auras");

    const handlePurchase = (item: any) => {
        if (user.xp < item.cost) {
            toast({
                title: "Insufficient XP",
                description: `You need ${item.cost - user.xp} more XP to buy this.`,
                variant: "destructive"
            });
            return;
        }

        dispatch(spendXP({ amount: item.cost, itemId: item.id, type: item.type as any }));

        toast({
            title: "Purchase Successful!",
            description: `You acquired ${item.name}.`,
        });
    };

    const handleEquip = (auraId: string) => {
        dispatch(equipAura(auraId));
        toast({ title: "Equipped!", description: "Your avatar style has been updated." });
    };

    const isOwned = (itemId: string) => user.inventory.includes(itemId);

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 pb-24">
            {/* Header */}
            <div className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="container max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/feed')}
                            className="rounded-xl border border-border hover:bg-muted"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                XP Store
                            </h1>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Marketplace</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-muted/30 px-4 py-2 rounded-xl border border-border">
                        <div className="text-right">
                            <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-wider">Available Balance</span>
                            <span className="font-mono text-lg font-black text-cyan-400 tabular-nums">{user.xp} XP</span>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                            <Trophy className="h-4 w-4 text-cyan-500" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container max-w-6xl mx-auto py-10 px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <TabsList className="bg-muted/40 p-1 border border-border rounded-xl h-auto">
                        <TabsTrigger value="auras" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-sm font-bold">
                            <Sparkles className="h-4 w-4" /> Auras
                        </TabsTrigger>
                        <TabsTrigger value="themes" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-sm font-bold">
                            <Palette className="h-4 w-4" /> IDE Themes
                        </TabsTrigger>
                        <TabsTrigger value="boosts" className="px-6 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-sm font-bold">
                            <Zap className="h-4 w-4" /> Boosts
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="auras" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {STORE_ITEMS.filter(i => i.type === 'AURA').map((item) => {
                                const owned = isOwned(item.id);
                                const equipped = user.equippedAura === item.id;

                                return (
                                    <div key={item.id} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                                        <div className="h-32 bg-muted/30 flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-grid opacity-20" />
                                            <div className={cn("h-16 w-16 rounded-full bg-background border-2 border-muted flex items-center justify-center transition-all duration-500 group-hover:scale-110", item.previewClass)}>
                                                <span className="font-black text-xs text-muted-foreground/50">YOU</span>
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                {!owned && (
                                                    <Badge variant="outline" className="font-mono text-cyan-500 border-cyan-500/30 bg-cyan-500/5">
                                                        {item.cost} XP
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-6 flex-1">{item.description}</p>

                                            {owned ? (
                                                <Button
                                                    className={cn("w-full font-bold", equipped ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20" : "")}
                                                    variant={equipped ? "outline" : "secondary"}
                                                    disabled={equipped}
                                                    onClick={() => handleEquip(item.id)}
                                                >
                                                    {equipped ? <><Check className="mr-2 h-4 w-4" /> Equipped</> : "Equip Aura"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-full font-bold"
                                                    onClick={() => handlePurchase(item)}
                                                    disabled={user.xp < item.cost}
                                                >
                                                    {user.xp < item.cost ? <Lock className="mr-2 h-4 w-4" /> : null}
                                                    Purchase
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="themes" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {STORE_ITEMS.filter(i => i.type === 'THEME').map((item) => {
                                const owned = isOwned(item.id);
                                return (
                                    <div key={item.id} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                                        <div className="h-32 flex items-center justify-center relative border-b border-border" style={{ backgroundColor: item.color }}>
                                            <div className="font-mono text-xs text-white/50 bg-black/20 px-3 py-1 rounded-md">
                                                const theme = "{item.name}";
                                            </div>
                                        </div>
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                {!owned && <Badge variant="outline" className="font-mono text-cyan-500 border-cyan-500/30 bg-cyan-500/5">{item.cost} XP</Badge>}
                                            </div>
                                            <p className="text-sm text-muted-foreground mb-6 flex-1">{item.description}</p>

                                            {owned ? (
                                                <Button variant="secondary" disabled className="w-full font-bold opacity-50">
                                                    Unlocked (Select in Editor)
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="w-full font-bold"
                                                    onClick={() => handlePurchase(item)}
                                                    disabled={user.xp < item.cost}
                                                >
                                                    {user.xp < item.cost ? <Lock className="mr-2 h-4 w-4" /> : null}
                                                    Unlock Theme
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TabsContent>

                    <TabsContent value="boosts" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="bg-gradient-to-br from-card to-muted/20 border-border">
                            <div className="p-10 flex flex-col items-center text-center">
                                <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 ring-1 ring-amber-500/50">
                                    <Zap className="h-8 w-8 text-amber-500" />
                                </div>
                                <h3 className="text-2xl font-black mb-2">Power-Ups Coming Soon</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                                    We are fine-tuning the economy for showcasing and boosters. Showcase slots will allow you to pin your work to the global feed.
                                </p>
                                <Button disabled variant="outline">Restocking...</Button>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
