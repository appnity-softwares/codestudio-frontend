
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistsAPI, snippetsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    ChevronLeft,
    Play,
    Plus,
    GripVertical,
    ArrowRight,
    Trophy,
    BookOpen,
    Loader2,
    CheckCircle2,
    Trash2
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { SnippetCard } from "@/components/SnippetCard";

export default function RoadmapDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["playlist", id],
        queryFn: () => playlistsAPI.getById(id!),
        enabled: !!id,
    });

    const { data: searchResults } = useQuery({
        queryKey: ["snippets-search", search],
        queryFn: () => snippetsAPI.getAll({ search }),
        enabled: search.length > 2,
    });

    const addSnippetMutation = useMutation({
        mutationFn: (snippetId: string) => playlistsAPI.addSnippet(id!, snippetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
            toast({ title: "Snippet Added", description: "Successfully added to your track." });
        },
    });

    const reorderMutation = useMutation({
        mutationFn: (orders: { id: string; order: number }[]) => playlistsAPI.reorder(id!, orders),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
        },
    });

    const removeSnippetMutation = useMutation({
        mutationFn: ({ snippetId }: { snippetId: string }) => playlistsAPI.removeSnippet(id!, snippetId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
            toast({ title: "Removed", description: "Snippet removed from track." });
        },
    });

    const claimMutation = useMutation({
        mutationFn: () => playlistsAPI.claim(id!),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast({
                title: "Certification Unlocked!",
                description: `Successfully claimed ${data.endorsement}. +250 XP granted.`
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Unable to Claim",
                description: error.message || "Finish all modules or check your permissions."
            });
        }
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    const playlist = data?.playlist;
    const isAuthor = user?.id === playlist?.authorId;

    const handleReorder = (newItems: any[]) => {
        // Optimistic UI update could be added here
        const orders = newItems.map((item, index) => ({ id: item.id, order: index }));
        reorderMutation.mutate(orders);
    };

    return (
        <div className="container max-w-5xl mx-auto py-12 px-6 space-y-12 animate-in fade-in duration-700">
            {/* Navigation */}
            <Link to="/roadmaps" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-bold uppercase tracking-widest">
                <ChevronLeft className="w-4 h-4" />
                Back to Tracks
            </Link>

            {/* Hero Header */}
            <div className="relative p-10 rounded-[3rem] bg-gradient-to-br from-primary/10 via-background to-background border border-border overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
                    <div className="space-y-6 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-1.5 rounded-full bg-primary/20 text-primary border border-primary/30 text-[10px] font-black uppercase tracking-[0.2em]">
                                {playlist?.difficulty} Track
                            </div>
                            <div className="px-4 py-1.5 rounded-full bg-muted text-muted-foreground border border-border text-[10px] font-black uppercase tracking-[0.2em]">
                                {playlist?.items?.length || 0} Modules
                            </div>
                        </div>

                        <h1 className="text-5xl font-black font-headline text-foreground leading-tight">
                            {playlist?.title}
                        </h1>

                        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                            {playlist?.description}
                        </p>

                        <div className="flex items-center gap-6 pt-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={playlist?.author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${playlist?.author?.username}`}
                                    className="w-10 h-10 rounded-xl object-cover border border-border"
                                />
                                <div className="text-sm">
                                    <div className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Architect</div>
                                    <div className="text-foreground font-black">@{playlist?.author?.username}</div>
                                </div>
                            </div>
                            <div className="h-10 w-px bg-border" />
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-sm">
                                    <div className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Completion Bonus</div>
                                    <div className="text-foreground font-black">+250 XP</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {isAuthor ? (
                        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                            <DialogTrigger asChild>
                                <Button size="lg" className="rounded-3xl h-16 px-8 bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-xs shadow-2xl">
                                    <Plus className="w-5 h-5 mr-3" />
                                    Extend Track
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-background border-border text-foreground rounded-[2rem] max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black font-headline">Inject Knowledge Snippet</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6 pt-4">
                                    <div className="relative group">
                                        <Input
                                            placeholder="Recall snippets by keyword..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="h-14 bg-muted/40 border-border rounded-xl focus:ring-primary/20"
                                        />
                                    </div>
                                    <div className="max-h-[400px] overflow-y-auto space-y-3 custom-scrollbar pr-2">
                                        {searchResults?.snippets?.map((snippet: any) => (
                                            <div key={snippet.id} className="p-4 rounded-2xl bg-muted/20 border border-border hover:border-primary/50 transition-all flex items-center justify-between group">
                                                <div>
                                                    <div className="font-bold text-foreground mb-1">{snippet.title}</div>
                                                    <div className="text-[10px] font-mono text-primary uppercase">{snippet.language}</div>
                                                </div>
                                                <Button
                                                    onClick={() => addSnippetMutation.mutate(snippet.id)}
                                                    disabled={addSnippetMutation.isPending}
                                                    size="sm"
                                                    className="bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-white rounded-xl"
                                                >
                                                    {addSnippetMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        ))}
                                        {search.length > 2 && searchResults?.snippets?.length === 0 && (
                                            <div className="text-center py-10 text-muted-foreground font-black uppercase tracking-widest">No matching neural patterns found</div>
                                        )}
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Button size="lg" className="rounded-3xl h-16 px-10 bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20">
                            <Play className="w-5 h-5 mr-3" />
                            Initialize Stream
                        </Button>
                    )}
                </div>
            </div>

            {/* Steps / Modules */}
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-border" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap">Sequential Timeline</h2>
                    <div className="h-px flex-1 bg-border" />
                </div>

                <div className="space-y-6">
                    {playlist?.items?.length === 0 && (
                        <div className="text-center py-20 rounded-[3rem] border-2 border-dashed border-border bg-muted/30">
                            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-black text-muted-foreground uppercase tracking-widest">Track is currently vacant</h3>
                            {isAuthor && <p className="text-sm text-muted-foreground/70 mt-2 font-medium">Add snippets to build your learning roadmap.</p>}
                        </div>
                    )}

                    {isAuthor ? (
                        <Reorder.Group
                            axis="y"
                            values={playlist?.items || []}
                            onReorder={handleReorder}
                            className="space-y-4"
                        >
                            {playlist?.items?.map((item: any, index: number) => (
                                <Reorder.Item
                                    key={item.id}
                                    value={item}
                                    dragListener={true}
                                >
                                    <ModuleCard
                                        item={item}
                                        index={index}
                                        isAuthor={true}
                                        onRemove={() => removeSnippetMutation.mutate({ snippetId: item.id })}
                                    />
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    ) : (
                        <div className="space-y-6">
                            {playlist?.items?.map((item: any, index: number) => (
                                <ModuleCard key={item.id} item={item} index={index} isAuthor={false} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Completion Section */}
            {playlist?.items?.length > 0 && !isAuthor && (
                <div className="p-10 rounded-[3rem] bg-emerald-500/5 border border-emerald-500/10 text-center space-y-6">
                    <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
                        <Trophy className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black font-headline text-foreground">Unlock Certification</h3>
                        <p className="text-muted-foreground font-medium max-w-md mx-auto mt-2">Finish all modules to earn industrial-grade recognition on your profile.</p>
                    </div>
                    {user?.endorsements?.includes(playlist?.awardsEndorsement) ? (
                        <div className="flex items-center justify-center gap-2 text-emerald-500 font-black uppercase text-xs tracking-widest bg-emerald-500/10 px-6 py-3 rounded-2xl border border-emerald-500/20">
                            <CheckCircle2 className="w-4 h-4" />
                            Certified Architect
                        </div>
                    ) : (
                        <Button
                            onClick={() => claimMutation.mutate()}
                            disabled={claimMutation.isPending}
                            variant="outline"
                            className="h-12 border-border hover:bg-muted rounded-2xl font-black uppercase tracking-widest text-[10px]"
                        >
                            {claimMutation.isPending ? "Verification in Progress..." : "Claim Certification"}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

function ModuleCard({ item, index, isAuthor, onRemove }: { item: any, index: number, isAuthor: boolean, onRemove?: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group relative">
            {/* Connection Line */}
            <div className="absolute left-10 top-20 bottom-0 w-px bg-border group-last:hidden" />

            <div className="flex gap-8 relative">
                {/* Module Number */}
                <div className="shrink-0 w-20 h-20 rounded-[2rem] bg-gradient-to-br from-muted/50 to-transparent border border-border flex flex-col items-center justify-center group-hover:border-primary/30 transition-all duration-500 relative bg-muted/30">
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Step</span>
                    <span className="text-2xl font-black text-foreground font-headline">0{index + 1}</span>
                    {isAuthor && <div className="absolute -left-3 cursor-grab active:cursor-grabbing"><GripVertical className="w-4 h-4 text-muted-foreground" /></div>}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-border hover:border-border/80 transition-all duration-500 relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors font-headline">{item.snippet.title}</h3>
                                <p className="text-sm text-muted-foreground font-medium mt-1 line-clamp-1">{item.snippet.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAuthor && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
                                        className="h-8 w-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="rounded-xl bg-muted/50 hover:bg-muted text-[10px] font-black uppercase tracking-tighter"
                                >
                                    {isExpanded ? "Collapse" : "Review Code"}
                                </Button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="text-primary">{item.snippet.language}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span>{item.snippet.difficulty || 'MEDIUM'}</span>
                            <span className="h-1 w-1 rounded-full bg-border" />
                            <span>{Math.floor(item.snippet.code.length / 100)} KB PAYLOAD</span>
                        </div>

                        <AnimatePresence>
                            {isExpanded && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6"
                                >
                                    <div className="pt-6 border-t border-border">
                                        <SnippetCard snippet={item.snippet} className="max-w-none shadow-none border-0 bg-transparent p-0" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isExpanded && (
                            <Link to={`/snippets/${item.snippet.id}`} className="absolute bottom-6 right-8 text-primary group-hover:translate-x-1 transition-transform">
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
