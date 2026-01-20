"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { practiceAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import {
    Code2,
    CheckCircle2,
    Clock,
    Trophy,
    Zap,
    Filter,
    Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const difficultyColors: Record<string, string> = {
    EASY: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    MEDIUM: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    HARD: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

export default function PracticeList() {
    const [difficulty, setDifficulty] = useState<string | undefined>(undefined);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ['practice-problems', difficulty, category],
        queryFn: () => practiceAPI.getProblems({ difficulty, category }),
    });

    const problems = data?.problems.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="min-h-screen bg-canvas pb-20">
            {/* Header */}
            <div className="bg-surface border-b border-white/5 py-12">
                <div className="container max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-black text-foreground mb-4">Practice Arena</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">
                        Sharpen your coding skills with our collection of algorithm challenges.
                        Solve problems, earn badges, and prepare for technical interviews.
                    </p>
                </div>
            </div>

            <div className="container max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Main Content: Problem List */}
                    <div className="lg:col-span-3 space-y-4">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-foreground">
                                {problems.length} Challenges
                            </h2>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search problems..."
                                    className="pl-9 bg-surface border-white/10"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-surface/50 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : problems.length === 0 ? (
                            <div className="text-center py-20 bg-surface/30 rounded-xl border border-dashed border-white/10">
                                <Code2 className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground">No problems found matching your filters.</p>
                            </div>
                        ) : (
                            problems.map((problem: any) => (
                                <Link key={problem.id} to={`/practice/${problem.id}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ y: -2 }}
                                        className="group bg-surface hover:bg-surface/80 border border-white/5 hover:border-primary/50 rounded-xl p-6 transition-all shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {problem.title}
                                                    </h3>
                                                    <Badge variant="outline" className={cn("text-[10px] uppercase", difficultyColors[problem.difficulty])}>
                                                        {problem.difficulty}
                                                    </Badge>
                                                    {problem.isDailyProblem && (
                                                        <Badge className="bg-primary text-primary-foreground text-[10px] uppercase">
                                                            Daily Pick
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Zap className="h-3.5 w-3.5" />
                                                        <span>{problem.category}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Trophy className="h-3.5 w-3.5" />
                                                        <span>Success Rate: {(Math.random() * 40 + 40).toFixed(1)}%</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>Max Score: {problem.difficulty === 'EASY' ? 20 : problem.difficulty === 'MEDIUM' ? 40 : 80}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                {problem.isSolved ? (
                                                    <div className="flex items-center gap-2 text-emerald-400 font-medium text-sm">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        <span>Solved</span>
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="text-muted-foreground group-hover:text-foreground">
                                                        Solve Challenge
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Right Sidebar: Filters */}
                    <div className="space-y-8">
                        {/* Status */}
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-primary" />
                                Status
                            </h3>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                                    <input type="checkbox" className="rounded border-white/20 bg-black/50" />
                                    <span>Solved</span>
                                </label>
                                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                                    <input type="checkbox" className="rounded border-white/20 bg-black/50" />
                                    <span>Unsolved</span>
                                </label>
                            </div>
                        </div>

                        {/* Difficulty */}
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-foreground mb-4">Difficulty</h3>
                            <div className="space-y-2">
                                {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                    <div
                                        key={d}
                                        onClick={() => setDifficulty(difficulty === d ? undefined : d)}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-sm font-medium",
                                            difficulty === d ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                        )}
                                    >
                                        <span>{d.charAt(0) + d.slice(1).toLowerCase()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-surface border border-white/5 rounded-xl p-6">
                            <h3 className="font-bold text-foreground mb-4">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {['Arrays', 'Strings', 'Math', 'Trees', 'DP', 'Graphs'].map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className={cn(
                                            "cursor-pointer hover:border-primary/50 transition-colors",
                                            category === tag ? "bg-primary/20 border-primary text-primary-foreground" : ""
                                        )}
                                        onClick={() => setCategory(category === tag ? undefined : tag)}
                                    >
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

function Button({ className, variant = "default", ...props }: any) {
    return <button className={cn("inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50",
        variant === "ghost" ? "hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90",
        className)} {...props} />
}
