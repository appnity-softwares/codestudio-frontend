import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Code, Github, Shield, Cpu, Terminal, ArrowRight, Zap, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { MaintenanceError } from "@/lib/api"
import MaintenanceModal from "@/components/MaintenanceModal"

export default function SignIn() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [maintenanceEta, setMaintenanceEta] = useState<string | undefined>()
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
    const { signIn } = useAuth()
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await signIn(email, password) as any
            toast({
                title: "Welcome back",
                description: "You have successfully signed in.",
            })

            // Navigate based on onboarding status
            if (response?.user && !response.user.onboardingCompleted) {
                navigate("/onboarding")
            } else {
                navigate("/feed")
            }
        } catch (error: any) {
            if (error instanceof MaintenanceError) {
                setMaintenanceEta(error.eta)
                setShowMaintenanceModal(true)
            } else {
                toast({
                    title: "Authentication failed",
                    description: "Be sure to check your credentials.",
                    variant: "destructive",
                })
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full lg:grid lg:grid-cols-2 bg-[#09090b] text-foreground relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px] pointer-events-none" />

            {/* LEFT COLUMN: Value + Visual */}
            <div className="hidden lg:flex flex-col items-center justify-center relative z-10 border-r border-white/5 bg-white/[0.01] backdrop-blur-[2px] p-12">
                <div className="w-full max-w-lg space-y-12">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                            <Code className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-white">CodeStudio</span>
                    </div>

                    {/* Typography Content */}
                    <div className="space-y-6">
                        <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
                            Master the art of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">
                                efficient coding.
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Build snippets, solve algorithmic challenges, and compete on a performance-first coding platform.
                        </p>
                    </div>

                    {/* Vector Illustration Replacement: Code Activity Grid */}
                    <div className="relative w-full aspect-[16/9] rounded-2xl bg-black/40 border border-white/10 overflow-hidden shadow-2xl">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:24px_24px]" />

                        {/* Abstract Nodes */}
                        <div className="absolute top-8 left-8 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                            <Terminal className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="absolute bottom-12 right-12 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 backdrop-blur-md">
                            <Cpu className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                            <Globe className="h-8 w-8 text-purple-400" />
                        </div>

                        {/* Connecting Lines (CSS Decorations) */}
                        <div className="absolute top-12 left-12 w-[calc(50%-48px)] h-[1px] bg-gradient-to-r from-emerald-500/30 to-purple-500/30" />
                        <div className="absolute bottom-16 right-16 w-[calc(50%-42px)] h-[1px] bg-gradient-to-l from-blue-500/30 to-purple-500/30" />

                        {/* Floating Code Bits */}
                        <div className="absolute top-6 right-10 text-[10px] font-mono text-white/20">
                            <div>func main() {'{'}</div>
                            <div className="pl-2">optimize()</div>
                            <div>{'}'}</div>
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                            <Shield className="h-4 w-4 text-emerald-500" />
                            <span>Anti-cheat Enforced</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span>Instant Runtime</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Auth Card */}
            <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative z-20">
                {/* Mobile Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] opacity-20 pointer-events-none lg:opacity-5" />

                <Card className="w-full max-w-[480px] border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
                    <CardHeader className="space-y-1 text-center pb-8 pt-10">
                        <CardTitle className="text-2xl font-bold tracking-tight text-white/90">
                            Welcome back
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-muted-foreground/80">
                            Build, share, and compete with real code.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-foreground/80 font-medium ml-0.5">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 h-11 px-3 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-0.5">
                                    <Label htmlFor="password" className="text-foreground/80 font-medium">Password</Label>
                                    <Link
                                        to="/auth/forgot-password"
                                        className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 h-11 px-3 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium rounded-lg"
                                />
                            </div>



                            <Button type="submit" className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 rounded-lg" disabled={loading}>
                                {loading ? "Signing in..." : "Sign In"}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>

                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest">
                                    <span className="bg-[#0c0c0e] px-4 text-muted-foreground/50 font-medium">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Button variant="outline" type="button" className="h-10 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all rounded-lg text-xs font-medium" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/auth/github/login`}>
                                    <Github className="mr-2 h-3.5 w-3.5" />
                                    Github
                                </Button>
                                <Button variant="outline" type="button" className="h-10 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all rounded-lg text-xs font-medium" onClick={() => window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/auth/google/login`}>
                                    <svg className="mr-2 h-3.5 w-3.5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                                        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                                    </svg>
                                    Google
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-6 pb-8">
                            <p className="text-sm text-center text-muted-foreground">
                                Don't have an account?{" "}
                                <Link to="/auth/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                    Create account
                                </Link>
                            </p>

                            {/* Trust Signals */}
                            <div className="flex items-center justify-center gap-6 pt-4 border-t border-white/5 w-full opacity-60">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                    <Lock className="h-2.5 w-2.5" /> Secure
                                </p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-1.5">
                                    <Code className="h-2.5 w-2.5" /> Developer Friendly
                                </p>
                            </div>
                        </CardFooter>
                    </form>
                </Card>
            </div>
            <MaintenanceModal
                isOpen={showMaintenanceModal}
                onClose={() => setShowMaintenanceModal(false)}
                eta={maintenanceEta}
            />
        </div>
    )
}

