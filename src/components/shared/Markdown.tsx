import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface MarkdownProps {
    content: string;
    className?: string;
    compact?: boolean;
}

export function Markdown({ content, className, compact }: MarkdownProps) {
    return (
        <div className={cn(
            "prose prose-invert max-w-none",
            compact ? "prose-sm" : "prose-base",
            "prose-headings:font-headline prose-headings:font-bold prose-headings:tracking-tight",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
            "prose-code:bg-muted/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
            "prose-pre:bg-muted/30 prose-pre:border prose-pre:border-border",
            className
        )}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
            </ReactMarkdown>
        </div>
    );
}
