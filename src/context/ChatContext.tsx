import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from './SocketContext';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    activeContact: any | null; // User object or conversation object
    setActiveContact: (contact: any | null) => void;
    openChatWith: (user: any) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeContact, setActiveContact] = useState<any | null>(null);
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (data: { message: any }) => {
            const { message } = data;
            // If already chatting with this user, no toast needed (MessageBubble usually handles it or just auto-update)
            // Actually, we toast if we are NOT on the /messages page OR if we are on /messages but chatting with someone else.

            // Note: activeContact structure is { user: ... }. activeContact.user.id
            const isChattingWithSender = activeContact?.user?.id === message.senderId;
            const isOnMessagesPage = window.location.pathname === '/messages';

            if (!isOnMessagesPage || !isChattingWithSender) {
                toast({
                    title: `New message from ${message.sender.username}`,
                    description: message.content.substring(0, 50) + (message.content.length > 50 ? "..." : ""),
                    duration: 5000,
                    className: "cursor-pointer bg-card border-l-4 border-l-primary",
                    onClick: () => {
                        openChatWith(message.sender);
                    },
                });

                // Refresh badge count
                queryClient.invalidateQueries({ queryKey: ['unreadMessages'] });
            }

            // Also refresh conversations list anyway if needed
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
        };

        socket.on('receive_message', handleNewMessage);

        return () => {
            socket.off('receive_message', handleNewMessage);
        };
    }, [socket, activeContact, toast, queryClient, navigate]);

    const openChatWith = (user: any) => {
        if (!user) return;
        const contact = user.user ? user : { user: user };
        setActiveContact(contact);
        navigate('/messages');
    };

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, activeContact, setActiveContact, openChatWith }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}
