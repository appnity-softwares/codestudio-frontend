import { memo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Smile, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ALLOWED_REACTION_EMOJIS, type MessageReaction } from '@/types/chat';
import { messagesAPI } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface ReactionPickerProps {
    messageId: string;
    existingReactions?: MessageReaction[];
    currentUserId: string;
    className?: string;
}

/**
 * ReactionPicker - Emoji reaction picker for chat messages
 * 
 * Features:
 * - Curated emoji list matching backend allowlist
 * - Toggle behavior (click same emoji to remove)
 * - Optimistic UI updates
 * - Real-time sync via socket
 */
export const ReactionPicker = memo(function ReactionPicker({
    messageId,
    existingReactions = [],
    currentUserId,
    className,
}: ReactionPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    // Check if current user has reacted with a specific emoji
    const hasReacted = (emoji: string) => {
        return existingReactions.some(r => r.userId === currentUserId && r.emoji === emoji);
    };

    // Toggle reaction mutation
    const toggleReaction = useMutation({
        mutationFn: (emoji: string) => messagesAPI.toggleReaction(messageId, emoji),
        onSuccess: (data, emoji) => {
            // Invalidate messages to refresh reaction data
            queryClient.invalidateQueries({ queryKey: ['messages'] });

            if (data.removed) {
                toast({ description: `Removed ${emoji}` });
            }
            setIsOpen(false);
        },
        onError: () => {
            toast({ description: 'Failed to add reaction', variant: 'destructive' });
        }
    });

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity",
                        className
                    )}
                >
                    <Smile className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-2"
                side="top"
                align="start"
                sideOffset={4}
            >
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {ALLOWED_REACTION_EMOJIS.map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => toggleReaction.mutate(emoji)}
                            disabled={toggleReaction.isPending}
                            className={cn(
                                "text-lg p-1.5 rounded-md hover:bg-muted transition-colors",
                                hasReacted(emoji) && "bg-primary/20 ring-1 ring-primary/50",
                                toggleReaction.isPending && "opacity-50 cursor-not-allowed"
                            )}
                            title={hasReacted(emoji) ? "Remove reaction" : "Add reaction"}
                        >
                            {toggleReaction.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                emoji
                            )}
                        </button>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    );
});

interface ReactionDisplayProps {
    reactions: MessageReaction[];
    messageId: string;
    currentUserId: string;
    className?: string;
}

/**
 * ReactionDisplay - Shows grouped reactions under a message
 */
export const ReactionDisplay = memo(function ReactionDisplay({
    reactions,
    messageId,
    currentUserId,
    className,
}: ReactionDisplayProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Group reactions by emoji
    const grouped = reactions.reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = [];
        acc[r.emoji].push(r);
        return acc;
    }, {} as Record<string, MessageReaction[]>);

    const toggleReaction = useMutation({
        mutationFn: (emoji: string) => messagesAPI.toggleReaction(messageId, emoji),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
        onError: () => {
            toast({ description: 'Failed to toggle reaction', variant: 'destructive' });
        }
    });

    if (Object.keys(grouped).length === 0) return null;

    return (
        <div className={cn("flex flex-wrap gap-1 mt-1", className)}>
            {Object.entries(grouped).map(([emoji, users]) => {
                const hasMyReaction = users.some(u => u.userId === currentUserId);
                return (
                    <button
                        key={emoji}
                        onClick={() => toggleReaction.mutate(emoji)}
                        disabled={toggleReaction.isPending}
                        className={cn(
                            "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs",
                            "bg-muted/50 hover:bg-muted transition-colors",
                            hasMyReaction && "bg-primary/20 ring-1 ring-primary/30"
                        )}
                        title={users.map(u => u.user?.username || u.userId).join(', ')}
                    >
                        <span>{emoji}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">
                            {users.length}
                        </span>
                    </button>
                );
            })}
        </div>
    );
});
