import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { bugsAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Send, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        username: string;
        image?: string;
        name?: string;
    };
}

export function BugComments({ bugId }: { bugId: string }) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Bugs API needs a 'getComments' method or we fetch with the bug?
    // The previous view of schema showed `BugComment`. 
    // Let's check `bugsAPI` in `api.ts`. It has `comment`. Does it have `getComments`?
    // It has `getAll` for bugs. We might need to add `getComments` to `bugsAPI`.

    useEffect(() => {
        const fetchComments = async () => {
            // Temporary: use getAll if it includes comments, or separate endpoint.
            // If separate endpoint missing, I'll add it. 
            // For now, let's assume I'll add `getComments` to `bugsAPI`.
            if (!bugId) return;
            setIsLoading(true);
            try {
                const data = await bugsAPI.getComments(bugId);
                setComments(data.comments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Failed to fetch bug comments", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchComments();
    }, [bugId]);

    const handleSubmit = async () => {
        if (!newComment.trim() || isSubmitting) return;

        const optimisticComment: Comment = {
            id: `temp-${Date.now()}`,
            content: newComment,
            createdAt: new Date().toISOString(),
            author: {
                username: user?.username || "You",
                image: user?.image,
                name: user?.name
            }
        };

        setIsSubmitting(true);
        setNewComment("");
        setComments(prev => [optimisticComment, ...prev]);

        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0;
        }

        try {
            const { comment } = await bugsAPI.comment(bugId, optimisticComment.content);
            setComments(prev => prev.map(c => c.id === optimisticComment.id ? comment : c));
        } catch (error) {
            console.error("Failed to post comment", error);
            setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
            setNewComment(optimisticComment.content);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full w-full relative">
            <div className="p-6 pb-2 border-b border-white/5">
                <h3 className="text-xl font-bold font-headline text-white flex items-center gap-2">
                    Bug Report Alpha
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-white/60 font-mono">
                        {comments.length}
                    </span>
                </h3>
            </div>

            <div
                ref={scrollContainerRef}
                className="flex-1 min-h-0 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                <AnimatePresence initial={false} mode="popLayout">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                            <div className="h-4 w-4 bg-white/20 rounded-full animate-ping" />
                            <span className="text-xs text-white/40">Loading reports...</span>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 p-8">
                            <div className="p-4 rounded-full bg-white/5">
                                <Sparkles className="h-6 w-6 text-white/50" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-white text-sm font-medium">No updates</h4>
                                <p className="text-xs text-white/40 max-w-[200px]">Be the first to report status.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {comments.map(comment => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    key={comment.id}
                                    className="flex gap-4 group"
                                >
                                    <Avatar className="h-8 w-8 border border-white/10 shrink-0 mt-1">
                                        <AvatarImage src={comment.author?.image} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-[10px] text-white/70">
                                            {comment.author?.username?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-white/90">{comment.author?.username || 'Unknown'}</span>
                                            <span className="text-[10px] text-white/30 font-mono">
                                                {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-white/80 leading-relaxed font-light break-words selection:bg-purple-500/30">
                                            {comment.content}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex-none p-4 bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/5 backdrop-blur-xl z-20">
                <div className="flex items-end gap-3 p-1">
                    <Avatar className="h-8 w-8 border border-white/10 shrink-0">
                        <AvatarImage src={user?.image} />
                        <AvatarFallback className="bg-white/5 text-[10px] text-white/50">{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative bg-white/5 rounded-2xl border border-white/5 focus-within:border-white/10 focus-within:bg-white/10 transition-all overflow-hidden flex items-end">
                        <Textarea
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="Add report entry..."
                            className="min-h-[44px] max-h-[120px] w-full resize-none border-none bg-transparent py-3 px-4 text-sm text-white placeholder:text-white/30 focus-visible:ring-0"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                        />
                        <div className="pr-2 pb-2">
                            <Button
                                size="icon"
                                className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                onClick={handleSubmit}
                                disabled={isSubmitting || !newComment.trim()}
                            >
                                {isSubmitting ? (
                                    <div className="h-3 w-3 rounded-full border-2 border-white/50 border-t-transparent animate-spin" />
                                ) : (
                                    <Send className="h-3.5 w-3.5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
