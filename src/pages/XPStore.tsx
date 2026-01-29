import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { spendXP, equipAura } from "@/store/slices/userSlice";
import { STORE_ITEMS } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Sparkles, Palette, Zap, ArrowLeft, Trophy, Lock, Check, Info, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { usersAPI } from "@/lib/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";



export default function XPStore() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { toast } = useToast();
    const user = useSelector((state: RootState) => state.user);
    const [activeTab, setActiveTab] = useState("auras");
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [previewItem, setPreviewItem] = useState<any>(null);

    const handlePurchase = async () => {
        if (!selectedItem) return;

        if (user.xp < selectedItem.cost) {
            toast({
                title: "Insufficient XP",
                description: `You need ${selectedItem.cost - user.xp} more XP to buy this.`,
                variant: "destructive"
            });
            setSelectedItem(null);
            return;
        }

        try {
            await usersAPI.spendXP(selectedItem.id, selectedItem.cost);
            dispatch(spendXP({ amount: selectedItem.cost, itemId: selectedItem.id, type: selectedItem.type as any }));

            toast({
                title: "Purchase Successful!",
                description: `You acquired ${selectedItem.name}.`,
            });
        } catch (error: any) {
            toast({
                title: "Purchase Failed",
                description: error.message || "Something went wrong",
                variant: "destructive"
            });
        } finally {
            setSelectedItem(null);
        }
    };

    const handleEquip = async (auraId: string) => {
        try {
            await usersAPI.equipAura(auraId);
            dispatch(equipAura(auraId));
            toast({ title: "Equipped!", description: "Your avatar style has been updated." });
        } catch (error: any) {
            toast({
                title: "Equipment Failed",
                description: error.message || "Failed to equip aura",
                variant: "destructive"
            });
        }
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
                            <div className="flex flex-col">
                                <h1 className="text-lg md:text-xl font-black tracking-tight flex items-center gap-2">
                                    <ShoppingBag className="h-5 w-5 text-primary" />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">XP Store</span>
                                </h1>
                                <p className="hidden xs:block text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">Marketplace Architecture</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-muted/30 px-3 md:px-4 py-2 rounded-xl border border-border">
                        <div className="text-right">
                            <span className="block text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-wider">Balance</span>
                            <span className="font-mono text-sm md:text-lg font-black text-primary tabular-nums text-nowrap">{user.xp} XP</span>
                        </div>
                        <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                            <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container max-w-6xl mx-auto py-10 px-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="w-full overflow-x-auto no-scrollbar pb-2">
                        <TabsList className="bg-muted/40 p-1 border border-border rounded-xl h-auto flex w-max sm:w-auto">
                            <TabsTrigger value="auras" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-xs md:text-sm font-bold whitespace-nowrap">
                                <Sparkles className="h-4 w-4" /> Auras
                            </TabsTrigger>
                            <TabsTrigger value="themes" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-xs md:text-sm font-bold whitespace-nowrap">
                                <Palette className="h-4 w-4" /> IDE Themes
                            </TabsTrigger>
                            <TabsTrigger value="boosts" className="px-5 py-2.5 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2 text-xs md:text-sm font-bold whitespace-nowrap">
                                <Zap className="h-4 w-4" /> Power-Ups
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <TabsContent value="auras" className="m-0 mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {STORE_ITEMS.filter(i => i.type === 'AURA').map((item: any) => {
                                        const owned = isOwned(item.id);
                                        const equipped = user.equippedAura === item.id;

                                        return (
                                            <div key={item.id} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                                                <div className="h-40 bg-muted/30 flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-grid opacity-20" />
                                                    <div className={cn("h-20 w-20 rounded-full bg-background border-2 border-muted flex items-center justify-center transition-all duration-500 group-hover:scale-110", item.previewClass)}>
                                                        <span className="font-black text-xs text-muted-foreground/30 uppercase tracking-tighter">PREVIEW</span>
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                        {!owned && (
                                                            <Badge variant="outline" className="font-mono text-primary border-primary/30 bg-primary/5">
                                                                {item.cost} XP
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{item.description}</p>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0 h-10 w-10 border-border hover:bg-muted"
                                                            onClick={() => setPreviewItem(item)}
                                                        >
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        {owned ? (
                                                            <Button
                                                                className={cn("flex-1 font-black uppercase text-xs tracking-widest", equipped ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border border-emerald-500/20" : "")}
                                                                variant={equipped ? "outline" : "secondary"}
                                                                disabled={equipped}
                                                                onClick={() => handleEquip(item.id)}
                                                            >
                                                                {equipped ? <><Check className="mr-2 h-4 w-4" /> Equipped</> : "Equip"}
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                className="flex-1 font-black uppercase text-xs tracking-widest"
                                                                onClick={() => setSelectedItem(item)}
                                                                disabled={user.xp < item.cost}
                                                            >
                                                                {user.xp < item.cost ? <Lock className="mr-2 h-3 w-3" /> : null}
                                                                Unlock
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            <TabsContent value="themes" className="m-0 mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {STORE_ITEMS.filter(i => i.type === 'THEME').map((item: any) => {
                                        const owned = isOwned(item.id);
                                        return (
                                            <div key={item.id} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                                                <div className="h-40 flex items-center justify-center relative border-b border-border overflow-hidden" style={{ backgroundColor: item.color }}>
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                                                    <div className="font-mono text-[10px] text-white/50 bg-black/40 px-3 py-1.5 rounded-md border border-white/10 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                                        <span className="text-purple-400">const</span> <span className="text-yellow-400">theme</span> = <span className="text-emerald-400">"{item.name}"</span>;
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                        {!owned && <Badge variant="outline" className="font-mono text-primary border-primary/30 bg-primary/5">{item.cost} XP</Badge>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{item.description}</p>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0 h-10 w-10 border-border hover:bg-muted"
                                                            onClick={() => setPreviewItem(item)}
                                                        >
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        {owned ? (
                                                            <Button variant="secondary" disabled className="flex-1 font-black uppercase text-xs tracking-widest opacity-50">
                                                                Unlocked
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                className="flex-1 font-black uppercase text-xs tracking-widest"
                                                                onClick={() => setSelectedItem(item)}
                                                                disabled={user.xp < item.cost}
                                                            >
                                                                {user.xp < item.cost ? <Lock className="mr-2 h-3 w-3" /> : null}
                                                                Unlock
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>

                            <TabsContent value="boosts" className="m-0 mt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {STORE_ITEMS.filter(i => i.type === 'BOOST').map((item: any) => {
                                        const owned = isOwned(item.id);
                                        return (
                                            <div key={item.id} className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg flex flex-col">
                                                <div className="h-40 bg-muted/30 flex items-center justify-center relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-grid opacity-20" />
                                                    <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/30 group-hover:scale-110 transition-all duration-300 group-hover:rotate-6">
                                                        {item.icon && <item.icon className="h-8 w-8 text-primary" />}
                                                    </div>
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                                        {!owned && <Badge variant="outline" className="font-mono text-primary border-primary/30 bg-primary/5">{item.cost} XP</Badge>}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-6 flex-1 line-clamp-2">{item.description}</p>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="shrink-0 h-10 w-10 border-border hover:bg-muted"
                                                            onClick={() => setPreviewItem(item)}
                                                        >
                                                            <Info className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                        <Button
                                                            className="flex-1 font-black uppercase text-xs tracking-widest"
                                                            onClick={() => setSelectedItem(item)}
                                                            disabled={user.xp < item.cost}
                                                        >
                                                            {user.xp < item.cost ? <Lock className="mr-2 h-3 w-3" /> : null}
                                                            Buy Boost
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </TabsContent>
                        </motion.div>
                    </AnimatePresence>
                </Tabs>
            </main>

            {/* Purchase Confirmation Modal */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="sm:max-w-[400px] bg-card border-border p-0 overflow-hidden">
                    <div className="h-32 bg-primary/5 flex items-center justify-center relative border-b border-border">
                        <ShoppingBag className="h-12 w-12 text-primary/30" />
                        <div className="absolute top-4 right-4">
                            <Badge variant="outline" className="bg-background border-border font-mono">{selectedItem?.cost} XP</Badge>
                        </div>
                    </div>
                    <div className="p-6 space-y-4">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black italic font-headline uppercase tracking-tighter">Purchase Authorization</DialogTitle>
                            <DialogDescription className="text-muted-foreground leading-relaxed">
                                You are about to deduct <span className="text-primary font-bold">{selectedItem?.cost} XP</span> from your global nexus balance to unlock <span className="text-foreground font-bold">{selectedItem?.name}</span>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-muted/30 p-4 rounded-xl border border-border flex items-start gap-3">
                            <ShieldCheck className="h-5 w-5 text-emerald-500 mt-1 shrink-0" />
                            <div className="text-[10px] text-muted-foreground uppercase leading-relaxed tracking-wider font-bold">
                                Purchase is irreversible. Item will be added to your inventory immediately upon server verification.
                            </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setSelectedItem(null)} className="font-bold">Abort</Button>
                            <Button onClick={handlePurchase} className="font-black uppercase tracking-widest text-xs px-8">Confirm Purchase</Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Item Details/Preview Modal */}
            <Dialog open={!!previewItem} onOpenChange={(open) => !open && setPreviewItem(null)}>
                <DialogContent className="sm:max-w-xl bg-card border-border p-0 overflow-hidden">
                    <div className="grid md:grid-cols-2">
                        <div className={cn(
                            "h-64 md:h-auto flex items-center justify-center relative",
                            previewItem?.type === 'AURA' ? "bg-muted/40" :
                                previewItem?.type === 'THEME' ? "" : "bg-primary/5"
                        )} style={previewItem?.type === 'THEME' ? { backgroundColor: previewItem.color } : {}}>
                            {previewItem?.type === 'AURA' && (
                                <div className={cn("h-32 w-32 rounded-full bg-background border-4 border-muted flex items-center justify-center transition-all duration-500", previewItem.previewClass)}>
                                    <span className="font-black text-xs text-muted-foreground/30 uppercase">LIVE</span>
                                </div>
                            )}
                            {previewItem?.type === 'THEME' && (
                                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                                    <div className="space-y-4 font-mono text-xs scale-90 origin-left">
                                        <div className="flex gap-2">
                                            <div className="h-3 w-3 rounded-full bg-red-400" />
                                            <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                            <div className="h-3 w-3 rounded-full bg-green-400" />
                                        </div>
                                        <div className="p-4 rounded-lg bg-black/40 border border-white/10 space-y-2">
                                            <div><span className="text-purple-400">function</span> <span className="text-blue-400">render</span>() {'{'}</div>
                                            <div className="pl-4"><span className="text-orange-400">return</span> <span className="text-cyan-400">true</span>;</div>
                                            <div>{'}'}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {previewItem?.type === 'BOOST' && (
                                <div className="h-24 w-24 bg-primary/20 rounded-3xl flex items-center justify-center border border-primary/40 animate-bounce">
                                    {previewItem.icon && <previewItem.icon className="h-10 w-10 text-primary" />}
                                </div>
                            )}
                        </div>
                        <div className="p-8 space-y-6">
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/30">{previewItem?.type}</Badge>
                                    {isOwned(previewItem?.id) && <Badge className="bg-emerald-500 text-[10px] font-black uppercase">Owned</Badge>}
                                </div>
                                <DialogTitle className="text-3xl font-black italic font-headline uppercase tracking-tighter">{previewItem?.name}</DialogTitle>
                            </DialogHeader>

                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {previewItem?.longDesc || previewItem?.description}
                            </p>

                            <div className="pt-4 border-t border-border space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Market Value</span>
                                    <span className="font-mono text-lg font-black text-primary">{previewItem?.cost} XP</span>
                                </div>
                                {!isOwned(previewItem?.id) && (
                                    <Button
                                        className="w-full font-black uppercase tracking-widest text-xs h-12"
                                        onClick={() => {
                                            setSelectedItem(previewItem);
                                            setPreviewItem(null);
                                        }}
                                        disabled={user.xp < previewItem?.cost}
                                    >
                                        Unlock Permanently
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
