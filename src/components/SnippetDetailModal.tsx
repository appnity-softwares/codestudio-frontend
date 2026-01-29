"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "./CodeBlock";
import { ReactLivePreview } from "./preview/ReactLivePreview";
import { SnippetInteraction } from "./SnippetInteraction";
import { formatDistanceToNow } from "date-fns";
import { Copy, Terminal, Code2, MessageSquare, Info } from "lucide-react";
import { CommentsSection } from "./CommentsSection";

interface SnippetDetailModalProps {
    snippet: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SnippetDetailModal({ snippet, open, onOpenChange }: SnippetDetailModalProps) {
    const isReact = snippet.language?.toLowerCase() === 'react' || snippet.language?.toLowerCase() === 'javascript';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0 overflow-hidden glass-card border-primary/20">
                <div className="flex flex-1 min-h-0">
                    {/* Left/Top Panel: Preview & Code */}
                    <div className="flex-1 flex flex-col border-r border-border/50">
                        <DialogHeader className="p-6 border-b border-border/50">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="uppercase text-[10px] tracking-widest font-black text-primary border-primary/20">
                                            {snippet.language}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'just now'}
                                        </span>
                                    </div>
                                    <DialogTitle className="text-2xl font-headline font-bold leading-tight">{snippet.title}</DialogTitle>
                                    <DialogDescription className="text-base line-clamp-2">
                                        {snippet.description}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <div className="flex-1 min-h-0 bg-muted/5 relative group">
                            <Tabs defaultValue="preview" className="h-full flex flex-col">
                                <div className="flex items-center justify-between px-4 py-2 border-b bg-background/50">
                                    <TabsList className="h-8">
                                        <TabsTrigger value="preview" className="text-xs h-7"><Terminal className="w-3 h-3 mr-2" /> Output</TabsTrigger>
                                        <TabsTrigger value="code" className="text-xs h-7"><Code2 className="w-3 h-3 mr-2" /> Source</TabsTrigger>
                                    </TabsList>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8"><Copy className="h-4 w-4" /></Button>
                                    </div>
                                </div>
                                <TabsContent value="preview" className="flex-1 m-0 p-0 relative overflow-hidden">
                                    {isReact ? (
                                        <div className="absolute inset-0 p-8 flex items-center justify-center bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05]">
                                            <ReactLivePreview code={snippet.code} />
                                        </div>
                                    ) : (
                                        <div className="h-full bg-[#0c0c0e] p-6 font-mono text-sm overflow-auto">
                                            {snippet.outputSnapshot ? (
                                                (() => {
                                                    try {
                                                        const output = JSON.parse(snippet.outputSnapshot);
                                                        return (
                                                            <div className="space-y-4">
                                                                <div className="flex items-center gap-2 mb-4 text-white/40 uppercase tracking-widest text-[10px] font-black">
                                                                    <Terminal className="h-3 w-3" /> Execution Payload
                                                                </div>
                                                                {output.stdout && <div className="text-green-400 whitespace-pre-wrap">{output.stdout}</div>}
                                                                {output.stderr && <div className="text-red-400 border-t border-red-900/50 pt-2 mt-2 whitespace-pre-wrap">{output.stderr}</div>}
                                                                {!output.stdout && !output.stderr && <div className="text-white/20 italic">Output is empty.</div>}
                                                            </div>
                                                        );
                                                    } catch (e) {
                                                        return <div className="text-white/20 whitespace-pre-wrap">{snippet.outputSnapshot}</div>;
                                                    }
                                                })()
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
                                                    <Terminal className="h-10 w-10 mb-2" />
                                                    <p className="text-xs uppercase tracking-widest">No Execution Output Recorded</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>
                                <TabsContent value="code" className="flex-1 m-0 p-0 relative overflow-hidden">
                                    <ScrollArea className="h-full">
                                        <div className="p-0">
                                            <CodeBlock code={snippet.code} language={snippet.language || 'typescript'} />
                                        </div>
                                    </ScrollArea>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>



                    {/* Right/Bottom Panel: Details & Interaction */}
                    <div className="w-[350px] flex flex-col bg-background border-l border-border/50">
                        <div className="p-4 border-b flex items-center gap-3 bg-muted/5">
                            <Avatar className="h-10 w-10 border border-primary/20">
                                <AvatarImage src={snippet.author?.image} />
                                <AvatarFallback>{snippet.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{snippet.author?.name || 'Anonymous'}</h4>
                                <p className="text-xs text-muted-foreground truncate">@{snippet.author?.username || 'user'}</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full h-7 text-xs">Follow</Button>
                        </div>

                        <Tabs defaultValue="comments" className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 pt-2 pb-0 border-b">
                                <TabsList className="w-full grid grid-cols-2 h-9 p-1 bg-muted/20">
                                    <TabsTrigger value="info" className="text-xs flex gap-2"><Info className="w-3 h-3" /> Info</TabsTrigger>
                                    <TabsTrigger value="comments" className="text-xs flex gap-2"><MessageSquare className="w-3 h-3" /> Comments</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="info" className="flex-1 m-0 overflow-hidden">
                                <ScrollArea className="h-full p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Tags</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {snippet.tags?.map((tag: string) => (
                                                    <Badge key={tag} variant="secondary" className="rounded-md px-2 py-0.5 text-xs">#{tag}</Badge>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Stats</h5>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 rounded-xl bg-muted/30 border">
                                                    <div className="text-xl font-bold font-headline">1.2k</div>
                                                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Views</div>
                                                </div>

                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                            <h5 className="text-sm font-bold mb-1 flex items-center gap-2"><Terminal className="h-3 w-3" /> AI Insight</h5>
                                            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                                                This snippet uses <strong>{snippet.language}</strong> efficiently.
                                                Consider memoizing callback functions for better performance in larger component trees.
                                            </p>
                                        </div>
                                    </div>
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="comments" className="flex-1 m-0 overflow-hidden">
                                <CommentsSection snippetId={snippet.id} comments={snippet.comments} />
                            </TabsContent>
                        </Tabs>

                        <div className="p-3 border-t bg-background">
                            <SnippetInteraction snippet={snippet} className="mt-0 pt-0 border-none justify-around" />
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
