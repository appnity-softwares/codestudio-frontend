import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Ban, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";

export default function AdminUsers() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [suspendReason, setSuspendReason] = useState("");
    const [suspendType, setSuspendType] = useState<"TEMPORARY" | "PERMANENT">("TEMPORARY");
    const [suspendHours, setSuspendHours] = useState(24);

    // Fetch users with pagination
    const { data: usersData, isLoading } = useQuery({
        queryKey: ["admin-users", page],
        queryFn: () => adminAPI.getUsers(page),
    });

    // Search users
    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ["admin-users-search", searchQuery],
        queryFn: () => adminAPI.searchUsers(searchQuery),
        enabled: searchQuery.length > 2,
    });

    // Suspend user mutation
    const suspendMutation = useMutation({
        mutationFn: (data: { userId: string; type: string; reason: string; expiresIn?: number }) =>
            adminAPI.suspendUser(data.userId, data.type, data.reason, data.expiresIn),
        onSuccess: () => {
            toast({ title: "User Suspended", description: "The user has been suspended." });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setSuspendDialogOpen(false);
            setSelectedUser(null);
            setSuspendReason("");
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Unsuspend user mutation
    const unsuspendMutation = useMutation({
        mutationFn: (userId: string) => adminAPI.unsuspendUser(userId),
        onSuccess: () => {
            toast({ title: "User Unsuspended", description: "The suspension has been lifted." });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const displayUsers = searchQuery.length > 2 ? searchResults?.users : usersData?.users;
    const pagination = usersData?.pagination;

    const handleSuspend = () => {
        if (!selectedUser || !suspendReason) return;
        suspendMutation.mutate({
            userId: selectedUser.id,
            type: suspendType,
            reason: suspendReason,
            expiresIn: suspendType === "TEMPORARY" ? suspendHours : undefined,
        });
    };

    const getTrustBadge = (score: number) => {
        if (score >= 80) return <Badge className="bg-green-500">High ({score})</Badge>;
        if (score >= 50) return <Badge className="bg-yellow-500">Medium ({score})</Badge>;
        return <Badge className="bg-red-500">Low ({score})</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">User Management</h1>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by email, username, or ID..."
                            className="pl-10 w-80"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-lg border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Trust Score</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading || isSearching ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : displayUsers?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No users found
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayUsers?.map((user: any) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                alt={user.username}
                                                className="h-8 w-8 rounded-full"
                                            />
                                            <div>
                                                <div>{user.name || user.username}</div>
                                                <div className="text-xs text-muted-foreground">@{user.username}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{getTrustBadge(user.trustScore)}</TableCell>
                                    <TableCell>
                                        {user.isBlocked ? (
                                            <Badge variant="destructive">Suspended</Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-green-600">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {user.isBlocked ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => unsuspendMutation.mutate(user.id)}
                                                    disabled={unsuspendMutation.isPending}
                                                >
                                                    <Unlock className="h-4 w-4 mr-1" />
                                                    Unsuspend
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setSuspendDialogOpen(true);
                                                    }}
                                                >
                                                    <Ban className="h-4 w-4 mr-1" />
                                                    Suspend
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination && !searchQuery && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} users)
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

            {/* Suspend Dialog */}
            <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                            Suspend User
                        </DialogTitle>
                        <DialogDescription>
                            Suspending @{selectedUser?.username} ({selectedUser?.email})
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Suspension Type</Label>
                            <div className="flex gap-2 mt-2">
                                <Button
                                    size="sm"
                                    variant={suspendType === "TEMPORARY" ? "default" : "outline"}
                                    onClick={() => setSuspendType("TEMPORARY")}
                                >
                                    Temporary
                                </Button>
                                <Button
                                    size="sm"
                                    variant={suspendType === "PERMANENT" ? "destructive" : "outline"}
                                    onClick={() => setSuspendType("PERMANENT")}
                                >
                                    Permanent
                                </Button>
                            </div>
                        </div>

                        {suspendType === "TEMPORARY" && (
                            <div>
                                <Label>Duration (hours)</Label>
                                <Input
                                    type="number"
                                    value={suspendHours}
                                    onChange={(e) => setSuspendHours(parseInt(e.target.value) || 24)}
                                    min={1}
                                    max={8760}
                                />
                            </div>
                        )}

                        <div>
                            <Label>Reason *</Label>
                            <Textarea
                                value={suspendReason}
                                onChange={(e) => setSuspendReason(e.target.value)}
                                placeholder="Provide a reason for this suspension..."
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleSuspend}
                            disabled={!suspendReason || suspendMutation.isPending}
                        >
                            {suspendMutation.isPending ? "Suspending..." : "Confirm Suspension"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
