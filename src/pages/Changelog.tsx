import { useQuery } from "@tanstack/react-query";
import { changelogAPI } from "@/lib/api";
import { Clock, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Seo } from "@/components/Seo";

export default function Changelog() {
    const { data, isLoading } = useQuery({
        queryKey: ["changelog"],
        queryFn: () => changelogAPI.getAll(),
    });

    const entries = data?.entries || [];

    return (
        <div className="min-h-screen bg-canvas py-12 px-4">
            <Seo
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
                                <div className="bg-white/5 border border-white/10 rounded-lg p-6 prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown>{entry.description || "No details provided."}</ReactMarkdown>
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
