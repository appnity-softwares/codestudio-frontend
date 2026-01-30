import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Save, Trash2, ArrowLeft, RefreshCw, Info, Zap, Shield, Coins, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { AuraAvatar } from "@/components/AuraAvatar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const GRADIENT_PRESETS = [
    { name: "Ocean", value: "from-cyan-400 via-blue-500 to-purple-600" },
    { name: "Sunset", value: "from-rose-400 via-fuchsia-500 to-indigo-500" },
    { name: "Forest", value: "from-emerald-400 via-green-500 to-lime-600" },
    { name: "Fire", value: "from-orange-400 via-amber-500 to-yellow-500" },
    { name: "Cosmic", value: "from-violet-500 via-purple-600 to-fuchsia-500" },
    { name: "Midnight", value: "from-slate-800 via-indigo-900 to-slate-900" },
    { name: "Aurora", value: "from-green-400 via-cyan-500 to-blue-500" },
    { name: "Neon", value: "from-pink-500 via-red-500 to-yellow-500" },
];

export default function AdminAuraCreator() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Editor State
    const [name, setName] = useState("");
    const [gradient, setGradient] = useState("from-cyan-400 via-blue-500 to-purple-600");
    const [ringColor, setRingColor] = useState("cyan-400");
    const [minXP, setMinXP] = useState(0);
    const [cost, setCost] = useState(500);
    const [adminOnly, setAdminOnly] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Fetch existing settings
    const { data: settingsData, isLoading } = useQuery({
        queryKey: ["admin-system-settings"],
        queryFn: () => adminAPI.getSystemSettings(),
    });

    const updateMutation = useMutation({
        mutationFn: (data: { key: string; value: string }) =>
            adminAPI.updateSystemSettings(data.key, data.value),
        onSuccess: () => {
            toast({ title: "Aura Saved", description: "The custom aura configuration has been updated." });
            queryClient.invalidateQueries({ queryKey: ["admin-system-settings"] });
            resetForm();
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const settings = settingsData?.settings || {};
    const aurasRaw = settings["custom_auras"] || "[]";
    let customAuras: any[] = [];
    try {
        customAuras = JSON.parse(aurasRaw);
    } catch {
        customAuras = [];
    }

    const resetForm = () => {
        setName("");
        setGradient("from-cyan-400 via-blue-500 to-purple-600");
        setRingColor("cyan-400");
        setMinXP(0);
        setCost(500);
        setAdminOnly(false);
        setEditingId(null);
    };

    const handleSave = () => {
        if (!name || !gradient) {
            toast({ title: "Missing Fields", description: "Please provide a name and gradient classes.", variant: "destructive" });
            return;
        }

        const newAura = {
            id: editingId || `aura_${Date.now()}`,
            name,
            gradient,
            ringColor,
            pulse: 1,
            minXP,
            cost,
            adminOnly
        };

        let updatedAuras;
        if (editingId) {
            updatedAuras = customAuras.map(a => a.id === editingId ? newAura : a);
        } else {
            updatedAuras = [...customAuras, newAura];
        }
        updateMutation.mutate({ key: "custom_auras", value: JSON.stringify(updatedAuras) });
    };

    const handleEdit = (aura: any) => {
        setEditingId(aura.id);
        setName(aura.name);
        setGradient(aura.gradient);
        setRingColor(aura.ringColor || "cyan-400");
        setMinXP(aura.minXP || 0);
        setCost(aura.cost || 500);
        setAdminOnly(aura.adminOnly || false);
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this aura?")) {
            const updatedAuras = customAuras.filter(a => a.id !== id);
            updateMutation.mutate({ key: "custom_auras", value: JSON.stringify(updatedAuras) });
        }
    };

    const handleToggleVisibility = (aura: any) => {
        const updatedAuras = customAuras.map(a =>
            a.id === aura.id ? { ...a, hidden: !a.hidden } : a
        );
        updateMutation.mutate({ key: "custom_auras", value: JSON.stringify(updatedAuras) });
    };

    if (isLoading) return <div className="p-10 text-center">Loading studio...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-headline">Aura Studio</h1>
                        <p className="text-muted-foreground font-medium text-sm">Design and deploy custom profile auras for your community.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                    <Zap className="h-3.5 w-3.5 text-yellow-500" />
                    <span className="font-bold">{customAuras.length}</span> Auras Active
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Editor */}
                <Card className="border-primary/20 shadow-xl">
                    <CardHeader className="border-b border-border/50 bg-muted/20">
                        <CardTitle className="flex items-center gap-2">
                            {editingId ? "Edit Aura" : "Create New Aura"}
                            {editingId && (
                                <Button size="sm" variant="ghost" onClick={resetForm} className="ml-auto text-xs">
                                    Cancel Edit
                                </Button>
                            )}
                        </CardTitle>
                        <CardDescription>Configure the visual properties and unlock criteria.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-muted-foreground">Aura Name</label>
                            <Input
                                placeholder="e.g. Nebula Storm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Tailwind Gradient</label>
                                <a
                                    href="https://tailwindcss.com/docs/gradient-color-stops"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    <Info className="h-3 w-3" /> Docs
                                </a>
                            </div>
                            <Input
                                placeholder="from-color-500 via-color-500 to-color-500"
                                value={gradient}
                                onChange={(e) => setGradient(e.target.value)}
                                className="font-mono text-xs"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {GRADIENT_PRESETS.map((preset) => (
                                    <button
                                        key={preset.value}
                                        onClick={() => setGradient(preset.value)}
                                        className={cn(
                                            "h-8 px-3 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all text-white shadow-md",
                                            `bg-gradient-to-r ${preset.value}`,
                                            gradient === preset.value ? "ring-2 ring-offset-2 ring-white scale-105" : "hover:scale-105"
                                        )}
                                    >
                                        {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-muted-foreground">Ring Color (Tailwind)</label>
                            <Input
                                placeholder="e.g. cyan-400, amber-400, rose-500"
                                value={ringColor}
                                onChange={(e) => setRingColor(e.target.value)}
                                className="font-mono text-xs"
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {['cyan-400', 'amber-400', 'yellow-400', 'purple-500', 'rose-500', 'emerald-400', 'blue-500', 'pink-500', 'orange-500', 'indigo-500', 'red-500'].map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setRingColor(color)}
                                        className={cn(
                                            "h-8 w-8 rounded-full border-2 transition-all shadow-sm",
                                            ringColor === color ? "ring-2 ring-offset-2 ring-primary scale-110 border-white" : "border-transparent hover:scale-110"
                                        )}
                                        style={{
                                            backgroundColor: color === 'primary' ? 'hsl(var(--primary))' :
                                                color.includes('cyan') ? '#22d3ee' :
                                                    color.includes('amber') ? '#fbbf24' :
                                                        color.includes('yellow') ? '#facc15' :
                                                            color.includes('purple') ? '#a855f7' :
                                                                color.includes('rose') ? '#f43f5e' :
                                                                    color.includes('emerald') ? '#10b981' :
                                                                        color.includes('blue') ? '#3b82f6' :
                                                                            color.includes('pink') ? '#ec4899' :
                                                                                color.includes('orange') ? '#f97316' :
                                                                                    color.includes('indigo') ? '#6366f1' :
                                                                                        color.includes('red') ? '#ef4444' : '#ccc'
                                        }}
                                        title={color}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Coins className="h-3.5 w-3.5" /> XP Cost
                                </label>
                                <Input
                                    type="number"
                                    placeholder="500"
                                    value={cost}
                                    onChange={(e) => setCost(parseInt(e.target.value) || 0)}
                                />
                                <p className="text-[10px] text-muted-foreground">Price in the XP Store.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                                    <Zap className="h-3.5 w-3.5" /> Min XP Level
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    value={minXP}
                                    onChange={(e) => setMinXP(parseInt(e.target.value) || 0)}
                                />
                                <p className="text-[10px] text-muted-foreground">Auto-unlock at this XP.</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                            <div className="flex items-center gap-3">
                                <Shield className="h-5 w-5 text-amber-500" />
                                <div>
                                    <Label htmlFor="admin-only" className="font-bold text-sm">Admin Only</Label>
                                    <p className="text-[10px] text-muted-foreground">Restrict this aura to staff members.</p>
                                </div>
                            </div>
                            <Switch
                                id="admin-only"
                                checked={adminOnly}
                                onCheckedChange={setAdminOnly}
                            />
                        </div>

                        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full font-bold text-base py-5">
                            {updateMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {editingId ? "Update Aura" : "Save Aura to Store"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview */}
                <div className="space-y-8">
                    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple-500/5">
                        <CardHeader>
                            <CardTitle>Live Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center py-12 gap-8">
                            <div className="flex items-center gap-12">
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Small</span>
                                    <AuraAvatar
                                        username={user?.username || "Preview"}
                                        xp={minXP}
                                        size="sm"
                                        customAura={{ color: gradient, pulse: 0, ringColor }}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Medium</span>
                                    <AuraAvatar
                                        username={user?.username || "Preview"}
                                        xp={minXP}
                                        size="md"
                                        customAura={{ color: gradient, pulse: 0, ringColor }}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Large</span>
                                    <AuraAvatar
                                        username={user?.username || "Preview"}
                                        xp={minXP}
                                        size="lg"
                                        customAura={{ color: gradient, pulse: 1, ringColor }}
                                    />
                                </div>
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="font-black text-xl">{name || "Aura Name"}</h3>
                                <div className="flex items-center justify-center gap-3 text-sm">
                                    <span className="flex items-center gap-1 text-yellow-500 font-bold">
                                        <Coins className="h-4 w-4" /> {cost} XP
                                    </span>
                                    {adminOnly && (
                                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                                            <Shield className="h-4 w-4" /> Staff Only
                                        </span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Aura Library */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" /> Aura Library ({customAuras.length})
                        </h3>
                        <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {customAuras.length === 0 && (
                                <p className="text-muted-foreground text-sm italic text-center py-8">No custom auras created yet. Create one above!</p>
                            )}
                            {customAuras.map((aura: any) => (
                                <div
                                    key={aura.id}
                                    className={cn(
                                        "flex items-center justify-between p-4 rounded-xl border bg-card hover:border-primary/50 transition-all group",
                                        aura.hidden && "opacity-50",
                                        editingId === aura.id && "ring-2 ring-primary border-primary"
                                    )}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 relative flex items-center justify-center">
                                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr blur-md ${aura.gradient}`} />
                                            <div className="relative z-10 bg-background rounded-full h-9 w-9 border border-white/10" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm flex items-center gap-2">
                                                {aura.name}
                                                {aura.adminOnly && <Shield className="h-3 w-3 text-amber-500" />}
                                                {aura.hidden && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                                <span className="font-mono">{aura.gradient?.substring(0, 25)}...</span>
                                                <span className="text-yellow-500 font-bold">{aura.cost || 500} XP</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleToggleVisibility(aura)}
                                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            title={aura.hidden ? "Show in Store" : "Hide from Store"}
                                        >
                                            {aura.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(aura)}
                                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                                        >
                                            <Sparkles className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(aura.id)}
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-8 border-t border-border flex justify-end">
                <Button
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="rounded-xl mr-auto gap-2"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to System
                </Button>
            </div>
        </div>
    );
}

