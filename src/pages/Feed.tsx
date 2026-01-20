"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamFeed } from "@/components/StreamFeed";
import { snippetsAPI, feedAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Flame, Clock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import { useIsMobile } from "@/hooks/useMediaQuery";

type FeedBucket = 'trending' | 'new' | 'editor';

export default function Feed() {
    const isMobile = useIsMobile();
    const [bucket, setBucket] = useState<FeedBucket>('trending');
    const [search, setSearch] = useState("");
    const [language, setLanguage] = useState("all");
    const [type, setType] = useState("all");
    const [difficulty, setDifficulty] = useState("all");

    // Use Smart Feed API for bucket-based feeds
    const { data: feedData, isLoading: feedLoading } = useQuery({
        queryKey: ['feed', bucket],
        queryFn: () => feedAPI.get(bucket),
        enabled: !search && language === 'all' && type === 'all' && difficulty === 'all',
    });

    // Use traditional search API when filters are active
    const { data: searchData, isLoading: searchLoading } = useQuery({
        queryKey: ['snippets', search, language, type, difficulty],
        queryFn: () => snippetsAPI.getAll({
            search,
            ...(language !== 'all' ? { language } : {}),
            ...(type !== 'all' ? { type } : {}),
            ...(difficulty !== 'all' ? { difficulty } : {}),
        }),
        enabled: !!(search || language !== 'all' || type !== 'all' || difficulty !== 'all'),
    });

    const isFiltering = !!(search || language !== 'all' || type !== 'all' || difficulty !== 'all');
    const snippets = isFiltering ? (searchData?.snippets || []) : (feedData?.snippets || []);
    const loading = isFiltering ? searchLoading : feedLoading;

    const tabs: { id: FeedBucket; label: string; icon: React.ReactNode }[] = [
        { id: 'trending', label: 'Trending', icon: <Flame className="h-4 w-4" /> },
        { id: 'new', label: 'New', icon: <Clock className="h-4 w-4" /> },
        { id: 'editor', label: 'Editor Picks', icon: <Star className="h-4 w-4" /> },
    ];

    return (
        <div className={cn(
            "min-h-full bg-canvas container max-w-[1800px] mx-auto",
            isMobile ? "py-4 px-0" : "py-8 px-4"
        )}>
            <div className="space-y-6">
                {/* Main Feed Column - Full Width */}
                <div className="space-y-6">
                    {/* v1.2: Feed Bucket Tabs */}
                    <div className="flex items-center gap-2 p-1 bg-surface/50 rounded-xl border border-border/50 w-fit">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setBucket(tab.id)}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                    bucket === tab.id
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                                )}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Bar */}
                    <div className={cn(
                        "flex flex-col gap-4 bg-surface rounded-xl border border-border shadow-sm",
                        isMobile ? "p-3 mx-4" : "p-4 md:flex-row items-center justify-between"
                    )}>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search snippets..."
                                className="pl-9 h-9 text-sm bg-background/50 border-white/10 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                            <Select value={type} onValueChange={setType}>
                                <SelectTrigger className="w-[100px] h-9 text-xs uppercase font-bold tracking-wider">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="ALGORITHM">Algo</SelectItem>
                                    <SelectItem value="UTILITY">Utility</SelectItem>
                                    <SelectItem value="EXAMPLE">Example</SelectItem>
                                    <SelectItem value="VISUAL">Visual</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={difficulty} onValueChange={setDifficulty}>
                                <SelectTrigger className="w-[100px] h-9 text-xs uppercase font-bold tracking-wider">
                                    <SelectValue placeholder="Diff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Diff</SelectItem>
                                    <SelectItem value="EASY">Easy</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HARD">Hard</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[110px] h-9 text-xs uppercase font-bold tracking-wider">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Langs</SelectItem>
                                    <SelectItem value="javascript">JS</SelectItem>
                                    <SelectItem value="typescript">TS</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="go">Go</SelectItem>
                                    <SelectItem value="react">React</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Feed Content */}
                    <div className="pb-20">
                        {snippets.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                    <Flame className="h-8 w-8 text-primary/50" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">No snippets yet</h3>
                                <p className="text-sm text-muted-foreground max-w-md mb-4">
                                    The feed is empty right now. Be the first to share a code snippet!
                                </p>
                                <p className="text-xs text-muted-foreground/60 max-w-sm mb-6">
                                    <strong>What happens next?</strong> When developers publish snippets, they'll appear here sorted by trending, new, or editor picks.
                                </p>
                                <a href="/create" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Create your first snippet →
                                </a>
                            </div>
                        ) : (
                            <StreamFeed snippets={snippets} loading={loading} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
