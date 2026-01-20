import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./context/ThemeContext"
import { AuthProvider, useAuth } from "./context/AuthContext"
import { TooltipProvider } from "./components/ui/tooltip"
import { Toaster } from "./components/ui/toaster"
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { SocketProvider } from "./context/SocketContext"

// Pages
import Feed from "./pages/Feed"
import Arena from "./pages/arena/Arena"
import EventDetail from "./pages/arena/EventDetail"
import ContestEnvironment from "./pages/arena/Environment"
import OfficialContest from "./pages/arena/OfficialContest"
import ContestLeaderboard from "./pages/arena/Leaderboard"
import FeedbackWall from "./pages/FeedbackWall"

import Convert from "./pages/Convert"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import PublicProfile from "./pages/PublicProfile"
import Community from "./pages/Community"
import { ContestHistory } from "./pages/profile/ContestHistory"
import Settings from "./pages/Settings"
import SignIn from '@/pages/auth/SignIn';
import SignUp from '@/pages/auth/SignUp';
import Onboarding from '@/pages/auth/Onboarding';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ResetPassword from '@/pages/auth/ResetPassword';
import OAuthCallback from "./pages/auth/OAuthCallback"
import Create from "./pages/Create"
import SnippetDetail from "./pages/SnippetDetail"
import Chat from "./pages/Chat"
import AdminLayout from "./pages/admin/AdminLayout"
import AdminDashboard from "./pages/admin/AdminDashboard"
import ContestManager from "./pages/admin/ContestManager"
import ContestEditor from "./pages/admin/ContestEditor"
import ProblemEditor from "./pages/admin/ProblemEditor"
import FlagReview from "./pages/admin/FlagReview"
import AuditLogs from "./pages/admin/AuditLogs"
import AdminUsers from "./pages/admin/AdminUsers"
import AdminSubmissions from "./pages/admin/AdminSubmissions"
import AdminSystem from "./pages/admin/AdminSystem"
import AdminChangelog from "./pages/admin/AdminChangelog"
import Changelog from "./pages/Changelog"
import PracticeList from "./pages/PracticeList"
import PracticeWorkspace from "./pages/PracticeWorkspace"
import NotFound from "./pages/NotFound"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthError } from "./lib/api";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: (failureCount, error) => {
                if (error instanceof AuthError) return false;
                // Don't retry if it's a 404 (optional, but good practice)
                if (error instanceof Error && error.message.includes('404')) return false;
                return failureCount < 2;
            },
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
        },
    },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated) {
        return <Navigate to="/auth/signin" replace />
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

function AppRoutes() {
    return (
        <Routes>
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

            <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Navigate to="/feed" replace />} />
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
                            <ContestEnvironment />
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
                            <ContestEnvironment />
                        </ProtectedRoute>
                    }
                />
                {/* v1.2: Practice Arena (casual, no auth required to view) */}
                <Route
                    path="practice"
                    element={<PracticeList />}
                />
                <Route
                    path="practice/:id"
                    element={<PracticeWorkspace />}
                />
                <Route
                    path="feed"
                    element={
                        <ProtectedRoute>
                            <Feed />
                        </ProtectedRoute>
                    }
                />


                <Route path="convert" element={<Convert />} />
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
                <Route path="profile/:username" element={<Profile />} />
                <Route path="profile/history" element={<ProtectedRoute><ContestHistory /></ProtectedRoute>} />
                <Route path="settings" element={<Settings />} />
                <Route path="changelog" element={<Changelog />} />

                {/* Community & Public Profile */}
                <Route path="community" element={<Community />} />
                <Route path="feedback" element={<FeedbackWall />} />
                <Route path="u/:username" element={<PublicProfile />} />

                <Route path="snippets/:id" element={<SnippetDetail />} />
                <Route path="create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
                {/* Admin Routes */}
                <Route path="admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="contests" element={<ContestManager />} />
                    <Route path="contests/:id" element={<ContestEditor />} />
                    <Route path="problems/:id" element={<ProblemEditor />} />
                    <Route path="submissions" element={<AdminSubmissions />} />
                    <Route path="flags" element={<FlagReview />} />
                    <Route path="system" element={<AdminSystem />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="changelog" element={<AdminChangelog />} />
                </Route>

                {/* 404 Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
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
                                    <AppRoutes />
                                    <Toaster />
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
