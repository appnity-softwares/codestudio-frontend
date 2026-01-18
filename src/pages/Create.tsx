import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { snippetsAPI } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Code2, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Create() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Snippet State
    const [snippetTitle, setSnippetTitle] = useState("");
    const [snippetDesc, setSnippetDesc] = useState("");
    const [snippetLang, setSnippetLang] = useState("typescript");
    const [snippetType, setSnippetType] = useState("ALGORITHM");
    const [snippetDifficulty, setSnippetDifficulty] = useState("MEDIUM");
    const [snippetCode, setSnippetCode] = useState("");
    const [snippetTags, setSnippetTags] = useState("");
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ stdout: string; stderr: string; code: number } | null>(null);
    const [previewAlignment, setPreviewAlignment] = useState<'center' | 'top'>('center');

    const handleRunCode = async () => {
        setExecuting(true);
        setExecutionResult(null); // Clear previous
        try {
            const res = await snippetsAPI.execute(snippetLang, snippetCode);
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

    const handleCreateSnippet = async () => {
        if (!snippetTitle || !snippetCode) {
            toast({ title: "Error", description: "Title and Code are required", variant: "destructive" });
            return;
        }

        // MVP Rule: Execution Success Required
        if (!executionResult || executionResult.code !== 0) {
            toast({ title: "Verification Failed", description: "You must successfully RUN your code before posting.", variant: "destructive" });
            return;
        }

        // MVP Rule: Valid Output Required
        if (!executionResult.stdout && !executionResult.stderr) {
            // For React/HTML, we might skip this if they don't produce stdout but render. 
            // backend piston.go mocks stdout for them.
            // If manual piston run returns empty, block.
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
            await snippetsAPI.create({
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
            });
            toast({ title: "Success", description: "Snippet created successfully!" });
            navigate("/feed");
        } catch (error) {
            toast({ title: "Error", description: "Failed to create snippet", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-2xl mx-auto py-10 animate-in fade-in duration-500">
            <h1 className="text-3xl font-headline font-bold mb-8">Create New Content</h1>

            <Card className="border-border/50 bg-black/40 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5 text-primary" />
                        Create Snippet
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input placeholder="My Awesome Component" value={snippetTitle} onChange={e => setSnippetTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea placeholder="What does this code do?" value={snippetDesc} onChange={e => setSnippetDesc(e.target.value)} />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Select value={snippetLang} onValueChange={setSnippetLang}>
                                <SelectTrigger>
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
                                    <SelectItem value="c">C</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tags (comma separated)</Label>
                            <Input placeholder="react, ui, hooks" value={snippetTags} onChange={e => setSnippetTags(e.target.value)} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Textarea
                            className="font-mono text-xs min-h-[200px]"
                            value={snippetCode}
                            onChange={e => setSnippetCode(e.target.value)}
                            spellCheck={false}
                        />
                    </div>

                    {/* Alignment Toggle for Web Previews */}
                    {(snippetLang === 'html' || snippetLang === 'react') && (
                        <div className="flex items-center gap-4 bg-muted/30 p-3 rounded-md border border-border/40">
                            <Label className="text-sm font-medium">Initial Preview Alignment:</Label>
                            <div className="flex items-center gap-2">
                                <Button
                                    size="sm"
                                    variant={previewAlignment === 'center' ? "secondary" : "ghost"}
                                    onClick={() => setPreviewAlignment('center')}
                                    className={cn("h-7 text-xs", previewAlignment === 'center' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                                >
                                    Center
                                </Button>
                                <Button
                                    size="sm"
                                    variant={previewAlignment === 'top' ? "secondary" : "ghost"}
                                    onClick={() => setPreviewAlignment('top')}
                                    className={cn("h-7 text-xs", previewAlignment === 'top' ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
                                >
                                    Top-Left
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Execution Output */}
                    {executionResult && (
                        <div className="space-y-2">
                            <Label>Output</Label>
                            <div className="bg-black/90 text-white p-4 rounded-md font-mono text-sm whitespace-pre-wrap max-h-40 overflow-auto">
                                {executionResult.stdout || executionResult.stderr || "No output"}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
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
                            onClick={handleCreateSnippet}
                            disabled={loading || !executionResult}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {!executionResult ? "Run to Publish" : "Post Snippet"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
