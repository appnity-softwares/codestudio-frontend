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
]
