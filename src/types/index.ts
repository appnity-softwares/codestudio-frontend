// Privacy visibility options
export type VisibilityMode = "PUBLIC" | "PRIVATE" | "HYBRID"

// Granular privacy settings for hybrid mode
export interface PrivacySettings {
    // Profile field visibility
    showEmail: boolean
    showBio: boolean
    showCity: boolean
    showJoinDate: boolean
    showSocialLinks: boolean
    showBadges: boolean
    showStats: boolean
    showSnippets: boolean
    showGithubStats: boolean
    showLinkers: boolean
    showLinked: boolean
    showLanguages: boolean
    showInterests: boolean

    // Activity visibility
    showActivityStatus: boolean
    allowMessages: "everyone" | "linked" | "none"

    // Discovery settings
    searchVisible: boolean
    showInLeaderboards: boolean
}

// Default privacy settings for each mode
export const DEFAULT_PUBLIC_PRIVACY: PrivacySettings = {
    showEmail: false,
    showBio: true,
    showCity: true,
    showJoinDate: true,
    showSocialLinks: true,
    showBadges: true,
    showStats: true,
    showSnippets: true,
    showGithubStats: true,
    showLinkers: true,
    showLinked: true,
    showLanguages: true,
    showInterests: true,
    showActivityStatus: true,
    allowMessages: "everyone",
    searchVisible: true,
    showInLeaderboards: true
}

export const DEFAULT_PRIVATE_PRIVACY: PrivacySettings = {
    showEmail: false,
    showBio: false,
    showCity: false,
    showJoinDate: false,
    showSocialLinks: false,
    showBadges: false,
    showStats: false,
    showSnippets: false,
    showGithubStats: false,
    showLinkers: false,
    showLinked: false,
    showLanguages: false,
    showInterests: false,
    showActivityStatus: false,
    allowMessages: "none",
    searchVisible: false,
    showInLeaderboards: false
}

export const DEFAULT_HYBRID_PRIVACY: PrivacySettings = {
    showEmail: false,
    showBio: true,
    showCity: false,
    showJoinDate: true,
    showSocialLinks: true,
    showBadges: true,
    showStats: true,
    showSnippets: true,
    showGithubStats: false,
    showLinkers: true,
    showLinked: false,
    showLanguages: true,
    showInterests: false,
    showActivityStatus: false,
    allowMessages: "linked",
    searchVisible: true,
    showInLeaderboards: true
}

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
    visibility?: VisibilityMode
    privacySettings?: PrivacySettings
    onboardingCompleted?: boolean
    githubStatsVisible?: boolean
    level?: number
    streak?: number
    inventory?: string[]
    equippedAura?: string | null
    equippedTheme?: string | null
    unlockedThemes?: string[]
    influence?: number
    githubStats?: string
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
