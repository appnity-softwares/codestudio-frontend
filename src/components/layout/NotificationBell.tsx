import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { notificationsAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import io from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8080";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketType = any;

export function NotificationBell() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const socketRef = useRef<SocketType | null>(null);

    // Fetch notifications
    const { data: notificationsData } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsAPI.getAll(),
        enabled: !!user?.id,
        refetchInterval: 30000
    });

    const { data: unreadCountData } = useQuery({
        queryKey: ['unread-notifications-count'],
        queryFn: notificationsAPI.getUnreadCount,
        enabled: !!user?.id,
        refetchInterval: 15000
    });

    const notifications = notificationsData?.notifications || [];
    const unreadCount = unreadCountData?.count || 0;

    // Mark as read mutation
    const markReadMutation = useMutation({
        mutationFn: (ids: string[]) => notificationsAPI.markAsRead(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        }
    });

    // Handle real-time notifications
    useEffect(() => {
        if (!user?.id) return;

        socketRef.current = io(SOCKET_URL, {
            query: { userId: user.id }
        });

        socketRef.current.on("notification", (newNotification: any) => {
            // Show toast
            toast({
                title: getActivityTitle(newNotification.type),
                description: newNotification.message,
            });

            // Refresh data
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user?.id, queryClient, toast]);

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter((n: any) => !n.read).map((n: any) => n.id);
        if (unreadIds.length > 0) {
            markReadMutation.mutate(unreadIds);
        }
    };

    const handleNotificationClick = (notification: any) => {
        if (!notification.read) {
            markReadMutation.mutate([notification.id]);
        }

        if (notification.link) {
            navigate(notification.link);
        } else if (notification.type === 'FOLLOW') {
            navigate(`/profile/${notification.actorId}`);
        }

        setIsOpen(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getActivityIcon = (_type: string) => {
        // Simple visual indicator, can expand with Lucide icons
        return "🔔";
    }

    const getActivityTitle = (type: string) => {
        switch (type) {
            case 'FOLLOW': return 'New Follower';
            case 'LIKE': return 'New Like';
            case 'COMMENT': return 'New Comment';
            case 'NEW_SNIPPET': return 'New Snippet';
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
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[10px] text-muted-foreground hover:text-primary"
                            onClick={handleMarkAllRead}
                        >
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
                                    className={`p-4 hover:bg-white/5 cursor-pointer transition-colors ${!notification.read ? 'bg-primary/5' : ''}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="flex gap-3">
                                        <div className="text-xl">
                                            {getActivityIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-xs leading-relaxed ${!notification.read ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground/60">
                                                {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-muted-foreground text-xs italic">
                            No notifications yet.
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
