
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { eventsAPI, contestsAPI, authAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CodeEditor, BOILERPLATES } from "@/components/CodeEditor";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, XCircle, Clock, ChevronLeft, AlertTriangle, ShieldCheck, Lock, Shield, Trophy } from "lucide-react";
import { differenceInSeconds, isBefore } from "date-fns";
import { ContestRulesDialog } from "@/components/ContestRulesDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Markdown } from "@/components/shared/Markdown";



export default function OfficialContest() {
    const { id: eventId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    // State
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    const [code, setCode] = useState(BOILERPLATES.python);
    const [language, setLanguage] = useState("python");
    const [executionResult, setExecutionResult] = useState<any>(null);
    const [activeTab, setActiveTab] = useState("description");
    const [isDirty, setIsDirty] = useState(false);

    // Anti-Cheating State
    const blurCount = useRef(0);
    const pasteCount = useRef(0);
    const pastedChars = useRef(0);

    // 1. Fetch Event
    const { data: eventData } = useQuery({
        queryKey: ['event', eventId],
        queryFn: () => eventsAPI.getById(eventId!)
    });

    const event = eventData?.event;
    // CRITICAL: Force re-evaluation of isUpcoming every second to enable auto-entry
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const isUpcoming = event && isBefore(now, new Date(event.startTime));
    const isLocked = isUpcoming && event.id !== 'practice-arena-mvp'; // Practice is never locked

    // 2. Fetch User Trust Score
    const { data: userStats } = useQuery({
        queryKey: ['my-trust-score'],
        queryFn: () => authAPI.me()
    });

    // 3. Fetch Problems (Only if not locked)
    const { data: problemsData } = useQuery({
        queryKey: ['contest-problems', eventId],
        queryFn: () => contestsAPI.getProblems(eventId!),
        enabled: !!event && !isLocked,
        retry: false
    });

    // 4. Logic: Show Rules if not Registered
    // For MVP, "Registered" means "Rules Accepted" for free contests.
    // If event suggests we are registered    // 3. Check Registration & Rules
    const isRegistered = eventData?.isRegistered;
    const rulesAccepted = eventData?.rulesAccepted;

    const showLanding = !isRegistered || (isRegistered && !rulesAccepted);

    // Auto-select first problem
    useEffect(() => {
        if (problemsData?.problems?.length && !selectedProblemId) {
            setSelectedProblemId(problemsData.problems[0].id);
        }
    }, [problemsData, selectedProblemId]);

    // Fetch Selected Problem
    const { data: problemData, isLoading: isProblemLoading } = useQuery({
        queryKey: ['problem', selectedProblemId],
        queryFn: () => contestsAPI.getProblem(eventId!, selectedProblemId!),
        enabled: !!selectedProblemId && !isLocked && !showLanding
    });

    const problem = problemData?.problem;

    // Load saved code from localStorage
    useEffect(() => {
        if (selectedProblemId && eventId) {
            const savedCode = localStorage.getItem(`contest_${eventId}_${selectedProblemId}`);
            if (savedCode) {
                setCode(savedCode);
            } else {
                setCode(BOILERPLATES[language as keyof typeof BOILERPLATES] || "");
            }
        }
    }, [selectedProblemId, eventId, language]);

    // Save code to localStorage
    useEffect(() => {
        if (selectedProblemId && eventId && code && isDirty) {
            localStorage.setItem(`contest_${eventId}_${selectedProblemId}`, code);
        }
    }, [code, isDirty, selectedProblemId, eventId]);

    const handleLanguageChange = (newLang: string) => {
        if (isDirty) {
            if (!confirm("Switching language will reset your code. Continue?")) return;
        }
        setLanguage(newLang);
        const savedCode = localStorage.getItem(`contest_${eventId}_${selectedProblemId}`);
        if (!savedCode) {
            setCode(BOILERPLATES[newLang as keyof typeof BOILERPLATES] || "");
        }
        setIsDirty(false);
    };

    // Prevent accidental exit
    useEffect(() => {
        if (isLocked || showLanding) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty, isLocked, showLanding]);

    const handleExit = () => {
        if (isDirty) {
            if (confirm("You have unsaved changes. If you leave now, you might lose progress. Are you sure you want to exit the contest room?")) {
                navigate('/arena');
            }
        } else {
            navigate('/arena');
        }
    };

    // Anti-Cheating Listeners (Only active if unlocked)
    useEffect(() => {
        if (isLocked || showLanding) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                blurCount.current++;
                console.warn(`[Anti-Cheat] Tab blur detected. Count: ${blurCount.current}`);
                if (blurCount.current > 3 && blurCount.current % 5 === 0) {
                    toast({
                        title: "Warning: Focus Lost",
                        description: "Multiple tab switches detected. This activity is flagged.",
                        variant: "destructive"
                    });
                }
            }
        };

        const handleWindowBlur = () => {
            // Just count, don't spam toasts for every window blur/alt-tab
            blurCount.current++;
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleWindowBlur);

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleWindowBlur);
        };
    }, [isLocked, showLanding]);

    const submitMutation = useMutation({
        mutationFn: () => contestsAPI.submitSolution(eventId!, selectedProblemId!, code, language, {
            pasteCount: pasteCount.current,
            pastedChars: pastedChars.current,
            blurCount: blurCount.current
        }),
        onSuccess: (data) => {
            const result = data.submission;
            setExecutionResult({
                status: result.status,
                verdict: result.verdict,
                passed: result.testCasesPassed,
                total: result.totalTestCases,
                runtime: result.runtime
            });
            setActiveTab("result");

            if (result.status === 'ACCEPTED') {
                toast({ title: "Accepted! 🎉", className: "bg-green-600 text-white" });
            } else {
                toast({ title: result.verdict, variant: "destructive" });
            }
        },
        onError: (err: any) => {
            toast({ title: "Submission Failed", description: err.message, variant: "destructive" });
        }
    });

    const runMutation = useMutation({
        mutationFn: () => contestsAPI.runSolution(eventId!, selectedProblemId!, code, language),
        onSuccess: (data) => {
            setExecutionResult({
                type: 'run',
                results: data.results
            });
            setActiveTab("result");
        },
        onError: (err: any) => {
            toast({ title: "Run Failed", description: err.message, variant: "destructive" });
        }
    });

    // Rules Acceptance (Handled by Dialog now)
    const [showRulesDialog, setShowRulesDialog] = useState(false);

    // Open dialog if user clicks "Enter" from landing
    const handleEnterClick = () => {
        setShowRulesDialog(true);
    };

    const handleRulesAccepted = () => {
        // Refetch everything
        toast({ title: "Welcome to the Arena", description: "Good luck!" });
        // Force reload or refetch queries
        // eventsAPI.getById(eventId).then... or invalidation
        // For simplicity:
        window.location.reload();
    };

    // 1. LANDING / RULES PAGE (If not registered)
    if (showLanding) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center p-8 pt-20">
                <div className="max-w-3xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <Badge variant="outline" className="mb-2 uppercase tracking-widest">{event?.status || "LOADING"}</Badge>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">{event?.title}</h1>
                        <p className="text-xl text-muted-foreground">{event?.description}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/30 p-4 rounded-xl border text-center">
                            <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                            <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Duration</div>
                            <div className="text-lg font-mono font-bold">
                                {event ? differenceInSeconds(new Date(event.endTime), new Date(event.startTime)) / 60 : "--"} min
                            </div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl border text-center">
                            <Shield className="h-6 w-6 mx-auto mb-2 text-violet-500" />
                            <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Type</div>
                            <div className="text-lg font-bold">Ranked</div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl border text-center">
                            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
                            <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Anti-Cheat</div>
                            <div className="text-lg font-bold">Active</div>
                        </div>
                        <div className="bg-muted/30 p-4 rounded-xl border text-center">
                            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-500" />
                            <div className="text-sm text-muted-foreground uppercase tracking-wide font-semibold">Points</div>
                            <div className="text-lg font-bold">{event?.metadata?.totalPoints || "--"}</div>
                        </div>
                    </div>

                    {/* Warning / Trust Score */}
                    <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-6 rounded-r-xl flex gap-4">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 shrink-0" />
                        <div className="space-y-2">
                            <h3 className="font-bold text-yellow-700 dark:text-yellow-500">Important: Honor Code Active</h3>
                            <p className="text-sm text-yellow-600/80 dark:text-yellow-400">
                                This contest is monitored for plagiarism and AI usage.
                                By entering, you agree to our fair play rules.
                                Violations result in immediate disqualification.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex justify-center pt-4">
                        {isUpcoming ? (
                            <Button size="lg" className="w-full sm:w-auto px-12" disabled>
                                <Lock className="mr-2 h-4 w-4" />
                                Contest is Upcoming
                            </Button>
                        ) : (
                            <Button size="lg" className="w-full sm:w-auto px-12 font-bold text-lg h-12" onClick={handleEnterClick}>
                                View Rules & Enter
                            </Button>
                        )}
                    </div>

                    <Button variant="ghost" className="mx-auto block text-muted-foreground" onClick={() => navigate('/arena')}>
                        Back to Arena
                    </Button>
                </div>

                {/* Rules Dialog */}
                {event && (
                    <ContestRulesDialog
                        open={showRulesDialog}
                        onOpenChange={setShowRulesDialog}
                        eventId={eventId!}
                        metrics={{ trustScore: userStats?.user?.trustScore }}
                        onAccepted={handleRulesAccepted}
                    />
                )}
            </div>
        );
    }

    // 2. LOCKED STATE (If registered but not started)
    // Only reachable if registered but start time is future
    if (isUpcoming && isRegistered) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black/95 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                <div className="z-10 text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
                    <h1 className="text-4xl font-bold tracking-tight">You are Registered!</h1>
                    <p className="text-xl text-muted-foreground">Get ready. The arena opens soon.</p>

                    <div className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm">
                        <p className="text-sm text-muted-foreground uppercase tracking-widest mb-2">Contest Starts In</p>
                        <div className="text-6xl font-mono font-bold tracking-tighter">
                            <ContestTimer
                                startTime={event?.startTime}
                                endTime={event?.endTime}
                                big
                                onStart={() => {
                                    console.log("Contest Started! Reloading...");
                                    window.location.reload();
                                }}
                            />
                        </div>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/arena')}>
                        Back to Arena
                    </Button>
                </div>
            </div>
        );
    }

    // 3. MAIN ARENA UI (Only if Registered AND Live/Open)
    return (
        <div className="flex flex-col h-screen bg-background font-sans selection:bg-yellow-500/30">
            {/* Header omitted for brevity in mental model, but I must include it if I'm replacing everything between 363 and 636 */}
            <header className="h-14 border-b flex items-center justify-between px-4 bg-muted/5 shrink-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={handleExit}>
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Exit
                    </Button>
                    <div className="h-6 w-px bg-border mx-2" />
                    <h2 className="font-semibold text-sm sm:text-base truncate max-w-[200px] sm:max-w-md">{event?.title} <span className="text-xs font-normal text-muted-foreground ml-2 hidden sm:inline">(Official)</span></h2>
                </div>

                <div className="flex items-center gap-4">
                    {/* Trust Score */}
                    {userStats?.user && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <div className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full border ${userStats.user.trustScore < 80 ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                        <ShieldCheck className="h-3 w-3" />
                                        <span>Trust: {userStats.user.trustScore}%</span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Your Trust Score. Reduce by violations.</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 text-amber-500" />
                        <span>Anti-Cheat Active</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono bg-muted px-3 py-1 rounded-full text-xs">
                        <Clock className="w-3 h-3" />
                        <ContestTimer startTime={event?.startTime} endTime={event?.endTime} />
                    </div>

                    <Button variant="outline" size="sm" onClick={() => window.open(`/contest/${eventId}/leaderboard`, '_blank')}>
                        <Trophy className="h-4 w-4 text-yellow-500 mr-2" />
                        <span className="hidden sm:inline">Leaderboard</span>
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* 1. Problem List */}
                <div className="w-64 border-r bg-muted/10 shrink-0 flex flex-col hidden md:flex">
                    <div className="p-3 border-b font-medium text-xs uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                        Problems
                        <Badge variant="outline" className="text-[10px]">{problemsData?.problems?.length || 0}</Badge>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {problemsData?.problems?.map((p: any) => (
                                <button
                                    key={p.id}
                                    onClick={() => {
                                        if (isDirty && !confirm("Switching problem might lose unsaved code. Continue?")) return;
                                        setSelectedProblemId(p.id);
                                        setCode(BOILERPLATES[language as keyof typeof BOILERPLATES] || "");
                                        setIsDirty(false);
                                    }}
                                    className={`w-full text-left px-3 py-3 rounded-md text-sm transition-all border border-transparent ${selectedProblemId === p.id
                                        ? 'bg-background border-border shadow-sm font-medium'
                                        : 'hover:bg-muted text-muted-foreground'
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="truncate w-32">{p.title}</span>
                                        <Badge variant="secondary" className="text-[10px] h-5">{p.points}</Badge>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* 2. Problem Description */}
                <div className="flex-1 border-r flex flex-col min-w-[300px] max-w-2xl bg-background">
                    {isProblemLoading || !problem ? (
                        <div className="flex-1 flex items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
                    ) : (
                        <ScrollArea className="flex-1">
                            <div className="p-6 sm:p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{problem.title}</h1>
                                    <Badge className={
                                        problem.difficulty === "Easy" ? "bg-green-500" :
                                            problem.difficulty === "Medium" ? "bg-yellow-500" :
                                                "bg-red-500"
                                    }>{problem.difficulty}</Badge>
                                </div>

                                <div className="space-y-6">
                                    <Markdown content={problem.description} />

                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="bg-muted/50 p-3 rounded-lg border">
                                            <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Time Limit</span>
                                            <span className="font-mono">{problem.timeLimit}s</span>
                                        </div>
                                        <div className="bg-muted/50 p-3 rounded-lg border">
                                            <span className="text-xs font-bold text-muted-foreground uppercase block mb-1">Memory Limit</span>
                                            <span className="font-mono">{problem.memoryLimit}MB</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {/* 3. Editor & Output */}
                <div className="flex-1 flex flex-col bg-background min-w-[400px]">
                    <div className="h-10 border-b flex items-center justify-between px-3 bg-muted/10">
                        <Select value={language} onValueChange={handleLanguageChange}>
                            <SelectTrigger className="w-[140px] h-7 text-xs font-medium">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="python">Python 3</SelectItem>
                                <SelectItem value="javascript">JavaScript</SelectItem>
                                <SelectItem value="go">Go 1.21</SelectItem>
                                <SelectItem value="cpp">C++ 17</SelectItem>
                                <SelectItem value="java">Java 17</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                className="h-7 text-xs px-4 font-semibold shadow-sm"
                                onClick={() => runMutation.mutate()}
                                disabled={runMutation.isPending || submitMutation.isPending}
                            >
                                {runMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <><Play className="w-3 h-3 mr-2" /> Run</>}
                            </Button>
                            <Button
                                size="sm"
                                className="h-7 text-xs px-6 font-semibold shadow-sm"
                                onClick={() => submitMutation.mutate()}
                                disabled={submitMutation.isPending}
                            >
                                {submitMutation.isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : "Submit Solution"}
                            </Button>
                        </div>
                    </div>

                    <div className="flex-1 relative bg-black/5 dark:bg-black/20">
                        <CodeEditor
                            code={code}
                            language={language}
                            onChange={(value) => {
                                setCode(value || "");
                                setIsDirty(true);
                            }}
                            onPaste={(pastedText) => {
                                pasteCount.current++;
                                pastedChars.current += pastedText.length;
                                if (pastedText.length > 50) {
                                    toast({ title: "Large Paste Detected", description: "Activity flagged.", variant: "destructive" });
                                }
                            }}
                        />
                    </div>

                    <div className="h-[250px] border-t bg-muted/10 flex flex-col">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                            <TabsList className="h-9 justify-start rounded-none border-b bg-muted/20 px-2 w-full">
                                <TabsTrigger value="description" className="h-7 text-xs">Test Cases</TabsTrigger>
                                <TabsTrigger value="result" className="h-7 text-xs">Verdict</TabsTrigger>
                            </TabsList>
                            <TabsContent value="description" className="flex-1 p-4 overflow-auto">
                                {problem?.testCases?.length > 0 ? (
                                    <div className="space-y-4">
                                        {problem.testCases.map((tc: any, i: number) => (
                                            <div key={i} className="space-y-2">
                                                <p className="text-xs font-bold text-muted-foreground uppercase">Sample Case {i + 1}</p>
                                                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                                                    <div className="bg-background border rounded px-3 py-2 overflow-x-auto">
                                                        <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Input</div>
                                                        <pre>{tc.input}</pre>
                                                    </div>
                                                    <div className="bg-background border rounded px-3 py-2 overflow-x-auto">
                                                        <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-wide">Expected Output</div>
                                                        <pre>{tc.output}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : <div className="text-sm text-muted-foreground p-4 text-center">No public test cases.</div>}
                            </TabsContent>
                            <TabsContent value="result" className="flex-1 p-0 overflow-hidden flex flex-col">
                                {executionResult ? (
                                    executionResult.type === 'run' ? (
                                        <ScrollArea className="flex-1">
                                            <div className="p-4 space-y-2">
                                                <h3 className="font-semibold mb-2">Sample Test Results</h3>
                                                <Accordion type="single" collapsible className="w-full">
                                                    {executionResult.results.map((res: any, idx: number) => (
                                                        <AccordionItem key={idx} value={`item-${idx}`}>
                                                            <AccordionTrigger className={cn("px-2 py-1 hover:no-underline", res.status === 'PASSED' ? "text-green-600" : "text-red-500")}>
                                                                <div className="flex items-center gap-2">
                                                                    {res.status === 'PASSED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                                    <span>Sample Case {idx + 1}</span>
                                                                    <Badge variant={res.status === 'PASSED' ? 'outline' : 'destructive'} className="ml-2 text-[10px] h-5">{res.status}</Badge>
                                                                </div>
                                                            </AccordionTrigger>
                                                            <AccordionContent className="px-2 pb-2">
                                                                <div className="grid grid-cols-2 gap-2 text-xs font-mono mt-2">
                                                                    <div>
                                                                        <div className="text-[10px] uppercase text-muted-foreground mb-1">Input</div>
                                                                        <div className="bg-muted p-2 rounded whitespace-pre-wrap">{res.input}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-[10px] uppercase text-muted-foreground mb-1">Expected</div>
                                                                        <div className="bg-muted p-2 rounded whitespace-pre-wrap">{res.expected}</div>
                                                                    </div>
                                                                    <div className="col-span-2">
                                                                        <div className="text-[10px] uppercase text-muted-foreground mb-1">Your Output</div>
                                                                        <div className={cn("bg-muted p-2 rounded whitespace-pre-wrap", res.status !== 'PASSED' && "bg-red-500/10 border-red-500/20 border")}>{res.actual}</div>
                                                                    </div>
                                                                    {res.stderr && (
                                                                        <div className="col-span-2">
                                                                            <div className="text-[10px] uppercase text-red-500 mb-1">Error</div>
                                                                            <div className="bg-red-950/30 text-red-400 p-2 rounded whitespace-pre-wrap">{res.stderr}</div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </AccordionContent>
                                                        </AccordionItem>
                                                    ))}
                                                </Accordion>
                                            </div>
                                        </ScrollArea>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-200">
                                            {executionResult.status === 'ACCEPTED' ? (
                                                <div className="bg-green-500/10 p-4 rounded-full mb-3">
                                                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                                                </div>
                                            ) : (
                                                <div className="bg-red-500/10 p-4 rounded-full mb-3">
                                                    <XCircle className="h-12 w-12 text-red-600" />
                                                </div>
                                            )}
                                            <h3 className="text-2xl font-bold mb-1">{executionResult.verdict}</h3>
                                            <p className="text-muted-foreground mb-4">
                                                Passed {executionResult.passed} of {executionResult.total} test cases
                                            </p>
                                            {executionResult.runtime !== undefined && (
                                                <div className="flex gap-4 text-xs font-mono">
                                                    <div className="bg-muted px-3 py-1 rounded">
                                                        <span className="text-muted-foreground mr-2">Time:</span>
                                                        {executionResult.runtime.toFixed(2)}ms
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                                        Run or Submit your code to see results.
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Updated Timer with Big Mode
// Updated Timer with Big Mode & Seconds
function ContestTimer({ startTime, endTime, big, onStart }: { startTime?: string; endTime?: string, big?: boolean, onStart?: () => void }) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    if (!startTime || !endTime) return null;

    const start = new Date(startTime);
    const end = new Date(endTime);

    // If upcoming
    if (now < start) {
        const diff = differenceInSeconds(start, now);
        // If within 5 seconds of starting, trigger callback
        if (diff <= 1 && onStart) {
            onStart();
        }

        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;

        return (
            <div className="flex flex-col items-center">
                <span className={cn("font-mono font-bold", big ? "text-6xl tracking-tighter" : "text-sm")}>
                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
                </span>
                {big && <span className="text-sm text-muted-foreground uppercase tracking-widest mt-2">Until Start</span>}
            </div>
        );
    }

    // If ended
    if (now > end) return <span className="text-red-500 font-bold">Ended</span>;

    // If Live
    const diff = differenceInSeconds(end, now);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    return (
        <span className={diff < 300 ? (big ? "text-primary animate-pulse font-mono tracking-tighter" : "text-red-500 animate-pulse font-bold") : ""}>
            {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
        </span>
    );
}
