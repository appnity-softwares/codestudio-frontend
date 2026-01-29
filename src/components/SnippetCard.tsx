"use client";

import { useState, useEffect, memo, lazy, Suspense } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
    Copy, Check, Eye, Edit, Trash2, ListPlus, Heart,
    MessageCircle, Share2, Shield, Plus, MoreHorizontal,
    Flag, Ban, Terminal, Monitor, Code, ExternalLink, ThumbsDown
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { snippetsAPI, playlistsAPI, usersAPI } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const MermaidDiagram = lazy(() => import("./preview/MermaidDiagram").then(m => ({ default: m.MermaidDiagram })));
const ReactLivePreview = lazy(() => import("./preview/ReactLivePreview").then(m => ({ default: m.ReactLivePreview })));
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { toggleLike, toggleDislike, setCopyCount, incrementCopyCount, setLikeState, setDislikeState } from "@/store/slices/snippetSlice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ShareDialog } from "./ShareDialog";
import { CommentSection } from "./social/CommentSection";
import { Button } from "@/components/ui/button";

// Helper Colors
const typeColors: Record<string, string> = {
    ALGORITHM: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    UTILITY: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    EXAMPLE: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    VISUAL: "text-pink-400 bg-pink-500/10 border-pink-500/20"
};

interface SnippetCardProps {
    snippet: any;
    className?: string;
}

export const SnippetCard = memo(({ snippet, className }: SnippetCardProps) => {
    const { user, isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();

    const [copied, setCopied] = useState(false);
    const [shareOpen, setShareOpen] = useState(false);
    const [isAltHeld, setIsAltHeld] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [isBlockDialogOpen, setIsBlockDialogOpen] = useState(false);

    // Redux State
    const reduxCopyCount = useSelector((state: RootState) => state.snippets.copyCounts[snippet.id]);
    const hasCopiedLocally = useSelector((state: RootState) => state.snippets.userCopies[snippet.id]);
    const reduxIsLiked = useSelector((state: RootState) => state.snippets.likeStates[snippet.id]);
    const reduxIsDisliked = useSelector((state: RootState) => state.snippets.dislikeStates[snippet.id]);
    const isLiked = !!reduxIsLiked;
    const isDisliked = !!reduxIsDisliked;
    const likeCount = useSelector((state: RootState) => state.snippets.likesCounts[snippet.id] ?? snippet.likesCount ?? 0);
    const dislikeCount = useSelector((state: RootState) => state.snippets.dislikesCounts[snippet.id] ?? snippet.dislikesCount ?? 0);

    // Sync Initial State (Copy & Like)
    useEffect(() => {
        // Sync Copy
        if (snippet.id && reduxCopyCount === undefined) {
            dispatch(setCopyCount({ id: snippet.id, count: snippet.copyCount || 0 }));
        }
        // Sync Like - Only if undefined to avoid overwriting user interaction
        if (snippet.id && reduxIsLiked === undefined) {
            dispatch(setLikeState({
                id: snippet.id,
                isLiked: !!snippet.isLiked,
                count: snippet.likesCount || 0
            }));
        }
        // Sync Dislike - Only if undefined
        if (snippet.id && reduxIsDisliked === undefined) {
            dispatch(setDislikeState({
                id: snippet.id,
                isDisliked: !!snippet.isDisliked,
                count: snippet.dislikesCount || 0
            }));
        }
    }, [snippet.id, reduxIsLiked, reduxIsDisliked, reduxCopyCount, snippet.copyCount, snippet.likesCount, snippet.dislikesCount, snippet.isLiked, snippet.isDisliked, dispatch]);

    // Fetch user's playlists
    const { data: playlistsData } = useQuery({
        queryKey: ["my-playlists", user?.id],
        queryFn: () => playlistsAPI.getAll({ authorId: user?.id }),
        enabled: isAddToPlaylistOpen && isAuthenticated && !!user?.id,
    });

    // Like Status Mutation
    const likeMutation = useMutation({
        mutationFn: () => {
            if (!isAuthenticated) throw new Error("LOGIN_REQUIRED");
            return snippetsAPI.toggleLike(snippet.id);
        },
        onMutate: () => {
            if (!isAuthenticated) return;
            dispatch(toggleLike(snippet.id));
        },
        onError: (err: any) => {
            if (err.message === "LOGIN_REQUIRED") {
                toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to like snippets." });
                return;
            }
            dispatch(toggleLike(snippet.id));
            toast({ variant: "destructive", title: "Action failed", description: "Could not toggle like." });
        }
    });

    const [isFollowing, setIsFollowing] = useState(!!snippet.author?.isFollowing);

    const followMutation = useMutation({
        mutationFn: (targetIsFollowing: boolean) => targetIsFollowing
            ? usersAPI.unfollow(snippet.author?.username || snippet.authorId)
            : usersAPI.follow(snippet.author?.username || snippet.authorId),
        onMutate: async (targetIsFollowing) => {
            const prevState = isFollowing;
            setIsFollowing(!targetIsFollowing);
            return { prevState };
        },
        onError: (_err, _variables, context) => {
            if (context) setIsFollowing(context.prevState);
            toast({ variant: "destructive", title: "Action failed", description: "Identity sync interrupted. Please retry." });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['user', snippet.author?.username] });
        }
    });

    // Update state if snippet prop changes
    useEffect(() => {
        setIsFollowing(!!snippet.author?.isFollowing);
    }, [snippet.author?.isFollowing]);

    const dislikeMutation = useMutation({
        mutationFn: () => {
            if (!isAuthenticated) throw new Error("LOGIN_REQUIRED");
            return snippetsAPI.toggleDislike(snippet.id);
        },
        onMutate: () => {
            if (!isAuthenticated) return;
            dispatch(toggleDislike(snippet.id));
        },
        onError: (err: any) => {
            if (err.message === "LOGIN_REQUIRED") {
                toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to dislike snippets." });
                return;
            }
            dispatch(toggleDislike(snippet.id));
            toast({ variant: "destructive", title: "Action failed", description: "Could not toggle dislike." });
        }
    });

    // Helper Functions
    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        toast({ title: "Code Copied", description: "Copied to clipboard" });
        if (!hasCopiedLocally) {
            dispatch(incrementCopyCount(snippet.id));
            snippetsAPI.recordCopy(snippet.id).catch(console.error);
        }
        setTimeout(() => setCopied(false), 2000);
    };



    const handleDelete = async () => {
        try {
            await snippetsAPI.delete(snippet.id);
            toast({ title: "Deleted", description: "Snippet deleted successfully." });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete snippet." });
        }
    };

    const handleReport = async () => {
        if (!isAuthenticated) return toast({ variant: "destructive", title: "Login Required" });
        try {
            await usersAPI.report({
                targetId: snippet.id,
                targetType: 'SNIPPET',
                reason: 'Inappropriate content'
            });
            toast({ title: "Reported", description: "Thank you for making our community safer." });
        } catch (e) {
            toast({ variant: "destructive", title: "Failed", description: "Could not submit report." });
        }
    };

    const handleBlock = async () => {
        if (!isAuthenticated) return toast({ variant: "destructive", title: "Login Required" });
        try {
            await usersAPI.block(snippet.author.username || snippet.authorId);
            toast({ title: "User Blocked", description: "You will no longer see content from this user." });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
        } catch (e) {
            toast({ variant: "destructive", title: "Failed", description: "Could not block user." });
        }
    };

    const handleAddToPlaylist = async (playlistId: string, title: string) => {
        try {
            await playlistsAPI.addSnippet(playlistId, snippet.id);
            toast({ title: "Saved!", description: `Added to ${title}` });
            setIsAddToPlaylistOpen(false);
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Could not add to playlist." });
        }
    };

    // View Logic
    const isVisual = snippet.previewType?.startsWith('WEB_PREVIEW');
    const isMarkdown = snippet.language?.toLowerCase() === 'markdown';
    const isMermaid = snippet.language?.toLowerCase() === 'mermaid';
    const isReact = (snippet.language?.toLowerCase() === 'react') ||
        (isVisual && (snippet.language?.toLowerCase() === 'typescript' || snippet.language?.toLowerCase() === 'javascript')) ||
        (snippet.code.includes('import React') || snippet.code.includes('export default') || snippet.code.includes('useState(') || snippet.code.includes('render('));
    const isHTML = snippet.language?.toLowerCase() === 'html' || (isVisual && !isReact);
    const hasPreview = isReact || isHTML || isVisual || isMarkdown || isMermaid;

    const [viewMode, setViewMode] = useState<'preview' | 'code' | 'output'>(hasPreview ? 'preview' : 'code');

    // Keyboard listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.altKey) setIsAltHeld(true); };
        const handleKeyUp = (e: KeyboardEvent) => { if (!e.altKey) setIsAltHeld(false); };
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    const isLongDescription = (snippet.description || "").length > 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            className={cn("w-full max-w-xl mx-auto mb-8 group/card font-sans", className)}
        >
            <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 shadow-sm hover:shadow-md transition-all duration-300 rounded-[1.25rem] overflow-hidden flex flex-col">

                {/* 1. Header: Author & Context Menu */}
                <div className="px-4 py-3 flex items-center justify-between border-b border-border/40 bg-muted/20">
                    <Link to={`/u/${snippet.author?.username || snippet.authorId}`} className="flex items-center gap-3 group/author">
                        <Avatar className="h-9 w-9 border border-border/60 shadow-sm transition-transform group-hover/author:scale-105">
                            <AvatarImage src={snippet.author?.image} />
                            <AvatarFallback className="text-xs font-bold bg-muted text-muted-foreground">{snippet.author?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col leading-tight">
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-bold text-foreground/90 group-hover/author:text-primary transition-colors">{snippet.author?.name || 'Anonymous'}</span>
                                {snippet.author?.role === 'ADMIN' && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Shield className="w-3 h-3 text-primary fill-primary/20" />
                                            </TooltipTrigger>
                                            <TooltipContent>Staff Member</TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-muted-foreground">@{snippet.author?.username} • {snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Recently'}</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        {isAuthenticated && user?.id !== snippet.authorId && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "h-8 px-3 text-xs font-bold rounded-full transition-all duration-300 border",
                                    isFollowing
                                        ? "text-muted-foreground border-border hover:text-red-500 hover:border-red-500/20 hover:bg-red-500/5"
                                        : "bg-primary/10 text-primary border-primary/20 hover:bg-primary hover:text-primary-foreground"
                                )}
                                onClick={(e: React.MouseEvent) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    followMutation.mutate(isFollowing);
                                }}
                                disabled={followMutation.isPending}
                            >
                                {followMutation.isPending ? "..." : isFollowing ? "Linked" : "Link"}
                            </Button>
                        )}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="p-2 -mr-2 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-full transition-colors">
                                    <MoreHorizontal className="h-4 w-4" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-popover/95 backdrop-blur-xl border-border/50">
                                {isAuthenticated && (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsAddToPlaylistOpen(true)}>
                                            <ListPlus className="mr-2 h-4 w-4" />
                                            <span>Add to Playlist</span>
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                {user?.id === snippet.authorId ? (
                                    <>
                                        <DropdownMenuItem onClick={() => navigate(`/create?edit=${snippet.id}`)}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            <span>Edit Snippet</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-500/10" onClick={() => setIsDeleteDialogOpen(true)}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Delete</span>
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onClick={() => setIsReportDialogOpen(true)} className="text-orange-500 focus:text-orange-500 focus:bg-orange-500/10">
                                            <Flag className="mr-2 h-4 w-4" />
                                            <span>Report Issue</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setIsBlockDialogOpen(true)} className="text-red-500 focus:text-red-500 focus:bg-red-500/10">
                                            <Ban className="mr-2 h-4 w-4" />
                                            <span>Block Author</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                {/* 2. Main Content (Preview) */}
                <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-muted/30 group/preview transition-colors overflow-hidden border-b border-border/40">
                    <AnimatePresence mode="wait">
                        {isAltHeld ? (
                            <motion.div key="alt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background z-50">
                                <CodeBlock code={snippet.code} language={snippet.language} className="h-full p-4 text-[10px] sm:text-xs" />
                            </motion.div>
                        ) : viewMode === 'preview' ? (
                            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0">
                                {isReact ? (
                                    <div className="h-full flex items-center justify-center p-4 bg-background/50 isolate overflow-auto">
                                        <Suspense fallback={<div className="animate-pulse bg-muted rounded w-full h-full" />}>
                                            <ReactLivePreview code={snippet.code} />
                                        </Suspense>
                                    </div>
                                ) : isMermaid ? (
                                    <div className="h-full bg-background p-4 flex items-center justify-center">
                                        <Suspense fallback={<div className="animate-pulse bg-muted rounded w-full h-full" />}>
                                            <MermaidDiagram definition={snippet.code} />
                                        </Suspense>
                                    </div>
                                ) : isMarkdown ? (
                                    <div className="h-full p-6 overflow-auto prose prose-invert prose-sm max-w-none bg-background"><ReactMarkdown remarkPlugins={[remarkGfm]}>{snippet.code}</ReactMarkdown></div>
                                ) : (
                                    <iframe srcDoc={snippet.code} className="w-full h-full border-0 bg-white" sandbox="allow-scripts" title="preview" />
                                )}
                            </motion.div>
                        ) : viewMode === 'output' ? (
                            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-zinc-950 p-4 font-mono text-xs overflow-auto text-emerald-400 selection:bg-emerald-400/20">
                                {snippet.lastExecutionOutput || snippet.outputSnapshot || "// No output captured."}
                            </motion.div>
                        ) : (
                            <motion.div key="code" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-background/50 backdrop-blur-[2px]">
                                <CodeBlock code={snippet.code} language={snippet.language} className="h-full p-4 text-[10px] sm:text-xs bg-transparent" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Floating Controls */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-1 p-1 rounded-full bg-background/80 hover:bg-background/95 border border-border/40 shadow-lg backdrop-blur-md transition-all scale-95 hover:scale-100">
                            {hasPreview && (
                                <button onClick={() => setViewMode('preview')} className={cn("p-2 rounded-full transition-all", viewMode === 'preview' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                                    <Monitor className="h-3.5 w-3.5" />
                                </button>
                            )}
                            <button onClick={() => setViewMode('code')} className={cn("p-2 rounded-full transition-all", viewMode === 'code' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                                <Code className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => setViewMode('output')} className={cn("p-2 rounded-full transition-all", viewMode === 'output' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
                                <Terminal className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick overlay for type/lang */}
                    <div className="absolute top-3 right-3 flex gap-1.5 z-20 pointer-events-none">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-md border border-border/40 text-[9px] h-5 uppercase tracking-wider font-extrabold text-muted-foreground shadow-sm">{snippet.language}</Badge>
                        {snippet.type && <Badge variant="outline" className={cn("backdrop-blur-md text-[9px] h-5 uppercase tracking-wider font-extrabold shadow-sm", typeColors[snippet.type])}>{snippet.type}</Badge>}
                    </div>
                </div>

                {/* 3. Footer: Details & Engagement Action Bar */}
                <div className="bg-card p-4 space-y-4">
                    {/* Title & Desc */}
                    {/* Title & Desc */}
                    <div className="block group/title">
                        <div className="flex items-start justify-between gap-4 mb-1">
                            <Link to={`/snippets/${snippet.id}`} className="text-lg font-bold tracking-tight text-foreground group-hover/title:text-primary transition-colors">
                                {snippet.title}
                            </Link>
                            {snippet.referenceUrl && (
                                <a
                                    href={snippet.referenceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 flex items-center gap-1 text-[10px] uppercase font-bold text-muted-foreground/50 hover:text-primary transition-colors border border-border/40 px-1.5 py-0.5 rounded hover:bg-muted"
                                    onClick={(e) => e.stopPropagation()}
                                    title={`Reference: ${snippet.referenceUrl}`}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                    <span className="hidden sm:inline-block max-w-[100px] truncate">{new URL(snippet.referenceUrl).hostname}</span>
                                </a>
                            )}
                        </div>
                        <div className="text-sm text-muted-foreground leading-relaxed">
                            {isLongDescription && !expanded ? (
                                <>{snippet.description.slice(0, 90)}... <span onClick={() => setExpanded(true)} className="text-primary font-medium text-xs hover:underline cursor-pointer">Read more</span></>
                            ) : (
                                snippet.description || <span className="italic opacity-50">No description provided.</span>
                            )}
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-1 sm:gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => likeMutation.mutate()}
                                            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border", isLiked ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground")}
                                        >
                                            <Heart className={cn("h-3.5 w-3.5 transition-transform active:scale-95", isLiked && "fill-current")} />
                                            <span>{likeCount}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Like this snippet</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => dislikeMutation.mutate()}
                                            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border", isDisliked ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground")}
                                        >
                                            <ThumbsDown className={cn("h-3.5 w-3.5 transition-transform active:scale-95", isDisliked && "fill-current")} />
                                            <span>{dislikeCount}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Dislike this snippet</TooltipContent>
                                </Tooltip>

                                <Sheet>
                                    <SheetTrigger asChild>
                                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 transition-all border border-transparent hover:border-border/50">
                                            <MessageCircle className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Discuss</span>
                                        </button>
                                    </SheetTrigger>
                                    <SheetContent className="w-full sm:max-w-md p-0 bg-background/95 backdrop-blur-xl border-l border-border/50">
                                        <div className="h-full flex flex-col">
                                            <div className="p-4 border-b border-border/40">
                                                <h3 className="font-bold text-lg">Discussion</h3>
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <CommentSection snippetId={snippet.id} />
                                            </div>
                                        </div>
                                    </SheetContent>
                                </Sheet>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 transition-all border border-transparent hover:border-border/50">
                                            <Share2 className="h-3.5 w-3.5" />
                                            <span>Share</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Share with others</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Secondary Metrics */}
                        <div className="flex items-center gap-3 text-muted-foreground/50">
                            <div className="flex items-center gap-1.5 text-xs font-medium cursor-help" title={`${snippet.viewsCount} views`}>
                                <Eye className="h-3.5 w-3.5" />
                                <span>{snippet.viewsCount || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium cursor-pointer hover:text-foreground transition-colors" onClick={handleCopy} title={`${reduxCopyCount} copies`}>
                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                <span>{reduxCopyCount || 0}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Dialog */}
            <ShareDialog open={shareOpen} onOpenChange={setShareOpen} title={snippet.title} url={`${window.location.origin}/snippets/${snippet.id}`} />

            {/* Playlist Dialog */}
            <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
                <DialogContent className="sm:max-w-md border-border/50">
                    <DialogHeader>
                        <DialogTitle>Add to Playlist</DialogTitle>
                        <DialogDescription>
                            Organize your favorite snippets into collections.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[200px] pr-4">
                        {playlistsData?.playlists?.length ? (
                            <div className="space-y-1">
                                {playlistsData.playlists.map((pl: any) => (
                                    <button
                                        key={pl.id}
                                        onClick={() => handleAddToPlaylist(pl.id, pl.title)}
                                        className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors text-left group"
                                    >
                                        <span className="font-medium text-sm">{pl.title}</span>
                                        <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-2 text-muted-foreground p-4">
                                <ListPlus className="h-8 w-8 opacity-20" />
                                <p className="text-sm">No playlists found.</p>
                                <Link to="/roadmaps" className="text-xs text-primary hover:underline">Create a Roadmap</Link>
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Snippet?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. This will permanently delete your snippet.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Report Alert */}
            <AlertDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Report Snippet?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to report this snippet? This will flag it for moderation review.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReport} className="bg-orange-500 text-white hover:bg-orange-600">Report</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Block Alert */}
            <AlertDialog open={isBlockDialogOpen} onOpenChange={setIsBlockDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Block User?</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to block {snippet.author?.name}? You will no longer see content from this user.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBlock} className="bg-red-500 text-white hover:bg-red-600">Block</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </motion.div>
    );
});

SnippetCard.displayName = "SnippetCard";
