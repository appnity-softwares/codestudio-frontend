"use client";

import { useEffect, useState } from "react";
import { useSocket } from "@/context/SocketContext";
import { MessageSquare, Lock, Terminal } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Chat() {
    const { socket } = useSocket();
    const { } = useAuth();
    const [isConnected, setIsConnected] = useState(false);

    // MVP Requirement: Connection Logic Only (No Messaging)
    useEffect(() => {
        if (!socket) return;

        // Manual connect as per MVP Stability rules
        socket.connect();

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        setIsConnected(socket.connected);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
            // Disconnect on unmount to ensure scope isolation
            socket.disconnect();
        };
    }, [socket]);

    return (
        <div className="h-[calc(100vh-6rem)] grid grid-cols-1 md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr] bg-black/20 backdrop-blur-3xl overflow-hidden rounded-[2rem] border border-white/5 m-4">
            {/* Sidebar / Contacts List (Locked) */}
            <div className="border-r border-white/5 bg-white/5 flex flex-col">
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black font-headline tracking-tighter italic flex items-center gap-2">
                                <MessageSquare className="h-5 w-5" /> Comms
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className={`h-1.5 w-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                                    {isConnected ? 'Net-Link Active' : 'Offline'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Locked List State */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center text-center opacity-50">
                    <Lock className="h-8 w-8 mb-4 text-white/20" />
                    <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                        Contact List Encrypted
                    </p>
                </div>
            </div>

            {/* Chat Area (Locked) */}
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-6">
                <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-4 relative">
                    <div className="absolute inset-0 rounded-full border border-white/10 animate-ping opacity-20" />
                    <Terminal className="h-10 w-10 text-white/50" />
                </div>

                <div className="max-w-md space-y-2">
                    <h3 className="text-2xl font-bold font-headline tracking-tight text-white">
                        Direct Messaging Disabled
                    </h3>
                    <p className="text-base text-white/40 leading-relaxed">
                        Secure messaging channels are currently locked for the MVP phase.
                        Focus on code collaboration and executing snippets.
                    </p>
                </div>

                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 max-w-sm">
                    <p className="text-xs font-mono text-yellow-500/80">
                        ⚠ PROTOCOL RESTRICTION: Messaging features will be enabled post-launch.
                    </p>
                </div>
            </div>
        </div>
    );
}
