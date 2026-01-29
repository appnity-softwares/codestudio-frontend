import { createContext, useContext, useState, ReactNode } from 'react';

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

    const openChatWith = (user: any) => {
        // Construct a partial conversation object if we only have a user
        // The CipherChat component handles "user" vs "conversation" structure
        // Let's standardise on passing the wrapper object { user: ... }
        if (!user) return;

        // If we passed a raw user object (from Profile), wrap it to match conversation structure
        // or just set it as activeContact and handle in CipherChat
        // CipherChat expects { user: ... } based on my implementation
        const contact = user.user ? user : { user: user };

        setActiveContact(contact);
        setIsOpen(true);
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
