"use client";

import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { documentsAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/CodeBlock";
import { ArrowLeft, Calendar, MessageSquare, Share2, ThumbsUp } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { DocumentComments } from "@/components/DocumentComments";
import { motion } from "framer-motion";

export default function BlogDetail() {
    const { slug } = useParams<{ slug: string }>();
    const [doc, setDoc] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showComments, setShowComments] = useState(false);

    useEffect(() => {
        if (!slug) return;

        const fetchDoc = async () => {
            try {
                const data = await documentsAPI.getBySlug(slug);
                setDoc(data.document);
            } catch (err) {
                console.error("Failed to fetch document:", err);
                setError("Document not found or error loading.");
            } finally {
                setLoading(false);
            }
        };

        fetchDoc();
    }, [slug]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !doc) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-destructive">Error</h1>
                <p>{error || "Blog post not found."}</p>
                <Button asChild>
                    <Link to="/blogs">Back to Blogs</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen py-12 px-4 overflow-hidden bg-[#0c0c0e]">
            {/* Ultra-Premium Background Elements */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,17,17,0)_0%,rgba(12,12,14,1)_100%)] pointer-events-none" />

            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/15 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none animate-float" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-white/[0.02] rounded-full blur-[180px] pointer-events-none" />

            {/* High-density grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <article className="container max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                {/* Back Button */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                >
                    <Button variant="ghost" asChild className="mb-12 pl-0 hover:bg-transparent hover:text-primary transition-colors group text-sm font-black uppercase tracking-widest italic">
                        <Link to="/blogs" className="flex items-center gap-3">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Nexus Orbit
                        </Link>
                    </Button>
                </motion.div>

                <div className="ultra-glass p-8 md:p-16 rounded-[4rem] border border-white/5 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] relative group/main backdrop-blur-[24px] backdrop-saturate-[1.8] bg-white/[0.02]">
                    <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
                    <div className="absolute -inset-px rounded-[4rem] border border-white/[0.08] pointer-events-none" />
                    {/* Header */}
                    <header className="mb-20 text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="flex justify-center flex-wrap gap-3 mb-12"
                        >
                            {doc.tags.map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="px-6 py-1.5 text-[10px] font-black tracking-[0.3em] uppercase rounded-full bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
                                    {tag}
                                </Badge>
                            ))}
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="text-5xl md:text-8xl font-black font-headline tracking-tighter mb-12 leading-[0.95] text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] italic"
                        >
                            {doc.title}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 0.7 }}
                            className="flex items-center justify-center gap-10 text-muted-foreground mt-16 bg-white/[0.03] py-6 px-10 rounded-[2.5rem] border border-white/5 w-fit mx-auto shadow-2xl backdrop-blur-xl"
                        >
                            <div className="flex items-center gap-5">
                                <div className="relative group/author">
                                    <div className="absolute -inset-1 bg-primary/30 rounded-full blur opacity-0 group-hover/author:opacity-100 transition-opacity" />
                                    <Avatar className="h-16 w-16 border-2 border-white/10 shadow-huge relative ring-4 ring-black/40">
                                        <AvatarImage src={doc.author.image} />
                                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-black">{doc.author.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="text-left font-sans">
                                    <div className="font-black text-white text-lg leading-none mb-1.5 tracking-tight">{doc.author.name}</div>
                                    <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">@{doc.author.username}</div>
                                </div>
                            </div>
                            <div className="h-12 w-px bg-white/10" />
                            <div className="flex items-center gap-3 text-xs font-black tracking-[0.2em] uppercase text-white/50">
                                <Calendar className="h-5 w-5 text-primary/60" />
                                {format(new Date(doc.createdAt), 'MMM d, yyyy')}
                            </div>
                        </motion.div>
                    </header>

                    {/* Content */}
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:font-black prose-headings:tracking-tighter prose-code:font-code prose-pre:bg-transparent prose-pre:p-0 prose-p:text-white/70 prose-p:leading-relaxed prose-li:text-white/60">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                code({ node, inline, className, children, ...props }: any) {
                                    const match = /language-(\w+)/.exec(className || "");
                                    return !inline && match ? (
                                        <div className="my-12 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black/40 backdrop-blur-3xl p-2 h-fit">
                                            <div className="flex items-center gap-2 px-6 py-3 border-b border-white/5">
                                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-orange-500/50" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                                <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-white/30">{match[1]}</span>
                                            </div>
                                            <CodeBlock
                                                language={match[1]}
                                                code={String(children).replace(/\n$/, "")}
                                                className="text-sm border-none bg-transparent"
                                            />
                                        </div>
                                    ) : (
                                        <code className="bg-primary/20 text-primary px-2 py-0.5 rounded-md font-code text-[0.9em] font-bold" {...props}>
                                            {children}
                                        </code>
                                    );
                                },
                                h1: ({ node, ...props }) => <h1 className="text-5xl font-black mt-20 mb-10 text-white italic" {...props} />,
                                h2: ({ node, ...props }) => <h2 className="text-3xl font-black mt-16 mb-8 text-white/90 border-l-4 border-primary pl-6" {...props} />,
                                h3: ({ node, ...props }) => <h3 className="text-2xl font-bold mt-12 mb-6 text-white/80" {...props} />,
                                p: ({ node, ...props }) => <p className="leading-relaxed [&:not(:first-child)]:mt-8 text-white/70 text-lg" {...props} />,
                                ul: ({ node, ...props }) => <ul className="my-8 ml-8 list-disc [&>li]:mt-3" {...props} />,
                                blockquote: ({ node, ...props }) => (
                                    <blockquote className="mt-10 border-l-[6px] border-primary bg-white/[0.03] p-10 rounded-3xl italic text-white/60 text-xl font-medium" {...props} />
                                ),
                                img: ({ node, ...props }) => <img className="rounded-[3rem] border border-white/10 shadow-huge my-12 animate-float" {...props} />
                            }}
                        >
                            {doc.content}
                        </ReactMarkdown>
                    </div>

                    {/* Interaction Footer */}
                    <footer className="mt-20 pt-10 border-t border-white/5">
                        <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                                <Button variant="secondary" size="lg" className="gap-3 rounded-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold h-12 px-8 transition-all hover:scale-105 active:scale-95">
                                    <ThumbsUp className="h-5 w-5 text-primary" /> {doc._count?.likes || 0} Appreciation
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="gap-3 rounded-full bg-white/5 hover:bg-white/10 border-white/10 text-white font-bold h-12 px-8 transition-all hover:scale-105 active:scale-95"
                                    onClick={() => setShowComments(true)}
                                >
                                    <MessageSquare className="h-5 w-5 text-indigo-400" /> {doc._count?.comments || 0} Discourse
                                </Button>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-white/5 hover:bg-white/10 border-white/10 text-white transition-all hover:rotate-12">
                                <Share2 className="h-5 w-5" />
                            </Button>
                        </div>
                    </footer>
                </div>
            </article>

            <Sheet open={showComments} onOpenChange={setShowComments}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 border-l border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl glass-sidebar"
                    style={{ zIndex: 1000 }}
                >
                    <div className="h-full flex flex-col relative overflow-hidden">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

                        <div className="flex-1 relative z-10 overflow-hidden">
                            <DocumentComments documentId={doc.id} />
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}
