
import React from 'react';
import { Code, Users, Star, Trophy, Zap, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BadgeGridProps {
    badges: any[];
    profileUser?: {
        _count?: {
            snippets?: number;
            followers?: number;
        };
    };
}

// Badge definitions with unlock requirements
const BADGE_DEFINITIONS = [
    { id: 'FIRST_SNIPPET', name: 'First Blood', icon: Code, color: 'text-green-400', requirement: 1, type: 'snippets' },
    { id: 'SNIPPET_5', name: 'Coder', icon: Code, color: 'text-blue-400', requirement: 5, type: 'snippets' },
    { id: 'SNIPPET_10', name: 'Developer', icon: Code, color: 'text-purple-400', requirement: 10, type: 'snippets' },
    { id: 'SNIPPET_25', name: 'Engineer', icon: Zap, color: 'text-yellow-400', requirement: 25, type: 'snippets' },
    { id: 'FOLLOWER_5', name: 'Rising Star', icon: Users, color: 'text-pink-400', requirement: 5, type: 'followers' },
    { id: 'FOLLOWER_25', name: 'Influencer', icon: Star, color: 'text-orange-400', requirement: 25, type: 'followers' },
    { id: 'FOLLOWER_100', name: 'Legend', icon: Trophy, color: 'text-yellow-400', requirement: 100, type: 'followers' },
];

const BadgeGrid: React.FC<BadgeGridProps> = ({ badges, profileUser }) => {
    const earnedBadgeIds = new Set(badges?.map(b => b.badgeId) || []);
    const snippetCount = profileUser?._count?.snippets ?? 0;
    const followerCount = profileUser?._count?.followers ?? 0;

    const getProgress = (badge: typeof BADGE_DEFINITIONS[0]) => {
        const current = badge.type === 'snippets' ? snippetCount : followerCount;
        return Math.min(100, (current / badge.requirement) * 100);
    };

    const getCurrent = (badge: typeof BADGE_DEFINITIONS[0]) => {
        return badge.type === 'snippets' ? snippetCount : followerCount;
    };

    return (
        <div className="bg-surface rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold text-muted-foreground font-mono uppercase tracking-widest">Badges & Progress</h3>
                <span className="text-[10px] font-mono text-muted-foreground">{earnedBadgeIds.size}/{BADGE_DEFINITIONS.length} Unlocked</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {BADGE_DEFINITIONS.map((badge) => {
                    const isUnlocked = earnedBadgeIds.has(badge.id) || getCurrent(badge) >= badge.requirement;
                    const progress = getProgress(badge);
                    const Icon = badge.icon;

                    return (
                        <div
                            key={badge.id}
                            className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${isUnlocked
                                ? 'bg-primary/5 border-primary/20 hover:border-primary/50'
                                : 'bg-muted/30 border-border/50'
                                }`}
                        >
                            {/* Badge Icon */}
                            <div className={`mb-2 p-2 rounded-full ${isUnlocked ? 'bg-primary/10' : 'bg-muted/50'}`}>
                                {isUnlocked ? (
                                    <Icon className={`w-5 h-5 ${badge.color}`} />
                                ) : (
                                    <Lock className="w-5 h-5 text-muted-foreground/50" />
                                )}
                            </div>

                            {/* Badge Name */}
                            <span className={`text-[10px] font-mono text-center leading-tight uppercase tracking-wider mb-2 ${isUnlocked ? 'text-foreground' : 'text-muted-foreground/70'
                                }`}>
                                {badge.name}
                            </span>

                            {/* Progress Bar (only show for locked badges) */}
                            {!isUnlocked && (
                                <div className="w-full space-y-1">
                                    <Progress value={progress} className="h-1" />
                                    <p className="text-[9px] text-muted-foreground text-center font-mono">
                                        {getCurrent(badge)}/{badge.requirement}
                                    </p>
                                </div>
                            )}

                            {/* Checkmark for unlocked */}
                            {isUnlocked && (
                                <div className="absolute top-1 right-1">
                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                        <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BadgeGrid;
