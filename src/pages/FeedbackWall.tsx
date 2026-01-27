import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Send, ThumbsUp, ThumbsDown, Loader2, Sparkles, Zap, Bug, Layout, MessageCircleCode, CheckCircle2, ArrowDown, Info, Clock, Lock, Pin, MoreHorizontal, Eye, EyeOff, ChevronLeft } from "lucide-react";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { feedbackAPI, adminAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useBadgeCelebration } from "@/context/BadgeContext";

interface FeedbackMessage {
    id: string;
    userId: string;
    content: string;
    category: "BUG" | "UX" | "FEATURE" | "PERFORMANCE" | "OTHER";
    status: "OPEN" | "REVIEWING" | "PLANNED" | "SHIPPED" | "CLOSED";
    upvotes: number;
    downvotes: number;
    isAck: boolean;
    isLocked: boolean;
    isPinned: boolean;
    isHidden: boolean;
    changelogId?: string;
    createdAt: string;
    user: {
        username: string;
        image: string;
    };
    hasReacted: boolean;
    hasDisagreed: boolean;
    isOptimistic?: boolean;
}

const CATEGORY_CONFIG = {
    BUG: {
        icon: Bug,
        label: "Bug Report",
        color: "text-red-500 bg-red-500/10 border-red-500/20",
        tooltip: "Something is broken or not working as expected"
    },
    UX: {
        icon: Layout,
        label: "UX Issue",
        color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
        tooltip: "Usability, design, or experience feedback"
    },
    FEATURE: {
        icon: Sparkles,
        label: "Feature Request",
        color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
        tooltip: "New functionality or improvement request"
    },
    PERFORMANCE: {
        icon: Zap,
        label: "Performance",
        color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
        tooltip: "Speed, latency, or optimization issues"
    },
    OTHER: {
        icon: MessageCircleCode,
        label: "General",
        color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
        tooltip: "General feedback or suggestions"
    }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: any }> = {
    OPEN: { label: "Open", color: "bg-muted text-muted-foreground border-border" },
    REVIEWING: { label: "Under Review", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    PLANNED: { label: "Planned", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    SHIPPED: { label: "Shipped", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle2 },
    CLOSED: { label: "Closed", color: "bg-muted/50 text-muted-foreground border-border" }
};

const MAX_CHARS = 500;

export default function FeedbackWall() {
    const { toast } = useToast();
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [category, setCategory] = useState<string>("FEATURE");
    const [content, setContent] = useState("");
    const [showWelcome, setShowWelcome] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const isMobile = useIsMobile();
    const { celebrate, celebrateXP } = useBadgeCelebration();

    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedFeedbackWall");
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem("hasVisitedFeedbackWall", "true");
        }
    }, []);

    // Handle URL parameters for pre-filling (e.g. from Error Reports)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlContent = params.get('content');
        const urlCategory = params.get('category');

        if (urlContent) setContent(urlContent);
        if (urlCategory) setCategory(urlCategory);
    }, []);

    const { data: messages = [], isLoading } = useQuery({
        queryKey: ['feedback', 'latest'],
        queryFn: async () => {
            const res = await feedbackAPI.getAll("latest");
            // Sort: Pinned first, then by date (Oldest -> Newest)
            return (res.data as FeedbackMessage[]).sort((a, b) => {
                if (a.isPinned && !b.isPinned) return -1; // a comes first
                if (!a.isPinned && b.isPinned) return 1;  // b comes first
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
        },
        refetchInterval: 3000,
    });

    useEffect(() => {
        if (shouldAutoScroll && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, shouldAutoScroll]);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShouldAutoScroll(isNearBottom);
        }
    };

    const postMutation = useMutation({
        mutationFn: async (newFeedback: { content: string; category: string }) => {
            const res = await feedbackAPI.create(newFeedback);
            return res;
        },
        onSuccess: (res: any) => {
            // Simulated XP Reward for Feedback
            celebrateXP(15);

            if (res.newBadges && res.newBadges.length > 0) {
                celebrate(res.newBadges);
            }
        },
        onMutate: async (newFeedback) => {
            await queryClient.cancelQueries({ queryKey: ['feedback'] });
            const previousMessages = queryClient.getQueryData(['feedback', 'latest']);

            const optimisticMsg = {
                id: Math.random().toString(),
                content: newFeedback.content,
                category: newFeedback.category,
                upvotes: 0,
                isAck: false,
                createdAt: new Date().toISOString(),
                user: { username: user?.username || "You", image: user?.image || "" },
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
                description: err.message || "Could not submit feedback",
                variant: "destructive"
            });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
        }
    });

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

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => adminAPI.updateFeedbackStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feedback"] });
            toast({ title: "Status updated" });
        }
    });

    const lockMutation = useMutation({
        mutationFn: ({ id, isLocked }: { id: string; isLocked: boolean }) => adminAPI.lockFeedback(id, isLocked),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feedback"] });
            toast({ title: "Lock status updated" });
        }
    });

    const pinMutation = useMutation({
        mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) => adminAPI.pinFeedback(id, isPinned),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feedback"] });
            toast({ title: "Pin status updated" });
        }
    });

    const hideMutation = useMutation({
        mutationFn: ({ id, isHidden }: { id: string; isHidden: boolean }) => adminAPI.hideFeedback(id, isHidden),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["feedback"] });
            toast({ title: "Visibility updated" });
        }
    });

    const disagreeMutation = useMutation({
        mutationFn: async (id: string) => {
            return feedbackAPI.disagree(id);
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['feedback'] });
            const previousData = queryClient.getQueryData(['feedback', 'latest']);

            queryClient.setQueryData(['feedback', 'latest'], (old: FeedbackMessage[] | undefined) => {
                return old?.map(msg => {
                    if (msg.id === id) {
                        return {
                            ...msg,
                            downvotes: msg.hasDisagreed ? Math.max(0, msg.downvotes - 1) : msg.downvotes + 1,
                            hasDisagreed: !msg.hasDisagreed
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

    const deleteMutation = useMutation({
        mutationFn: (id: string) => feedbackAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
            toast({ title: "Feedback deleted" });
        },
        onError: (err: any) => {
            toast({ title: "Failed to delete", description: err.message, variant: "destructive" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, content, category }: { id: string; content: string; category: string }) =>
            feedbackAPI.update(id, { content, category }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['feedback'] });
            setEditingId(null);
            toast({ title: "Feedback updated" });
        },
        onError: (err: any) => {
            toast({ title: "Failed to update", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || postMutation.isPending || content.length > MAX_CHARS) return;

        if (editingId) {
            updateMutation.mutate({ id: editingId, content, category });
        } else {
            postMutation.mutate({ content, category });
        }
    };

    const handleEdit = (msg: FeedbackMessage) => {
        setEditingId(msg.id);
        setContent(msg.content);
        setCategory(msg.category);
        document.querySelector('textarea')?.focus();
    };

    const [editingId, setEditingId] = useState<string | null>(null);

    const charCount = content.length;
    const isOverLimit = charCount > MAX_CHARS;

    return (
        <TooltipProvider delayDuration={200}>
            <div className="flex flex-col h-full bg-background overflow-hidden">

                {/* Header - More Compact */}
                <header className="flex-shrink-0 px-6 py-4 border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {isMobile ? (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => navigate(-1)}
                                            className="p-2 rounded-full hover:bg-muted text-muted-foreground mr-1"
                                        >
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <MobileSidebar />
                                    </div>
                                ) : null}
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-lg font-black font-headline italic tracking-tight uppercase leading-none">
                                            Feed<span className="text-primary italic">Back</span>
                                        </h1>
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-tighter">
                                            Live
                                        </span>
                                    </div>
                                    {!isMobile && <p className="text-[10px] text-muted-foreground mt-0.5">Help us shape the future of CodeStudio.</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-[10px] text-muted-foreground font-mono bg-muted px-2 py-1 rounded-md border border-border">
                                    {messages.length} ENTRIES
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => setShowInfoModal(true)} className="p-1.5 rounded-full hover:bg-muted transition-colors">
                                            <Info className="h-4 w-4 text-muted-foreground" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-popover border-border text-popover-foreground">Learn more</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Chat Stream */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto"
                >
                    <div className="max-w-4xl mx-auto w-full min-h-full flex flex-col justify-end px-6 py-6 gap-4">

                        {/* Empty State with CTA */}
                        {!isLoading && messages.length === 0 && (
                            <div className="text-center py-24">
                                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-muted border border-border flex items-center justify-center">
                                    <MessageCircleCode className="h-7 w-7 text-muted-foreground" />
                                </div>
                                <h3 className="text-base font-medium text-muted-foreground mb-1">No feedback yet.</h3>
                                <p className="text-sm text-muted-foreground/70 mb-4">Be the first to help improve CodeStudio.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                                    onClick={() => document.querySelector('textarea')?.focus()}
                                >
                                    Share your first idea →
                                </Button>
                            </div>
                        )}

                        {/* Messages */}
                        {messages.filter(m => !m.isHidden || user?.role === 'ADMIN').map((msg) => {
                            const isMe = user?.id === msg.userId;
                            const categoryConfig = CATEGORY_CONFIG[msg.category] || CATEGORY_CONFIG.OTHER;
                            const CategoryIcon = categoryConfig.icon;
                            const statusConfig = STATUS_CONFIG[msg.status] || STATUS_CONFIG.OPEN;
                            const StatusIcon = statusConfig.icon;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "flex w-full",
                                        isMe ? "justify-end" : "justify-start",
                                        msg.isOptimistic && "opacity-60"
                                    )}
                                >
                                    <div className={cn(
                                        isMobile
                                            ? "w-[92%]"
                                            : "w-[85%] max-w-[700px] min-w-[320px]",
                                        isMe ? "ml-auto" : "mr-auto"
                                    )}>
                                        <div className={cn(
                                            "border transition-all shadow-sm",
                                            isMe
                                                ? "rounded-2xl rounded-tr-sm bg-primary/10 border-primary/20"
                                                : cn(
                                                    "rounded-2xl rounded-tl-sm bg-card border-border shadow-sm",
                                                    msg.status === "SHIPPED" && "border-emerald-500/30 bg-emerald-500/5"
                                                )
                                        )}>
                                            <div className="px-3.5 py-2 border-b border-border/50">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <Avatar className="h-5 w-5 rounded-full border border-border flex-shrink-0">
                                                            <AvatarImage src={msg.user.image} />
                                                            <AvatarFallback className="text-[8px] font-semibold bg-muted text-muted-foreground">
                                                                {msg.user.username[0]?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-medium text-muted-foreground truncate">
                                                            {isMe ? "You" : msg.user.username}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground/70 font-mono">
                                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                        </span>
                                                        {(user?.role === "ADMIN" || isMe) && (
                                                            <div className="ml-auto relative">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white/20 hover:text-white hover:bg-white/10 rounded-full">
                                                                            <MoreHorizontal className="h-3.5 w-3.5" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1e] border-white/10 text-white">
                                                                        {user?.role === "ADMIN" ? (
                                                                            <>
                                                                                <DropdownMenuLabel className="text-xs text-white/50">Admin Controls</DropdownMenuLabel>
                                                                                <DropdownMenuSub>
                                                                                    <DropdownMenuSubTrigger className="text-xs">
                                                                                        <span>Change Status</span>
                                                                                    </DropdownMenuSubTrigger>
                                                                                    <DropdownMenuSubContent className="bg-[#1a1a1e] border-white/10 text-white">
                                                                                        <DropdownMenuRadioGroup value={msg.status} onValueChange={(val) => updateStatusMutation.mutate({ id: msg.id, status: val })}>
                                                                                            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                                                                                <DropdownMenuRadioItem key={key} value={key} className="text-xs">
                                                                                                    {config.label}
                                                                                                </DropdownMenuRadioItem>
                                                                                            ))}
                                                                                        </DropdownMenuRadioGroup>
                                                                                    </DropdownMenuSubContent>
                                                                                </DropdownMenuSub>
                                                                                <DropdownMenuSeparator className="bg-white/10" />
                                                                                <DropdownMenuItem onClick={() => lockMutation.mutate({ id: msg.id, isLocked: !msg.isLocked })} className="text-xs">
                                                                                    {msg.isLocked ? <Lock className="h-3.5 w-3.5 mr-2 text-white/50" /> : <Lock className="h-3.5 w-3.5 mr-2" />}
                                                                                    {msg.isLocked ? "Unlock Thread" : "Lock Thread"}
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => pinMutation.mutate({ id: msg.id, isPinned: !msg.isPinned })} className="text-xs">
                                                                                    <Pin className={cn("h-3.5 w-3.5 mr-2", msg.isPinned ? "fill-current" : "")} />
                                                                                    {msg.isPinned ? "Unpin Feedback" : "Pin Feedback"}
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => hideMutation.mutate({ id: msg.id, isHidden: !msg.isHidden })} className="text-xs text-red-400 focus:text-red-400">
                                                                                    {msg.isHidden ? <Eye className="h-3.5 w-3.5 mr-2" /> : <EyeOff className="h-3.5 w-3.5 mr-2" />}
                                                                                    {msg.isHidden ? "Unhide Feedback" : "Hide Feedback"}
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <DropdownMenuLabel className="text-xs text-white/50">Actions</DropdownMenuLabel>
                                                                                <DropdownMenuItem onClick={() => handleEdit(msg)} className="text-xs">
                                                                                    Edit Feedback
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuItem onClick={() => deleteMutation.mutate(msg.id)} className="text-xs text-red-400 focus:text-red-400">
                                                                                    Delete Feedback
                                                                                </DropdownMenuItem>
                                                                            </>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        {msg.isPinned && (
                                                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[10px] font-medium text-amber-500/80">
                                                                <Pin className="h-3 w-3 rotate-45" />
                                                                <span>Pinned</span>
                                                            </div>
                                                        )}

                                                        {msg.status !== "OPEN" && (
                                                            <Badge
                                                                variant="outline"
                                                                className={cn(
                                                                    "text-[10px] h-5 px-2 border gap-1.5 rounded-md font-medium shrink-0",
                                                                    statusConfig.color
                                                                )}
                                                            >
                                                                {StatusIcon && <StatusIcon className="h-3 w-3" />}
                                                                {statusConfig.label}
                                                            </Badge>
                                                        )}

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn(
                                                                        "text-[10px] h-5 px-2 border gap-1.5 rounded-md font-medium shrink-0 cursor-help",
                                                                        categoryConfig.color
                                                                    )}
                                                                >
                                                                    <CategoryIcon className="h-3 w-3" />
                                                                    {categoryConfig.label}
                                                                </Badge>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-[#1a1a1e] border-white/10 text-white/80 max-w-[200px]">
                                                                <p className="text-xs">{categoryConfig.tooltip}</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="px-3.5 py-1.5 text-[13px] text-foreground/80 leading-snug break-words">
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:my-0.5 prose-headings:my-1 prose-ul:my-0.5 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>

                                            <div className="px-3 py-1.5 border-t border-white/[0.04] flex items-center gap-1">
                                                {msg.isLocked ? (
                                                    <div className="flex items-center gap-2 text-[10px] text-white/20 font-medium px-2 py-1">
                                                        <Lock className="h-3 w-3" />
                                                        Thread Locked
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => user?.role === 'ADMIN' && reactMutation.mutate(msg.id)}
                                                                    disabled={user?.role !== 'ADMIN'}
                                                                    className={cn(
                                                                        "flex items-center gap-1.5 font-medium rounded-lg transition-all touch-target",
                                                                        isMobile ? "text-xs h-10 px-4" : "text-[11px] h-7 px-2.5",
                                                                        msg.hasReacted
                                                                            ? "bg-primary/15 text-primary border border-primary/20"
                                                                            : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground",
                                                                        user?.role !== 'ADMIN' && "opacity-50 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    <ThumbsUp className={cn(isMobile ? "h-4 w-4" : "h-3.5 w-3.5", msg.hasReacted && "fill-current")} />
                                                                    <span className={isMobile ? "text-xs" : ""}>{msg.upvotes}</span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-popover border-border text-popover-foreground">
                                                                <p className="text-xs">{user?.role === 'ADMIN' ? 'Support this idea' : 'Voting restricted to admins'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => user?.role === 'ADMIN' && disagreeMutation.mutate(msg.id)}
                                                                    disabled={user?.role !== 'ADMIN'}
                                                                    className={cn(
                                                                        "flex items-center gap-1.5 text-[11px] font-medium h-7 px-2.5 rounded-lg transition-all",
                                                                        msg.hasDisagreed
                                                                            ? "bg-red-500/15 text-red-500 border border-red-500/20"
                                                                            : "bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground",
                                                                        user?.role !== 'ADMIN' && "opacity-50 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    <ThumbsDown className={cn("h-3.5 w-3.5", msg.hasDisagreed && "fill-current")} />
                                                                    {msg.downvotes > 0 && <span>{msg.downvotes}</span>}
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-[#1a1a1e] border-white/10 text-white/80">
                                                                <p className="text-xs">{user?.role === 'ADMIN' ? 'Disagree or not relevant' : 'Voting restricted to admins'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        <button
                                                            disabled
                                                            className="flex items-center gap-1.5 text-[11px] font-medium h-7 px-2.5 rounded-lg bg-muted text-muted-foreground/50 border border-transparent ml-auto cursor-not-allowed"
                                                        >
                                                            <Clock className="h-3 w-3" />
                                                            <span>Discuss</span>
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>
                </div>

                {!shouldAutoScroll && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-40">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-4 rounded-full bg-primary text-primary-foreground border-primary backdrop-blur-md shadow-2xl hover:bg-primary/90 transition-all scale-110"
                            onClick={() => {
                                setShouldAutoScroll(true);
                                bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                            }}
                        >
                            <ArrowDown className="h-4 w-4 mr-2 animate-bounce" />
                            New feedback
                        </Button>
                    </div>
                )}

                <div className="border-t border-border bg-background backdrop-blur-xl pb-safe">
                    <div className={cn("max-w-4xl mx-auto", isMobile ? "px-3 py-3" : "px-6 py-5")}>
                        <form onSubmit={handleSubmit}>
                            <div className={cn(
                                "bg-card border border-border shadow-2xl shadow-black/20 transition-all",
                                isMobile ? "rounded-3xl p-3" : "rounded-2xl p-4"
                            )}>
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Report a bug or suggest a feature..."
                                    className={cn(
                                        isMobile ? "min-h-[60px] max-h-[120px]" : "min-h-[80px] max-h-[160px]",
                                        "p-1 bg-transparent border-0 resize-none",
                                        "text-sm text-foreground placeholder:text-muted-foreground/50 leading-relaxed",
                                        "focus-visible:ring-0 focus-visible:outline-none",
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey && !isMobile) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />

                                <div className="flex items-center justify-between pt-2 mt-2 border-t border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="h-9 w-10 sm:w-auto sm:px-3 border-border bg-muted/20 rounded-xl text-muted-foreground hover:bg-muted/30 transition-colors focus:ring-0 gap-2 flex items-center justify-center sm:justify-start">
                                                {(() => {
                                                    const config = CATEGORY_CONFIG[category as keyof typeof CATEGORY_CONFIG] || CATEGORY_CONFIG.OTHER;
                                                    const Icon = config.icon;
                                                    return (
                                                        <>
                                                            <Icon className="h-4 w-4" />
                                                            <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">{config.label}</span>
                                                        </>
                                                    );
                                                })()}
                                            </SelectTrigger>
                                            <SelectContent className="bg-popover border-border text-popover-foreground">
                                                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                                    <SelectItem key={key} value={key} className="text-[11px] font-bold">
                                                        <div className="flex items-center gap-2">
                                                            <config.icon className="h-3 w-3" />
                                                            <span>{config.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <span className={cn(
                                            "text-[10px] font-mono tabular-nums font-bold",
                                            isOverLimit ? "text-red-500" : charCount > MAX_CHARS * 0.8 ? "text-amber-500/70" : "text-muted-foreground/30"
                                        )}>
                                            {charCount}/{MAX_CHARS}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {editingId && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setEditingId(null); setContent(""); }}
                                                className="h-8 px-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={!content.trim() || postMutation.isPending || updateMutation.isPending || isOverLimit}
                                            className={cn(
                                                "h-9 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.98]",
                                                content.trim() && !isOverLimit
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                                            )}
                                        >
                                            {postMutation.isPending || updateMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="h-3.5 w-3.5 mr-2" />
                                                    {editingId ? "Update" : "Send"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {!isMobile && (
                                <div className="flex items-center justify-center gap-1.5 mt-3 opacity-30">
                                    <span className="text-[10px] text-white">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[9px] mx-0.5">Enter</kbd>
                                        to submit
                                        <span className="mx-1.5">•</span>
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[9px] mx-0.5">Shift+Enter</kbd>
                                        for new line
                                    </span>
                                </div>
                            )}

                            <p className="text-[9px] text-white/10 text-center mt-3 tracking-wide">
                                Feedback visibility is influenced by community votes and trust score
                            </p>
                        </form>
                    </div>
                </div>
            </div>

            <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
                <DialogContent className="bg-[#14141a] border-white/[0.08] text-white sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg">What is the Feedback Wall?</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-white/60 space-y-4 py-4">
                        <p>This is a public space to share ideas, report issues, and suggest improvements for CodeStudio.</p>
                        <p>Feedback here helps us prioritize features and improve the platform based on real developer needs.</p>
                        <div className="pt-3 border-t border-white/[0.06]">
                            <p className="text-[11px] text-white/30 italic">Be constructive. Votes matter. Repeated spam may reduce trust score.</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowInfoModal(false)} variant="outline" className="w-full rounded-xl h-9 border-white/10 text-white/70">
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
                <DialogContent className="bg-[#14141a] border-white/[0.08] text-white sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Welcome to Feedback Wall</DialogTitle>
                        <DialogDescription className="text-white/40">Help shape the future of CodeStudio.</DialogDescription>
                    </DialogHeader>
                    <div className="text-sm text-white/60 space-y-3 py-4">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            </div>
                            <p><span className="text-white/80 font-medium">Request features</span> that would make your workflow better</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Bug className="h-3.5 w-3.5 text-red-400" />
                            </div>
                            <p><span className="text-white/80 font-medium">Report bugs</span> so we can fix them quickly</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <ThumbsUp className="h-3.5 w-3.5 text-blue-400" />
                            </div>
                            <p><span className="text-white/80 font-medium">Upvote ideas</span> to help us prioritize the roadmap</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowWelcome(false)} className="w-full rounded-xl h-10">Start Contributing</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
