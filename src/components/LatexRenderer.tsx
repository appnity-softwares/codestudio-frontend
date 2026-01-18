import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface LatexRendererProps {
    children: string;
    block?: boolean;
    className?: string;
}

export const LatexRenderer: React.FC<LatexRendererProps> = ({ children, block = false, className }) => {
    const containerRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                katex.render(children, containerRef.current, {
                    throwOnError: false,
                    displayMode: block,
                    globalGroup: true,
                    trust: true,
                    strict: false
                });
            } catch (error) {
                console.error("KaTeX rendering error:", error);
                containerRef.current.innerText = children;
            }
        }
    }, [children, block]);

    return <span ref={containerRef} className={className} />;
};
