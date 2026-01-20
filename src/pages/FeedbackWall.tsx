import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, ThumbsUp, MessageSquare, Loader2, Sparkles, Zap, Bug, Layout, MessageCircleCode, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { feedbackAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
    BUG: <Bug className="h-3.5 w-3.5" />,
    UX: <Layout className="h-3.5 w-3.5" />,
    FEATURE: <Sparkles className="h-3.5 w-3.5" />,
    PERFORMANCE: <Zap className="h-3.5 w-3.5" />,
    OTHER: <MessageCircleCode className="h-3.5 w-3.5" />
};

const CATEGORY_STYLES = {
    BUG: "text-red-400 bg-red-400/10 border-red-500/30 ring-1 ring-red-500/20",
    UX: "text-pink-400 bg-pink-400/10 border-pink-500/30 ring-1 ring-pink-500/20",
    FEATURE: "text-emerald-400 bg-emerald-400/10 border-emerald-500/30 ring-1 ring-emerald-500/20",
    PERFORMANCE: "text-amber-400 bg-amber-400/10 border-amber-500/30 ring-1 ring-amber-500/20",
    OTHER: "text-blue-400 bg-blue-400/10 border-blue-500/30 ring-1 ring-blue-500/20"
};

export default function FeedbackWall() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [category, setCategory] = useState<string>("FEATURE");
    const [content, setContent] = useState("");
    const [showWelcome, setShowWelcome] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Initial Welcome Check
    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedFeedbackWall");
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem("hasVisitedFeedbackWall", "true");
        }
    }, []);

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
        <div className="min-h-screen bg-[#0a0a0c] lg:pl-[240px] flex flex-col">

            {/* Wider Container */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Header - Glassmorphism */}
                <div className="px-8 py-6 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md sticky top-0 z-20 flex-shrink-0">
                    <div className="max-w-[1600px] mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-extrabold tracking-tight text-white/90">
                                    Community Wall
                                </h1>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 px-2 py-0.5 text-[10px] tracking-wider font-bold">
                                    BETA
                                </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground/80 max-w-2xl">
                                Join the conversation. Help us shape the future of CodeStudio by sharing your ideas.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Live View
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content - Grid Layout */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(191,149,249,0.03),transparent_50%)]">
                    <div className="max-w-[1600px] mx-auto w-full p-6 md:p-8">

                        {isLoading ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 rounded-full bg-primary/5 border border-primary/10 relative">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                                <p className="text-sm text-muted-foreground animate-pulse">Syncing with community...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-[60vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto">
                                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 rotate-3">
                                    <MessageSquare className="h-10 w-10 text-white/40" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Be the first voice</h3>
                                <p className="text-muted-foreground mb-8">The wall is empty. Share your brilliant idea and start the discussion.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg, idx) => (
                                        <motion.div
                                            key={msg.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                                            className={cn(
                                                "group relative flex flex-col gap-4 p-6 rounded-3xl border transition-all duration-300 h-full",
                                                msg.isAck
                                                    ? "bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_4px_20px_rgba(16,185,129,0.02)]"
                                                    : "bg-[#121214] border-white/5 hover:border-white/10 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1"
                                            )}
                                        >
                                            {/* Card Header */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-white/10 shadow-lg">
                                                        <AvatarImage src={msg.user.image} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                            {msg.user.username[0].toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm text-white/90 group-hover:text-white transition-colors">
                                                            {msg.user.username}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/60">
                                                            {formatDistanceToNow(new Date(msg.createdAt))} ago
                                                        </span>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className={cn("text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border", CATEGORY_STYLES[msg.category])}>
                                                    {CATEGORY_ICONS[msg.category]}
                                                    <span className="ml-1.5">{msg.category}</span>
                                                </Badge>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1">
                                                <p className="text-[15px] leading-relaxed text-muted-foreground/90 group-hover:text-white/90 transition-colors whitespace-pre-wrap">
                                                    {msg.content}
                                                </p>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/[0.04] mt-auto">
                                                {msg.isAck ? (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        <span>Team Acknowledged</span>
                                                    </div>
                                                ) : (
                                                    <div className="h-4" /> // Spacer
                                                )}

                                                <button
                                                    onClick={() => reactMutation.mutate(msg.id)}
                                                    className={cn(
                                                        "flex items-center gap-2 text-xs px-4 py-2 rounded-xl transition-all active:scale-95 border",
                                                        msg.hasReacted
                                                            ? "text-primary bg-primary/10 border-primary/20 font-bold shadow-[0_0_15px_rgba(191,149,249,0.1)]"
                                                            : "text-muted-foreground border-white/5 bg-white/[0.02] hover:bg-white/5 hover:text-white hover:border-white/10"
                                                    )}
                                                >
                                                    <ThumbsUp className={cn("h-4 w-4 transition-transform", msg.hasReacted && "fill-current scale-110")} />
                                                    <span className="min-w-[16px] text-center">{msg.upvotes}</span>
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                        <div ref={bottomRef} className="h-6" />
                    </div>
                </div>

                {/* Input Area - Absolute Bottom */}
                <div className="p-6 border-t border-white/5 bg-[#0a0a0c]/90 backdrop-blur-xl z-30 flex-shrink-0">
                    <div className="max-w-[1600px] mx-auto w-full">
                        <div className="bg-[#151518] border border-white/5 rounded-2xl p-2 flex gap-4 transition-all focus-within:border-primary/20 focus-within:ring-1 focus-within:ring-primary/10 shadow-2xl shadow-black/50">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-[160px] bg-white/[0.03] border-white/5 hover:bg-white/5 h-[50px] rounded-xl text-white/80 font-medium">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1e] border-white/10 text-white">
                                    <SelectItem value="FEATURE">✨ New Feature</SelectItem>
                                    <SelectItem value="BUG">🐞 Bug Report</SelectItem>
                                    <SelectItem value="UX">🎨 UX Improvement</SelectItem>
                                    <SelectItem value="PERFORMANCE">⚡ Performance</SelectItem>
                                    <SelectItem value="OTHER">🗨️ General</SelectItem>
                                </SelectContent>
                            </Select>

                            <Textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                                placeholder="I wish CodeStudio had..."
                                className="flex-1 min-h-[50px] max-h-[120px] bg-transparent border-0 ring-0 focus-visible:ring-0 resize-none py-3 text-base leading-relaxed text-white placeholder:text-muted-foreground/40"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                            />

                            <Button
                                onClick={handleSubmit}
                                disabled={!content.trim() || postMutation.isPending}
                                className="h-[50px] w-[50px] rounded-xl bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 flex-shrink-0"
                            >
                                {postMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </div>
                        <div className="flex justify-between items-center mt-3 px-2">
                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
                                Constructive Feedback Only
                            </span>
                            <span className={cn("text-[10px] font-mono", content.length > 450 ? "text-orange-400" : "text-muted-foreground/40")}>
                                {content.length} / 500
                            </span>
                        </div>
                    </div>
                </div>

                {/* Welcome Dialog */}
                <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
                    <DialogContent className="bg-[#121214] border-white/10 text-white sm:max-w-md gap-0 p-0 overflow-hidden rounded-3xl">
                        <div className="h-32 bg-gradient-to-br from-primary/20 to-purple-900/20 relative flex items-center justify-center">
                            <DialogHeader className="relative z-10 w-full px-6">
                                <div className="w-12 h-12 bg-black/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/10 mx-auto">
                                    <Sparkles className="h-6 w-6 text-primary" />
                                </div>
                                <DialogTitle className="text-xl font-bold text-center">Welcome to the Wall</DialogTitle>
                            </DialogHeader>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
                        </div>
                        <div className="p-6 space-y-6">
                            <DialogDescription className="text-center text-muted-foreground text-sm">
                                This is your space to shape the future of CodeStudio. Your feedback is public, visible, and directly influences our roadmap.
                            </DialogDescription>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-2">
                                    <ThumbsUp className="h-5 w-5 text-emerald-400" />
                                    <span className="text-xs font-bold text-white/80">Upvote</span>
                                    <span className="text-[10px] text-muted-foreground/60 leading-tight">Support good ideas</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 flex flex-col items-center text-center gap-2">
                                    <MessageSquare className="h-5 w-5 text-blue-400" />
                                    <span className="text-xs font-bold text-white/80">Suggest</span>
                                    <span className="text-[10px] text-muted-foreground/60 leading-tight">Share your vision</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-6 pt-0 sm:justify-center">
                            <Button onClick={() => setShowWelcome(false)} className="w-full h-12 rounded-xl font-bold bg-white text-black hover:bg-white/90">
                                Got it, let's build!
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}
