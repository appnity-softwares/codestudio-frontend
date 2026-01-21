
import { Trophy, Zap, Lock } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { usersAPI } from "@/lib/api";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

interface BadgeResponse {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'SYSTEM' | 'SKILL' | 'TRUST';
    threshold: number;
    unlocked: boolean;
    progress: number;
    unlockedAt?: string;
}

interface BadgeTabProps {
    username: string;
}

export function BadgeTab({ username }: BadgeTabProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['badges', username],
        queryFn: () => usersAPI.getBadges(username),
    });

    const userBadges: BadgeResponse[] = data?.badges || [];

    // Categorize
    const earned = userBadges.filter(b => b.unlocked);
    const inProgress = userBadges.filter(b => !b.unlocked && b.progress > 0);

    if (isLoading) return <div className="text-center py-10">Loading badges...</div>;

    if (userBadges.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-xl bg-surface/30 px-6">
                <div className="h-14 w-14 rounded-2xl bg-yellow-500/10 flex items-center justify-center mb-4">
                    <Trophy className="h-7 w-7 text-yellow-500/50" />
                </div>
                <h3 className="text-lg font-bold mb-2">No Badges Earned Yet</h3>
                <p className="text-sm text-muted-foreground max-w-md mb-3">
                    Badges recognize your achievements and contributions to the community.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                    <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">First Snippet</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Earned Badges */}
            <section>
                <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-bold text-lg">Earned Badges</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {earned.map((ub) => (
                        <BadgeCard key={ub.id} userBadge={ub} status="unlocked" />
                    ))}
                    {earned.length === 0 && <p className="text-muted-foreground text-sm col-span-full">No earned badges yet.</p>}
                </div>
            </section>

            {/* In Progress */}
            {inProgress.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Zap className="h-5 w-5 text-blue-500" />
                        <h3 className="font-bold text-lg">In Progress</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {inProgress.map((ub) => (
                            <BadgeCard key={ub.id} userBadge={ub} status="progress" />
                        ))}
                    </div>
                </section>
            )}

            {/* How to earn badges link */}
            <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>Want to earn more badges?</span>
                    <Link to="/badges" className="text-primary hover:underline font-medium">
                        View all badges →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function BadgeCard({ userBadge, status }: { userBadge: BadgeResponse; status: 'unlocked' | 'progress' | 'locked' }) {
    const isUnlocked = status === 'unlocked';

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Card className={`p-4 flex flex-col items-center justify-center gap-3 text-center transition-all bg-card/50 border-white/5 hover:bg-card hover:translate-y-[-2px] ${isUnlocked ? 'border-primary/20 bg-primary/5' : 'opacity-70'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted-foreground'}`}>
                            {status === 'locked' ? <Lock className="h-5 w-5" /> : <Trophy className="h-6 w-6" />}
                        </div>
                        <div className="w-full">
                            <div className="text-sm font-bold leading-tight">{userBadge.name}</div>
                            {!isUnlocked && (
                                <div className="mt-2 space-y-1">
                                    <Progress value={(userBadge.progress / userBadge.threshold) * 100} className="h-1.5" />
                                    <div className="text-[10px] text-muted-foreground">
                                        {userBadge.progress} / {userBadge.threshold}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border p-3">
                    <div className="space-y-2">
                        <p className="font-bold text-sm">{userBadge.name}</p>
                        <p className="text-xs text-muted-foreground/90">{userBadge.description}</p>

                        <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] uppercase font-mono text-muted-foreground">
                            <span className={isUnlocked ? 'text-emerald-400' : 'text-yellow-500'}>
                                {isUnlocked ? '✓ Unlocked' : `${Math.round((userBadge.progress / userBadge.threshold) * 100)}% Complete`}
                            </span>
                            {isUnlocked && userBadge.unlockedAt && <span>{new Date(userBadge.unlockedAt).toLocaleDateString()}</span>}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
