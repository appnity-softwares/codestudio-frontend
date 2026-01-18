"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Compass, Search, Terminal, Globe, Laptop, Smartphone, Cpu, Hash, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { snippetsAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    { id: "all", name: "ALL_SYSTEMS", icon: Compass, color: "text-primary" },
    { id: "frontend", name: "UI_LAYER", icon: Globe, color: "text-blue-400" },
    { id: "backend", name: "CORE_LOGIC", icon: Laptop, color: "text-purple-400" },
    { id: "mobile", name: "MOBILE_UPLINK", icon: Smartphone, color: "text-green-400" },
    { id: "ai", name: "NEURAL_NETS", icon: Cpu, color: "text-pink-400" },
];

const SIGNALS = [
    { name: "react_core", count: 428 },
    { name: "rust_borrow_checker", count: 156 },
    { name: "nextjs_app_router", count: 312 },
    { name: "tailwind_config", count: 89 },
    { name: "docker_compose", count: 204 },
];

export default function Explore() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");

    const { data, isLoading } = useQuery({
        queryKey: ['snippets'],
        queryFn: () => snippetsAPI.getAll()
    });

    const snippets = data?.snippets || [];

    // Filter Logic
    const filteredSnippets = snippets.filter((snippet: any) => {
        const matchesSearch = (
            snippet.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );

        let matchesCategory = true;
        if (activeCategory !== 'all') {
            const tags = (snippet.tags || []).map((t: string) => t.toLowerCase());
            const lang = (snippet.language || "").toLowerCase();

            if (activeCategory === 'frontend') matchesCategory = tags.includes('react') || tags.includes('vue') || tags.includes('css') || lang === 'javascript' || lang === 'typescript' || tags.includes('frontend');
            else if (activeCategory === 'backend') matchesCategory = tags.includes('node') || tags.includes('express') || tags.includes('db') || lang === 'python' || lang === 'go' || lang === 'rust' || tags.includes('backend');
            else if (activeCategory === 'mobile') matchesCategory = tags.includes('react native') || tags.includes('ios') || tags.includes('android') || tags.includes('mobile');
            else if (activeCategory === 'ai') matchesCategory = tags.includes('ai') || tags.includes('ml') || lang === 'python' || tags.includes('openai');
        }

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="flex bg-canvas min-h-full">
            {/* Main Discovery Stream */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {/* Command Bar */}
                <div className="flex items-center gap-4 bg-surface/50 border border-border p-2 rounded-lg backdrop-blur-sm sticky top-0 z-20">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="SEARCH_INDEX..."
                            className="pl-9 h-9 bg-canvas border-border/50 text-xs font-mono focus-visible:ring-primary/20"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-1 h-9 bg-canvas border border-border/50 rounded-md p-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={cn(
                                    "px-3 h-full rounded-sm text-[10px] font-mono uppercase tracking-wider transition-colors flex items-center gap-2",
                                    activeCategory === cat.id
                                        ? "bg-primary/20 text-primary hover:bg-primary/30"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                <cat.icon className="h-3 w-3" />
                                <span className="hidden sm:inline">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 rounded-md bg-surface border border-border animate-pulse" />
                        ))}
                    </div>
                ) : filteredSnippets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSnippets.map((snippet: any) => (
                            <SnippetCard key={snippet.id} snippet={snippet} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border rounded-lg bg-surface/30 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="relative mb-4">
                            <Terminal className="h-10 w-10 text-primary/30" />
                            <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                        </div>
                        <p className="text-xs font-mono font-bold tracking-widest text-primary/60">SYSTEM_INDEX_EMPTY</p>
                        <p className="text-[10px] text-muted-foreground mt-1 mb-4">No matching signals found in the matrix.</p>
                        <Button
                            variant="outline"
                            className="text-xs font-mono border-primary/30 hover:bg-primary/10 hover:text-primary"
                            onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                        >
                            RESET_FILTERS
                        </Button>
                    </div>
                )}
            </div>

            {/* Sidebar: Signals */}
            <aside className="w-64 border-l border-border bg-surface/30 p-4 hidden lg:block overflow-y-auto">
                <div className="space-y-6">
                    <div>
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                            <Sparkles className="h-3 w-3" /> Signal_Detection
                        </h3>
                        <div className="space-y-1">
                            {SIGNALS.map((signal) => (
                                <button
                                    key={signal.name}
                                    onClick={() => setSearchQuery(signal.name.split('_')[0])}
                                    className="w-full flex items-center justify-between p-2 rounded-sm hover:bg-white/5 text-left group transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Hash className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                                        <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground">
                                            {signal.name}
                                        </span>
                                    </div>
                                    <span className="text-[9px] font-mono text-muted-foreground/50 group-hover:text-primary/50">
                                        {signal.count}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 rounded-md border border-primary/20 bg-primary/5 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-colors">
                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <h4 className="text-xs font-bold text-primary mb-1 relative z-10">UPGRADE_PROTOCOL</h4>
                        <p className="text-[10px] text-muted-foreground relative z-10">Access verified logic blocks.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
}
