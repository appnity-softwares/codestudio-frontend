import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CodeEditor } from "@/components/CodeEditor";

export default function AdminPractice() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<any>(null);
    const [problemToDelete, setProblemToDelete] = useState<string | null>(null);

    // Code Editor States
    const [starterCode, setStarterCode] = useState("");
    const [solutionCode, setSolutionCode] = useState("");
    const [testCases, setTestCases] = useState("");

    // Fetch Problems
    const { data } = useQuery({
        queryKey: ['admin-practice-problems'],
        queryFn: adminAPI.getPracticeProblems,
    });

    // Mutations
    const createMutation = useMutation({
        mutationFn: adminAPI.createPracticeProblem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-practice-problems'] });
            setIsDialogOpen(false);
            setEditingProblem(null);
            toast({ title: "Success", description: "Practice problem created" });
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updatePracticeProblem(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-practice-problems'] });
            setIsDialogOpen(false);
            setEditingProblem(null);
            toast({ title: "Success", description: "Practice problem updated" });
        },
        onError: (err: any) => toast({ variant: "destructive", title: "Error", description: err.message })
    });

    const deleteMutation = useMutation({
        mutationFn: adminAPI.deletePracticeProblem,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-practice-problems'] });
            toast({ title: "Success", description: "Problem deleted" });
        }
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const data = {
            title: formData.get("title") as string,
            difficulty: formData.get("difficulty") as string,
            category: formData.get("category") as string,
            description: formData.get("description") as string,
            starterCode,
            solutionCode,
            testCases,
            language: formData.get("language") as string,
        };

        // Simple JSON validation
        try {
            JSON.parse(data.testCases);
        } catch (e) {
            toast({ variant: "destructive", title: "Invalid JSON", description: "Test cases must be a valid JSON array." });
            return;
        }

        if (editingProblem) {
            updateMutation.mutate({ id: editingProblem.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const problems = data?.problems.filter(p =>
        p.title.toLowerCase().includes(search.toLowerCase())
    ) || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Practice Problems</h1>
                    <p className="text-muted-foreground">Manage algorithm challenges for users.</p>
                </div>
                <Button onClick={() => {
                    setEditingProblem(null);
                    setStarterCode("");
                    setSolutionCode("");
                    setTestCases("");
                    setIsDialogOpen(true);
                }}>
                    <Plus className="mr-2 h-4 w-4" /> New Problem
                </Button>
            </div>

            <div className="bg-card border rounded-lg p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search problems..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingProblem ? 'Edit Problem' : 'Create Problem'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSave} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input name="title" defaultValue={editingProblem?.title} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Category</Label>
                                    <Input name="category" placeholder="e.g. Arrays" defaultValue={editingProblem?.category} required />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Difficulty</Label>
                                    <Select name="difficulty" defaultValue={editingProblem?.difficulty || "EASY"}>
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
                                <div className="space-y-2">
                                    <Label>Language</Label>
                                    <Select name="language" defaultValue={editingProblem?.language || "python"}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="python">Python</SelectItem>
                                            <SelectItem value="javascript">JavaScript</SelectItem>
                                            <SelectItem value="go">Go</SelectItem>
                                            <SelectItem value="cpp">C++</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description (Markdown)</Label>
                                <Textarea name="description" className="font-mono min-h-[100px]" defaultValue={editingProblem?.description} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4 h-[300px]">
                                <div className="space-y-2 flex flex-col h-full">
                                    <Label>Starter Code</Label>
                                    <div className="flex-1 border border-input rounded-md overflow-hidden">
                                        <CodeEditor
                                            code={starterCode}
                                            language="python" // Defaulting to python for now, ideally tied to language select
                                            onChange={(val) => setStarterCode(val || "")}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 flex flex-col h-full">
                                    <Label>Solution Code (Hidden)</Label>
                                    <div className="flex-1 border border-input rounded-md overflow-hidden">
                                        <CodeEditor
                                            code={solutionCode}
                                            language="python"
                                            onChange={(val) => setSolutionCode(val || "")}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 h-[200px] flex flex-col">
                                <Label>Test Cases (JSON Array)</Label>
                                <div className="flex-1 border border-input rounded-md overflow-hidden">
                                    <CodeEditor
                                        code={testCases}
                                        language="json"
                                        onChange={(val) => setTestCases(val || "")}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">JSON format: {`[{"input": "...", "expected": "..."}]`}</p>
                            </div>

                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                    {editingProblem ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>

                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-white/5">
                            <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Title</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Difficulty</TableHead>
                            <TableHead className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Stats</TableHead>
                            <TableHead className="text-right text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {problems.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-48 text-center">
                                    <div className="flex flex-col items-center justify-center opacity-40">
                                        <Search className="h-10 w-10 mb-2" />
                                        <p className="text-sm font-mono uppercase tracking-widest">No challenges in the buffer</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : problems.map((problem: any) => (
                            <TableRow key={problem.id} className="border-white/5 hover:bg-white/[0.02] transition-colors">
                                <TableCell className="font-medium py-4">
                                    <div className="font-headline text-white/90">{problem.title}</div>
                                    <div className="text-[10px] font-mono text-primary/60 uppercase tracking-widest mt-0.5">{problem.category}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(
                                        "font-mono text-[9px] font-bold px-2 py-0 border-0 bg-white/5",
                                        problem.difficulty === 'EASY' ? "text-emerald-400" :
                                            problem.difficulty === 'MEDIUM' ? "text-amber-400" : "text-rose-400"
                                    )}>
                                        {problem.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-[10px] font-mono whitespace-nowrap">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-white/40 uppercase tracking-tighter">Solves</span>
                                            <span className="text-white/80">{problem.solveCount || 0}</span>
                                        </div>
                                        <div className="flex flex-col border-l border-white/5 pl-4">
                                            <span className="text-white/40 uppercase tracking-tighter">Attempts</span>
                                            <span className="text-white/80">{problem.attemptCount || 0}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1">
                                        <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-all" onClick={() => {
                                            setEditingProblem(problem);
                                            setStarterCode(problem.starterCode || "");
                                            setSolutionCode(problem.solutionCode || "");
                                            setTestCases(problem.testCases || "");
                                            setIsDialogOpen(true);
                                        }}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-rose-400/60 hover:text-rose-400 hover:bg-rose-400/10 transition-all" onClick={() => {
                                            setProblemToDelete(problem.id);
                                        }}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {/* Deactivation/Delete Confirmation */}
                <AlertDialog open={!!problemToDelete} onOpenChange={(open) => !open && setProblemToDelete(null)}>
                    <AlertDialogContent className="bg-surface border-white/10">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription className="text-muted-foreground">
                                This action cannot be undone. This will permanently delete the practice challenge
                                and all associated user submissions.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    if (problemToDelete) {
                                        deleteMutation.mutate(problemToDelete);
                                        setProblemToDelete(null);
                                    }
                                }}
                                className="bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                            >
                                Delete Challenge
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
