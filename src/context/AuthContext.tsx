import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, setToken, removeToken } from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (data: { email: string; password: string; name: string; username: string }) => Promise<void>;
    signOut: () => void;
    updateUser: (user: Partial<User>) => void;
    loginWithToken: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    const hasChecked = React.useRef(false);

    // Check for existing session on mount (ONCE only)
    useEffect(() => {
        if (hasChecked.current) return;
        hasChecked.current = true;

        const checkAuth = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const response = await authAPI.me();
                // Double-check if we are still mounted/valid? (React handles state updates in unmounted components warning usually, but safe here)
                setUser(response.user);
                setIsAuthenticated(true);
            } catch (error: any) {
                console.warn('Auth check failed (Logged out):', error.message);
                removeToken();
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const handleLogoutEvent = () => {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
        };

        window.addEventListener('auth:logout', handleLogoutEvent);
        return () => window.removeEventListener('auth:logout', handleLogoutEvent);
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            const response = await authAPI.signin({ email, password });
            setToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Sign in failed:', error);
            throw error;
        }
    };

    const signUp = async (data: { email: string; password: string; name: string; username: string }) => {
        try {
            const response = await authAPI.signup(data);
            setToken(response.token);
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Sign up failed:', error);
            throw error;
        }
    };

    const loginWithToken = async (token: string) => {
        setToken(token);
        try {
            const response = await authAPI.me();
            setUser(response.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Token validation failed:', error);
            removeToken();
            throw error;
        }
    };

    const navigate = useNavigate();

    const signOut = () => {
        removeToken();
        setUser(null);
        setIsAuthenticated(false);
        navigate('/auth/signin');
    };

    const updateUser = (updates: Partial<User>) => {
        if (user) {
            setUser({ ...user, ...updates });
        }
    };

    if (loading) {
        return null; // Or a loading spinner
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, signIn, signUp, signOut, updateUser, loginWithToken }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
