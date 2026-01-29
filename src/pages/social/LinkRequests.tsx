"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check, X, Clock, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageLoader } from "@/components/ui/PageLoader";

export default function LinkRequests() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data, isLoading } = useQuery({
        queryKey: ['link-requests'],
        queryFn: () => usersAPI.getLinkRequests()
    });

    const requests = data?.requests || [];

    const acceptMutation = useMutation({
        mutationFn: (id: string) => usersAPI.acceptLinkRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['link-requests'] });
            toast({ title: "Accepted!", description: "You are now linked with this developer." });
        },
        onError: () => toast({ variant: "destructive", title: "Error", description: "Failed to accept request." })
    });

    const rejectMutation = useMutation({
        mutationFn: (id: string) => usersAPI.rejectLinkRequest(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['link-requests'] });
            toast({ title: "Rejected", description: "Request has been dismissed." });
        }
    });

    if (isLoading) return <PageLoader />;

    return (
        <div className="container max-w-2xl py-8">
            <Card className="bg-muted/30 border-white/5 backdrop-blur-xl">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 transition-transform duration-300 transform group-hover:scale-110 bg-primary/10 rounded-xl">
                            <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold tracking-tight">Link Requests</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-250px)]">
                        {requests.length > 0 ? (
                            <div className="divide-y divide-white/5">
                                {requests.map((req: any) => (
                                    <div key={req.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                                                <AvatarImage src={req.sender?.image || req.sender?.avatarUrl} />
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {req.sender?.username?.slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-foreground">{req.sender?.username}</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Clock className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {formatDistanceToNow(new Date(req.createdAt))} ago
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 rounded-full hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all"
                                                onClick={() => rejectMutation.mutate(req.id)}
                                                disabled={rejectMutation.isPending || acceptMutation.isPending}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="h-8 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-lg shadow-primary/20 transition-all"
                                                onClick={() => acceptMutation.mutate(req.id)}
                                                disabled={acceptMutation.isPending || rejectMutation.isPending}
                                            >
                                                <Check className="w-3.5 h-3.5 mr-1.5" />
                                                Accept
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                    <UserPlus className="w-8 h-8 text-primary/40" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground/80">No pending requests</h3>
                                <p className="text-sm text-muted-foreground mt-1 max-w-[250px]">
                                    When developers request to link with your private account, they'll appear here.
                                </p>
                            </div>
                        )}
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
