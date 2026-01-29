import { useCallback, useRef } from 'react';

/**
 * useThrottle - Throttles a function to only be called once per interval
 * 
 * Critical for:
 * - Typing indicators (max 1 event per 3s)
 * - Presence updates
 * - Any real-time event that could spam the server
 */
export function useThrottle<T extends (...args: any[]) => void>(
    fn: T,
    intervalMs: number
): T {
    const lastCallRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCallRef.current;

        if (timeSinceLastCall >= intervalMs) {
            // Enough time has passed, call immediately
            lastCallRef.current = now;
            fn(...args);
        } else {
            // Schedule for later if not already scheduled
            if (!timeoutRef.current) {
                const remainingTime = intervalMs - timeSinceLastCall;
                timeoutRef.current = setTimeout(() => {
                    lastCallRef.current = Date.now();
                    timeoutRef.current = null;
                    fn(...args);
                }, remainingTime);
            }
        }
    }, [fn, intervalMs]) as T;
}

/**
 * useDebounce - Debounces a function to only be called after a delay
 * 
 * Critical for:
 * - Search input
 * - Auto-save
 */
export function useDebounce<T extends (...args: any[]) => void>(
    fn: T,
    delayMs: number
): T {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    return useCallback((...args: Parameters<T>) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            fn(...args);
        }, delayMs);
    }, [fn, delayMs]) as T;
}
