"use client";

import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Code } from "lucide-react";

export function Logo({ className, showText = true }: { className?: string; showText?: boolean }) {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center">
                {/* Skeleton Loader - Visible until image loads or if loading */}
                {!imageLoaded && !imageError && (
                    <Skeleton className="h-8 w-8 rounded-lg" />
                )}

                {/* Actual Logo Image - Try loading /logo.svg */}
                {!imageError ? (
                    <img
                        src="/logo.svg"
                        alt="CodeStudio"
                        className={`h-8 w-8 object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
                        onLoad={() => setImageLoaded(true)}
                        onError={() => setImageError(true)}
                    />
                ) : (
                    // Fallback to Icon if image fails text-primary
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 border border-primary/20">
                        <Code className="h-5 w-5 text-primary" />
                    </div>
                )}
            </div>

            {showText && (
                <div className="flex flex-col">
                    <span className="font-bold font-headline text-lg leading-none tracking-tight">CodeStudio</span>
                </div>
            )}
        </div>
    );
}
