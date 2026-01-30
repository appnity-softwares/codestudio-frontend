"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { snippetsAPI } from "@/lib/api";
import { AuraAvatar } from "@/components/AuraAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Trash2, MessageSquare, SendHorizontal, CornerDownRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Markdown } from "@/components/shared/Markdown";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface CommentSectionProps {
    snippetId: string;
}

export function CommentSection({ snippetId }: CommentSectionProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [content, setContent] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['comments', snippetId],
        queryFn: () => snippetsAPI.getComments(snippetId),
    });

    const comments = data?.comments || [];

    const { mutate: addComment, isPending: isAdding } = useMutation({
        mutationFn: async () => {
            if (!content.trim()) return;
            return snippetsAPI.comment(snippetId, content);
        },
        onMutate: async () => {
            const newContent = content;
            setContent(""); // Clear input immediately
            await queryClient.cancelQueries({ queryKey: ['comments', snippetId] });
            const previousData = queryClient.getQueryData(['comments', snippetId]);

            // Optimistic Update
            if (user) {
                const optimisticComment = {
                    id: `temp-${Date.now()}`,
                    content: newContent,
                    createdAt: new Date().toISOString(),
                    userId: user.id || "current-user",
                    user: {
                        username: user.username,
                        image: user.image,
                        xp: user.xp,
                        equippedAura: user.equippedAura,
                    }
                };
                queryClient.setQueryData(['comments', snippetId], (old: any) => {
                    const oldComments = Array.isArray(old?.comments) ? old.comments : [];
                    return {
                        ...old,
                        comments: [optimisticComment, ...oldComments]
                    };
                });
            }
            return { previousData };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(['comments', snippetId], context?.previousData);
            toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
        }
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async (id: string) => {
            await snippetsAPI.deleteComment(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
            toast({ title: "Deleted", description: "Comment removed." });
        },
        onError: () => {
            toast({ title: "Error", description: "Could not delete comment.", variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;
        addComment();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (content.trim()) addComment();
        }
    };

    return (
        <div className="flex flex-col h-full bg-card/20 backdrop-blur-md rounded-xl border border-border/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-500">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10">
                        <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold tracking-wide text-foreground/90">Discussion</h3>
                    {comments.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold border border-border/50">
                            {comments.length}
                        </span>
                    )}
                </div>
            </div>

            {/* List Area */}
            <ScrollArea className="flex-1 w-full bg-gradient-to-b from-transparent to-muted/5">
                <div className="p-5 space-y-6 min-h-[300px]">
                    {isLoading ? (
                        <div className="space-y-6 py-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4 animate-pulse">
                                    <div className="h-9 w-9 rounded-full bg-muted/60" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-24 bg-muted/60 rounded" />
                                        <div className="h-12 w-full bg-muted/40 rounded-xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : comments.length > 0 ? (
                        <AnimatePresence mode="popLayout" initial={false}>
                            {comments.map((comment: any) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                                    className="group relative flex gap-4"
                                >
                                    <div className="shrink-0 z-10 pt-1">
                                        <AuraAvatar
                                            src={comment.user?.image}
                                            username={comment.user?.username || "user"}
                                            xp={comment.user?.xp || 0}
                                            equippedAura={comment.user?.equippedAura}
                                            size="sm"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-semibold text-sm text-foreground/90 hover:text-primary transition-colors cursor-pointer">
                                                    {comment.user?.username || 'Unknown User'}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/60">
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {String(user?.id) === String(comment.userId) && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteComment(comment.id)}
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>

                                        <div className="relative group/bubble">
                                            <div className="bg-muted/30 border border-transparent group-hover/bubble:border-border/40 group-hover/bubble:bg-muted/40 transition-all duration-300 rounded-xl rounded-tl-sm p-3.5 text-sm text-foreground/80 leading-relaxed dark:shadow-inner dark:shadow-black/5">
                                                <Markdown content={comment.content} compact />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-12 text-center opacity-70">
                            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4 ring-8 ring-muted/10">
                                <MessageSquare className="w-6 h-6 text-muted-foreground/60" />
                            </div>
                            <p className="text-sm font-medium text-foreground/80">No comments yet</p>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                Be the first to share your thoughts on this snippet.
                            </p>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Input Area (Bottom) */}
            <div className="p-4 bg-background/40 border-t border-border/40 backdrop-blur-sm z-20">
                {user ? (
                    <motion.form
                        layout
                        onSubmit={handleSubmit}
                        className={cn(
                            "relative flex gap-3 transition-all duration-300",
                            "p-1 rounded-xl"
                        )}
                    >
                        <AuraAvatar
                            src={user.image}
                            username={user.username || "user"}
                            xp={user.xp || 0}
                            equippedAura={user.equippedAura}
                            size="sm"
                            className="mt-1 shrink-0"
                        />
                        <div className="flex-1 min-w-0 bg-muted/40 hover:bg-muted/60 focus-within:bg-background border border-transparent focus-within:border-primary/20 transition-all duration-300 rounded-xl p-1 shadow-sm focus-within:shadow-md">
                            <Textarea
                                placeholder="Write a comment... (Supports GFM Markdown)"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="min-h-[44px] max-h-[120px] w-full bg-transparent border-0 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 resize-none focus-visible:ring-0 shadow-none scrollbar-hide"
                            />
                            <div className="flex items-center justify-between px-2 pb-1 pt-1 border-t border-border/10">
                                <span className="text-[10px] text-muted-foreground/50 font-medium ml-1 flex items-center gap-1">
                                    <CornerDownRight className="w-3 h-3" /> markdown supported
                                </span>
                                <Button
                                    type="submit"
                                    size="icon"
                                    disabled={!content.trim() || isAdding}
                                    className={cn(
                                        "h-7 w-7 rounded-lg transition-all duration-300",
                                        content.trim()
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/25"
                                            : "bg-muted text-muted-foreground hover:bg-muted/80 opacity-50"
                                    )}
                                >
                                    {isAdding ? (
                                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <SendHorizontal className="w-3.5 h-3.5 ml-0.5" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.form>
                ) : (
                    <div className="p-3 rounded-xl border border-dashed border-border/60 bg-muted/10 text-center">
                        <p className="text-xs text-muted-foreground">Log in to comment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
