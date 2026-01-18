"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StreamFeed } from "@/components/StreamFeed";
import { snippetsAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { SystemSignals } from "@/components/SystemSignals";

export default function Feed() {
    const [search, setSearch] = useState("");
    const [language, setLanguage] = useState("all");
    const [sortBy, setSortBy] = useState("newest");

    // Debounce search ideally, but for now simple state
    const { data, isLoading: loading } = useQuery({
        queryKey: ['snippets', search, language, sortBy],
        queryFn: () => snippetsAPI.getAll({
            search: search,
            ...(language !== 'all' ? { language } : {}),
            orderBy: sortBy === 'oldest' ? 'oldest' : 'newest'
        })
    });

    const snippets = data?.snippets || [];

    return (
        <div className="min-h-full bg-canvas container max-w-7xl mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Feed Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Filter Bar */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-sm">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search snippets..."
                                className="pl-9 h-9 text-sm bg-background/50 border-white/10 focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[130px] h-9 text-xs uppercase font-bold tracking-wider">
                                    <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Languages</SelectItem>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="go">Go</SelectItem>
                                    <SelectItem value="react">React</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-[110px] h-9 text-xs uppercase font-bold tracking-wider">
                                    <SelectValue placeholder="Sort" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest</SelectItem>
                                    <SelectItem value="oldest">Oldest</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Feed Content */}
                    <StreamFeed snippets={snippets} loading={loading} />
                </div>

                {/* Right Sidebar - System Density */}
                <div className="hidden lg:block lg:col-span-4">
                    <SystemSignals snippets={snippets} />
                </div>
            </div>
        </div>
    )
}
