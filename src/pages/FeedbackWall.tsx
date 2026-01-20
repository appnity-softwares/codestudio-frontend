import { useState, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, ThumbsUp, MessageSquare, Loader2, Info, Sparkles, Zap, Bug, Layout, MessageCircleCode, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { feedbackAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface FeedbackMessage {
    id: string;
    content: string;
    category: "BUG" | "UX" | "FEATURE" | "PERFORMANCE" | "OTHER";
    upvotes: number;
    isAck: boolean;
    createdAt: string;
    user: {
        username: string;
        image: string;
    };
    hasReacted: boolean;
}

const CATEGORY_ICONS = {
    BUG: <Bug className="h-3 w-3" />,
    UX: <Layout className="h-3 w-3" />,
    FEATURE: <Sparkles className="h-3 w-3" />,
    PERFORMANCE: <Zap className="h-3 w-3" />,
    OTHER: <MessageCircleCode className="h-3 w-3" />
};

const CATEGORY_COLORS = {
    BUG: "text-red-400 bg-red-400/10 border-red-400/20",
    UX: "text-pink-400 bg-pink-400/10 border-pink-400/20",
    FEATURE: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    PERFORMANCE: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    OTHER: "text-muted-foreground bg-muted/50 border-white/10"
};

export default function FeedbackWall() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [category, setCategory] = useState<string>("FEATURE");
    const [content, setContent] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);

    // Fetch Feedback
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['feedback', 'latest'],
        queryFn: async () => {
            const res = await feedbackAPI.getAll("latest");
            return res.data as FeedbackMessage[];
        },
        refetchInterval: 15000 // Tighter polling for premium feel
    });

    // Post Feedback Mutation
    const postMutation = useMutation({
        mutationFn: async (newFeedback: { content: string; category: string }) => {
            return feedbackAPI.create(newFeedback);
        },
        onSuccess: () => {
            setContent("");
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
            toast({
                title: "Feedback Recorded",
                description: "Our team will review this shortly. Thanks for your contribution!",
            });
            setTimeout(() => {
                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
        },
        onError: (err: any) => {
            toast({
                title: "Wait a moment...",
                description: err.message || "Could not post feedback",
                variant: "destructive"
            });
        }
    });

    // Reaction Mutation
    const reactMutation = useMutation({
        mutationFn: async (id: string) => {
            return feedbackAPI.react(id);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['feedback'] });
            const previousData = queryClient.getQueryData(['feedback', 'latest']);

            queryClient.setQueryData(['feedback', 'latest'], (old: FeedbackMessage[] | undefined) => {
                return old?.map(msg => {
                    if (msg.id === id) {
                        return {
                            ...msg,
                            upvotes: msg.hasReacted ? Math.max(0, msg.upvotes - 1) : msg.upvotes + 1,
                            hasReacted: !msg.hasReacted
                        };
                    }
                    return msg;
                });
            });

            return { previousData };
        },
        onError: (_err, _id, context) => {
            queryClient.setQueryData(['feedback', 'latest'], context?.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || postMutation.isPending) return;
        postMutation.mutate({ content, category });
    };

    return (
        <div className="min-h-screen bg-[#0a0a0c] lg:pl-[240px]">
            <div className="max-w-4xl mx-auto flex flex-col h-screen relative border-x border-white/5">

                {/* Header Section */}
                <div className="p-8 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-3xl font-extrabold tracking-tight text-white leading-none">
                                    Community Wall
                                </h1>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 h-5 px-1.5 transition-colors">
                                    BETA
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Your voice determines our roadmap. Upvote the best ideas or share your own suggestions.
                            </p>
                        </div>
                        <div className="hidden sm:flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#bf95f9] bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                                <Info className="h-3 w-3" />
                                <span>3 Submission / Hour</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground/60 italic">Refreshing every 15s</p>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(191,149,249,0.03),transparent_50%)]">
                    <div className="p-4 md:p-8 space-y-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                                <div className="p-4 rounded-full bg-primary/5 border border-primary/10 relative">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                                </div>
                                <p className="text-sm text-muted-foreground animate-pulse font-medium">Connecting to wall...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="max-w-md mx-auto text-center py-20 bg-white/[0.01] border border-white/5 rounded-3xl p-10"
                            >
                                <div className="w-16 h-16 bg-primary/5 border border-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 group-hover:rotate-0 transition-transform">
                                    <MessageSquare className="h-8 w-8 text-primary/60" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">The wall is waiting...</h3>
                                <p className="text-sm text-muted-foreground mb-8">
                                    Be the pioneer! Share the first piece of feedback to help us build a better platform.
                                </p>

                                <div className="space-y-4 text-left">
                                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest text-center mb-6">What happens next?</h4>
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white/80">Public Visibility</p>
                                            <p className="text-xs text-muted-foreground">Your feedback is visible to everyone instantly.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 w-6 h-6 rounded-full bg-[#bf95f9]/10 border border-[#bf95f9]/20 flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white/80">Team Curation</p>
                                            <p className="text-xs text-muted-foreground">Admins periodically flag high-priority feedback.</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="space-y-4 max-w-3xl mx-auto">
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={cn(
                                                "group relative flex gap-5 p-6 rounded-2xl border transition-all duration-300",
                                                msg.isAck
                                                    ? "bg-emerald-500/[0.03] border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04] hover:shadow-xl hover:shadow-black/20"
                                            )}
                                        >
                                            <div className="flex flex-col items-center gap-2">
                                                <Avatar className="h-12 w-12 border-2 border-white/5 shadow-inner">
                                                    <AvatarImage src={msg.user.image} />
                                                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-bold">
                                                        {msg.user.username[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="w-[1px] flex-1 bg-gradient-to-b from-white/10 to-transparent my-1 group-last:hidden" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center flex-wrap gap-2 mb-2">
                                                    <span className="font-bold text-sm text-white/90 group-hover:text-white transition-colors">
                                                        {msg.user.username}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground/30">•</span>
                                                    <span className="text-[10px] font-medium text-muted-foreground/60 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                                                        {formatDistanceToNow(new Date(msg.createdAt))} ago
                                                    </span>
                                                    {msg.isAck && (
                                                        <Badge variant="outline" className="ml-auto text-[9px] h-5 gap-1.5 border-emerald-500/40 text-emerald-400 bg-emerald-500/10 font-bold uppercase tracking-wider">
                                                            <CheckCircle2 className="h-2.5 w-2.5" /> Team Acknowledged
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed whitespace-pre-wrap break-words group-hover:text-white/80 transition-colors">
                                                    {msg.content}
                                                </p>

                                                <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/[0.03]">
                                                    <Badge variant="outline" className={cn("text-[10px] px-2.5 py-1 h-7 gap-1.5 font-bold border-1 uppercase tracking-tight", CATEGORY_COLORS[msg.category])}>
                                                        {CATEGORY_ICONS[msg.category]}
                                                        {msg.category}
                                                    </Badge>

                                                    <button
                                                        onClick={() => reactMutation.mutate(msg.id)}
                                                        className={cn(
                                                            "flex items-center gap-2 text-xs px-3 py-1.5 rounded-full transition-all active:scale-95 border",
                                                            msg.hasReacted
                                                                ? "text-primary bg-primary/10 border-primary/20 font-bold shadow-[0_0_15px_rgba(191,149,249,0.15)]"
                                                                : "text-muted-foreground border-white/5 bg-white/[0.02] hover:bg-white/5 hover:text-white hover:border-white/10"
                                                        )}
                                                    >
                                                        <ThumbsUp className={cn("h-3.5 w-3.5 transition-transform", msg.hasReacted && "fill-current")} />
                                                        <span className="min-w-[12px]">{msg.upvotes}</span>
                                                        <span className="text-[10px] opacity-60 font-normal">{msg.hasReacted ? "Agreed" : "Agree"}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-20" />
                    </div>
                </div>

                {/* Refined Input Area */}
                <div className="p-6 border-t border-white/5 bg-[#0a0a0c]/95 backdrop-blur-xl z-10">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-between mb-3 px-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                                <MessageCircleCode className="h-3 w-3" />
                                Share your thoughts
                            </label>
                            <span className={cn("text-[10px] font-medium", content.length > 450 ? "text-orange-400" : "text-muted-foreground/30")}>
                                {content.length} / 500
                            </span>
                        </div>

                        <form onSubmit={handleSubmit} className="flex gap-4 items-start bg-white/[0.02] p-2 rounded-2xl border border-white/5 focus-within:border-primary/30 focus-within:bg-white/[0.04] transition-all">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-[150px] bg-white/5 border-white/10 focus:ring-0 focus:border-white/20 h-11 rounded-xl">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#0f0f12] border-white/10">
                                    <SelectItem value="FEATURE" className="hover:bg-primary/10">✨ New Feature</SelectItem>
                                    <SelectItem value="BUG" className="hover:bg-red-400/10">🐞 Bug Report</SelectItem>
                                    <SelectItem value="UX" className="hover:bg-pink-400/10">🎨 UX/UI Design</SelectItem>
                                    <SelectItem value="PERFORMANCE" className="hover:bg-amber-400/10">⚡ Performance</SelectItem>
                                    <SelectItem value="OTHER" className="hover:bg-white/5">🗨️ General</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex-1 flex gap-2">
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value.slice(0, 500))}
                                    placeholder="I wish CodeStudio had..."
                                    className="flex-1 min-h-[44px] max-h-[120px] bg-transparent border-0 ring-0 focus-visible:ring-0 resize-none py-2 text-sm leading-relaxed"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                                <Button
                                    type="submit"
                                    disabled={!content.trim() || postMutation.isPending}
                                    className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/80 text-black font-bold flex-shrink-0 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(191,149,249,0.3)]"
                                >
                                    {postMutation.isPending ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </Button>
                            </div>
                        </form>
                        <p className="text-[9px] text-center text-muted-foreground/30 mt-3 font-medium uppercase tracking-tighter italic">
                            Constructive feedback only • Stay respectful • {formatDistanceToNow(new Date())}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
