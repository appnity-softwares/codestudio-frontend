import { useEffect } from "react";
import { notificationsAPI } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/context/SocketContext";
import { formatDistanceToNow } from "date-fns";
import { Bell, Check, Loader2, Trash2 } from "lucide-react";
import { PageLoader } from "@/components/ui/PageLoader";

export default function Notifications() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { socket } = useSocket();

    // Fetch notifications
    const { data: notificationsData, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationsAPI.getAll(),
        enabled: !!user?.id,
        refetchInterval: 60000
    });

    const notifications = notificationsData?.notifications || [];

    // Mark as read mutation
    const markReadMutation = useMutation({
        mutationFn: (ids: string | string[]) => {
            if (Array.isArray(ids)) {
                return notificationsAPI.markAllAsRead();
            }
            return notificationsAPI.markAsRead(ids);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        }
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => notificationsAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast({ title: "Notification deleted" });
        }
    });

    // Handle real-time notifications
    useEffect(() => {
        if (!socket) return;
        const handleNotification = (_: any) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        };
        socket.on("notification", handleNotification);
        return () => { socket.off("notification", handleNotification); };
    }, [socket, queryClient]);

    const handleMarkAllRead = () => {
        const unreadIds = notifications.filter((n: any) => !n.isRead).map((n: any) => n.id);
        if (unreadIds.length > 0) {
            markReadMutation.mutate(unreadIds);
            toast({ title: "All marked as read" });
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
        } else if (notification.snippetId) {
            navigate(`/snippets/${notification.snippetId}`);
        }
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

    if (isLoading) return <PageLoader />;

    return (
        <div className="container max-w-2xl mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Updates, interactions, and alerts.
                    </p>
                </div>
                {notifications.some((n: any) => !n.isRead) && (
                    <Button onClick={handleMarkAllRead} disabled={markReadMutation.isPending}>
                        {markReadMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Mark all read
                    </Button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length > 0 ? (
                    <div className="grid gap-3">
                        {notifications.map((notification: any) => (
                            <div
                                key={notification.id}
                                className={`
                                    relative group p-4 rounded-xl border transition-all duration-300
                                    ${!notification.isRead
                                        ? 'bg-card border-l-4 border-l-primary shadow-lg shadow-primary/5'
                                        : 'bg-muted/10 border-border hover:bg-muted/20'}
                                `}
                            >
                                <div className="flex gap-4">
                                    <div className="shrink-0 text-2xl pt-1">
                                        {getActivityIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-1 cursor-pointer" onClick={() => handleNotificationClick(notification)}>
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm ${!notification.isRead ? 'font-bold text-foreground' : 'font-medium text-foreground/80'}`}>
                                                {notification.message}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground tabular-nums shrink-0 ml-2">
                                                {formatDistanceToNow(new Date(notification.createdAt))} ago
                                            </span>
                                        </div>
                                        {notification.actor && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                from <span className="font-bold text-primary">{notification.actor.name || notification.actor.username}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMutation.mutate(notification.id);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                        <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center">
                            <Bell className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">All caught up!</h3>
                            <p className="text-muted-foreground text-sm">You have no new notifications.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
