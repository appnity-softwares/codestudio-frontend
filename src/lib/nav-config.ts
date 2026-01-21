import {
    Home,
    Sparkles,

    Settings,
    Bookmark,
    // Bug,
    Replace,
    User,
    ShoppingBag,
    ShieldCheck,
    LayoutDashboard,
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
        ],
    },
    {
        title: 'Shop',
        items: [
            { label: 'Marketplace', href: '/marketplace', icon: ShoppingBag, secondaryIcon: Share },
        ],
    },
    {
        title: 'Tools',
        items: [
            { label: 'Convert', href: '/convert', icon: Replace },
        ],
    },
    {
        title: 'Personal',
        items: [
            { label: 'Profile', href: '/profile/[[username]]', icon: User },
            { label: 'Chat', href: '/chat', icon: MessageSquare },
            { label: 'Saved', href: '/saved', icon: Bookmark },
            { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
            { label: 'Settings', href: '/settings', icon: Settings },
            { label: 'Admin', href: '/admin', icon: ShieldCheck },
        ],
    },
];
