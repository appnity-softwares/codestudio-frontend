import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface StoryPage {
    mediaUrl?: string;
    text?: string;
    type: 'image' | 'video' | 'text';
}

interface Story {
    id: string;
    author: {
        id: string;
        username: string;
        image: string;
    };
    pages?: StoryPage[]; // Multi-page support
    mediaUrl?: string; // Legacy support
    text?: string;     // Legacy support
    createdAt: string;
}

interface StoryViewerProps {
    stories: Story[];
    initialStoryIndex: number;
    onClose: () => void;
}

export function StoryViewer({ stories, initialStoryIndex, onClose }: StoryViewerProps) {
    const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const currentStory = stories[currentStoryIndex];

    // Normalize pages: If no `pages` array, use legacy `mediaUrl`/`text` as a single page
    const pages: StoryPage[] = currentStory.pages || [
        {
            mediaUrl: currentStory.mediaUrl,
            text: currentStory.text,
            type: currentStory.mediaUrl ? 'image' : 'text'
        }
    ];

    const currentPage = pages[currentPageIndex];
    const STORY_DURATION = 5000; // 5 seconds per page

    const handleNext = useCallback(() => {
        if (currentPageIndex < pages.length - 1) {
            // Next page in same story
            setCurrentPageIndex(prev => prev + 1);
            setProgress(0);
        } else if (currentStoryIndex < stories.length - 1) {
            // Next story
            setCurrentStoryIndex(prev => prev + 1);
            setCurrentPageIndex(0);
            setProgress(0);
        } else {
            // All done
            onClose();
        }
    }, [currentPageIndex, pages.length, currentStoryIndex, stories.length, onClose]);

    const handlePrev = useCallback(() => {
        if (currentPageIndex > 0) {
            // Previous page in same story
            setCurrentPageIndex(prev => prev - 1);
            setProgress(0);
        } else if (currentStoryIndex > 0) {
            // Previous story
            setCurrentStoryIndex(prev => prev - 1);
            // Go to last page of previous story
            const prevStory = stories[currentStoryIndex - 1];
            const prevPages = prevStory.pages || [{ mediaUrl: prevStory.mediaUrl, text: prevStory.text, type: prevStory.mediaUrl ? 'image' : 'text' }];
            setCurrentPageIndex(prevPages.length - 1);
            setProgress(0);
        }
    }, [currentPageIndex, currentStoryIndex, stories]);

    // Timer logic
    useEffect(() => {
        if (isPaused) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                const next = prev + (100 / (STORY_DURATION / 100));
                if (next >= 100) {
                    handleNext();
                    return 0;
                }
                return next;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [handleNext, isPaused]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center">
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-50">
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/10 rounded-full">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Main Viewer Container */}
            <div className="relative w-full max-w-[450px] aspect-[9/16] bg-black rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10">

                {/* Progress Bars */}
                <div className="absolute top-4 left-4 right-4 z-20 flex gap-1">
                    {pages.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: idx < currentPageIndex ? "100%" : "0%" }}
                                animate={{ width: idx < currentPageIndex ? "100%" : (idx === currentPageIndex ? `${progress}%` : "0%") }}
                                transition={{ ease: "linear", duration: idx === currentPageIndex ? 0.1 : 0 }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="absolute top-8 left-4 right-4 z-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 ring-2 ring-white/20">
                            <AvatarImage src={currentStory.author.image} />
                            <AvatarFallback>{currentStory.author.username[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-white shadow-black drop-shadow-md">{currentStory.author.username}</span>
                            <span className="text-[10px] text-white/60">{formatDistanceToNow(new Date(currentStory.createdAt))} ago</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div
                    className="absolute inset-0 z-10 bg-zinc-900 flex items-center justify-center cursor-pointer"
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    {/* Navigation Areas */}
                    <div className="absolute inset-y-0 left-0 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
                    <div className="absolute inset-y-0 right-0 w-1/3 z-20" onClick={(e) => { e.stopPropagation(); handleNext(); }} />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${currentStory.id}-${currentPageIndex}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-full relative"
                        >
                            {currentPage.mediaUrl && (
                                <img
                                    src={currentPage.mediaUrl}
                                    alt="Story"
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Overlay Gradient for Text readability */}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

                            {/* Text Content */}
                            {currentPage.text && (
                                <div className="absolute inset-0 flex items-center justify-center p-8">
                                    <p className={cn(
                                        "text-white font-bold text-center leading-relaxed drop-shadow-lg",
                                        currentPage.mediaUrl ? "text-xl" : "text-3xl bg-gradient-to-br from-indigo-500 to-purple-500 bg-clip-text text-transparent"
                                    )}>
                                        {currentPage.text}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer / Interactive */}
                <div className="absolute bottom-6 left-4 right-4 z-20 flex gap-4 items-center">
                    <Input
                        placeholder="Send a message..."
                        className="h-12 rounded-full bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-0 backdrop-blur-md"
                    />
                    <Button size="icon" className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md shrink-0">
                        <Heart className="h-6 w-6 text-white" />
                    </Button>
                    <Button size="icon" className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md shrink-0">
                        <Send className="h-5 w-5 text-white" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
