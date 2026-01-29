import {
    Home,
    Sparkles,
    Settings,
    User,
    ShoppingBag,
    ShieldCheck,
    Share,
    MessageSquare,
} from 'lucide-react';

export const navSections = [
    {
        title: 'Discover',
        items: [
            { label: 'Feed', href: '/feed', icon: Home },
            { label: 'Community', href: '/community', icon: User },
            { label: 'Challenges', href: '/practice', icon: Sparkles },
            { label: 'Feedback', href: '/feedback', icon: MessageSquare },
        ],
    },
    {
        title: 'Shop',
        items: [
            { label: 'XP Store', href: '/xp-store', icon: ShoppingBag, secondaryIcon: Share },
        ],
    },
    {
        title: 'Personal',
        items: [
            { label: 'Profile', href: '/u/[[username]]', icon: User },
            { label: 'Settings', href: '/settings', icon: Settings },
            { label: 'Admin', href: '/admin', icon: ShieldCheck },
        ],
    },
];
