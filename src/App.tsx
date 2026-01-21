import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { TooltipProvider } from "./components/ui/tooltip"
import { Toaster } from "./components/ui/toaster"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { SocketProvider } from "./context/SocketContext"
import { BadgeProvider } from "./context/BadgeContext"

// Pages
import { lazy, Suspense } from "react"
import { PageLoader } from "./components/ui/PageLoader"

// Pages (Lazy Loaded)
const Landing = lazy(() => import("./pages/Landing"))
const Feed = lazy(() => import("./pages/Feed"))
const Arena = lazy(() => import("./pages/arena/Arena"))
const EventDetail = lazy(() => import("./pages/arena/EventDetail"))
const ContestEnvironment = lazy(() => import("./pages/arena/Environment"))
const OfficialContest = lazy(() => import("./pages/arena/OfficialContest"))
const ContestLeaderboard = lazy(() => import("./pages/arena/Leaderboard"))
const FeedbackWall = lazy(() => import("./pages/FeedbackWall"))
const Convert = lazy(() => import("./pages/Convert"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const Profile = lazy(() => import("./pages/Profile"))
const Community = lazy(() => import("./pages/Community"))
const ContestHistory = lazy(() => import("./pages/profile/ContestHistory").then(m => ({ default: m.ContestHistory })))
const Settings = lazy(() => import("./pages/Settings"))
const SignIn = lazy(() => import("@/pages/auth/SignIn"))
const SignUp = lazy(() => import("@/pages/auth/SignUp"))
const Onboarding = lazy(() => import("@/pages/auth/Onboarding"))
const ForgotPassword = lazy(() => import("@/pages/auth/ForgotPassword"))
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"))
const OAuthCallback = lazy(() => import("./pages/auth/OAuthCallback"))
const Create = lazy(() => import("./pages/Create"))
const SnippetDetail = lazy(() => import("./pages/SnippetDetail"))
const Chat = lazy(() => import("./pages/Chat"))
const Badges = lazy(() => import("./pages/Badges"))
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"))
const AdminSnippets = lazy(() => import("./pages/admin/AdminSnippets"))
const ContestManager = lazy(() => import("./pages/admin/ContestManager"))
const ContestEditor = lazy(() => import("./pages/admin/ContestEditor"))
const ProblemEditor = lazy(() => import("./pages/admin/ProblemEditor"))
const FlagReview = lazy(() => import("./pages/admin/FlagReview"))
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"))
const AdminSubmissions = lazy(() => import("./pages/admin/AdminSubmissions"))
const AdminSystem = lazy(() => import("./pages/admin/AdminSystem"))
const AdminAvatars = lazy(() => import("./pages/admin/AdminAvatars"))
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"))
const AdminChangelog = lazy(() => import("./pages/admin/AdminChangelog"))
const AdminPractice = lazy(() => import("./pages/admin/AdminPractice"))
const Changelog = lazy(() => import("./pages/Changelog"))
const PracticeList = lazy(() => import("./pages/PracticeList"))
const PracticeWorkspace = lazy(() => import("./pages/PracticeWorkspace"))
const Maintenance = lazy(() => import("./pages/Maintenance"))
const AvatarPicker = lazy(() => import("./pages/AvatarPicker"))
const NotFound = lazy(() => import("./pages/NotFound"))

import { DesktopOnlyGuard } from "./components/DesktopOnlyGuard"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthError, MaintenanceError } from "./lib/api";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof AuthError) return false;
                if (error instanceof MaintenanceError) return false;
                if (error instanceof Error && error.message.includes('404')) return false;
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000, // 1 minute stale time
            gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
        },
    },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/auth/signin" state={{ from: location }} replace />
    }

    // Redirect to onboarding if not completed
    if (user && !user.onboardingCompleted && location.pathname !== '/onboarding') {
        return <Navigate to="/onboarding" replace />
    }

    return <>{children}</>
}

// Admin Route Component
function AdminRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, user } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/auth/signin" replace />
    }

    if (user?.role !== 'ADMIN') {
        return <NotFound />
    }

    return <>{children}</>
}

// Global Maintenance Handler
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function GlobalMaintenanceHandler() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleMaintenance = () => {
            const isAuthPage = location.pathname.startsWith('/auth') || location.pathname === '/onboarding';
            if (location.pathname !== '/maintenance' && !isAuthPage) {
                navigate('/maintenance');
            }
        };

        window.addEventListener('api:maintenance', handleMaintenance);
        return () => window.removeEventListener('api:maintenance', handleMaintenance);
    }, [navigate, location]);

    return null;
}

function AppRoutes() {
    return (
        <Suspense fallback={<PageLoader />}>
            <GlobalMaintenanceHandler />
            <Routes>
                <Route path="/maintenance" element={<Maintenance />} />
                <Route path="/auth/signin" element={<SignIn />} />
                <Route path="/auth/signup" element={<SignUp />} />
                <Route path="/auth/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route
                    path="/onboarding"
                    element={
                        <ProtectedRoute>
                            <Onboarding />
                        </ProtectedRoute>
                    }
                />
                <Route path="/oauth-callback" element={<OAuthCallback />} />

                <Route path="/" element={<Landing />} />

                <Route element={<DashboardLayout />}>
                    <Route
                        path="feed"
                        element={
                            <ProtectedRoute>
                                <Feed />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="arena"
                        element={
                            <ProtectedRoute>
                                <Arena />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="arena/events/:id"
                        element={
                            <ProtectedRoute>
                                <EventDetail />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="contest/:id/leaderboard"
                        element={
                            <ProtectedRoute>
                                <ContestLeaderboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="arena/env/:id"
                        element={
                            <ProtectedRoute>
                                <DesktopOnlyGuard featureName="Contest Environment">
                                    <ContestEnvironment />
                                </DesktopOnlyGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="arena/official/:id"
                        element={
                            <ProtectedRoute>
                                <OfficialContest />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="contest/:id/*"
                        element={
                            <ProtectedRoute>
                                <DesktopOnlyGuard featureName="Live Contest">
                                    <ContestEnvironment />
                                </DesktopOnlyGuard>
                            </ProtectedRoute>
                        }
                    />
                    {/* v1.2: Practice Arena - Now Protected */}
                    <Route
                        path="practice"
                        element={
                            <ProtectedRoute>
                                <PracticeList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="practice/:id"
                        element={
                            <ProtectedRoute>
                                <DesktopOnlyGuard featureName="Practice Arena">
                                    <PracticeWorkspace />
                                </DesktopOnlyGuard>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="convert" element={<ProtectedRoute><Convert /></ProtectedRoute>} />
                    <Route
                        path="dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="chat/:username?"
                        element={
                            <ProtectedRoute>
                                <Chat />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="profile/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="profile/history" element={<ProtectedRoute><ContestHistory /></ProtectedRoute>} />
                    <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                    <Route path="settings/avatars" element={<ProtectedRoute><AvatarPicker /></ProtectedRoute>} />
                    <Route path="changelog" element={<Changelog />} />

                    {/* Community & Public Profile - Now Protected */}
                    <Route path="community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
                    <Route path="feedback" element={<ProtectedRoute><FeedbackWall /></ProtectedRoute>} />
                    <Route path="u/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    <Route path="snippets/:id" element={<ProtectedRoute><SnippetDetail /></ProtectedRoute>} />
                    <Route path="create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
                    <Route path="badges" element={<ProtectedRoute><Badges /></ProtectedRoute>} />
                    {/* 404 Catch-all */}
                    <Route path="*" element={<NotFound />} />
                </Route>

                {/* Admin Block: Dedicated Layout without Platform Sidebars */}
                <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="snippets" element={<AdminSnippets />} />
                    <Route path="contests" element={<ContestManager />} />
                    <Route path="contests/:id" element={<ContestEditor />} />
                    <Route path="problems/:id" element={<ProblemEditor />} />
                    <Route path="submissions" element={<AdminSubmissions />} />
                    <Route path="flags" element={<FlagReview />} />
                    <Route path="system" element={<AdminSystem />} />
                    <Route path="avatars" element={<AdminAvatars />} />
                    <Route path="roles" element={<AdminRoles />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="changelog" element={<AdminChangelog />} />
                    <Route path="practice-problems" element={<AdminPractice />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

import { HelmetProvider } from "react-helmet-async";

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <HelmetProvider>
                <BrowserRouter>
                    <ThemeProvider defaultTheme="dark">
                        <AuthProvider>
                            <SocketProvider>
                                <TooltipProvider>
                                    <BadgeProvider>
                                        <AppRoutes />
                                        <Toaster />
                                    </BadgeProvider>
                                </TooltipProvider>
                            </SocketProvider>
                        </AuthProvider>
                    </ThemeProvider>
                </BrowserRouter>
            </HelmetProvider>
        </QueryClientProvider>
    )
}

export default App
