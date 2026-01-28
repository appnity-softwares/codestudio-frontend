"use client";

import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Eye, GitFork, Edit, Trash2, ExternalLink, MessageSquare, NotebookPen, ListPlus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { snippetsAPI, playlistsAPI } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./preview/MermaidDiagram";
import { useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { incrementCopyCount, setCopyCount } from "@/store/slices/snippetsSlice";
import { debounce } from "lodash-es";
import { useCallback } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation } from "@tanstack/react-query";

// Helper Colors
const typeColors: Record<string, string> = {
    ALGORITHM: "text-blue-400",
    UTILITY: "text-purple-400",
    EXAMPLE: "text-yellow-400",
    VISUAL: "text-pink-400"
};

interface SnippetCardProps {
    snippet: any;
    className?: string;
}

export const SnippetCard = memo(({ snippet, className }: SnippetCardProps) => {
    const { isAuthenticated, user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const reduxCopyCount = useSelector((state: RootState) => state.snippets.copyCounts[snippet.id]);
    const hasCopiedLocally = useSelector((state: RootState) => state.snippets.userCopies[snippet.id]);

    const [copied, setCopied] = useState(false);
    const [forking, setForking] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddToPlaylistOpen, setIsAddToPlaylistOpen] = useState(false);
    const [isAltHeld, setIsAltHeld] = useState(false);

    // Fetch user's playlists only when dialog is open
    const { data: myPlaylists, isLoading: isLoadingPlaylists } = useQuery({
        queryKey: ["my-playlists", user?.id],
        queryFn: () => playlistsAPI.getAll({ authorId: user?.id }),
        enabled: isAddToPlaylistOpen && !!user?.id,
    });

    const addToPlaylistMutation = useMutation({
        mutationFn: ({ playlistId, snippetId }: { playlistId: string; snippetId: string }) =>
            playlistsAPI.addSnippet(playlistId, snippetId),
        onSuccess: () => {
            toast({ title: "Added to Track", description: "Snippet successfully added to your roadmap." });
            setIsAddToPlaylistOpen(false);
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Failed to add", description: err.message || "Something went wrong" });
        }
    });

    // Initialize Redux count from snippet prop
    useEffect(() => {
        if (snippet.id && reduxCopyCount === undefined) {
            dispatch(setCopyCount({ id: snippet.id, count: snippet.copyCount || 0 }));
        }
    }, [snippet.id, snippet.copyCount, reduxCopyCount, dispatch]);

    // Create a debounced API call for recording copies
    const debouncedRecordCopy = useCallback(
        debounce((id: string) => {
            snippetsAPI.recordCopy(id).catch(console.error);
        }, 1000, { leading: true, trailing: false }),
        []
    );

    // Prefetch snippet details on hover
    const handlePrefetch = () => {
        if (snippet?.id) {
            queryClient.prefetchQuery({
                queryKey: ['snippets', snippet.id],
                queryFn: () => snippetsAPI.getById(snippet.id),
                staleTime: 60000,
            });
        }
    };

    // Record View on Mount
    useEffect(() => {
        if (snippet?.id) {
            snippetsAPI.recordView(snippet.id).catch(console.error);
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.altKey) setIsAltHeld(true);
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (!e.altKey) setIsAltHeld(false);
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [snippet?.id]);

    const isVisual = snippet.previewType?.startsWith('WEB_PREVIEW');
    const isMarkdown = snippet.language?.toLowerCase() === 'markdown';
    const isMermaid = snippet.language?.toLowerCase() === 'mermaid';

    const isReact = (snippet.language?.toLowerCase() === 'react') ||
        (isVisual && (snippet.language?.toLowerCase() === 'typescript' || snippet.language?.toLowerCase() === 'javascript')) ||
        (snippet.code.includes('import React') || snippet.code.includes('export default') || snippet.code.includes('useState(') || snippet.code.includes('render('));

    const isHTML = snippet.language?.toLowerCase() === 'html' || (isVisual && !isReact);
    const hasPreview = isReact || isHTML || isVisual || isMarkdown || isMermaid;

    const [viewMode, setViewMode] = useState<'preview' | 'code' | 'output'>(() => {
        const isVisualFirst = isHTML || isMermaid || isReact;
        if (isVisualFirst && hasPreview) return 'preview';
        return 'code';
    });

    // Sync view mode if it changes
    useEffect(() => {
        const isVisualFirst = isHTML || isMermaid || isReact;
        if (isVisualFirst && hasPreview) {
            setViewMode('preview');
        } else {
            setViewMode('code');
        }
    }, [snippet.language, hasPreview, isHTML, isMermaid, isReact]);

    // Force output view if it's explicitly provided and we aren't in visual mode
    useEffect(() => {
        if (snippet.lastExecutionOutput && !hasPreview) {
            setViewMode('output');
        }
    }, [snippet.lastExecutionOutput, hasPreview]);

    const alignment = snippet.previewType === 'WEB_PREVIEW_TOP' ? 'top' : 'center';

    const getIframeSrc = (code: string) => {
        if (alignment === 'center') {
            return `
                <html>
                <head>
                    <style>
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            margin: 0;
                            font-family: system-ui, -apple-system, sans-serif;
                            color: #fff;
                        }
                    </style>
                </head>
                <body>
                    ${code}
                </body>
                </html>
            `;
        }
        return code;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        toast({ title: "Code Copied", description: "Copied to clipboard" });

        if (!hasCopiedLocally) {
            dispatch(incrementCopyCount(snippet.id));
            debouncedRecordCopy(snippet.id);
        }

        setTimeout(() => setCopied(false), 2000);
    };

    const handleFork = async () => {
        if (!isAuthenticated) return toast({ variant: "destructive", title: "Login required" });
        setForking(true);
        try {
            const res = await snippetsAPI.fork(snippet.id);
            toast({ title: "Forked!", description: "High five! 👋" });
            navigate(`/create?fork=${res.snippet.id}`);
        } catch (e: any) {
            toast({ variant: "destructive", title: "Fork failed", description: e.message });
        } finally {
            setForking(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await snippetsAPI.delete(snippet.id);
            toast({ title: "Deleted", description: "Snippet deleted successfully." });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
        } catch (e) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete snippet." });
            setIsDeleting(false);
        }
    };

    const [expanded, setExpanded] = useState(false);
    const isLongDescription = (snippet.description || "").length > 100;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.4 }}
            onMouseEnter={handlePrefetch}
            className={cn(
                "w-full max-w-xl mx-auto mb-6 md:mb-10 px-0 transition-all duration-500",
                className
            )}
        >
            <div className="relative group bg-card border border-border shadow-sm hover:shadow-md transition-all rounded-[1.5rem] overflow-hidden flex flex-col">

                {/* A. HEADER (Formerly Footer) - Author & Actions */}
                <div className="p-4 bg-muted/20 border-b border-border">
                    <div className="flex items-center justify-between">
                        <Link to={`/u/${snippet.author?.username || snippet.authorId}`} className="flex items-center gap-2.5 group/author">
                            <Avatar className="h-8 w-8 border border-border">
                                <AvatarImage src={snippet.author?.image} />
                                <AvatarFallback className="text-xs bg-muted text-muted-foreground">{snippet.author?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-foreground/80 group-hover/author:text-foreground transition-colors">{snippet.author?.username || 'Anonymous'}</span>
                                <span className="text-[10px] text-muted-foreground">{snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Recently'}</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
                                            onClick={handleCopy}
                                        >
                                            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            <span>{reduxCopyCount || 0}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Copy Code</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-1.5 cursor-default">
                                            <Eye className="h-3.5 w-3.5" />
                                            <span>{snippet.viewsCount || 0}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>Views</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            disabled={forking}
                                            className="flex items-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50"
                                            onClick={handleFork}
                                        >
                                            <GitFork className={cn("h-3.5 w-3.5", forking && "animate-pulse")} />
                                            <span>{snippet.forkCount || 0}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Fork Snippet</TooltipContent>
                                </Tooltip>

                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Dialog open={isAddToPlaylistOpen} onOpenChange={setIsAddToPlaylistOpen}>
                                            <DialogTrigger asChild>
                                                <button
                                                    disabled={!isAuthenticated}
                                                    className="flex items-center gap-1.5 hover:text-foreground transition-colors disabled:opacity-50"
                                                >
                                                    <ListPlus className="h-3.5 w-3.5" />
                                                </button>
                                            </DialogTrigger>
                                            <DialogContent className="bg-popover border-border text-popover-foreground rounded-2xl max-w-sm">
                                                <DialogHeader>
                                                    <DialogTitle>Add to Roadmap</DialogTitle>
                                                    <DialogDescription>Select a track to add this snippet to.</DialogDescription>
                                                </DialogHeader>
                                                <ScrollArea className="h-[300px] pr-4">
                                                    <div className="space-y-2 mt-2">
                                                        {isLoadingPlaylists ? (
                                                            <div className="flex justify-center py-8"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                                                        ) : myPlaylists?.playlists?.length === 0 ? (
                                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                                No roadmaps found. <Link to="/roadmaps" className="text-primary hover:underline">Create one?</Link>
                                                            </div>
                                                        ) : (
                                                            myPlaylists?.playlists?.map((playlist) => (
                                                                <button
                                                                    key={playlist.id}
                                                                    onClick={() => addToPlaylistMutation.mutate({ playlistId: playlist.id, snippetId: snippet.id })}
                                                                    disabled={addToPlaylistMutation.isPending}
                                                                    className="w-full p-3 rounded-xl bg-muted/40 hover:bg-muted border border-transparent hover:border-border transition-all flex items-center justify-between group text-left"
                                                                >
                                                                    <div>
                                                                        <div className="font-bold text-sm text-foreground">{playlist.title}</div>
                                                                        <div className="text-[10px] text-muted-foreground">{playlist.items?.length || 0} items</div>
                                                                    </div>
                                                                    {addToPlaylistMutation.isPending ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                                                    ) : (
                                                                        <ListPlus className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                    )}
                                                                </button>
                                                            ))
                                                        )}
                                                    </div>
                                                </ScrollArea>
                                            </DialogContent>
                                        </Dialog>
                                    </TooltipTrigger>
                                    <TooltipContent>Add to Roadmap</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Owner Actions */}
                        {isAuthenticated && user?.id === snippet.authorId && (
                            <div className="flex items-center gap-1 border-l border-border pl-4 ml-4">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => navigate(`/create?edit=${snippet.id}`)}
                                                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Edit Snippet</TooltipContent>
                                    </Tooltip>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <button
                                                className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors ml-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent className="bg-popover border-border text-popover-foreground">
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Delete Snippet?</AlertDialogTitle>
                                                <AlertDialogDescription className="text-muted-foreground">
                                                    This action is permanent and cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel className="bg-muted border-border">Keep</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={handleDelete}
                                                    className="bg-red-500 hover:bg-red-600"
                                                    disabled={isDeleting}
                                                >
                                                    Delete Permanent
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TooltipProvider>
                            </div>
                        )}
                    </div>
                </div>

                {/* B. CONTENT (Aspect Block) */}
                <div className="relative w-full h-[320px] sm:h-[400px] bg-muted/50 overflow-hidden group/preview border-b border-border">
                    {/* View Mode Indicator */}
                    <div className="absolute top-3 right-3 z-20 pointer-events-none opacity-100 sm:opacity-0 sm:group-hover/preview:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-background/80 backdrop-blur px-2 py-1 rounded border border-border">
                            {isAltHeld ? "⚡ Quick Look" : (viewMode === 'preview' ? (isReact ? 'Live React' : isMarkdown ? 'Markdown' : 'Web Preview') : viewMode === 'output' ? 'Console' : 'Source')}
                        </span>
                    </div>

                    {isAltHeld ? (
                        <div className="absolute inset-0 bg-background text-foreground animate-in fade-in zoom-in-95 duration-200">
                            <div className="absolute inset-0 p-6 pointer-events-none">
                                <div className="absolute inset-0 bg-primary/5 border-2 border-primary/20 rounded-2xl" />
                            </div>
                            <CodeBlock code={snippet.code} language={snippet.language} className="h-full w-full bg-transparent p-8 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto" />
                        </div>
                    ) : viewMode === 'preview' ? (
                        isReact ? (
                            <div className={cn("absolute inset-0 overflow-auto bg-background flex p-4", alignment === 'center' ? "items-center justify-center" : "items-start justify-start")}>
                                <ReactLivePreview code={snippet.code} />
                            </div>
                        ) : isMermaid ? (
                            <div className="absolute inset-0 bg-background overflow-hidden">
                                <MermaidDiagram definition={snippet.code} />
                            </div>
                        ) : isMarkdown ? (
                            <div className="absolute inset-0 bg-background p-8 overflow-auto prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{snippet.code}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-white">
                                <iframe srcDoc={getIframeSrc(snippet.code)} title="HTML Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
                            </div>
                        )
                    ) : viewMode === 'output' ? (
                        <div className="absolute inset-0 bg-muted/30 dark:bg-zinc-950 p-6 font-mono text-xs overflow-auto selection:bg-primary/30 custom-scrollbar text-foreground">
                            {snippet.stdinHistory ? (
                                <div className="space-y-1.5">
                                    {(() => {
                                        try {
                                            const lines = JSON.parse(snippet.stdinHistory);
                                            return lines.map((line: any, i: number) => (
                                                <div key={i} className={cn(
                                                    "whitespace-pre-wrap break-all leading-relaxed",
                                                    line.type === 'input' ? "text-primary font-bold before:content-['>_'] before:mr-2" :
                                                        line.type === 'error' ? "text-red-500" : "text-emerald-600 dark:text-emerald-400"
                                                )}>
                                                    {line.text}
                                                </div>
                                            ));
                                        } catch (e) {
                                            return <div className="text-emerald-600 dark:text-emerald-400">{snippet.lastExecutionOutput || "Output Error"}</div>;
                                        }
                                    })()}
                                </div>
                            ) : (
                                <div className="text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed">
                                    {snippet.lastExecutionOutput || snippet.outputSnapshot || snippet.output || "Success (No output)"}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-background text-foreground">
                            <CodeBlock code={snippet.code} language={snippet.language} className="h-full w-full bg-transparent p-6 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto" />
                        </div>
                    )}

                    {/* Execution Controls - ALWAYS VISIBLE (Removing opacity-0 group-hover logic) */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto translate-y-0">
                        <div className="bg-popover/90 border border-border shadow-xl rounded-full p-1.5 flex items-center gap-1 backdrop-blur-2xl ring-1 ring-white/10 dark:ring-white/10 ring-black/5">
                            <div className="flex items-center rounded-full p-0.5 relative gap-1">
                                <TooltipProvider>
                                    {hasPreview && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <button
                                                    onClick={() => setViewMode('preview')}
                                                    className={cn(
                                                        "relative z-10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-full",
                                                        viewMode === 'preview' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                                    )}
                                                >
                                                    {viewMode === 'preview' && (
                                                        <motion.div
                                                            layoutId={`activeTab-${snippet.id}`}
                                                            className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg"
                                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                                        />
                                                    )}
                                                    Preview
                                                </button>
                                            </TooltipTrigger>
                                            <TooltipContent>View rendered result</TooltipContent>
                                        </Tooltip>
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => setViewMode('output')}
                                                className={cn(
                                                    "relative z-10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-full",
                                                    viewMode === 'output' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {viewMode === 'output' && (
                                                    <motion.div
                                                        layoutId={`activeTab-${snippet.id}`}
                                                        className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg"
                                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                                    />
                                                )}
                                                Output
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>View console/logs</TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={() => setViewMode('code')}
                                                className={cn(
                                                    "relative z-10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-full",
                                                    viewMode === 'code' ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                                                )}
                                            >
                                                {viewMode === 'code' && (
                                                    <motion.div
                                                        layoutId={`activeTab-${snippet.id}`}
                                                        className="absolute inset-0 bg-primary rounded-full -z-10 shadow-lg"
                                                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                                    />
                                                )}
                                                Source
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>View source code</TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            <div className="w-[1px] h-4 bg-border mx-1" />

                            <div className="flex items-center gap-1 pr-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                onClick={handleCopy}
                                                className="p-2 text-muted-foreground hover:text-foreground transition-all hover:bg-muted rounded-full"
                                            >
                                                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>Copy to clipboard</TooltipContent>
                                    </Tooltip>

                                    {snippet.referenceUrl && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={snippet.referenceUrl.startsWith('http') ? snippet.referenceUrl : `https://${snippet.referenceUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 text-muted-foreground hover:text-primary transition-all hover:bg-primary/10 rounded-full"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent>Open Reference</TooltipContent>
                                        </Tooltip>
                                    )}
                                </TooltipProvider>
                            </div>
                        </div>
                    </div>
                </div>

                {/* C. FOOTER (Formerly Header) - Title & Description */}
                <div className="p-5 bg-card">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                            <Link
                                to={`/snippets/${snippet.id}`}
                                className="flex flex-col gap-1.5 min-w-0 group/header relative flex-1"
                            >
                                <div className="flex items-center gap-2 flex-wrap">
                                    {snippet.annotations && snippet.annotations !== "[]" ? (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <MessageSquare className="h-4 w-4 text-primary animate-pulse shrink-0" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-popover border-border text-popover-foreground font-bold p-2 rounded-lg">
                                                    Interactive Annotations Available
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    ) : (
                                        <NotebookPen className={cn(
                                            "h-4 w-4 shrink-0 transition-all",
                                            snippet.verified ? "text-emerald-500 drop-shadow-sm" : "text-primary/70"
                                        )} />
                                    )}

                                    {snippet.verified && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Verified</span>
                                    )}
                                    <h3 className="text-xl font-bold text-foreground tracking-tight leading-snug break-words group-hover/header:text-primary transition-colors pr-6">
                                        {snippet.title}
                                    </h3>
                                </div>
                                {snippet.description && (
                                    <div className="text-base font-normal text-muted-foreground leading-relaxed">
                                        {isLongDescription && !expanded ? (
                                            <>
                                                {snippet.description.slice(0, 100)}...{" "}
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setExpanded(true);
                                                    }}
                                                    className="text-primary font-bold text-xs hover:underline ml-1"
                                                >
                                                    Read More
                                                </button>
                                            </>
                                        ) : (
                                            snippet.description
                                        )}
                                    </div>
                                )}
                            </Link>

                            {/* Tags/Badges */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    <span className="px-2 py-1 rounded-md bg-muted border border-border text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{snippet.language}</span>
                                    {snippet.type && (
                                        <span className={cn("px-2 py-1 rounded-md bg-muted border border-border text-[10px] font-bold uppercase tracking-wider", typeColors[snippet.type] || "text-muted-foreground")}>{snippet.type}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
