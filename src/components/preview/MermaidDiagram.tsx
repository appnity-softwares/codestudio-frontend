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

    useEffect(() => {
        let isMounted = true;

        const renderDiagram = async () => {
            if (!definition) return;

            try {
                setError(null);
                // Generate a unique ID for the diagram
                const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

                // mermaid.render returns an object with svg property in v10+
                const { svg } = await mermaid.render(id, definition);

                if (isMounted) {
                    setSvg(svg);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error("Mermaid render error:", err);
                    setError(err.message || "Failed to render diagram");
                    // Keep the raw code visible if render fails
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [definition]);

    if (error) {
        return (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">
                <p className="font-bold mb-1">Mermaid Syntax Error:</p>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={cn("w-full h-full flex items-center justify-center overflow-auto p-4 bg-[#0d1117]", className)}
            dangerouslySetInnerHTML={{ __html: svg }}
        />
    );
}
