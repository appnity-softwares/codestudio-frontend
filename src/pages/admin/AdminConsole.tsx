import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationsAPI } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Loader2, Check, X, ExternalLink, ImageIcon, DollarSign, Trophy } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContestManager } from './ContestManager';
import { ProblemEditor } from './ProblemEditor';

const AdminConsole = () => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Arena Management State
    const [view, setView] = useState<'CONTESTS' | 'PROBLEMS'>('CONTESTS');
    const [selectedContest, setSelectedContest] = useState<{ id: string; title: string } | null>(null);

    // Fetch pending registrations
    const { data, isLoading } = useQuery({
        queryKey: ['adminRegistrations', 'PENDING'],
        queryFn: () => registrationsAPI.getAllRegistrations(undefined, 'PENDING'),
        refetchInterval: 30000
    });

    const approveMutation = useMutation({
        mutationFn: (id: string) => registrationsAPI.updateStatus(id, 'APPROVED'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRegistrations'] });
            toast({ title: "Approved", className: "bg-green-600 text-white border-none" });
        }
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => registrationsAPI.updateStatus(id, 'REJECTED'),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['adminRegistrations'] });
            toast({ title: "Rejected", variant: "destructive" });
        }
    });

    const registrations = data?.registrations || [];

    const handleSelectEvent = (id: string, title: string) => {
        setSelectedContest({ id, title });
        setView('PROBLEMS');
    };

    return (
        <div className="max-w-6xl mx-auto p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-black italic tracking-tighter uppercase font-headline">Admin Console</h1>
                <p className="text-neutral-400">System Management Interface</p>
            </div>

            <Tabs defaultValue="financials" className="w-full">
                <TabsList className="bg-neutral-900 border border-neutral-800 p-1">
                    <TabsTrigger value="financials" className="data-[state=active]:bg-neutral-800"><DollarSign className="w-4 h-4 mr-2" /> Financials</TabsTrigger>
                    <TabsTrigger value="arena" className="data-[state=active]:bg-neutral-800"><Trophy className="w-4 h-4 mr-2" /> Arena Manager</TabsTrigger>
                </TabsList>

                <TabsContent value="financials" className="space-y-6 pt-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Payment Approvals</h2>
                        <div className="bg-neutral-800 px-4 py-2 rounded-lg border border-neutral-700">
                            <span className="text-neutral-400 text-xs uppercase tracking-widest font-bold mr-2">Pending</span>
                            <span className="text-white font-bold">{registrations.length}</span>
                        </div>
                    </div>

                    <div className="grid gap-6">
                        {isLoading && <div className="text-center py-10 text-neutral-500">Loading incoming transmissions...</div>}

                        {!isLoading && registrations.length === 0 && (
                            <div className="text-center py-20 bg-neutral-900/50 rounded-2xl border border-neutral-800 border-dashed">
                                <Check className="w-12 h-12 text-green-500 mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-bold text-neutral-300">All Clear</h3>
                                <p className="text-neutral-500">No pending payment verifications.</p>
                            </div>
                        )}

                        {registrations.map((reg: any) => (
                            <Card key={reg.id} className="bg-neutral-900 border-neutral-800 overflow-hidden">
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div
                                        className="w-full md:w-48 h-48 bg-black flex items-center justify-center cursor-pointer relative group"
                                        onClick={() => reg.paymentScreenshot && setSelectedImage(reg.paymentScreenshot)}
                                    >
                                        {reg.paymentScreenshot ? (
                                            <>
                                                <img src={reg.paymentScreenshot} alt="Proof" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 transition-opacity">
                                                    <ImageIcon className="w-8 h-8 text-white" />
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-xs text-neutral-600">No Image</span>
                                        )}
                                    </div>

                                    <div className="flex-1 p-6 space-y-2">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">{reg.user.name} <span className="text-neutral-500 text-sm font-normal">@{reg.user.username}</span></h3>
                                                <p className="text-sm text-neutral-400">{reg.user.email}</p>
                                            </div>
                                            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest border border-yellow-500/20">
                                                Pending
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-2">
                                            <div>
                                                <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Event</span>
                                                <p className="text-white font-medium">{reg.event.title}</p>
                                                <p className="text-xs text-neutral-400">Fee: ₹{reg.event.entryFee}</p>
                                            </div>
                                            <div>
                                                <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Transaction ID</span>
                                                <p className="text-white font-mono text-sm">{reg.transactionId || 'N/A'}</p>
                                                <p className="text-xs text-neutral-400">{format(new Date(reg.createdAt), 'dd MMM, HH:mm')}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 md:border-l border-neutral-800 flex flex-row md:flex-col gap-3 justify-center bg-neutral-900/50">
                                        <Button
                                            onClick={() => approveMutation.mutate(reg.id)}
                                            disabled={approveMutation.isPending}
                                            className="bg-green-600 hover:bg-green-700 text-white w-full md:w-32"
                                        >
                                            {approveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4 mr-2" /> Approve</>}
                                        </Button>
                                        <Button
                                            onClick={() => rejectMutation.mutate(reg.id)}
                                            disabled={rejectMutation.isPending}
                                            variant="outline"
                                            className="border-neutral-700 text-neutral-400 hover:bg-red-900/20 hover:text-red-500 hover:border-red-900 w-full md:w-32"
                                        >
                                            {rejectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><X className="w-4 h-4 mr-2" /> Reject</>}
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="arena" className="pt-6">
                    {view === 'CONTESTS' ? (
                        <ContestManager onSelectEvent={handleSelectEvent} />
                    ) : (
                        <ProblemEditor
                            eventId={selectedContest?.id!}
                            eventTitle={selectedContest?.title}
                            onBack={() => setView('CONTESTS')}
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Image Modal */}
            <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
                <DialogContent className="max-w-3xl bg-black border-neutral-800 p-0 overflow-hidden text-white">
                    {selectedImage && (
                        <div className="relative">
                            <img src={selectedImage} alt="Full Proof" className="w-full h-auto max-h-[80vh] object-contain" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <a
                                    href={selectedImage}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur transition-colors"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminConsole;
