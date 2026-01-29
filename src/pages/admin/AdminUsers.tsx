import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, AlertTriangle, Ban, Unlock, Edit2, Trash2 } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useSearchParams } from "react-router-dom";

export default function AdminUsers() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const urlSearch = searchParams.get("search") || "";

    const [page, setPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState(urlSearch);
    const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

    // State for Suspensions
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // Form State
    const [editForm, setEditForm] = useState({
        name: "",
        username: "",
        email: "",
        role: "USER",
        trustScore: 100,
        xp: 0,
        level: 1, // Added level
        endorsements: "",
        isBlocked: false,
    });

    const [suspendReason, setSuspendReason] = useState("");
    const [suspendType, setSuspendType] = useState<"TEMPORARY" | "PERMANENT">("TEMPORARY");
    const [suspendHours, setSuspendHours] = useState(24);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setPage(1); // Reset to page 1 on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Unified Fetch (List + Search)
    const { data: usersData, isLoading } = useQuery({
        queryKey: ["admin-users", page, debouncedSearch],
        queryFn: () => adminAPI.getUsers(page, 20, debouncedSearch),
        placeholderData: (previousData: any) => previousData, // Keep previous data while fetching
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

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: (data: { userId: string; updates: any }) =>
            adminAPI.updateUser(data.userId, data.updates),
        onSuccess: () => {
            toast({ title: "User Updated", description: "The user details have been updated." });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setEditDialogOpen(false);
        },
        onError: (error: any) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: (userId: string) => adminAPI.deleteUser(userId),
        onSuccess: () => {
            toast({ title: "User Deleted", description: "The user has been permanently deleted." });
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
            setDeleteDialogOpen(false);
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



    const displayUsers = usersData?.users || [];
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
        if (score >= 80) return <Badge className="bg-green-500 hover:bg-green-600">High ({score})</Badge>;
        if (score >= 50) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Medium ({score})</Badge>;
        return <Badge className="bg-red-500 hover:bg-red-600">Low ({score})</Badge>;
    };

    const handleEditOpen = (user: any) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || "",
            username: user.username || "",
            email: user.email || "",
            role: user.role || "USER",
            trustScore: user.trustScore || 100,
            xp: user.xp || 0,
            level: user.level || 1,
            endorsements: Array.isArray(user.endorsements) ? user.endorsements.join(", ") : "",
            isBlocked: user.isBlocked || false,
        });
        setEditDialogOpen(true);
    };

    const handleUpdate = () => {
        if (!selectedUser) return;

        // Transform endorsements back to array
        const updates = {
            ...editForm,
            endorsements: editForm.endorsements.split(",").map(s => s.trim()).filter(Boolean)
        };

        updateMutation.mutate({
            userId: selectedUser.id,
            updates: updates,
        });
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
                            <TableHead>Level / XP</TableHead>
                            <TableHead>Influence</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
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
                                        <Badge variant={user.role === "ADMIN" ? "default" : user.role === "MODERATOR" ? "outline" : "secondary"} className={user.role === "MODERATOR" ? "border-purple-500 text-purple-500" : ""}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-xs">Lvl {user.level || 1}</span>
                                            <span className="text-[10px] text-muted-foreground">{user.xp?.toLocaleString()} XP</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{getTrustBadge(user.influence || user.trustScore)}</TableCell>
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
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditOpen(user)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>

                                            {user.isBlocked ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => unsuspendMutation.mutate(user.id)}
                                                    disabled={unsuspendMutation.isPending}
                                                    title="Unsuspend"
                                                >
                                                    <Unlock className="h-4 w-4 text-green-600" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-yellow-600"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setSuspendDialogOpen(true);
                                                    }}
                                                    title="Suspend"
                                                >
                                                    <Ban className="h-4 w-4" />
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setDeleteDialogOpen(true);
                                                }}
                                                title="Delete"
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

            {/* Edit User Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit User Profile</DialogTitle>
                        <DialogDescription>
                            Modify account details for @{selectedUser?.username}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right text-xs">Name</Label>
                            <Input
                                id="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                className="col-span-3 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="username" className="text-right text-xs">Username</Label>
                            <Input
                                id="username"
                                value={editForm.username}
                                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                                className="col-span-3 h-8 font-mono"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right text-xs">Email</Label>
                            <Input
                                id="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                className="col-span-3 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right text-xs">Role</Label>
                            <Select
                                value={editForm.role}
                                onValueChange={(v) => setEditForm(prev => ({ ...prev, role: v }))}
                            >
                                <SelectTrigger className="col-span-3 h-8">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USER">User (Standard)</SelectItem>
                                    <SelectItem value="MODERATOR">Moderator (Staff)</SelectItem>
                                    <SelectItem value="ADMIN">Administrator (Full)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="trust" className="text-right text-xs">Trust (Influence)</Label>
                            <Input
                                id="trust"
                                type="number"
                                min="0"
                                max="100"
                                value={editForm.trustScore}
                                onChange={(e) => setEditForm(prev => ({ ...prev, trustScore: parseInt(e.target.value) || 0 }))}
                                className="col-span-3 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="level" className="text-right text-xs">Level</Label>
                            <Input
                                id="level"
                                type="number"
                                min="1"
                                value={editForm.level}
                                onChange={(e) => setEditForm(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                                className="col-span-3 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="xp" className="text-right text-xs">XP Points</Label>
                            <Input
                                id="xp"
                                type="number"
                                min="0"
                                value={editForm.xp}
                                onChange={(e) => setEditForm(prev => ({ ...prev, xp: parseInt(e.target.value) || 0 }))}
                                className="col-span-3 h-8"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="endorsements" className="text-right text-xs mt-2">Addons (Endorsements)</Label>
                            <div className="col-span-3">
                                <Textarea
                                    id="endorsements"
                                    value={editForm.endorsements}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, endorsements: e.target.value }))}
                                    placeholder="Comma separated tags (e.g. mentor, top-contributor)"
                                    className="min-h-[60px] text-xs"
                                />
                                <p className="text-[10px] text-muted-foreground mt-1">
                                    Separate items with commas. Used for profile badges/influence.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                        <Button size="sm" onClick={handleUpdate} disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Updating..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you absolutely sure you want to delete @{selectedUser?.username}? This action is irreversible and will remove all their data.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(selectedUser.id)}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

