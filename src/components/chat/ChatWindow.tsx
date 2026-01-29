import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { messagesAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { ChevronLeft, Send, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "@/context/ChatContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { HamsterLoader } from "@/components/shared/HamsterLoader";
import { useToast } from "@/hooks/use-toast";
import { useThrottle } from "@/hooks/use-throttle";
import { usePresence } from "@/context/PresenceContext";
import { MessageBubble } from "./MessageBubble";
import { ImageLinkPreview } from "./ImageLinkPreview";
import { MentionAutocomplete } from "./MentionAutocomplete";
import { getMessageKey, normalizeMessage, MAX_RETRY_COUNT, type ChatMessage } from "@/types/chat";
import { isImageUrl } from "@/utils/imageUrl";

interface ChatWindowProps {
    className?: string;
    onBack?: () => void;
}

/**
 * ChatWindow - Production-Grade Chat Component
 * 
 * Implements:
 * - Canonical message state (clientMessageId as primary key)
 * - Optimistic UI with proper rollback
 * - Retry-safe deduplication
 * - Frontend typing throttle
 * - ACK on visible/render
 * - Status tracking (sending → sent → delivered → read → failed)
 * - Image sharing via paste-URL (no uploads)
 */
export function ChatWindow({ className, onBack }: ChatWindowProps) {
    const { user } = useAuth();
    const { activeContact } = useChat();
    const { socket } = useSocket();
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [messageInput, setMessageInput] = useState("");
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const { isUserTyping, isUserOnline } = usePresence();
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
    const [reactions, setReactions] = useState<Record<string, any[]>>({});
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingEmitterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ============================================================
    // QUERY: Fetch messages for active conversation
    // ============================================================
    const { data: messagesData, isLoading } = useQuery({
        queryKey: ['messages', activeContact?.user?.id],
        queryFn: () => messagesAPI.getMessages(activeContact!.user.id),
        enabled: !!activeContact?.user?.id,
        // No polling for messages - strictly use Socket.io for updates
        staleTime: 30000, // 30s stale time since we have real-time updates
    });

    // Normalize messages for consistent access
    const messages = useMemo(() => {
        const raw = messagesData?.messages || [];
        return raw.map(normalizeMessage);
    }, [messagesData]);

    // ============================================================
    // SCROLL: Auto-scroll to bottom on new messages
    // ============================================================
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages.length, activeContact?.user?.id, imagePreviewUrl]);

    // ============================================================
    // MARK READ: When conversation is focused
    // ============================================================
    useEffect(() => {
        if (!activeContact?.user?.id) return;

        // Batch read ACK - mark all as read when conversation opens
        messagesAPI.markAsRead(activeContact.user.id);
        // queryClient.invalidateQueries({ queryKey: ['conversations'] }); // Optional: could cause flash
    }, [activeContact?.user?.id]);

    // ============================================================
    // SOCKET LISTENERS: Real-time updates
    // ============================================================
    useEffect(() => {
        if (!socket || !activeContact?.user?.id) return;

        const conversationUserId = activeContact.user.id;

        // Handle incoming messages
        const handleNewMessage = (data: any) => {
            const msg = normalizeMessage(data.message || data);

            // Only handle if message belongs to this conversation
            const belongsToConversation =
                msg.senderId === conversationUserId ||
                msg.recipientId === conversationUserId;

            if (!belongsToConversation) return;

            queryClient.setQueryData(['messages', conversationUserId], (old: any) => {
                const oldMessages: ChatMessage[] = (old?.messages || []).map(normalizeMessage);

                // DEDUPLICATION: Check by both id and clientMessageId
                const messageIndex = oldMessages.findIndex(m =>
                    (m.id && m.id === msg.id) ||
                    (m.clientMessageId && m.clientMessageId === msg.clientMessageId)
                );

                if (messageIndex !== -1) {
                    // Update existing message
                    const updatedMessages = [...oldMessages];
                    const existing = updatedMessages[messageIndex];

                    // PRESERVE STATUS: Don't revert to 'sent' if already 'delivered' or 'read'
                    const statusOrder = { 'sending': 0, 'sent': 1, 'delivered': 2, 'read': 3, 'failed': 0 };
                    const currentStatus = (existing.status || 'sent') as keyof typeof statusOrder;
                    const newStatus = (msg.status || 'sent') as keyof typeof statusOrder;

                    const resolvedStatus = statusOrder[newStatus] > statusOrder[currentStatus]
                        ? newStatus
                        : currentStatus;

                    updatedMessages[messageIndex] = {
                        ...existing,
                        ...msg,
                        status: resolvedStatus
                    };
                    return { ...old, messages: updatedMessages };
                }

                return { ...old, messages: [...oldMessages, msg] };
            });

            // ACK ON RENDER: If message is from other person, send delivered ACK
            if (msg.senderId === conversationUserId && msg.id) {
                socket.emit('message_ack', { messageId: msg.id, status: 'delivered' });
                // Also mark as read since conversation is visible
                socket.emit('message_ack', { messageId: msg.id, status: 'read' });
            }
        };

        // Handle message status updates (sent → delivered → read)
        const handleMessageStatus = (data: any) => {
            const { messageId, status } = data;
            if (!messageId || !status) return;

            queryClient.setQueryData(['messages', conversationUserId], (old: any) => {
                const oldMessages = old?.messages || [];
                return {
                    ...old,
                    messages: oldMessages.map((m: any) => {
                        if (m.id === messageId || m.ID === messageId) {
                            return {
                                ...m,
                                status,
                                isRead: status === 'read',
                                IsRead: status === 'read'
                            };
                        }
                        return m;
                    })
                };
            });
        };

        // Handle read receipts
        const handleReadStatus = (data: any) => {
            if (data.senderId !== conversationUserId) return;

            // The other person read MY messages
            queryClient.setQueryData(['messages', conversationUserId], (old: any) => {
                const oldMessages = old?.messages || [];
                return {
                    ...old,
                    messages: oldMessages.map((m: any) =>
                        (m.senderId === user?.id || m.SenderID === user?.id)
                            ? { ...m, status: 'read', isRead: true, IsRead: true }
                            : m
                    )
                };
            });
        };

        // Handle reaction added
        const handleReactionAdded = (data: any) => {
            const reaction = data.reaction;
            if (!reaction?.messageId) return;

            setReactions(prev => {
                const existing = prev[reaction.messageId] || [];
                // Avoid duplicates
                if (existing.some(r => r.id === reaction.id)) return prev;
                return {
                    ...prev,
                    [reaction.messageId]: [...existing, reaction]
                };
            });
        };

        // Handle reaction removed
        const handleReactionRemoved = (data: any) => {
            const { messageId, reactionId, userId, emoji } = data;
            if (!messageId) return;

            setReactions(prev => {
                const existing = prev[messageId] || [];
                return {
                    ...prev,
                    [messageId]: existing.filter(r =>
                        reactionId ? r.id !== reactionId : !(r.userId === userId && r.emoji === emoji)
                    )
                };
            });
        };

        socket.on('receive_message', handleNewMessage);
        socket.on('message_status', handleMessageStatus);
        socket.on('message_read', handleReadStatus);
        socket.on('read_status', handleReadStatus);
        socket.on('reaction_added', handleReactionAdded);
        socket.on('reaction_removed', handleReactionRemoved);

        return () => {
            socket.off('receive_message', handleNewMessage);
            socket.off('message_status', handleMessageStatus);
            socket.off('message_read', handleReadStatus);
            socket.off('read_status', handleReadStatus);
            socket.off('reaction_added', handleReactionAdded);
            socket.off('reaction_removed', handleReactionRemoved);
        };
    }, [socket, activeContact?.user?.id, queryClient, user?.id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setMessageInput(val);

        // Emit typing event to socket
        if (socket && activeContact?.user?.id && val.trim()) {
            // Internal simple throttle: only send every 2 seconds
            if (!typingEmitterTimeoutRef.current) {
                socket.emit('typing', { recipientId: activeContact.user.id });
                typingEmitterTimeoutRef.current = setTimeout(() => {
                    typingEmitterTimeoutRef.current = null;
                }, 2000);
            }
        }
    };

    // ============================================================
    // GENERATE CLIENT MESSAGE ID: For deduplication
    // ============================================================
    const generateMessageId = useCallback((): string => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        // Fallback for older browsers
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }, []);

    // ============================================================
    // SEND MUTATION: Optimistic UI with retry support
    // ============================================================
    const sendMessageMutation = useMutation({
        mutationFn: async ({ clientMessageId, content, type = 'text', replyToId }: {
            clientMessageId: string;
            content: string;
            type?: 'text' | 'image' | 'code';
            retryCount?: number;
            replyToId?: string;
        }) => {
            if (!content.trim() || !activeContact?.user?.id) {
                throw new Error('Invalid message or recipient');
            }
            return await messagesAPI.sendMessage(activeContact.user.id, content.trim(), {
                clientMessageId,
                type,
                replyToId
            });
        },
        onMutate: async ({ clientMessageId, content, type = 'text', retryCount = 0 }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['messages', activeContact?.user?.id] });

            // Snapshot previous state
            const previousMessages = queryClient.getQueryData(['messages', activeContact?.user?.id]);

            // Check if this is a retry (message already exists)
            const existingMessages: ChatMessage[] = (previousMessages as any)?.messages?.map(normalizeMessage) || [];
            const existingMsg = existingMessages.find(m => m.clientMessageId === clientMessageId);

            if (existingMsg) {
                // RETRY: Update existing message status to 'sending'
                queryClient.setQueryData(['messages', activeContact?.user?.id], (old: any) => ({
                    messages: (old?.messages || []).map((m: any) =>
                        m.clientMessageId === clientMessageId
                            ? { ...m, status: 'sending', retryCount }
                            : m
                    )
                }));
            } else {
                // NEW MESSAGE: Add optimistic message
                const optimisticMsg: ChatMessage = {
                    clientMessageId,
                    senderId: user?.id || '',
                    recipientId: activeContact?.user?.id || '',
                    content: content.trim(),
                    type,
                    status: 'sending',
                    createdAt: new Date().toISOString(),
                    retryCount: 0,
                };

                queryClient.setQueryData(['messages', activeContact?.user?.id], (old: any) => ({
                    messages: [...(old?.messages || []), optimisticMsg]
                }));
            }

            setMessageInput("");
            setImagePreviewUrl(null); // Clear preview on send
            return { previousMessages, clientMessageId };
        },
        onSuccess: (response, { clientMessageId }) => {
            const newMsg = response?.message || response;
            if (!newMsg) return;

            // Replace optimistic message with server response
            // Note: Server response might be minimal (no preload). 
            // We use clientMessageId as the primary key for state reconciliation.
            queryClient.setQueryData(['messages', activeContact?.user?.id], (old: any) => {
                const oldMessages: ChatMessage[] = old?.messages || [];
                return {
                    ...old,
                    messages: oldMessages.map((m: any) => {
                        if (m.clientMessageId === clientMessageId) {
                            // Merge newMsg (ID, CreatedAt) but keep existing sender/recipient data from optimistic state
                            const normalized = normalizeMessage(newMsg);

                            // PRESERVE STATUS: Don't revert if socket already updated it
                            const statusOrder = { 'sending': 0, 'sent': 1, 'delivered': 2, 'read': 3, 'failed': 0 };
                            const currentStatus = (m.status || 'sent') as keyof typeof statusOrder;
                            const newStatus = 'sent'; // API success always means at least 'sent'

                            const resolvedStatus = statusOrder[newStatus] > statusOrder[currentStatus]
                                ? newStatus
                                : currentStatus;

                            return {
                                ...m,
                                ...normalized,
                                clientMessageId, // Ensure we keep the local ID for reconciliation
                                status: resolvedStatus,
                                // Keep relations if missing in response (speed optimization)
                                sender: normalized.sender || m.sender,
                                recipient: normalized.recipient || m.recipient
                            };
                        }
                        return m;
                    })
                };
            });

            // Update conversations list
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        },
        onError: (err: any, { clientMessageId, retryCount = 0 }) => {
            console.error("[Chat] Send failed:", err);

            // Handle specific error messages
            const errorMessage = err?.response?.data?.error || "Failed to send message";

            // Mark message as failed (keep for retry)
            queryClient.setQueryData(['messages', activeContact?.user?.id], (old: any) => ({
                messages: (old?.messages || []).map((m: any) =>
                    m.clientMessageId === clientMessageId
                        ? { ...m, status: 'failed', retryCount }
                        : m
                )
            }));

            toast({
                title: "Message Failed",
                description: errorMessage,
                variant: "destructive"
            });
        }
    });

    // ============================================================
    // SEND HANDLER: Generate ID and send
    // ============================================================
    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (imagePreviewUrl) {
            // Send Image
            const clientMessageId = generateMessageId();
            sendMessageMutation.mutate({
                clientMessageId,
                content: imagePreviewUrl,
                type: 'image',
                retryCount: 0,
                replyToId: replyingTo?.id
            });
            setReplyingTo(null);
        } else if (messageInput.trim()) {
            // Send Text
            const clientMessageId = generateMessageId();
            sendMessageMutation.mutate({
                clientMessageId,
                content: messageInput,
                type: 'text',
                retryCount: 0,
                replyToId: replyingTo?.id
            });
            setReplyingTo(null);
        }
    };

    // ============================================================
    // PASTE HANDLER: Detect image URLs
    // ============================================================
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        // Get pasted text
        const pastedText = e.clipboardData.getData('text');

        // Check if it's an image URL
        if (isImageUrl(pastedText)) {
            e.preventDefault();
            setImagePreviewUrl(pastedText.trim());
            // Clear input so user focuses on the image to send
            setMessageInput('');
            toast({
                title: "Image URL Detected",
                description: "Review the image preview before sending.",
            });
        }
    };

    const handleCancelPreview = () => {
        setImagePreviewUrl(null);
    };

    const handleSendImage = () => {
        handleSend();
    };

    // ============================================================
    // RETRY HANDLER: Reuse same clientMessageId
    // ============================================================
    const handleRetry = useCallback((message: ChatMessage) => {
        const retryCount = (message.retryCount || 0) + 1;

        if (retryCount > MAX_RETRY_COUNT) {
            toast({
                title: "Retry Limit Reached",
                description: "Please delete and resend this message.",
                variant: "destructive"
            });
            return;
        }

        // Ensure type is valid for sending (filter out system/undefined)
        const type = (message.type === 'image' || message.type === 'code')
            ? message.type
            : 'text';

        sendMessageMutation.mutate({
            clientMessageId: message.clientMessageId,
            content: message.content,
            type,
            retryCount
        });
    }, [sendMessageMutation, toast]);

    // ============================================================
    // TYPING HANDLER: Throttled to max 1 event per 3s
    // ============================================================
    const emitTyping = useThrottle(() => {
        if (socket && activeContact?.user?.id) {
            socket.emit('typing', { recipientId: activeContact.user.id });
        }
    }, 3000);


    // ============================================================
    // RENDER: Empty state
    // ============================================================
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

    // ============================================================
    // RENDER: Chat window
    // ============================================================
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
                            {isUserTyping(activeContact.user.id) ? (
                                <span className="text-[10px] text-primary animate-pulse font-medium">typing...</span>
                            ) : (
                                <div className="flex items-center gap-1.5">
                                    <div className={cn(
                                        "h-1.5 w-1.5 rounded-full",
                                        isUserOnline(activeContact.user.id) ? "bg-emerald-500" : "bg-muted-foreground/30"
                                    )} />
                                    <span className="text-[10px] text-muted-foreground">
                                        {isUserOnline(activeContact.user.id) ? "Online" : "Offline"}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Messages - Using MessageBubble for proper status display */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[url('/grid.svg')] bg-fixed" ref={scrollRef}>
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-12">
                        <HamsterLoader size={12} />
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest opacity-30">Decrypting_Traffic</p>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 gap-2">
                        <p className="text-sm">No messages yet. Say hello! 👋</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {messages.map((msg) => {
                            const isMine = msg.senderId === user?.id;
                            const msgReactions = reactions[msg.id || ''] || [];
                            return (
                                <MessageBubble
                                    key={getMessageKey(msg)}
                                    message={msg}
                                    isMine={isMine}
                                    currentUserId={user?.id || ''}
                                    reactions={msgReactions}
                                    onRetry={handleRetry}
                                    onReply={(m) => setReplyingTo(m)}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Input */}
            <div className="bg-card border-t border-border/40">
                {/* Reply Preview */}
                {replyingTo && (
                    <div className="px-4 pt-3 pb-0">
                        <div className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2 border-l-2 border-primary">
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-medium text-primary mb-0.5">
                                    Replying to {replyingTo.sender?.username || 'message'}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {replyingTo.content?.substring(0, 60) || '...'}
                                    {(replyingTo.content?.length || 0) > 60 && '...'}
                                </p>
                            </div>
                            <button
                                onClick={() => setReplyingTo(null)}
                                className="ml-2 p-1 rounded hover:bg-muted transition-colors"
                                aria-label="Cancel reply"
                            >
                                <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Image Preview */}
                {imagePreviewUrl && (
                    <ImageLinkPreview
                        url={imagePreviewUrl}
                        onCancel={handleCancelPreview}
                        onSend={handleSendImage}
                        isLoading={sendMessageMutation.isPending}
                    />
                )}

                {/* Text Input */}
                {!imagePreviewUrl && (
                    <form onSubmit={handleSend} className="relative flex items-end gap-2 p-4 max-w-4xl mx-auto">
                        <div className="relative flex-1">
                            <Input
                                value={messageInput}
                                onChange={handleInputChange}
                                onPaste={handlePaste}
                                placeholder={`Message ${activeContact.user.username}...`}
                                className="pr-12 min-h-[50px] py-3 bg-muted/30 border-transparent focus:bg-background focus:border-border transition-all shadow-sm rounded-xl resize-none"
                            />
                            <MentionAutocomplete
                                value={messageInput}
                                onChange={(val) => {
                                    setMessageInput(val);
                                    emitTyping();
                                }}
                                className="absolute bottom-full left-0 mb-2 w-full"
                            />
                        </div>
                        <Button
                            size="icon"
                            type="submit"
                            disabled={!messageInput.trim()}
                            className="absolute right-6 bottom-5.5 h-9 w-9 rounded-lg shadow-sm transition-all hover:scale-105 active:scale-95"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                )}

                {/* Helper Tip */}
                {!imagePreviewUrl && (
                    <div className="px-4 pb-2 text-center -mt-1">
                        <p className="text-[10px] text-muted-foreground opacity-40 hover:opacity-100 transition-opacity cursor-help" title="Just copy an image address and paste it here!">
                            💡 Tip: Paste an image URL to send it instantly
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
