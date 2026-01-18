import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { KeyRound, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"

export default function ResetPassword() {
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const navigate = useNavigate()
    const { toast } = useToast()

    useEffect(() => {
        if (!token) {
            toast({
                title: "Invalid Link",
                description: "Missing reset token.",
                variant: "destructive",
            })
            navigate("/auth/signin")
        }
    }, [token, navigate, toast])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            await authAPI.resetPassword({ token: token!, password })
            toast({
                title: "Success",
                description: "Your password has been reset successfully.",
            })
            navigate("/auth/signin")
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to reset password.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (!token) return null

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-primary/10">
                            <KeyRound className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-headline">Set new password</CardTitle>
                    <CardDescription>
                        Create a strong password for your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>
                        <Link to="/auth/signin" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Sign In
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
