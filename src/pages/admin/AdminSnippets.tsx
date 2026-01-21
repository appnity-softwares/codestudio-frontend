import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Eye, Trash2, Pin, PinOff, Terminal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
        if (!deleteId) return;
        try {
            await adminAPI.deleteSnippet(deleteId);
            toast({ title: "Snippet deleted" });
            queryClient.invalidateQueries({ queryKey: ["admin-snippets"] });
            setDeleteId(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
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
            <div className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                <Input
                    placeholder="Search by title or language..."
                    className="max-w-md bg-black/20"
                    onChange={(e) => debouncedSearch(e.target.value)}
                />
            </div>

            {/* Snippets Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Author</TableHead>
                            <TableHead>Language</TableHead>
                            <TableHead>Views / Likes</TableHead>
                            <TableHead>Featured</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : snippets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No snippets found
                                </TableCell>
                            </TableRow>
                        ) : (
                            snippets.map((snippet: any) => (
                                <TableRow key={snippet.id}>
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
                                        {snippet.viewCount} / {snippet.likeCount}
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
                        <AlertDialogTitle>Delete Snippet?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the snippet from the database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
