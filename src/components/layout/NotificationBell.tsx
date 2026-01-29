import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const { socket } = useSocket();

    // Fetch notifications
    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsAPI.getAll(),
        enabled: !!user?.id,
        refetchInterval: 60000 // Rely more on real-time
    });

    const { data: unreadCountData } = useQuery({
        queryKey: ['unread-notifications-count'],
        queryFn: notificationsAPI.getUnreadCount,
        enabled: !!user?.id,
        refetchInterval: 60000
    });

    const notifications = notificationsData?.notifications || [];
    const unreadCount = unreadCountData?.count || 0;

    // Mark as read mutation
    const markReadMutation = useMutation({
        mutationFn: (ids: string | string[]) => {
            if (Array.isArray(ids)) {
                // Bulk mark as read if API supports it, or use serial calls
                return notificationsAPI.markAllAsRead(); // For simplicity in markAllRead
            }
            return notificationsAPI.markAsRead(ids);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        }
    });

    // Handle real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNotification = (newNotification: any) => {
            toast({
                title: getActivityTitle(newNotification.type),
                description: newNotification.message,
            });

            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        };

        socket.on("notification", handleNotification);
        return () => { socket.off("notification", handleNotification); };
    }, [socket, queryClient, toast]);

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter((n: any) => !n.isRead).map((n: any) => n.id);
        if (unreadIds.length > 0) {
            markReadMutation.mutate(unreadIds);
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead) {
            markReadMutation.mutate(notification.id);
        }

        if (notification.type === 'LINK_REQUEST') {
            navigate('/social/requests');
        } else if (notification.type === 'LINK_ACCEPT') {
            navigate(`/u/${notification.actor?.username || ''}`);
        } else if (notification.actor?.username) {
            navigate(`/u/${notification.actor.username}`);
        }

        setIsOpen(false);
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'LIKE': return "❤️";
            case 'COMMENT': return "💬";
            case 'LINK_REQUEST': return "🤝";
            case 'LINK_ACCEPT': return "✅";
            default: return "🔔";
        }
    };

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
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-white/10">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-black animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-background/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden" align="end">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h4 className="font-bold text-sm">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground hover:text-primary" onClick={handleMarkAllRead}>
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length > 0 ? (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification: any) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-xl">
                                            {getActivityIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs leading-relaxed ${!notification.isRead ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60">
                                                {formatDistanceToNow(new Date(notification.createdAt))} ago
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-xs italic">
                            All caught up!
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
