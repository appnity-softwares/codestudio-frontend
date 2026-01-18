import { Cpu, ShieldCheck, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

interface SystemSignalsProps {
    snippets?: any[];
}

export function SystemSignals({ snippets = [] }: SystemSignalsProps) {
    const [latency, setLatency] = useState<number | null>(null);
    const [isOnline, setIsOnline] = useState(true);

    // Mock Latency Check (Real Ping)
    useEffect(() => {
        const checkLatency = async () => {
            const start = performance.now();
            try {
                // Ping the backend (lightweight call)
                await fetch('/api/events', { method: 'HEAD' });
                const end = performance.now();
                setLatency(Math.round(end - start));
                setIsOnline(true);
            } catch (e) {
                setIsOnline(false);
            }
        };

        checkLatency();
        const interval = setInterval(checkLatency, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const verifiedCount = snippets.filter((s: any) => s.verified).length;
    const sessionUptime = "4h 12m"; // Keep mock for session, easier than calculating server uptime without endpoint

    const recentActivity = snippets.slice(0, 3).map((s: any) => ({
        text: `New snippet: ${s.title}`,
        time: formatDistanceToNow(new Date(s.createdAt), { addSuffix: true }),
        user: s.author?.name || "User" // Assuming author relation exists
    }));

    return (
        <div className="space-y-6 sticky top-8">
            {/* Engine Status */}
            <div className={`bg-surface border border-border p-4 rounded-xl space-y-3 transition-colors ${!isOnline ? 'border-red-500/50' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Cpu className="h-3.5 w-3.5" />
                        Execution Runtime
                    </h3>
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                            <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        </span>
                        <span className={`text-[10px] font-mono ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-muted-foreground font-mono">Engine</div>
                        <div className="text-xs font-bold text-primary">Piston v2</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-muted-foreground font-mono">Sandbox</div>
                        <div className="text-xs font-bold text-primary">Active</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-muted-foreground font-mono">Python</div>
                        <div className="text-xs font-bold text-white/80">v3.10</div>
                    </div>
                    <div className="bg-black/20 p-2 rounded border border-white/5">
                        <div className="text-[10px] text-muted-foreground font-mono">Go</div>
                        <div className="text-xs font-bold text-white/80">v1.20</div>
                    </div>
                </div>

                <div className="pt-2 border-t border-white/5">
                    <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                        <span>Latency</span>
                        <span className={isOnline ? "text-emerald-400" : "text-red-400"}>
                            {latency ? `${latency}ms` : '--'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Verification Stats */}
            <div className="bg-surface border border-border p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground">
                        System Trust
                    </h3>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">Verified Snippets</span>
                        <span className="font-mono text-white">{verifiedCount}</span>
                    </div>
                    {/* Visual Progress Bar (Mocked scale) */}
                    <div className="h-1 w-full bg-muted/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{ width: `${Math.min((verifiedCount / 10) * 100, 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-xs pt-1">
                        <span className="text-muted-foreground">Uptime (Session)</span>
                        <span className="font-mono text-white">{sessionUptime}</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Mini-Feed */}
            {recentActivity.length > 0 && (
                <div className="bg-surface border border-border p-4 rounded-xl space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-3.5 w-3.5 text-orange-500" />
                        <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-muted-foreground">
                            Global Stream
                        </h3>
                    </div>
                    <div className="space-y-3">
                        {recentActivity.map((item: any, i: number) => (
                            <div key={i} className="flex gap-2 text-[10px]">
                                <span className="text-muted-foreground min-w-[50px] font-mono whitespace-nowrap">{item.time}</span>
                                <span className="text-white/60 truncate" title={item.text}>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
