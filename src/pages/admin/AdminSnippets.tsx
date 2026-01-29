import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Trash2, Pin, PinOff, Terminal, Search } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminTableSkeleton } from "@/components/admin/AdminTableSkeleton";
import { cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import debounce from "lodash.debounce";

export default function AdminSnippets() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Debounced search
    const debouncedSearch = useMemo(
        () => debounce((val: string) => {
            setSearchTerm(val);
            setPage(1);
        }, 500),
        []
    );

    const { data, isLoading } = useQuery({
        queryKey: ["admin-snippets", page, searchTerm],
        queryFn: () => adminAPI.getSnippets(page, 20, searchTerm),
    });

    const snippets = data?.snippets || [];
    const pagination = data?.pagination;

    // Actions
    const handleDelete = async () => {
        const idsToDelete = deleteId ? [deleteId] : selectedIds;
        if (idsToDelete.length === 0) return;

        setIsBulkDeleting(true);
        try {
            await Promise.all(idsToDelete.map(id => adminAPI.deleteSnippet(id)));
            toast({ title: `${idsToDelete.length} snippet(s) deleted` });
            queryClient.invalidateQueries({ queryKey: ["admin-snippets"] });
            setDeleteId(null);
            setSelectedIds([]);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsBulkDeleting(false);
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(snippets.map((s: any) => s.id));
        } else {
            setSelectedIds([]);
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const togglePin = async (snippet: any) => {
        try {
            await adminAPI.pinSnippet(snippet.id, !snippet.isFeatured);
            toast({ title: snippet.isFeatured ? "Unpinned from feed" : "Pinned to feed" });
            queryClient.invalidateQueries({ queryKey: ["admin-snippets"] });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="h-6 w-6 text-primary" />
                    <h1 className="text-2xl font-bold">Snippet Manager</h1>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or language..."
                            className="bg-muted/50 pl-10 border-none"
                            onChange={(e) => debouncedSearch(e.target.value)}
                        />
                    </div>
                </div>
                {selectedIds.length > 0 && (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4">
                        <span className="text-sm font-bold text-muted-foreground">{selectedIds.length} items</span>
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 px-4"
                            onClick={() => setDeleteId(selectedIds[0])} // Just to trigger dialog, handleDelete will use selectedIds
                        >
                            Bulk Delete
                        </Button>
                    </div>
                )}
            </div>

            {/* Snippets Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedIds.length === snippets.length && snippets.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Engagement (V/L/D)</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <AdminTableSkeleton columns={7} rows={8} />
                        ) : snippets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Eye className="h-8 w-8 opacity-20" />
                                        <p>No snippets found matching your search</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            snippets.map((snippet: any) => (
                                <TableRow key={snippet.id} className={cn("transition-colors", selectedIds.includes(snippet.id) && "bg-primary/5")}>
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedIds.includes(snippet.id)}
                                            onCheckedChange={() => toggleSelect(snippet.id)}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{snippet.title}</span>
                                            <span className="text-xs text-muted-foreground font-mono">{snippet.id.substring(0, 8)}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {snippet.Author ? (
                                            <Link to={`/admin/users/${snippet.Author.id}`} className="hover:underline text-primary">
                                                {snippet.Author.username}
                                            </Link>
                                        ) : (
                                            <span className="text-muted-foreground">Unknown</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="uppercase text-[10px]">{snippet.language}</Badge>
                                    </TableCell>
                                    <TableCell className="text-xs font-mono">
                                        {snippet.viewsCount || 0} / {snippet.likesCount || 0} / {snippet.dislikesCount || 0}
                                    </TableCell>
                                    <TableCell>
                                        {snippet.isFeatured ? (
                                            <Badge variant="default" className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Featured</Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                        {new Date(snippet.createdAt).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                title={snippet.isFeatured ? "Unpin" : "Pin"}
                                                onClick={() => togglePin(snippet)}
                                            >
                                                {snippet.isFeatured ? <PinOff className="h-4 w-4 text-amber-500" /> : <Pin className="h-4 w-4 text-muted-foreground" />}
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                title="View"
                                                asChild
                                            >
                                                <Link to={`/snippets/${snippet.id}`} target="_blank">
                                                    <Eye className="h-4 w-4 text-blue-400" />
                                                </Link>
                                            </Button>

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                title="Delete"
                                                onClick={() => setDeleteId(snippet.id)}
                                                className="hover:bg-red-500/10 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={page >= pagination.totalPages}
                            onClick={() => setPage(p => p + 1)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.length > 1 ? `${selectedIds.length} Snippets` : "Snippet"}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the selected content from the platform.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isBulkDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleDelete();
                            }}
                            className="bg-red-500 hover:bg-red-600 font-bold"
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting ? "Deleting..." : "Confirm Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
