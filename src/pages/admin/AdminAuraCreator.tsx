import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Sparkles, Save, Trash2, ArrowLeft, RefreshCw, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { AuraAvatar } from "@/components/AuraAvatar";
import { useAuth } from "@/context/AuthContext";

export default function AdminAuraCreator() {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Editor State
    const [name, setName] = useState("");
    const [gradient, setGradient] = useState("from-cyan-400 via-blue-500 to-purple-600");
    const [pulse, setPulse] = useState(2);
    const [minXP, setMinXP] = useState(0);

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
    } catch (e) {
        customAuras = [];
    }

    const handleSave = () => {
        if (!name || !gradient) {
            toast({ title: "Missing Fields", description: "Please provide a name and gradient classes.", variant: "destructive" });
            return;
        }

        const newAura = {
            id: Date.now().toString(),
            name,
            gradient,
            pulse,
            minXP
        };

        const updatedAuras = [...customAuras, newAura];
        updateMutation.mutate({ key: "custom_auras", value: JSON.stringify(updatedAuras) });

        // Reset form
        setName("");
        // Keep gradient/pulse for easy iteration
    };

    const handleDelete = (id: string) => {
        if (confirm("Delete this aura?")) {
            const updatedAuras = customAuras.filter(a => a.id !== id);
            updateMutation.mutate({ key: "custom_auras", value: JSON.stringify(updatedAuras) });
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading studio...</div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            <div className="flex items-center justify-between border-b border-border pb-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black font-headline">Aura Studio</h1>
                        <p className="text-muted-foreground font-medium text-sm">Design and deploy custom profile auras.</p>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Editor */}
                <Card>
                    <CardHeader>
                        <CardTitle>Designer</CardTitle>
                        <CardDescription>Configure the visual properties of the aura.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-muted-foreground">Aura Name</label>
                            <Input
                                placeholder="e.g. Nebula Storm"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className="text-sm font-bold uppercase text-muted-foreground">Tailwind Gradient Classes</label>
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
                            <div className="flex flex-wrap gap-2 mt-2">
                                {[
                                    "from-cyan-400 via-blue-500 to-purple-600",
                                    "from-rose-400 via-fuchsia-500 to-indigo-500",
                                    "from-emerald-400 via-green-500 to-lime-600",
                                    "from-orange-400 via-amber-500 to-yellow-500",
                                    "bg-[conic-gradient(at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-100 to-gray-900"
                                ].map((preset) => (
                                    <button
                                        key={preset}
                                        onClick={() => setGradient(preset)}
                                        className="h-6 w-6 rounded-full bg-gradient-to-tr hover:scale-110 transition-transform ring-1 ring-border"
                                        style={{ backgroundImage: `linear-gradient(to top right, var(--tw-gradient-stops))`, "--tw-gradient-stops": preset } as React.CSSProperties}
                                        title={preset}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase text-muted-foreground">Pulse Intensity: {pulse}x</label>
                            <Slider
                                value={[pulse]}
                                min={0}
                                max={5}
                                step={0.5}
                                onValueChange={(val: number[]) => setPulse(val[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase text-muted-foreground">XP Requirement (Optional)</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={minXP}
                                onChange={(e) => setMinXP(parseInt(e.target.value) || 0)}
                            />
                            <p className="text-[10px] text-muted-foreground">Users automatically unlock this at this XP level.</p>
                        </div>

                        <Button onClick={handleSave} disabled={updateMutation.isPending} className="w-full font-bold">
                            {updateMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            Save Aura Configuration
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview */}
                <div className="space-y-8">
                    <Card className="border-primary/20 bg-primary/5">
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
                                        customAura={{ color: gradient, pulse }}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Medium</span>
                                    <AuraAvatar
                                        username={user?.username || "Preview"}
                                        xp={minXP}
                                        size="md"
                                        customAura={{ color: gradient, pulse }}
                                    />
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground uppercase">Large</span>
                                    <AuraAvatar
                                        username={user?.username || "Preview"}
                                        xp={minXP}
                                        size="lg"
                                        customAura={{ color: gradient, pulse }}
                                    />
                                </div>
                            </div>

                            <div className="text-center space-y-1">
                                <h3 className="font-black text-xl">{name || "Aura Name"}</h3>
                                <p className="text-sm font-mono text-muted-foreground">{gradient}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Aura Library */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-purple-500" /> Existing Auras
                        </h3>
                        <div className="grid gap-3">
                            {customAuras.length === 0 && (
                                <p className="text-muted-foreground text-sm italic">No custom auras created.</p>
                            )}
                            {customAuras.map((aura: any) => (
                                <div key={aura.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:border-primary/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 relative flex items-center justify-center">
                                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr blur-md ${aura.gradient}`} />
                                            <div className="relative z-10 bg-background rounded-full h-8 w-8 border border-white/10" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{aura.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-mono">{aura.gradient.substring(0, 30)}...</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-[10px] font-bold bg-muted px-2 py-1 rounded">
                                            {aura.pulse}x Pulse
                                        </div>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(aura.id)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
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
