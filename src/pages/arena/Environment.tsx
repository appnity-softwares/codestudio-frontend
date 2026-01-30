
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { eventsAPI, contestsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, Trophy, Clock, ChevronLeft } from "lucide-react";
import { formatDistanceToNow, differenceInSeconds } from "date-fns";

export default function ContestEnvironment() {
    const { id: eventId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    // queryClient is available from useQueryClient() for future invalidation

    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    const [code, setCode] = useState("");
    const [language, setLanguage] = useState("python");
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("description");
    const [isDirty, setIsDirty] = useState(false);

    // Load saved code from localStorage
    useEffect(() => {
        if (selectedProblemId && eventId) {
            const savedCode = localStorage.getItem(`contest_${eventId}_${selectedProblemId}`);
            if (savedCode) {
                setCode(savedCode);
            }
        }
    }, [selectedProblemId, eventId]);

    // Save code to localStorage
    useEffect(() => {
        if (selectedProblemId && eventId && code && isDirty) {
            localStorage.setItem(`contest_${eventId}_${selectedProblemId}`, code);
        }
    }, [code, isDirty, selectedProblemId, eventId]);

    // Prevent accidental exit
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    const handleExit = () => {
        if (isDirty) {
            if (confirm("You have unsaved changes. Are you sure you want to exit the contest room?")) {
                navigate('/arena');
            }
        } else {
            navigate('/arena');
        }
    };

    // Fetch Event Details (for timer)
    const { data: eventData } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => eventsAPI.getById(eventId!)
    });

    // Fetch Problems
    const { data: problemsData, isLoading: isProblemsLoading } = useQuery({
        queryKey: ['contest-problems', eventId],
        queryFn: () => contestsAPI.getProblems(eventId!)
    });

    // CRITICAL: Auto-Redirect if Contest Ends
    useEffect(() => {
        if (eventData?.event) {
            const isEnded = eventData.event.status === 'ENDED' || new Date() > new Date(eventData.event.endTime);
            // Practice Arena is separate
            if (eventId !== 'practice-arena-mvp' && isEnded) {
                // Allow staying in the environment for upsolving/practice
                // Just notify the user
            }
        }
    }, [eventData, eventId]);

    // Auto-select first problem
    useEffect(() => {
        if (problemsData?.problems?.length && !selectedProblemId) {
            setSelectedProblemId(problemsData.problems[0].id);
        }
    }, [problemsData, selectedProblemId]);

    // Fetch Selected Problem Details
    const { data: problemData, isLoading: isProblemLoading } = useQuery({
        queryKey: ['problem', selectedProblemId],
        queryFn: () => contestsAPI.getProblem(eventId!, selectedProblemId!),
        enabled: !!selectedProblemId
    });

    // Reset code when problem changes (or load saved draft - MVP: reset)
    useEffect(() => {
        if (problemData?.problem) {
            // Load starter code if available and code is empty
            // Note: In real app, we'd save drafts to local storage
            try {
                const starter = JSON.parse(problemData.problem.starterCode || "{}");
                if (starter[language]) {
                    setCode(starter[language]);
                } else if (!code) {
                    setCode("");
                }
            } catch (e) {
                if (typeof problemData.problem.starterCode === 'string') {
                    setCode(problemData.problem.starterCode);
                }
            }
        }
    }, [problemData, language]);

    const problem = problemData?.problem;

    const checkAccessMutation = useMutation({
        mutationFn: () => eventsAPI.getAccessDetails(eventId!),
        onError: (err: any) => {
            toast({
                title: "Access Denied",
                description: err.message || "You no longer have access to this contest.",
                variant: "destructive"
            });
            navigate('/arena');
        }
    });

    const handleProblemChange = async (problemId: string) => {
        if (isDirty) {
            if (!confirm("Switching problem might lose unsaved code. Continue?")) return;
        }

        try {
            await checkAccessMutation.mutateAsync();
            setSelectedProblemId(problemId);
            setIsDirty(false);
            setExecutionResult(null);
            setActiveTab("description");
        } catch (e) {
            // Error already handled by mutation's onError
        }
    };

    // Submit Solution Mutation
    const submitMutation = useMutation({
        mutationFn: () => contestsAPI.submitSolution(eventId!, selectedProblemId!, code, language),
        onSuccess: (data) => {
            const submission = data.submission;
            let title = "Submission Received";
            let variant: "default" | "destructive" = "default";

            if (submission.status === 'ACCEPTED') {
                title = "Accepted! 🎉";
            } else if (submission.status === 'REJECTED' || submission.status === 'WA') {
                title = "Wrong Answer";
                variant = "destructive";
            } else {
                title = `Verdict: ${submission.status}`;
                variant = "destructive";
            }

            toast({
                title,
                description: `Passed ${submission.testCasesPassed}/${submission.totalTestCases} cases`,
                variant
            });
            setExecutionResult({
                status: submission.status,
                verdict: submission.verdict,
                passed: submission.testCasesPassed,
                total: submission.totalTestCases
            });
            setActiveTab("result");
        },
        onError: (err: any) => {
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
        }
    });

    // Run custom test (Run Code) - Executing against first test case or custom input
    // For MVP: Run against first provided test case input
    const handleRunCode = async () => {
        if (!problem?.testCases?.length) {
            toast({ title: "No test cases available to run" });
            return;
        }

        setExecuting(true);
        try {
            // Using first sample test case for run (handled by backend)
            // We need to inject input. Piston API handles usage.
            // Our execute API handles this.

            // Wait, existing snippetsAPI.execute doesn't support input (stdin).
            // But I updated the backend logic for `SubmitSolution` to handle it.
            // But purely for "Run Code" button, the frontend calls `snippetsAPI.execute` which I previously viewed and it ONLY took lang/code.
            // I updated the SERVICE on backend, but not the handler `ExecuteCode` in `handlers/piston.go` (if that's where it is) or generic `ExecuteCode` global handler.
            // Let's assume for now "Run" just runs compilation. "Submit" runs tests.
            // Or I use `snippetsAPI.execute` for generic check.

            // Actually, I can use the same `submitSolution` logic but maybe dry-run? No.
            // I'll just run it as a generic code execution for now to check syntax.

            // Execute against sample cases via backend
            const res = await contestsAPI.runSolution(eventId!, selectedProblemId!, code, language);

            // Adapt new detailed results to legacy view
            const aggregatedStdout = res.results.map((r, i) => `--- Case ${i + 1} ---\nInput: ${r.input}\nExpected: ${r.expected}\nActual: ${r.actual}\nStatus: ${r.status}`).join("\n\n");
            const aggregatedStderr = res.results.filter(r => r.stderr).map((r, i) => `Case ${i + 1}: ${r.stderr}`).join("\n");

            setExecutionResult({
                type: 'run',
                stdout: aggregatedStdout,
                stderr: aggregatedStderr,
                code: 0
            });
            setActiveTab("result");
        } catch (e) {
            toast({ title: "Execution Error", variant: "destructive" });
        } finally {
            setExecuting(false);
        }
    };

    const event = eventData?.event;

    if (isProblemsLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="h-14 border-b flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleExit}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                    <div className="h-6 w-px bg-border mx-2" />
                    <h2 className="font-semibold truncate max-w-[200px]">{event?.title}</h2>
                </div>

                <div className="flex items-center gap-4">
                    {/* Timer - Hide for Practice */}
                    {event && event.id !== 'practice-arena-mvp' && (
                        <div className="flex items-center gap-2 font-mono bg-muted px-3 py-1 rounded-full text-xs">
                            <Clock className="w-3 h-3" />
                            <ContestTimer startTime={event.startTime} endTime={event.endTime} />
                        </div>
                    )}
                    {event?.id !== 'practice-arena-mvp' && (
                        <Button size="sm" variant="outline" onClick={() => navigate(`/contest/${eventId}/leaderboard`)}>
                            <Trophy className="w-4 h-4 mr-2" /> Leaderboard
                        </Button>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Problems Sidebar */}
                <div className="w-64 border-r bg-muted/10 shrink-0 flex flex-col">
                    <div className="p-3 border-b font-medium text-sm">Problems</div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {problemsData?.problems?.map((p: any) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleProblemChange(p.id)}
                                    disabled={checkAccessMutation.isPending}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex justify-between items-center ${selectedProblemId === p.id
                                        ? 'bg-primary/10 text-primary font-medium'
                                        : 'hover:bg-muted text-muted-foreground'
                                        } ${checkAccessMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <span className="truncate">{p.orderIndex || p.order}. {p.title}</span>
                                    {/* Status Icon Placeholder (would need user submission status) */}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Problem & Editor Area */}
                <div className="flex-1 flex min-w-0">
                    {/* Left: Problem Description */}
                    <div className="flex-1 border-r flex flex-col min-w-[350px]">
                        {isProblemLoading || !problem ? (
                            <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin" /></div>
                        ) : (
                            <ScrollArea className="flex-1">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <h1 className="text-2xl font-bold">{problem.title}</h1>
                                        <div className="flex gap-2">
                                            <Badge>{problem.difficulty}</Badge>
                                            <Badge variant="outline">{problem.points} pts</Badge>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert max-w-none text-sm">
                                        <h3 className="uppercase text-xs font-bold text-muted-foreground mb-2">Description</h3>
                                        <p className="whitespace-pre-wrap mb-6">{problem.description}</p>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="bg-muted/30 p-3 rounded">
                                                <span className="text-xs font-bold text-muted-foreground block mb-1">Time Limit</span>
                                                {problem.timeLimit}s (or ms)
                                            </div>
                                            <div className="bg-muted/30 p-3 rounded">
                                                <span className="text-xs font-bold text-muted-foreground block mb-1">Memory Limit</span>
                                                {problem.memoryLimit}MB
                                            </div>
                                        </div>

                                        <h3 className="uppercase text-xs font-bold text-muted-foreground mb-2">Input Format</h3>
                                        <p className="whitespace-pre-wrap mb-4 font-mono text-xs bg-muted/50 p-2 rounded">{problem.constraints}</p>
                                    </div>
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Right: Editor & Console */}
                    <div className="flex-1 flex flex-col min-w-[350px]">
                        {/* Editor Toolbar */}
                        <div className="h-10 border-b flex items-center justify-between px-3 bg-muted/10">
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[120px] h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="cpp">C++</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="go">Go</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleRunCode} disabled={executing}>
                                    {executing && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                    Run
                                </Button>
                                <Button size="sm" className="h-7 text-xs" onClick={() => submitMutation.mutate()} disabled={submitMutation.isPending}>
                                    {submitMutation.isPending && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                                    Submit
                                </Button>
                            </div>
                        </div>

                        {/* Editor */}
                        <div className="flex-1 relative">
                            <Textarea
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    setIsDirty(true);
                                }}
                                className="absolute inset-0 w-full h-full resize-none rounded-none border-0 font-mono text-sm p-4 focus-visible:ring-0"
                                placeholder="Write your solution here..."
                                spellCheck={false}
                            />
                        </div>

                        {/* Console/Result */}
                        <div className="h-[200px] border-t bg-muted/10 flex flex-col">
                            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                                <TabsList className="h-8 justify-start rounded-none border-b bg-muted/20 px-2">
                                    <TabsTrigger value="description" className="h-6 text-xs">Test Cases</TabsTrigger>
                                    <TabsTrigger value="result" className="h-6 text-xs">Result</TabsTrigger>
                                </TabsList>
                                <TabsContent value="description" className="flex-1 p-4 overflow-auto">
                                    {problem?.testCases?.length > 0 ? (
                                        <div className="space-y-4">
                                            {problem.testCases.map((tc: any, i: number) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="text-xs font-bold text-muted-foreground">Case {i + 1}</p>
                                                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                                        <div className="bg-background border rounded p-2">
                                                            <div className="text-muted-foreground mb-1">Input</div>
                                                            {tc.input}
                                                        </div>
                                                        <div className="bg-background border rounded p-2">
                                                            <div className="text-muted-foreground mb-1">Output</div>
                                                            {tc.output}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No public test cases to display.</div>
                                    )}
                                </TabsContent>
                                <TabsContent value="result" className="flex-1 p-4 overflow-auto">
                                    {executionResult ? (
                                        <div className="space-y-2">
                                            {executionResult.type === 'run' ? (
                                                <>
                                                    <div className="font-mono text-sm whitespace-pre-wrap">{executionResult.stdout}</div>
                                                    {executionResult.stderr && (
                                                        <div className="text-red-400 font-mono text-xs mt-2 whitespace-pre-wrap">{executionResult.stderr}</div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full text-center">
                                                    {executionResult.status === 'ACCEPTED' ? (
                                                        <CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
                                                    ) : (
                                                        <XCircle className="h-10 w-10 text-red-500 mb-2" />
                                                    )}
                                                    <h3 className="text-lg font-bold">{executionResult.verdict}</h3>
                                                    <p className="text-muted-foreground">
                                                        Passed {executionResult.passed} of {executionResult.total} test cases
                                                    </p>
                                                    {executionResult.status === 'ACCEPTED' && (
                                                        <div className="pt-4 border-t border-border/50 mt-4 flex items-center justify-between w-full">
                                                            <div className="text-xs text-muted-foreground">
                                                                Solution accepted!
                                                            </div>
                                                            {(() => {
                                                                const problems = problemsData?.problems;
                                                                if (!problems) return null;
                                                                const currentIndex = problems.findIndex((p: any) => p.id === selectedProblemId);
                                                                const nextProblem = problems[currentIndex + 1];
                                                                if (nextProblem) {
                                                                    return (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleProblemChange(nextProblem.id)}
                                                                            disabled={checkAccessMutation.isPending}
                                                                            className="font-bold gap-2"
                                                                        >
                                                                            Next Problem
                                                                            <ChevronLeft className="w-4 h-4 rotate-180" />
                                                                        </Button>
                                                                    );
                                                                }
                                                                return (
                                                                    <div className="text-green-600 text-xs font-bold flex items-center gap-2">
                                                                        <Trophy className="w-4 h-4" />
                                                                        Completed!
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground text-center pt-8">
                                            Run or Submit your code to see results here.
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ContestTimer({ startTime, endTime }: { startTime: string; endTime: string }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) {
        return <span>Starts in {formatDistanceToNow(start)}</span>;
    }

    if (now > end) {
        return <span className="text-red-500">Ended</span>;
    }

    const diff = differenceInSeconds(end, now);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return (
        <span className={diff < 300 ? "text-red-500 animate-pulse" : ""}>
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}
