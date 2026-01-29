import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { messagesAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, User as UserIcon, Minimize2, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

import { useChat } from "@/context/ChatContext";
import { useSocket } from "@/context/SocketContext";
import { HamsterLoader } from "@/components/shared/HamsterLoader";
import { useToast } from "@/hooks/use-toast";

export function CipherChat() {
    const { user } = useAuth();
    const { socket } = useSocket();
    const location = useLocation();

    const { isOpen, setIsOpen, activeContact, setActiveContact } = useChat();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [messageInput, setMessageInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isTyping, setIsTyping] = useState(false);

    // Fetch Contacts (Active Conversations)
    const { data: conversationData, isLoading: loadingConversations } = useQuery({
        queryKey: ['conversations'],
        queryFn: messagesAPI.getConversations,
        enabled: !!user && isOpen,
        // No polling, relying on socket events to invalidate
    });

    // Fetch Messages for active contact
    const { data: messagesData, isLoading: loadingMessages } = useQuery({
        queryKey: ['messages', activeContact?.user?.id],
        queryFn: () => messagesAPI.getMessages(activeContact.user.id),
        enabled: !!activeContact && isOpen,
        // No polling
    });

    const conversations = conversationData?.conversations || [];
    const messages = messagesData?.messages || [];

    // Socket Listeners for Real-time
    useEffect(() => {
        if (!socket || !user) return;

        const handleNewMessage = (data: any) => {
            const msg = data.message || data;
            const otherId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
            const otherIDRaw = msg.SenderID === user.id ? msg.RecipientID : msg.SenderID;
            const finalOtherId = otherId || otherIDRaw;

            // 1. Update messages list if chat is open for this user
            if (activeContact?.user?.id === finalOtherId) {
                queryClient.setQueryData(['messages', finalOtherId], (old: any) => {
                    const oldMsgs = old?.messages || [];
                    if (oldMsgs.find((m: any) => (m.ID || m.id) === (msg.ID || msg.id))) return old;
                    return { ...old, messages: [...oldMsgs, msg] };
                });

                // Mark as read if we are actively chatting
                if (isOpen && !isMinimized && msg.senderId !== user.id) {
                    messagesAPI.markAsRead(finalOtherId);
                }
            }

            // 2. Refresh conversations list for everyone to update unread badges
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        const handleTyping = (data: any) => {
            if (activeContact?.user?.id === data.userId) {
                setIsTyping(true);
                setTimeout(() => setIsTyping(false), 3000);
            }
        };

        const handleReadStatus = (data: any) => {
            if (activeContact?.user?.id === data.senderId) {
                queryClient.setQueryData(['messages', data.senderId], (old: any) => {
                    const oldMsgs = old?.messages || [];
                    return {
                        ...old,
                        messages: oldMsgs.map((m: any) => ({ ...m, isRead: true, IsRead: true }))
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
    }, [socket, activeContact, user, isOpen, isMinimized, queryClient]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Send Message Mutation
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
        },
        onError: (err: any) => {
            console.error("Failed to send message:", err);
            toast({
                title: "Transmission Error",
                description: "The secure channel experienced a glitch. Please retry.",
                variant: "destructive"
            });
        }
    });

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessageMutation.mutate();
    };

    const handleContactClick = (conversation: any) => {
        setActiveContact(conversation);
        if (conversation.unreadCount > 0) {
            messagesAPI.markAsRead(conversation.user.id);
            setTimeout(() => queryClient.invalidateQueries({ queryKey: ['conversations'] }), 500);
        }
    };

    const handleInputChange = (val: string) => {
        setMessageInput(val);
        if (socket && activeContact) {
            socket.emit('typing', { recipientId: activeContact.user.id });
        }
    };

    // Hide chat widget on dedicated messages page if on messages page or not logged in
    if (!user || location.pathname.startsWith('/messages')) return null;

    return (
        <div className="hidden md:flex fixed bottom-4 right-4 z-50 flex-col items-end pointer-events-none">
            {/* Toggle Button */}
            <div className="pointer-events-auto">
                <AnimatePresence>
                    {!isOpen && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setIsOpen(true)}
                            className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 group relative"
                        >
                            <MessageSquare className="h-6 w-6 fill-current" />
                            {/* Unread Badge Sum */}
                            {/* (We could calculate total unread here later) */}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1, height: isMinimized ? 'auto' : 500 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className={cn(
                            "pointer-events-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col w-[350px] sm:w-[380px] transition-all duration-300",
                            isMinimized ? "" : "h-[500px]"
                        )}
                    >
                        {/* Header */}
                        <div className="p-3 border-b border-border bg-muted/30 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                {activeContact && (
                                    <button onClick={() => setActiveContact(null)} className="mr-1 hover:bg-muted p-1 rounded-full">
                                        <X className="h-4 w-4 rotate-45" /> {/* Back Arrow simulation */}
                                    </button>
                                )}
                                <span className="font-headline font-bold text-sm">
                                    {activeContact ? (activeContact.user.username || 'Chat') : 'Cipher Messages'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground">
                                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                                </button>
                                <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-md text-muted-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <div className="flex-1 flex flex-col min-h-0 bg-background">
                                {activeContact ? (
                                    <>
                                        {/* Messages Area */}
                                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
                                            {loadingMessages ? (
                                                <div className="flex h-full items-center justify-center">
                                                    <HamsterLoader size={8} />
                                                </div>
                                            ) : messages.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 gap-2">
                                                    <MessageSquare className="h-8 w-8" />
                                                    <span className="text-xs">No messages yet</span>
                                                </div>
                                            ) : (
                                                <>
                                                    {messages.map((msg: any) => {
                                                        const isMe = msg.SenderID === user.id || msg.senderId === user.id;
                                                        return (
                                                            <div key={msg.ID || msg.id} className={cn("flex w-full", isMe ? "justify-end" : "justify-start")}>
                                                                <div className={cn(
                                                                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                                                                    isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted text-foreground rounded-tl-none"
                                                                )}>
                                                                    {msg.Content || msg.content}
                                                                    <div className={cn("text-[9px] mt-1 opacity-50 flex items-center gap-1", isMe ? "justify-end" : "justify-start")}>
                                                                        {(msg.CreatedAt || msg.createdAt) && !String(msg.CreatedAt || msg.createdAt).startsWith('0001') && !isNaN(new Date(msg.CreatedAt || msg.createdAt).getTime()) ? (
                                                                            formatDistanceToNow(new Date(msg.CreatedAt || msg.createdAt), { addSuffix: true })
                                                                        ) : null}
                                                                        {isMe && (
                                                                            <span className="text-[10px] ml-1">
                                                                                {(msg.IsRead || msg.isRead) ? "✓✓" : "✓"}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {isTyping && (
                                                        <div className="flex justify-start">
                                                            <div className="bg-muted text-muted-foreground rounded-2xl px-3 py-1 text-[10px] animate-pulse">
                                                                typing...
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Input Area */}
                                        <form onSubmit={handleSend} className="p-3 border-t border-border bg-muted/10 shrink-0">
                                            <div className="relative">
                                                <Input
                                                    value={messageInput}
                                                    onChange={(e) => handleInputChange(e.target.value)}
                                                    placeholder="Type a secure message..."
                                                    className="pr-10 bg-background border-border/50 focus-visible:ring-primary/20"
                                                />
                                                <Button
                                                    size="icon"
                                                    type="submit"
                                                    disabled={!messageInput.trim()}
                                                    className="absolute right-1 top-1 h-8 w-8 rounded-lg"
                                                >
                                                    <Send className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </form>
                                    </>
                                ) : (
                                    /* Contacts List */
                                    <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                        {loadingConversations ? (
                                            <div className="space-y-2 p-2">
                                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-muted/40 rounded-xl animate-pulse" />)}
                                            </div>
                                        ) : conversations.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center space-y-4">
                                                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                                                    <UserIcon className="h-8 w-8 opacity-50" />
                                                </div>
                                                <p className="text-sm">No recent conversations.</p>
                                                <p className="text-xs opacity-60">Go to a profile and click "Message" to start one.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                {conversations.map((conv: any) => (
                                                    <button
                                                        key={conv.user.id}
                                                        onClick={() => handleContactClick(conv)}
                                                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left group"
                                                    >
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10 border border-border">
                                                                <AvatarImage src={conv.user.image || conv.user.avatarUrl} />
                                                                <AvatarFallback>{(conv.user.username?.[0] || '?').toUpperCase()}</AvatarFallback>
                                                            </Avatar>
                                                            {conv.unreadCount > 0 && (
                                                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center rounded-full border-2 border-background">
                                                                    {conv.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                <span className="font-bold text-sm truncate">{conv.user.username || conv.user.name}</span>
                                                                {conv.lastMessage?.CreatedAt && !conv.lastMessage.CreatedAt.startsWith('0001') && !isNaN(new Date(conv.lastMessage.CreatedAt).getTime()) && (
                                                                    <span className="text-[10px] text-muted-foreground tabular-nums">
                                                                        {formatDistanceToNow(new Date(conv.lastMessage.CreatedAt), { addSuffix: true }).replace('about ', '')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className={cn(
                                                                "text-xs truncate max-w-[180px]",
                                                                conv.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                                                            )}>
                                                                {conv.lastMessage?.Content || "No messages"}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
