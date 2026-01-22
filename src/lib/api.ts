export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to get auth token from localStorage
const getToken = (): string | null => {
    return localStorage.getItem('authToken');
};

// Helper to set auth token
export const setToken = (token: string) => {
    localStorage.setItem('authToken', token);
};

// Helper to remove auth token
export const removeToken = () => {
    localStorage.removeItem('authToken');
};

// Custom Error for Auth failures
export class AuthError extends Error {
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.name = 'AuthError';
        this.status = status;
    }
}

export class MaintenanceError extends Error {
    status: number;
    eta?: string;
    constructor(status: number, message: string, eta?: string) {
        super(message);
        this.name = 'MaintenanceError';
        this.status = status;
        this.eta = eta;
    }
}

// Generic API request helper
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Check for maintenance mode (503 Service Unavailable)
            if (response.status === 503) {
                const errorData = await response.json().catch(() => ({}));
                window.dispatchEvent(new CustomEvent('api:maintenance', { detail: errorData }));
                throw new MaintenanceError(503, errorData.message || 'Maintenance in progress', errorData.eta);
            }

            // Handle 401 Unauthorized globally
            if (response.status === 401) {
                removeToken();
                // Dispatch logout event only if not already logging out (debounce)
                if (!window.localStorage.getItem('isLoggingOut')) {
                    window.localStorage.setItem('isLoggingOut', 'true'); // Reset on login or page load
                    window.dispatchEvent(new Event('auth:logout'));
                    setTimeout(() => window.localStorage.removeItem('isLoggingOut'), 1000); // Clear after 1s
                }
                throw new AuthError(401, 'Session expired or invalid token');
            }

            if (response.status === 403) {
                const errorData = await response.json().catch(() => ({ error: 'Access denied' }));
                console.error("[API] 403 Forbidden:", errorData);
                throw new AuthError(403, errorData.error || 'Access denied');
            }

            const error = await response.json().catch(() => ({ error: 'Network error or server down' }));
            throw new Error(error.error || `API Request failed: ${response.status}`);
        }

        return response.json();
    } catch (error: any) {
        // Handle network connection failures (Offline, Server Down, CORS)
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.warn(`[API] Network error for ${endpoint}: Server unbreakable or offline.`);
            throw new Error('NETWORK_ERROR');
        }
        console.warn(`[API] Request failed for ${endpoint}:`, error);
        throw error;
    }
}

// Auth API
export const authAPI = {
    signup: (data: { email: string; password: string; name: string; username: string }) =>
        apiRequest<{ user: any; token: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    signin: (data: { email: string; password: string }) =>
        apiRequest<{ user: any; token: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    me: () => apiRequest<{ user: any; isFollowing: boolean }>('/users/profile'),

    forgotPassword: (email: string) =>
        apiRequest<{ message: string; dev_token?: string }>('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email }),
        }),

    resetPassword: (data: { token: string; password: string }) =>
        apiRequest<{ message: string }>('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    checkUsername: (username: string) =>
        apiRequest<{ available: boolean; suggestions?: string[]; error?: string }>(`/auth/check-username?username=${encodeURIComponent(username)}`),
};

// Changelog API (public)
export const changelogAPI = {
    getAll: () => apiRequest<{ entries: any[] }>('/changelog'),
};

// Snippets API
export const snippetsAPI = {
    getAll: (params?: { search?: string; tag?: string; language?: string; author?: string; orderBy?: string; type?: string; difficulty?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ snippets: any[] }>(`/snippets${query ? `?${query}` : ''}`);
    },

    getSaved: () => Promise.resolve({ snippets: [] }), // Unavailable in MVP backend

    getById: (id: string) => apiRequest<{ snippet: any }>(`/snippets/${id}`),

    create: (data: {
        title: string;
        description: string;
        language: string;
        code: string;
        tags: string[];
        visibility?: string;
        outputSnapshot?: string;
        previewType?: string;
        type?: string;
        difficulty?: string;
        referenceUrl?: string;
    }) =>
        apiRequest<{ snippet: any }>('/snippets', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (id: string, data: {
        title?: string;
        description?: string;
        code?: string;
        tags?: string[];
        visibility?: string;
        outputSnapshot?: string;
        previewType?: string;
        referenceUrl?: string;
        annotations?: string;
    }) =>
        apiRequest<{ snippet: any }>(`/snippets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest<{ message: string }>(`/snippets/${id}`, {
            method: 'DELETE',
        }),

    // Stubs for Social Features
    like: (_id: string) => Promise.resolve({ liked: false }),
    comment: (_id: string, _content: string, _parentId?: string) => Promise.resolve({ comment: {} as any }),
    likeComment: (_commentId: string) => Promise.resolve({ liked: false }),
    getComments: (_id: string) => Promise.resolve({ comments: [] as any[] }),
    save: (_id: string) => Promise.resolve({ saved: false }),

    updateOutput: (id: string, output: string) =>
        apiRequest<{ snippet: any }>(`/snippets/${id}/output`, {
            method: 'PATCH',
            body: JSON.stringify({ output }),
        }),

    execute: (data: { language: string; code: string; stdin?: string }) =>
        apiRequest<{ run: { stdout: string; stderr: string; code: number; signal: string } }>('/snippets/execute', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    // v1.2: Fork & Copy
    fork: (id: string) =>
        apiRequest<{ snippet: any; message: string }>(`/snippets/${id}/fork`, {
            method: 'POST',
        }),

    copy: (id: string) =>
        apiRequest<{ message: string }>(`/snippets/${id}/copy`, {
            method: 'POST',
        }),

    recordView: (id: string) =>
        apiRequest<{ message: string }>(`/snippets/${id}/view`, {
            method: 'POST',
        }),

    recordCopy: (id: string) =>
        apiRequest<{ message: string }>(`/snippets/${id}/copy`, {
            method: 'POST',
        }),
};

// v1.2: Smart Feed API
export const feedAPI = {
    get: (bucket: 'trending' | 'new' | 'editor' = 'trending') =>
        apiRequest<{ snippets: any[]; bucket: string }>(`/feed?bucket=${bucket}`),
};

// v1.2: Practice Arena API
export const practiceAPI = {
    getProblems: (params?: { difficulty?: string; category?: string }) => {
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).filter(([_, v]) => v !== undefined && v !== null && v !== '')
        );
        const query = new URLSearchParams(cleanParams as any).toString();
        return apiRequest<{ problems: any[] }>(`/practice/problems${query ? `?${query}` : ''}`);
    },
    getProblem: (id: string) =>
        apiRequest<{ problem: any; isSolved: boolean }>(`/practice/problems/${id}`),
    getDailyProblem: () =>
        apiRequest<{ problem: any }>('/practice/daily'),
    run: (data: { problemId: string; code: string; language: string }) =>
        apiRequest<{ status: string; verdict: string; output: string; stderr: string }>('/practice/run', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    submit: (data: { problemId: string; code: string; language: string }) =>
        apiRequest<{ submission: any; output: string; stderr: string; newBadges?: any[]; nextProblemId?: string }>('/practice/submit', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getSubmissions: (problemId?: string) => {
        const query = problemId ? `?problemId=${problemId}` : '';
        return apiRequest<{ submissions: any[] }>(`/practice/submissions${query}`);
    },
};

// Documents API (Stubbed)
export const documentsAPI = {
    getAll: () => Promise.resolve({ documents: [] as any[] }),
    getBySlug: (_slug: string) => Promise.resolve({ document: null as any }),
    create: () => Promise.resolve({ document: {} as any }),
    like: () => Promise.resolve({ liked: false }),
    comment: () => Promise.resolve({ comment: {} as any }),
    save: () => Promise.resolve({ saved: false }),
    getComments: () => Promise.resolve({ comments: [] as any[] }),
};

// Users API
export const usersAPI = {
    getAll: () => apiRequest<{ users: any[] }>('/users'),
    getById: (id: string) => apiRequest<{ user: any; isFollowing: boolean }>(`/users/${id}`),

    getStats: () => apiRequest<{ snippets: number; likesReceived: number; savesReceived: number; followers: number; engagementRate: number; chart: any[] }>('/users/profile/stats'),

    getSnippets: (id: string) => apiRequest<{ snippets: any[] }>(`/users/${id}/snippets`),

    getDocuments: (_id: string) => Promise.resolve({ documents: [] as any[] }),

    follow: (_id: string) => Promise.resolve({ following: false }),
    unfollow: (_id: string) => Promise.resolve({ following: false }),
    getLiked: (_id: string) => Promise.resolve({ snippets: [] as any[] }),
    getFollowers: (_id: string) => Promise.resolve({ followers: [] as any[] }),
    getFollowing: (_id: string) => Promise.resolve({ following: [] as any[] }),

    update: (data: Partial<any>) =>
        apiRequest<{ user: any }>('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    getProfileSummary: (username?: string) =>
        apiRequest<{ snippets: { total: number; byLanguage: Record<string, number> }; arena: { contestsJoined: number } }>(
            `/users/profile/summary${username ? `?username=${username}` : ''}`
        ),

    getContestHistory: () => apiRequest<{ history: any[] }>('/users/me/contests'),

    completeOnboarding: (data: {
        name: string;
        username: string;
        bio: string;
        image: string;
        githubUrl: string;
        instagramUrl: string;
        linkedinUrl: string;
        languages: string[];
        interests: string[]
    }) =>
        apiRequest<{ message: string; user: any }>('/users/onboarding', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
    getBadges: (username: string) => apiRequest<{ badges: any[]; influence: any }>(`/users/${username}/badges`),
    getAvatars: () => apiRequest<{ avatars: any[] }>('/users/avatars'),

    // New Public/Community Methods
    getPublicProfile: (username: string) => apiRequest<{ user: any }>(`/public/users/${username}`),
};

export const communityAPI = {
    getUsers: (params: { search?: string; sort?: string; page?: number }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ users: any[]; page: number }>(`/community/users?${query}`);
    },
    getSearchSuggestions: (query: string) =>
        apiRequest<{ users: any[] }>(`/community/search-suggestions?q=${encodeURIComponent(query)}`)
};

// Open Feedback Message API
export const feedbackAPI = {
    getAll: (sort: string = 'latest') =>
        apiRequest<{ data: any[] }>(`/feedback?sort=${sort}`),

    create: (data: { content: string; category: string }) =>
        apiRequest<{ id: string }>('/feedback', {
            method: 'POST',
            body: JSON.stringify(data)
        }),

    react: (id: string) =>
        apiRequest<{ status: string }>(`/feedback/${id}/react`, {
            method: 'POST'
        }),

    disagree: (id: string) =>
        apiRequest<{ status: string }>(`/feedback/${id}/disagree`, {
            method: 'POST'
        }),

    update: (id: string, data: { content: string; category: string }) =>
        apiRequest<{ data: any; message: string }>(`/feedback/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        apiRequest<{ message: string }>(`/feedback/${id}`, {
            method: 'DELETE',
        }),
};

// Bugs API (Stubbed)
export const bugsAPI = {
    getAll: () => Promise.resolve({ bugs: [] as any[] }),
    create: () => Promise.resolve({ bug: {} as any }),
    upvote: () => Promise.resolve({ upvoted: false }),
    comment: () => Promise.resolve({ comment: {} as any }),
    getComments: () => Promise.resolve({ comments: [] as any[] }),
};

// Stories API (Stubbed)
// Upload API
export const uploadAPI = {
    profileImage: (file: File) => {
        const formData = new FormData();
        formData.append('image', file);
        return fetch(`${API_URL}/upload/profile-image`, {
            method: 'POST',
            headers: { ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
            body: formData,
        }).then(res => res.json());
    },
    chatAttachment: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return fetch(`${API_URL}/upload/chat-attachment`, {
            method: 'POST',
            headers: { ...(getToken() && { Authorization: `Bearer ${getToken()}` }) },
            body: formData,
        }).then(res => res.json());
    },
};

// Search API
export const searchAPI = {
    search: (query: string, type?: string, limit?: number) => {
        // Fallback to snippets search for now if no global search
        const params = new URLSearchParams({ search: query });
        if (type) params.append('type', type);
        if (limit) params.append('limit', limit.toString());

        // Fix: Use correct return type for apiRequest (snippets response)
        return apiRequest<{ snippets: any[] }>(`/snippets?${params.toString()}`)
            .then(res => ({ query, total: res.snippets.length, results: { snippets: res.snippets } }));
    },
};

// Notifications API (Stubbed)
export const notificationsAPI = {
    getAll: () => Promise.resolve({ notifications: [] as any[] }),
    getUnreadCount: () => Promise.resolve({ count: 0 }),
    markAsRead: () => Promise.resolve({ success: true }),
    markAllAsRead: () => Promise.resolve({ success: true }),
    delete: () => Promise.resolve({ success: true }),
};

// Events API
export const eventsAPI = {
    getAll: (params?: { type?: string; mode?: string; status?: string }) => {
        const query = new URLSearchParams(params as any).toString();
        return apiRequest<{ events: any[] }>(`/events${query ? `?${query}` : ''}`);
    },

    getById: (id: string) => apiRequest<{ event: any; isRegistered: boolean; rulesAccepted: boolean; registrationStatus: string; metadata: any }>(`/events/${id}`),

    create: (data: any) =>
        apiRequest<{ event: any }>('/events', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    register: (eventId: string, paymentDetails?: { razorpayPaymentId: string; razorpayOrderId: string; razorpaySignature: string }) =>
        apiRequest<{ id: string; status: string }>(`/events/${eventId}/register`, {
            method: 'POST',
            body: JSON.stringify(paymentDetails || {}),
        }),

    getAccessDetails: (id: string) =>
        apiRequest<{ access: boolean; message: string; secretLink?: string }>(`/events/${id}/access`),

    acceptRules: (id: string) =>
        apiRequest<{ message: string }>(`/events/${id}/rules`, {
            method: 'POST'
        }),

    joinExternal: (id: string) =>
        apiRequest<{ success: boolean; url: string; joinedAt: string }>(`/events/${id}/join-external`, {
            method: 'POST'
        }),
};

// Submissions API (Stubbed/Backend Pending or using contest API)
export const submissionsAPI = {
    submit: () => Promise.resolve({ submission: {} as any }),
    getMySubmissions: () => Promise.resolve({ submissions: [] as any[] }),
};

// Leaderboard API (Stubbed)
export const leaderboardAPI = {
    getGlobal: () => Promise.resolve({ users: [] as any[] }),
};

export const registrationsAPI = {
    register: (_eventId: string) => Promise.reject("Use eventsAPI.register"),
    getMyRegistrations: () => Promise.resolve({ registrations: [] as any[] }),
    getAllRegistrations: () => Promise.resolve({ registrations: [] as any[] }),
    updateStatus: () => Promise.resolve({ registration: {} as any }),
};

// Certificates API (Stubbed)
export const certificatesAPI = {
    download: () => Promise.resolve(),
};

// Payment API (Razorpay)
export const paymentsAPI = {
    createOrder: (eventId: string) =>
        apiRequest<{ orderId: string; amount: number; currency: string; keyId: string }>('/payments/order', {
            method: 'POST',
            body: JSON.stringify({ eventId })
        }),

    verifyPayment: (data: { eventId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
        apiRequest<{ success: boolean; message: string }>('/payments/verify', {
            method: 'POST',
            body: JSON.stringify(data)
        }),
};

// Contests/Problems API (Assuming exists or will stub if not found in backend scan, kept for now as backend has problems/contest logic potentially)
// Contests/Problems API
export const contestsAPI = {
    getProblems: (eventId: string) => apiRequest<{ problems: any[] }>(`/contests/${eventId}/problems`),

    getProblem: (eventId: string, problemId: string) => apiRequest<{ problem: any }>(`/contests/${eventId}/problems/${problemId}`),

    createProblem: (eventId: string, data: any) =>
        apiRequest<{ problem: any }>(`/contests/${eventId}/problems`, { // Protected Admin route same path structure usually
            method: 'POST',
            body: JSON.stringify(data)
        }),

    updateProblem: (eventId: string, problemId: string, data: any) =>
        apiRequest<{ problem: any }>(`/contests/${eventId}/problems/${problemId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        }),

    deleteProblem: (eventId: string, problemId: string) =>
        apiRequest<{ message: string }>(`/contests/${eventId}/problems/${problemId}`, {
            method: 'DELETE'
        }),

    submitSolution: (eventId: string, problemId: string, code: string, language: string, metrics?: { pasteCount: number; pastedChars: number; blurCount: number }) =>
        apiRequest<{ submission: any }>(`/contests/${eventId}/problems/${problemId}/submit`, {
            method: 'POST',
            body: JSON.stringify({ code, language, ...metrics })
        }),

    runSolution: (eventId: string, problemId: string, code: string, language: string) =>
        apiRequest<{ type: string; results: { input: string; expected: string; actual: string; status: string; stderr: string }[] }>(`/contests/${eventId}/problems/${problemId}/run`, {
            method: 'POST',
            body: JSON.stringify({ code, language })
        }),

    getMySubmissions: (eventId: string, problemId: string) =>
        apiRequest<{ submissions: any[] }>(`/contests/${eventId}/problems/${problemId}/submissions`),

    getLeaderboard: (eventId: string) => apiRequest<{ leaderboard: any[] }>(`/contests/${eventId}/leaderboard`),
};

// Activity API (Stubbed)
export const activityAPI = {
    getFeed: () => Promise.resolve({ activities: [] as any[] }),
};

// Messages API
export const messagesAPI = {
    getContacts: () =>
        apiRequest<{ contacts: any[] }>('/chat/contacts'),
    getHistory: (userId: string) =>
        apiRequest<{ messages: any[] }>(`/chat/messages?userId=${userId}`),
    markAsRead: (senderId: string) =>
        apiRequest<{ markedRead: number }>(`/chat/read/${senderId}`, { method: 'POST' }),
};

// Admin API
export const adminAPI = {
    // Dashboard
    getDashboard: () => apiRequest<{ metrics: any }>('/admin/dashboard'),

    // Contests
    getContests: () => apiRequest<{ contests: any[] }>('/admin/contests'),
    createContest: (data: any) => apiRequest<{ contest: any }>('/admin/contests', { method: 'POST', body: JSON.stringify(data) }),
    updateContest: (id: string, data: any) => apiRequest<{ message: string }>('/admin/contests/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deleteContest: (id: string) => apiRequest<{ message: string }>('/admin/contests/' + id, { method: 'DELETE' }),
    startContest: (id: string) => apiRequest<{ message: string }>(`/admin/contests/${id}/start`, { method: 'POST' }),
    freezeContest: (id: string) => apiRequest<{ message: string }>(`/admin/contests/${id}/freeze`, { method: 'POST' }),
    endContest: (id: string) => apiRequest<{ message: string }>(`/admin/contests/${id}/end`, { method: 'POST' }),
    getContestParticipants: (id: string) => apiRequest<{ stats: { totalRegistered: number; joinedExternal: number; noShows: number }; participants: any[] }>(`/admin/contests/${id}/participants`),

    // Problems
    getProblem: (id: string) => apiRequest<{ problem: any }>(`/admin/problems/${id}`),
    createProblem: (data: any) => apiRequest<{ problem: any }>('/admin/problems', { method: 'POST', body: JSON.stringify(data) }),
    updateProblem: (id: string, data: any) => apiRequest<{ message: string }>('/admin/problems/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deleteProblem: (id: string) => apiRequest<{ message: string }>('/admin/problems/' + id, { method: 'DELETE' }),
    reorderProblems: (eventId: string, problemIds: string[]) => apiRequest<{ message: string }>('/admin/problems/reorder', { method: 'POST', body: JSON.stringify({ eventId, problemIds }) }),

    // Practice Problems (v1.2)
    getPracticeProblems: () => apiRequest<{ problems: any[] }>('/admin/practice-problems'),
    getPracticeProblem: (id: string) => apiRequest<{ problem: any }>('/admin/practice-problems/' + id),
    createPracticeProblem: (data: any) => apiRequest<{ problem: any }>('/admin/practice-problems', { method: 'POST', body: JSON.stringify(data) }),
    updatePracticeProblem: (id: string, data: any) => apiRequest<{ message: string }>('/admin/practice-problems/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deletePracticeProblem: (id: string) => apiRequest<{ message: string }>('/admin/practice-problems/' + id, { method: 'DELETE' }),

    // Test Cases
    createTestCase: (problemId: string, data: any) => apiRequest<{ testCase: any }>(`/admin/problems/${problemId}/testcases`, { method: 'POST', body: JSON.stringify(data) }),
    updateTestCase: (tcId: string, data: any) => apiRequest<{ message: string }>(`/admin/testcases/${tcId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteTestCase: (tcId: string) => apiRequest<{ message: string }>(`/admin/testcases/${tcId}`, { method: 'DELETE' }),

    // Flags
    getFlags: () => apiRequest<{ submissions: any[] }>('/admin/flags'),
    ignoreFlag: (id: string, reason: string) => apiRequest<{ message: string }>(`/admin/flags/${id}/ignore`, { method: 'POST', body: JSON.stringify({ reason }) }),
    warnSubmission: (id: string, reason: string) => apiRequest<{ message: string }>(`/admin/flags/${id}/warn`, { method: 'POST', body: JSON.stringify({ reason }) }),
    disqualifySubmission: (id: string, reason: string) => apiRequest<{ message: string }>(`/admin/flags/${id}/disqualify-submission`, { method: 'POST', body: JSON.stringify({ reason }) }),
    disqualifyUser: (id: string) => apiRequest<{ message: string }>(`/admin/flags/${id}/disqualify-user`, { method: 'POST' }),

    // Users
    getUsers: (page: number = 1, limit: number = 20, search: string = "") =>
        apiRequest<{ users: any[]; pagination: any }>(`/admin/users?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
    searchUsers: (query: string) =>
        apiRequest<{ users: any[]; count: number }>(`/admin/users?search=${encodeURIComponent(query)}`), // Reuse same endpoint logic if we want, or keep deprecated

    getUser: (id: string) => apiRequest<{ user: any; suspensions: any[]; trustHistory: any[]; submissions: any[]; ips: string[] }>(`/admin/users/${id}`),
    warnUser: (id: string, reason: string) => apiRequest<{ message: string }>(`/admin/users/${id}/warn`, { method: 'POST', body: JSON.stringify({ reason }) }),
    suspendUser: (id: string, type: string, reason: string, expiresIn?: number) =>
        apiRequest<{ message: string }>(`/admin/users/${id}/suspend`, { method: 'POST', body: JSON.stringify({ type, reason, expiresIn }) }),
    unsuspendUser: (id: string) => apiRequest<{ message: string }>(`/admin/users/${id}/unsuspend`, { method: 'POST' }),
    banUserContest: (id: string, eventId: string) => apiRequest<{ message: string }>(`/admin/users/${id}/ban-contest`, { method: 'POST', body: JSON.stringify({ eventId }) }),
    adjustTrustScore: (id: string, trustScore: number, reason: string) =>
        apiRequest<{ message: string }>(`/admin/users/${id}/trust`, { method: 'POST', body: JSON.stringify({ trustScore, reason }) }),
    updateUser: (id: string, data: any) =>
        apiRequest<{ message: string }>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteUser: (id: string) =>
        apiRequest<{ message: string }>(`/admin/users/${id}`, { method: 'DELETE' }),

    getRolePermissions: () =>
        apiRequest<{ permissions: any[] }>('/admin/roles/permissions'),
    updateRolePermission: (data: any) =>
        apiRequest<{ message: string; permission: any }>('/admin/roles/permissions', { method: 'PUT', body: JSON.stringify(data) }),

    // Submissions
    getSubmissions: (params: { page?: number; contestId?: string; userId?: string; verdict?: string; flagged?: string }) => {
        const query = new URLSearchParams();
        if (params.page) query.append('page', params.page.toString());
        if (params.contestId) query.append('contestId', params.contestId);
        if (params.userId) query.append('userId', params.userId);
        if (params.verdict) query.append('verdict', params.verdict);
        if (params.flagged) query.append('flagged', params.flagged);
        return apiRequest<{ submissions: any[]; pagination: any }>(`/admin/submissions?${query.toString()}`);
    },
    getSubmission: (id: string) => apiRequest<{ submission: any }>(`/admin/submissions/${id}`),
    restoreSubmission: (id: string, reason: string) =>
        apiRequest<{ message: string }>(`/admin/submissions/${id}/restore`, { method: 'POST', body: JSON.stringify({ reason }) }),

    // Snippets
    getSnippets: (page: number = 1, limit: number = 20, search: string = "") =>
        apiRequest<{ snippets: any[]; pagination: any }>(`/admin/snippets?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
    pinSnippet: (id: string, featured: boolean) =>
        apiRequest<{ message: string }>(`/admin/snippets/${id}/pin`, { method: 'POST', body: JSON.stringify({ featured }) }),
    deleteSnippet: (id: string) =>
        apiRequest<{ message: string }>(`/admin/snippets/${id}`, { method: 'DELETE' }),

    // System Settings
    getSystemSettings: () => apiRequest<{ settings: Record<string, string> }>('/admin/system'),
    updateSystemSettings: (key: string, value: string) =>
        apiRequest<{ message: string; setting: any }>('/admin/system', { method: 'PUT', body: JSON.stringify({ key, value }) }),
    triggerRedeploy: (mode: string = "all") =>
        apiRequest<{ message: string }>('/admin/system/redeploy', { method: 'POST', body: JSON.stringify({ mode }) }),

    // Audit
    getAuditLogs: () => apiRequest<{ logs: any[] }>('/admin/audit-logs'),

    // Avatars
    createAvatar: (seed: string, style?: string) => apiRequest<{ avatar: any }>('/admin/avatars', { method: 'POST', body: JSON.stringify({ seed, style }) }),
    deleteAvatar: (id: string) => apiRequest<{ message: string }>(`/admin/avatars/${id}`, { method: 'DELETE' }),

    // Analytics
    getTopSnippets: (limit: number = 10) =>
        apiRequest<{ snippets: any[] }>(`/admin/analytics/top-snippets?limit=${limit}`),

    getSuspiciousActivity: () =>
        apiRequest<{ highCopySnippets: any[]; highForkSnippets: any[] }>('/admin/analytics/suspicious'),

    // Feedback Moderation
    updateFeedbackStatus: (id: string, status: string) => apiRequest<{ message: string; feedback: any }>(`/admin/feedback/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    lockFeedback: (id: string, isLocked: boolean) => apiRequest<{ message: string; feedback: any }>(`/admin/feedback/${id}/lock`, { method: 'POST', body: JSON.stringify({ locked: isLocked }) }),
    hideFeedback: (id: string, isHidden: boolean) => apiRequest<{ message: string; feedback: any }>(`/admin/feedback/${id}/hide`, { method: 'POST', body: JSON.stringify({ hidden: isHidden }) }),
    pinFeedback: (id: string, isPinned: boolean) => apiRequest<{ message: string; feedback: any }>(`/admin/feedback/${id}/pin`, { method: 'POST', body: JSON.stringify({ pinned: isPinned }) }),
    convertToChangelog: (id: string, changelogId: string) => apiRequest<{ message: string; feedback: any }>(`/admin/feedback/${id}/convert-changelog`, { method: 'POST', body: JSON.stringify({ changelogId }) }),

    // Changelog
    getChangelogs: () => apiRequest<{ entries: any[] }>('/admin/changelog'),
    createChangelog: (data: any) => apiRequest<{ entry: any; message: string }>('/admin/changelog', { method: 'POST', body: JSON.stringify(data) }),
    updateChangelog: (id: string, data: any) => apiRequest<{ message: string }>('/admin/changelog/' + id, { method: 'PUT', body: JSON.stringify(data) }),
    deleteChangelog: (id: string) => apiRequest<{ message: string }>('/admin/changelog/' + id, { method: 'DELETE' }),
};

export const systemAPI = {
    getPublicStatus: () => apiRequest<{ settings: Record<string, string> }>('/system/status'),
    getLandingStats: () => apiRequest<{
        totalUsers: number;
        totalSubmissions: number;
        totalSnippets: number;
        totalContests: number;
        upcomingEvents: any[];
        topContestants: any[];
    }>('/landing/stats'),
};

