import { useState } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { CodeBlock } from "./CodeBlock";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
    GitBranch,
    Star,
    MessageCircle,
    MoreHorizontal,
    ChevronDown,
    Copy,
    Check
} from "lucide-react";
import { SnippetDetailModal } from "./SnippetDetailModal";

interface CompactCodeCardProps {
    snippet: any;
}

export function CompactCodeCard({ snippet }: CompactCodeCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(snippet.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className="group relative bg-surface border border-border hover:border-primary/50 transition-colors rounded-md overflow-hidden"
            onClick={() => setShowDetail(true)}
        >
            {/* Header: Breadcrumbs & Meta */}
            <div className="flex items-center justify-between px-4 py-2 bg-surface border-b border-border/50">
                <div className="flex items-center gap-3">
                    <Link
                        to={`/profile/${snippet.author?.username}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2 hover:bg-white/5 p-1 rounded-sm transition-colors"
                    >
                        <Avatar className="h-5 w-5 rounded-sm border border-border">
                            <AvatarImage src={snippet.author?.image} />
                            <AvatarFallback className="text-[10px] rounded-sm">{snippet.author?.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-mono text-primary hover:underline decoration-border-active">
                            {snippet.author?.username}
                        </span>
                    </Link>
                    <span className="text-muted-foreground/40 text-sm">/</span>
                    <span className="text-sm font-mono text-muted-foreground group-hover:text-primary transition-colors">
                        {snippet.title}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest hidden sm:inline-block">
                        {snippet.language}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-primary">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Code Body */}
            <div className="relative bg-canvas p-0">
                <div
                    className={`transition-all duration-300 ${expanded ? 'max-h-none' : 'max-h-[200px] overflow-hidden'}`}
                >
                    <CodeBlock
                        code={snippet.code}
                        language={snippet.language || 'text'}
                        className="text-xs font-mono leading-relaxed !bg-transparent !p-4"
                    />
                </div>

                {/* Gradient Fade Overlay (only if not expanded) */}
                {!expanded && (
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-canvas to-transparent flex items-end justify-center pb-4 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div
                            onClick={(e) => { e.stopPropagation(); setExpanded(true); }}
                            className="flex items-center gap-1 text-xs font-mono text-muted-foreground bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border cursor-pointer hover:bg-surface-hover hover:text-primary transition-colors"
                        >
                            <ChevronDown className="w-3 h-3" />
                            <span>Show more</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Actions & Stats */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-surface/50">
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-yellow-400 transition-colors">
                        <Star className="w-3.5 h-3.5" />
                        <span>{snippet.likeCount || 0}</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-blue-400 transition-colors">
                        <GitBranch className="w-3.5 h-3.5" />
                        <span>Fork</span>
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-green-400 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>12</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {formatDistanceToNow(new Date(snippet.createdAt))} AGO
                    </span>
                    <div className="h-3 w-[1px] bg-border" />
                    <button
                        onClick={handleCopy}
                        className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider"
                    >
                        {copied ? (
                            <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                            <Copy className="w-3 h-3" />
                        )}
                        {copied ? "COPIED" : "COPY"}
                    </button>
                </div>
            </div>

            <SnippetDetailModal
                snippet={snippet}
                open={showDetail}
                onOpenChange={setShowDetail}
            />
        </div>
    );
}
