import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Code, Users } from "lucide-react";
import { Link } from "react-router-dom";

interface UserHoverCardProps {
    user: {
        id: string;
        username: string;
        name: string;
        image?: string;
        bio?: string;
        skillPoints?: Record<string, number>;
        _count?: {
            snippets?: number;
            followers?: number;
        };
    };
    children: React.ReactNode;
}

export function UserHoverCard({ user, children }: UserHoverCardProps) {
    const snippetCount = user._count?.snippets ?? 0;
    const followerCount = user._count?.followers ?? 0;

    // Get top 3 skills
    const topSkills = user.skillPoints
        ? Object.entries(user.skillPoints)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
        : [];

    return (
        <HoverCard>
            <HoverCardTrigger asChild>
                {children}
            </HoverCardTrigger>
            <HoverCardContent className="w-80 p-0 overflow-hidden" align="start">
                {/* Header with gradient */}
                <div className="h-16 bg-gradient-to-r from-primary/30 to-purple-500/30" />

                {/* Avatar overlapping header */}
                <div className="px-4 -mt-10">
                    <Link to={`/profile/${user.username}`}>
                        <Avatar className="h-16 w-16 border-4 border-background shadow-lg hover:scale-105 transition-transform">
                            <AvatarImage src={user.image} alt={user.name} />
                            <AvatarFallback className="text-lg font-bold">
                                {user.name?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </Link>
                </div>

                {/* User Info */}
                <div className="p-4 pt-2 space-y-3">
                    <div>
                        <Link to={`/profile/${user.username}`} className="font-bold text-lg hover:text-primary transition-colors">
                            {user.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>

                    {user.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>
                    )}

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-1.5">
                            <Code className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{snippetCount}</span>
                            <span className="text-muted-foreground">snippets</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-pink-400" />
                            <span className="font-semibold">{followerCount}</span>
                            <span className="text-muted-foreground">followers</span>
                        </div>
                    </div>

                    {/* Top Skills */}
                    {topSkills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                            {topSkills.map(([skill, points]) => (
                                <Badge key={skill} variant="secondary" className="text-[10px]">
                                    {skill} • {points}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}
