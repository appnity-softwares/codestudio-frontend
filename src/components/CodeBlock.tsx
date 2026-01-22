"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from "@/context/ThemeContext";
import { Plus, MessageSquare } from "lucide-react";

interface CodeBlockProps {
    code: string;
    language: string;
    className?: string; // Added optional className
    annotations?: { line: number; content: string }[];
    onAddAnnotation?: (line: number) => void;
    isAuthor?: boolean;
}

export function CodeBlock({ code, language, className, annotations, onAddAnnotation, isAuthor }: CodeBlockProps) {
    const [mounted, setMounted] = useState(false);
    const { theme } = useTheme();

    useEffect(() => setMounted(true), []);

    const prismTheme = theme === 'dark' ? themes.vsDark : themes.vsLight;

    if (!mounted) {
        return (
            <div className={`relative font-code text-sm group ${className || ''}`}>
                <Skeleton className="h-40 w-full rounded-md" />
            </div>
        );
    }

    return (
        <Highlight
            theme={prismTheme}
            code={code.trim()}
            language={language.toLowerCase()}
        >
            {({ className: prismClassName, style, tokens, getLineProps, getTokenProps }) => (
                <div className={`relative font-code text-sm group ${className || ''}`}>
                    <pre
                        className={prismClassName}
                        style={{
                            ...style,
                            backgroundColor: 'transparent',
                            padding: '1.25rem',
                            margin: 0,
                            overflowX: 'auto',
                            borderRadius: '0.5rem',
                        }}
                    >
                        {tokens.map((line, i) => {
                            const { key: lineKey, ...lineProps } = getLineProps({ line, key: i });
                            const annotation = annotations?.find(a => a.line === i + 1);

                            return (
                                <div key={i} className="flex flex-col">
                                    <div {...lineProps} className="table-row group/line hover:bg-primary/5 transition-colors">
                                        <div className="table-cell select-none pr-4 text-muted-foreground/30 text-right text-xs min-w-[3rem] relative">
                                            {isAuthor && (
                                                <button
                                                    onClick={() => onAddAnnotation?.(i + 1)}
                                                    className="absolute -left-1 top-0 opacity-0 group-hover/line:opacity-100 text-primary hover:scale-125 transition-all"
                                                >
                                                    <Plus size={12} strokeWidth={3} />
                                                </button>
                                            )}
                                            {i + 1}
                                        </div>
                                        <div className="table-cell">
                                            {line.map((token, key) => {
                                                const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key });
                                                return <span key={key} {...tokenProps} />;
                                            })}
                                        </div>
                                    </div>
                                    {annotation && (
                                        <div className="table-row">
                                            <div className="table-cell" />
                                            <div className="table-cell py-2 px-2">
                                                <div className="bg-primary/10 border-l-2 border-primary rounded-r p-3 relative group/ann">
                                                    <p className="text-[11px] leading-relaxed text-foreground/90 font-sans italic">
                                                        <span className="font-bold text-primary mr-2">ANNOTATION</span>
                                                        {annotation.content}
                                                    </p>
                                                    <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/ann:opacity-100 transition-opacity">
                                                        <MessageSquare size={10} className="text-primary/50" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </pre>
                </div>
            )}
        </Highlight>
    );
}
