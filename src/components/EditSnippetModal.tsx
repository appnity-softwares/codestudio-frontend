import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { snippetsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Save, Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditSnippetModalProps {
    snippet: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const LANGUAGES = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'go', label: 'Go' },
    { value: 'cpp', label: 'C++' },
    { value: 'java', label: 'Java' },
    { value: 'rust', label: 'Rust' },
    { value: 'c', label: 'C' },
];

export function EditSnippetModal({ snippet, open, onOpenChange }: EditSnippetModalProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [title, setTitle] = useState(snippet.title || "");
    const [description, setDescription] = useState(snippet.description || "");
    const [language, setLanguage] = useState(snippet.language || "python");
    const [code, setCode] = useState(snippet.code || "");
    const [tags, setTags] = useState(snippet.tags?.join(", ") || "");
    const [executing, setExecuting] = useState(false);
    const [executionResult, setExecutionResult] = useState<any>(null);

    // Reset form when snippet changes
    useEffect(() => {
        setTitle(snippet.title || "");
        setDescription(snippet.description || "");
        setLanguage(snippet.language || "python");
        setCode(snippet.code || "");
        setTags(snippet.tags?.join(", ") || "");
        setExecutionResult(null);
    }, [snippet]);

    const updateMutation = useMutation({
        mutationFn: () => snippetsAPI.update(snippet.id, {
            title,
            description,
            code,
            tags: tags.split(",").map((t: string) => t.trim()).filter(Boolean),
            outputSnapshot: executionResult ? JSON.stringify(executionResult) : undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
            toast({ title: "Updated!", description: "Snippet saved successfully" });
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => snippetsAPI.delete(snippet.id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['snippets'] });
            toast({ title: "Deleted", description: "Snippet removed successfully" });
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const handleRunCode = async () => {
        setExecuting(true);
        try {
            const res = await snippetsAPI.execute({ language, code });
            setExecutionResult(res.run);
            if (res.run.code !== 0) {
                toast({ title: "Execution Failed", description: "Check errors below", variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Code executed successfully" });
            }
        } catch (error) {
            toast({ title: "Error", description: "Execution failed", variant: "destructive" });
        } finally {
            setExecuting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Snippet</DialogTitle>
                    <DialogDescription>
                        Modify your code snippet. Run it to verify before saving.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Snippet title"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Language</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGES.map(l => (
                                        <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this code do?"
                            rows={2}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Tags (comma separated)</Label>
                        <Input
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            placeholder="react, hooks, typescript"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Your code here..."
                            className="font-mono text-sm min-h-[200px]"
                        />
                    </div>

                    {/* Execution Output */}
                    {executionResult && (
                        <div className="space-y-2">
                            <Label>Output</Label>
                            <div className={`p-4 rounded-md font-mono text-sm whitespace-pre-wrap ${executionResult.code !== 0
                                ? 'bg-red-950/50 text-red-300 border border-red-500/20'
                                : 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/20'
                                }`}>
                                {executionResult.stdout || executionResult.stderr || "No output"}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Snippet?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your snippet.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => deleteMutation.mutate()}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {deleteMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={handleRunCode}
                            disabled={executing || !code.trim()}
                        >
                            {executing ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Play className="h-4 w-4 mr-2" />
                            )}
                            Run
                        </Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending || !title.trim() || !code.trim()}
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
