import { useState, useEffect } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { storiesAPI } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { StoryViewer } from "./StoryViewer";

export function Stories() {
    const { user } = useAuth();
    const [stories, setStories] = useState<any[]>([]);
    const [authorsWithStories, setAuthorsWithStories] = useState<any[]>([]);
    const [viewingStoryIndex, setViewingStoryIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const data = await storiesAPI.getAll();
                const groupedMap = new Map<string, any[]>();
                data.stories.forEach((s: any) => {
                    if (!groupedMap.has(s.authorId)) groupedMap.set(s.authorId, []);
                    groupedMap.get(s.authorId)?.push(s);
                });

                const flatSorted: any[] = [];
                const authors: any[] = [];

                groupedMap.forEach((userStories) => {
                    // Sort user's stories by time
                    userStories.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                    flatSorted.push(...userStories);
                    authors.push(userStories[0].author); // Use first story's author data
                });

                setStories(flatSorted);
                setAuthorsWithStories(authors);
            } catch (error) {
                console.error("Failed to fetch stories:", error);
            }
        };
        fetchStories();
    }, []);

    const handleStoryClick = (authorId: string) => {
        // Find the index of the first story by this author
        const index = stories.findIndex(s => s.authorId === authorId);
        if (index !== -1) {
            setViewingStoryIndex(index);
        }
    };

    return (
        <div className="w-full relative z-10 mb-6">
            <ScrollArea className="w-full whitespace-nowrap pt-4 pb-2">
                <div className="flex w-max space-x-6 px-4 pb-4 items-center">
                    {/* Your Story (Create) */}
                    <div className="flex flex-col items-center gap-3 cursor-pointer group">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative"
                        >
                            <div className="relative p-[3px] rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-zinc-700 to-zinc-900 opacity-50" />
                                <div className="bg-background rounded-full p-[3px] relative z-10">
                                    <Avatar className="h-[70px] w-[70px] border-2 border-background shadow-xl">
                                        <AvatarImage src={user?.image || undefined} className="object-cover" />
                                        <AvatarFallback className="bg-zinc-800 text-zinc-400 font-bold">
                                            {user?.username?.[0]?.toUpperCase() || "ME"}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-blue-500 text-white rounded-full p-1.5 border-[3px] border-black shadow-lg z-20">
                                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                            </div>
                        </motion.div>
                        <span className="text-[11px] text-zinc-400 group-hover:text-white font-medium transition-colors tracking-wide">
                            Your Story
                        </span>
                    </div>

                    {/* Other Users' Stories */}
                    {authorsWithStories.map((author, index) => {
                        if (author.id === user?.id) return null; // Skip self in peer list
                        return (
                            <motion.div
                                key={author.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex flex-col items-center gap-3 cursor-pointer group"
                                onClick={() => handleStoryClick(author.id)}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative p-[3px] rounded-full"
                                >
                                    {/* Animated Gradient Ring */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 animate-gradient-xy opacity-80 group-hover:opacity-100 blur-[1px] transition-opacity" />
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 opacity-40 blur-md group-hover:blur-lg transition-all" />

                                    <div className="bg-black rounded-full p-[3px] relative z-10">
                                        <Avatar className="h-[70px] w-[70px] border-2 border-black/50">
                                            <AvatarImage src={author.image} className="object-cover" />
                                            <AvatarFallback className="bg-zinc-800 text-zinc-400">
                                                {author.username?.[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </motion.div>
                                <span className="text-[11px] text-zinc-400 group-hover:text-white font-medium truncate max-w-[80px] transition-colors tracking-wide">
                                    {author.username}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>
                <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>

            {viewingStoryIndex !== null && (
                <StoryViewer
                    stories={stories}
                    initialStoryIndex={viewingStoryIndex}
                    onClose={() => setViewingStoryIndex(null)}
                />
            )}
        </div>
    );
}
