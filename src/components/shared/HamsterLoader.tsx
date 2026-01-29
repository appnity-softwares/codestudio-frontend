import React from 'react';
import './HamsterLoader.css';

interface HamsterLoaderProps {
    size?: number;
    className?: string;
    fullPage?: boolean;
}

export const HamsterLoader: React.FC<HamsterLoaderProps> = ({ size = 14, className = "", fullPage = false }) => {
    const loader = (
        <div
            aria-label="Loading..."
            role="img"
            className="wheel-and-hamster"
            style={{ fontSize: `${size}px` }}
        >
            <div className="wheel"></div>
            <div className="hamster">
                <div className="hamster__body">
                    <div className="hamster__head">
                        <div className="hamster__ear"></div>
                        <div className="hamster__eye"></div>
                        <div className="hamster__nose"></div>
                    </div>
                    <div className="hamster__limb hamster__limb--fr"></div>
                    <div className="hamster__limb hamster__limb--fl"></div>
                    <div className="hamster__limb hamster__limb--br"></div>
                    <div className="hamster__limb hamster__limb--bl"></div>
                    <div className="hamster__tail"></div>
                </div>
            </div>
            <div className="spoke"></div>
        </div>
    );

    if (fullPage) {
        return (
            <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                {loader}
                <div className="mt-8 space-y-2 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary animate-pulse">Synchronizing_Systems</p>
                    <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">Global Protocol 2.1.0</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            {loader}
        </div>
    );
};
