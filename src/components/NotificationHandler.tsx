import { useEffect } from 'react';
import { useSocket } from '@/context/SocketContext';
import { useToast } from '@/hooks/use-toast';
import { Bell, Trophy, Heart, MessageCircle, UserPlus, GitFork } from 'lucide-react';

export function NotificationHandler() {
    const { socket } = useSocket();
    const { toast } = useToast();

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data: any) => {
            console.log('🔔 Real-time notification received:', data);

            let icon = <Bell className="h-4 w-4 text-primary" />;
            let title = "New Notification";

            switch (data.type) {
                case 'ACHIEVEMENT':
                    icon = <Trophy className="h-4 w-4 text-yellow-500" />;
                    title = "Achievement Unlocked!";
                    break;
                case 'LIKE':
                    icon = <Heart className="h-4 w-4 text-red-500 fill-red-500" />;
                    title = "New Like";
                    break;
                case 'COMMENT':
                    icon = <MessageCircle className="h-4 w-4 text-blue-500" />;
                    title = "New Comment";
                    break;
                case 'FOLLOW':
                    icon = <UserPlus className="h-4 w-4 text-green-500" />;
                    title = "New Follower";
                    break;
                case 'FORK':
                    icon = <GitFork className="h-4 w-4 text-indigo-500" />;
                    title = "Snippet Forked";
                    break;
            }

            toast({
                title: (
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className="font-black italic uppercase tracking-tighter">{title}</span>
                    </div>
                ) as any,
                description: data.message,
                duration: 5000,
            });
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket, toast]);

    return null;
}
