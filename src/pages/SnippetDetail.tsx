"use client";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { snippetsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeBlock } from "@/components/CodeBlock";
import { ReactLivePreview } from "@/components/preview/ReactLivePreview";
import { SnippetInteraction } from "@/components/SnippetInteraction";
// import { CommentsSection } from "@/components/CommentsSection";
import { formatDistanceToNow } from "date-fns";
import { Copy, Terminal, Code2, Info, ArrowLeft, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SeoMeta";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { incrementCopyCount, setCopyCount } from "@/store/slices/snippetSlice";
import { debounce } from "lodash-es";
import { useCallback } from "react";
import { HamsterLoader } from "@/components/shared/HamsterLoader";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SnippetDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [snippet, setSnippet] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [annotations, setAnnotations] = useState<{ line: number; content: string }[]>([]);

    // Annotation Dialog State
    const [isAnnotationDialogOpen, setIsAnnotationDialogOpen] = useState(false);
    const [selectedLine, setSelectedLine] = useState<number | null>(null);
    const [annotationText, setAnnotationText] = useState("");
    const [isSavingAnnotation, setIsSavingAnnotation] = useState(false);

    const { user } = useAuth();
    const isAuthor = user?.id === snippet?.authorId;

    const dispatch = useDispatch();
    const reduxCopyCount = useSelector((state: RootState) => state.snippets.copyCounts[id || ""]);
    const hasCopiedLocally = useSelector((state: RootState) => state.snippets.userCopies[id || ""]);

    const debouncedRecordCopy = useCallback(
        debounce((tid: string) => {
            snippetsAPI.recordCopy(tid).catch(console.error);
        }, 1000, { leading: true, trailing: false }),
        []
    );

    const handleCopy = () => {
        if (!snippet) return;
        navigator.clipboard.writeText(snippet.code);
        toast({ title: "Copied!", description: "Code copied to clipboard." });

        if (!hasCopiedLocally && id) {
            dispatch(incrementCopyCount(id));
            debouncedRecordCopy(id);
        }
    };

    useEffect(() => {
        const fetchSnippet = async () => {
            if (!id) return;
            try {
                // Fire view tracking (fire-and-forget)
                snippetsAPI.recordView(id).catch(() => { });

                setLoading(true);
                const data = await snippetsAPI.getById(id);
                setSnippet(data.snippet);
                dispatch(setCopyCount({ id, count: data.snippet.copyCount || 0 }));

                // Parse annotations
                if (data.snippet.annotations) {
                    try {
                        setAnnotations(JSON.parse(data.snippet.annotations));
                    } catch (e) {
                        console.error("Failed to parse annotations", e);
                        setAnnotations([]);
                    }
                } else {
                    setAnnotations([]);
                }

            } catch (err) {
                setError("Failed to load snippet");
                toast({ variant: "destructive", title: "Error", description: "Failed to load snippet" });
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSnippet();
    }, [id, toast]);

    const handleAddAnnotation = (line: number) => {
        setSelectedLine(line);
        const existing = annotations.find(a => a.line === line);
        setAnnotationText(existing ? existing.content : "");
        setIsAnnotationDialogOpen(true);
    };

    const handleSaveAnnotation = async () => {
        if (!id || selectedLine === null) return;
        setIsSavingAnnotation(true);
        try {
            let newAnnotations = [...annotations];
            const existingIndex = newAnnotations.findIndex(a => a.line === selectedLine);

            if (annotationText.trim() === "") {
                // Remove if empty
                if (existingIndex !== -1) newAnnotations.splice(existingIndex, 1);
            } else {
                if (existingIndex !== -1) {
                    newAnnotations[existingIndex].content = annotationText;
                } else {
                    newAnnotations.push({ line: selectedLine, content: annotationText });
                }
            }

            await snippetsAPI.update(id, {
                annotations: JSON.stringify(newAnnotations)
            });

            setAnnotations(newAnnotations);
            setIsAnnotationDialogOpen(false);
            toast({ title: "Annotation Saved", description: "Your comment has been attached to the code." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: "Failed to save annotation" });
        } finally {
            setIsSavingAnnotation(false);
        }
    };

    if (loading) {
        return <HamsterLoader fullPage size={20} />;
    }

    // ... (Error handling omitted for brevity, matches existing) ...
    if (error || !snippet) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">{error || "Snippet not found"}</p>
                <Button variant="outline" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
                </Button>
            </div>
        );
    }


    const isReact = snippet.language?.toLowerCase() === 'react' || snippet.language?.toLowerCase() === 'javascript';

    return (
        <div className="container max-w-6xl mx-auto py-6 px-4">
            <SEO
                title={`${snippet.title} | CodeStudio`}
                description={snippet.description || `Check out this ${snippet.language} snippet by ${snippet.author?.name}`}
                type="article"
                image={snippet.author?.image}
                url={window.location.href}
                schema={JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareSourceCode",
                    "name": snippet.title,
                    "programmingLanguage": snippet.language,
                    "author": {
                        "@type": "Person",
                        "name": snippet.author?.name,
                        "url": `${window.location.origin}/u/${snippet.author?.username}`
                    },
                    "dateCreated": snippet.createdAt,
                    "text": snippet.code,
                    "codeSampleType": "full code"
                })}
            />
            {snippet && (
                <BreadcrumbSchema items={[
                    { name: 'Home', item: window.location.origin },
                    { name: 'Snippets', item: `${window.location.origin}/snippets` },
                    { name: snippet.title, item: window.location.href }
                ]} />
            )}

            {/* Back button */}
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="uppercase text-[10px] tracking-widest font-black text-primary border-primary/20">
                                {snippet.language}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                {snippet.createdAt ? formatDistanceToNow(new Date(snippet.createdAt), { addSuffix: true }) : 'just now'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-headline font-bold">{snippet.title}</h1>
                        <p className="text-muted-foreground">{snippet.description}</p>
                    </div>

                    {/* Code/Preview Tabs */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Tabs defaultValue="preview" className="w-full">
                            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                                <TabsList className="h-8">
                                    <TabsTrigger value="preview" className="text-xs h-7"><Terminal className="w-3 h-3 mr-2" /> Output</TabsTrigger>
                                    <TabsTrigger value="code" className="text-xs h-7"><Code2 className="w-3 h-3 mr-2" /> Source</TabsTrigger>
                                </TabsList>
                                <div className="flex items-center gap-1">

                                    <Button variant="ghost" size="sm" className="h-8 px-2 flex items-center gap-1.5" onClick={handleCopy}>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span className="text-xs font-mono">{reduxCopyCount || 0}</span>
                                    </Button>
                                </div>
                            </div>
                            <TabsContent value="preview" className="m-0 min-h-[300px]">
                                {(() => {
                                    if (isReact) {
                                        return (
                                            <div className="p-8 flex items-center justify-center bg-grid-slate-900/[0.04] dark:bg-grid-slate-400/[0.05] min-h-[300px]">
                                                <ReactLivePreview code={snippet.code} />
                                            </div>
                                        );
                                    } else if (snippet.language?.toLowerCase() === 'html') {
                                        return (
                                            <div className="p-4 bg-white dark:bg-zinc-950 min-h-[300px] rounded-lg border">
                                                <iframe
                                                    srcDoc={snippet.code}
                                                    className="w-full h-full min-h-[400px] border-0"
                                                    title="Preview"
                                                    sandbox="allow-scripts"
                                                />
                                            </div>
                                        );
                                    } else {
                                        // For backend languages, show Terminal Output from Snapshot
                                        let stdout = "";
                                        let stderr = "";

                                        if (snippet.outputSnapshot) {
                                            try {
                                                const parsed = JSON.parse(snippet.outputSnapshot);
                                                stdout = parsed.stdout || "";
                                                stderr = parsed.stderr || "";
                                            } catch (e) {
                                                // If not JSON, it's a raw string
                                                stdout = snippet.outputSnapshot;
                                            }
                                        }

                                        if (stdout || stderr) {
                                            return (
                                                <div className="bg-black text-green-400 p-6 font-mono text-sm min-h-[300px] rounded-lg overflow-x-auto whitespace-pre-wrap">
                                                    {stdout && <div>{stdout}</div>}
                                                    {stderr && <div className="text-red-400 mt-4 border-t border-red-900/50 pt-2">{stderr}</div>}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="flex items-center justify-center min-h-[300px] text-muted-foreground p-8 text-center">
                                                <div className="space-y-2">
                                                    <Terminal className="h-12 w-12 mx-auto opacity-20" />
                                                    <p>No output available.</p>
                                                </div>
                                            </div>
                                        );
                                    }
                                })()}
                            </TabsContent>
                            <TabsContent value="code" className="m-0 relative">
                                {isAuthor && (
                                    <div className="bg-primary/5 border-b border-primary/20 px-4 py-2 flex items-center gap-2">
                                        <Info className="h-3.5 w-3.5 text-primary" />
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-primary/80">
                                            Pro Tip: Hover over line numbers to add explanations
                                        </p>
                                    </div>
                                )}
                                <ScrollArea className="max-h-[500px]">
                                    <CodeBlock
                                        code={snippet.code}
                                        language={snippet.language || 'typescript'}
                                        annotations={annotations}
                                        onAddAnnotation={handleAddAnnotation}
                                        isAuthor={isAuthor}
                                    />
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Interactions */}
                    <div className="p-4 rounded-xl border bg-card">
                        <SnippetInteraction snippet={snippet} className="justify-around" />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Author */}
                    <div className="p-4 rounded-xl border bg-card flex items-center gap-3">
                        <Avatar className="h-12 w-12 border border-primary/20">
                            <AvatarImage src={snippet.author?.image} />
                            <AvatarFallback>{snippet.author?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold truncate">{snippet.author?.name || 'Anonymous'}</h4>
                            <p className="text-sm text-muted-foreground truncate">@{snippet.author?.username || 'user'}</p>
                        </div>
                    </div>

                    {/* Info Tabs */}
                    <div className="rounded-xl border bg-card overflow-hidden">
                        <Tabs defaultValue="info" className="w-full">
                            <div className="px-4 pt-3 pb-0 border-b">
                                <TabsList className="w-full grid grid-cols-1 h-9 p-1 bg-muted/20">
                                    <TabsTrigger value="info" className="text-xs flex gap-2"><Info className="w-3 h-3" /> Info</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="info" className="m-0 p-4">
                                <div className="space-y-4">
                                    <div>
                                        <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Tags</h5>
                                        <div className="flex flex-wrap gap-2">
                                            {snippet.tags?.map((tag: string) => (
                                                <Badge key={tag} variant="secondary" className="rounded-md px-2 py-0.5 text-xs">#{tag}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                    {snippet.referenceUrl && (
                                        <div>
                                            <h5 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-2">Reference</h5>
                                            <a
                                                href={snippet.referenceUrl.startsWith('http') ? snippet.referenceUrl : `https://${snippet.referenceUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline group"
                                            >
                                                <ExternalLink className="h-3 w-3 group-hover:scale-110 transition-transform" />
                                                External Source
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>

            {/* Annotation Dialog */}
            <Dialog open={isAnnotationDialogOpen} onOpenChange={setIsAnnotationDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Annotation to Line {selectedLine}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="annotation">Comment</Label>
                            <Textarea
                                id="annotation"
                                placeholder="Explain this complex logic..."
                                value={annotationText}
                                onChange={(e) => setAnnotationText(e.target.value)}
                                className="min-h-[100px]"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAnnotationDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveAnnotation} disabled={isSavingAnnotation}>
                            {isSavingAnnotation ? "Saving..." : "Save Annotation"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}