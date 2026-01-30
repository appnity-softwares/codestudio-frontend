"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { snippetsAPI } from "@/lib/api";
import { AuraAvatar } from "@/components/AuraAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Trash2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

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
            await snippetsAPI.comment(snippetId, content);
        },
        onSuccess: () => {
            setContent("");
            queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
            toast({ title: "Comment posted", description: "Your message has been added successfully." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to post comment. Please try again.", variant: "destructive" });
        }
    });

    const { mutate: deleteComment } = useMutation({
        mutationFn: async (id: string) => {
            await snippetsAPI.deleteComment(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
            toast({ title: "Comment deleted", description: "The message has been removed." });
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to delete comment.", variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addComment();
    }

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Comment Input */}
            <div className="relative">
                {user ? (
                    <form
                        onSubmit={handleSubmit}
                        className="flex gap-4 p-4 border rounded-xl bg-muted/50"
                    >
                        <AuraAvatar
                            src={user.image}
                            username={user.username || "user"}
                            xp={user.xp || 0}
                            equippedAura={user.equippedAura}
                            size="md"
                        />
                        <div className="flex-1 space-y-3">
                            <Textarea
                                placeholder="Add a comment..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="bg-transparent border-0 min-h-[80px] resize-none focus-visible:ring-0 p-0 text-sm placeholder:text-muted-foreground/50 shadow-none"
                            />
                            <div className="flex justify-end pt-2 border-t border-border">
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={!content.trim() || isAdding}
                                    className="px-4"
                                >
                                    {isAdding ? 'Posting...' : 'Post Comment'}
                                </Button>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="p-8 rounded-xl border border-dashed text-center">
                        <p className="text-sm text-muted-foreground">Please log in to leave a comment.</p>
                    </div>
                )}
            </div>

            {/* Comments List */}
            <div className="flex-1 flex flex-col min-h-0">
                {isLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4 animate-pulse">
                                <div className="h-10 w-10 rounded-full bg-muted" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 w-32 bg-muted rounded" />
                                    <div className="h-10 w-full bg-muted rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length > 0 ? (
                    <div className="space-y-6 pb-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Comments ({comments.length})</h3>

                        <AnimatePresence mode="popLayout">
                            {comments.map((comment: any) => (
                                <motion.div
                                    key={comment.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex gap-4"
                                >
                                    <AuraAvatar
                                        src={comment.User?.image}
                                        username={comment.User?.username || "user"}
                                        xp={comment.User?.xp || 0}
                                        equippedAura={comment.User?.equippedAura}
                                        size="md"
                                    />

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 truncate">
                                                <span className="font-bold text-sm">
                                                    {comment.User?.username || 'Unknown User'}
                                                </span>
                                                <span className="text-[11px] text-muted-foreground">
                                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {user?.id === comment.userId && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                    onClick={() => deleteComment(comment.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap mt-1">
                                            {comment.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                        <MessageSquare className="h-10 w-10 mb-3 opacity-20" />
                        <p className="text-sm">No comments yet. Be the first to start the conversation!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
