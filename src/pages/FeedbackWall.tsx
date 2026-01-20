import { useState, useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send, ThumbsUp, Loader2, Sparkles, Zap, Bug, Layout, MessageCircleCode, CheckCircle2, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
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
    BUG: <Bug className="h-3 w-3" />,
    UX: <Layout className="h-3 w-3" />,
    FEATURE: <Sparkles className="h-3 w-3" />,
    PERFORMANCE: <Zap className="h-3 w-3" />,
    OTHER: <MessageCircleCode className="h-3 w-3" />
};

const CATEGORY_COLORS = {
    BUG: "text-red-400 border-red-500/30 bg-red-500/10",
    UX: "text-pink-400 border-pink-500/30 bg-pink-500/10",
    FEATURE: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    PERFORMANCE: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    OTHER: "text-blue-400 border-blue-500/30 bg-blue-500/10"
};

export default function FeedbackWall() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [category, setCategory] = useState<string>("FEATURE");
    const [content, setContent] = useState("");
    const [showWelcome, setShowWelcome] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Initial Welcome Check
    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedFeedbackWall");
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem("hasVisitedFeedbackWall", "true");
        }
    }, []);

    // Fetch Feedback (Polled frequently for chat feel)
    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['feedback', 'latest'],
        queryFn: async () => {
            const res = await feedbackAPI.getAll("latest");
            // Reverse to show oldest at top, newest at bottom (Chat style)
            return (res.data as FeedbackMessage[]).reverse();
        },
        refetchInterval: 3000,
    });

    // Auto-scroll effect
    useEffect(() => {
        if (shouldAutoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, shouldAutoScroll]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            // Detect if user is near bottom
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShouldAutoScroll(isNearBottom);
        }
    };

    // Post Feedback Mutation
    const postMutation = useMutation({
        mutationFn: async (newFeedback: { content: string; category: string }) => {
            return feedbackAPI.create(newFeedback);
        },
        onMutate: async (newFeedback) => {
            // Optimistic Update
            await queryClient.cancelQueries({ queryKey: ['feedback'] });
            const previousMessages = queryClient.getQueryData(['feedback', 'latest']);

            // Mock new message
            const optimisticMsg = {
                id: Math.random().toString(),
                content: newFeedback.content,
                category: newFeedback.category,
                upvotes: 0,
                isAck: false,
                createdAt: new Date().toISOString(),
                user: { username: "You", image: "" }, // Placeholder
                hasReacted: false,
                isOptimistic: true
            };

            queryClient.setQueryData(['feedback', 'latest'], (old: FeedbackMessage[] = []) => [...old, optimisticMsg]);
            setShouldAutoScroll(true);
            setContent("");
            return { previousMessages };
        },
        onError: (err: any, _vars, context) => {
            queryClient.setQueryData(['feedback', 'latest'], context?.previousMessages);
            toast({
                title: "Failed to send",
                description: err.message || "Could not connect to chat",
                variant: "destructive"
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
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
        <div className="flex flex-col h-screen bg-[#0a0a0c] lg:pl-[240px] overflow-hidden relative">

            {/* Header */}
            <header className="flex-shrink-0 px-6 py-4 border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md z-20 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">
                        Community Chat
                        <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5">LIVE</Badge>
                    </h1>
                    <p className="text-xs text-muted-foreground/60">Real-time discussions & feedback</p>
                </div>
            </header>

            {/* Chat Area */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto custom-scrollbar p-0 space-y-0"
            >
                <div className="max-w-4xl mx-auto w-full min-h-full flex flex-col justify-end p-4 md:p-6 gap-2">
                    {/* Welcome message if empty */}
                    {!isLoading && messages.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                            <MessageCircleCode className="h-12 w-12 mx-auto mb-4 text-white/20" />
                            <h3 className="text-lg font-medium text-white/40">Quiet room...</h3>
                            <p className="text-sm text-white/20">Be the first to say hello!</p>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, index) => {
                        const isContinuation = index > 0 && messages[index - 1].user.username === msg.user.username &&
                            (new Date(msg.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() < 60000);

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn(
                                    "group flex gap-4 w-full px-4 py-2 hover:bg-white/[0.02] rounded-lg transition-colors",
                                    (msg as any).isOptimistic && "opacity-70"
                                )}
                            >
                                {/* Avatar Column */}
                                <div className="flex-shrink-0 w-10 pt-1">
                                    {!isContinuation ? (
                                        <Avatar className="h-10 w-10 rounded-xl border border-white/5 bg-white/5">
                                            <AvatarImage src={msg.user.image} />
                                            <AvatarFallback className="text-[10px] font-bold bg-[#1a1a1e] text-muted-foreground">
                                                {msg.user.username[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="w-10 text-[10px] text-muted-foreground/20 text-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: false }).replace('about ', '').replace(' minutes', 'm')}
                                        </div>
                                    )}
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 min-w-0">
                                    {!isContinuation && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white hover:underline cursor-pointer">
                                                {msg.user.username}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground/50">
                                                {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                            </span>
                                            {msg.isAck && (
                                                <Badge variant="outline" className="text-[9px] h-4 px-1.5 gap-1 border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                                                    <CheckCircle2 className="h-2.5 w-2.5" /> Dev Replied
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-[15px] leading-6 text-white/90 whitespace-pre-wrap break-words">
                                        {msg.content}
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Badge variant="outline" className={cn("text-[9px] py-0 h-5 px-1.5 border gap-1 rounded-full", CATEGORY_COLORS[msg.category])}>
                                            {CATEGORY_ICONS[msg.category]}
                                            {msg.category}
                                        </Badge>

                                        <button
                                            onClick={() => reactMutation.mutate(msg.id)}
                                            className={cn(
                                                "flex items-center gap-1 text-[10px] font-medium px-2 h-5 rounded-full transition-colors border",
                                                msg.hasReacted
                                                    ? "bg-primary/10 text-primary border-primary/20"
                                                    : "bg-transparent text-muted-foreground border-transparent hover:bg-white/5"
                                            )}
                                        >
                                            <ThumbsUp className="h-3 w-3" />
                                            {msg.upvotes > 0 && <span>{msg.upvotes}</span>}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>

            {/* Scroll to Bottom Button */}
            {!shouldAutoScroll && (
                <div className="absolute bottom-24 right-8 z-40">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 rounded-full shadow-lg bg-primary text-black hover:bg-primary/90 transition-all"
                        onClick={() => {
                            setShouldAutoScroll(true);
                            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                        }}
                    >
                        <ArrowDown className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 md:p-6 bg-[#0a0a0c] border-t border-white/5 z-30">
                <div className="max-w-4xl mx-auto w-full relative">
                    <div className="bg-[#151518] rounded-2xl border border-white/5 p-3 shadow-2xl focus-within:ring-1 focus-within:ring-white/10 transition-all">
                        <div className="flex gap-3">
                            <Select value={category} onValueChange={setCategory}>
                                <SelectTrigger className="w-[140px] h-10 border-0 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#1a1a1e] border-white/10 text-white">
                                    {Object.keys(CATEGORY_ICONS).map(cat => (
                                        <SelectItem key={cat} value={cat} className="text-xs">
                                            {cat}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex-1">
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Type a message..."
                                    className="min-h-[40px] max-h-[200px] py-2 bg-transparent border-0 focus-visible:ring-0 resize-none text-sm text-white placeholder:text-muted-foreground/50"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                disabled={!content.trim() || postMutation.isPending}
                                size="icon"
                                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 shrink-0"
                            >
                                {postMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                            </Button>
                        </div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/40 text-center mt-2 font-mono">
                        Markdown supported • Shift+Enter for new line
                    </div>
                </div>
            </div>

            {/* Welcome Dialog */}
            <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
                <DialogContent className="bg-[#121214] border-white/10 text-white sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle>Welcome to Community Chat</DialogTitle>
                        <DialogDescription className="text-muted-foreground">
                            This is a live space to discuss features, bugs, and ideas with fellow developers.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-sm space-y-2 py-4">
                        <p>• Be respectful and constructive.</p>
                        <p>• Use categories to help us filter feedback.</p>
                        <p>• Rate limited to 1 message every 30 seconds.</p>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowWelcome(false)} className="w-full">
                            Join Chat
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
