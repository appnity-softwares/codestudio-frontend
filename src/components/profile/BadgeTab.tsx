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
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-white/5 rounded-xl bg-surface/30">
                <Trophy className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-bold">No badges yet</h3>
                <p className="text-muted-foreground max-w-sm mt-2">
                    Complete challenges, publish snippets, and participate in contests to earn badges.
                </p>
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
                        <div>
                            <div className="text-sm font-bold leading-tight">{userBadge.badge.name}</div>
                            {!isUnlocked && <div className="text-[10px] text-muted-foreground mt-1">Progress: {userBadge.progress} / {userBadge.badge.threshold}</div>}
                        </div>
                    </Card>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-popover text-popover-foreground border-border">
                    <div className="space-y-1">
                        <p className="font-bold text-sm">{userBadge.badge.name}</p>
                        <p className="text-xs text-muted-foreground/90">{userBadge.badge.description}</p>
                        <div className="pt-2 border-t border-white/10 mt-2 flex justify-between items-center text-[10px] uppercase font-mono text-muted-foreground">
                            <span>{status}</span>
                            {isUnlocked && <span>{new Date(userBadge.unlockedAt!).toLocaleDateString()}</span>}
                        </div>
                    </div>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
