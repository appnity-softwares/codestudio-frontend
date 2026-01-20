
import React, { createContext, useContext, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

import { API_URL } from '@/lib/api';

const getSocketUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) return import.meta.env.VITE_SOCKET_URL;

    // Fallback: Derive from API_URL
    // If API_URL is "https://api.appnity.cloud/api", Socket URL should be "https://api.appnity.cloud"
    try {
        const url = new URL(API_URL);
        return url.origin;
    } catch (e) {
        return 'http://localhost:8080';
    }
};

const SOCKET_URL = getSocketUrl();

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
                query: {
                    userId: user.id,
                    token: localStorage.getItem('authToken')
                },
                auth: {
                    token: localStorage.getItem('authToken')
                },
                transports: ['websocket'], // Force WebSocket
                upgrade: false,
                reconnection: true, // Allow reconnection for stability
                autoConnect: false,
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
