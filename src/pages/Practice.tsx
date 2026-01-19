"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { practiceAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
    Code2,
    CheckCircle2,
    Circle,
    Flame,
    Clock,
    Trophy,
    Play,
    ChevronRight,
    Zap
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";

const difficultyColors: Record<string, string> = {
    EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    HARD: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const categoryIcons: Record<string, React.ReactNode> = {
    Basics: <Code2 className="h-4 w-4" />,
    Math: <Trophy className="h-4 w-4" />,
    Strings: <Zap className="h-4 w-4" />,
    Arrays: <Flame className="h-4 w-4" />,
    Logic: <Clock className="h-4 w-4" />,
};

export default function PracticeArena() {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [selectedProblem, setSelectedProblem] = useState<any>(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("python");
    const [difficultyFilter, setDifficultyFilter] = useState("all");

    // Fetch problems
    const { data: problemsData, isLoading } = useQuery({
        queryKey: ['practice-problems', difficultyFilter],
        queryFn: () => practiceAPI.getProblems(
            difficultyFilter !== 'all' ? { difficulty: difficultyFilter } : undefined
        ),
    });

    const problems = problemsData?.problems || [];

    // Submit mutation
    const submitMutation = useMutation({
        mutationFn: practiceAPI.submit,
        onSuccess: (data) => {
            if (data.submission.status === 'ACCEPTED') {
                toast({ title: "✅ Accepted!", description: "All tests passed." });
                queryClient.invalidateQueries({ queryKey: ['practice-problems'] });
            } else if (data.submission.status === 'WRONG_ANSWER') {
                toast({ variant: "destructive", title: "❌ Wrong Answer", description: data.submission.verdict });
            } else {
                toast({ variant: "destructive", title: "Error", description: data.stderr || data.submission.error });
            }
        },
        onError: (err: any) => {
            toast({ variant: "destructive", title: "Submission failed", description: err.message });
        },
    });

    const handleSelectProblem = (problem: any) => {
        setSelectedProblem(problem);
        setCode(problem.starterCode || "");
        setLanguage(problem.language || "python");
    };

    const handleSubmit = () => {
        if (!isAuthenticated) {
            toast({ variant: "destructive", title: "Please login to submit" });
            return;
        }
        if (!selectedProblem) return;

        submitMutation.mutate({
            problemId: selectedProblem.id,
            code,
            language,
        });
    };

    return (
        <div className="min-h-screen bg-canvas">
            <div className="container max-w-7xl mx-auto py-8 px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
                        <Flame className="h-8 w-8 text-primary" />
                        Practice Arena
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Sharpen your skills with unlimited attempts. No pressure, no leaderboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Problem List */}
                    <div className="lg:col-span-4 space-y-4">
                        {/* Filters */}
                        <div className="flex items-center gap-2">
                            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Difficulty" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Levels</SelectItem>
                                    <SelectItem value="EASY">Easy</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HARD">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Problem Cards */}
                        <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                            {isLoading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading problems...</div>
                            ) : problems.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">No problems found</div>
                            ) : (
                                problems.map((problem: any) => (
                                    <motion.div
                                        key={problem.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.01 }}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer transition-all",
                                            selectedProblem?.id === problem.id
                                                ? "bg-primary/10 border-primary"
                                                : "bg-surface border-border hover:border-primary/50"
                                        )}
                                        onClick={() => handleSelectProblem(problem)}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    {problem.isDailyProblem && (
                                                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-primary text-primary-foreground rounded-full">
                                                            Daily
                                                        </span>
                                                    )}
                                                    <span className={cn(
                                                        "px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border",
                                                        difficultyColors[problem.difficulty] || difficultyColors.MEDIUM
                                                    )}>
                                                        {problem.difficulty}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-foreground truncate">
                                                    {problem.title}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    {categoryIcons[problem.category] || <Code2 className="h-3 w-3" />}
                                                    <span>{problem.category}</span>
                                                    <span className="text-border">•</span>
                                                    <span>{problem.solveCount} solved</span>
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {problem.isSolved ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                                ) : (
                                                    <Circle className="h-5 w-5 text-muted-foreground/30" />
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Editor Panel */}
                    <div className="lg:col-span-8">
                        {selectedProblem ? (
                            <div className="bg-surface rounded-xl border border-border overflow-hidden">
                                {/* Problem Header */}
                                <div className="p-4 border-b border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-foreground">
                                                {selectedProblem.title}
                                            </h2>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {selectedProblem.category} • {selectedProblem.language}
                                            </p>
                                        </div>
                                        <span className={cn(
                                            "px-3 py-1 text-xs font-bold uppercase rounded-full border",
                                            difficultyColors[selectedProblem.difficulty]
                                        )}>
                                            {selectedProblem.difficulty}
                                        </span>
                                    </div>
                                </div>

                                {/* Problem Description */}
                                <div className="p-4 border-b border-border bg-background/50 max-h-[200px] overflow-y-auto">
                                    <pre className="whitespace-pre-wrap text-sm text-foreground font-mono">
                                        {selectedProblem.description}
                                    </pre>
                                </div>

                                {/* Code Editor */}
                                <div className="h-[350px] border-b border-border">
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
                                            padding: { top: 16 },
                                        }}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="p-4 flex items-center justify-between bg-surface/50">
                                    <Select value={language} onValueChange={setLanguage}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="javascript">JavaScript</SelectItem>
                                            <SelectItem value="typescript">TypeScript</SelectItem>
                                            <SelectItem value="go">Go</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button
                                        onClick={handleSubmit}
                                        disabled={submitMutation.isPending}
                                        className="gap-2"
                                    >
                                        {submitMutation.isPending ? (
                                            <>Running...</>
                                        ) : (
                                            <>
                                                <Play className="h-4 w-4" />
                                                Submit Solution
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {/* Result Display */}
                                {submitMutation.data && (
                                    <div className={cn(
                                        "p-4 border-t",
                                        submitMutation.data.submission.status === 'ACCEPTED'
                                            ? "bg-emerald-500/10 border-emerald-500/20"
                                            : "bg-rose-500/10 border-rose-500/20"
                                    )}>
                                        <div className="flex items-center gap-2 mb-2">
                                            {submitMutation.data.submission.status === 'ACCEPTED' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <Circle className="h-5 w-5 text-rose-500" />
                                            )}
                                            <span className="font-bold">
                                                {submitMutation.data.submission.status}
                                            </span>
                                        </div>
                                        {submitMutation.data.output && (
                                            <pre className="text-xs font-mono bg-black/20 p-2 rounded mt-2 overflow-x-auto">
                                                {submitMutation.data.output}
                                            </pre>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-surface rounded-xl border border-border p-12 text-center">
                                <Code2 className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                    Select a Problem
                                </h3>
                                <p className="text-muted-foreground">
                                    Choose a problem from the list to start practicing.
                                </p>
                                <ChevronRight className="h-6 w-6 text-muted-foreground/30 mx-auto mt-4" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
