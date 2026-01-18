import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
    startOnLoad: true,
    theme: 'dark',
    securityLevel: 'loose',
    fontFamily: 'Inter, sans-serif'
});

interface MermaidProps {
    chart: string;
}

const MermaidDiagram: React.FC<MermaidProps> = ({ chart }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && chart) {
            mermaid.contentLoaded();
            const renderChart = async () => {
                try {
                    // Unique ID for each mermaid diagram
                    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
                    const { svg } = await mermaid.render(id, chart);
                    if (ref.current) {
                        ref.current.innerHTML = svg;
                    }
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    if (ref.current) {
                        ref.current.innerHTML = '<div class="text-red-500 text-xs p-4">Failed to render ER Diagram</div>';
                    }
                }
            };
            renderChart();
        }
    }, [chart]);

    return (
        <div className="mermaid-container w-full overflow-auto py-8 flex justify-center bg-black/20 rounded-[2rem] border border-white/5 shadow-huge">
            <div ref={ref} className="mermaid" />
        </div>
    );
};

export default MermaidDiagram;
