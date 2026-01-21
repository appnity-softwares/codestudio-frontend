import { useQuery } from "@tanstack/react-query";
import { changelogAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Code2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SeoMeta";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Changelog() {
    const { isAuthenticated } = useAuth();
    const { data, isLoading } = useQuery({
        queryKey: ["changelog"],
        queryFn: () => changelogAPI.getAll(),
    });

    const entries = data?.entries || [];

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
            <SEO
                title={`Changelog | CodeStudio ${entries[0]?.version ? `(${entries[0].version})` : ''}`}
                description="Latest platform updates, features, and fixes for CodeStudio."
            />

            {/* Standalone Navbar */}
            <nav className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
                <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform">
                            <Code2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">CodeStudio</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link to={isAuthenticated ? "/feed" : "/auth/signin"}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Button
                                    variant={isAuthenticated ? "default" : "ghost"}
                                    className={cn(
                                        "text-sm font-bold transition-all px-6 relative overflow-hidden group",
                                        isAuthenticated
                                            ? "bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                                            : "text-white/70 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {isAuthenticated && (
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_infinite]"
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                    {isAuthenticated ? "Go to Platform" : "Sign In"}
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="py-20 px-4 relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full opacity-50 pointer-events-none" />

                <div className="container max-w-3xl mx-auto relative z-10">
                    {/* Header */}
                    <div className="mb-20">
                        <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
                            Platform <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-400">Updates</span>
                        </h1>
                        <p className="text-lg text-white/50 max-w-xl leading-relaxed">
                            Every single fix, feature, and improvement we've built for the CodeStudio community.
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
                            <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-white/10 to-transparent z-0" />

                            <div className="space-y-24 relative">
                                <AnimatePresence mode="popLayout">
                                    {entries.map((entry: any, index: number) => (
                                        <motion.div
                                            key={entry._id || entry.id || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true, margin: "-100px" }}
                                            transition={{ duration: 0.6, delay: index * 0.1 }}
                                            className="relative pl-12 group z-10"
                                        >
                                            {/* Timeline Dot */}
                                            <div className="absolute left-2 top-3 -translate-x-1/2 flex items-center justify-center">
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    whileInView={{ scale: 1 }}
                                                    className="w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] z-20"
                                                />
                                            </div>

                                            {/* Entry Header */}
                                            <div className="mb-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className="font-mono text-sm font-black tracking-widest text-primary/80 uppercase">
                                                        Release v{entry.version || "1.0.0"}
                                                    </span>
                                                    <span className="h-1 w-1 rounded-full bg-white/20" />
                                                    <span className="text-sm font-medium text-white/40">
                                                        {entry.releasedAt ? new Date(entry.releasedAt).toLocaleDateString("en-US", {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric"
                                                        }) : new Date(entry.createdAt).toLocaleDateString("en-US", {
                                                            month: "long",
                                                            day: "numeric",
                                                            year: "numeric"
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    <h2 className="text-3xl font-black text-white tracking-tight group-hover:text-primary transition-colors duration-300">
                                                        {entry.title}
                                                    </h2>
                                                    <Badge className={cn(
                                                        "px-4 py-1 text-[10px] font-black tracking-tighter uppercase rounded-full border-2",
                                                        entry.releaseType === 'BREAKING' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                            entry.releaseType === 'FEATURE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                                                                'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                                    )}>
                                                        {entry.releaseType}
                                                    </Badge>
                                                </div>
                                            </div>

                                            {/* Markdown Content Card */}
                                            <motion.div
                                                whileHover={{ y: -5 }}
                                                className="bg-white/[0.02] backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl shadow-black/40 group-hover:border-primary/20"
                                            >
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 space-y-4 text-white/70" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-6 space-y-4 text-white/70" {...props} />,
                                                        li: ({ node, ...props }) => <li className="pl-2 leading-relaxed text-lg" {...props} />,
                                                        strong: ({ node, ...props }) => <strong className="text-white font-bold" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-6 last:mb-0 text-white/80 leading-relaxed text-lg font-light" {...props} />,
                                                        h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-white mb-6 mt-8 first:mt-0" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-white mb-5 mt-7" {...props} />,
                                                        h3: ({ node, ...props }) => <h3 className="text-xl font-bold text-white mb-4 mt-6" {...props} />,
                                                        code: ({ node, ...props }) => <code className="bg-black/60 text-primary-foreground/90 px-2 py-1 rounded-lg text-sm font-mono border border-white/10" {...props} />,
                                                        a: ({ node, ...props }) => <a className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 transition-colors font-bold" target="_blank" rel="noopener noreferrer" {...props} />,
                                                        blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary pl-6 py-4 italic text-white/60 bg-white/5 rounded-r-2xl my-6" {...props} />,
                                                    }}
                                                >
                                                    {entry.description || "No details provided."}
                                                </ReactMarkdown>
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {entries.length === 0 && (
                                <div className="text-center py-20 text-white/30 font-mono italic">
                                    No published releases yet. check back soon!
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 mt-20 bg-black/40">
                <div className="container max-w-3xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <Code2 className="h-5 w-5 text-primary" />
                        <span className="font-bold tracking-tight">CodeStudio</span>
                    </div>
                    <p className="text-white/30 text-xs">
                        &copy; {new Date().getFullYear()} CodeStudio Platform. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
