import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

interface PresenceContextType {
    onlineUsers: Set<string>;
    typingUsers: Record<string, boolean>;
    isUserOnline: (userId: string) => boolean;
    isUserTyping: (userId: string) => boolean;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

export const PresenceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { socket } = useSocket();
    const { user } = useAuth();
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (!socket || !user) return;

        // 1. Listen for full online users list
        const handleOnlineUsers = (users: string[]) => {
            console.log('🌐 Online users received:', users);
            setOnlineUsers(new Set(users));
        };

        // 2. Listen for individual presence updates
        const handlePresenceUpdate = (data: { userId: string; online: boolean }) => {
            setOnlineUsers(prev => {
                const next = new Set(prev);
                if (data.online) {
                    next.add(data.userId);
                } else {
                    next.delete(data.userId);
                }
                return next;
            });
        };

        // 3. Listen for typing events
        const handleUserTyping = (data: { userId: string; expiresAt: number }) => {
            const { userId } = data;

            setTypingUsers(prev => ({ ...prev, [userId]: true }));

            // Auto-clear typing status after timeout or specific expiration
            const delay = Math.max(0, (data.expiresAt * 1000) - Date.now());
            setTimeout(() => {
                setTypingUsers(prev => {
                    const next = { ...prev };
                    delete next[userId];
                    return next;
                });
            }, delay || 4000);
        };

        socket.on('online_users', handleOnlineUsers);
        socket.on('presence_update', handlePresenceUpdate);
        socket.on('user_typing', handleUserTyping);

        socket.on('maintenance_toggle', (data: { enabled: boolean }) => {
            console.log('🚧 Maintenance toggle received:', data);
            // Full refresh to force redirect/reload
            window.location.reload();
        });

        // Request current online users on join
        socket.emit('get_online_users', "");

        return () => {
            socket.off('online_users', handleOnlineUsers);
            socket.off('presence_update', handlePresenceUpdate);
            socket.off('user_typing', handleUserTyping);
            socket.off('maintenance_toggle');
        };
    }, [socket, user]);

    const isUserOnline = (userId: string) => onlineUsers.has(userId);
    const isUserTyping = (userId: string) => !!typingUsers[userId];

    return (
        <PresenceContext.Provider value={{ onlineUsers, typingUsers, isUserOnline, isUserTyping }}>
            {children}
        </PresenceContext.Provider>
    );
};

export const usePresence = () => {
    const context = useContext(PresenceContext);
    if (context === undefined) {
        throw new Error('usePresence must be used within a PresenceProvider');
    }
    return context;
};
