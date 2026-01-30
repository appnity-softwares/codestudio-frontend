import { Heart, ThumbsDown, Share2, MessageCircle, GitFork } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { snippetsAPI } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { setSnippetReaction, updateReactionOptimistically } from "@/store/slices/snippetSlice";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type InteractionProps = {
    snippet: any;
    className?: string;
    onCommentClick?: () => void;
    onShareClick?: () => void;
};

export function SnippetInteraction({ snippet, className, onShareClick }: InteractionProps) {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const reduxViewerReaction = useSelector((state: RootState) => state.snippets.viewerReactions[snippet.id]);
    const reduxLikesCount = useSelector((state: RootState) => state.snippets.likesCounts[snippet.id]);
    const reduxDislikesCount = useSelector((state: RootState) => state.snippets.dislikesCounts[snippet.id]);

    const isLiked = reduxViewerReaction === 'like';
    const isDisliked = reduxViewerReaction === 'dislike';
    const likeCount = reduxLikesCount ?? snippet.likesCount ?? 0;
    const dislikeCount = reduxDislikesCount ?? snippet.dislikesCount ?? 0;

    // Sync Initial State
    useEffect(() => {
        if (snippet.id && reduxViewerReaction === undefined) {
            dispatch(setSnippetReaction({
                id: snippet.id,
                reaction: snippet.viewerReaction || null,
                likesCount: snippet.likesCount || 0,
                dislikesCount: snippet.dislikesCount || 0
            }));
        }
    }, [snippet.id, reduxViewerReaction, snippet.viewerReaction, snippet.likesCount, snippet.dislikesCount, dispatch]);

    const reactionMutation = useMutation({
        mutationFn: (reaction: 'like' | 'dislike') => {
            if (!isAuthenticated) throw new Error("LOGIN_REQUIRED");
            return snippetsAPI.react(snippet.id, reaction);
        },
        onMutate: (reaction) => {
            if (!isAuthenticated) return;
            dispatch(updateReactionOptimistically({ id: snippet.id, reaction }));
        },
        onError: (err: any) => {
            if (err.message === "LOGIN_REQUIRED") {
                toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to react." });
                return;
            }
            queryClient.invalidateQueries({ queryKey: ['snippet', snippet.id] });
            toast({ variant: "destructive", title: "Action failed", description: "Identity sync interrupted." });
        }
    });

    const forkMutation = useMutation({
        mutationFn: () => {
            if (!isAuthenticated) throw new Error("LOGIN_REQUIRED");
            return snippetsAPI.fork(snippet.id);
        },
        onSuccess: (data) => {
            toast({ title: "Snippet Forked!", description: "You now have your own copy." });
            window.location.href = `/snippets/${data.snippet.id}`;
        },
        onError: (err: any) => {
            if (err.message === "LOGIN_REQUIRED") {
                toast({ variant: "destructive", title: "Login Required", description: "You need to be logged in to fork." });
                return;
            }
            toast({ variant: "destructive", title: "Fork failed", description: err.message });
        }
    });

    return (
        <TooltipProvider>
            <div className={cn("flex items-center gap-4 w-full", className)}>
                <div className="flex items-center gap-1 sm:gap-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => reactionMutation.mutate('like')}
                                disabled={reactionMutation.isPending}
                                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border", isLiked ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground")}
                            >
                                <Heart className={cn("h-3.5 w-3.5 transition-transform active:scale-95", isLiked && "fill-current")} />
                                <span>{likeCount}</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Like this snippet</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => reactionMutation.mutate('dislike')}
                                disabled={reactionMutation.isPending}
                                className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 border", isDisliked ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted hover:text-foreground")}
                            >
                                <ThumbsDown className={cn("h-3.5 w-3.5 transition-transform active:scale-95", isDisliked && "fill-current")} />
                                <span>{dislikeCount}</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Dislike this snippet</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => forkMutation.mutate()}
                                disabled={forkMutation.isPending}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent"
                            >
                                <GitFork className={cn("h-3.5 w-3.5", forkMutation.isPending && "animate-spin")} />
                                <span>{forkMutation.isPending ? 'Forking...' : 'Fork'}</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Create your own copy</TooltipContent>
                    </Tooltip>

                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent">
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Discuss</span>
                    </button>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => {
                                    if (onShareClick) onShareClick();
                                    else {
                                        navigator.clipboard.writeText(window.location.href);
                                        toast({ title: "Link copied!" });
                                    }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-transparent"
                            >
                                <Share2 className="h-3.5 w-3.5" />
                                <span>Share</span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Share snippet</TooltipContent>
                    </Tooltip>
                </div>
            </div>
        </TooltipProvider>
    );
}
