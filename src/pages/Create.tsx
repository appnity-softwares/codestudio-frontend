
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { snippetsAPI } from "@/lib/api";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";

export default function Create() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const [loading, setLoading] = useState(false);

    // Snippet State
    const [snippetTitle, setSnippetTitle] = useState("");
    const [snippetDesc, setSnippetDesc] = useState("");
    const [snippetLang, setSnippetLang] = useState("typescript");
    const [snippetType, setSnippetType] = useState("ALGORITHM");
    const [snippetDifficulty, setSnippetDifficulty] = useState("MEDIUM");
    const [snippetCode, setSnippetCode] = useState("");
    const [snippetTags, setSnippetTags] = useState("");
    const [stdIn, setStdIn] = useState("");
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ stdout: string; stderr: string; code: number } | null>(null);
    const [previewAlignment, setPreviewAlignment] = useState<'center' | 'top'>('center');

    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');
    const forkId = searchParams.get('fork');

    const handleRunCode = async () => {
        setExecuting(true);
        setExecutionResult(null); // Clear previous
        try {
            const res = await snippetsAPI.execute({
                language: snippetLang,
                code: snippetCode,
                stdin: stdIn
            });
            setExecutionResult(res.run);
            if (res.run.code !== 0) {
                toast({ title: "Execution Failed", description: "Check your code errors.", variant: "destructive" });
            } else {
                toast({ title: "Run Successful", description: "Output generated." });
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to run code", variant: "destructive" });
        } finally {
            setExecuting(false);
        }
    };

    // Fetch for Edit/Fork
    useEffect(() => {
        const loadSnippet = async (id: string, mode: 'edit' | 'fork') => {
            setLoading(true);
            try {
                // FIX: Destructure snippet from response
                const { snippet } = await snippetsAPI.getById(id);
                setSnippetTitle(mode === 'fork' ? `${snippet.title} (Fork)` : snippet.title);
                setSnippetDesc(snippet.description);
                setSnippetLang(snippet.language);
                setSnippetType(snippet.type || "ALGORITHM");
                setSnippetDifficulty(snippet.difficulty || "MEDIUM");
                setSnippetCode(snippet.code);
                setSnippetTags(snippet.tags?.join(", ") || "");
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load snippet." });
            } finally {
                setLoading(false);
            }
        };

        if (editId) loadSnippet(editId, 'edit');
        else if (forkId) loadSnippet(forkId, 'fork');
    }, [editId, forkId]);

    const handleSubmit = async () => {
        if (!snippetTitle || !snippetCode) {
            toast({ title: "Error", description: "Title and Code are required", variant: "destructive" });
            return;
        }

        // MVP Rule: Execution Success Required
        if (!executionResult || executionResult.code !== 0) {
            toast({ title: "Verification Failed", description: "You must successfully RUN your code before posting/updating.", variant: "destructive" });
            return;
        }

        // MVP Rule: Valid Output Required
        if (!executionResult.stdout && !executionResult.stderr) {
            if (snippetLang !== 'html' && snippetLang !== 'react') {
                toast({ title: "Invalid Output", description: "Snippet must produce output to be published.", variant: "destructive" });
                return;
            }
        }

        // Language Guards
        if (snippetLang === 'react') {
            if (!snippetCode.includes('export default') && !snippetCode.includes('return')) {
                toast({ title: "Syntax Error", description: "React snippets must export a component or return JSX.", variant: "destructive" });
                return;
            }
        }

        setLoading(true);
        try {
            const payload = {
                title: snippetTitle,
                description: snippetDesc,
                language: snippetLang,
                type: snippetType,
                difficulty: snippetDifficulty,
                code: snippetCode,
                tags: snippetTags.split(",").map(t => t.trim()).filter(Boolean),
                outputSnapshot: executionResult.stdout + (executionResult.stderr ? `\n[STDERR]\n${executionResult.stderr}` : ""),
                previewType: (snippetLang === 'html' || snippetLang === 'react')
                    ? (previewAlignment === 'center' ? "WEB_PREVIEW_CENTER" : "WEB_PREVIEW_TOP")
                    : "TERMINAL",
            };

            if (editId) {
                await snippetsAPI.update(editId, payload);
                toast({ title: "Updated", description: "Snippet updated successfully!" });
            } else {
                await snippetsAPI.create(payload);
                toast({ title: "Created", description: "Snippet created successfully!" });
            }
            navigate("/feed");
        } catch (error) {
            toast({ title: "Error", description: "Action failed", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    if (isMobile) {
        return (
            <div className="container max-w-lg mx-auto px-4 py-6 animate-in fade-in duration-500 pb-24">
                <h1 className="text-2xl font-headline font-bold mb-6">Create Snippet</h1>

                <Card className="border-border/50 bg-black/40 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-primary" />
                            Snippet Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-base">Title *</Label>
                            <Input
                                placeholder="My Awesome Component"
                                value={snippetTitle}
                                onChange={e => setSnippetTitle(e.target.value)}
                                className="h-12 touch-target text-base"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">Code</Label>
                            <Textarea
                                className="font-mono text-sm leading-relaxed min-h-[300px] bg-black/50 border-white/10 resize-none"
                                value={snippetCode}
                                onChange={e => setSnippetCode(e.target.value)}
                                placeholder="// Write your code here..."
                                spellCheck={false}
                            />
                        </div>

                        {/* Stdin Input */}
                        <div className="space-y-2">
                            <Label className="text-base">Standard Input (stdin)</Label>
                            <Textarea
                                className="font-mono text-sm min-h-[80px] bg-black/50 border-white/10 resize-none"
                                value={stdIn}
                                onChange={e => setStdIn(e.target.value)}
                                placeholder="Enter input for your program here (e.g. for input()...)"
                                spellCheck={false}
                            />
                        </div>

                        {/* Stdin Input */}
                        <div className="space-y-2">
                            <Label className="text-base">Standard Input (stdin)</Label>
                            <Textarea
                                className="font-mono text-sm min-h-[80px] bg-black/50 border-white/10 resize-none"
                                value={stdIn}
                                onChange={e => setStdIn(e.target.value)}
                                placeholder="Enter input for your program here..."
                                spellCheck={false}
                            />
                        </div>

                        {/* Execution Output (Mobile) */}
                        {executionResult && (
                            <div className="p-4 bg-black/90 rounded-xl border border-white/10 font-mono text-xs overflow-x-auto">
                                <div className="mb-2 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">Console Output</div>
                                <pre className="whitespace-pre-wrap text-emerald-400">
                                    {executionResult.stdout || executionResult.stderr || "No output"}
                                </pre>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                className="h-12 touch-target w-full"
                                variant="secondary"
                                onClick={handleRunCode}
                                disabled={executing || !snippetCode}
                            >
                                {executing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                Run
                            </Button>
                            <Button
                                className="h-12 touch-target w-full"
                                onClick={handleSubmit}
                                disabled={loading || !executionResult}
                            >
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Post
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">Description</Label>
                            <Textarea
                                className="min-h-[100px] text-base"
                                placeholder="What does this code do?"
                                value={snippetDesc}
                                onChange={e => setSnippetDesc(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">Language</Label>
                            <Select value={snippetLang} onValueChange={setSnippetLang}>
                                <SelectTrigger className="h-12 touch-target text-base">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                    <SelectItem value="go">Go</SelectItem>
                                    <SelectItem value="cpp">C++</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="rust">Rust</SelectItem>
                                    <SelectItem value="html">HTML + Tailwind</SelectItem>
                                    <SelectItem value="react">React</SelectItem>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                    <SelectItem value="mermaid">Mermaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-base">Type</Label>
                                <Select value={snippetType} onValueChange={setSnippetType}>
                                    <SelectTrigger className="h-12 touch-target text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALGORITHM">Algo</SelectItem>
                                        <SelectItem value="UTILITY">Utility</SelectItem>
                                        <SelectItem value="EXAMPLE">Example</SelectItem>
                                        <SelectItem value="VISUAL">Visual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-base">Difficulty</Label>
                                <Select value={snippetDifficulty} onValueChange={setSnippetDifficulty}>
                                    <SelectTrigger className="h-12 touch-target text-base">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-base">Tags</Label>
                            <Input
                                placeholder="react, ui, hooks"
                                value={snippetTags}
                                onChange={e => setSnippetTags(e.target.value)}
                                className="h-12 touch-target text-base"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ============ DESKTOP FULL MODE ============
    return (
        <div className="container max-w-6xl mx-auto py-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-headline font-bold mb-8">Create New Content</h1>

            {/* Two-Column Layout: Editor-First (Code on Left) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Col: Code Editor (PRIMARY) */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="border-border/50 bg-black/40 backdrop-blur-sm h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-semibold">1. Implementation</CardTitle>
                            <div className="w-[180px]">
                                <Select value={snippetLang} onValueChange={setSnippetLang}>
                                    <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="python">Python</SelectItem>
                                        <SelectItem value="javascript">JavaScript</SelectItem>
                                        <SelectItem value="typescript">TypeScript</SelectItem>
                                        <SelectItem value="go">Go</SelectItem>
                                        <SelectItem value="cpp">C++</SelectItem>
                                        <SelectItem value="java">Java</SelectItem>
                                        <SelectItem value="rust">Rust</SelectItem>
                                        <SelectItem value="html">HTML + Tailwind</SelectItem>
                                        <SelectItem value="react">React + Tailwind</SelectItem>
                                        <SelectItem value="markdown">Markdown</SelectItem>
                                        <SelectItem value="mermaid">Mermaid</SelectItem>
                                        <SelectItem value="c">C</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 flex-1 flex flex-col">
                            <div className="flex-1 min-h-[500px]">
                                <Textarea
                                    className="font-mono text-xs h-full min-h-[500px] resize-none leading-relaxed bg-black/50 border-white/10"
                                    value={snippetCode}
                                    onChange={e => setSnippetCode(e.target.value)}
                                    spellCheck={false}
                                    placeholder="// Write your code here..."
                                />
                            </div>

                            {/* Alignment Toggle */}
                            {(snippetLang === 'html' || snippetLang === 'react') && (
                                <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-md border border-border/40">
                                    <Label className="text-xs font-medium">Preview:</Label>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            size="sm"
                                            variant={previewAlignment === 'center' ? "secondary" : "ghost"}
                                            onClick={() => setPreviewAlignment('center')}
                                            className={cn("h-6 text-[10px]", previewAlignment === 'center' ? "bg-primary text-white" : "text-muted-foreground")}
                                        >
                                            Center
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant={previewAlignment === 'top' ? "secondary" : "ghost"}
                                            onClick={() => setPreviewAlignment('top')}
                                            className={cn("h-6 text-[10px]", previewAlignment === 'top' ? "bg-primary text-white" : "text-muted-foreground")}
                                        >
                                            Top-Left
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Execution Output */}
                            {executionResult && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-xs text-muted-foreground">Console Output</Label>
                                    <div className="bg-black/90 text-white p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-40 overflow-auto border-l-4 border-emerald-500">
                                        {executionResult.stdout || executionResult.stderr || "No output"}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4 border-t border-white/10 mt-auto">
                                <Button
                                    className="w-1/3"
                                    variant="secondary"
                                    onClick={handleRunCode}
                                    disabled={executing || !snippetCode}
                                >
                                    {executing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                    Run Code
                                </Button>
                                <Button
                                    className="w-2/3"
                                    onClick={handleSubmit}
                                    disabled={loading || !executionResult}
                                >
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {!executionResult ? "Run to Publish" : "Post Snippet"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Col: Metadata (Collapsible) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-border/50 bg-black/40 backdrop-blur-sm sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-base font-semibold">2. Snippet Metadata</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input placeholder="My Awesome Component" value={snippetTitle} onChange={e => setSnippetTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea className="min-h-[80px]" placeholder="What does this code do?" value={snippetDesc} onChange={e => setSnippetDesc(e.target.value)} />
                                <p className="text-[10px] text-muted-foreground">Focus on a single idea. Clean snippets perform better.</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Type</Label>
                                    <Select value={snippetType} onValueChange={setSnippetType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALGORITHM">Algorithm</SelectItem>
                                            <SelectItem value="UTILITY">Utility</SelectItem>
                                            <SelectItem value="EXAMPLE">Example</SelectItem>
                                            <SelectItem value="VISUAL">Visual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select value={snippetDifficulty} onValueChange={setSnippetDifficulty}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="EASY">Easy</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HARD">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Tags</Label>
                                <Input placeholder="react, ui, hooks" value={snippetTags} onChange={e => setSnippetTags(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
