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

interface BadgeType {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'SYSTEM' | 'SKILL' | 'TRUST';
    threshold: number;
}

interface UserBadge {
    userId: string;
    badgeId: string;
    progress: number;
    unlockedAt?: string;
    badge: BadgeType;
}

interface BadgeTabProps {
    username: string;
}

export function BadgeTab({ username }: BadgeTabProps) {
    const { data, isLoading } = useQuery({
        queryKey: ['badges', username],
        queryFn: () => usersAPI.getBadges(username),
    });

    const userBadges: UserBadge[] = data?.badges || [];

    // Mock Badges (for MVP visualization if DB is empty)
    // Ideally these come from DB, but if getBadges returns empty, we show structure with empty state or mocked locked badges.
    // For now, let's rely on what we fetch. If empty, show "No badges earned yet".

    // Categorize
    const earned = userBadges.filter(b => b.unlockedAt);
    const inProgress = userBadges.filter(b => !b.unlockedAt && b.progress > 0);
    // const locked = userBadges.filter(b => !b.unlockedAt && b.progress === 0);

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
                <p className="text-xs text-muted-foreground/60 max-w-sm mb-4">
                    <strong>What happens next?</strong> Complete challenges, publish snippets, and participate in contests to unlock badges. Each badge shows your progress toward earning it.
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs">
                    <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20">First Snippet</span>
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">Contest Participant</span>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Verified Developer</span>
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
                        <BadgeCard key={ub.badgeId} userBadge={ub} status="unlocked" />
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
                            <BadgeCard key={ub.badgeId} userBadge={ub} status="progress" />
                        ))}
                    </div>
                </section>
            )}

            {/* Locked (Optional to show all available?) - For MVP maybe hide or show a few */}

            {/* How to earn badges link */}
            <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="h-4 w-4" />
                    <span>Want to earn more badges?</span>
                    <Link to="/help/badges" className="text-primary hover:underline font-medium">
                        Learn how →
                    </Link>
                </div>
            </div>
        </div>
    );
}

function BadgeCard({ userBadge, status }: { userBadge: UserBadge; status: 'unlocked' | 'progress' | 'locked' }) {
    const isUnlocked = status === 'unlocked';

    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <Card className={`p-4 flex flex-col items-center justify-center gap-3 text-center transition-all bg-card/50 border-white/5 hover:bg-card hover:translate-y-[-2px] ${isUnlocked ? 'border-primary/20 bg-primary/5' : 'opacity-70'}`}>
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${isUnlocked ? 'bg-primary/10 text-primary' : 'bg-muted/10 text-muted-foreground'}`}>
                            {/* Dynamic Icon Mapping would go here. Fallback to Trophy */}
                            {status === 'locked' ? <Lock className="h-5 w-5" /> : <Trophy className="h-6 w-6" />}
                        </div>
                        <div className="w-full">
                            <div className="text-sm font-bold leading-tight">{userBadge.badge.name}</div>
                            {!isUnlocked && (
                                <div className="mt-2 space-y-1">
                                    <Progress value={(userBadge.progress / userBadge.badge.threshold) * 100} className="h-1.5" />
                                    <div className="text-[10px] text-muted-foreground">
                                        {userBadge.progress} / {userBadge.badge.threshold}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border p-3">
                    <div className="space-y-2">
                        <p className="font-bold text-sm">{userBadge.badge.name}</p>
                        <p className="text-xs text-muted-foreground/90">{userBadge.badge.description}</p>

                        {/* How to earn */}
                        <div className="pt-2 border-t border-white/10">
                            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">How to earn:</p>
                            <p className="text-xs text-foreground/80">
                                {userBadge.badge.category === 'SKILL' && `Complete ${userBadge.badge.threshold} related activities`}
                                {userBadge.badge.category === 'SYSTEM' && `Reach ${userBadge.badge.threshold} system milestones`}
                                {userBadge.badge.category === 'TRUST' && `Maintain ${userBadge.badge.threshold} trust score`}
                            </p>
                        </div>

                        <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[10px] uppercase font-mono text-muted-foreground">
                            <span className={isUnlocked ? 'text-emerald-400' : 'text-yellow-500'}>
                                {isUnlocked ? '✓ Unlocked' : `${Math.round((userBadge.progress / userBadge.badge.threshold) * 100)}% Complete`}
                            </span>
                            {isUnlocked && <span>{new Date(userBadge.unlockedAt!).toLocaleDateString()}</span>}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
