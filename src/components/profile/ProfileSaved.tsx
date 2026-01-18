import { Button } from "@/components/ui/button";
import { Bookmark, Trash2, Loader2 } from "lucide-react";
import { SnippetCard } from "@/components/SnippetCard";
import { snippetsAPI } from "@/lib/api";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ProfileSavedProps {
    savedSnippets: any[];
    onRefresh?: () => void;
}

export function ProfileSaved({ savedSnippets, onRefresh }: ProfileSavedProps) {
    const { toast } = useToast();
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    const handleUnsave = async (snippetId: string) => {
        setLoadingIds(prev => new Set(prev).add(snippetId));
        try {
            await snippetsAPI.save(snippetId);
            toast({ title: "Removed from vault" });
            onRefresh?.();
        } catch (error) {
            toast({ variant: "destructive", title: "Failed to remove" });
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(snippetId);
                return next;
            });
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Bookmark className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tight">Data Vault</h3>
                        <p className="text-xs text-white/40">{savedSnippets.length} items secured</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedSnippets.map((snippet) => (
                    <div key={snippet.id} className="relative group">
                        <SnippetCard snippet={snippet} />
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8 rounded-full shadow-lg"
                                onClick={() => handleUnsave(snippet.id)}
                                disabled={loadingIds.has(snippet.id)}
                            >
                                {loadingIds.has(snippet.id) ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Trash2 className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {savedSnippets.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/2 bg-opacity-10">
                    <Bookmark className="h-12 w-12 text-white/10 mb-4" />
                    <p className="text-sm text-white/40">Your vault is empty. Secure some data streams.</p>
                </div>
            )}
        </div>
    );
}
