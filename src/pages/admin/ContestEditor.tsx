import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI, eventsAPI, contestsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Save, Plus, GripVertical } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function ContestEditor() {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["admin-contest", id],
        queryFn: () => eventsAPI.getById(id!),
        enabled: !!id
    });

    const { data: problemsData } = useQuery({
        queryKey: ["admin-contest-problems", id],
        queryFn: () => contestsAPI.getProblems(id!),
        enabled: !!id
    });

    const updateMutation = useMutation({
        mutationFn: (data: any) => adminAPI.updateContest(id!, data),
        onSuccess: () => {
            toast({ title: "Saved", description: "Contest updated successfully." });
            queryClient.invalidateQueries({ queryKey: ["admin-contest", id] });
        }
    });

    const createProblemMutation = useMutation({
        mutationFn: adminAPI.createProblem,
        onSuccess: () => {
            toast({ title: "Created", description: "Problem created." });
            queryClient.invalidateQueries({ queryKey: ["admin-contest-problems", id] });
        }
    });

    // Form Stats
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [type, setType] = useState("INTERNAL");
    const [isExternal, setIsExternal] = useState(false);
    const [platform, setPlatform] = useState("");
    const [externalJoinUrl, setExternalJoinUrl] = useState("");
    const [visibleAt, setVisibleAt] = useState("");

    useEffect(() => {
        if (data?.event) {
            setTitle(data.event.title);
            setDescription(data.event.description);
            setStartTime(data.event.startTime.slice(0, 16)); // Format for datetime-local
            setEndTime(data.event.endTime.slice(0, 16));
            setType(data.event.type || "INTERNAL");
            setIsExternal(data.event.isExternal || false);
            setPlatform(data.event.externalPlatform || "");
            setExternalJoinUrl(data.event.externalJoinUrl || "");
            setVisibleAt(data.event.externalJoinVisibleAt ? data.event.externalJoinVisibleAt.slice(0, 16) : "");
        }
    }, [data]);

    const handleSave = () => {
        updateMutation.mutate({
            title,
            description,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            type,
            isExternal,
            platform,
            joinUrl: externalJoinUrl,
            visibleAt: visibleAt ? new Date(visibleAt).toISOString() : null
        });
    };

    const handleAddProblem = () => {
        createProblemMutation.mutate({
            eventId: id,
            title: "New Problem",
            description: "Describe the problem...",
            difficulty: "Medium",
            points: 100,
            timeLimit: 1.0,
            memoryLimit: 256,
            penalty: 10,
            starterCode: JSON.stringify({ javascript: "// solution", python: "# solution" }),
            order: (problemsData?.problems?.length || 0) + 1
        });
    };

    if (isLoading) return <Loader2 className="animate-spin h-8 w-8 mx-auto mt-20" />;
    const contest = data?.event;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link to="/admin/contests">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{contest?.title || "Edit Contest"}</h1>
                    <Badge variant="outline">{contest?.status}</Badge>
                </div>
                <div className="ml-auto">
                    <Button onClick={handleSave} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="settings">
                <TabsList>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="problems">Problems</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                </TabsList>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader><CardTitle>General Info</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description (Markdown)</label>
                                <Textarea className="h-40 font-mono" value={description} onChange={(e) => setDescription(e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle>Schedule & Type</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Start Time</label>
                                    <Input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">End Time</label>
                                    <Input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Contest Type</label>
                                <Select value={isExternal ? "EXTERNAL" : "INTERNAL"} onValueChange={(val) => setIsExternal(val === "EXTERNAL")}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="INTERNAL">Internal (CodeStudio Hosted)</SelectItem>
                                        <SelectItem value="EXTERNAL">External (Hosted Elsewhere)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isExternal && (
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-blue-500">External Platform</label>
                                        <Select value={platform} onValueChange={setPlatform}>
                                            <SelectTrigger><SelectValue placeholder="Select Platform" /></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HACKERRANK">HackerRank</SelectItem>
                                                <SelectItem value="CODEFORCES">Codeforces</SelectItem>
                                                <SelectItem value="LEETCODE">LeetCode</SelectItem>
                                                <SelectItem value="CUSTOM">Custom Platform / Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-blue-500">Join URL (Direct contest link)</label>
                                        <Input
                                            value={externalJoinUrl}
                                            onChange={(e) => setExternalJoinUrl(e.target.value)}
                                            placeholder="https://hackerrank.com/contests/my-contest"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <label className="text-sm font-medium text-blue-500">Join Link Visible At</label>
                                        <div className="flex gap-2 items-center">
                                            <Input
                                                type="datetime-local"
                                                value={visibleAt}
                                                onChange={(e) => setVisibleAt(e.target.value)}
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const start = new Date(startTime);
                                                    start.setMinutes(start.getMinutes() - 15);
                                                    setVisibleAt(start.toISOString().slice(0, 16));
                                                }}
                                            >
                                                15m Before
                                            </Button>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">
                                            Defaults to 15 minutes before the start time if left blank.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="problems" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Contest Problems</h3>
                        <Button onClick={handleAddProblem} size="sm"><Plus className="mr-2 h-4 w-4" /> Add Problem</Button>
                    </div>

                    <div className="space-y-2">
                        {problemsData?.problems?.map((problem: any) => (
                            <Card key={problem.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                                    <div className="flex-1">
                                        <div className="font-medium">{problem.title}</div>
                                        <div className="text-xs text-muted-foreground">{problem.id} • {problem.difficulty} • {problem.points} pts</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/admin/problems/${problem.id}`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="participants">
                    <ParticipantMonitoring id={id!} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function ParticipantMonitoring({ id }: { id: string }) {
    const { data: monitoringData, isLoading } = useQuery({
        queryKey: ["admin-contest-monitoring", id],
        queryFn: () => adminAPI.getContestParticipants(id),
    });

    if (isLoading) return <Loader2 className="animate-spin h-6 w-6 mx-auto mt-10" />;

    const stats = monitoringData?.stats;
    const participants = monitoringData?.participants || [];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground uppercase">Registered</CardTitle>
                        <div className="text-2xl font-bold">{stats?.totalRegistered || 0}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground uppercase text-green-500">Joined External</CardTitle>
                        <div className="text-2xl font-bold text-green-600">{stats?.joinedExternal || 0}</div>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground uppercase text-red-500">No Shows</CardTitle>
                        <div className="text-2xl font-bold text-red-600">{stats?.noShows || 0}</div>
                    </CardHeader>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Participant List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b">
                                <tr className="text-left font-medium text-muted-foreground">
                                    <th className="py-2 px-4">User</th>
                                    <th className="py-2 px-4">Email</th>
                                    <th className="py-2 px-4 text-center">Status</th>
                                    <th className="py-2 px-4">Joined At</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-10 text-center text-muted-foreground italic">No participants registered yet</td>
                                    </tr>
                                ) : (
                                    participants.map((reg: any) => (
                                        <tr key={reg.id} className="border-b hover:bg-muted/50">
                                            <td className="py-2 px-4">{reg.user?.name || 'Unknown'}</td>
                                            <td className="py-2 px-4 text-muted-foreground">{reg.user?.email || 'N/A'}</td>
                                            <td className="py-2 px-4 text-center">
                                                <Badge variant={reg.status === 'JOINED' ? 'default' : 'outline'}>
                                                    {reg.status}
                                                </Badge>
                                            </td>
                                            <td className="py-2 px-4 font-mono text-xs">
                                                {reg.joinedExternalAt ? new Date(reg.joinedExternalAt).toLocaleString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
