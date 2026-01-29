
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
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useBadgeCelebration } from "@/context/BadgeContext";
import { ReactLivePreview } from "@/components/preview/ReactLivePreview";
import { MermaidDiagram } from "@/components/preview/MermaidDiagram";
import { CodeEditor } from "@/components/CodeEditor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { SnippetCard } from "@/components/SnippetCard";
import { TagInput } from "@/components/ui/tag-input";
import {
    Terminal as TerminalIcon,
    Info,
    RefreshCcw,
    Sparkles,
    Play,
    Loader2,
    Code2,
    Eye,
    Globe,
    ChevronLeft
} from "lucide-react";

const BOILERPLATES: Record<string, string> = {
    python: `def main():\n    print("Hello from Python!")\n    \nif __name__ == "__main__":\n    main()`,
    javascript: `// A simple algorithm example\nfunction helloWorld() {\n    console.log("Hello from JavaScript!");\n}\n\nhelloWorld();`,
    typescript: `// Type-safe greetings\ninterface User {\n    name: string;\n}\n\nfunction greet(user: User) {\n    console.log(\`Hello, \${user.name}!\`);\n}\n\ngreet({ name: "Developer" });`,
    go: `package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello from Go!")\n}`,
    cpp: `#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}`,
    java: `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Java!");\n    }\n}`,
    rust: `fn main() {\n    println!("Hello from Rust!");\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    printf("Hello from C!\\n");\n    return 0;\n}`,
    html: `<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #0f172a; color: white; margin: 0; }\n        .card { padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 1rem; border: 1px solid rgba(255,255,255,0.1); text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }\n        h1 { color: #38bdf8; margin: 0 0 1rem 0; font-size: 2.5rem; }\n    </style>\n</head>\n<body>\n    <div class="card">\n        <h1>Hello CodeStudio</h1>\n        <p>Edit this code to see live changes!</p>\n    </div>\n</body>\n</html>`,
    react: `import React, { useState } from 'react';\n\nexport default function App() {\n    const [count, setCount] = useState(0);\n\n    return (\n        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-8 font-sans">\n            <h1 className="text-5xl font-extrabold text-sky-400 mb-6 drop-shadow-md">\n                React Preview\n            </h1>\n            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl shadow-2xl">\n                <p className="text-xl text-slate-300 mb-6">Interactive component demonstration</p>\n                <button \n                    onClick={() => setCount(c => c + 1)}\n                    className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-sky-500/20"\n                >\n                    Clicked {count} times\n                </button>\n            </div>\n        </div>\n    );\n}`,
    markdown: `# 🖋️ Markdown Preview\n\nWelcome to the **CodeStudio** Markdown editor!\n\n## Features:\n- **Rich Text**: Bold, *italic*, ~~strikethrough~~\n- **Lists**:\n  1. Automated\n  2. Sequential\n  3. Interactive\n- **Code Blocks**:\n\`\`\`javascript\nconsole.log("Hello World");\n\`\`\`\n\n> "Simplicity is the soul of efficiency."\n`,
    mermaid: `graph TD\n    A[Start] --> B{Is it working?}\n    B -- Yes --> C[Great!]\n    B -- No --> D[Fix it]\n    D --> B\n    C --> E[End]\n\n    style A fill:#38bdf8,stroke:#0f172a,color:#fff\n    style C fill:#27c93f,stroke:#0f172a,color:#fff\n    style E fill:#ff5f56,stroke:#0f172a,color:#fff`
};

export default function Create() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { celebrate, celebrateXP } = useBadgeCelebration();
    const [loading, setLoading] = useState(false);

    // Ensure we start at the top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => titleInputRef.current?.focus(), 100);
    }, []);

    // Snippet State
    const [snippetTitle, setSnippetTitle] = useState("");
    const [snippetDesc, setSnippetDesc] = useState("");
    const [snippetLang, setSnippetLang] = useState("typescript");
    const [snippetType, setSnippetType] = useState("ALGORITHM");
    const [snippetDifficulty, setSnippetDifficulty] = useState("MEDIUM");
    const [snippetCode, setSnippetCode] = useState(BOILERPLATES["typescript"]);
    const [snippetTags, setSnippetTags] = useState("");
    const [snippetRefUrl, setSnippetRefUrl] = useState("");
    const [stdIn, setStdIn] = useState("");
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<{ stdout: string; stderr: string; code: number } | null>(null);
    const [terminalLines, setTerminalLines] = useState<{ type: 'input' | 'output' | 'error', text: string }[]>([]);
    const [activeTab, setActiveTab] = useState("terminal");
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const terminalEndRef = useRef<HTMLDivElement>(null);
    const terminalInputRef = useRef<HTMLInputElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);

    const MAX_TITLE = 80;
    const MAX_DESC = 300;

    // Visual Preview Support
    const isVisualLang = ['html', 'react', 'markdown', 'mermaid'].includes(snippetLang);
    const [previewKey, setPreviewKey] = useState(0); // For forcing re-renders

    // Unified Language Change Handler
    const handleLanguageChange = (newLang: string) => {
        // If current code is empty or a known boilerplate, update it to the new boilerplate
        const isCurrentCodeBoilerplate = Object.values(BOILERPLATES).some(b => b.trim() === snippetCode.trim());

        if (!snippetCode || isCurrentCodeBoilerplate) {
            if (BOILERPLATES[newLang]) {
                setSnippetCode(BOILERPLATES[newLang]);
            }
        }

        setSnippetLang(newLang);

        // Reset execution state when switching language
        setExecutionResult(null);
        setTerminalLines([]);

        const isVisual = ['html', 'react', 'markdown', 'mermaid'].includes(newLang);
        if (isVisual) {
            setActiveTab("preview");
            setPreviewKey(prev => prev + 1);
        } else {
            setActiveTab("terminal");
        }
    };

    // Auto-scroll terminal
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalLines]);

    // Focus terminal input when switching to terminal tab manually (not on mount)
    useEffect(() => {
        if (activeTab === 'terminal' && snippetTitle) { // Only focus if we've already interacted or filled title
            setTimeout(() => terminalInputRef.current?.focus(), 100);
        }
    }, [activeTab]);

    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

    const handleRunCode = async (stdinOverride?: string) => {
        setExecuting(true);
        const inputToUse = stdinOverride !== undefined ? stdinOverride : stdIn;

        try {
            const res = await snippetsAPI.execute({
                language: snippetLang,
                code: snippetCode,
                stdin: inputToUse
            });

            setExecutionResult(res.run);

            // Build the terminal view from scratch for stateless result simulation
            const lines: { type: 'input' | 'output' | 'error', text: string }[] = [];

            // Reconstruct the history of inputs entered so far
            const inputs = inputToUse ? inputToUse.split('\n') : [];

            // Display each input we've sent
            inputs.forEach(input => {
                if (input.trim() || input === "") {
                    lines.push({ type: 'input', text: input });
                }
            });

            // Append the total output from the stateless run
            if (res.run.stdout) {
                lines.push({ type: 'output', text: res.run.stdout });
            }
            if (res.run.stderr) {
                lines.push({ type: 'error', text: res.run.stderr });
            }

            setTerminalLines(lines);

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

    // Fetch for Edit
    useEffect(() => {
        const loadSnippet = async (id: string) => {
            setLoading(true);
            try {
                // FIX: Destructure snippet from response
                const { snippet } = await snippetsAPI.getById(id);
                setSnippetTitle(snippet.title);
                setSnippetDesc(snippet.description);
                setSnippetLang(snippet.language);
                setSnippetType(snippet.type || "ALGORITHM");
                setSnippetDifficulty(snippet.difficulty || "MEDIUM");
                setSnippetCode(snippet.code);
                setSnippetTags(snippet.tags?.join(", ") || "");
                setSnippetRefUrl(snippet.referenceUrl || "");
                if (snippet.stdinHistory) {
                    try {
                        setTerminalLines(JSON.parse(snippet.stdinHistory));
                    } catch (e) {
                        console.error("Failed to parse stdinHistory", e);
                    }
                }
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load snippet." });
            } finally {
                setLoading(false);
            }
        };

        if (editId) loadSnippet(editId);
    }, [editId]);

    const handleSubmit = async () => {
        if (!snippetTitle || !snippetCode) {
            toast({ title: "Missing Information", description: "Please provide both a title and the source code.", variant: "destructive" });
            return;
        }

        // MVP Rule: Execution Success Required (only for non-visual languages)
        if (!isVisualLang && (!executionResult || executionResult.code !== 0)) {
            toast({
                title: "Run Verification Required",
                description: "You must successfully RUN your code once before publishing. This ensures quality in the feed.",
                variant: "destructive"
            });
            // Auto-switch back to code tab and highlight run button logic could go here
            setActiveTab('terminal');
            return;
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
                outputSnapshot: executionResult ? (executionResult.stdout + (executionResult.stderr ? `\n[STDERR]\n${executionResult.stderr}` : "")) : "",
                previewType: isVisualLang ? "WEB_PREVIEW_CENTER" : "TERMINAL",
                referenceUrl: snippetRefUrl,
                stdinHistory: JSON.stringify(terminalLines),
                status: 'PUBLISHED'
            };

            if (editId) {
                await snippetsAPI.update(editId, payload);
                toast({ title: "Changes Saved", description: "Your snippet has been updated successfully!" });
            } else {
                const res = await snippetsAPI.create(payload) as any;
                toast({ title: "Published! 🚀", description: "Your code is now live on the feed." });

                // Reward XP for creation
                celebrateXP(50);

                if (res.newBadges && res.newBadges.length > 0) {
                    celebrate(res.newBadges);
                }
            }
            navigate("/feed");
        } catch (error) {
            toast({ title: "Action Failed", description: "We couldn't save your snippet. Please check your connection.", variant: "destructive" });
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
                        <div className="space-y-4">
                            <Label className="text-base">Code</Label>
                            <div className="h-[400px] border border-white/10 rounded-xl overflow-hidden bg-black/50">
                                <CodeEditor
                                    code={snippetCode}
                                    language={snippetLang}
                                    onChange={(val) => setSnippetCode(val || "")}
                                />
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="terminal" className="flex items-center gap-2">
                                    <TerminalIcon className="h-4 w-4" />
                                    Terminal
                                </TabsTrigger>
                                <TabsTrigger value="details" className="flex items-center gap-2">
                                    <Info className="h-4 w-4" />
                                    Metadata
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="terminal" className="mt-4 space-y-4">
                                <div className="bg-black/90 rounded-xl border border-white/10 font-mono text-sm overflow-hidden flex flex-col min-h-[300px]">
                                    <div className="p-2 border-b border-white/10 bg-white/5 flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-2">Console</span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => { setStdIn(""); setTerminalLines([]); setExecutionResult(null); }}
                                        >
                                            <RefreshCcw className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 p-4 overflow-y-auto max-h-[400px] space-y-1">
                                        {terminalLines.length === 0 && !executing && (
                                            <div className="text-muted-foreground italic">Code studio v1.0.0 - Run your code to see output...</div>
                                        )}
                                        {terminalLines.map((line, i) => (
                                            <div key={i} className={cn(
                                                "whitespace-pre-wrap break-all",
                                                line.type === 'input' ? "text-primary before:content-['>_']" :
                                                    line.type === 'error' ? "text-destructive" : "text-emerald-400"
                                            )}>
                                                {line.text}
                                            </div>
                                        ))}
                                        {executing && (
                                            <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                                Executing...
                                            </div>
                                        )}
                                    </div>
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const form = e.currentTarget;
                                            const input = form.elements.namedItem('terminalInput') as HTMLInputElement;
                                            const val = input.value;
                                            if (!val) return;

                                            const newStdin = stdIn ? stdIn + "\n" + val : val;
                                            setStdIn(newStdin);
                                            setTerminalLines(prev => [...prev, { type: 'input', text: val }]);
                                            input.value = "";
                                            handleRunCode(newStdin);
                                        }}
                                        className="p-2 border-t border-white/10 bg-white/5 flex items-center gap-2"
                                    >
                                        <span className="text-primary font-bold text-sm ml-2">{">"}</span>
                                        <input
                                            name="terminalInput"
                                            className="flex-1 bg-transparent border-none outline-none text-sm font-mono text-white placeholder:text-muted-foreground/30"
                                            placeholder="Enter input here..."
                                            autoComplete="off"
                                        />
                                    </form>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        className="h-12 touch-target w-full"
                                        variant="secondary"
                                        onClick={() => handleRunCode()}
                                        disabled={executing || !snippetCode}
                                    >
                                        {executing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                                        Run
                                    </Button>
                                    <Button
                                        className="h-12 touch-target w-full"
                                        onClick={handleSubmit}
                                        disabled={loading || (!isVisualLang && !executionResult)}
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Post
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="details" className="mt-4 space-y-6">
                                <div className="space-y-2">
                                    <Label>Title *</Label>
                                    <Input
                                        placeholder="My Awesome Component"
                                        value={snippetTitle}
                                        onChange={e => setSnippetTitle(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        className="min-h-[100px]"
                                        placeholder="What does this code do?"
                                        value={snippetDesc}
                                        onChange={e => setSnippetDesc(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Type</Label>
                                        <Select value={snippetType} onValueChange={setSnippetType}>
                                            <SelectTrigger className="h-12">
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
                                        <Label>Difficulty</Label>
                                        <Select value={snippetDifficulty} onValueChange={setSnippetDifficulty}>
                                            <SelectTrigger className="h-12">
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
                                    <Input
                                        placeholder="react, ui, hooks"
                                        value={snippetTags}
                                        onChange={e => setSnippetTags(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Reference URL</Label>
                                    <Input
                                        placeholder="https://docs.microsoft.com/..."
                                        value={snippetRefUrl}
                                        onChange={e => setSnippetRefUrl(e.target.value)}
                                        className="h-12"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ============ DESKTOP FULL MODE ============
    return (
        <div className="container max-w-7xl mx-auto py-10 animate-in fade-in duration-500 min-h-screen px-4">
            <div className="flex flex-col gap-8">
                {/* Sticky Header Information Area */}
                <div className="sticky top-0 z-50 py-6 -mt-10 bg-canvas/60 backdrop-blur-3xl border-b border-white/5 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(-1)}
                                className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary/50 text-white/50 hover:text-primary transition-all group/back"
                            >
                                <ChevronLeft className="h-6 w-6 group-hover/back:-translate-x-1 transition-transform" />
                            </Button>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Editor Laboratory</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                </div>
                                <h1 className="text-3xl font-black tracking-tight text-white font-headline">
                                    Create New <span className="text-primary italic">Snippet</span>
                                </h1>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            <p className="hidden xl:block text-[10px] text-white/20 font-bold uppercase tracking-widest text-right mr-2">
                                Status: Draft<br />
                                Local Persistence: Active
                            </p>
                            <div className="flex flex-col items-end gap-1">
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading || (!isVisualLang && !executionResult)}
                                    className={cn(
                                        "relative overflow-hidden shadow-2xl px-10 h-14 rounded-2xl font-black transition-all active:scale-95 group min-w-[200px] text-[13px] uppercase tracking-wider",
                                        (!isVisualLang && !executionResult)
                                            ? "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed grayscale"
                                            : "bg-gradient-to-r from-primary via-blue-500 to-indigo-600 hover:shadow-primary/30 text-white"
                                    )}
                                >
                                    <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    <span className="relative flex items-center justify-center gap-3">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        <span>{editId ? "Update Snippet" : "Publish to Feed"}</span>
                                    </span>
                                </Button>
                                {!isVisualLang && !executionResult && (
                                    <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        Run code to enable publishing
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start bg-white/[0.04] border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none opacity-50" />
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-white/90 flex items-center gap-1">
                                1. Snippet Title <span className="text-red-500 text-base font-bold">*</span>
                            </Label>
                            <span className={cn("text-[10px] font-bold", snippetTitle.length > MAX_TITLE ? "text-red-500" : "text-white/40")}>
                                {snippetTitle.length} / {MAX_TITLE}
                            </span>
                        </div>
                        <Input
                            ref={titleInputRef}
                            placeholder="e.g. Optimized Binary Search in Rust"
                            value={snippetTitle}
                            maxLength={MAX_TITLE + 10}
                            onChange={e => setSnippetTitle(e.target.value)}
                            className="h-16 bg-muted/20 border-border text-foreground text-xl font-bold rounded-2xl focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all placeholder:text-muted-foreground/50 px-6 shadow-inner"
                        />
                    </div>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between items-end">
                            <Label className="text-[12px] font-black uppercase tracking-[0.2em] text-muted-foreground/70 flex items-center gap-1">
                                2. Description <span className="text-red-500/50 text-base font-bold">*</span>
                            </Label>
                            <span className={cn("text-[10px] font-bold", snippetDesc.length > MAX_DESC ? "text-red-500" : "text-muted-foreground/40")}>
                                {snippetDesc.length} / {MAX_DESC}
                            </span>
                        </div>
                        <Textarea
                            placeholder="Briefly explain the logic, Big O complexity, or usage instructions..."
                            value={snippetDesc}
                            maxLength={MAX_DESC + 20}
                            onChange={e => setSnippetDesc(e.target.value)}
                            className="min-h-[64px] h-16 py-5 bg-muted/20 border-border text-foreground text-sm font-medium rounded-2xl focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all resize-none placeholder:text-muted-foreground/50 px-6 shadow-inner"
                        />
                    </div>
                </div>

                {/* Additional Settings Bar */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-2xl backdrop-blur-sm -mt-4 items-center shadow-sm">
                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary/70 ml-1">Reference Documentation URL (Optional)</Label>
                        <div className="relative group">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                placeholder="https://docs.microsoft.com/..."
                                value={snippetRefUrl}
                                onChange={e => setSnippetRefUrl(e.target.value)}
                                className="pl-10 h-11 bg-muted/20 border-border text-foreground text-[13px] font-bold rounded-xl focus:border-primary/50 transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30 ml-1 text-right">Draft Status: Auto-Saving</Label>
                        <p className="text-[10px] text-muted-foreground/50 text-right">Content is cached locally in your current workspace.</p>
                    </div>
                </div>

                {/* Main Action Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                    {/* Left Col: The Lab (Editor/Preview) */}
                    <div className="lg:col-span-8 space-y-6 flex flex-col">
                        <Card className="flex-1 bg-surface border-border shadow-2xl backdrop-blur-xl overflow-hidden rounded-2xl flex flex-col min-h-[600px]">
                            <div className="h-12 bg-muted/30 border-b border-border px-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setActiveTab('terminal')}
                                            className={cn(
                                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                                activeTab !== 'preview'
                                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                        >
                                            <Code2 className="h-3.5 w-3.5" />
                                            Code Editor
                                        </button>
                                        {isVisualLang && (
                                            <button
                                                onClick={() => setActiveTab('preview')}
                                                className={cn(
                                                    "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2",
                                                    activeTab === 'preview'
                                                        ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105"
                                                        : "text-muted-foreground hover:text-white hover:bg-white/5"
                                                )}
                                            >
                                                <Eye className="h-3.5 w-3.5" />
                                                Live Preview
                                            </button>
                                        )}
                                    </div>
                                    <div className="h-4 w-px bg-white/10" />
                                    <div className="w-[140px]">
                                        <Select value={snippetLang} onValueChange={handleLanguageChange}>
                                            <SelectTrigger className="h-8 text-[11px] bg-black/40 border-white/5 font-mono">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-neutral-900 border-white/10">
                                                <SelectItem value="python">Python</SelectItem>
                                                <SelectItem value="javascript">JavaScript</SelectItem>
                                                <SelectItem value="typescript">TypeScript</SelectItem>
                                                <SelectItem value="html">HTML</SelectItem>
                                                <SelectItem value="react">React</SelectItem>
                                                <SelectItem value="markdown">Markdown</SelectItem>
                                                <SelectItem value="mermaid">Mermaid</SelectItem>
                                                <SelectItem value="go">Go</SelectItem>
                                                <SelectItem value="cpp">C++</SelectItem>
                                                <SelectItem value="java">Java</SelectItem>
                                                <SelectItem value="rust">Rust</SelectItem>
                                                <SelectItem value="c">C</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setShowPreviewModal(true)}
                                        className="h-9 px-4 text-[11px] font-bold text-white/50 hover:text-white hover:bg-white/5 border border-white/5 rounded-xl transition-all"
                                    >
                                        <Eye className="h-3.5 w-3.5 mr-2" />
                                        FEED PREVIEW
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        onClick={() => handleRunCode()}
                                        disabled={executing || !snippetCode}
                                        className={cn(
                                            "h-9 px-6 text-[11px] font-black tracking-[0.15em] transition-all",
                                            (!executionResult && !isVisualLang)
                                                ? "bg-primary text-white shadow-[0_0_15px_rgba(56,189,248,0.4)] animate-pulse scale-105"
                                                : "bg-white/5 hover:bg-white/10 border-white/5"
                                        )}
                                    >
                                        {executing ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-2 h-3.5 w-3.5 fill-current" />}
                                        {executionResult ? "RE-RUN CODE" : "RUN CODE"}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-[#020202] overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'preview' ? (
                                        <motion.div
                                            key={`preview-${snippetLang}-${previewKey}`}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="w-full h-full"
                                        >
                                            {snippetLang === 'html' && (
                                                <iframe
                                                    srcDoc={snippetCode}
                                                    className="w-full h-full border-0 bg-white"
                                                    title="HTML Preview"
                                                />
                                            )}
                                            {snippetLang === 'markdown' && (
                                                <div className="p-10 prose prose-invert max-w-none text-slate-200 h-full overflow-auto">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                        {snippetCode}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                            {snippetLang === 'mermaid' && (
                                                <div className="h-full overflow-auto">
                                                    <MermaidDiagram definition={snippetCode} />
                                                </div>
                                            )}
                                            {snippetLang === 'react' && (
                                                <ReactLivePreview code={snippetCode} />
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="editor"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="h-full w-full"
                                        >
                                            <CodeEditor
                                                code={snippetCode}
                                                language={snippetLang}
                                                onChange={(val) => setSnippetCode(val || "")}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white/[0.02] border border-white/5 p-8 rounded-2xl shadow-inner relative overflow-hidden group">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-white">Algorithm Type</Label>
                                <Select value={snippetType} onValueChange={setSnippetType}>
                                    <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-primary/20 shadow-lg">
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value="ALGORITHM">Algorithm Library</SelectItem>
                                        <SelectItem value="UTILITY">Utility Script</SelectItem>
                                        <SelectItem value="EXAMPLE">Reference Example</SelectItem>
                                        <SelectItem value="VISUAL">Visual Component</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-white">Difficulty Tier</Label>
                                <Select value={snippetDifficulty} onValueChange={setSnippetDifficulty}>
                                    <SelectTrigger className="h-12 bg-black/40 border-white/10 text-white rounded-xl focus:ring-primary/20 shadow-lg">
                                        <SelectValue placeholder="Beginner? Expert?" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-neutral-900 border-white/10 text-white">
                                        <SelectItem value="EASY">Beginner Friendly</SelectItem>
                                        <SelectItem value="MEDIUM">Intermediate</SelectItem>
                                        <SelectItem value="HARD">Pro Level</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2.5">
                                <Label className="text-[11px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                                    Tags <span className="text-red-500/30 text-xs">*</span>
                                </Label>
                                <TagInput
                                    tags={snippetTags.split(",").map(t => t.trim()).filter(Boolean)}
                                    setTags={(tags: string[]) => setSnippetTags(tags.join(", "))}
                                    placeholder="e.g. react, ui, hooks"
                                    className="bg-black/40 border-white/10 text-white rounded-xl min-h-[48px]"
                                />
                                <p className="text-[9px] text-white/20 italic">Press enter to add multiple tags.</p>
                            </div>
                        </div>
                    </div>

                    {/* Right Col: Interactive Console / Terminal */}
                    <div className="lg:col-span-4 h-full">
                        <Card className="h-full border-border/40 bg-black/60 shadow-2xl backdrop-blur-xl rounded-2xl overflow-hidden border border-white/5 flex flex-col sticky top-24">
                            <div className="h-12 bg-white/[0.03] border-b border-white/5 px-4 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <div className="flex gap-1.5 mr-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80">Interactive Terminal</span>
                                </div>
                                <button
                                    className="p-1.5 rounded-md hover:bg-white/5 text-muted-foreground hover:text-white transition-all active:scale-95"
                                    onClick={() => { setStdIn(""); setTerminalLines([]); setExecutionResult(null); }}
                                    title="Clear Output"
                                >
                                    <RefreshCcw className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 font-mono text-[14px] space-y-2 selection:bg-primary/30 custom-scrollbar">
                                {terminalLines.length === 0 && !executing && (
                                    <div className="text-white/20 italic text-xs leading-relaxed">
                                        CodeStudio Execution Runtime v2.1.0<br />
                                        &gt; Waiting for process start...
                                    </div>
                                )}
                                {terminalLines.map((line, i) => (
                                    <div key={i} className={cn(
                                        "whitespace-pre-wrap break-all leading-relaxed transition-all",
                                        line.type === 'input' ? "text-primary font-bold before:content-['>_'] before:mr-2" :
                                            line.type === 'error' ? "text-rose-400 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 my-2" : "text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]"
                                    )}>
                                        {line.text}
                                    </div>
                                ))}
                                {executing && (
                                    <div className="flex items-center gap-3 text-primary animate-pulse py-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Compiling & Running...</span>
                                    </div>
                                )}
                                <div ref={terminalEndRef} />
                            </div>

                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const input = (e.currentTarget.elements.namedItem('terminalInput') as HTMLInputElement);
                                    const val = input.value;
                                    if (!val) return;

                                    // 1. Record the input
                                    const newLines = [...terminalLines, { type: 'input' as const, text: val }];
                                    setTerminalLines(newLines);
                                    input.value = "";

                                    // 2. Prepare full Stdin from all recorded inputs
                                    const allInputs = newLines
                                        .filter(l => l.type === 'input')
                                        .map(l => l.text)
                                        .join('\n');

                                    setStdIn(allInputs);

                                    // 3. Run code and append result
                                    setExecuting(true);
                                    try {
                                        const res = await snippetsAPI.execute({
                                            language: snippetLang,
                                            code: snippetCode,
                                            stdin: allInputs
                                        });
                                        setExecutionResult(res.run);

                                        // Append new output lines
                                        setTerminalLines(prev => [
                                            ...prev,
                                            ...(res.run.stdout ? [{ type: 'output' as const, text: res.run.stdout }] : []),
                                            ...(res.run.stderr ? [{ type: 'error' as const, text: res.run.stderr }] : [])
                                        ]);
                                    } catch (err) {
                                        toast({ title: "Run Error", variant: "destructive", description: "Terminal disconnected." });
                                    } finally {
                                        setExecuting(false);
                                    }
                                }}
                                className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center gap-3 shrink-0 group focus-within:bg-white/[0.04] transition-all"
                            >
                                <span className="text-primary font-black text-sm">{">"}</span>
                                <input
                                    ref={terminalInputRef}
                                    name="terminalInput"
                                    className="flex-1 bg-transparent border-none outline-none text-[14px] font-mono text-white placeholder:text-white/30 w-full"
                                    placeholder="Type standard input and hit Enter..."
                                    autoComplete="off"
                                />
                                <kbd className="text-[10px] text-white/40 font-mono hidden sm:inline px-2 py-1 rounded border border-white/10 bg-white/5">ENTER</kbd>
                            </form>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Live Card Preview Modal */}
            <AnimatePresence>
                {showPreviewModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowPreviewModal(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Eye className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Snippet Feed Preview</h3>
                                        <p className="text-xs text-white/40">This is how your code will look to other developers.</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPreviewModal(false)}
                                    className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/5 rounded-full"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="p-8 bg-grid-white/[0.02] flex items-center justify-center min-h-[400px]">
                                <div className="w-full">
                                    {/* Mock Snippet Data for Preview */}
                                    <SnippetCard
                                        snippet={{
                                            id: "preview",
                                            title: snippetTitle || "Untitled Snippet",
                                            description: snippetDesc || "No description provided yet.",
                                            language: snippetLang,
                                            type: snippetType,
                                            difficulty: snippetDifficulty,
                                            code: snippetCode,
                                            tags: snippetTags.split(",").map(t => t.trim()).filter(Boolean),
                                            referenceUrl: snippetRefUrl,
                                            previewType: isVisualLang ? "WEB_PREVIEW_CENTER" : "TERMINAL",
                                            author: user || { username: "You", image: "" },
                                            lastExecutionOutput: executionResult ? (executionResult.stdout + (executionResult.stderr ? `\n[STDERR]\n${executionResult.stderr}` : "")) : "",
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-white/[0.02] text-center">
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">Interactive Preview Environment</p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Simple X Icon if not imported
function X(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    )
}


