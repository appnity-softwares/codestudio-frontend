"use client";

import { useState, useEffect } from "react";
import { Sparkles, Zap, RefreshCw, Star } from "lucide-react";
import { snippetsAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { Button } from "@/components/ui/button";

export default function ForYou() {
    const [snippets, setSnippets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPersonalized = async () => {
            try {
                // In a real app, this would be a specific "for you" endpoint
                const data = await snippetsAPI.getAll();
                // Randomize or sort by rating for "For You" feel
                setSnippets(data.snippets.sort(() => Math.random() - 0.5));
            } catch (error) {
                console.error("Failed to fetch personalized snippets:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPersonalized();
    }, []);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex justify-between items-center bg-background/50 backdrop-blur-md sticky top-16 z-10 py-4 -mt-4 border-b border-primary/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-yellow-400 shadow-lg shadow-orange-500/20">
                        <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-headline font-bold">For You</h1>
                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">AI Picked • Just for your stack</p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                    <RefreshCw className="h-3 w-3" /> Refresh
                </Button>
            </div>

            <div className="max-w-3xl mx-auto space-y-8">
                {loading ? (
                    <div className="space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 rounded-3xl bg-muted/50 animate-pulse border border-border/50 flex items-center justify-center">
                                <Zap className="h-10 w-10 text-muted-foreground opacity-20" />
                            </div>
                        ))}
                    </div>
                ) : snippets.length > 0 ? (
                    snippets.map((snippet) => (
                        <SnippetCard key={snippet.id} snippet={snippet} />
                    ))
                ) : (
                    <div className="text-center py-32 rounded-3xl border-2 border-dashed border-primary/10 bg-primary/5">
                        <Star className="h-12 w-12 text-primary/20 mx-auto mb-4" />
                        <h2 className="text-2xl font-headline font-bold mb-2">Finding your matches...</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Upload more snippets or connect with developers to help our AI personalize your feed!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
