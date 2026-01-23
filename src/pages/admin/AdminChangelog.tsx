
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, GripVertical, Save, Calendar } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from "@/lib/utils";

// Sortable Item Component
function SortableItem({ entry, onEdit, onDelete }: { entry: any; onEdit: () => void; onDelete: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: entry.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className={cn(
                "transition-all relative",
                !entry.isPublished ? 'border-dashed bg-muted/30' : '',
                isDragging ? "z-50 opacity-50 shadow-2xl border-primary" : ""
            )}
        >
            <div className="flex">
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-center px-3 cursor-grab hover:bg-white/5 active:cursor-grabbing border-r border-white/5"
                >
                    <GripVertical className="h-4 w-4 text-white/20" />
                </div>
                <div className="flex-1">
                    <CardHeader className="pb-3 px-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg font-mono">{entry.version}</CardTitle>
                                    <Badge variant={entry.isPublished ? "default" : "secondary"}>
                                        {entry.isPublished ? "Published" : "Draft"}
                                    </Badge>
                                    <Badge variant="outline" className={
                                        entry.releaseType === 'BREAKING' || entry.releaseType === 'MAJOR' ? 'text-red-500 border-red-500 bg-red-500/5' :
                                            entry.releaseType === 'FEATURE' || entry.releaseType === 'LAUNCH' ? 'text-green-500 border-green-500 bg-green-500/5' :
                                                entry.releaseType === 'MINOR' ? 'text-blue-500 border-blue-500' :
                                                    'text-slate-400 border-slate-700'
                                    }>
                                        {entry.releaseType}
                                    </Badge>
                                </div>
                                <p className="text-sm text-foreground/80 font-bold mt-2">{entry.title}</p>
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={onEdit} className="hover:bg-primary/10 hover:text-primary">
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={onDelete}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-4">
                        <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                                <Plus className="h-3 w-3" />
                                {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                            {entry.releasedAt && (
                                <span className="flex items-center gap-1 text-primary">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(entry.releasedAt).toLocaleDateString()}
                                </span>
                            )}
                            <span className="ml-auto opacity-30">Order: {entry.order}</span>
                        </div>
                    </CardContent>
                </div>
            </div>
        </Card>
    );
}

export default function AdminChangelog() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<any>(null);
    const [localEntries, setLocalEntries] = useState<any[]>([]);

    const { data, isLoading } = useQuery({
        queryKey: ['admin-changelogs'],
        queryFn: adminAPI.getChangelogs,
    });

    useEffect(() => {
        if (data?.entries) {
            setLocalEntries(data.entries);
        }
    }, [data]);

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

    const reorderMutation = useMutation({
        mutationFn: adminAPI.reorderChangelogs,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-changelogs'] });
            toast({ title: "Sorted!", description: "Order saved successfully." });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: adminAPI.deleteChangelog,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-changelogs'] });
            toast({ title: "Deleted", description: "Changelog entry deleted" });
        },
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLocalEntries((items) => {
                const oldIndex = items.findIndex((i) => i.id === active.id);
                const newIndex = items.findIndex((i) => i.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);

                // Immediately calculate new orders
                const updatedOrders = newItems.map((item, index) => ({
                    id: item.id,
                    order: index
                }));

                reorderMutation.mutate(updatedOrders);
                return newItems;
            });
        }
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            version: formData.get("version") as string,
            title: formData.get("title") as string,
            description: formData.get("description") as string,
            releaseType: formData.get("releaseType") as string,
            releasedAt: formData.get("releasedAt") as string || undefined,
            isPublished: editingEntry ? formData.get("isPublished") === "on" : false,
            order: editingEntry?.order || localEntries.length
        };

        if (editingEntry) {
            updateMutation.mutate({ id: editingEntry.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6 max-w-5xl mx-auto py-8">
            <div className="flex justify-between items-center bg-surface/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                        <Save className="h-8 w-8 text-primary" />
                        Changelog Engine
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium mt-1">Manage system updates, launches and technical fixes.</p>
                </div>
                <Button onClick={() => { setEditingEntry(null); setIsDialogOpen(true); }} className="rounded-2xl h-12 px-6 font-black bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                    <Plus className="mr-2 h-5 w-5" /> NEW RELEASE
                </Button>
            </div>

            <div className="bg-surface/30 rounded-3xl border border-white/5 p-2">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={localEntries.map(e => e.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="grid gap-2">
                            {localEntries.map((entry) => (
                                <SortableItem
                                    key={entry.id}
                                    entry={entry}
                                    onEdit={() => { setEditingEntry(entry); setIsDialogOpen(true); }}
                                    onDelete={() => {
                                        if (confirm("Delete this release forever?")) deleteMutation.mutate(entry.id);
                                    }}
                                />
                            ))}
                            {localEntries.length === 0 && (
                                <div className="py-20 text-center text-muted-foreground">
                                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Plus className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="font-bold">No changelogs yet.</p>
                                    <p className="text-xs">Start by creating a new release draft.</p>
                                </div>
                            )}
                        </div>
                    </SortableContext>
                </DndContext>

                {reorderMutation.isPending && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-black animate-bounce z-[100]">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        SAVING ORDER...
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[800px] bg-[#0c0c0e] border-white/10 p-0 overflow-hidden rounded-[2rem]">
                    <div className="p-8 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                        <DialogTitle className="text-2xl font-black text-white">{editingEntry ? "Update Release" : "Publish New Update"}</DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">Configure versioning and release details.</p>
                    </div>

                    <form onSubmit={handleSave} className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Version identifier</label>
                                <Input name="version" defaultValue={editingEntry?.version} placeholder="e.g. v1.2.0-stable" required className="bg-white/5 border-white/10 h-12" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Release Category</label>
                                <Select name="releaseType" defaultValue={editingEntry?.releaseType || "FEATURE"}>
                                    <SelectTrigger className="bg-white/5 border-white/10 h-12">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LAUNCH">🚀 Product Launch</SelectItem>
                                        <SelectItem value="MAJOR">🔴 Major Update</SelectItem>
                                        <SelectItem value="MINOR">🔵 Minor Enhancement</SelectItem>
                                        <SelectItem value="PATCH">🟢 Patch / Bug Fix</SelectItem>
                                        <SelectItem value="BETA">🟡 Beta Feature</SelectItem>
                                        <SelectItem value="SECURITY">🛡️ Security Update</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Release Title</label>
                                <Input name="title" defaultValue={editingEntry?.title} placeholder="The 'Apollo' Update" required className="bg-white/5 border-white/10 h-12" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 text-primary">Scheduled / Actual Release Date</label>
                                <Input
                                    name="releasedAt"
                                    type="date"
                                    defaultValue={editingEntry?.releasedAt ? new Date(editingEntry.releasedAt).toISOString().split('T')[0] : ''}
                                    className="bg-primary/5 border-primary/20 h-12 text-primary font-bold"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Release Notes (Markdown)</label>
                            <Textarea
                                name="description"
                                defaultValue={editingEntry?.description}
                                className="h-48 font-mono text-sm bg-white/5 border-white/10 p-4 resize-none focus:ring-primary/20"
                                placeholder="### ✨ Key Highlights&#10;- Added new editor features&#10;- Performance boosts..."
                                required
                            />
                            <div className="flex justify-between items-center text-[10px] font-bold text-white/20 uppercase tracking-tighter">
                                <span>Markdown formatting supported</span>
                                <span>Preview rendering: Enabled</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-5 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <input type="checkbox" name="isPublished" id="isPublished" defaultChecked={editingEntry?.isPublished} className="w-5 h-5 accent-primary" />
                            <div className="flex-1">
                                <label htmlFor="isPublished" className="text-sm font-black text-white cursor-pointer block">
                                    Mark as Published
                                </label>
                                <p className="text-[11px] text-muted-foreground font-medium">Published entries appear in the public changelog immediately.</p>
                            </div>
                            {editingEntry?.isPublished ? <Eye className="w-5 h-5 text-emerald-500" /> : <EyeOff className="w-5 h-5 text-white/20" />}
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="h-12 px-6 font-bold text-white/40 hover:text-white hover:bg-white/5">Cancel</Button>
                            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="h-12 px-8 font-black bg-primary hover:bg-primary/90 text-primary-foreground min-w-[160px]">
                                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="animate-spin" /> : (editingEntry ? "APPLY CHANGES" : "SAVE RELEASE")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
