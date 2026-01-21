"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, LayoutTemplate, AlignLeft, Eye, GitFork, Clipboard, Edit, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { snippetsAPI } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MermaidDiagram } from "./preview/MermaidDiagram";

// Helper Colors
const typeColors: Record<string, string> = {
    ALGORITHM: "text-blue-400",
    UTILITY: "text-purple-400",
    EXAMPLE: "text-yellow-400",
    VISUAL: "text-pink-400"
};

interface SnippetCardProps {
    snippet: any;
}

export function SnippetCard({ snippet }: SnippetCardProps) {
    const { isAuthenticated, user } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [forking, setForking] = useState(false);

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

    // Sync view mode if it changes
    useEffect(() => {
        if (hasPreview) {
            setViewMode('preview');
        } else {
            setViewMode('output');
        }
    }, [hasPreview]);

    const [alignment, setAlignment] = useState<'center' | 'top'>(() => {
        if (snippet.previewType === 'WEB_PREVIEW_TOP') return 'top';
        return 'center';
    });

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl mx-auto mb-10 px-4 sm:px-0 transition-all duration-500"
        >
            <div className="relative group bg-gradient-to-br from-[#121214] to-[#0a0a0c] border border-white/10 shadow-2xl rounded-[1.5rem] overflow-hidden flex flex-col">

                {/* A. HEADER (Relative Block) */}
                <div className="p-5 border-b border-white/[0.04] bg-white/[0.01]">
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex flex-col gap-1.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={cn(
                                        "w-2 h-2 rounded-full shrink-0",
                                        snippet.verified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary"
                                    )} />
                                    {snippet.verified && (
                                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">Verified</span>
                                    )}
                                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug break-words">{snippet.title}</h3>
                                </div>
                                {snippet.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{snippet.description}</p>
                                )}
                            </div>

                            {/* Badges */}
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <span className="px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white/60">{snippet.language}</span>
                                {snippet.type && (
                                    <span className={cn("px-2 py-1 rounded-md bg-white/[0.05] border border-white/10 text-[10px] font-bold uppercase tracking-wider", typeColors[snippet.type] || "text-white/50")}>{snippet.type}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* B. CONTENT (Aspect Block) */}
                <div className="relative w-full aspect-[4/3] bg-black/50 overflow-hidden group/preview border-b border-white/[0.04]">
                    {/* View Mode Indicator */}
                    <div className="absolute top-3 right-3 z-20 pointer-events-none opacity-0 group-hover/preview:opacity-100 transition-opacity">
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
                                {(snippet.lastExecutionOutput || snippet.outputSnapshot || snippet.output || "Success (No output)")}
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#0c0c0e]">
                            <CodeBlock code={snippet.code} language={snippet.language} className="h-full w-full bg-transparent p-6 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto" />
                        </div>
                    )}

                    {/* Execution Controls (Overlay on Content) */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 w-auto opacity-0 group-hover/preview:opacity-100 transition-all duration-300 translate-y-2 group-hover/preview:translate-y-0">
                        <div className="bg-black/80 backdrop-blur-xl rounded-full p-1 border border-white/10 shadow-xl flex items-center gap-1">
                            {hasPreview && (
                                <>
                                    <button onClick={() => setViewMode('preview')} className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all", viewMode === 'preview' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white")}>Preview</button>
                                    {viewMode === 'preview' && (
                                        <button onClick={() => setAlignment(a => a === 'center' ? 'top' : 'center')} className="px-2 py-1 text-white/50 hover:text-white transition-colors">
                                            {alignment === 'center' ? <LayoutTemplate className="h-3 w-3" /> : <AlignLeft className="h-3 w-3" />}
                                        </button>
                                    )}
                                </>
                            )}
                            {((snippet.lastExecutionOutput || snippet.outputSnapshot || snippet.output) || !hasPreview) && (
                                <button onClick={() => setViewMode('output')} className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all", viewMode === 'output' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white")}>Output</button>
                            )}
                            <button onClick={() => setViewMode('code')} className={cn("px-3 py-1 text-[10px] font-bold uppercase rounded-full transition-all", viewMode === 'code' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white")}>Source</button>
                            {viewMode === 'code' && (
                                <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => { navigator.clipboard.writeText(snippet.code); setCopied(true); toast({ title: "Copied" }); setTimeout(() => setCopied(false), 2000); }}>
                                    {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* D. FOOTER (Bottom Block) */}
                <div className="p-4 bg-white/[0.02]">
                    <div className="flex items-center justify-between">
                        <Link to={`/profile/${snippet.author?.username || snippet.author?.id}`} className="flex items-center gap-2.5 group/author">
                            <Avatar className="h-8 w-8 border border-white/10">
                                <AvatarImage src={snippet.author?.avatar || snippet.author?.image} />
                                <AvatarFallback className="text-xs bg-white/5 text-white/50">{snippet.author?.name?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-white/80 group-hover/author:text-white transition-colors">{snippet.author?.name || 'Anonymous'}</span>
                                <span className="text-[10px] text-muted-foreground">{snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Recently'}</span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/80">
                            <div className="flex items-center gap-1.5" title="Views">
                                <Eye className="h-3.5 w-3.5" />
                                <span>{snippet.viewsCount || 0}</span>
                            </div>
                            <button
                                disabled={forking}
                                className="flex items-center gap-1.5 hover:text-white transition-colors disabled:opacity-50"
                                onClick={async () => {
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
                                }}
                                title="Fork"
                            >
                                <GitFork className="h-3.5 w-3.5" />
                                <span>{snippet.forkCount || 0}</span>
                            </button>
                            <div className="flex items-center gap-1.5" title="Copies">
                                <Clipboard className="h-3.5 w-3.5" />
                                <span>{snippet.copyCount || 0}</span>
                            </div>
                        </div>

                        {/* Owner Actions */}
                        {user?.id === snippet.authorId && (
                            <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-4">
                                <button
                                    onClick={() => navigate(`/create?edit=${snippet.id}`)}
                                    className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
                                    title="Edit Snippet"
                                >
                                    <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm("Are you sure you want to delete this snippet? This action cannot be undone.")) {
                                            try {
                                                await snippetsAPI.delete(snippet.id);
                                                toast({ title: "Deleted", description: "Snippet deleted successfully." });
                                                // Ideally refresh list, but reload works for MVP
                                                window.location.reload();
                                            } catch (e) {
                                                toast({ variant: "destructive", title: "Error", description: "Failed to delete snippet." });
                                            }
                                        }
                                    }}
                                    className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                                    title="Delete Snippet"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
