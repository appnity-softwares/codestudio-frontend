"use client";

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
// import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
// import { snippetsAPI } from "@/lib/api";


type InteractionProps = {
    snippet: any;
    className?: string;
    onCommentClick?: () => void;
    onShareClick?: (e?: MouseEvent) => void;
};

export function SnippetInteraction({ snippet, className, onShareClick }: InteractionProps) {
    // const { isAuthenticated } = useAuth();
    const { toast } = useToast();

    // const [isLiked, setIsLiked] = useState(snippet.isLiked ?? false);
    // const [likeCount, setLikeCount] = useState(snippet.likeCount || 0);
    // const [isSaved, setIsSaved] = useState(snippet.isSaved ?? false);

    // Instagram style icons are usually outlines unless active
    /*
    const handleLike = async () => {
        if (!isAuthenticated) return toast({ variant: "destructive", title: "Authentication required" });

        setIsLiked(!isLiked);
        setLikeCount((prev: number) => isLiked ? prev - 1 : prev + 1); // Optimistic update

        try {
            await snippetsAPI.like(snippet.id);
        } catch (e) {
            setIsLiked(isLiked); // Revert
            setLikeCount((prev: number) => isLiked ? prev + 1 : prev - 1); // Revert count
        }
    };

    const handleSave = async () => {
        if (!isAuthenticated) return toast({ variant: "destructive", title: "Authentication required" });
        setIsSaved(!isSaved);
        try { await snippetsAPI.save(snippet.id); } catch (e) { setIsSaved(isSaved); }
    };
    */

    return (
        <div className={cn("flex justify-between items-center w-full", className)}>
            <div className="flex items-center gap-6">
                {/* Share Button (Active) */}
                <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="group relative transition-all duration-300 focus:outline-none flex items-center gap-2"
                    onClick={() => {
                        if (onShareClick) {
                            onShareClick();
                        } else {
                            navigator.clipboard.writeText(`${window.location.origin}/snippets/${snippet.id}`);
                            toast({ title: "Link copied!", description: "Share this snippet with others." });
                        }
                    }}
                >
                    <div className="absolute -inset-2 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors relative" />
                    <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors">Share</span>
                </motion.button>
            </div>

            {/* Disabled Interactions Placeholder */}
            {/* Comments and Likes disabled for MVP */}
        </div>
    );
}
