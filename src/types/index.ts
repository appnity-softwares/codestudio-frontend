/**
 * CodeStudio Frontend Type Definitions
 * Synchronized with Go Backend Models (v1.3 Platinum)
 */

// --- General Enums & Constants ---

export type Role = "USER" | "ADMIN" | "MODERATOR";

export type VisibilityMode = "PUBLIC" | "PRIVATE" | "HYBRID";

export type Visibility = "public" | "private"; // For snippets/resources

export type Difficulty = "EASY" | "MEDIUM" | "HARD";

export type SnippetType = "ALGORITHM" | "UTILITY" | "EXAMPLE" | "VISUAL";

export type SnippetStatus = "DRAFT" | "PUBLISHED";

export type EventStatus = "DRAFT" | "UPCOMING" | "LIVE" | "FROZEN" | "ENDED";

export type RegistrationStatus = "PENDING" | "PAID" | "JOINED" | "NO_SHOW" | "BANNED";

export type SubmissionStatus = "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR" | "PENDING" | "DISQUALIFIED";

export type FeedbackCategory = "BUG" | "UX" | "FEATURE" | "PERFORMANCE" | "OTHER";

export type FeedbackStatus = "OPEN" | "REVIEWING" | "PLANNED" | "SHIPPED" | "CLOSED";

// --- Privacy Objects ---

export interface PrivacySettings {
    showEmail: boolean;
    showBio: boolean;
    showCity: boolean;
    showJoinDate: boolean;
    showSocialLinks: boolean;
    showBadges: boolean;
    showStats: boolean;
    showSnippets: boolean;
    showGithubStats: boolean;
    showLinkers: boolean;
    showLinked: boolean;
    showLanguages: boolean;
    showInterests: boolean;
    showActivityStatus: boolean;
    allowMessages: "everyone" | "linked" | "none";
    searchVisible: boolean;
    showInLeaderboards: boolean;
}

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
};

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
};

export const DEFAULT_HYBRID_PRIVACY: PrivacySettings = {
    ...DEFAULT_PUBLIC_PRIVACY,
    showEmail: false,
    showCity: false,
    allowMessages: "linked",
};

// --- Core Models ---

export interface User {
    id: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    name: string;
    email: string;
    image?: string;
    username: string;
    bio?: string;
    githubUrl?: string;
    instagramUrl?: string;
    linkedinUrl?: string;
    isBlocked: boolean;
    role: Role;
    visibility: VisibilityMode;
    onboardingCompleted: boolean;
    preferredLanguages: string[];
    interests: string[];
    isModerator: boolean;
    trustScore: number;
    xp: number;
    level: number;
    equippedAura?: string | null;
    equippedTheme?: string | null;
    linkersCount: number; // Followers
    linkedCount: number;  // Following
    githubStats?: any;
    city?: string;
    endorsements: string[];
    isFollowing?: boolean; // Auth Context
    pinnedSnippetId?: string;
    pinnedSnippet?: Snippet;
    searchVisible: boolean;
    githubStatsVisible: boolean;
    purchasedComponentIds: string[]; // Inventory
    inventory?: string[]; // Legacy alias
    influence?: number; // UI alias for XP or Trust
    _count?: {
        snippets: number;
    };
}

export interface Snippet {
    id: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    title: string;
    description: string;
    language: string;
    code: string;
    usage?: string;
    tags: string[];
    visibility: Visibility;
    outputSnapshot?: string;
    previewType: "TERMINAL" | "WEB_PREVIEW";
    referenceUrl?: string;
    executionLanguage: string;
    runtime: number;
    type: SnippetType;
    difficulty: Difficulty;
    viewsCount: number;
    copyCount: number;
    likesCount: number;
    dislikesCount: number;
    isFeatured: boolean;
    viewerReaction: "like" | "dislike" | ""; // Auth Context
    status: SnippetStatus;
    verified: boolean;
    lastExecutionStatus?: "SUCCESS" | "FAILURE";
    lastExecutionOutput?: string;
    authorId: string;
    author: User;
}

// --- Social & Engagement ---

export interface Comment {
    id: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    content: string;
    userId: string;
    user: User;
    snippetId: string;
}

export interface UserLink {
    id: string;
    createdAt: string | Date;
    linkerId: string;
    linker: User;
    linkedId: string;
    linked: User;
}

export interface LinkRequest {
    id: string;
    senderId: string;
    sender: User;
    receiverId: string;
    receiver: User;
    status: RegistrationStatus;
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface FeedbackMessage {
    id: string;
    userId: string;
    user: User;
    content: string;
    category: FeedbackCategory;
    upvotes: number;
    downvotes: number;
    status: FeedbackStatus;
    createdAt: string | Date;
    hasReacted?: boolean;
    hasDisagreed?: boolean;
}

// --- Arena (Events & Submissions) ---

export interface Event {
    id: string;
    title: string;
    description: string;
    slug: string;
    banner?: string;
    type: "INTERNAL" | "EXTERNAL";
    externalUrl?: string;
    startTime: string | Date;
    endTime: string | Date;
    freezeTime?: string | Date;
    status: EventStatus;
    price: number;
    isExternal: boolean;
    externalPlatform?: string;
    problems?: Problem[];
    createdAt: string | Date;
    updatedAt: string | Date;
}

export interface Problem {
    id: string;
    eventId: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    points: number;
    timeLimit: number;
    memoryLimit: number;
    penalty: number;
    starterCode?: string;
    order: number;
    testCases?: TestCase[];
}

export interface TestCase {
    id: string;
    problemId: string;
    input: string;
    output: string;
    isHidden: boolean;
}

export interface Submission {
    id: string;
    userId: string;
    eventId: string;
    problemId: string;
    code: string;
    language: string;
    status: SubmissionStatus;
    verdict: string;
    runtime: number;
    memory: number;
    testCasesPassed: number;
    totalTestCases: number;
    outputSnapshot?: string;
    createdAt: string | Date;
    flags?: any[];
    metrics?: any;
}

export interface Registration {
    id: string;
    userId: string;
    eventId: string;
    status: RegistrationStatus;
    score: number;
    rank: number;
    rulesAccepted: boolean;
    createdAt: string | Date;
}

// --- Practice Arena ---

export interface PracticeProblem {
    id: string;
    title: string;
    description: string;
    difficulty: Difficulty;
    category: string;
    solveCount: number;
    attemptCount: number;
    language: string;
    createdAt: string | Date;
}

export interface PracticeSubmission {
    id: string;
    userId: string;
    problemId: string;
    status: string;
    verdict: string;
    executionTime: number;
    memoryUsed: number;
    createdAt: string | Date;
}

// --- Chat ---

export interface Message {
    id: string;
    senderId: string;
    recipientId: string;
    content: string;
    type: "text" | "code" | "image" | "system";
    status: "sending" | "sent" | "delivered" | "read" | "failed";
    createdAt: string | Date;
    isRead: boolean;
    sender?: User;
    recipient?: User;
    metadata?: string;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage?: Message;
    updatedAt: string | Date;
}

// --- Legacy / Misc (Keeping to avoid breaking frontend) ---

export interface Component {
    id: string;
    name: string;
    description: string;
    code: string;
    previewUrl?: string;
    category: string;
    authorId: string;
    author: User;
    price: number;
    downloads: number;
    rating: number;
    createdAt: string | Date;
}

export interface Doc {
    id: string;
    title: string;
    slug: string;
    content: string;
    authorId: string;
    author: User;
    tags: string[];
    createdAt: string | Date;
}

export interface Bug {
    id: string;
    title: string;
    description: string;
    status: "OPEN" | "IN_PROGRESS" | "CLOSED";
    priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
    authorId: string;
    author: User;
    createdAt: string | Date;
}
