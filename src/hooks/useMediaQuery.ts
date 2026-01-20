import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive breakpoint detection
 * @param query - CSS media query string (e.g., '(max-width: 767px)')
 * @returns boolean indicating if the query matches
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
        // SSR safety: default to false if window is undefined
        if (typeof window === 'undefined') return false;
        return window.matchMedia(query).matches;
    });

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        setMatches(mediaQuery.matches);

        // Create listener function
        const handler = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Modern browsers
        mediaQuery.addEventListener('change', handler);

        return () => {
            mediaQuery.removeEventListener('change', handler);
        };
    }, [query]);

    return matches;
}

// Pre-defined breakpoint hooks for convenience
export function useIsMobile(): boolean {
    return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
    return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
    return useMediaQuery('(min-width: 1024px)');
}
