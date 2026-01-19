import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { eventsAPI } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface ContestRulesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    eventId: string;
    metrics: {
        trustScore?: number;
    };
    onAccepted: () => void;
}

export function ContestRulesDialog({ open, onOpenChange, eventId, metrics, onAccepted }: ContestRulesDialogProps) {
    const { toast } = useToast();
    const [accepted, setAccepted] = useState(false);

    const acceptMutation = useMutation({
        mutationFn: () => {
            console.log("[ContestRulesDialog] Attempting to accept rules for event:", eventId);
            return eventsAPI.acceptRules(eventId);
        },
        onSuccess: (data) => {
            console.log("[ContestRulesDialog] Rules accepted successfully:", data);
            toast({ title: "Rules Accepted", description: "You have joined the contest." });
            onAccepted();
            onOpenChange(false);
        },
        onError: (err: any) => {
            console.error("[ContestRulesDialog] Failed to accept rules:", err);
            toast({ variant: "destructive", title: "Error", description: err.message || "Failed to accept rules" });
        }
    });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Shield className="h-5 w-5 text-violet-500" />
                        Fair Play & Honor Code
                    </DialogTitle>
                    <DialogDescription>
                        Before entering the arena, you must agree to the contest rules.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Trust Score Warning if Low */}
                    {metrics.trustScore !== undefined && metrics.trustScore < 80 && (
                        <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-3 rounded-r text-sm text-yellow-500 flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                            <div>
                                <span className="font-bold">Low Trust Score ({metrics.trustScore})</span>
                                <p className="text-muted-foreground text-xs mt-1">
                                    Your session will be heavily monitored. Further violations may result in a permanent ban.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                No AI Assistance
                            </h4>
                            <p>Using ChatGPT, Copilot, or other AI tools is strictly prohibited and detected.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Single Device
                            </h4>
                            <p>Do not switch tabs or use multiple devices. Focus loss is tracked.</p>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                                Independent Work
                            </h4>
                            <p>Plagiarism checks run on all submissions. Code must be your own.</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2 border-t pt-4">
                        <Checkbox
                            id="terms"
                            checked={accepted}
                            onCheckedChange={(c) => setAccepted(c === true)}
                        />
                        <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I understand and agree to the Honor Code.
                        </Label>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button
                        disabled={!accepted || acceptMutation.isPending}
                        onClick={() => acceptMutation.mutate()}
                        className="bg-green-600 hover:bg-green-500"
                    >
                        {acceptMutation.isPending ? "Joining..." : "Enter Contest"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
