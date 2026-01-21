import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Code, Github, Rocket, Terminal, ArrowRight, Sparkles, User, Lock, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { MaintenanceError } from "@/lib/api"
import MaintenanceModal from "@/components/MaintenanceModal"

export default function SignUp() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [loading, setLoading] = useState(false)
    const [maintenanceEta, setMaintenanceEta] = useState<string | undefined>()
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle')
    const [suggestions, setSuggestions] = useState<string[]>([])
    const { signUp } = useAuth()
    const navigate = useNavigate()
    const { toast } = useToast()

    const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
        setUsername(value)

        if (value.length < 3) {
            setUsernameStatus('idle')
            setSuggestions([])
            return
        }

        setUsernameStatus('checking')
        try {
            const res = await import('@/lib/api').then(m => m.authAPI.checkUsername(value))
            if (res.available) {
                setUsernameStatus('available')
                setSuggestions([])
            } else {
                setUsernameStatus('taken')
                setSuggestions(res.suggestions || [])
            }
        } catch {
            setUsernameStatus('idle')
        }
    }

    const getPasswordStrength = (pass: string) => {
        if (!pass) return { score: 0, label: "Enter password" };
        let score = 0;
        if (pass.length > 7) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;

        const labels = ["Weak", "Fair", "Good", "Strong"];
        return { score, label: labels[Math.min(score, 3)] };
    };

    const strength = getPasswordStrength(password);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await signUp({ name, email, password, username })
            toast({
                title: "Account created",
                description: "Welcome to the community!",
            })
            navigate("/onboarding")
        } catch (error: any) {
            if (error instanceof MaintenanceError) {
                setMaintenanceEta(error.eta)
                setShowMaintenanceModal(true)
            } else {
                toast({
                    title: "Registration failed",
                    description: "Please check your details and try again.",
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
                            Join the next gen <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-300">
                                developer network.
                            </span>
                        </h1>
                        <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
                            Create your developer profile, showcase your best work, and get discovered by top tech companies and peers.
                        </p>
                    </div>

                    {/* Vector Illustration Replacement: Network/Profile Logic */}
                    <div className="relative w-full aspect-[16/9] rounded-2xl bg-black/40 border border-white/10 overflow-hidden shadow-2xl">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:24px_24px]" />

                        {/* Abstract Nodes */}
                        <div className="absolute top-8 left-8 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
                            <Rocket className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="absolute bottom-12 right-12 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md">
                            <Sparkles className="h-5 w-5 text-emerald-400" />
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md shadow-[0_0_30px_rgba(168,85,247,0.15)]">
                            <User className="h-8 w-8 text-purple-400" />
                        </div>

                        {/* Connecting Lines (CSS Decorations) */}
                        <div className="absolute top-12 left-12 w-[calc(50%-48px)] h-[1px] bg-gradient-to-r from-orange-500/30 to-purple-500/30" />
                        <div className="absolute bottom-16 right-16 w-[calc(50%-42px)] h-[1px] bg-gradient-to-l from-emerald-500/30 to-purple-500/30" />

                        {/* Floating Metadata */}
                        <div className="absolute top-6 right-10 flex gap-2">
                            <div className="h-2 w-12 rounded-full bg-white/10" />
                            <div className="h-2 w-8 rounded-full bg-white/10" />
                        </div>
                    </div>

                    {/* Feature Highlights */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                            <Sparkles className="h-4 w-4 text-emerald-500" />
                            <span>Rich Developer Profile</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground/80">
                            <Terminal className="h-4 w-4 text-blue-500" />
                            <span>Real Coding Skills</span>
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
                            Create an account
                        </CardTitle>
                        <CardDescription className="text-base font-medium text-muted-foreground/80">
                            Join CodeStudio to connect with developers.
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-foreground/80 font-medium ml-0.5">Full Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                        className="bg-white/5 border-white/10 h-11 px-3 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium rounded-lg"
                                    />
                                </div>
                                <div className="space-y-2 relative">
                                    <Label htmlFor="username" className="text-foreground/80 font-medium ml-0.5">Username</Label>
                                    <div className="relative">
                                        <Input
                                            id="username"
                                            placeholder="johndoe"
                                            value={username}
                                            onChange={handleUsernameChange}
                                            required
                                            className={`bg-white/5 border-white/10 h-11 px-3 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium rounded-lg ${usernameStatus === 'taken' ? 'border-red-500/50 focus:border-red-500/50' : usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500/50' : ''}`}
                                        />
                                        {usernameStatus === 'checking' && (
                                            <div className="absolute right-3 top-3">
                                                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                            </div>
                                        )}
                                        {usernameStatus === 'available' && (
                                            <div className="absolute right-3 top-3">
                                                <Check className="h-4 w-4 text-green-500" />
                                            </div>
                                        )}
                                        {usernameStatus === 'taken' && (
                                            <div className="absolute right-3 top-3">
                                                <X className="h-4 w-4 text-red-500" />
                                            </div>
                                        )}
                                    </div>
                                    {usernameStatus === 'taken' && suggestions.length > 0 && (
                                        <p className="text-xs text-red-400 ml-1">
                                            Taken. Try: {suggestions.map((s, i) => (
                                                <span key={s} className="font-mono cursor-pointer hover:underline ml-1" onClick={() => {
                                                    setUsername(s); setUsernameStatus('available'); setSuggestions([]);
                                                }}>{s}{i < suggestions.length - 1 ? ',' : ''}</span>
                                            ))}
                                        </p>
                                    )}
                                </div>
                            </div>
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
                                <Label htmlFor="password" className="text-foreground/80 font-medium ml-0.5">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="bg-white/5 border-white/10 h-11 px-3 focus:border-primary/50 focus:ring-primary/20 transition-all font-medium rounded-lg"
                                />
                                {password && (
                                    <div className="flex items-center justify-between px-1 pt-1">
                                        <div className="flex bg-white/10 h-1 w-full rounded-full overflow-hidden gap-0.5">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className={`h-full w-full transition-colors duration-300 ${i < strength.score ? (strength.score > 2 ? 'bg-green-500' : strength.score > 1 ? 'bg-yellow-500' : 'bg-red-500') : 'bg-transparent'}`} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground ml-2 whitespace-nowrap">{strength.label}</span>
                                    </div>
                                )}
                            </div>

                            <Button type="submit" className="w-full h-11 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 rounded-lg" disabled={loading || usernameStatus === 'checking' || usernameStatus === 'taken'}>
                                {loading ? "Creating account..." : "Sign Up"}
                                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                            </Button>

                            <p className="text-center text-xs text-muted-foreground/60 px-4">
                                By clicking next, you agree to our Terms and complete the quick onboarding process.
                            </p>

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
                                Already have an account?{" "}
                                <Link to="/auth/signin" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                                    Sign in
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

