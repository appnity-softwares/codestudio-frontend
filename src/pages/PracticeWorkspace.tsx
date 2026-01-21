"use client";
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practiceAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import {
    ArrowLeft,
    Play,
    CheckCircle2,
    RotateCcw,
    Code,
    Terminal,
    Clock
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

// Helper for Badge Modal
function BadgeAwardModal({ badges, onClose }: { badges: any[], onClose: () => void }) {
    if (!badges || badges.length === 0) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-[#0a0a0c] border border-primary/30 rounded-2xl p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent pointer-events-none" />
                <motion.div
                    initial={{ y: -20 }}
                    animate={{ y: 0 }}
                    transition={{ type: "spring", bounce: 0.6 }}
                    className="text-6xl mb-4"
                >
                    🎉
                </motion.div>
                <h2 className="text-2xl font-black text-foreground mb-2">Badge Unlocked!</h2>
                <div className="space-y-4 my-6">
                    {badges.map(badge => (
                        <div key={badge.id} className="bg-surface border border-white/10 p-4 rounded-xl flex flex-col items-center gap-2">
                            <div className="text-4xl">{badge.icon}</div>
                            <div className="font-bold text-primary">{badge.name}</div>
                            <div className="text-xs text-muted-foreground">{badge.description}</div>
                        </div>
                    ))}
                </div>
                <Button onClick={onClose} className="w-full font-bold">Awesome!</Button>
            </motion.div>
        </div>
    );
}

export default function PracticeWorkspace() {
    const { id } = useParams();
    const { toast } = useToast();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState<{ stdout: string, stderr: string, status?: string } | null>(null);
    const [activeTab, setActiveTab] = useState<'problem' | 'submissions'>('problem');
    const [newBadges, setNewBadges] = useState<any[]>([]);

    // Fetch Problem
    const { data, isLoading } = useQuery({
        queryKey: ['practice-problem', id],
        queryFn: () => practiceAPI.getProblem(id!),
        enabled: !!id,
    });

    const problem = data?.problem;

    useEffect(() => {
        if (problem) {
            setCode(problem.starterCode || "");
            setLanguage(problem.language || "python");
        }
    }, [problem]);

    // Run Code Mutation
    const runMutation = useMutation({
        mutationFn: practiceAPI.run,
        onSuccess: (res) => {
            setOutput({ stdout: res.output, stderr: res.stderr, status: res.status });
            if (res.status === 'ACCEPTED') {
                toast({ title: "Passed Sample Case", description: "Output matches expected result." });
            } else {
                toast({ variant: "destructive", title: res.status, description: res.verdict || "Check your output." });
            }
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Execution Error", description: err.message });
        }
    });

    // Submit Mutation
    const submitMutation = useMutation({
        mutationFn: practiceAPI.submit,
        onSuccess: (res) => {
            setOutput({ stdout: res.output, stderr: res.stderr, status: res.submission.status });

            if (res.submission.status === 'ACCEPTED') {
                toast({ title: "✅ Accepted", description: "Congratulations! All tests passed." });
                if (res.newBadges && res.newBadges.length > 0) {
                    setNewBadges(res.newBadges);
                }

                if (res.nextProblemId) {
                    toast({
                        title: "Challenge Complete! 🎉",
                        description: "Ready for the next one?",
                        action: (
                            <Button
                                size="sm"
                                className="bg-white text-black hover:bg-white/90"
                                onClick={() => {
                                    navigate(`/practice/${res.nextProblemId}`);
                                    queryClient.invalidateQueries({ queryKey: ['practice-problem', res.nextProblemId] });
                                    window.location.reload(); // Force reload to ensure clean state if needed, or rely on key change
                                }}
                            >
                                Next Challenge
                            </Button>
                        ),
                        duration: 10000,
                    });
                }

                queryClient.invalidateQueries({ queryKey: ['practice-problem', id] });
            } else {
                toast({ variant: "destructive", title: "❌ Failed", description: res.submission.verdict });
            }
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Submission Failed", description: err.message });
        }
    });

    if (isLoading) return <div className="h-screen bg-canvas flex items-center justify-center text-muted-foreground">Loading workspace...</div>;
    if (!problem) return <div className="h-screen bg-canvas flex items-center justify-center text-muted-foreground">Problem not found</div>;

    return (
        <div className="h-screen bg-canvas flex flex-col overflow-hidden">
            <AnimatePresence>
                {newBadges.length > 0 && (
                    <BadgeAwardModal badges={newBadges} onClose={() => setNewBadges([])} />
                )}
            </AnimatePresence>

            {/* Top Bar */}
            <header className="h-14 border-b border-white/5 bg-background flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Link to="/practice" className="text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="h-6 w-px bg-white/10" />
                    <h1 className="font-bold text-foreground truncate max-w-[200px] md:max-w-md">{problem.title}</h1>
                    <Badge variant="outline" className={cn("hidden md:flex",
                        problem.difficulty === 'EASY' ? "text-emerald-400 border-emerald-400/20" :
                            problem.difficulty === 'MEDIUM' ? "text-amber-400 border-amber-400/20" :
                                "text-rose-400 border-rose-400/20")}>
                        {problem.difficulty}
                    </Badge>
                </div>

                <div className="flex items-center gap-3">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-[120px] h-8 text-xs bg-surface border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="python">Python</SelectItem>
                            <SelectItem value="javascript">JavaScript</SelectItem>
                            <SelectItem value="go">Go</SelectItem>
                            <SelectItem value="cpp">C++</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => runMutation.mutate({ problemId: problem.id, code, language })}
                        disabled={runMutation.isPending || submitMutation.isPending}
                        className="h-8 gap-2 bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                        <Play className="h-3 w-3" />
                        Run
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => submitMutation.mutate({ problemId: problem.id, code, language })}
                        disabled={runMutation.isPending || submitMutation.isPending}
                        className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    >
                        {submitMutation.isPending ? <RotateCcw className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
                        Submit
                    </Button>
                </div>
            </header>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Description */}
                <div className="w-1/2 md:w-[40%] border-r border-white/5 bg-background flex flex-col">
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('problem')}
                            className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'problem' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                        >
                            <Code className="h-4 w-4 inline mr-2" />
                            Description
                        </button>
                        <button
                            onClick={() => setActiveTab('submissions')}
                            className={cn("px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'submissions' ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
                        >
                            <Clock className="h-4 w-4 inline mr-2" />
                            Submissions
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 text-foreground">
                        <div className="prose prose-invert max-w-none">
                            <h2 className="text-2xl font-bold mb-4">{problem.title}</h2>
                            <div className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
                                {problem.description}
                            </div>

                            <div className="mt-8 space-y-4">
                                <h3 className="text-lg font-bold text-foreground">Constraints</h3>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                                    <li>Time Limit: {problem.timeLimit}s</li>
                                    <li>Memory Limit: {problem.memoryLimit}MB</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Editor & Console */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e]">
                    <div className="flex-1 border-b border-white/5 relative">
                        <Editor
                            height="100%"
                            language={language}
                            value={code}
                            onChange={(val) => setCode(val || "")}
                            theme="vs-dark"
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                                scrollBeyondLastLine: false,
                                automaticLayout: true,
                                padding: { top: 20 },
                                fontFamily: "'JetBrains Mono', monospace",
                            }}
                        />
                    </div>

                    {/* Console Panel (Collapsible/Fixed Height) */}
                    <div className="h-[200px] bg-[#0a0a0c] border-t border-white/5 flex flex-col">
                        <div className="h-8 border-b border-white/5 px-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                                <Terminal className="h-3 w-3" />
                                Console
                            </span>
                            {output?.status && (
                                <span className={cn("text-xs font-bold px-2 py-0.5 rounded",
                                    output.status === 'ACCEPTED' ? "bg-emerald-500/20 text-emerald-400" :
                                        output.status === 'WRONG_ANSWER' ? "bg-amber-500/20 text-amber-400" :
                                            "bg-rose-500/20 text-rose-400")}>
                                    {output.status}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                            {output ? (
                                <div className="space-y-2">
                                    {output.stderr && (
                                        <div className="text-rose-400 whitespace-pre-wrap">{output.stderr}</div>
                                    )}
                                    <div className="text-muted-foreground">Output:</div>
                                    <div className="text-foreground whitespace-pre-wrap">{output.stdout || "No output"}</div>
                                </div>
                            ) : (
                                <div className="text-muted-foreground/30 italic">Run your code to see output...</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
