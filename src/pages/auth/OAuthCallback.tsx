import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"

export default function OAuthCallback() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const { loginWithToken } = useAuth()
    const { toast } = useToast()

    useEffect(() => {
        const token = searchParams.get("token")

        if (token) {
            loginWithToken(token).then(() => {
                navigate("/feed")
            }).catch(() => {
                toast({
                    title: "Login Failed",
                    description: "Invalid token received.",
                    variant: "destructive",
                })
                navigate("/auth/signin")
            })
        } else {
            toast({
                title: "Login Failed",
                description: "No token received from provider.",
                variant: "destructive",
            })
            navigate("/auth/signin")
        }
    }, [searchParams, navigate, toast, loginWithToken])

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Completing login...</p>
            </div>
        </div>
    )
}
