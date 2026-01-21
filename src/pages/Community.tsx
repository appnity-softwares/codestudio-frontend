
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { communityAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Search, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
// Assuming useDebounce hook exists or needs to be created/imported. 
// Standard hook usage. If not present, I can implement basic debounce.

export default function Community() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("recommended");
    const [page, setPage] = useState(1);
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        const handler = setTimeout(async () => {
            setDebouncedSearch(search);
            if (search.length > 1) {
                try {
                    const res = await communityAPI.getSearchSuggestions(search);
                    setSuggestions(res.users);
                    setShowSuggestions(true);
                } catch (e) {
                    setSuggestions([]);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ['community', debouncedSearch, sort, page],
        queryFn: () => communityAPI.getUsers({ search: debouncedSearch, sort, page }),
        staleTime: 60000 // Cache for 1 min
    });

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Community</h1>
                    <p className="text-muted-foreground">Discover talented developers in the ecosystem.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search developers..."
                            className="pl-8 w-full sm:w-[250px] bg-surface/50 border-white/10 focus:border-primary/50 transition-all"
                            value={search}
                            onChange={handleSearch}
                            onFocus={() => search.length > 1 && setShowSuggestions(true)}
                        />

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <div className="p-2 space-y-1">
                                    {suggestions.map((user: any) => (
                                        <button
                                            key={user.username}
                                            className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg transition-colors text-left"
                                            onClick={() => {
                                                navigate(`/u/${user.username}`);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            <Avatar className="h-8 w-8 border border-white/10">
                                                <AvatarImage src={user.image} />
                                                <AvatarFallback className="text-[10px]">{user.username[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-bold truncate">{user.name || user.username}</div>
                                                <div className="text-[10px] text-muted-foreground truncate">@{user.username}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                        {showSuggestions && (
                            <div
                                className="fixed inset-0 z-40"
                                onClick={() => setShowSuggestions(false)}
                            />
                        )}
                    </div>
                    <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
                        <SelectTrigger className="w-full sm:w-[150px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className="bg-surface border-white/10">
                            <SelectItem value="recommended">For You</SelectItem>
                            <SelectItem value="active">Recently Active</SelectItem>
                            <SelectItem value="trust">Highest Trust</SelectItem>
                            <SelectItem value="snippets">Most Snippets</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data?.users?.map((user: any) => (
                        <Card key={user.id} className="hover:border-primary/50 transition-all cursor-pointer group" onClick={() => navigate(`/u/${user.username}`)}>
                            <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                <div className="relative">
                                    <Avatar className="h-20 w-20 border-2 border-muted group-hover:border-primary transition-colors">
                                        <AvatarImage src={user.image} />
                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    {user.trustScore >= 90 && (
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5" title="High Trust">
                                            <ShieldCheck className="h-5 w-5 text-green-500 fill-current" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1 w-full">
                                    <h3 className="font-semibold truncate w-full text-foreground group-hover:text-primary transition-colors" title={user.name}>{user.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">@{user.username}</p>
                                </div>

                                {/* Skills Overview */}
                                <div className="flex flex-wrap justify-center gap-1 min-h-[16px]">
                                    {user.languages?.slice(0, 3).map((lang: string) => (
                                        <Badge key={lang} variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/5 text-primary border-primary/20">
                                            {lang}
                                        </Badge>
                                    ))}
                                    {user.languages?.length > 3 && (
                                        <span className="text-[10px] text-muted-foreground">+{user.languages.length - 3}</span>
                                    )}
                                </div>

                                {/* Mini Stats */}
                                <div className="flex items-center justify-center gap-4 w-full text-sm text-muted-foreground">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">{user.snippetCount || 0}</span>
                                        <span className="text-[10px] uppercase">Snippets</span>
                                    </div>
                                    <div className="w-px h-6 bg-border" />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground">{user.contestCount || 0}</span>
                                        <span className="text-[10px] uppercase">Contests</span>
                                    </div>
                                </div>

                                <Button size="sm" variant="outline" className="w-full mt-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    View Profile
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {(!data?.users || data.users.length === 0) && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">
                            No developers found matching your criteria.
                        </div>
                    )}
                </div>
            )}

            {/* Simple Pagination */}
            {data?.users?.length && data.users.length > 0 && (
                <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>Previous</Button>
                    <span className="flex items-center text-sm font-mono">Page {page}</span>
                    <Button variant="outline" onClick={() => setPage(page + 1)} disabled={data.users.length < 20}>Next</Button>
                </div>
            )}
        </div>
    );
}
