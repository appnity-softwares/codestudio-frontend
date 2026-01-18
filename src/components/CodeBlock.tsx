"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Copy, Check } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from "@/context/ThemeContext";

interface CodeBlockProps {
    code: string;
    language: string;
    className?: string; // Added optional className
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
    const [mounted, setMounted] = useState(false);
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();
    const { theme } = useTheme();

    useEffect(() => setMounted(true), []);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        toast({ title: "Code Copied!", description: "The code has been copied to your clipboard." });
        setTimeout(() => setCopied(false), 2000);
    };

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
                            return (
                                <div key={i} {...lineProps} className="table-row">
                                    <span className="table-cell select-none pr-4 text-muted-foreground/50 text-right text-xs">
                                        {i + 1}
                                    </span>
                                    <span className="table-cell">
                                        {line.map((token, key) => {
                                            const { key: tokenKey, ...tokenProps } = getTokenProps({ token, key });
                                            return <span key={key} {...tokenProps} />;
                                        })}
                                    </span>
                                </div>
                            );
                        })}
                    </pre>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/50 hover:bg-background/80 backdrop-blur-sm"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        <span className="sr-only">Copy code</span>
                    </Button>
                </div>
            )}
        </Highlight>
    );
}
