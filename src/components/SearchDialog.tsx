"use client"

import * as React from "react"
import {
    Settings,
    User,
    Search,
    FileText,
    Home,
    Hash,
    Cpu,
    BookOpen
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useNavigate } from "react-router-dom";
import { searchAPI } from "@/lib/api";
import { debounce } from "lodash-es";

export function SearchDialog() {
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [searchResults, setSearchResults] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        }

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const performSearch = React.useCallback(
        debounce(async (query: string) => {
            if (!query || query.length < 2) {
                setSearchResults(null);
                return;
            }

            setLoading(true);
            try {
                const data = await searchAPI.search(query, undefined, 5);
                setSearchResults(data.results);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }, 300),
        []
    );

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        performSearch(value);
    };

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false);
        setSearchQuery("");
        setSearchResults(null);
        command();
    }, []);

    return (
        <>
            <div
                onClick={() => setOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-muted-foreground text-sm cursor-pointer transition-colors w-64 group"
            >
                <Search className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                <span className="flex-1 opacity-50 group-hover:opacity-100 transition-opacity">Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-black/20 px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search snippets, users, docs, components..."
                    value={searchQuery}
                    onValueChange={handleSearchChange}
                />
                <CommandList>
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : searchResults ? (
                        <>
                            {searchResults.snippets?.length > 0 && (
                                <CommandGroup heading="Snippets">
                                    {searchResults.snippets.map((snippet: any) => (
                                        <CommandItem key={snippet.id} onSelect={() => runCommand(() => navigate(`/feed`))}>
                                            <FileText className="mr-2 h-4 w-4 text-blue-400" />
                                            <div className="flex-1">
                                                <div className="font-medium">{snippet.title}</div>
                                                <div className="text-xs text-muted-foreground">{snippet.language}</div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {searchResults.users?.length > 0 && (
                                <CommandGroup heading="Users">
                                    {searchResults.users.map((user: any) => (
                                        <CommandItem key={user.id} onSelect={() => runCommand(() => navigate(`/u/${user.username}`))}>
                                            <User className="mr-2 h-4 w-4 text-green-400" />
                                            <div className="flex-1">
                                                <div className="font-medium">@{user.username}</div>
                                                <div className="text-xs text-muted-foreground">{user.name}</div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}

                            {searchResults.documents?.length > 0 && (
                                <CommandGroup heading="Documents">
                                    {searchResults.documents.map((doc: any) => (
                                        <CommandItem key={doc.id} onSelect={() => runCommand(() => navigate(`/blogs/${doc.slug}`))}>
                                            <BookOpen className="mr-2 h-4 w-4 text-purple-400" />
                                            <span>{doc.title}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            )}



                            {!searchResults.snippets?.length && !searchResults.users?.length &&
                                !searchResults.documents?.length && !searchResults.components?.length && (
                                    <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
                                )}
                        </>
                    ) : (
                        <>
                            <CommandGroup heading="Quick Navigation">
                                <CommandItem onSelect={() => runCommand(() => navigate('/feed'))}>
                                    <Home className="mr-2 h-4 w-4" />
                                    <span>Home Feed</span>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => navigate('/explore'))}>
                                    <Hash className="mr-2 h-4 w-4" />
                                    <span>Explore</span>
                                </CommandItem>

                                <CommandItem onSelect={() => runCommand(() => navigate('/foryou'))}>
                                    <Cpu className="mr-2 h-4 w-4" />
                                    <span>For You</span>
                                </CommandItem>
                            </CommandGroup>

                            <CommandSeparator />



                            <CommandGroup heading="Settings">
                                <CommandItem onSelect={() => runCommand(() => navigate('/profile/me'))}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                    <CommandShortcut>⌘P</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => runCommand(() => navigate('/settings'))}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                    <CommandShortcut>⌘S</CommandShortcut>
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    )
}
