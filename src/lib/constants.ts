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
    marketplace: "/marketplace",
    playground: "/playground",
    convert: "/convert",
    agentCreator: "/agent-studio",
    saved: "/saved",
    settings: "/settings",
    snippets: {
        list: "/snippets",
        new: "/snippets/new",
        detail: (id: string) => `/snippets/${id}`,
    },
    docs: {
        list: "/docs",
        new: "/docs/new",
        detail: (slug: string) => `/docs/${slug}`,
    },
    bugs: {
        list: "/bugs",
        detail: (id: string) => `/bugs/${id}`,
    },
    admin: {
        dashboard: "/admin",
        users: "/admin/users",
        components: "/admin/components",
    },
    auth: {
        signIn: "/auth/signin",
    },
    user: (userId: string) => `/user/${userId}`,
    blocked: "/blocked",
    dashboard: {
        components: "/dashboard/components",
    },
}

export const navConfig = [
    {
        title: "Feed",
        href: routes.feed,
        icon: "Home",
    },
    {
        title: "For You",
        href: routes.forYou,
        icon: "Sparkles",
    },
    {
        title: "Explore",
        href: routes.explore,
        icon: "Compass",
    },
    {
        title: "Community",
        href: routes.community,
        icon: "Users",
    },
    {
        title: "Marketplace",
        href: routes.marketplace,
        icon: "Store",
    },
    {
        title: "Playground",
        href: routes.playground,
        icon: "Code",
    },
    {
        title: "Agent Studio",
        href: routes.agentCreator,
        icon: "Bot",
    },
    {
        title: "Saved",
        href: routes.saved,
        icon: "Bookmark",
    },
]
