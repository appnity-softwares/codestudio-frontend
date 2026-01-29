
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
    const [socket, setSocket] = React.useState<SocketType | null>(null);

    const socketRef = useRef<SocketType | null>(null);

    useEffect(() => {
        if (!user?.id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
            return;
        }

        // Avoid re-creating if we already have a connecting/connected socket for this user
        if (socketRef.current?.connected) {
            setSocket(socketRef.current);
            return;
        }

        const token = localStorage.getItem('authToken');
        const newSocket = io(SOCKET_URL, {
            query: {
                userId: user.id,
                token: token
            },
            auth: {
                token: token
            },
            // Removing force-websocket to allow fallback and stable upgrade handshake
            // which is often required by go-socket.io
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            autoConnect: true,
        });

        socketRef.current = newSocket;

        newSocket.on('connect', () => {
            console.log('✅ Cipher Socket connected:', newSocket.id);
            setSocket(newSocket);
        });

        newSocket.on('disconnect', (reason: string) => {
            console.log('🔌 Socket disconnected:', reason);
            if (socketRef.current === newSocket) {
                setSocket(null);
            }
        });

        newSocket.on('connect_error', (err: Error) => {
            // These are expected during server restarts or local dev reloads
            console.warn('⚠️ Socket connection attempt failed:', err.message);
        });

        return () => {
            // In React Strict Mode, this cleanup runs immediately after the first mount.
            // We only want to truly disconnect if the user changed or the app is unmounting for real.
            // For now, we'll keep the standard cleanup but wrap it to be quieter.
            if (socketRef.current === newSocket) {
                // If it's still connecting, browsers throw that warning. 
                // We'll disconnect anyway to prevent leaks, but now you know why the warning exists.
                newSocket.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, [user?.id]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
