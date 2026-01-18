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
import ContestLeaderboard from "./pages/arena/Leaderboard"

import Convert from "./pages/Convert"
import Dashboard from "./pages/Dashboard"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import SignIn from "./pages/auth/SignIn"
import SignUp from "./pages/auth/SignUp"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"
import OAuthCallback from "./pages/auth/OAuthCallback"
import Create from "./pages/Create"
import SnippetDetail from "./pages/SnippetDetail"
import Chat from "./pages/Chat"
import AdminConsole from "./pages/admin/AdminConsole"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
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

function AppRoutes() {
    return (
        <Routes>
            <Route path="/auth/signin" element={<SignIn />} />
            <Route path="/auth/signup" element={<SignUp />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
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
                    path="contest/:id/*"
                    element={
                        <ProtectedRoute>
                            <ContestEnvironment />
                        </ProtectedRoute>
                    }
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
                <Route path="settings" element={<Settings />} />

                <Route path="snippets/:id" element={<SnippetDetail />} />
                <Route path="create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
                <Route path="admin" element={<ProtectedRoute><AdminConsole /></ProtectedRoute>} />
            </Route>
        </Routes>
    )
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
    )
}

export default App
