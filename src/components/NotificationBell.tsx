"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { notificationsAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

type Notification = {
    id: string;
    type: "LIKE" | "COMMENT" | "MENTION" | "FOLLOW";
    message: string;
    link: string;
    read: boolean;
    createdAt: string;
};

export function NotificationBell() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const data = await notificationsAPI.getUnreadCount();
            setUnreadCount(data.count);
        } catch (err) {
            console.error("Failed to fetch unread count", err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationsAPI.getAll();
            setNotifications(data.notifications);
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = () => {
        setIsOpen(true);
        if (notifications.length === 0) {
            fetchNotifications();
        }
    };

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleNotificationClick = async (notification: Notification) => {
        if (!notification.read) {
            await notificationsAPI.markAsRead([notification.id]);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
            ));
        }
        navigate(notification.link);
        handleClose();
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error("Failed to mark all as read", err);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "LIKE":
                return "❤️";
            case "COMMENT":
                return "💬";
            case "MENTION":
                return "@";
            case "FOLLOW":
                return "👤";
            default:
                return "📬";
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={(open) => open ? handleOpen() : handleClose()}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full hover:bg-white/10 transition-all"
                >
                    <Bell className="h-5 w-5" />
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50"
                            >
                                <span className="text-[10px] font-black text-white">
                                    {unreadCount > 9 ? "9+" : unreadCount}
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-[380px] p-0 bg-black/90 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-primary/10 rounded-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-bold text-lg font-headline">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs text-primary hover:text-primary/80 h-7 rounded-lg"
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                                <Bell className="h-8 w-8 text-white/30" />
                            </div>
                            <p className="text-sm text-muted-foreground">No notifications yet</p>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                                We'll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 cursor-pointer transition-colors ${!notification.read ? "bg-primary/5" : ""
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 text-2xl">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm leading-relaxed">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), {
                                                    addSuffix: true,
                                                })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="flex-shrink-0">
                                                <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
