
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Shield, AlertTriangle, Eye, Gavel, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";

interface RulesAgreementProps {
    onAccept: () => void;
    isLoading: boolean;
}

export function RulesAgreement({ onAccept, isLoading }: RulesAgreementProps) {
    const [accepted, setAccepted] = useState(false);

    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm p-4 flex items-center justify-center">
            <Card className="w-full max-w-2xl shadow-2xl border-2 border-primary/20 animate-in zoom-in-95 duration-300">
                <CardHeader className="bg-muted/30 border-b pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Shield className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl">Official Contest Rules</CardTitle>
                            <CardDescription>You must accept these terms to enter the arena.</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Anti-Cheat Policy */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <Eye className="h-5 w-5 text-amber-500" />
                            Anti-Cheating Policy
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4 text-sm text-muted-foreground p-4 bg-muted/30 rounded-lg border">
                            <div className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span>Paste Detection (Excessive pasting flagged)</span>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span>Focus Tracking (Tab switching flagged)</span>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span>IP & User-Agent Correlation</span>
                            </div>
                            <div className="flex gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                                <span>Code Similarity Analysis</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground italic">
                            * We do NOT use webcams, screen recording, or AI proctoring. We respect your privacy while ensuring fairness.
                        </p>
                    </div>

                    {/* Prohibitions */}
                    <div className="space-y-3">
                        <h3 className="font-semibold flex items-center gap-2 text-lg">
                            <Gavel className="h-5 w-5 text-red-500" />
                            Prohibitions
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            <li>Collaboration with other participants is strictly forbidden.</li>
                            <li>Use of AI coding assistants (ChatGPT, Copilot) is not allowed.</li>
                            <li>Multiple accounts or sharing solutions will lead to DQ.</li>
                        </ul>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">Trust Score Impact</p>
                            <p className="text-xs text-yellow-600/80 dark:text-yellow-400/70">
                                Violations will result in a permanent reduction of your Trust Score.
                                A low Trust Score may disqualify you from future prize money events.
                            </p>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="bg-muted/30 border-t p-6 flex-col gap-4">
                    <div className="flex items-center space-x-2 w-full">
                        <Checkbox
                            id="terms"
                            checked={accepted}
                            onCheckedChange={(c: boolean) => setAccepted(c)}
                        />
                        <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I define my honor code: I will not cheat, nor will I help others to cheat.
                        </Label>
                    </div>

                    <Button
                        size="lg"
                        className="w-full font-bold"
                        disabled={!accepted || isLoading}
                        onClick={onAccept}
                    >
                        {isLoading ? "Verifying..." : "Enter Contest Arena"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
