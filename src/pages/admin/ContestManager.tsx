import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsAPI } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Clock, ChevronRight, Trophy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface ContestManagerProps {
    onSelectEvent: (eventId: string, title: string) => void;
}

export function ContestManager({ onSelectEvent }: ContestManagerProps) {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        slug: '',
        startTime: '',
        endTime: '',
        price: 0,
        banner: ''
    });

    const { data, isLoading } = useQuery({
        queryKey: ['adminEvents'],
        queryFn: () => eventsAPI.getAll({ type: 'ALL' }) // Assuming API supports 'ALL' or returns all by default
    });

    const createMutation = useMutation({
        mutationFn: (data: any) => eventsAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminEvents'] });
            setIsCreateOpen(false);
            toast({ title: "Event Created", className: "bg-green-600 text-white" });
            setFormData({ title: '', description: '', slug: '', startTime: '', endTime: '', price: 0, banner: '' });
        },
        onError: (err: any) => {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert to ISO strings if needed, or backend handles it.
        // Assuming backend expects standard ISO.
        const payload = {
            ...formData,
            price: Number(formData.price),
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
        };
        createMutation.mutate(payload);
    };

    const events = data?.events || [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Contests</h2>
                    <p className="text-muted-foreground">Manage competitive programming events.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="w-4 h-4 mr-2" /> Create Contest</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl bg-neutral-900 border-neutral-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Create New Contest</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Title</Label>
                                    <Input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="bg-neutral-800 border-neutral-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Slug (URL)</Label>
                                    <Input required value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} className="bg-neutral-800 border-neutral-700" placeholder="e.g. weekly-contest-1" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="bg-neutral-800 border-neutral-700" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Time</Label>
                                    <Input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="bg-neutral-800 border-neutral-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>End Time</Label>
                                    <Input type="datetime-local" required value={formData.endTime} onChange={e => setFormData({ ...formData, endTime: e.target.value })} className="bg-neutral-800 border-neutral-700" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Entry Fee (₹)</Label>
                                    <Input type="number" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} className="bg-neutral-800 border-neutral-700" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Banner URL</Label>
                                    <Input value={formData.banner} onChange={e => setFormData({ ...formData, banner: e.target.value })} className="bg-neutral-800 border-neutral-700" placeholder="https://..." />
                                </div>
                            </div>
                            <Button type="submit" disabled={createMutation.isPending} className="w-full">
                                {createMutation.isPending ? "Creating..." : "Create Contest"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {isLoading && <p>Loading contests...</p>}
                {events.map((event: any) => (
                    <Card key={event.id} className="bg-neutral-900 border-neutral-800 hover:border-primary/50 transition-colors cursor-pointer group" onClick={() => onSelectEvent(event.id, event.title)}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Trophy className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{event.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-neutral-400 mt-1">
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(event.startTime), "MMM d, yyyy")}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(event.startTime), "HH:mm")}</span>
                                        <Badge variant={event.status === 'LIVE' ? 'default' : 'secondary'} className="uppercase text-[10px]">{event.status}</Badge>
                                        {event.price > 0 && <Badge variant="outline" className="text-yellow-500 border-yellow-500/20">₹{event.price}</Badge>}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-primary" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
