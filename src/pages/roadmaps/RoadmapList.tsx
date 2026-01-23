import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    Clock,
    LayoutGrid,
    ChevronRight,
    Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "@/components/ui/Logo";

export default function RoadmapList() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["playlists", search],
        queryFn: () => playlistsAPI.getAll({ search }),
    });

    const createMutation = useMutation({
        mutationFn: playlistsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            setIsCreateOpen(false);
            toast({ title: "Roadmap Created!", description: "Now you can add snippets to your track." });
        },
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            difficulty: formData.get("difficulty") as string,
        });
    };

    return (
        <div className="container max-w-7xl mx-auto py-10 px-6 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-8 bg-primary rounded-full" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Knowledge Streams</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight font-headline text-foreground">
                        Developer <span className="text-primary italic">Roadmaps</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl font-medium">
                        Master specific technologies through curated, sequential snippet collections.
                        Follow proven paths or create your own learning tracks.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl bg-card text-foreground hover:bg-muted font-bold shadow-xl shadow-border/5">
                                <Plus className="w-5 h-5 mr-2" />
                                Create Track
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border text-foreground rounded-[2rem] max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black font-headline">New Learning Track</DialogTitle>
                                <DialogDescription className="text-muted-foreground">
                                    Create a curated collection of snippets to guide others.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Track Title</Label>
                                    <Input name="title" placeholder="e.g. Master Go Concurrency" required className="h-12 bg-muted/5 border-border rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Learning Objective</Label>
                                    <Textarea name="description" placeholder="What will learners achieve?" className="bg-muted/5 border-border rounded-xl min-h-[100px]" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Difficulty Tier</Label>
                                    <Select name="difficulty" defaultValue="BEGINNER">
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
                                <Button type="submit" disabled={createMutation.isPending} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-wider">
                                    {createMutation.isPending ? <Loader2 className="animate-spin" /> : "Initialize Roadmap"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Search roadmaps by title or technology..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-14 pl-12 bg-muted/5 border-border rounded-2xl focus:ring-primary/20 transition-all font-medium"
                />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-80 rounded-3xl bg-card border border-border animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {data?.playlists?.map((playlist: any, i: number) => (
                        <motion.div
                            key={playlist.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Link to={`/roadmaps/${playlist.id}`} className="group block h-full">
                                <div className="relative h-full p-8 rounded-[2rem] bg-gradient-to-br from-card to-transparent border border-border group-hover:border-primary/30 transition-all duration-500 overflow-hidden flex flex-col">
                                    {/* Accent Decoration */}
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-opacity duration-700">
                                        <Logo showText={false} className="w-24 h-24" />
                                    </div>

                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                            playlist.difficulty === 'BEGINNER' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                playlist.difficulty === 'INTERMEDIATE' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                        )}>
                                            {playlist.difficulty}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8 flex-1 relative z-10">
                                        <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors font-headline leading-tight">
                                            {playlist.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                                            {playlist.description}
                                        </p>
                                    </div>

                                    <div className="pt-6 border-t border-border flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground/30 uppercase tracking-tight">
                                            <div className="flex items-center gap-1.5">
                                                <LayoutGrid className="w-3.5 h-3.5" />
                                                {playlist.items?.length || 0} Steps
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {playlist.viewsCount || 0} Views
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center group-hover:bg-foreground group-hover:border-foreground transition-all duration-500">
                                            <ChevronRight className="w-5 h-5 text-foreground group-hover:text-background transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
