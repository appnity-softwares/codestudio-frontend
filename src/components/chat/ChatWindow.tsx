import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ChevronLeft, Send, Loader2, Phone, Video, MoreVertical, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";

interface ChatWindowProps {
    className?: string;
    onBack?: () => void;
}

export function ChatWindow({ className, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const { activeContact } = useChat();
    const { socket } = useSocket();
    const queryClient = useQueryClient();

    const [messageInput, setMessageInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    // const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch Messages
    const { data: messagesData, isLoading } = useQuery({
        queryKey: ['messages', activeContact?.user?.id],
        queryFn: () => messagesAPI.getMessages(activeContact.user.id),
        enabled: !!activeContact,
        // Short poll as fallback to sockets
        refetchInterval: 5000,
    });

    const messages = messagesData?.messages || [];

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeContact]);

    // mark as read when contact changes or new message arrives
    useEffect(() => {
        if (activeContact?.user?.id) {
            messagesAPI.markAsRead(activeContact.user.id);
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    }, [activeContact, messages, queryClient]);

    // Socket Listeners
    useEffect(() => {
        if (!socket || !activeContact) return;

        const handleNewMessage = (data: any) => {
            const msg = data.message || data;
            // Only handle if message belongs to this conversation
            if (msg.SenderID === activeContact.user.id || msg.RecipientID === activeContact.user.id ||
                msg.senderId === activeContact.user.id || msg.receiverId === activeContact.user.id) {

                queryClient.setQueryData(['messages', activeContact.user.id], (old: any) => {
                    const oldMessages = old?.messages || [];
                    // Avoid duplicates
                    if (oldMessages.find((m: any) => (m.ID || m.id) === (msg.ID || msg.id))) return old;
                    return { ...old, messages: [...oldMessages, msg] };
                });

                // Mark read if it's from the other person
                if (msg.senderId === activeContact.user.id || msg.SenderID === activeContact.user.id) {
                    messagesAPI.markAsRead(activeContact.user.id);
                }
            }
        };

        const handleTyping = (data: any) => {
            if (data.userId === activeContact.user.id) {
                setIsTyping(true);
                // Clear typing after 3s
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        const handleReadStatus = (data: any) => {
            if (data.senderId === activeContact.user.id) {
                // The other person read MY messages
                queryClient.setQueryData(['messages', activeContact.user.id], (old: any) => {
                    const oldMessages = old?.messages || [];
                    return {
                        ...old,
                        messages: oldMessages.map((m: any) => ({ ...m, isRead: true, IsRead: true }))
                    };
                });
            }
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('user_typing', handleTyping);
        socket.on('message_read', handleReadStatus);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('user_typing', handleTyping);
            socket.off('message_read', handleReadStatus);
        };
    }, [socket, activeContact, queryClient]);

    // Send Mutation
    const sendMessageMutation = useMutation({
        mutationFn: async () => {
            if (!messageInput.trim() || !activeContact) return;
            return await messagesAPI.sendMessage(activeContact.user.id, messageInput);
        },
        onSuccess: (response: any) => {
            const newMsg = response.message || response;
            setMessageInput("");
            if (newMsg) {
                queryClient.setQueryData(['messages', activeContact.user.id], (old: any) => ({
                    messages: [...(old?.messages || []), newMsg]
                }));
            }
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessageMutation.mutate();
    };

    const handleTypingInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);

        if (socket && activeContact) {
            socket.emit('typing', { recipientId: activeContact.user.id });
        }
    };

    if (!activeContact) {
        return (
            <div className={cn("flex flex-col items-center justify-center h-full bg-background/50 text-muted-foreground", className)}>
                <div className="bg-muted/30 p-6 rounded-full mb-4 animate-in zoom-in-50 duration-500">
                    <MessageSquare className="h-12 w-12 opacity-50" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Your Messages</h3>
                <p className="max-w-xs text-center opacity-70">Select a conversation from the sidebar to start chatting securely.</p>
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full bg-background", className)}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/40 bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="icon" onClick={onBack} className="mr-[-8px] text-muted-foreground md:hidden">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    )}
                    <Avatar className="h-10 w-10 border border-border">
                        <AvatarImage src={activeContact.user.image} />
                        <AvatarFallback>{(activeContact.user.username?.[0] || '?').toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h3 className="font-bold text-sm">{activeContact.user.username}</h3>
                        <div className="flex items-center gap-1.5 h-4">
                            {isTyping ? (
                                <span className="text-[10px] text-primary animate-pulse font-medium">typing...</span>
                            ) : (
                                <span className="text-[10px] text-muted-foreground">Online</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar bg-[url('/grid.svg')] bg-fixed" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex flex-col gap-6 w-full py-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className={cn("flex w-full", i % 2 === 0 ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "h-16 w-48 rounded-2xl animate-pulse",
                                    i % 2 === 0 ? "bg-primary/20 rounded-tr-sm" : "bg-muted/40 rounded-tl-sm"
                                )} />
                            </div>
                        ))}
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
                        <p className="text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    messages.map((msg: any) => {
                        const isMe = msg.SenderID === user?.id || msg.senderId === user?.id;
                        // Grouping logic could go here (chk prev message sender)
                        return (
                            <div key={msg.ID || msg.id} className={cn("flex w-full animate-in slide-in-from-bottom-2 duration-300", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-[70%] sm:max-w-[60%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                    isMe
                                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                                        : "bg-card border border-border rounded-tl-sm"
                                )}>
                                    <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.Content || msg.content}</p>
                                    <div className={cn("text-[10px] mt-1 opacity-50 flex items-center gap-1", isMe ? "justify-end text-primary-foreground/70" : "justify-start text-muted-foreground")}>
                                        {formatDistanceToNow(new Date(msg.CreatedAt || msg.createdAt), { addSuffix: true })}
                                        {isMe && (
                                            <span className="text-xs">
                                                {(msg.IsRead || msg.isRead) ? "✓✓" : "✓"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Input */}
            <div className="p-4 bg-card border-t border-border/40">
                <form onSubmit={handleSend} className="relative flex items-end gap-2 max-w-4xl mx-auto">
                    <Input
                        value={messageInput}
                        onChange={handleTypingInput}
                        placeholder={`Message ${activeContact.user.username}...`}
                        className="pr-12 min-h-[50px] py-3 bg-muted/30 border-transparent focus:bg-background focus:border-border transition-all shadow-sm rounded-xl resize-none"
                    />
                    <Button
                        size="icon"
                        type="submit"
                        disabled={!messageInput.trim() || sendMessageMutation.isPending}
                        className="absolute right-2 bottom-1.5 h-9 w-9 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                        {sendMessageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
