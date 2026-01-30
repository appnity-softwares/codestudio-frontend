import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { snippetsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Heart, Sparkles, Send, Trash2, CornerDownRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        username: string;
        image?: string;
        name?: string;
    };
    parentId?: string | null;
    likesCount: number;
    repliesCount: number;
    isLiked: boolean;
    userId?: string;
}

export function CommentsSection({ snippetId, comments: initialComments = [] }: { snippetId: string, comments?: any[] }) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const fetchComments = async () => {
            // If we have initial comments, use them, but maybe re-fetch for freshness?
            // Since this is often in a modal, initially trusting props is fast.
            // But let's fetch in background if needed.
            if (initialComments.length > 0 && !snippetId) {
                return;
            }
            if (!snippetId) return;

            setIsLoading(true);
            try {
                const data = await snippetsAPI.getComments(snippetId);
                setComments(data.comments.map((c: any) => ({
                    id: c.id,
                    content: c.content,
                    createdAt: c.createdAt,
                    author: {
                        username: c.user?.username || "Unknown",
                        image: c.user?.image,
                        name: c.user?.name
                    },
                    userId: c.userId,
                    parentId: c.parentId,
                    likesCount: c.likesCount || 0,
                    repliesCount: c.repliesCount || 0,
                    isLiked: c.isLiked || false
                })));
            } catch (error) {
                console.error("Failed to fetch comments", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [snippetId]);

    const handleLike = async (commentId: string) => {
        setComments(prev => prev.map(c => {
            if (c.id === commentId) {
                return {
                    ...c,
                    likesCount: c.isLiked ? c.likesCount - 1 : c.likesCount + 1,
                    isLiked: !c.isLiked
                };
            }
            return c;
        }));

        try {
            await snippetsAPI.likeComment(commentId);
        } catch (error) {
            console.error("Failed to like comment", error);
            setComments(prev => prev.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        likesCount: c.isLiked ? c.likesCount + 1 : c.likesCount - 1,
                        isLiked: !c.isLiked
                    }
                }
                return c;
            }));
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return;

        // Optimistic delete
        const previousComments = [...comments];
        setComments(prev => prev.filter(c => c.id !== commentId));

        try {
            await snippetsAPI.deleteComment(commentId);
            toast({ title: "Deleted", description: "Comment removed." });
            queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
        } catch (error) {
            console.error("Failed to delete comment", error);
            setComments(previousComments); // Revert
            toast({ title: "Error", description: "Could not delete comment.", variant: "destructive" });
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        const date = new Date().toISOString();
        const optimisticComment: Comment = {
            id: `temp-${Date.now()}`,
            content: newComment,
            createdAt: date,
            author: {
                username: user?.username || "You",
                image: user?.image,
                name: user?.name
            },
            userId: user?.id,
            parentId: null,
            likesCount: 0,
            repliesCount: 0,
            isLiked: false
        };

        setIsSubmitting(true);
        const commentContent = newComment;
        setNewComment("");

        // Optimistic update: Prepend
        setComments(prev => [optimisticComment, ...prev]);

        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }

        try {
            const res = await snippetsAPI.comment(snippetId, commentContent);
            // Replace temp comment with real one
            setComments(prev => prev.map(c => c.id === optimisticComment.id ? {
                ...c,
                id: res.comment?.id || c.id,
                userId: res.comment?.userId || user?.id
            } : c));
            queryClient.invalidateQueries({ queryKey: ['comments', snippetId] });
        } catch (error) {
            console.error("Failed to post comment", error);
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            setNewComment(commentContent);
            toast({ title: "Error", description: "Failed to post comment.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // Group comments
    const rootComments = comments.filter(c => !c.parentId);
    const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const CommentItem = ({ comment, isReply = false }: { comment: Comment, isReply?: boolean }) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn("group relative", isReply ? "ml-12 mt-3" : "mt-6 first:mt-0")}
        >
            {isReply && <div className="absolute -left-6 top-4 w-4 h-px bg-white/10" />}

            <div className="flex gap-4">
                <Avatar className={cn("border border-white/10 shrink-0", isReply ? "h-6 w-6" : "h-8 w-8")}>
                    <AvatarImage src={comment.author?.image} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-[10px] text-white/70">
                        {comment.author?.username?.[0] || 'U'}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white/90 truncate max-w-[120px]">{comment.author?.username || 'Unknown'}</span>
                            <span className="text-[10px] text-white/30 font-mono shrink-0">
                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                            </span>
                        </div>
                        {String(user?.id) === String(comment.userId) && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white/40 hover:text-red-400 hover:bg-white/5"
                                onClick={() => handleDelete(comment.id)}
                            >
                                <Trash2 className="h-3 w-3" />
                            </Button>
                        )}
                    </div>
                    <p className="text-sm text-white/80 leading-relaxed font-light break-words selection:bg-purple-500/30">
                        {comment.content}
                    </p>
                    <div className="flex items-center gap-4 pt-1">
                        <button
                            className="text-[10px] font-medium text-white/40 cursor-not-allowed flex items-center gap-1 opacity-50"
                            title="Replies disabled for MVP"
                        >
                            Reply
                        </button>
                        <button
                            onClick={() => handleLike(comment.id)}
                            className={cn(
                                "text-[10px] font-medium transition-colors flex items-center gap-1 group/like",
                                comment.isLiked ? "text-red-400" : "text-white/40 hover:text-red-400"
                            )}
                        >
                            <Heart className={cn("h-3 w-3 transition-transform group-active/like:scale-75", comment.isLiked && "fill-current")} />
                            {comment.likesCount > 0 && comment.likesCount} {comment.likesCount === 0 ? "Like" : ""}
                        </button>
                    </div>
                </div>
            </div>

            {/* Render Replies */}
            {!isReply && (
                <div className="space-y-3">
                    {getReplies(comment.id).map(reply => (
                        <CommentItem key={reply.id} comment={reply} isReply />
                    ))}
                </div>
            )}
        </motion.div>
    );

    return (
        <div className="flex flex-col h-full w-full relative">
            {/* Comments List */}
            <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 p-8">
                            <div className="p-4 rounded-full bg-white/5">
                                <Sparkles className="h-6 w-6 text-white/50" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white text-sm font-medium">No comments yet</h4>
                                <p className="text-xs text-white/40 max-w-[200px]">Start the conversation by sharing your thoughts.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {rootComments.map(comment => (
                                <CommentItem key={comment.id} comment={comment} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Form */}
            <div className="flex-none p-4 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5 backdrop-blur-xl z-20">
                {user ? (
                    <div className="relative group">
                        <Textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Write a comment..."
                            className="min-h-[60px] max-h-[120px] bg-white/[0.03] border-white/5 hover:border-white/10 focus:border-primary/30 rounded-xl pr-14 text-sm resize-none scrollbar-hide shadow-none"
                        />
                        <div className="absolute bottom-2 right-2 flex items-center gap-2">
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-md transition-all disabled:opacity-50"
                                onClick={() => handleSubmit()}
                                disabled={!newComment.trim() || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5 ml-0.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="p-3 rounded-xl border border-dashed border-white/10 bg-white/5 text-center">
                        <p className="text-xs text-white/40">Sign in to comment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
