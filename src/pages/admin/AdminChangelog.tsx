
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";

export default function AdminChangelog() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-changelogs'],
        queryFn: adminAPI.getChangelogs,
    });

    const createMutation = useMutation({
        mutationFn: adminAPI.createChangelog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-changelogs'] });
            toast({ title: "Success", description: "Draft created successfully" });
            setIsDialogOpen(false);
            setEditingEntry(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminAPI.updateChangelog(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-changelogs'] });
            toast({ title: "Success", description: "Changelog updated successfully" });
            setIsDialogOpen(false);
            setEditingEntry(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminAPI.deleteChangelog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-changelogs'] });
            toast({ title: "Deleted", description: "Changelog entry deleted" });
        },
    });

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            version: formData.get("version"),
            title: formData.get("title"),
            description: formData.get("description"),
            releaseType: formData.get("releaseType"),
            isPublished: editingEntry ? formData.get("isPublished") === "on" : false,
        };

        if (editingEntry) {
            updateMutation.mutate({ id: editingEntry.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Changelog Management</h1>
                <Button onClick={() => { setEditingEntry(null); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" /> New Release
                </Button>
            </div>

            <div className="grid gap-4">
                {data?.entries?.map((entry: any) => (
                    <Card key={entry.id} className={`transition-all ${!entry.isPublished ? 'border-dashed bg-muted/30' : ''}`}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg font-mono">{entry.version}</CardTitle>
                                        <Badge variant={entry.isPublished ? "default" : "secondary"}>
                                            {entry.isPublished ? "Published" : "Draft"}
                                        </Badge>
                                        <Badge variant="outline" className={
                                            entry.releaseType === 'BREAKING' ? 'text-red-500 border-red-500' :
                                                entry.releaseType === 'FEATURE' ? 'text-green-500 border-green-500' :
                                                    'text-blue-500 border-blue-500'
                                        }>
                                            {entry.releaseType}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">{entry.title}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => { setEditingEntry(entry); setIsDialogOpen(true); }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => {
                                        if (confirm("Are you sure?")) deleteMutation.mutate(entry.id);
                                    }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xs text-muted-foreground font-mono">
                                Created: {new Date(entry.createdAt).toLocaleDateString()}
                                {entry.releasedAt && ` • Released: ${new Date(entry.releasedAt).toLocaleDateString()}`}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[725px]">
                    <DialogHeader>
                        <DialogTitle>{editingEntry ? "Edit Release" : "New Release"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Version</label>
                                <Input name="version" defaultValue={editingEntry?.version} placeholder="v1.0.0" required />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Release Type</label>
                                <Select name="releaseType" defaultValue={editingEntry?.releaseType || "FEATURE"}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FEATURE">Feature</SelectItem>
                                        <SelectItem value="FIX">Fix</SelectItem>
                                        <SelectItem value="Improvement">Improvement</SelectItem>
                                        <SelectItem value="BREAKING">Breaking Change</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title (Summary)</label>
                            <Input name="title" defaultValue={editingEntry?.title} placeholder="What's new?" required />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description (Markdown)</label>
                            <Textarea name="description" defaultValue={editingEntry?.description} className="h-48 font-mono text-xs" placeholder="- Feature 1&#10;- Feature 2" required />
                            <p className="text-xs text-muted-foreground">Supports Markdown.</p>
                        </div>

                        {editingEntry && (
                            <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                                <input type="checkbox" name="isPublished" id="isPublished" defaultChecked={editingEntry?.isPublished} className="w-4 h-4" />
                                <label htmlFor="isPublished" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                                    {editingEntry?.isPublished ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    Publish immediately
                                </label>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                                {editingEntry ? "Save Changes" : "Create Draft"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
