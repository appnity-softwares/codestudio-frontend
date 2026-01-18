import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contestsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Trash2, Save, ArrowLeft, Code } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface ProblemEditorProps {
    eventId: string;
    eventTitle?: string;
    onBack: () => void;
}

export function ProblemEditor({ eventId, eventTitle, onBack }: ProblemEditorProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
    const [view, setView] = useState<'LIST' | 'EDIT'>('LIST');

    // Fetch Problems
    const { data: problemsData, isLoading: isLoadingProblems } = useQuery({
        queryKey: ['adminProblems', eventId],
        queryFn: () => contestsAPI.getProblems(eventId)
    });

    const problems = problemsData?.problems || [];

    // Edit Mode State
    const [editForm, setEditForm] = useState({
        title: '',
        description: '',
        difficulty: 'EASY',
        points: 10,
        timeLimit: 1.0,
        memoryLimit: 256,
        testCases: [] as { input: string; output: string; isHidden: boolean }[]
    });

    // Populate form when problem selected
    const { data: problemDetail } = useQuery({
        queryKey: ['adminProblem', eventId, selectedProblemId],
        queryFn: () => contestsAPI.getProblem(eventId, selectedProblemId!),
        enabled: !!selectedProblemId && view === 'EDIT'
    });

    useEffect(() => {
        if (problemDetail?.problem) {
            const p = problemDetail.problem;
            setEditForm({
                title: p.title,
                description: p.description,
                difficulty: p.difficulty,
                points: p.points,
                timeLimit: p.timeLimit,
                memoryLimit: p.memoryLimit,
                testCases: p.testCases || []
            });
        }
    }, [problemDetail]);

    // Mutations
    const createMutation = useMutation({
        mutationFn: (data: any) => contestsAPI.createProblem(eventId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProblems', eventId] });
            setView('LIST');
            toast({ title: "Problem Created" });
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => contestsAPI.updateProblem(eventId, selectedProblemId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminProblems', eventId] });
            queryClient.invalidateQueries({ queryKey: ['adminProblem', eventId, selectedProblemId] });
            toast({ title: "Problem Updated" });
        }
    });

    const handleCreateNew = () => {
        setSelectedProblemId(null);
        setEditForm({
            title: '',
            description: '',
            difficulty: 'EASY',
            points: 10,
            timeLimit: 1.0,
            memoryLimit: 256,
            testCases: []
        });
        setView('EDIT');
    };

    const handleEdit = (id: string) => {
        setSelectedProblemId(id);
        setView('EDIT');
    };

    const handleSave = () => {
        const payload = {
            ...editForm,
            points: Number(editForm.points),
            timeLimit: Number(editForm.timeLimit),
            memoryLimit: Number(editForm.memoryLimit)
        };

        if (selectedProblemId) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const addTestCase = () => {
        setEditForm(prev => ({
            ...prev,
            testCases: [...prev.testCases, { input: '', output: '', isHidden: false }]
        }));
    };

    const removeTestCase = (idx: number) => {
        setEditForm(prev => ({
            ...prev,
            testCases: prev.testCases.filter((_, i) => i !== idx)
        }));
    };

    if (view === 'LIST') {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-4 h-4" /></Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{eventTitle} Problems</h2>
                        <p className="text-muted-foreground">Manage problems for this contest.</p>
                    </div>
                    <Button onClick={handleCreateNew} className="ml-auto"><Plus className="w-4 h-4 mr-2" /> Add Problem</Button>
                </div>

                <div className="grid gap-4">
                    {isLoadingProblems && <Loader2 className="w-8 h-8 animate-spin mx-auto text-neutral-500" />}
                    {problems.map((p: any) => (
                        <Card key={p.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 cursor-pointer" onClick={() => handleEdit(p.id)}>
                            <CardContent className="p-6 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-white">{p.title}</h3>
                                    <div className="flex gap-2 mt-1">
                                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${p.difficulty === 'HARD' ? 'bg-red-500/20 text-red-500' :
                                            p.difficulty === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                                                'bg-green-500/20 text-green-500'
                                            }`}>{p.difficulty}</span>
                                        <span className="text-xs text-neutral-500 font-mono">{p.points} pts</span>
                                    </div>
                                </div>
                                <Code className="w-5 h-5 text-neutral-600" />
                            </CardContent>
                        </Card>
                    ))}
                    {problems.length === 0 && !isLoadingProblems && <p className="text-center text-neutral-500">No problems yet.</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setView('LIST')}><ArrowLeft className="w-4 h-4" /></Button>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">{selectedProblemId ? 'Edit Problem' : 'New Problem'}</h2>
                    </div>
                </div>
                <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                    {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Problem
                </Button>
            </div>

            <Tabs defaultValue="details" className="w-full">
                <TabsList className="bg-neutral-900 border-b border-neutral-800 w-full justify-start rounded-none h-auto p-0">
                    <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Details</TabsTrigger>
                    <TabsTrigger value="testcases" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-6 py-3">Test Cases ({editForm.testCases.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} className="bg-neutral-900 border-neutral-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Difficulty</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm text-white"
                                value={editForm.difficulty}
                                onChange={e => setEditForm({ ...editForm, difficulty: e.target.value })}
                            >
                                <option value="EASY">Easy</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HARD">Hard</option>
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Description (Markdown)</Label>
                        <Textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="bg-neutral-900 border-neutral-800 min-h-[200px] font-mono" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>Points</Label>
                            <Input type="number" value={editForm.points} onChange={e => setEditForm({ ...editForm, points: Number(e.target.value) })} className="bg-neutral-900 border-neutral-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Time Limit (s)</Label>
                            <Input type="number" step="0.1" value={editForm.timeLimit} onChange={e => setEditForm({ ...editForm, timeLimit: Number(e.target.value) })} className="bg-neutral-900 border-neutral-800" />
                        </div>
                        <div className="space-y-2">
                            <Label>Memory Limit (MB)</Label>
                            <Input type="number" value={editForm.memoryLimit} onChange={e => setEditForm({ ...editForm, memoryLimit: Number(e.target.value) })} className="bg-neutral-900 border-neutral-800" />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="testcases" className="pt-6">
                    <div className="space-y-4">
                        {editForm.testCases.map((tc, idx) => (
                            <div key={idx} className="bg-neutral-900 border border-neutral-800 p-4 rounded-lg space-y-3 relative group">
                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-neutral-500 hover:text-red-500 h-6 w-6" onClick={() => removeTestCase(idx)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-neutral-400">Input</Label>
                                        <Textarea value={tc.input} onChange={e => {
                                            const newTC = [...editForm.testCases];
                                            newTC[idx].input = e.target.value;
                                            setEditForm({ ...editForm, testCases: newTC });
                                        }} className="bg-black border-neutral-800 font-mono text-xs h-20" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-neutral-400">Output</Label>
                                        <Textarea value={tc.output} onChange={e => {
                                            const newTC = [...editForm.testCases];
                                            newTC[idx].output = e.target.value;
                                            setEditForm({ ...editForm, testCases: newTC });
                                        }} className="bg-black border-neutral-800 font-mono text-xs h-20" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" checked={tc.isHidden} onChange={e => {
                                        const newTC = [...editForm.testCases];
                                        newTC[idx].isHidden = e.target.checked;
                                        setEditForm({ ...editForm, testCases: newTC });
                                    }} className="rounded bg-neutral-800 border-neutral-700" />
                                    <Label className="text-xs text-neutral-400">Hidden (Not shown to user)</Label>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addTestCase} className="w-full border-dashed border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500">
                            <Plus className="w-4 h-4 mr-2" /> Add Test Case
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
