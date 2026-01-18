import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { SnippetCard } from "./SnippetCard";

interface VirtualizedSnippetListProps {
    snippets: any[];
}

export function VirtualizedSnippetList({ snippets }: VirtualizedSnippetListProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <div className="space-y-6">
            {snippets.map((snippet, index) => (
                <VirtualizedItem
                    key={snippet.id}
                    snippet={snippet}
                    index={index}
                    activeIndex={activeIndex}
                    setActiveIndex={setActiveIndex}
                />
            ))}
        </div>
    );
}

function VirtualizedItem({ snippet, index, activeIndex, setActiveIndex }: any) {
    const { ref, inView } = useInView({
        threshold: 0.5,
    });

    useEffect(() => {
        if (inView) {
            setActiveIndex(index);
        }
    }, [inView, index, setActiveIndex]);

    // Windowing logic: Render if within [activeIndex - 2, activeIndex + 2] 
    // OR if it's one of the first 5 (original requirement)
    const shouldRender = index < 5 || (index >= activeIndex - 2 && index <= activeIndex + 2);

    return (
        <div ref={ref} style={{ minHeight: shouldRender ? 'auto' : '600px' }}>
            {shouldRender ? (
                <SnippetCard snippet={snippet} />
            ) : (
                <div className="w-full h-[600px] flex items-center justify-center bg-white/[0.02] rounded-[2rem] border border-white/5 italic text-white/10">
                    Neural Link Buffering...
                </div>
            )}
        </div>
    );
}
