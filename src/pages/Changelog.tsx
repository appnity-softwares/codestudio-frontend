import { useQuery } from "@tanstack/react-query";
import { changelogAPI } from "@/lib/api";
import { Clock, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SeoMeta";

export default function Changelog() {
    const { data, isLoading } = useQuery({
        queryKey: ["changelog"],
        queryFn: () => changelogAPI.getAll(),
    });

    const entries = data?.entries || [];

    return (
        <div className="min-h-screen bg-canvas py-12 px-4">
            <SEO
                title={`Changelog | CodeStudio ${entries[0]?.version ? `(${entries[0].version})` : ''}`}
                description="Latest platform updates, features, and fixes for CodeStudio."
            />
            <div className="container max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-4xl font-black tracking-tight text-white mb-2 font-headline">
                        Changelog
                    </h1>
                    <p className="text-white/50 font-mono text-sm">
                        Platform updates and version history
                    </p>
                </div>

                {/* Timeline */}
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : (
                    <div className="relative">
                        {/* Vertical Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10" />

                        {entries.map((entry: any) => (
                            <div key={entry.id} className="relative pl-12 pb-12 group">
                                {/* Timeline Dot */}
                                <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-primary ring-4 ring-canvas group-hover:ring-primary/20 transition-all" />

                                {/* Version Header */}
                                <div className="flex items-center flex-wrap gap-3 mb-4">
                                    <span className="text-xl font-black text-white font-mono">
                                        {entry.version}
                                    </span>
                                    <span className="text-white/30 font-mono text-xs hidden sm:inline">—</span>
                                    <span className="text-white/80 font-bold">
                                        {entry.title}
                                    </span>
                                    <Badge variant="outline" className={
                                        entry.releaseType === 'BREAKING' ? 'text-red-500 border-red-500' :
                                            entry.releaseType === 'FEATURE' ? 'text-emerald-500 border-emerald-500' :
                                                'text-blue-500 border-blue-500'
                                    }>
                                        {entry.releaseType}
                                    </Badge>
                                </div>

                                {/* Date */}
                                <div className="flex items-center gap-1.5 text-white/30 text-xs font-mono mb-4">
                                    <Clock className="w-3 h-3" />
                                    {entry.releasedAt ? new Date(entry.releasedAt).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    }) : new Date(entry.createdAt).toLocaleDateString()}
                                </div>

                                {/* Markdown Content */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 space-y-2 text-white/80" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 space-y-2 text-white/80" {...props} />,
                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-4 last:mb-0 text-white/80 leading-relaxed" {...props} />,
                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0" {...props} />,
                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white mb-3 mt-5" {...props} />,
                                            h3: ({ node, ...props }) => <h3 className="text-lg font-bold text-white mb-2 mt-4" {...props} />,
                                            code: ({ node, ...props }) => <code className="bg-black/30 text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-primary/20" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-primary hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                            blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/50 pl-4 py-1 italic text-white/60 bg-white/5 rounded-r" {...props} />,
                                        }}
                                    >
                                        {entry.description || "No details provided."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        ))}

                        {entries.length === 0 && (
                            <div className="text-center py-20 text-white/30 font-mono">
                                No published releases yet.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
