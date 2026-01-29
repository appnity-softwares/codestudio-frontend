import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface CodeBlockProps {
    content: string;
    language?: string;
    className?: string;
}

/**
 * CodeBlock - Safe render for code messages
 * 
 * Security rules:
 * - Never use dangerouslySetInnerHTML
 * - Render in <pre><code> only
 * - Never execute code
 * - Syntax highlighting is cosmetic only
 */
export const CodeBlock = memo(function CodeBlock({
    content,
    language = 'plaintext',
    className
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={cn(
            "relative group rounded-lg overflow-hidden",
            "bg-zinc-900 border border-zinc-800",
            className
        )}>
            {/* Header with language and copy button */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/50 border-b border-zinc-700/50">
                <span className="text-[10px] font-mono uppercase text-zinc-400">
                    {language}
                </span>
                <button
                    onClick={handleCopy}
                    className="p-1 rounded hover:bg-zinc-700 transition-colors"
                    aria-label="Copy code"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                        <Copy className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-200" />
                    )}
                </button>
            </div>

            {/* Code content - SAFE RENDER */}
            <pre className="p-3 overflow-x-auto text-sm">
                <code className="font-mono text-zinc-200 whitespace-pre-wrap break-words">
                    {/* 
            Security: We render content as plain text.
            React automatically escapes text content.
            NEVER use dangerouslySetInnerHTML here.
          */}
                    {content}
                </code>
            </pre>
        </div>
    );
});
