import { useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Hook that returns the current device type based on screen width
 * Breakpoints: <768px = mobile, 768-1023px = tablet, ≥1024px = desktop
 */
export function useDeviceType(): DeviceType {
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

    return useMemo(() => {
        if (isMobile) return 'mobile';
        if (isTablet) return 'tablet';
        return 'desktop';
    }, [isMobile, isTablet]);
}

/**
 * Returns true if the device is mobile or tablet (not desktop)
 * Useful for showing mobile-optimized UI on both phones and tablets
 */
export function useIsMobileOrTablet(): boolean {
    const deviceType = useDeviceType();
    return deviceType === 'mobile' || deviceType === 'tablet';
}

/**
 * Returns true if code editing should be blocked
 * Currently blocks on mobile and tablet devices
 */
export function useShouldBlockEditor(): boolean {
    return useMediaQuery('(max-width: 1023px)');
}
