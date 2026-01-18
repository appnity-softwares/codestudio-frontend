"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { useAuth } from "@/context/AuthContext";
import { Terminal, Copy, LayoutTemplate, AlignLeft } from "lucide-react";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface SnippetCardProps {
    snippet: any;
}

export function SnippetCard({ snippet }: SnippetCardProps) {
    const { } = useAuth();
    // const isAuthor = user?.id === snippet.authorId; // Not needed for MVP output
    // Default view mode: React/HTML -> Preview, Others -> Code (or Output?)
    // Constraint: "Preview NOT allowed for Python/JS/Go/C++" -> "Show Output tab only"
    // So for non-preview langs, defaulting to 'output' or 'code' is better.
    // Spec says: "Others: Hide Preview tab completely. Show Output tab only." which implies Code/Output toggle.

    const isReact = snippet.language?.toLowerCase() === 'react' ||
        snippet.language?.toLowerCase() === 'typescript' ||
        (snippet.language?.toLowerCase() === 'javascript' && (snippet.code.includes('import React') || snippet.code.includes('render(') || snippet.code.includes('export default')));

    const isHTML = snippet.language?.toLowerCase() === 'html' ||
        (snippet.language?.toLowerCase() === 'javascript' && !isReact); // Plain JS goes to HTML iframe unless it's React
    const hasPreview = isReact || isHTML || snippet.previewType?.startsWith('WEB_PREVIEW');

    const [viewMode, setViewMode] = useState<'preview' | 'code' | 'output'>('code');

    // Initial View Mode Logic
    useEffect(() => {
        if (hasPreview) {
            setViewMode('preview');
        } else {
            // "Default view should be OUTPUT first, not SOURCE."
            setViewMode('output');
        }
    }, [hasPreview]);

    const [alignment, setAlignment] = useState<'center' | 'top'>(() => {
        if (snippet.previewType === 'WEB_PREVIEW_TOP') return 'top';
        return 'center';
    });

    // Inject centering styles for HTML iframe if needed
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

                {/* A. HEADER - Floating Glass Panel (Denser) */}
                <div className="absolute top-0 left-0 right-0 p-4 z-20 flex flex-col gap-2 pointer-events-none">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 pointer-events-auto bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                                <div className={cn("w-1.5 h-1.5 rounded-full", snippet.verified ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-primary")} />
                                {snippet.language}
                            </span>
                            <div className="w-[1px] h-3 bg-white/20" />
                            <span className="text-xs font-bold text-white truncate max-w-[200px]">
                                {snippet.title}
                            </span>
                        </div>

                        {/* System Signals (Mini) */}
                        <div className="flex items-center gap-2 text-[9px] font-mono text-white/40 bg-black/40 px-2 py-1 rounded-md mb-auto border border-white/5">
                            <span>{snippet.code.split('\n').length} LINES</span>
                            <span className="text-white/20">•</span>
                            <span>{snippet.runtime ? `${snippet.runtime}ms` : '0.04ms'}</span>
                            <span className="text-white/20">•</span>
                            <span className={snippet.lastExecutionStatus === 'SUCCESS' ? "text-emerald-500/80" : "text-red-500/80"}>
                                {snippet.lastExecutionStatus === 'SUCCESS' ? 'EXIT 0' : 'ERR'}
                            </span>
                        </div>
                    </div>

                    {/* Description - One Line */}
                    {snippet.description && (
                        <div className="bg-black/20 backdrop-blur-sm self-start px-2 py-0.5 rounded text-[10px] text-white/70 truncate max-w-full border border-white/5 mx-1">
                            {snippet.description}
                        </div>
                    )}
                </div>

                {/* B. CONTENT AREA (Aspect Ratio Strict) */}
                <div
                    className="relative w-full aspect-[4/5] overflow-hidden rounded-[2rem]"
                    style={{ transform: "translateZ(0)" }}
                >
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
                        <div className="absolute inset-0 bg-[#0c0c0e] p-6 pt-24 font-mono text-xs overflow-auto">
                            <div className="absolute top-6 left-6 flex items-center gap-2 text-white/30 uppercase tracking-widest text-[10px] font-black pointer-events-none">
                                <Terminal className="h-3 w-3" /> Stored Output
                            </div>
                            {(() => {
                                const rawOutput = snippet.outputSnapshot || snippet.output;
                                if (!rawOutput) return (
                                    <div className="flex flex-col items-center justify-center h-full text-white/20 italic">
                                        <Terminal className="h-8 w-8 mb-3 opacity-30" />
                                        <span>No output stored for this snippet.</span>
                                    </div>
                                );

                                let displayOutput = rawOutput;
                                try {
                                    if (rawOutput.trim().startsWith('{')) {
                                        const parsed = JSON.parse(rawOutput);
                                        if (parsed.stdout !== undefined) {
                                            displayOutput = parsed.stdout + (parsed.stderr ? `\n[STDERR]\n${parsed.stderr}` : "");
                                        }
                                    }
                                } catch (e) {
                                    // Not JSON, use as is
                                }

                                return <div className="text-green-400 whitespace-pre-wrap">{displayOutput}</div>;
                            })()}
                        </div>
                    ) : (
                        <div className="absolute inset-0 bg-[#0c0c0e]">
                            <CodeBlock
                                code={snippet.code}
                                language={snippet.language}
                                className="h-full w-full bg-transparent p-6 pt-24 text-xs font-mono leading-relaxed custom-scrollbar overflow-auto"
                            />
                            {/* Gradient fade for text readability at edges */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-[#0c0c0e]/90 via-transparent to-transparent via-15%" />
                            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0c0e] to-transparent pointer-events-none" />
                        </div>
                    )}
                </div>

                {/* C. EXECUTION CONTROLS - Floating Glass Island (MVP Reduced) */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 w-[90%] sm:w-auto">
                    <div className="bg-black/80 backdrop-blur-xl rounded-full p-1.5 border border-white/15 shadow-2xl flex items-center gap-2 justify-between sm:justify-start">

                        {/* Removed Run Button */}

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
                            {!hasPreview && (
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
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10 rounded-full" onClick={() => navigator.clipboard.writeText(snippet.code)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* D. FOOTER (Metadata) - Glass Overlay */}
                <div className="absolute bottom-5 left-5 right-5 z-20 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">
                                BY {snippet.author?.name || 'User'}
                            </span>
                        </div>
                        <span className="text-[10px] text-white/30 font-mono">
                            {snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'Just now'}
                        </span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
