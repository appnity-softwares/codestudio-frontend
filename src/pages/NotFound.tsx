import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { FileQuestion } from "lucide-react"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="bg-muted p-6 rounded-full mb-6">
                <FileQuestion className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-4xl font-bold mb-2">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-8 max-w-md">
                The page you are looking for doesn't exist or you don't have permission to access it.
            </p>
            <Button asChild>
                <Link to="/">Go Back Home</Link>
            </Button>
        </div>
    )
}
