"use client";

import { useState, useEffect, memo } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Eye, GitFork, Edit, Trash2, ExternalLink, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { snippetsAPI } from "@/lib/api";
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
import { ArrowUpRight } from "lucide-react";

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
        if (hasPreview) return 'preview';
        return 'output';
    });

    // Sync view mode if it changes or if new output arrives
    useEffect(() => {
        if (hasPreview) {
            setViewMode('preview');
        } else {
            setViewMode('output');
        }
    }, [hasPreview]);

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.4 }}
            onMouseEnter={handlePrefetch}
            className={cn(
                "w-full max-w-xl mx-auto mb-10 px-4 sm:px-0 transition-all duration-500",
                className
            )}
        >
            <div className="relative group bg-gradient-to-br from-[#121214] to-[#0a0a0c] border border-white/10 shadow-2xl rounded-[1.5rem] overflow-hidden flex flex-col">

                {/* A. HEADER */}
                <div className="p-5 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                            <Link
                                to={`/snippets/${snippet.id}`}
                                className="flex flex-col gap-1.5 min-w-0 group/header relative"
                            >
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full shrink-0",
                                        snippet.verified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary"
                                    )} />
                                    {snippet.verified && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Verified</span>
                                    )}
                                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug break-words group-hover/header:text-primary transition-colors pr-6">
                                        {snippet.title}
                                        <ArrowUpRight className="absolute right-0 top-1/2 -translate-y-1/2 h-4 w-4 opacity-0 group-hover/header:opacity-100 transition-all text-primary" />
                                    </h3>
                                </div>
                                {snippet.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{snippet.description}</p>
                                )}
                            </Link>

                            {/* Badges */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60">{snippet.language}</span>
                                    {snippet.annotations && snippet.annotations !== "[]" && (
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/20 border border-primary/30 text-[10px] font-bold uppercase tracking-wider text-primary animate-pulse">
                                                        <MessageSquare className="h-3 w-3" />
                                                        <span>annotated</span>
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent>This snippet has line-by-line explanations!</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )}
                                    {snippet.type && (
                                        <span className={cn("px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold uppercase tracking-wider", typeColors[snippet.type] || "text-white/50")}>{snippet.type}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. CONTENT (Aspect Block) */}
                <div className="relative w-full h-[320px] sm:h-[400px] bg-black/50 overflow-hidden group/preview border-b border-white/[0.04]">
                    {/* View Mode Indicator */}
                    <div className="absolute top-3 right-3 z-20 pointer-events-none opacity-100 sm:opacity-0 sm:group-hover/preview:opacity-100 transition-opacity">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/5">
                            {viewMode === 'preview' ? (isReact ? 'Live React' : isMarkdown ? 'Markdown' : 'Web Preview') : viewMode === 'output' ? 'Console' : 'Source'}
                        </span>
                    </div>

                    {viewMode === 'preview' ? (
                        isReact ? (
                            <div className={cn("absolute inset-0 overflow-auto bg-[#0c0c0e] flex p-4", alignment === 'center' ? "items-center justify-center" : "items-start justify-start")}>
                                <ReactLivePreview code={snippet.code} />
                            </div>
                        ) : isMermaid ? (
                            <div className="absolute inset-0 bg-[#0d1117] overflow-hidden">
                                <MermaidDiagram definition={snippet.code} />
                            </div>
                        ) : isMarkdown ? (
                            <div className="absolute inset-0 bg-[#0d1117] p-8 overflow-auto prose prose-invert prose-sm max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{snippet.code}</ReactMarkdown>
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-white">
                                <iframe srcDoc={getIframeSrc(snippet.code)} title="HTML Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
                            </div>
                        )
                    ) : viewMode === 'output' ? (
                        <div className="absolute inset-0 bg-[#09090b] p-6 font-mono text-xs overflow-auto">
                            <div className="text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed">
                                {snippet.lastExecutionOutput || snippet.outputSnapshot || snippet.output || "Success (No output)"}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#0c0c0e]">
                            <CodeBlock code={snippet.code} language={snippet.language} className="h-full w-full bg-transparent p-6 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto" />
                        </div>
                    )}

                    {/* Execution Controls - Redesigned for maximum visibility and aesthetic */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-auto opacity-0 group-hover/preview:opacity-100 transition-all duration-300 translate-y-2 group-hover/preview:translate-y-0">
                        <div className="bg-[#0c0c0e]/90 border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-full p-1.5 flex items-center gap-1 backdrop-blur-2xl ring-1 ring-white/10">
                            <div className="flex items-center rounded-full p-0.5 relative gap-1">
                                {hasPreview && (
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={cn(
                                            "relative z-10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-full",
                                            viewMode === 'preview' ? "text-black" : "text-white/60 hover:text-white"
                                        )}
                                    >
                                        {viewMode === 'preview' && (
                                            <motion.div
                                                layoutId={`activeTab-${snippet.id}`}
                                                className="absolute inset-0 bg-white rounded-full -z-10 shadow-lg"
                                                transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                            />
                                        )}
                                        Preview
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewMode('output')}
                                    className={cn(
                                        "relative z-10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-full",
                                        viewMode === 'output' ? "text-black" : "text-white/60 hover:text-white"
                                    )}
                                >
                                    {viewMode === 'output' && (
                                        <motion.div
                                            layoutId={`activeTab-${snippet.id}`}
                                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-lg"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                    Output
                                </button>
                                <button
                                    onClick={() => setViewMode('code')}
                                    className={cn(
                                        "relative z-10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300 rounded-full",
                                        viewMode === 'code' ? "text-black" : "text-white/60 hover:text-white"
                                    )}
                                >
                                    {viewMode === 'code' && (
                                        <motion.div
                                            layoutId={`activeTab-${snippet.id}`}
                                            className="absolute inset-0 bg-white rounded-full -z-10 shadow-lg"
                                            transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                                        />
                                    )}
                                    Source
                                </button>
                            </div>

                            <div className="w-[1px] h-4 bg-white/10 mx-1" />

                            <div className="flex items-center gap-1 pr-1">
                                <button
                                    onClick={handleCopy}
                                    className="p-2 text-white/40 hover:text-white transition-all hover:bg-white/5 rounded-full"
                                    title="Copy Code"
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>

                                {snippet.referenceUrl && (
                                    <a
                                        href={snippet.referenceUrl.startsWith('http') ? snippet.referenceUrl : `https://${snippet.referenceUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 text-white/40 hover:text-primary transition-all hover:bg-primary/10 rounded-full"
                                        title="External Docs"
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* C. FOOTER */}
                <div className="p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <Link to={`/profile/${snippet.author?.username || snippet.authorId}`} className="flex items-center gap-2.5 group/author">
                            <Avatar className="h-8 w-8 border border-white/10">
                                <AvatarImage src={snippet.author?.image} />
                                <AvatarFallback className="text-xs bg-white/5 text-white/50">{snippet.author?.username?.[0]?.toUpperCase() || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white/80 group-hover/author:text-white transition-colors">{snippet.author?.username || 'Anonymous'}</span>
                                <span className="text-[10px] text-muted-foreground">{snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Recently'}</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            className="flex items-center gap-1.5 hover:text-white transition-colors"
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
                                        <div className="flex items-center gap-1.5">
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
                                            className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50"
                                            onClick={handleFork}
                                        >
                                            <GitFork className={cn("h-3.5 w-3.5", forking && "animate-pulse")} />
                                            <span>{snippet.forkCount || 0}</span>
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Fork Snippet</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>

                        {/* Owner Actions */}
                        {isAuthenticated && user?.id === snippet.authorId && (
                            <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-4">
                                <button
                                    onClick={() => navigate(`/create?edit=${snippet.id}`)}
                                    className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                                    title="Edit Snippet"
                                >
                                    <Edit className="h-4 w-4" />
                                </button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="p-1.5 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
                                            title="Delete Snippet"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="bg-[#14141a] border-white/10 text-white">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Snippet?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-white/40">
                                                This action is permanent and cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="bg-white/5 border-white/10">Keep</AlertDialogCancel>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
