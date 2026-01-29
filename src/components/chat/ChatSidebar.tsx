import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { HamsterLoader } from "@/components/shared/HamsterLoader";

interface ChatSidebarProps {
    className?: string;
}

export function ChatSidebar({ className }: ChatSidebarProps) {
    const { user } = useAuth();
    const { activeContact, setActiveContact } = useChat();
    const [searchTerm, setSearchTerm] = useState("");

    const { data: conversationData, isLoading } = useQuery({
        queryKey: ['conversations'],
        queryFn: messagesAPI.getConversations,
        enabled: !!user,
        refetchInterval: 5000,
    });

    const conversations = conversationData?.conversations || [];

    const filteredConversations = conversations.filter((conv: any) =>
        (conv.user.username || conv.user.name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
            <div className="p-4 border-b border-border/40">
                <h2 className="text-xl font-bold mb-4">Messages</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search conversations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-muted/50 border-transparent focus:bg-background transition-colors"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <HamsterLoader size={12} />
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-30">Retrieving_Buffers</p>
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                        <p>No conversations found.</p>
                    </div>
                ) : (
                    <div className="p-3 space-y-1">
                        {filteredConversations.map((conv: any) => (
                            <button
                                key={conv.user.id}
                                onClick={() => setActiveContact(conv)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 text-left group",
                                    activeContact?.user?.id === conv.user.id
                                        ? "bg-primary/10 hover:bg-primary/15"
                                        : "hover:bg-muted/50"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <Avatar className="h-12 w-12 border border-border/50 shadow-sm">
                                        <AvatarImage src={conv.user.image} />
                                        <AvatarFallback>{(conv.user.username?.[0] || '?').toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    {/* Online indicator mock - pending real-time status */}
                                    <span className={cn(
                                        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                                        "bg-emerald-500" // Assume online for demo or if active recently
                                    )} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className={cn(
                                            "font-semibold text-sm truncate",
                                            activeContact?.user?.id === conv.user.id ? "text-primary" : "text-foreground"
                                        )}>
                                            {conv.user.username}
                                        </span>
                                        {conv.lastMessage && (
                                            <span className="text-[10px] text-muted-foreground tabular-nums opacity-70">
                                                {formatDistanceToNow(new Date(conv.lastMessage.CreatedAt), { addSuffix: false })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className={cn(
                                            "text-xs truncate max-w-[140px]",
                                            conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"
                                        )}>
                                            {conv.lastMessage?.SenderID === user?.id && <span className="opacity-70 mr-1">You:</span>}
                                            {conv.lastMessage?.Content || "No messages yet"}
                                        </p>
                                        {conv.unreadCount > 0 && (
                                            <span className="h-5 min-w-[1.25rem] px-1 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
