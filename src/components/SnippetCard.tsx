"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, LayoutTemplate, AlignLeft, Eye, GitFork, Clipboard } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { snippetsAPI } from "@/lib/api";
import { useNavigate, Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/useMediaQuery";

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
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const isMobile = useIsMobile();
    const [copied, setCopied] = useState(false);
    const [forking, setForking] = useState(false);

    const isVisual = snippet.previewType?.startsWith('WEB_PREVIEW');
    const isReact = (snippet.language?.toLowerCase() === 'react') ||
        (isVisual && (snippet.language?.toLowerCase() === 'typescript' || snippet.language?.toLowerCase() === 'javascript')) ||
        (snippet.code.includes('import React') || snippet.code.includes('export default') || snippet.code.includes('useState(') || snippet.code.includes('render('));

    const isHTML = snippet.language?.toLowerCase() === 'html' || (isVisual && !isReact);
    const hasPreview = isReact || isHTML || isVisual;

    const [viewMode, setViewMode] = useState<'preview' | 'code' | 'output'>(() => {
        // Initial state logic moved to initializer to avoid layout shift
        if (isReact || isHTML || snippet.previewType?.startsWith('WEB_PREVIEW')) return 'preview';
        return 'output';
    });

    // Sync view mode if it changes (rare but possible in dynamic environments)
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

    // ============ MOBILE INSTAGRAM LAYOUT ============
    if (isMobile) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6 }}
                className="mb-0 bg-black border-b border-white/10 pb-4"
            >
                {/* 1. Static Header */}
                <div className="flex items-center justify-between p-3">
                    <div className="flex items-center gap-3">
                        <Link to={`/profile/${snippet.author?.username || snippet.author?.id}`} className="block relative group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[1.5px]">
                                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                                    {snippet.author?.avatar ? (
                                        <img src={snippet.author.avatar} alt={snippet.author.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-bold text-white">{snippet.author?.name?.charAt(0) || 'U'}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                        <div className="flex flex-col">
                            <Link to={`/profile/${snippet.author?.username || snippet.author?.id}`} className="w-fit">
                                <span className="text-sm font-semibold text-white leading-none hover:text-primary transition-colors">
                                    {snippet.author?.name || 'User'}
                                    {snippet.verified && <span className="ml-1 text-[10px] text-blue-400">✓</span>}
                                </span>
                            </Link>
                            <span className="text-xs text-muted-foreground mt-0.5">
                                {snippet.language} • {snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Just now'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Content (Full Bleed) */}
                <div className="relative w-full aspect-square bg-[#0c0c0e]">
                    {viewMode === 'preview' ? (
                        isReact ? (
                            <div className={cn("absolute inset-0 overflow-auto flex p-4", alignment === 'center' ? "items-center justify-center" : "items-start justify-start")}>
                                <ReactLivePreview code={snippet.code} />
                            </div>
                        ) : (
                            <iframe srcDoc={getIframeSrc(snippet.code)} title="Preview" className="w-full h-full border-0 bg-white" sandbox="allow-scripts" />
                        )
                    ) : viewMode === 'output' ? (
                        <div className="absolute inset-0 bg-[#09090b] p-4 font-mono text-xs overflow-auto text-emerald-400 whitespace-pre-wrap">
                            {snippet.outputSnapshot || snippet.output || "// No output"}
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#0c0c0e]">
                            <CodeBlock code={snippet.code} language={snippet.language} className="h-full w-full bg-transparent p-4 text-xs font-mono" />
                        </div>
                    )}

                    {/* View Mode Toggle - Floating Glass Pill */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
                        <div className="flex bg-black/60 backdrop-blur-xl rounded-full p-1 shadow-2xl border border-white/10 gap-1">
                            {hasPreview && (
                                <button
                                    onClick={() => setViewMode('preview')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                        viewMode === 'preview' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                                    )}
                                >
                                    Preview
                                </button>
                            )}
                            <button
                                onClick={() => setViewMode('code')}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                    viewMode === 'code' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                                )}
                            >
                                Code
                            </button>
                            {(snippet.outputSnapshot || snippet.output) && (
                                <button
                                    onClick={() => setViewMode('output')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
                                        viewMode === 'output' ? "bg-white text-black shadow-lg" : "text-white/60 hover:text-white"
                                    )}
                                >
                                    Output
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Action Bar - Brand Touch */}
                <div className="px-3 pt-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Fork Action */}
                        <button
                            className="group flex items-center gap-1.5 disabled:opacity-50"
                            disabled={forking}
                            onClick={async () => {
                                if (!isAuthenticated) return toast({ variant: "destructive", title: "Login required" });
                                setForking(true);
                                try {
                                    const res = await snippetsAPI.fork(snippet.id);
                                    toast({ title: "Forked!", description: "Opening editor..." });
                                    navigate(`/create?fork=${res.snippet.id}`);
                                } finally { setForking(false); }
                            }}
                        >
                            <GitFork className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />
                            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                                {snippet.forkCount || 0}
                            </span>
                        </button>

                        {/* Copy Action */}
                        <button
                            className="group flex items-center gap-1.5"
                            onClick={() => {
                                navigator.clipboard.writeText(snippet.code);
                                setCopied(true);
                                toast({ title: "Copied!" });
                                setTimeout(() => setCopied(false), 2000);
                            }}
                        >
                            {copied ? <Check className="w-6 h-6 text-emerald-500" /> : <Clipboard className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" />}
                            <span className="text-sm font-medium text-white/70 group-hover:text-white transition-colors">
                                {snippet.copyCount || 0}
                            </span>
                        </button>
                    </div>

                    {/* Views Counter (Right Aligned) */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <Eye className="w-3 h-3 text-white/50" />
                        <span className="text-[10px] font-medium text-white/80">{snippet.viewsCount || 0}</span>
                    </div>
                </div>

                {/* 4. Caption / Description */}
                <div className="px-3 space-y-2">
                    <div className="text-sm text-white">
                        <span className="font-bold mr-2">{snippet.author?.name || 'User'}</span>
                        <span className="font-semibold">{snippet.title}</span>
                    </div>
                    {snippet.description && (
                        <p className="text-sm text-white/80 leading-relaxed font-normal">
                            {snippet.description}
                        </p>
                    )}
                    {snippet.tags && snippet.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                            {snippet.tags.map((tag: string) => (
                                <span key={tag} className="text-blue-400 text-sm">#{tag}</span>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        );
    }

    // ============ DESKTOP GLASS LAYOUT ============
    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl mx-auto mb-16 px-4 sm:px-0 transition-all duration-500"
        >
            <div className="relative group bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-2xl rounded-[2rem]">
                {/* Glass Shine */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-40" />

                {/* A. HEADER (Absolute Overlay) */}
                <div className="absolute top-0 left-0 right-0 p-5 z-20 flex flex-col gap-2 pointer-events-none text-left">
                    <div className="flex items-start justify-between pointer-events-auto">
                        <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    snippet.verified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary"
                                )} />
                                {snippet.verified && (
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">Verified</span>
                                )}
                                <h3 className="text-xl font-semibold text-white tracking-tight leading-none drop-shadow-md">{snippet.title}</h3>
                            </div>
                            {snippet.description && (
                                <p className="text-sm text-white/70 font-normal leading-relaxed max-w-md drop-shadow-sm">{snippet.description}</p>
                            )}
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                            <span className="px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-white/60">{snippet.language}</span>
                            {snippet.type && (
                                <span className={cn("px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10", typeColors[snippet.type] || "text-white/50")}>{snippet.type}</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* B. CONTENT */}
                <div className="relative w-full aspect-square overflow-hidden mt-24 rounded-[2rem]" style={{ transform: "translateZ(0)" }}>
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                        <span className="text-xs font-bold uppercase tracking-widest text-white/20 bg-black/40 backdrop-blur px-2 py-1 rounded-full border border-white/5">
                            {viewMode === 'preview' ? (isReact ? 'Live React' : 'Web Preview') : viewMode === 'output' ? 'Console Output' : 'Source Code'}
                        </span>
                    </div>
                    {viewMode === 'preview' ? (
                        isReact ? (
                            <div className={cn("absolute inset-0 overflow-auto bg-[#0c0c0e] flex p-4", alignment === 'center' ? "items-center justify-center" : "items-start justify-start")}>
                                <ReactLivePreview code={snippet.code} />
                            </div>
                        ) : (
                            <div className="absolute inset-0 bg-white">
                                <iframe srcDoc={getIframeSrc(snippet.code)} title="HTML Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
                            </div>
                        )
                    ) : viewMode === 'output' ? (
                        <div className="absolute inset-0 bg-[#09090b] p-6 font-mono text-xs overflow-auto">
                            <div className="relative group/output">
                                <div className="text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-hidden relative">
                                    {(snippet.outputSnapshot || snippet.output || "Success (No output)").slice(0, 300)}
                                    {(snippet.outputSnapshot || snippet.output || "").length > 300 && "..."}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#0c0c0e]">
                            <CodeBlock code={snippet.code} language={snippet.language} className="h-full w-full bg-transparent p-6 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto" />
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0c0c0e]/90 via-transparent to-transparent via-10%" />
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c0e] to-transparent pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* C. EXECUTION CONTROLS (Desktop) */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto">
                    <div className="bg-black/80 backdrop-blur-xl rounded-full p-1.5 border border-white/15 shadow-2xl flex items-center gap-2">
                        <div className="bg-white/10 rounded-full p-1 flex items-center gap-1">
                            {hasPreview && (
                                <>
                                    <button onClick={() => setViewMode('preview')} className={cn("px-3 py-1.5 text-xs font-bold uppercase rounded-full transition-all", viewMode === 'preview' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white")}>Preview</button>
                                    {viewMode === 'preview' && (
                                        <button onClick={() => setAlignment(a => a === 'center' ? 'top' : 'center')} className="px-2 py-1.5 text-white/50 hover:text-white transition-colors">
                                            {alignment === 'center' ? <LayoutTemplate className="h-3.5 w-3.5" /> : <AlignLeft className="h-3.5 w-3.5" />}
                                        </button>
                                    )}
                                </>
                            )}
                            {(snippet.outputSnapshot || snippet.output) && (
                                <button onClick={() => setViewMode('output')} className={cn("px-3 py-1.5 text-xs font-bold uppercase rounded-full transition-all", viewMode === 'output' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white")}>Output</button>
                            )}
                            <button onClick={() => setViewMode('code')} className={cn("px-3 py-1.5 text-xs font-bold uppercase rounded-full transition-all", viewMode === 'code' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white")}>Source</button>
                        </div>
                        {viewMode === 'code' && (
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors" onClick={() => { navigator.clipboard.writeText(snippet.code); setCopied(true); toast({ title: "Copied!" }); setTimeout(() => setCopied(false), 2000); }}>
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                </div>

                {/* D. FOOTER (Engagement) */}
                <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-3">
                            {snippet.author?.avatar && <img src={snippet.author.avatar} alt="Author" className="w-6 h-6 rounded-full border border-white/10" />}
                            <span className="text-xs font-semibold text-white/90">{snippet.author?.name || 'User'}</span>
                            <span className="text-muted-foreground text-xs">•</span>
                            <span className="text-xs text-muted-foreground font-medium">{snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Just now'}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-medium text-white/70">
                            <div className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5 text-white/40" /><span>{snippet.viewsCount || 0}</span></div>
                            <button className="flex items-center gap-1.5 hover:text-white transition-colors" onClick={async () => { if (!isAuthenticated) return toast({ variant: "destructive", title: "Login required" }); setForking(true); try { const res = await snippetsAPI.fork(snippet.id); toast({ title: "Forked!", description: "Opening editor..." }); navigate(`/create?fork=${res.snippet.id}`); } catch (e: any) { toast({ variant: "destructive", title: "Fork failed", description: e.message }); } finally { setForking(false); } }}><GitFork className="h-3.5 w-3.5 text-white/40" /><span>{snippet.forkCount || 0}</span></button>
                            <div className="flex items-center gap-1.5"><Clipboard className="h-3.5 w-3.5 text-white/40" /><span>{snippet.copyCount || 0}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
