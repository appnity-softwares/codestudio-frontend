"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Terminal, Copy, Check, LayoutTemplate, AlignLeft, Eye, GitFork, Clipboard } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { snippetsAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";

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

    return (
        <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl mx-auto mb-16 px-4 sm:px-0"
        >
            <div
                className="relative group rounded-[2rem] bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)] backdrop-blur-2xl transition-all duration-300"
            >
                {/* Glass Shine */}
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-40" />

                {/* A. HEADER - Modern & Hierarchical */}
                <div className="absolute top-0 left-0 right-0 p-5 z-20 flex flex-col gap-2 pointer-events-none text-left">
                    {/* Title Row */}
                    <div className="flex items-start justify-between pointer-events-auto">
                        <div className="flex flex-col gap-1 items-start">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    snippet.verified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary"
                                )} />
                                {snippet.verified && (
                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                        Verified
                                    </span>
                                )}
                                <h3 className="text-xl font-semibold text-white tracking-tight leading-none drop-shadow-md">
                                    {snippet.title}
                                </h3>
                            </div>
                            {snippet.description && (
                                <p className="text-sm text-white/70 font-normal leading-relaxed max-w-md drop-shadow-sm">
                                    {snippet.description}
                                </p>
                            )}
                        </div>

                        {/* Badges Row */}
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                            <span className="px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10 text-white/60">
                                {snippet.language}
                            </span>
                            {snippet.type && (
                                <span className={cn("px-2 py-1 rounded bg-black/40 backdrop-blur-md border border-white/10", typeColors[snippet.type] || "text-white/50")}>
                                    {snippet.type}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* B. CONTENT AREA (Aspect Ratio Square) */}
                <div
                    className="relative w-full aspect-square overflow-hidden rounded-[2rem] mt-24" /* pushed down for header + micro-line */
                    style={{ transform: "translateZ(0)" }}
                >
                    {/* Preview Type Label */}
                    <div className="absolute top-4 right-4 z-20 pointer-events-none">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/20 bg-black/40 backdrop-blur px-2 py-1 rounded-full border border-white/5">
                            {viewMode === 'preview' ? (isReact ? 'Live React' : 'Web Preview') : viewMode === 'output' ? 'Console Output' : 'Source Code'}
                        </span>
                    </div>
                    {viewMode === 'preview' ? (
                        isReact ? (
                            <div className={cn(
                                "absolute inset-0 overflow-auto bg-[#0c0c0e] flex p-4",
                                alignment === 'center' ? "items-center justify-center" : "items-start justify-start"
                            )}>
                                <ReactLivePreview code={snippet.code} />
                            </div>
                        ) : (
                            // HTML/Web Preview
                            <div className="absolute inset-0 bg-white">
                                <iframe
                                    srcDoc={getIframeSrc(snippet.code)}
                                    title="HTML Preview"
                                    className="w-full h-full border-0"
                                    sandbox="allow-scripts"
                                />
                            </div>
                        )
                    ) : viewMode === 'output' ? (
                        <div className="absolute inset-0 bg-[#09090b] p-6 font-mono text-xs overflow-auto">
                            {(() => {
                                const rawOutput = snippet.outputSnapshot || snippet.output;
                                if (!rawOutput) return (
                                    <div className="flex flex-col items-center justify-center h-full text-white/20 italic">
                                        <Terminal className="h-8 w-8 mb-3 opacity-30" />
                                        <span>No output — this snippet demonstrates logic only.</span>
                                    </div>
                                );

                                let displayOutput = rawOutput;
                                try {
                                    if (rawOutput.trim().startsWith('{')) {
                                        const parsed = JSON.parse(rawOutput);
                                        // Piston v2 format: { run: { stdout, stderr, code } }
                                        if (parsed.run && parsed.run.stdout !== undefined) {
                                            displayOutput = parsed.run.stdout + (parsed.run.stderr ? `\n[ERR]\n${parsed.run.stderr}` : "");
                                        } else if (parsed.stdout !== undefined) {
                                            // Fallback for older formats
                                            displayOutput = parsed.stdout + (parsed.stderr ? `\n[ERR]\n${parsed.stderr}` : "");
                                        }
                                    }
                                } catch (e) {
                                    // Not JSON, use as is
                                }

                                return (
                                    <div className="relative group/output">
                                        <div className="text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed max-h-[300px] overflow-hidden relative">
                                            {displayOutput.length > 300 ? displayOutput.slice(0, 300) + "..." : displayOutput || "Success (No output)"}
                                            {displayOutput.length > 300 && (
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent pointer-events-none" />
                                            )}
                                        </div>
                                        {displayOutput.length > 300 && (
                                            <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center bg-gradient-to-t from-[#09090b] to-transparent">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="opacity-100 shadow-xl bg-white text-black hover:bg-gray-200"
                                                    onClick={() => {
                                                        alert(displayOutput);
                                                    }}
                                                >
                                                    View Full Output
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#0c0c0e]">
                            <CodeBlock
                                code={snippet.code}
                                language={snippet.language}
                                className="h-full w-full bg-transparent p-6 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto"
                            />
                            {/* Gradient fade for text readability at edges */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0c0c0e]/90 via-transparent to-transparent via-10%" />
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c0e] to-transparent pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* C. EXECUTION CONTROLS - Floating Glass Island */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto">
                    <div className="bg-black/80 backdrop-blur-xl rounded-full p-1.5 border border-white/15 shadow-2xl flex items-center gap-2">

                        {/* View Toggles */}
                        <div className="bg-white/10 rounded-full p-1 flex items-center gap-1">
                            {hasPreview && (
                                <>
                                    <button
                                        onClick={() => setViewMode('preview')}
                                        className={cn(
                                            "px-3 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all",
                                            viewMode === 'preview' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white"
                                        )}
                                    >
                                        Preview
                                    </button>

                                    {/* Alignment Toggle (Only visible in Preview) */}
                                    {viewMode === 'preview' && (
                                        <div className="w-[1px] h-3 bg-white/10 mx-1" />
                                    )}
                                    {viewMode === 'preview' && (
                                        <button
                                            onClick={() => setAlignment(a => a === 'center' ? 'top' : 'center')}
                                            className="px-2 py-1.5 text-white/50 hover:text-white transition-colors"
                                            title="Toggle Alignment"
                                        >
                                            {alignment === 'center' ? (
                                                <LayoutTemplate className="h-3.5 w-3.5" />
                                            ) : (
                                                <AlignLeft className="h-3.5 w-3.5" />
                                            )}
                                        </button>
                                    )}
                                </>
                            )}
                            {(snippet.outputSnapshot || snippet.output) && (
                                <button
                                    onClick={() => setViewMode('output')}
                                    className={cn(
                                        "px-3 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all",
                                        viewMode === 'output' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white"
                                    )}
                                >
                                    Output
                                </button>
                            )}
                            <button
                                onClick={() => setViewMode('code')}
                                className={cn(
                                    "px-3 py-1.5 text-[10px] font-bold uppercase rounded-full transition-all",
                                    viewMode === 'code' ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white"
                                )}
                            >
                                Source
                            </button>
                        </div>

                        {/* Copy (only in source) */}
                        {viewMode === 'code' && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                onClick={() => {
                                    navigator.clipboard.writeText(snippet.code);
                                    setCopied(true);
                                    toast({ title: "Copied!", description: "Snippet code copied to clipboard." });
                                    setTimeout(() => setCopied(false), 2000);
                                }}
                            >
                                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        )}
                    </div>
                </div>

                {/* D. FOOTER (Engagement) */}
                <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
                    <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between pointer-events-auto">
                        <div className="flex items-center gap-3">
                            {snippet.author?.avatar && (
                                <img src={snippet.author.avatar} alt="Author" className="w-6 h-6 rounded-full border border-white/10" />
                            )}
                            <span className="text-xs font-semibold text-white/90">
                                {snippet.author?.name || 'User'}
                            </span>
                            <span className="text-muted-foreground text-[10px]">•</span>
                            <span className="text-[10px] text-muted-foreground font-medium">
                                {snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Just now'}
                            </span>
                        </div>

                        {/* Readable Stats */}
                        <div className="flex items-center gap-4 text-xs font-medium text-white/70">
                            <div className="flex items-center gap-1.5" title="Views">
                                <Eye className="h-3.5 w-3.5 text-white/40" />
                                <span>{snippet.viewsCount || 0} <span className="hidden sm:inline text-white/30">Views</span></span>
                            </div>
                            <button
                                className="flex items-center gap-1.5 hover:text-white transition-colors"
                                title="Fork this snippet"
                                disabled={forking}
                                onClick={async () => {
                                    if (!isAuthenticated) return toast({ variant: "destructive", title: "Login required" });
                                    setForking(true);
                                    try {
                                        const res = await snippetsAPI.fork(snippet.id);
                                        toast({ title: "Forked!", description: "Opening in editor..." });
                                        navigate(`/create?fork=${res.snippet.id}`);
                                    } catch (e: any) {
                                        toast({ variant: "destructive", title: "Fork failed", description: e.message });
                                    } finally {
                                        setForking(false);
                                    }
                                }}
                            >
                                <GitFork className="h-3.5 w-3.5 text-white/40" />
                                <span>{snippet.forkCount || 0} <span className="hidden sm:inline text-white/30">Forks</span></span>
                            </button>
                            <div className="flex items-center gap-1.5" title="Copies">
                                <Clipboard className="h-3.5 w-3.5 text-white/40" />
                                <span>{snippet.copyCount || 0} <span className="hidden sm:inline text-white/30">Copies</span></span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
