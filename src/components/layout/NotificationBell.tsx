import { useEffect } from "react";
import { Bell } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";

export function NotificationBell() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { socket } = useSocket();

    const { data: unreadCountData } = useQuery({
        queryKey: ['unread-notifications-count'],
        queryFn: notificationsAPI.getUnreadCount,
        enabled: !!user?.id,
        refetchInterval: 60000
    });

    const unreadCount = unreadCountData?.count || 0;

    // Handle real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNotification = (newNotification: any) => {
            toast({
                title: getActivityTitle(newNotification.type),
                description: newNotification.message,
                onClick: () => navigate('/notifications'),
                className: "cursor-pointer"
            });

            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        };

        socket.on("notification", handleNotification);
        return () => { socket.off("notification", handleNotification); };
    }, [socket, toast, queryClient, navigate]);

    const getActivityTitle = (type: string) => {
        switch (type) {
            case 'LIKE': return 'Snippet Liked';
            case 'COMMENT': return 'New Comment';
            case 'LINK_REQUEST': return 'Link Request';
            case 'LINK_ACCEPT': return 'Request Accepted';
            default: return 'Notification';
        }
    };

    return (
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/10" onClick={() => navigate('/notifications')}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
            )}
        </Button>
    );
}
