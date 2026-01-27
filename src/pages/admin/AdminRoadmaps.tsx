
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Trash2, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function AdminRoadmaps() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");

    // Verify Dialog State
    const [selectedRoadmap, setSelectedRoadmap] = useState<any>(null);
    const [isVerifyOpen, setIsVerifyOpen] = useState(false);
    const [verifyData, setVerifyData] = useState({
        isVerified: false,
        awardsEndorsement: "",
        completionBonusXP: 250
    });

    const { data, isLoading } = useQuery({
        queryKey: ['admin-roadmaps', page, search, filter],
        queryFn: () => adminAPI.getRoadmaps(page, 20, search, filter),
    });

    const verifyMutation = useMutation({
        mutationFn: (data: any) => adminAPI.verifyRoadmap(selectedRoadmap.id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roadmaps'] });
            setIsVerifyOpen(false);
            toast({ title: "Roadmap Updated", description: "Verification status and bonuses saved." });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => adminAPI.deleteRoadmap(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-roadmaps'] });
            toast({ title: "Roadmap Deleted" });
        },
        onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
    });

    const handleVerifyClick = (roadmap: any) => {
        setSelectedRoadmap(roadmap);
        setVerifyData({
            isVerified: roadmap.isVerified,
            awardsEndorsement: roadmap.awardsEndorsement || "Certified Developer",
            completionBonusXP: roadmap.completionBonusXP || 250
        });
        setIsVerifyOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-black font-headline tracking-tighter">Roadmap Manager</h2>
                    <p className="text-muted-foreground">Verify community tracks and assign XP rewards.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search roadmaps..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px] bg-card">
                        <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roadmaps</SelectItem>
                        <SelectItem value="verified">Verified Only</SelectItem>
                        <SelectItem value="unverified">Unverified Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-4">
                    {data?.roadmaps.map((map: any) => (
                        <div key={map.id} className="bg-card border border-border rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start gap-4 group hover:border-primary/30 transition-all">
                            <div className="space-y-2 w-full md:w-auto">
                                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                                    <h3 className="text-xl font-bold font-headline">{map.title}</h3>
                                    {map.isVerified && (
                                        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1">
                                            <ShieldCheck className="h-3 w-3" /> Certified
                                        </Badge>
                                    )}
                                    <Badge variant="outline">{map.difficulty}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground max-w-2xl">{map.description}</p>
                                <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-medium text-muted-foreground pt-2">
                                    <span className="flex items-center gap-2">
                                        Author: <span className="text-foreground">{map.author?.username}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        XP Bonus: <span className="text-amber-500">+{map.completionBonusXP}</span>
                                    </span>
                                    {map.awardsEndorsement && (
                                        <span className="flex items-center gap-2">
                                            Awards: <Badge variant="secondary" className="text-[10px]">{map.awardsEndorsement}</Badge>
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                                <Button variant="outline" size="sm" onClick={() => handleVerifyClick(map)} className="flex-1 md:flex-none">
                                    <ShieldCheck className="mr-2 h-4 w-4" />
                                    Review
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                    onClick={() => {
                                        if (confirm("Are you sure you want to delete this roadmap?")) {
                                            deleteMutation.mutate(map.id);
                                        }
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                    {data?.roadmaps.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">No roadmaps found based on your filters.</div>
                    )}
                </div>
            )}

            {/* Pagination */}
            {data?.pagination && (
                <div className="flex justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <div className="flex items-center px-4 text-sm font-medium">
                        Page {data.pagination.page} of {data.pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        disabled={page >= data.pagination.totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Verify Dialog */}
            <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Verify & Configure Roadmap</DialogTitle>
                        <DialogDescription>
                            Set verification status and rewards for users who complete this track.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="verified" className="flex flex-col space-y-1">
                                <span>Verified Status</span>
                                <span className="font-normal text-xs text-muted-foreground">Verified roadmaps appear with a badge and are trustworthy.</span>
                            </Label>
                            <Switch
                                id="verified"
                                checked={verifyData.isVerified}
                                onCheckedChange={(c) => setVerifyData({ ...verifyData, isVerified: c })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Completion Bonus (XP)</Label>
                            <Input
                                type="number"
                                value={verifyData.completionBonusXP}
                                onChange={(e) => setVerifyData({ ...verifyData, completionBonusXP: parseInt(e.target.value) || 0 })}
                            />
                            <p className="text-[10px] text-muted-foreground">Standard bonus is 250 XP.</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Endorsement Badge Name</Label>
                            <Input
                                placeholder="e.g. Certified Go Developer"
                                value={verifyData.awardsEndorsement}
                                onChange={(e) => setVerifyData({ ...verifyData, awardsEndorsement: e.target.value })}
                            />
                            <p className="text-[10px] text-muted-foreground">Also awards a badge to the user's profile upon completion.</p>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsVerifyOpen(false)}>Cancel</Button>
                        <Button onClick={() => verifyMutation.mutate(verifyData)} disabled={verifyMutation.isPending}>
                            {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Configuration
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
