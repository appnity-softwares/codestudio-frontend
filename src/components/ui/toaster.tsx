import {
    Toast,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <ToastProvider>
            {toasts.map(function ({ id, title, description, action, ...props }) {
                const isDestructive = props.variant === "destructive";
                const errorContent = description ? description.toString() : "An error occurred";

                return (
                    <Toast key={id} {...props}>
                        <div className="grid gap-1">
                            {title && <ToastTitle>{title}</ToastTitle>}
                            {description && (
                                <ToastDescription>{description}</ToastDescription>
                            )}
                        </div>
                        {action}
                        {!action && isDestructive && (
                            <ToastAction altText="Report Issue" onClick={() => window.location.href = `/feedback?category=BUG&content=Error Report: ${encodeURIComponent(errorContent)}`}>
                                Report
                            </ToastAction>
                        )}
                        <ToastClose />
                    </Toast>
                )
            })}
            <ToastViewport />
        </ToastProvider>
    )
}
