"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { playlistsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus, Search, MoreVertical, Edit3, Trash2,
    BookOpen, Users, Loader2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function RoadmapList() {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { user } = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ["playlists", search],
        queryFn: () => playlistsAPI.getAll({ search }),
    });

    const deleteMutation = useMutation({
        mutationFn: playlistsAPI.delete,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            toast({ title: "Roadmap Deleted", description: "The roadmap has been removed successfully." });
        },
    });

    const createMutation = useMutation({
        mutationFn: playlistsAPI.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["playlists"] });
            setIsCreateOpen(false);
            toast({ title: "Roadmap Created", description: "Your roadmap is now available." });
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
        <div className="container max-w-7xl mx-auto py-12 px-6 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative">
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight text-foreground">
                        Learning <span className="text-primary">Roadmaps</span>
                    </h1>
                    <p className="text-muted-foreground max-w-xl font-medium text-lg leading-relaxed">
                        Follow curated learning paths to master new technologies.
                        Structured learning for developers.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                                <Plus className="w-4 h-4 mr-3" />
                                Create Roadmap
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md p-8">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold">New Roadmap</DialogTitle>
                                <DialogDescription>Create a structured learning path for others to follow.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input name="title" placeholder="e.g. React Fundamentals" required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea name="description" placeholder="What will learners achieve?" className="min-h-[100px] p-4" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select name="difficulty" defaultValue="BEGINNER">
                                        <SelectTrigger className="h-12">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="BEGINNER">Beginner</SelectItem>
                                            <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                                            <SelectItem value="ADVANCED">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button type="submit" disabled={createMutation.isPending} className="w-full h-12 font-bold">
                                    {createMutation.isPending ? <Loader2 className="animate-spin" /> : "Create Roadmap"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative group max-w-2xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                    placeholder="Search roadmaps..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 pl-12 bg-muted/50 border-border rounded-xl font-medium"
                />
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data?.playlists?.map((playlist: any) => (
                        <RoadmapCard
                            key={playlist.id}
                            playlist={playlist}
                            user={user}
                            onDelete={(id) => deleteMutation.mutate(id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function RoadmapCard({ playlist, user, onDelete }: { playlist: any, user: any, onDelete: (id: string) => void }) {
    return (
        <div className="group relative bg-card rounded-xl border border-border transition-all duration-300 hover:shadow-lg flex flex-col overflow-hidden">
            <div className="p-6 flex flex-col h-full">
                {/* Actions */}
                {(user?.role === 'ADMIN' || user?.id === playlist.authorId) && (
                    <div className="absolute top-4 right-4 z-10">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this roadmap?")) {
                                            onDelete(playlist.id);
                                        }
                                    }}
                                    className="text-destructive focus:text-destructive cursor-pointer gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                    <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold border uppercase",
                        playlist.difficulty === 'BEGINNER' && "border-emerald-500/20 text-emerald-500 bg-emerald-500/5",
                        playlist.difficulty === 'INTERMEDIATE' && "border-blue-500/20 text-blue-500 bg-blue-500/5",
                        playlist.difficulty === 'ADVANCED' && "border-primary/20 text-primary bg-primary/5"
                    )}>
                        {playlist.difficulty}
                    </span>
                    {playlist.isPublic && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border border-muted-foreground/20 text-muted-foreground bg-muted/5 uppercase">
                            Public
                        </span>
                    )}
                </div>

                <Link to={`/roadmaps/${playlist.id}`} className="block group/title">
                    <h3 className="text-lg font-bold text-foreground group-hover/title:text-primary transition-colors line-clamp-1 mb-2">
                        {playlist.title}
                    </h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                    {playlist.description || "Embark on this learning journey and master the core concepts."}
                </p>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-4 text-muted-foreground text-xs">
                        <div className="flex items-center gap-1.5">
                            <BookOpen className="h-4 w-4" />
                            <span>{playlist.itemsCount || 0} Modules</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4" />
                            <span>{playlist.subscribersCount || 0} Learners</span>
                        </div>
                    </div>

                    <Link to={`/roadmaps/${playlist.id}`}>
                        <Button size="sm" className="rounded-lg px-4 font-bold">
                            View Roadmap
                        </Button>
                    </Link>
                </div>
            </div>
            {/* Hover Accent */}
            <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
        </div>
    );
}
