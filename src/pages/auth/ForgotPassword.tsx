import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import { siteConfig } from "@/lib/constants"

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const { toast } = useToast()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await authAPI.forgotPassword(email)
            setSubmitted(true)
            toast({
                title: "Check your email",
                description: res.message, // "If this email is registered..."
            })
            if (res.dev_token) {
                console.log("DEV TOKEN:", res.dev_token)
                toast({
                    title: "DEV MODE",
                    description: `Token: ${res.dev_token}`,
                    duration: 10000,
                })
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to process request.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <div className="mx-auto p-4 rounded-full bg-primary/10 w-fit mb-4">
                            <Mail className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Check your email</CardTitle>
                        <CardDescription>
                            We have sent a password reset link to <span className="font-medium text-foreground">{email}</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Did not receive the email? Check your spam folder or try another email address.
                        </p>
                    </CardContent>
                    <CardFooter className="flex justify-center">
                        <Link to="/auth/signin">
                            <Button variant="outline" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Sign In
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-headline">Reset Password</CardTitle>
                    <CardDescription>
                        Enter your email address to reset your {siteConfig.name} password
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Sending link..." : "Send Reset Link"}
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
