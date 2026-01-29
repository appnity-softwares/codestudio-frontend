import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Clock, AlertCircle, RotateCcw, Reply, ShieldAlert } from 'lucide-react';
import { format } from 'date-fns';
import { CodeBlock } from './CodeBlock';
import { ReactionPicker, ReactionDisplay } from './ReactionPicker';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import type { ChatMessage, MessageReaction } from '@/types/chat';

interface MessageBubbleProps {
    message: ChatMessage;
    isMine: boolean;
    currentUserId: string;
    reactions?: MessageReaction[];
    onRetry?: (message: ChatMessage) => void;
    onReply?: (message: ChatMessage) => void;
    className?: string;
}

/**
 * MessageBubble - Production-grade message bubble
 * 
 * Features:
 * - Status indicators (sending, sent, delivered, read, failed)
 * - Retry button for failed messages
 * - Safe code rendering
 * - Memoized for performance
 */
export const MessageBubble = memo(function MessageBubble({
    message,
    isMine,
    currentUserId,
    reactions = [],
    onRetry,
    onReply,
    className
}: MessageBubbleProps) {
    const content = message.content || message.Content || '';
    const type = message.type || 'text';
    const status = message.status || 'sent';
    const createdAt = message.createdAt || message.CreatedAt;
    const replyTo = message.replyTo;

    // Parse metadata for code language
    let codeLanguage = 'plaintext';
    if (type === 'code' && message.metadata) {
        try {
            const meta = JSON.parse(message.metadata);
            codeLanguage = meta.language || 'plaintext';
        } catch {
            // Ignore parse errors
        }
    }

    const handleRetryClick = () => {
        if (onRetry && status === 'failed') {
            onRetry(message);
        }
    };

    const handleReplyClick = () => {
        if (onReply) {
            onReply(message);
        }
    };

    // Helper to linkify text
    const renderContent = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);
        return parts.map((part, i) => {
            if (part.match(urlRegex)) {
                return (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline break-all"
                        onClick={(e) => e.stopPropagation()} // Prevent bubble click
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div
            className={cn(
                "flex w-full mb-2 group relative", // 'group' moved here for full-width hover
                isMine ? "justify-end" : "justify-start",
                className
            )}
        >
            <div className="relative max-w-[75%]">
                {/* Reaction Picker (shows on group-hover) */}
                <div className={cn(
                    "absolute top-0 flex gap-0.5 z-10",
                    isMine ? "-left-16" : "-right-16"
                )}>
                    {message.id && (
                        <>
                            <ReactionPicker
                                messageId={message.id}
                                existingReactions={reactions}
                                currentUserId={currentUserId}
                            />
                            {onReply && (
                                <button
                                    onClick={handleReplyClick}
                                    className="h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted rounded bg-background shadow-sm border border-border/50"
                                    title="Reply"
                                >
                                    <Reply className="h-3.5 w-3.5 text-muted-foreground" />
                                </button>
                            )}
                        </>
                    )}
                </div>

                <div
                    className={cn(
                        "rounded-2xl px-4 py-2 relative",
                        isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md",
                        type === 'admin' && "bg-gradient-to-br from-red-600 to-red-900 text-white border border-red-500/50 shadow-[0_0_20px_rgba(220,38,38,0.2)]",
                        status === 'failed' && "opacity-70 border border-destructive/50"
                    )}
                    onClick={status === 'failed' ? handleRetryClick : undefined}
                    role={status === 'failed' ? 'button' : undefined}
                    tabIndex={status === 'failed' ? 0 : undefined}
                >
                    {/* Admin Badge */}
                    {type === 'admin' && (
                        <div className="flex items-center gap-1.5 mb-1 opacity-90">
                            <ShieldAlert className="h-3 w-3" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Official Command</span>
                        </div>
                    )}

                    {/* Reply Quote */}
                    {replyTo && (
                        <div className={cn(
                            "mb-2 px-2 py-1 rounded border-l-2",
                            isMine
                                ? "bg-primary-foreground/10 border-primary-foreground/50"
                                : "bg-muted-foreground/10 border-muted-foreground/50"
                        )}>
                            <p className="text-[10px] font-medium opacity-70 mb-0.5">
                                Replying to {replyTo.sender?.username || 'user'}
                            </p>
                            <p className="text-xs opacity-80 truncate max-w-[200px]">
                                {replyTo.content?.substring(0, 50) || '...'}
                                {(replyTo.content?.length || 0) > 50 && '...'}
                            </p>
                        </div>
                    )}

                    {/* Content */}
                    {type === 'code' ? (
                        <CodeBlock content={content} language={codeLanguage} />
                    ) : type === 'image' ? (
                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="rounded-lg overflow-hidden bg-background/10 cursor-zoom-in hover:opacity-95 transition-opacity">
                                    <img
                                        src={content}
                                        alt="Shared image"
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        className="max-w-full max-h-[300px] object-contain"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            const parent = e.currentTarget.parentElement;
                                            if (parent) {
                                                const text = document.createElement('p');
                                                text.className = "text-sm p-2 text-destructive/80 italic";
                                                text.textContent = "Failed to load image";
                                                parent.appendChild(text);
                                            }
                                        }}
                                    />
                                </div>
                            </DialogTrigger>
                            <DialogContent className="max-w-screen-lg w-fit h-fit p-0 bg-transparent border-none shadow-none focus:outline-none">
                                <DialogTitle className="hidden">Image Preview</DialogTitle>
                                <img
                                    src={content}
                                    alt="Full screen preview"
                                    className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <p className="text-sm whitespace-pre-wrap break-words">
                            {renderContent(content)}
                        </p>
                    )}

                    {/* Footer: Time + Status */}
                    <div className={cn(
                        "flex items-center gap-1.5 mt-1",
                        isMine ? "justify-end" : "justify-start"
                    )}>
                        {/* Timestamp */}
                        {createdAt && !String(createdAt).startsWith('0001') && !isNaN(new Date(createdAt).getTime()) && (
                            <span className={cn(
                                "text-[10px] opacity-60",
                                isMine ? "text-primary-foreground" : "text-muted-foreground"
                            )}>
                                {format(new Date(createdAt), 'h:mm a')}
                            </span>
                        )}

                        {/* Status Indicator (only for my messages) */}
                        {isMine && (
                            <MessageStatus status={status} />
                        )}
                    </div>

                    {/* Retry Button for Failed Messages */}
                    {status === 'failed' && isMine && (
                        <div className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={handleRetryClick}
                                className="p-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive"
                                aria-label="Retry sending message"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Reactions Display (below bubble) */}
                {reactions.length > 0 && message.id && (
                    <ReactionDisplay
                        reactions={reactions}
                        messageId={message.id}
                        currentUserId={currentUserId}
                        className={isMine ? "justify-end" : "justify-start"}
                    />
                )}
            </div>
        </div>
    );
});

/**
 * MessageStatus - Visual status indicator
 */
function MessageStatus({ status }: { status: string }) {
    switch (status) {
        case 'sending':
            return <Clock className="h-3 w-3 opacity-60 animate-pulse" />;
        case 'sent':
            return <Check className="h-3 w-3 opacity-60" />;
        case 'delivered':
            return <CheckCheck className="h-3 w-3 opacity-60" />;
        case 'read':
            return <CheckCheck className="h-3 w-3 text-blue-400" />;
        case 'failed':
            return <AlertCircle className="h-3 w-3 text-destructive" />;
        default:
            return null;
    }
}
