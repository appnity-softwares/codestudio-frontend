
import { useParams, Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
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
    Edit,
    Trash,
    Trash2
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SnippetCard } from "@/components/SnippetCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function RoadmapDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [search, setSearch] = useState("");

    // Edit form state
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editDifficulty, setEditDifficulty] = useState("BEGINNER");

    const { data, isLoading } = useQuery({
        queryKey: ["playlist", id],
        queryFn: () => playlistsAPI.getById(id!),
        enabled: !!id,
    });

    useEffect(() => {
        if (data?.playlist) {
            setEditTitle(data.playlist.title);
            setEditDescription(data.playlist.description);
            setEditDifficulty(data.playlist.difficulty);
        }
    }, [data?.playlist]);

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

    const updateTrackMutation = useMutation({
        mutationFn: (data: any) => playlistsAPI.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
            setIsEditOpen(false);
            toast({ title: "Track Updated", description: "Changes saved successfully." });
        },
    });

    const deleteTrackMutation = useMutation({
        mutationFn: () => playlistsAPI.delete(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            toast({ title: "Track Deleted", description: "The track has been removed from reality." });
            navigate("/roadmaps");
        },
    });

    if (isLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    const playlist = data?.playlist;
    const isAuthor = user?.id === playlist?.authorId;

    const handleReorder = (newItems: any[]) => {
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
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                    <Trophy className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="text-sm">
                                    <div className="text-muted-foreground font-bold uppercase text-[9px] tracking-widest">Bonus Logic</div>
                                    <div className="text-foreground font-black text-amber-500">+250 XP ON 100%</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Section */}
                        {!isAuthor && playlist?.items?.length > 0 && (
                            <div className="pt-6 space-y-4 max-w-md">
                                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-[0.2em]">
                                    <div className="flex items-center gap-2">
                                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                        <span>Current Synchronization</span>
                                    </div>
                                    <span className="text-primary">{Math.round(((data?.completedCount || 0) / (data?.totalCount || 1)) * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((data?.completedCount || 0) / (data?.totalCount || 1)) * 100}%` }}
                                        className="h-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground font-medium">
                                    Review all modules to unlock the <span className="text-foreground">Certification Portal</span> and claim your XP bonus.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {isAuthor ? (
                            <>
                                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="lg" className="rounded-3xl h-14 px-6 border-border hover:bg-muted font-bold text-xs uppercase tracking-widest">
                                            <Edit className="w-4 h-4 mr-2" />
                                            Modify Track
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-card border-border text-foreground rounded-[2rem] max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="text-2xl font-black font-headline">Update learning track</DialogTitle>
                                            <DialogDescription className="text-muted-foreground">Adjust the configuration of your knowledge stream.</DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={(e) => {
                                            e.preventDefault();
                                            updateTrackMutation.mutate({
                                                title: editTitle,
                                                description: editDescription,
                                                difficulty: editDifficulty
                                            });
                                        }} className="space-y-6 pt-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Track Title</Label>
                                                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="e.g. Master Go Concurrency" required className="h-12 bg-muted/5 border-border rounded-xl" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Learning Objective</Label>
                                                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="What will learners achieve?" className="bg-muted/5 border-border rounded-xl min-h-[100px]" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Difficulty Tier</Label>
                                                <Select value={editDifficulty} onValueChange={setEditDifficulty}>
                                                    <SelectTrigger className="h-12 bg-muted/5 border-border rounded-xl">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-card border-border">
                                                        <SelectItem value="BEGINNER">Beginner Friendly</SelectItem>
                                                        <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                        <SelectItem value="ADVANCED">Advanced / Pro</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="flex gap-3">
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button type="button" variant="destructive" className="h-12 rounded-xl font-bold px-4">
                                                            <Trash className="w-4 h-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent className="bg-card border-border text-foreground rounded-3xl">
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle className="font-black font-headline text-xl">Deconstruct Track?</AlertDialogTitle>
                                                            <AlertDialogDescription className="text-muted-foreground">
                                                                This will permanently remove this learning track and all its sequential data. This action cannot be reversed.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="rounded-xl border-border">Abort</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => deleteTrackMutation.mutate()} className="rounded-xl bg-red-500 hover:bg-red-600">Delete Track</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                                <Button type="submit" disabled={updateTrackMutation.isPending} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider">
                                                    {updateTrackMutation.isPending ? <Loader2 className="animate-spin" /> : "Sync Changes"}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="rounded-3xl h-14 sm:h-16 px-6 sm:px-8 bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-2xl">
                                            <Plus className="w-5 h-5 mr-2 sm:mr-3" />
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
                                                            onClick={() => {
                                                                addSnippetMutation.mutate(snippet.id);
                                                            }}
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
                            </>
                        ) : (
                            <Button size="lg" className="rounded-3xl h-16 px-10 bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary/20">
                                <Play className="w-5 h-5 mr-3" />
                                Initialize Stream
                            </Button>
                        )}
                    </div>
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
                                        onRemove={() => removeSnippetMutation.mutate({ snippetId: item.snippet.id })}
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

function ModuleCard({ item, index, isAuthor, onRemove }: { item: any; index: number; isAuthor: boolean; onRemove?: () => void }) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="group relative">
            {/* Connection Line */}
            <div className="absolute left-10 top-20 bottom-0 w-px bg-border group-last:hidden" />

            <div className="flex gap-8 relative">
                {/* Module Number */}
                <div className="shrink-0 w-20 h-20 rounded-[2rem] bg-gradient-to-br from-muted/50 to-transparent border border-border flex flex-col items-center justify-center group-hover:border-primary/30 transition-all duration-500 relative bg-muted/30">
                    {item.isCompleted ? (
                        <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20 border-2 border-background z-10">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                    ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Step</span>
                    )}
                    <span className={cn(
                        "text-2xl font-black font-headline transition-colors",
                        item.isCompleted ? "text-emerald-500" : "text-foreground"
                    )}>
                        0{index + 1}
                    </span>
                    {isAuthor && (
                        <div className="absolute -left-3 cursor-grab active:cursor-grabbing">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-4">
                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-border hover:border-border/80 transition-all duration-500 relative overflow-hidden">
                        <div className="flex items-start justify-between gap-4 mb-4">
                            <div>
                                <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors font-headline">
                                    {item.snippet.title}
                                </h3>
                                <p className="text-sm text-muted-foreground font-medium mt-1 line-clamp-1">{item.snippet.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                {isAuthor && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemove?.();
                                        }}
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
                            <span>{item.snippet.difficulty || "MEDIUM"}</span>
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
                            <Link
                                to={`/snippets/${item.snippet.id}`}
                                className="absolute bottom-6 right-8 text-primary group-hover:translate-x-1 transition-transform"
                            >
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
