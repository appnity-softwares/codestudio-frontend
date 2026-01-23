export interface User {
    id: string
    name: string
    email: string
    image?: string
    username?: string
    bio?: string
    isBlocked?: boolean
    role?: "USER" | "ADMIN"
    createdAt: Date
    xp?: number
    city?: string
    endorsements?: string[]
    purchasedComponentIds?: string[]
    githubUrl?: string
    linkedinUrl?: string
    instagramUrl?: string
    preferredLanguages?: string[]
    interests?: string[]
    visibility?: string
    onboardingCompleted?: boolean
    level?: number
    streak?: number
    inventory?: string[]
    equippedAura?: string | null
    unlockedThemes?: string[]
    influence?: number
}

export interface Snippet {
    id: string
    title: string
    description?: string
    code: string
    language: string
    authorId: string
    author: User
    tags: string[]
    upvotes: number
    isUpvoted?: boolean
    isBookmarked?: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Doc {
    id: string
    title: string
    slug: string
    content: string
    authorId: string
    author: User
    tags: string[]
    upvotes: number
    isUpvoted?: boolean
    createdAt: Date
    updatedAt: Date
}

export interface Component {
    id: string
    name: string
    description: string
    code: string
    previewUrl?: string
    category: string
    authorId: string
    author: User
    price: number
    downloads: number
    rating: number
    createdAt: Date
}

export interface Bug {
    id: string
    title: string
    description: string
    status: "OPEN" | "IN_PROGRESS" | "CLOSED"
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
    authorId: string
    author: User
    createdAt: Date
    updatedAt: Date
}

export interface Comment {
    id: string
    content: string
    authorId: string
    author: User
    createdAt: Date
}
