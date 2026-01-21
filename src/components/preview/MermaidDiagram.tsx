"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { cn } from "@/lib/utils";

// Initialize mermaid
mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "system-ui, sans-serif"
});

interface MermaidDiagramProps {
    definition: string;
    className?: string;
}

export function MermaidDiagram({ definition, className }: MermaidDiagramProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    useEffect(() => {
        let isMounted = true;

        // Reset zoom/pan when definition changes
        setScale(1);
        setPosition({ x: 0, y: 0 });

        const renderDiagram = async () => {
            if (!definition) return;

            try {
                setError(null);
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                const { svg } = await mermaid.render(id, definition);

                if (isMounted) {
                    setSvg(svg);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error("Mermaid render error:", err);
                    setError(err.message || "Failed to render diagram");
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [definition]);

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            setScale(s => Math.min(Math.max(0.5, s * delta), 5));
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">
                <p className="font-bold mb-1">Mermaid Syntax Error:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full bg-[#0d1117] overflow-hidden group">
            {/* Controls - Always visible on small screens, hover on large */}
            <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setScale(s => Math.min(s + 0.2, 5))}
                    className="p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-md backdrop-blur border border-white/10 transition-colors"
                    title="Zoom In"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /><line x1="11" x2="11" y1="8" y2="14" /><line x1="8" x2="14" y1="11" y2="11" /></svg>
                </button>
                <button
                    onClick={() => { setScale(1); setPosition({ x: 0, y: 0 }); }}
                    className="p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-md backdrop-blur border border-white/10 transition-colors"
                    title="Reset"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /></svg>
                </button>
                <button
                    onClick={() => setScale(s => Math.max(0.5, s - 0.2))}
                    className="p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-md backdrop-blur border border-white/10 transition-colors"
                    title="Zoom Out"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" x2="16.65" y1="21" y2="16.65" /><line x1="8" x2="14" y1="11" y2="11" /></svg>
                </button>
            </div>

            {/* Diagram Area */}
            <div
                ref={containerRef}
                className={cn(
                    "w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing",
                    className
                )}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                        transformOrigin: 'center'
                    }}
                    dangerouslySetInnerHTML={{ __html: svg }}
                />
            </div>

            {/* Hint - Only show on desktop (sm and up) */}
            <div className="hidden sm:block absolute bottom-4 left-4 text-[10px] text-white/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                Ctrl + Scroll to zoom • Drag to pan
            </div>
            {/* Mobile suggestion */}
            <div className="block sm:hidden absolute bottom-4 left-4 text-[10px] text-white/30 pointer-events-none opacity-60">
                Use desktop for best experience
            </div>
        </div>
    );
}
