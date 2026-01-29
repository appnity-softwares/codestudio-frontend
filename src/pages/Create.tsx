
import { useState, useEffect, useRef } from "react";
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
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { TagInput } from "@/components/ui/tag-input";
import { HamsterLoader } from "@/components/shared/HamsterLoader";
import {
    ChevronLeft,
    Send,
    LayoutDashboard,
    FileCode,
    Play,
    Globe,
    AlertCircle,
    Code2,
    Eye,
    Terminal as TerminalIcon,
    RefreshCcw
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

import { useQuery } from "@tanstack/react-query";
import { feedAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { LayoutGrid } from "lucide-react";

export default function Create() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const isMobile = useIsMobile();
    const { celebrate, celebrateXP } = useBadgeCelebration();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const editId = searchParams.get('edit');

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
    const [activeTab, setActiveTab] = useState("code");
    const [showFeed, setShowFeed] = useState(false);

    // Fetch Feed Items
    const { data: feedData, isLoading: feedLoading } = useQuery({
        queryKey: ["editor-feed"],
        queryFn: () => feedAPI.get('trending'),
        enabled: showFeed
    });

    const titleInputRef = useRef<HTMLInputElement>(null);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    const MAX_TITLE = 80;
    const MAX_DESC = 300;

    const isVisualLang = ['html', 'react', 'markdown', 'mermaid'].includes(snippetLang);

    useEffect(() => {
        window.scrollTo(0, 0);
        setTimeout(() => titleInputRef.current?.focus(), 300);
    }, []);

    useEffect(() => {
        if (editId) {
            const loadSnippet = async () => {
                setLoading(true);
                try {
                    const { snippet } = await snippetsAPI.getById(editId);
                    setSnippetTitle(snippet.title);
                    setSnippetDesc(snippet.description);
                    setSnippetLang(snippet.language);
                    setSnippetType(snippet.type || "ALGORITHM");
                    setSnippetDifficulty(snippet.difficulty || "MEDIUM");
                    setSnippetCode(snippet.code);
                    setSnippetTags(snippet.tags?.join(", ") || "");
                    setSnippetRefUrl(snippet.referenceUrl || "");
                    if (snippet.stdinHistory) {
                        try { setTerminalLines(JSON.parse(snippet.stdinHistory)); } catch (e) { }
                    }
                } catch (error) {
                    toast({ variant: "destructive", title: "Error", description: "Failed to load snippet data." });
                } finally {
                    setLoading(false);
                }
            };
            loadSnippet();
        }
    }, [editId]);

    const handleLanguageChange = (newLang: string) => {
        const isCurrentBoilerplate = Object.values(BOILERPLATES).some(b => b.trim() === snippetCode.trim());
        if (!snippetCode || isCurrentBoilerplate) {
            setSnippetCode(BOILERPLATES[newLang] || "");
        }
        setSnippetLang(newLang);
        setExecutionResult(null);
        setTerminalLines([]);
        if (['html', 'react', 'markdown', 'mermaid'].includes(newLang)) {
            setActiveTab("preview");
        } else {
            setActiveTab("code");
        }
    };

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
            const lines: { type: 'input' | 'output' | 'error', text: string }[] = [];
            if (inputToUse) inputToUse.split('\n').filter(Boolean).forEach(t => lines.push({ type: 'input', text: t }));
            if (res.run.stdout) lines.push({ type: 'output', text: res.run.stdout });
            if (res.run.stderr) lines.push({ type: 'error', text: res.run.stderr });
            setTerminalLines(lines);
            if (res.run.code === 0) toast({ title: "Run Successful" });
            else toast({ title: "Execution Failed", variant: "destructive" });
        } catch (error) {
            toast({ title: "Runtime Error", variant: "destructive" });
        } finally {
            setExecuting(false);
        }
    };

    const handleSubmit = async () => {
        if (!snippetTitle || !snippetCode) {
            toast({ title: "Title and Code are required", variant: "destructive" });
            return;
        }

        if (!isVisualLang && (!executionResult || executionResult.code !== 0)) {
            toast({ title: "Verification Required", description: "Run your code successfully before publishing.", variant: "destructive" });
            return;
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
                outputSnapshot: executionResult ? (executionResult.stdout + (executionResult.stderr ? `\n[ERR]\n${executionResult.stderr}` : "")) : "",
                previewType: isVisualLang ? "WEB_PREVIEW_CENTER" : "TERMINAL",
                referenceUrl: snippetRefUrl,
                stdinHistory: JSON.stringify(terminalLines),
                status: 'PUBLISHED'
            };

            if (editId) {
                await snippetsAPI.update(editId, payload);
                toast({ title: "Updated successfully" });
            } else {
                const res = await snippetsAPI.create(payload) as any;
                toast({ title: "Published successfully 🚀" });
                celebrateXP(50);
                if (res.newBadges?.length > 0) celebrate(res.newBadges);
            }
            navigate("/feed");
        } catch (error) {
            toast({ title: "Failed to publish", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [terminalLines]);

    if (loading) return <HamsterLoader fullPage size={20} />;

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-background text-foreground overflow-hidden">
            {/* Header / Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/30 backdrop-blur-md shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" />
                        <h1 className="font-bold text-lg hidden sm:block">
                            {editId ? "Edit Snippet" : "Create Snippet"}
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border mr-2 hidden md:flex">
                        <div className={cn("w-2 h-2 rounded-full", executionResult?.code === 0 ? "bg-emerald-500" : "bg-amber-500")} />
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Status: {executionResult?.code === 0 ? "Verified" : "Draft"}</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowFeed(!showFeed)}
                        className={cn("rounded-full transition-all", showFeed ? "bg-primary/20 text-primary" : "text-muted-foreground")}
                        title="Toggle Inspiration Feed"
                    >
                        <LayoutGrid className="h-5 w-5" />
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleRunCode()}
                        disabled={executing}
                        className="h-10 px-4 rounded-xl gap-2 font-bold"
                    >
                        <Play className="h-4 w-4 fill-current" /> Run
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="h-10 px-6 rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
                        disabled={loading || (!isVisualLang && !executionResult)}
                    >
                        <Send className="h-4 w-4" /> Publish
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel: Configuration */}
                <div className={cn(
                    "w-full md:w-[400px] lg:w-[450px] border-r border-border bg-card/10 overflow-y-auto custom-scrollbar p-6 space-y-8",
                    isMobile && activeTab !== 'config' && "hidden md:block"
                )}>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Title</Label>
                            <Input
                                ref={titleInputRef}
                                value={snippetTitle}
                                onChange={e => setSnippetTitle(e.target.value)}
                                placeholder="Snippet Title (e.g. Binary Search)"
                                className="h-12 text-sm border-border rounded-xl focus:ring-2 focus:ring-primary/20"
                            />
                            <div className="flex justify-end pr-1">
                                <span className={cn("text-[10px] font-bold", snippetTitle.length > MAX_TITLE ? "text-destructive" : "opacity-30")}>
                                    {snippetTitle.length}/{MAX_TITLE}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Description</Label>
                            <Textarea
                                value={snippetDesc}
                                onChange={e => setSnippetDesc(e.target.value)}
                                placeholder="Describe your logic..."
                                className="min-h-[100px] bg-muted/20 border-border rounded-xl resize-none leading-relaxed"
                            />
                            <div className="flex justify-end pr-1">
                                <span className={cn("text-[10px] font-bold", snippetDesc.length > MAX_DESC ? "text-destructive" : "opacity-30")}>
                                    {snippetDesc.length}/{MAX_DESC}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Language </Label>
                                <Select value={snippetLang} onValueChange={handleLanguageChange}>
                                    <SelectTrigger className="h-11 bg-muted/20 border-border rounded-xl focus:ring-1 focus:ring-primary/20 transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.keys(BOILERPLATES).map(l => (
                                            <SelectItem key={l} value={l} className="uppercase font-mono text-[11px]">{l}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Category</Label>
                                <Select value={snippetType} onValueChange={setSnippetType}>
                                    <SelectTrigger className="h-11 bg-muted/20 border-border rounded-xl focus:ring-1 focus:ring-primary/20 transition-all">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALGORITHM">Algorithm</SelectItem>
                                        <SelectItem value="UTILITY">Utility</SelectItem>
                                        <SelectItem value="EXAMPLE">Reference</SelectItem>
                                        <SelectItem value="VISUAL">Visual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Difficulty</Label>
                                <Select value={snippetDifficulty} onValueChange={setSnippetDifficulty}>
                                    <SelectTrigger className="h-11 bg-muted/20 border-border rounded-xl focus:ring-1 focus:ring-primary/20 transition-all">
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
                            <Label className="text-xs font-bold uppercase tracking-widest opacity-50">Tags</Label>
                            <TagInput
                                tags={snippetTags.split(",").map(t => t.trim()).filter(Boolean)}
                                setTags={(tags: string[]) => setSnippetTags(tags.join(", "))}
                                placeholder="Press enter to add tags..."
                                className="bg-muted/20 border-border rounded-xl min-h-[44px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-widest opacity-50">References</Label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-30" />
                                <Input
                                    value={snippetRefUrl}
                                    onChange={e => setSnippetRefUrl(e.target.value)}
                                    placeholder="https://"
                                    className="pl-10 h-11 bg-muted/20 border-border rounded-xl font-mono text-xs"
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <p className="text-[11px] font-medium leading-relaxed opacity-70">
                                Verification protocol active. Successful execution is required before deployment to the global stream.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Code & Output */}
                <div className="flex-1 flex flex-col overflow-hidden bg-muted/10">
                    {/* Tabs / Toggle */}
                    {isVisualLang && (
                        <div className="flex bg-muted/30 p-1 m-4 rounded-xl border border-border self-start shrink-0">
                            <button
                                onClick={() => setActiveTab('code')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    activeTab === 'code' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Code2 className="h-4 w-4" /> Code
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-1.5 rounded-lg text-xs font-bold transition-all",
                                    activeTab === 'preview' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Eye className="h-4 w-4" /> Preview
                            </button>
                        </div>
                    )}

                    {/* Main Workspace */}
                    <div className="flex-1 min-h-0 flex flex-col">
                        <div className="flex-1 overflow-hidden relative">
                            <AnimatePresence mode="wait">
                                {activeTab === 'preview' && isVisualLang ? (
                                    <motion.div
                                        key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="w-full h-full bg-white dark:bg-slate-900 overflow-auto"
                                    >
                                        {snippetLang === 'html' && <iframe srcDoc={snippetCode} className="w-full h-full border-0 bg-white" title="HTML Preview" />}
                                        {snippetLang === 'markdown' && <div className="p-12 prose dark:prose-invert max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm]}>{snippetCode}</ReactMarkdown></div>}
                                        {snippetLang === 'mermaid' && <div className="h-full"><MermaidDiagram definition={snippetCode} /></div>}
                                        {snippetLang === 'react' && <ReactLivePreview code={snippetCode} />}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="editor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="h-full w-full"
                                    >
                                        <CodeEditor code={snippetCode} language={snippetLang} onChange={v => setSnippetCode(v || "")} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Terminal Area */}
                        {(!isVisualLang || activeTab === 'code') && (
                            <div className="h-1/3 min-h-[200px] border-t border-border flex flex-col bg-background">
                                <div className="px-4 py-2 border-b border-border flex items-center justify-between shrink-0 bg-muted/20">
                                    <div className="flex items-center gap-2">
                                        <TerminalIcon className="h-4 w-4 opacity-50" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">System Console</span>
                                    </div>
                                    <button onClick={() => { setTerminalLines([]); setExecutionResult(null); }} className="hover:text-primary transition-colors">
                                        <RefreshCcw className="h-3 w-3" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 font-mono text-[13px] space-y-1.5 custom-scrollbar">
                                    {terminalLines.length === 0 && !executing ? (
                                        <div className="text-muted-foreground/30 italic text-xs">Awaiting process initiation...</div>
                                    ) : (
                                        terminalLines.map((line, i) => (
                                            <div key={i} className={cn(
                                                "leading-relaxed whitespace-pre-wrap break-all",
                                                line.type === 'input' ? "text-primary/70 before:content-['>_']" :
                                                    line.type === 'error' ? "text-destructive" : "text-emerald-500"
                                            )}>
                                                {line.text}
                                            </div>
                                        ))
                                    )}
                                    <div ref={terminalEndRef} />
                                </div>
                                <form
                                    onSubmit={e => {
                                        e.preventDefault();
                                        const input = e.currentTarget.elements.namedItem('terminalIn') as HTMLInputElement;
                                        if (!input.value) return;
                                        const val = input.value;
                                        input.value = "";
                                        const newStdin = stdIn ? stdIn + "\n" + val : val;
                                        setStdIn(newStdin);
                                        setTerminalLines(p => [...p, { type: 'input', text: val }]);
                                        handleRunCode(newStdin);
                                    }}
                                    className="h-11 border-t border-border flex items-center px-4 gap-3 bg-muted/10"
                                >
                                    <span className="text-primary font-bold">~</span>
                                    <input name="terminalIn" autoComplete="off" placeholder="Injection parameter..." className="flex-1 bg-transparent border-none outline-none text-xs font-mono" />
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Inspiration Feed Panel (Right Side) */}
                <AnimatePresence>
                    {showFeed && (
                        <motion.div
                            initial={{ x: 400, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 400, opacity: 0 }}
                            className="hidden lg:flex w-[400px] border-l border-border bg-card/10 flex-col overflow-hidden"
                        >
                            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between shrink-0">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-50">Inspiration Feed</h3>
                                <button onClick={() => setShowFeed(false)} className="text-muted-foreground hover:text-foreground">
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {feedLoading ? (
                                    <div className="flex h-full items-center justify-center">
                                        <HamsterLoader size={12} />
                                    </div>
                                ) : feedData?.snippets?.length ? (
                                    feedData.snippets.map((s: any) => (
                                        <SnippetCard key={s.id} snippet={s} className="scale-90 origin-top" />
                                    ))
                                ) : (
                                    <div className="text-center py-12 opacity-30 italic text-sm">No inspiration found.</div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Inspiration Feed Tab Content */}
            {isMobile && activeTab === 'feed' && (
                <div className="absolute inset-0 top-[64px] bottom-16 bg-background z-40 overflow-y-auto p-4 space-y-4">
                    <h3 className="text-center text-[10px] font-bold uppercase tracking-widest opacity-30 py-4">Inspiration Stream</h3>
                    {feedLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <HamsterLoader size={12} />
                        </div>
                    ) : feedData?.snippets?.length ? (
                        feedData.snippets.map((s: any) => (
                            <SnippetCard key={s.id} snippet={s} />
                        ))
                    ) : (
                        <div className="text-center py-12 opacity-30 italic">No snippets found in feed.</div>
                    )}
                </div>
            )}

            {/* Mobile Tab Bar */}
            {isMobile && (
                <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around px-4 z-50">
                    <button onClick={() => setActiveTab('config')} className={cn("flex flex-col items-center gap-1", activeTab === 'config' ? "text-primary" : "text-muted-foreground")}>
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Config</span>
                    </button>
                    <button onClick={() => setActiveTab('code')} className={cn("flex flex-col items-center gap-1", activeTab === 'code' ? "text-primary" : "text-muted-foreground")}>
                        <FileCode className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Editor</span>
                    </button>
                    {isVisualLang && (
                        <button onClick={() => setActiveTab('preview')} className={cn("flex flex-col items-center gap-1", activeTab === 'preview' ? "text-primary" : "text-muted-foreground")}>
                            <Eye className="h-5 w-5" />
                            <span className="text-[10px] font-bold">Preview</span>
                        </button>
                    )}
                    <button onClick={() => { setActiveTab('feed'); setShowFeed(true); }} className={cn("flex flex-col items-center gap-1", activeTab === 'feed' ? "text-primary" : "text-muted-foreground")}>
                        <LayoutGrid className="h-5 w-5" />
                        <span className="text-[10px] font-bold">Feed</span>
                    </button>
                </div>
            )}
        </div>
    );
}
