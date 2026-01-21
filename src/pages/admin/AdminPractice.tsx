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

export default function AdminPractice() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProblem, setEditingProblem] = useState<any>(null);

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
            starterCode: formData.get("starterCode") as string,
            solutionCode: formData.get("solutionCode") as string,
            testCases: formData.get("testCases") as string,
            language: formData.get("language") as string,
        };

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
                <Button onClick={() => { setEditingProblem(null); setIsDialogOpen(true); }}>
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Starter Code</Label>
                                    <Textarea name="starterCode" className="font-mono min-h-[200px]" defaultValue={editingProblem?.starterCode} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Solution Code (Hidden)</Label>
                                    <Textarea name="solutionCode" className="font-mono min-h-[200px]" defaultValue={editingProblem?.solutionCode} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Test Cases (JSON Array)</Label>
                                <Textarea
                                    name="testCases"
                                    className="font-mono min-h-[100px]"
                                    placeholder='[{"input": "Start", "expected": "End"}]'
                                    defaultValue={editingProblem?.testCases}
                                />
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
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Difficulty</TableHead>
                            <TableHead>Stats</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {problems.map((problem: any) => (
                            <TableRow key={problem.id}>
                                <TableCell className="font-medium">
                                    <div>{problem.title}</div>
                                    <div className="text-xs text-muted-foreground">{problem.category}</div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={
                                        problem.difficulty === 'EASY' ? "text-emerald-400" :
                                            problem.difficulty === 'MEDIUM' ? "text-amber-400" : "text-rose-400"
                                    }>
                                        {problem.difficulty}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                    <div>Solves: {problem.solveCount || 0}</div>
                                    <div>Attempts: {problem.attemptCount || 0}</div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        setEditingProblem(problem);
                                        setIsDialogOpen(true);
                                    }}>
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-rose-400 hover:text-rose-500" onClick={() => {
                                        if (confirm('Are you sure?')) deleteMutation.mutate(problem.id);
                                    }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
