import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Send, ThumbsUp, ThumbsDown, Loader2, Sparkles, Zap, Bug, Layout, MessageCircleCode, CheckCircle2, ArrowDown, Info, Clock, Lock, Pin, FileText, MoreHorizontal, Eye, EyeOff, ChevronLeft } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        color: "text-red-400/80 bg-red-500/10 border-red-500/20",
        tooltip: "Something is broken or not working as expected"
    },
    UX: {
        icon: Layout,
        label: "UX Issue",
        color: "text-pink-400/80 bg-pink-500/10 border-pink-500/20",
        tooltip: "Usability, design, or experience feedback"
    },
    FEATURE: {
        icon: Sparkles,
        label: "Feature Request",
        color: "text-emerald-400/80 bg-emerald-500/10 border-emerald-500/20",
        tooltip: "New functionality or improvement request"
    },
    PERFORMANCE: {
        icon: Zap,
        label: "Performance",
        color: "text-amber-400/80 bg-amber-500/10 border-amber-500/20",
        tooltip: "Speed, latency, or optimization issues"
    },
    OTHER: {
        icon: MessageCircleCode,
        label: "General",
        color: "text-blue-400/80 bg-blue-500/10 border-blue-500/20",
        tooltip: "General feedback or suggestions"
    }
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon?: any }> = {
    OPEN: { label: "Open", color: "bg-white/5 text-white/50 border-white/10" },
    REVIEWING: { label: "Under Review", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    PLANNED: { label: "Planned", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    SHIPPED: { label: "Shipped", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
    CLOSED: { label: "Closed", color: "bg-white/5 text-white/30 border-white/5" }
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
    const { celebrate } = useBadgeCelebration();

    useEffect(() => {
        const hasVisited = localStorage.getItem("hasVisitedFeedbackWall");
        if (!hasVisited) {
            setShowWelcome(true);
            localStorage.setItem("hasVisitedFeedbackWall", "true");
        }
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
            <div className="flex flex-col h-full bg-gradient-to-b from-[#0c0c0e] to-[#0a0a0c] overflow-hidden">

                {/* Header - More Compact */}
                <header className="flex-shrink-0 px-6 py-4 border-b border-white/[0.04] bg-[#0c0c0e]/95 backdrop-blur-xl sticky top-0 z-50">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isMobile && (
                                    <button
                                        onClick={() => navigate(-1)}
                                        className="p-1.5 rounded-full hover:bg-white/10 text-white/70"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                )}
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-base font-bold text-white/90">Feedback Wall</h1>
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/20 uppercase tracking-tighter">
                                            Live
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-white/30 hidden sm:block">Help us shape the future of CodeStudio.</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-[10px] text-white/20 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">
                                    {messages.length} ENTRIES
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button onClick={() => setShowInfoModal(true)} className="p-1.5 rounded-full hover:bg-white/5 transition-colors">
                                            <Info className="h-4 w-4 text-white/20" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="bottom" className="bg-[#1a1a1e] border-white/10">Learn more</TooltipContent>
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
                                <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center">
                                    <MessageCircleCode className="h-7 w-7 text-white/10" />
                                </div>
                                <h3 className="text-base font-medium text-white/30 mb-1">No feedback yet.</h3>
                                <p className="text-sm text-white/15 mb-4">Be the first to help improve CodeStudio.</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-xs border-white/10 text-white/50 hover:text-white hover:bg-white/5"
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
                            // Safe status access
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
                                            ? "w-full" // Full width on mobile
                                            : "w-[85%] max-w-[700px] min-w-[320px]", // More space on desktop, less vertical sprawl
                                        isMe ? "ml-auto" : "mr-auto"
                                    )}>
                                        <div className={cn(
                                            "border transition-all shadow-sm",
                                            isMe
                                                ? "rounded-2xl rounded-tr-sm bg-primary/[0.08] border-primary/20"
                                                : cn(
                                                    "rounded-2xl rounded-tl-sm bg-white/[0.03] border-white/[0.06]",
                                                    msg.status === "SHIPPED" && "border-emerald-500/30 bg-emerald-500/[0.01]"
                                                )
                                        )}>
                                            {/* Card Header - Dense */}
                                            <div className="px-3.5 py-2 border-b border-white/[0.04]">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2.5 min-w-0">
                                                        <Avatar className="h-5 w-5 rounded-full border border-white/[0.08] flex-shrink-0">
                                                            <AvatarImage src={msg.user.image} />
                                                            <AvatarFallback className="text-[8px] font-semibold bg-white/[0.04] text-white/40">
                                                                {msg.user.username[0]?.toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-xs font-medium text-white/50 truncate">
                                                            {isMe ? "You" : msg.user.username}
                                                        </span>
                                                        <span className="text-[10px] text-white/20 font-mono">
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


                                                    {/* Status & Category Badges */}
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
                                                    {msg.isAck && (
                                                        <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-1.5">
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400/70" />
                                                            <span className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider">
                                                                Acknowledged by team
                                                            </span>
                                                        </div>
                                                    )}
                                                    {/* Shipped Logic - Special Styling */}
                                                    {msg.status === "SHIPPED" && msg.changelogId ? (
                                                        <a href={`/changelog#${msg.changelogId}`} className="block mt-4">
                                                            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 hover:bg-emerald-500/10 transition-colors group">
                                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-colors">
                                                                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-xs font-medium text-emerald-400/90 mb-0.5">Shipped in Production</div>
                                                                    <div className="text-[10px] text-emerald-400/50 flex items-center gap-1">
                                                                        View Changelog <FileText className="h-3 w-3" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </a>
                                                    ) : msg.isLocked && msg.status === "SHIPPED" ? (
                                                        <div className="mt-3 pt-2 text-[10px] text-emerald-400/60 flex items-center gap-1.5 font-medium border-t border-emerald-500/10">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            This feature has been shipped!
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </div>

                                            {/* Feedback Content - Compact */}
                                            <div className="px-3.5 py-1.5 text-[13px] text-white/80 leading-snug break-words">
                                                <div className="prose prose-invert prose-sm max-w-none prose-p:my-0.5 prose-headings:my-1 prose-ul:my-0.5 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                    >
                                                        {msg.content}
                                                    </ReactMarkdown>
                                                </div>
                                            </div>

                                            {/* Card Footer - Action Area */}
                                            <div className="px-3 py-1.5 border-t border-white/[0.04] flex items-center gap-1">
                                                {/* Locked State */}
                                                {msg.isLocked ? (
                                                    <div className="flex items-center gap-2 text-[10px] text-white/20 font-medium px-2 py-1">
                                                        <Lock className="h-3 w-3" />
                                                        Thread Locked
                                                    </div>
                                                ) : (
                                                    <>
                                                        {/* Upvote */}
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
                                                                            : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06] hover:text-white/60",
                                                                        user?.role !== 'ADMIN' && "opacity-50 cursor-not-allowed"
                                                                    )}
                                                                >
                                                                    <ThumbsUp className={cn(isMobile ? "h-4 w-4" : "h-3.5 w-3.5", msg.hasReacted && "fill-current")} />
                                                                    <span>{msg.upvotes}</span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-[#1a1a1e] border-white/10 text-white/80">
                                                                <p className="text-xs">{user?.role === 'ADMIN' ? 'Support this idea' : 'Voting restricted to admins'}</p>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        {/* Downvote */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    onClick={() => user?.role === 'ADMIN' && disagreeMutation.mutate(msg.id)}
                                                                    disabled={user?.role !== 'ADMIN'}
                                                                    className={cn(
                                                                        "flex items-center gap-1.5 text-[11px] font-medium h-7 px-2.5 rounded-lg transition-all",
                                                                        msg.hasDisagreed
                                                                            ? "bg-red-500/15 text-red-400 border border-red-500/20"
                                                                            : "bg-white/[0.03] text-white/40 border border-transparent hover:bg-white/[0.06] hover:text-white/60",
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

                                                        {/* Discuss (Disabled - Coming Soon) */}
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <button
                                                                    disabled
                                                                    className="flex items-center gap-1.5 text-[11px] font-medium h-7 px-2.5 rounded-lg bg-white/[0.02] text-white/20 border border-transparent ml-auto cursor-not-allowed"
                                                                >
                                                                    <Clock className="h-3 w-3" />
                                                                    <span>Discuss</span>
                                                                </button>
                                                            </TooltipTrigger>
                                                            <TooltipContent side="top" className="bg-[#1a1a1e] border-white/10 text-white/80 max-w-[220px]">
                                                                <p className="text-xs font-medium mb-1">Discussions coming soon</p>
                                                                <p className="text-[10px] text-white/50">This will allow threaded conversations on feedback.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
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

                {/* Scroll to Bottom */}
                {
                    !shouldAutoScroll && (
                        <div className="absolute bottom-40 left-1/2 -translate-x-1/2 z-40">
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 px-3 rounded-full bg-[#1a1a1e]/90 border-white/10 text-white/60 backdrop-blur-md shadow-xl hover:bg-[#1a1a1e] hover:text-white"
                                onClick={() => {
                                    setShouldAutoScroll(true);
                                    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
                                }}
                            >
                                <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
                                New feedback
                            </Button>
                        </div>
                    )
                }

                {/* Input Area - Modern Professional Design */}
                <div className="border-t border-white/[0.06] bg-gradient-to-t from-[#0a0a0c] to-[#0c0c0e] backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto px-6 py-5">
                        <form onSubmit={handleSubmit}>
                            {/* Main Input Card */}
                            <div className="bg-[#151518] border border-white/[0.06] rounded-2xl p-4 shadow-xl shadow-black/20">
                                {/* Textarea */}
                                <Textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Describe a bug, request a feature, or share feedback…"
                                    className={cn(
                                        "min-h-[80px] max-h-[160px] p-0 bg-transparent border-0 resize-none",
                                        "text-sm text-white/90 placeholder:text-white/30 leading-relaxed",
                                        "focus-visible:ring-0 focus-visible:outline-none",
                                    )}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSubmit(e);
                                        }
                                    }}
                                />

                                {/* Bottom Bar */}
                                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.06]">
                                    {/* Left: Category + Character Count */}
                                    <div className="flex items-center gap-3">
                                        <Select value={category} onValueChange={setCategory}>
                                            <SelectTrigger className="h-9 px-3 border-white/[0.08] bg-white/[0.03] rounded-lg text-xs font-medium text-white/60 hover:bg-white/[0.06] hover:text-white/80 transition-colors focus:ring-1 focus:ring-primary/30 gap-2 min-w-[130px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#1a1a1e] border-white/10 text-white">
                                                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                                    <SelectItem key={key} value={key} className="text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <config.icon className="h-3.5 w-3.5" />
                                                            <span>{config.label}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="h-4 w-px bg-white/[0.06]" />

                                        <span className={cn(
                                            "text-[11px] font-mono tabular-nums",
                                            isOverLimit ? "text-red-400" : charCount > MAX_CHARS * 0.8 ? "text-amber-400/70" : "text-white/25"
                                        )}>
                                            {charCount}/{MAX_CHARS}
                                        </span>
                                    </div>

                                    {/* Right: Submit Button */}
                                    <div className="flex items-center gap-2">
                                        {editingId && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { setEditingId(null); setContent(""); }}
                                                className="h-9 px-3 text-xs text-white/40 hover:text-white"
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={!content.trim() || postMutation.isPending || updateMutation.isPending || isOverLimit}
                                            className={cn(
                                                "h-9 px-4 rounded-lg font-medium text-sm transition-all active:scale-[0.98]",
                                                content.trim() && !isOverLimit
                                                    ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                                                    : "bg-white/[0.05] text-white/30 cursor-not-allowed"
                                            )}
                                        >
                                            {postMutation.isPending || updateMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Send className="h-3.5 w-3.5 mr-2" />
                                                    {editingId ? "Update" : "Submit"}
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Helper Text - Desktop only */}
                            {!isMobile && (
                                <div className="flex items-center justify-center gap-1.5 mt-3">
                                    <span className="text-[10px] text-white/20">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[9px] mx-0.5">Enter</kbd>
                                        to submit
                                        <span className="mx-1.5">•</span>
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] font-mono text-[9px] mx-0.5">Shift+Enter</kbd>
                                        for new line
                                    </span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>

            {/* Footer Transparency Note */}
            <div className="border-t border-white/[0.03] bg-[#08080a] px-6 py-2">
                <p className="text-[9px] text-white/15 text-center max-w-4xl mx-auto tracking-wide">
                    Feedback visibility is influenced by community votes and trust score
                </p>
            </div>

            {/* Info Modal */}
            <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
                <DialogContent className="bg-[#14141a] border-white/[0.08] text-white sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg">What is the Feedback Wall?</DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-white/60 space-y-4 py-4">
                        <p>
                            This is a public space to share ideas, report issues, and suggest improvements for CodeStudio.
                        </p>
                        <p>
                            Feedback here helps us prioritize features and improve the platform based on real developer needs.
                        </p>
                        <div className="pt-3 border-t border-white/[0.06]">
                            <p className="text-[11px] text-white/30 italic">
                                Be constructive. Votes matter. Repeated spam may reduce trust score.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setShowInfoModal(false)} variant="outline" className="w-full rounded-xl h-9 border-white/10 text-white/70">
                            Got it
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Welcome Dialog */}
            <Dialog open={showWelcome} onOpenChange={setShowWelcome}>
                <DialogContent className="bg-[#14141a] border-white/[0.08] text-white sm:max-w-md rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg">Welcome to Feedback Wall</DialogTitle>
                        <DialogDescription className="text-white/40">
                            Help shape the future of CodeStudio.
                        </DialogDescription>
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
                        <Button onClick={() => setShowWelcome(false)} className="w-full rounded-xl h-10">
                            Start Contributing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
