import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Save, Plus, Trash, Eye, EyeOff, Edit } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CodeEditor } from "@/components/CodeEditor"; // Fixed named import

export default function ProblemEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-problem", id],
        queryFn: () => adminAPI.getProblem(id!),
        enabled: !!id
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminAPI.updateProblem(id!, data),
        onSuccess: () => {
            toast({ title: "Saved", description: "Problem updated successfully." });
            queryClient.invalidateQueries({ queryKey: ["admin-problem", id] });
        }
    });

    const createTestCaseMutation = useMutation({
        mutationFn: (data: any) => adminAPI.createTestCase(id!, data),
        onSuccess: () => {
            toast({ title: "Added", description: "Test case added." });
            queryClient.invalidateQueries({ queryKey: ["admin-problem", id] });
        }
    });

    const deleteTestCaseMutation = useMutation({
        mutationFn: adminAPI.deleteTestCase,
        onSuccess: () => {
            toast({ title: "Deleted", description: "Test case deleted." });
            queryClient.invalidateQueries({ queryKey: ["admin-problem", id] });
        }
    });

    // Form Stats
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [points, setPoints] = useState(100);
    const [timeLimit, setTimeLimit] = useState(1.0);
    const [memoryLimit, setMemoryLimit] = useState(256);
    const [penalty, setPenalty] = useState(10);
    const [order, setOrder] = useState(1);

    // For handling starter code editor per language
    const [selectedLang, setSelectedLang] = useState("javascript");
    const [boilerplateMap, setBoilerplateMap] = useState<Record<string, string>>({});

    useEffect(() => {
        if (data?.problem) {
            const p = data.problem;
            setTitle(p.title);
            setDescription(p.description);
            setDifficulty(p.difficulty);
            setPoints(p.points);
            setTimeLimit(p.timeLimit);
            setMemoryLimit(p.memoryLimit);
            setPenalty(p.penalty || 10);
            setOrder(p.order);

            try {
                const parsed = JSON.parse(p.starterCode || "{}");
                setBoilerplateMap(parsed);
            } catch (e) {
                setBoilerplateMap({});
            }
        }
    }, [data]);

    const handleSave = () => {
        updateMutation.mutate({
            title,
            description,
            difficulty,
            points: Number(points),
            timeLimit: Number(timeLimit),
            memoryLimit: Number(memoryLimit),
            penalty: Number(penalty),
            order: Number(order),
            starterCode: JSON.stringify(boilerplateMap)
        });
    };

    const updateBoilerplate = (code: string | undefined) => {
        setBoilerplateMap(prev => ({ ...prev, [selectedLang]: code || "" }));
    };

    const handleAddTestCase = () => {
        createTestCaseMutation.mutate({
            input: "input",
            output: "output",
            isHidden: false
        });
    };

    if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;
    const problem = data?.problem;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
                <div>
                    <h1 className="text-2xl font-bold">{title || "Edit Problem"}</h1>
                    <Badge variant="secondary">{difficulty}</Badge>
                </div>
                <div className="ml-auto">
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Problem
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="details">
                <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="boilerplate">Boilerplate</TabsTrigger>
                    <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Order</label>
                                    <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Difficulty</label>
                                    <Select value={difficulty} onValueChange={setDifficulty}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Easy">Easy</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Hard">Hard</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Points</label>
                                    <Input type="number" value={points} onChange={(e) => setPoints(Number(e.target.value))} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle>Limits & Penalties</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Time Limit (s)</label>
                                    <Input type="number" step="0.1" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Memory Limit (MB)</label>
                                    <Input type="number" value={memoryLimit} onChange={(e) => setMemoryLimit(Number(e.target.value))} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Penalty per Wrong Attempt (min)</label>
                                    <Input type="number" value={penalty} onChange={(e) => setPenalty(Number(e.target.value))} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Description (Markdown)</CardTitle></CardHeader>
                        <CardContent>
                            <Textarea className="h-64 font-mono" value={description} onChange={(e) => setDescription(e.target.value)} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="boilerplate" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Starter Code</CardTitle>
                            <Select value={selectedLang} onValueChange={setSelectedLang}>
                                <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="python">Python</SelectItem>
                                    <SelectItem value="go">Go</SelectItem>
                                    <SelectItem value="java">Java</SelectItem>
                                    <SelectItem value="cpp">C++</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px] border rounded-md overflow-hidden">
                                <CodeEditor
                                    code={boilerplateMap[selectedLang] || ""}
                                    language={selectedLang}
                                    onChange={updateBoilerplate}
                                />
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                This code will be pre-filled when a user selects this language.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="testcases" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Test Cases</h3>
                        <Button onClick={handleAddTestCase} size="sm"><Plus className="mr-2 h-4 w-4" /> Add Case</Button>
                    </div>

                    <div className="space-y-4">
                        {problem?.TestCases?.map((tc: any, index: number) => (
                            <TestCaseCard
                                key={tc.id}
                                tc={tc}
                                index={index}
                                onDelete={() => deleteTestCaseMutation.mutate(tc.id)}
                            />
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TestCaseCard({ tc, index, onDelete }: { tc: any, index: number, onDelete: () => void }) {
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [input, setInput] = useState(tc.input);
    const [output, setOutput] = useState(tc.output);
    const [isHidden, setIsHidden] = useState(tc.isHidden);

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminAPI.updateTestCase(tc.id, data),
        onSuccess: () => {
            toast({ title: "Saved", description: "Test case updated." });
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ["admin-problem"] });
        }
    });

    const handleSave = () => {
        updateMutation.mutate({ input, output, isHidden });
    };

    if (isEditing) {
        return (
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between">
                        <h4 className="font-semibold">Test Case #{index + 1}</h4>
                        <div className="flex gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button size="sm" onClick={handleSave}>Save</Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold">Input</label>
                            <Textarea value={input} onChange={(e) => setInput(e.target.value)} className="font-mono text-xs h-24" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold">Expected Output</label>
                            <Textarea value={output} onChange={(e) => setOutput(e.target.value)} className="font-mono text-xs h-24" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} id={`hidden-${tc.id}`} />
                        <label htmlFor={`hidden-${tc.id}`} className="text-sm font-medium">Hidden Test Case (Server-side only)</label>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent className="p-4 flex items-start gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">Test Case #{index + 1}</h4>
                        {tc.isHidden ? <Badge variant="secondary"><EyeOff className="h-3 w-3 mr-1" /> Hidden</Badge> : <Badge variant="outline"><Eye className="h-3 w-3 mr-1" /> Public</Badge>}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-muted/50 p-2 rounded">
                        <div className="truncate">In: {tc.input.slice(0, 50)}...</div>
                        <div className="truncate">Out: {tc.output.slice(0, 50)}...</div>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={onDelete}><Trash className="h-4 w-4" /></Button>
                </div>
            </CardContent>
        </Card>
    );
}
