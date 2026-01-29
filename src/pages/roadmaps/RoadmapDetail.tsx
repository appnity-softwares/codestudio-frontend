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
    Trophy,
    BookOpen,
    Loader2,
    CheckCircle2,
    Trash2,
} from "lucide-react";
import { motion, Reorder } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SnippetCard } from "@/components/SnippetCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            toast({ title: "Module Added", description: "The snippet has been added to your roadmap." });
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
            toast({ title: "Module Removed", description: "The module has been removed from the roadmap." });
        },
    });

    const claimMutation = useMutation({
        mutationFn: () => playlistsAPI.claim(id!),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast({
                title: "Roadmap Completed!",
                description: `You've earned the ${data.endorsement} endorsement.`
            });
        },
        onError: (error: any) => {
            toast({
                variant: "destructive",
                title: "Failed to claim",
                description: error.message || "Complete all modules to claim certification."
            });
        }
    });

    const updateTrackMutation = useMutation({
        mutationFn: (data: any) => playlistsAPI.update(id!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlist", id] });
            setIsEditOpen(false);
            toast({ title: "Roadmap Updated", description: "Changes have been saved successfully." });
        },
    });

    const deleteTrackMutation = useMutation({
        mutationFn: () => playlistsAPI.delete(id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            toast({ title: "Roadmap Deleted", description: "The roadmap has been removed." });
            navigate("/roadmaps");
        },
    });

    const playlist = data?.playlist;
    const isAuthor = user?.id === playlist?.authorId;

    const completionRate = useMemo(() => {
        if (!playlist?.items?.length) return 0;
        const completed = playlist.items.filter((i: any) => i.isCompleted).length;
        return (completed / playlist.items.length) * 100;
    }, [playlist?.items]);

    const handleReorder = (newItems: any[]) => {
        const orders = newItems.map((item, index) => ({ id: item.id, order: index }));
        reorderMutation.mutate(orders);
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-background"><Loader2 className="animate-spin text-primary h-12 w-12" /></div>;

    return (
        <div className="container max-w-5xl mx-auto py-12 px-6 space-y-8 min-h-screen">
            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Link to="/roadmaps" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Roadmaps
                </Link>
            </div>

            {/* Hero Header */}
            <div className="relative p-8 rounded-2xl bg-card border border-border shadow-sm overflow-hidden">
                <div className="flex flex-col md:flex-row items-start justify-between gap-8 relative z-10">
                    <div className="space-y-4 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                                "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                                playlist?.difficulty === 'BEGINNER' && "border-emerald-500/20 text-emerald-500 bg-emerald-500/5",
                                playlist?.difficulty === 'INTERMEDIATE' && "border-blue-500/20 text-blue-500 bg-blue-500/5",
                                playlist?.difficulty === 'ADVANCED' && "border-primary/20 text-primary bg-primary/5"
                            )}>
                                {playlist?.difficulty}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-muted-foreground/20 text-muted-foreground bg-muted/5 uppercase">
                                {playlist?.items?.length || 0} Modules
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                {playlist?.title}
                            </h1>
                            <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                                {playlist?.description}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <img
                                src={playlist?.author?.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${playlist?.author?.username}`}
                                className="w-8 h-8 rounded-full border border-border"
                                alt={playlist?.author?.username}
                            />
                            <span className="text-sm font-medium">@{playlist?.author?.username}</span>
                        </div>
                    </div>

                    <div className="w-full md:w-80 space-y-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-bold text-primary">Progress</span>
                                <span className="text-2xl font-black text-foreground">{Math.round(completionRate)}%</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completionRate}%` }}
                                    className="h-full bg-primary"
                                />
                            </div>
                        </div>

                        {isAuthor ? (
                            <div className="flex flex-col gap-3">
                                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <DialogTrigger asChild>
                                        <Button className="w-full h-12 rounded-xl font-bold gap-2">
                                            <Plus className="w-4 h-4" /> Add Module
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
                                        <DialogHeader>
                                            <DialogTitle>Search Snippets</DialogTitle>
                                            <DialogDescription>Add snippets to your roadmap as modules.</DialogDescription>
                                        </DialogHeader>
                                        <div className="p-1 mt-4">
                                            <Input
                                                placeholder="Search by title, language, or tags..."
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                className="h-12"
                                            />
                                        </div>
                                        <ScrollArea className="flex-1 px-1 mt-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                                {searchResults?.snippets?.map((snippet: any) => (
                                                    <div key={snippet.id} className="relative group">
                                                        <SnippetCard snippet={snippet} className="pointer-events-none" />
                                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-xl">
                                                            <Button
                                                                onClick={() => addSnippetMutation.mutate(snippet.id)}
                                                                size="sm"
                                                                className="font-bold rounded-lg"
                                                            >
                                                                Add to Roadmap
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </DialogContent>
                                </Dialog>

                                <div className="grid grid-cols-2 gap-3">
                                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="h-11 rounded-xl font-bold">Edit</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Edit Roadmap</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={(e) => {
                                                e.preventDefault();
                                                updateTrackMutation.mutate({
                                                    title: editTitle,
                                                    description: editDescription,
                                                    difficulty: editDifficulty
                                                });
                                            }} className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Title</Label>
                                                    <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={4} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Difficulty</Label>
                                                    <Select value={editDifficulty} onValueChange={setEditDifficulty}>
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={updateTrackMutation.isPending}
                                                    className="w-full h-11"
                                                >
                                                    Save Changes
                                                </Button>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="h-11 rounded-xl font-bold">Delete</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete roadmap?</AlertDialogTitle>
                                                <AlertDialogDescription>This will permanently remove this learning path.</AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteTrackMutation.mutate()} className="bg-destructive text-white hover:bg-destructive/90">Delete</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        ) : (
                            <Button
                                onClick={() => {
                                    const next = playlist?.items?.find((i: any) => !i.isCompleted) || playlist?.items?.[0];
                                    if (next) {
                                        document.getElementById(`module-${next.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                    }
                                }}
                                size="lg"
                                className="w-full h-14 rounded-xl font-bold text-base"
                            >
                                <Play className="w-5 h-5 mr-3" />
                                Start Learning
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modules List */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold">Modules</h2>
                    <div className="h-px flex-1 bg-border" />
                </div>

                {playlist?.items && playlist.items.length > 0 ? (
                    <Reorder.Group
                        axis="y"
                        values={playlist.items}
                        onReorder={handleReorder}
                        className="space-y-4"
                    >
                        {playlist.items.map((item: any, idx: number) => (
                            <ModuleCard
                                key={item.id}
                                item={item}
                                index={idx}
                                isAuthor={isAuthor}
                                onRemove={() => removeSnippetMutation.mutate({ snippetId: item.snippetId })}
                            />
                        ))}
                    </Reorder.Group>
                ) : (
                    <div className="text-center py-20 bg-muted/30 rounded-2xl border-2 border-dashed border-border">
                        <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <h3 className="text-lg font-bold">No modules yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">This roadmap hasn't been populated with modules yet.</p>
                    </div>
                )}
            </div>

            {/* Completion Section */}
            {completionRate === 100 && !playlist?.claimed && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-12 rounded-2xl bg-primary/10 border border-primary/20 text-center space-y-6"
                >
                    <Trophy className="w-16 h-16 text-primary mx-auto" />
                    <div className="space-y-2">
                        <h3 className="text-3xl font-bold">Roadmap Completed!</h3>
                        <p className="text-muted-foreground text-lg">You've mastered all modules in this learning path.</p>
                    </div>
                    <Button
                        onClick={() => claimMutation.mutate()}
                        disabled={claimMutation.isPending}
                        size="lg"
                        className="rounded-xl px-12 font-bold h-14"
                    >
                        {claimMutation.isPending ? "Claiming..." : "Claim Certification"}
                    </Button>
                </motion.div>
            )}
        </div>
    );
}

function ModuleCard({ item, index, isAuthor, onRemove }: { item: any; index: number; isAuthor: boolean; onRemove?: () => void }) {
    return (
        <Reorder.Item
            value={item}
            dragListener={isAuthor}
            className="group relative"
        >
            <div id={`module-${item.id}`} className="flex gap-6 items-start">
                <div className="hidden sm:flex flex-col items-center gap-2 mt-2 shrink-0">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center border font-bold text-sm shadow-sm",
                        item.isCompleted ? "bg-emerald-500 text-white border-emerald-500" : "bg-card text-foreground border-border"
                    )}>
                        {item.isCompleted ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                    </div>
                    <div className="w-px flex-1 bg-border group-last:hidden min-h-[40px]" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className={cn(
                        "relative bg-card rounded-2xl border border-border overflow-hidden transition-all duration-300",
                        item.isCompleted && "bg-emerald-500/[0.02] border-emerald-500/20"
                    )}>
                        <SnippetCard snippet={item.snippet} className="border-0 rounded-none shadow-none bg-transparent" />

                        {isAuthor && (
                            <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                <div className="p-2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                    <GripVertical className="h-4 w-4" />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onRemove}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Reorder.Item>
    );
}
