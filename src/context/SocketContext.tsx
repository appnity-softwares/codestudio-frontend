
import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketType = any;

interface SocketContextType {
    socket: SocketType | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const socketRef = useRef<SocketType | null>(null);

    useEffect(() => {
        if (user?.id && !socketRef.current) {
            socketRef.current = io(SOCKET_URL, {
                query: { userId: user.id },
                transports: ['websocket'], // Force WebSocket to avoid polling conflicts
                upgrade: false, // Disable upgrade from polling
                reconnection: false, // MVP Rule: No reconnection loops outside Chat
                autoConnect: false, // MVP Rule: Manual connect only
            });

            // Manual connect since autoConnect is false
            socketRef.current.connect();

            socketRef.current.on('connect', () => {
                console.log('Socket connected:', socketRef.current?.id);
            });

            socketRef.current.on('disconnect', (reason: string) => {
                console.log('Socket disconnected:', reason);
            });

            socketRef.current.on('connect_error', (err: Error) => {
                console.error('Socket connection error:', err);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?.id]);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current }}>
            {children}
        </SocketContext.Provider>
    );
};
