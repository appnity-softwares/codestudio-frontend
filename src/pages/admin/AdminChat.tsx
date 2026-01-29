import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Send, ShieldAlert, MessageSquare, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { adminAPI } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminChat() {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [messageContent, setMessageContent] = useState("");

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const { data: searchResults, isLoading: isSearching } = useQuery({
        queryKey: ["admin-user-search", debouncedSearch],
        queryFn: () => adminAPI.getUsers(1, 10, debouncedSearch),
        enabled: debouncedSearch.length > 0,
    });

    const sendMutation = useMutation({
        mutationFn: (data: { userId: string; content: string }) =>
            adminAPI.sendAdminMessage(data.userId, data.content),
        onSuccess: () => {
            toast({
                title: "Official Command Sent",
                description: `Message sent to @${selectedUser?.username} successfully.`,
            });
            setMessageContent("");
        },
        onError: (error: any) => {
            toast({
                title: "Deployment Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleSendMessage = () => {
        if (!selectedUser || !messageContent.trim()) return;
        sendMutation.mutate({
            userId: selectedUser.id,
            content: messageContent,
        });
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20">
                        <ShieldAlert className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white uppercase italic">System Command Center</h1>
                        <p className="text-muted-foreground text-sm font-medium uppercase tracking-widest opacity-60">High-Priority Protocol Dispatch</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Selector */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-6 h-full min-h-[500px] flex flex-col">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Identify Target</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40" />
                                <Input
                                    placeholder="Search users..."
                                    className="pl-10 h-11 bg-black/40 border-white/5 rounded-xl focus:border-red-500/50 transition-all font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
                            <AnimatePresence mode="popLayout">
                                {isSearching ? (
                                    <div className="flex flex-col gap-2">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                                        ))}
                                    </div>
                                ) : searchResults?.users?.length ? (
                                    searchResults.users.map((user: any) => (
                                        <motion.button
                                            key={user.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            onClick={() => setSelectedUser(user)}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-3 rounded-xl transition-all border group text-left",
                                                selectedUser?.id === user.id
                                                    ? "bg-red-500/10 border-red-500/30 ring-1 ring-red-500/20"
                                                    : "bg-white/[0.02] border-white/5 hover:bg-white/5 hover:border-white/10"
                                            )}
                                        >
                                            <img
                                                src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                                className="h-10 w-10 rounded-lg grayscale group-hover:grayscale-0 transition-all"
                                                alt=""
                                            />
                                            <div className="text-left overflow-hidden">
                                                <div className="text-sm font-bold text-white leading-none mb-1 truncate">{user.username}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-tighter truncate">{user.id.substring(0, 12)}...</div>
                                            </div>
                                            {selectedUser?.id === user.id && (
                                                <div className="ml-auto">
                                                    <div className="h-2 w-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                                </div>
                                            )}
                                        </motion.button>
                                    ))
                                ) : searchQuery ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/40 gap-2">
                                        <AlertCircle className="h-8 w-8" />
                                        <span className="text-sm font-bold">No Entities Found</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground/20 gap-2">
                                        <MessageSquare className="h-12 w-12" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Enter query to list subjects</span>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Dispatch Interface */}
                <div className="lg:col-span-2">
                    <div className="bg-white/[0.03] border border-white/10 rounded-3xl h-full flex flex-col overflow-hidden min-h-[500px]">
                        {selectedUser ? (
                            <>
                                {/* Header */}
                                <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={selectedUser.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`}
                                                className="h-12 w-12 rounded-2xl border-2 border-red-500/20"
                                                alt=""
                                            />
                                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-[#050505] rounded-full" />
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-white leading-tight">Protocol: Dispatch to @{selectedUser.username}</div>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge variant="outline" className="text-[9px] h-4 bg-red-500/10 text-red-500 border-red-500/20 font-black uppercase tracking-[0.1em]">Target Lvl {selectedUser.level || 1}</Badge>
                                                <span className="text-[10px] text-muted-foreground font-mono opacity-50 uppercase tracking-tighter">Authorized Dispatch Only</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-black text-red-500/60 uppercase tracking-widest mb-1 leading-none">High Encryption</div>
                                        <div className="text-xs font-mono text-muted-foreground px-2 py-1 bg-black/40 rounded border border-white/5 leading-none">SYSTEM.ADMIN.CHANNEL</div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-8 space-y-6">
                                    <div className="relative">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-red-500/60 ml-1 mb-2 block">Command Content</label>
                                        <Textarea
                                            placeholder="Enter message for user. This will be visible in their chat with high-priority status."
                                            className="min-h-[250px] bg-black/40 border-white/5 rounded-2xl focus:border-red-500/50 p-6 text-lg font-medium resize-none leading-relaxed"
                                            value={messageContent}
                                            onChange={(e) => setMessageContent(e.target.value)}
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-muted-foreground/30">
                                            {messageContent.length} / 8000
                                        </div>
                                    </div>

                                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl flex items-start gap-4">
                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                                        <div className="space-y-1">
                                            <p className="text-xs font-bold text-red-400">WARNING: OFFICIAL COMMAND BROADCAST</p>
                                            <p className="text-[11px] text-red-400/60 leading-relaxed font-medium">
                                                Dispatched messages appear with a system-level red gradient and "Official Command" badge. Use this for warnings, official announcements, or direct staff-to-user directives.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                                    <div className="hidden sm:flex items-center gap-4 text-muted-foreground/40">
                                        <div className="flex items-center gap-1.5">
                                            <ShieldAlert className="h-3.5 w-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Protocol V4</span>
                                        </div>
                                        <div className="h-3 w-px bg-white/10" />
                                        <div className="flex items-center gap-1.5 text-green-500/40">
                                            <div className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Buffer Ready</span>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!messageContent.trim() || sendMutation.isPending}
                                        className="bg-red-600 hover:bg-red-700 text-white font-black px-8 h-12 rounded-xl shadow-[0_10px_30px_rgba(220,38,38,0.3)] group ml-auto sm:ml-0 w-full sm:w-auto"
                                    >
                                        {sendMutation.isPending ? (
                                            "DISPATCHING PROTOCOL..."
                                        ) : (
                                            <>
                                                DISPATCH COMMAND
                                                <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                                <div className="h-24 w-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center text-muted-foreground/10">
                                    <ShieldAlert className="h-12 w-12" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold text-white/40 italic uppercase">Subject Pending identification</h3>
                                    <p className="text-sm text-white/20 max-w-xs mx-auto font-medium">
                                        Search and select a target user to initialize command dispatch interface.
                                    </p>
                                </div>
                                <div className="pt-4 flex gap-2">
                                    <div className="h-1 w-8 bg-white/5 rounded-full" />
                                    <div className="h-1 w-8 bg-white/5 rounded-full" />
                                    <div className="h-1 w-8 bg-white/5 rounded-full" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
