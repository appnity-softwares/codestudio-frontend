// import { useEffect } from "react"; 
// Removed unused import
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useChat } from "@/context/ChatContext";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";

export default function Messages() {
    const { activeContact, setActiveContact } = useChat();
    const isMobile = useIsMobile();

    // Reset active contact on mount if desirable? 
    // Usually we want to persist if they navigate away and back, so maybe not.

    // On mobile, if we have an active contact, show the window, else sidebar.
    // On desktop, show both side-by-side.

    const showSidebar = !isMobile || (isMobile && !activeContact);
    const showWindow = !isMobile || (isMobile && activeContact);

    return (
        <div className="h-[calc(100vh-64px)] w-full flex bg-background overflow-hidden relative">
            {/* Sidebar */}
            <div className={cn(
                "w-full md:w-80 lg:w-96 shrink-0 transition-all duration-300 absolute md:relative z-10 h-full",
                showSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0",
                isMobile && "border-r-0"
            )}>
                <ChatSidebar className="h-full w-full" />
            </div>

            {/* Chat Window Area */}
            <div className={cn(
                "flex-1 h-full transition-all duration-300 absolute md:relative z-20 bg-background w-full",
                showWindow ? "translate-x-0" : "translate-x-full md:translate-x-0"
            )}>
                <ChatWindow
                    className="h-full w-full"
                    onBack={() => setActiveContact(null)}
                />
            </div>
        </div>
    );
}
