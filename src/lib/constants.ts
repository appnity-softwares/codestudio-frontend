import { Rocket, Zap } from "lucide-react";

export const siteConfig = {
    name: "CodeStudio",
    url: "https://code.appnity.co.in",
    description: "A social platform for developers to share code snippets, write documentation, and collaborate on projects. Discover, create, and grow with a community of coders.",
    author: "Appnity Softwares",
    keywords: "CodeStudio, code snippets, web development, programming, react, typescript, tailwindcss, developer community, code sharing",
}

export const routes = {
    home: "/",
    feed: "/feed",
    forYou: "/foryou",
    explore: "/explore",
    community: "/community",
    settings: "/settings",
    snippets: {
        list: "/snippets",
        new: "/snippets/new",
        detail: (id: string) => `/snippets/${id}`,
    },
    admin: {
        dashboard: "/admin",
        users: "/admin/users",
    },
    auth: {
        signIn: "/auth/signin",
    },
    user: (username: string) => `/u/${username}`,
}

export const navConfig = [
    { title: "Feed", href: "/feed", icon: "Home" },
    { title: "Leaderboard", href: "/leaderboard", icon: "Trophy" },
    { title: "Arena", href: "/arena", icon: "Sparkles" },
    { title: "Practice", href: "/practice", icon: "Dumbbell" },
    { title: "Roadmaps", href: "/roadmaps", icon: "BookOpen" },
    { title: "Discover", href: "/community", icon: "Globe" },
    { title: "Trophy Room", href: "/trophy-room", icon: "Award" },
    { title: "XP Store", href: "/xp-store", icon: "ShoppingBag" },
    { title: "Feedback Wall", href: "/feedback", icon: "Megaphone" },
    { title: "Messages", href: "/messages", icon: "MessageSquare" },
]

export const STORE_ITEMS = [
    {
        id: 'aura_neon_cyberpunk',
        name: 'Neon Cyberpunk',
        description: 'A glowing cyan and magenta border for your avatar with high-frequency pulse.',
        type: 'AURA',
        cost: 500,
        effect: 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse',
        previewClass: 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] animate-pulse',
        longDesc: 'Engineered for the night owls. This aura utilizes high-intensity CSS filters to create a persistent neon glow.'
    },
    {
        id: 'aura_golden_master',
        name: 'Golden Master',
        description: 'Elite gold aura for top-tier developers. Reflects your status.',
        type: 'AURA',
        cost: 1200,
        effect: 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)] brightness-125',
        previewClass: 'ring-4 ring-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.7)] brightness-125',
        longDesc: 'The ultimate symbol of prestige. The Golden Master aura signifies benchmark excellence.'
    },
    {
        id: 'aura_void_walker',
        name: 'Void Walker',
        description: 'Deep purple shadows that pulse with dark energy.',
        type: 'AURA',
        cost: 2000,
        effect: 'ring-2 ring-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.6)] blur-[1px] hover:blur-none transition-all',
        previewClass: 'ring-2 ring-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.6)] blur-[1px] hover:blur-none transition-all',
        longDesc: 'For those who dance in the darkness. Features a custom spatial shadow effect.'
    },
    {
        id: 'theme_dracula',
        name: 'Dracula Theme',
        description: 'A dark theme for vampires and night owls.',
        type: 'THEME',
        cost: 300,
        color: '#282a36',
        longDesc: 'The legendary Dracula palette optimized for low-light environments.'
    },
    {
        id: 'theme_monokai_pro',
        name: 'Monokai Pro',
        description: 'Professional, high-contrast colorful theme.',
        type: 'THEME',
        cost: 300,
        color: '#2d2a2e',
        longDesc: 'The choice of pros. High-contrast colors designed for rapid categorization.'
    },
    {
        id: 'boost_xp_multiplier',
        name: 'XP Multifold (2x)',
        description: 'Double all XP gains from snippets & arena for 48 hours.',
        type: 'BOOST',
        cost: 800,
        icon: Rocket,
        longDesc: 'Trigger a rapid growth phase. This boost applies a global 2x multiplier.'
    },
    {
        id: 'boost_showcase_slot',
        name: 'Feed Showcase',
        description: 'Pin one of your snippets to the top of the feed for 24h.',
        type: 'BOOST',
        cost: 150,
        icon: Zap,
        longDesc: 'Maximum visibility. Pin your best logic to the top of the global smart feed.'
    }
];
