"use client";

import { LiveProvider, LiveError, LivePreview } from 'react-live';
import * as LucideReact from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';

interface ReactLivePreviewProps {
    code: string;
}

import * as FramerMotion from 'framer-motion';

const reactLiveScope = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useRef: React.useRef,
    useMemo: React.useMemo,
    useCallback: React.useCallback,
    ...LucideReact,
    ...FramerMotion,
    Button,
    cn,
};

export function ReactLivePreview({ code }: ReactLivePreviewProps) {
    const { theme } = useTheme();

    // Simplify code for live preview if it's a full component definition
    // react-live expects either an expression or a component body
    const processedCode = React.useMemo(() => {
        let cleanCode = code.trim();

        // 1. Remove imports (robust multiline handling)
        cleanCode = cleanCode.replace(/^import\s+[\s\S]+?from\s+['"].+['"];?/gm, '');
        cleanCode = cleanCode.replace(/^import\s+['"].+['"];?/gm, '');

        // 2. Handle "export default function ComponentName"
        const exportDefaultFuncMatch = cleanCode.match(/export\s+default\s+function\s+([A-Z][a-zA-Z0-9]*)/);

        if (exportDefaultFuncMatch) {
            const componentName = exportDefaultFuncMatch[1];
            cleanCode = cleanCode.replace(/export\s+default\s+function/, 'function');
            cleanCode += `\nrender(<${componentName} />);`;
        }
        // 3. Handle "export default ComponentName" (at end of file)
        else if (cleanCode.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/)) {
            const match = cleanCode.match(/export\s+default\s+([A-Z][a-zA-Z0-9]*)/);
            if (match) {
                const componentName = match[1];
                cleanCode = cleanCode.replace(/export\s+default\s+[A-Z][a-zA-Z0-9]*;?/g, '');
                cleanCode += `\nrender(<${componentName} />);`;
            }
        }
        // 4. Handle anonymous default export
        else if (cleanCode.includes('export default () =>') || cleanCode.includes('export default ()=')) {
            cleanCode = cleanCode.replace('export default', 'const App =');
            cleanCode += `\nrender(<App />);`;
        }

        // 5. Basic TypeScript Stripping (MVP)
        cleanCode = cleanCode.replace(/interface\s+\w+\s*{[\s\S]*?}/g, '');
        cleanCode = cleanCode.replace(/type\s+\w+\s*=\s*[\s\S]*?;/g, '');
        // Remove simple type annotations
        cleanCode = cleanCode.replace(/:\s*(string|number|boolean|any|void|React\.FC<.*>|JSX\.Element)(\[\])?/g, '');

        return cleanCode.trim();
    }, [code]);

    return (
        <LiveProvider
            code={processedCode}
            scope={reactLiveScope}
            noInline={processedCode.includes('render(') || (!processedCode.trim().startsWith('(') && !processedCode.trim().startsWith('<'))}
            theme={theme === 'dark' ? undefined : undefined} // react-live default is usually fine, or we can use custom themes
        >
            <div className="relative h-full w-full min-h-[200px] flex items-center justify-center p-4 bg-background/50 rounded-lg border border-border/50 shadow-inner">
                <LivePreview className="w-full h-full flex items-center justify-center" />
                <LiveError className="absolute bottom-0 left-0 right-0 bg-destructive/90 backdrop-blur-sm text-destructive-foreground p-3 text-xs font-mono rounded-b-lg border-t border-destructive/20 z-10" />
            </div>
        </LiveProvider>
    );
}
