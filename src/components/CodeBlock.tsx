"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from "@/context/ThemeContext";

interface CodeBlockProps {
    code: string;
    language: string;
    className?: string; // Added optional className
}

export function CodeBlock({ code, language, className }: CodeBlockProps) {
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

                </div>
            )}
        </Highlight>
    );
}
