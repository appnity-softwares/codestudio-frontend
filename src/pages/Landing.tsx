import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    ArrowRight,
    Users,
    Trophy,
    Globe,
    TrendingUp,
    ShieldAlert,
    Info,
    Command,
    Cpu,
    GitBranch,
    Binary,
    Activity,
    MessageSquare,
    Hash,
    Heart
} from "lucide-react";
import { Seo } from "@/components/Seo";
import { useQuery, useMutation } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";
import { ChangelogSection } from "@/components/ChangelogSection";
import { Logo } from "@/components/ui/Logo";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LandingNavbar } from "@/components/layout/LandingNavbar";

export default function Landing() {
    const { isAuthenticated } = useAuth();
    const { toast } = useToast();
    const [isAppealOpen, setIsAppealOpen] = useState(false);
    const [appealForm, setAppealForm] = useState({ email: "", username: "", reason: "" });

    const { data: stats } = useQuery({
        queryKey: ["landing-stats"],
        queryFn: systemAPI.getLandingStats,
        staleTime: 5 * 60 * 1000,
    });

    const appealMutation = useMutation({
        mutationFn: systemAPI.submitAppeal,
        onSuccess: () => {
            toast({
                title: "Appeal Submitted",
                description: "Your suspension appeal has been sent to our moderators.",
            });
            setIsAppealOpen(false);
            setAppealForm({ email: "", username: "", reason: "" });
        },
        onError: (error: any) => {
            toast({
                title: "Submission Failed",
                description: error.message,
                variant: "destructive",
            });
        },
    });

    const handleAppealSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        appealMutation.mutate(appealForm);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-x-hidden">
            <Seo
                title="CodeStudio | The Social Platform for Developers"
                description="Connect with developers, share code snippets, participate in coding contests, and build your tech presence on CodeStudio. The ultimate developer community."
            />

            <LandingNavbar />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center pt-16 px-6 overflow-hidden">
                {/* Immersive Background Layer */}
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                    {/* Primary Glow */}
                    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-primary/20 blur-[160px] rounded-full opacity-40 animate-pulse duration-[8s]" />

                    {/* Floating Tech Orbs */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0.1, 0.3, 0.1],
                                scale: [1, 1.2, 1],
                                y: [-20, 20, -20],
                                x: [-20, 20, -20]
                            }}
                            transition={{
                                duration: 10 + i * 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 1.5
                            }}
                            className="absolute rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-3xl"
                            style={{
                                width: `${100 + i * 50}px`,
                                height: `${100 + i * 50}px`,
                                top: `${15 + i * 12}%`,
                                left: `${10 + i * 15}%`,
                            }}
                        />
                    ))}

                    {/* Technical Dot Grid */}
                    <div
                        className="absolute inset-0 opacity-[0.15]"
                        style={{
                            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)',
                            backgroundSize: '32px 32px'
                        }}
                    />

                    {/* Scanning Line Effect */}
                    <motion.div
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[2px] bg-primary/20 blur-sm z-0"
                    />

                    {/* Matrix-like subtle code lines falling (abstract) */}
                    <div className="absolute inset-0 opacity-[0.03] select-none pointer-events-none font-mono text-[8px] space-y-1 pt-20 px-10 overflow-hidden uppercase tracking-tighter">
                        {[...Array(50)].map((_, i) => (
                            <div key={i} className="whitespace-nowrap flex gap-4 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}>
                                <span className="text-primary/60">{`> 0x${Math.random().toString(16).slice(2, 6)}: INIT_SYS_SEQ_${i}`}</span>
                                <span className="text-white/40">{`MEM_LOC: ${Math.random().toString(16).slice(2, 10).toUpperCase()}`}</span>
                                <span className="text-primary/60">{`LOAD_FACTOR: 0.${Math.random().toString().slice(2, 4)}`}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="container max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center text-left">
                        <div>
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-10 shadow-2xl backdrop-blur-md"
                            >
                                <Activity className="h-3 w-3 animate-pulse" />
                                <span>Network Status: Optimal // 4.2k active nodes</span>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="relative"
                            >
                                <h1 className="text-5xl md:text-7xl font-black tracking-[-0.05em] text-white mb-8 leading-[0.85] uppercase">
                                    THE SOCIAL<br />
                                    <span className="relative inline-block mt-4">
                                        <span className="absolute -inset-2 bg-primary/30 blur-3xl opacity-50 rounded-full" />
                                        <span className="relative italic font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-white/10 animate-gradient-x">
                                            PLATFORM FOR<br />CODE.
                                        </span>
                                    </span>
                                </h1>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="text-sm md:text-base text-white/40 max-w-xl mb-12 leading-relaxed font-mono uppercase tracking-[0.2em]"
                            >
                                <span className="text-primary/60 font-black"># CODE_STUDIO_CONNECTED</span> <br />
                                The nexus for elite engineers to share, compete, and build together in a high-fidelity environment.
                            </motion.p>

                            <div className="flex flex-col sm:flex-row items-center gap-6 mb-12">
                                {isAuthenticated ? (
                                    <Link to="/feed">
                                        <Button size="lg" className="h-14 px-10 text-base bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-tighter shadow-[0_0_40px_rgba(var(--primary-rgb),0.3)] group overflow-hidden relative">
                                            <span className="relative z-10 flex items-center">
                                                OPEN CORE FEED <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link to="/auth/signup">
                                        <Button size="lg" className="h-14 px-10 text-base bg-white text-black hover:bg-white/90 font-black uppercase tracking-tighter group overflow-hidden relative">
                                            <span className="relative z-10 flex items-center">
                                                INITIALIZE ACCOUNT <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                                            </span>
                                        </Button>
                                    </Link>
                                )}
                                <Link to="/practice">
                                    <Button size="lg" variant="outline" className="h-14 px-10 text-base border-white/10 hover:bg-white/5 text-white/40 bg-white/[0.01] backdrop-blur-md font-mono transition-all hover:text-white group">
                                        ./run_arena
                                    </Button>
                                </Link>
                            </div>

                            {/* Social Proof */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex items-center gap-6"
                            >
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-12 w-12 rounded-2xl border-2 border-[#050505] bg-white/5 overflow-hidden backdrop-blur-xl ring-1 ring-white/10">
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i + 20}`} alt="user" />
                                        </div>
                                    ))}
                                    <div className="h-12 w-12 rounded-2xl border-2 border-[#050505] bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-[12px] font-black text-white backdrop-blur-xl shadow-xl">
                                        +10k
                                    </div>
                                </div>
                                <div className="text-[11px] font-mono text-white/30 uppercase tracking-[0.2em] leading-tight border-l border-white/10 pl-6">
                                    AUTHENTICATED BY <br />
                                    <span className="text-white/60 font-black tracking-[0.3em]">ELITE_ENGINEERS</span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Social Activity Preview Component */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 1.2, delay: 0.4 }}
                            className="hidden lg:block relative group p-1"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-purple-500/20 to-blue-500/20 rounded-[3rem] blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
                            <div className="relative bg-[#0c0c0e]/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden">
                                {/* Activity Ticker */}
                                <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Global Activity Hub</span>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <div className="h-3 w-3 rounded-full bg-white/5" />
                                        <div className="h-3 w-3 rounded-full bg-primary/20" />
                                        <div className="h-3 w-3 rounded-full bg-white/5" />
                                    </div>
                                </div>

                                {/* Placeholder Snippets */}
                                <div className="space-y-4 text-left mb-6">
                                    {[
                                        { user: "0xNeo", action: "shared a protocol", color: "text-primary" },
                                        { user: "cyber_ghost", action: "solved hard arena #42", color: "text-purple-400" },
                                        { user: "dev_zero", action: "posted technical breakdown", color: "text-blue-400" },
                                    ].map((act, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ x: 50, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 1 + i * 0.2 }}
                                            className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:bg-white/[0.05] transition-all hover:translate-x-2 cursor-pointer group/card"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                                                    <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${act.user}`} alt="avatar" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-black uppercase tracking-widest">@{act.user}</span>
                                                        <span className="text-[9px] font-mono text-white/20 italic">now</span>
                                                    </div>
                                                    <p className="text-[11px] text-white/60 mb-2 line-clamp-1">{act.action}</p>
                                                    <div className="flex items-center gap-4 text-[9px] font-mono text-white/20">
                                                        <span className="flex items-center gap-1 group-hover/card:text-primary transition-colors"><Heart className="h-3 w-3" /> 124</span>
                                                        <span className="flex items-center gap-1 group-hover/card:text-blue-400 transition-colors"><MessageSquare className="h-3 w-3" /> 12</span>
                                                        <span className="flex items-center gap-1 group-hover/card:text-purple-400 transition-colors"><Hash className="h-3 w-3" /> rust</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Floating Code Bubble - Below the cards, not absolute */}
                                <div className="bg-[#050505]/60 border border-white/10 p-4 rounded-2xl backdrop-blur-2xl text-left shadow-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        <div className="font-mono text-[10px] text-primary/80 font-black uppercase tracking-[0.2em]">LIVE_PROTOCOL</div>
                                    </div>
                                    <div className="font-mono text-[11px] text-white/90 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <span className="text-purple-400">await</span> <span className="text-primary">studio</span>.<span className="text-blue-400">initialize</span>(&#123;
                                        <br />
                                        &nbsp;&nbsp;<span className="text-white/40">mode:</span> <span className="text-emerald-400">'ULTRA_LOW_LATENCY'</span>
                                        <br />
                                        &#125;);
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Scroll Indicator */}
                    <button
                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 z-20 cursor-pointer hover:opacity-100 opacity-50 transition-opacity group"
                    >
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-[10px] font-mono text-white uppercase tracking-[0.4em] group-hover:text-primary transition-colors"
                        >
                            Explore_Core
                        </motion.span>
                        <motion.div
                            animate={{
                                height: [40, 0, 40],
                                background: ['rgba(var(--primary-rgb),0.5)', 'rgba(var(--primary-rgb),0)', 'rgba(var(--primary-rgb),0.5)']
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            className="w-[1px] bg-primary"
                        />
                    </button>
                </div>
            </section>

            {/* System Metadata Footer */}
            <div className="container max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="flex flex-wrap items-center justify-center gap-12 font-mono text-[9px] text-white/10 uppercase tracking-[0.3em] mb-16"
                >
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        CORE_LOAD: STABLE
                    </div>
                    <div className="flex items-center gap-2">
                        <Users className="h-3 w-3" />
                        PEER_NODES: 4,219 ONLINE
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3" />
                        CLOUD_SYNC: ACTIVE
                    </div>
                </motion.div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto pt-10 border-t border-white/5">
                    {[
                        { label: "active_peers", value: stats?.totalUsers ?? "...", icon: Cpu },
                        { label: "shared_protocols", value: stats?.totalSubmissions ?? "...", icon: Binary },
                        { label: "community_blobs", value: stats?.totalSnippets ?? "...", icon: Command },
                        { label: "live_arenas", value: stats?.totalContests ?? "...", icon: GitBranch },
                    ].map((stat, i) => (
                        <div key={i} className="text-left group cursor-crosshair">
                            <div className="flex items-center gap-2 mb-2">
                                <stat.icon className="h-4 w-4 text-primary opacity-40 group-hover:opacity-100 transition-opacity" />
                                <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">{stat.label}</div>
                            </div>
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stat.value}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-3xl font-black text-white group-hover:text-primary transition-colors font-mono"
                                >
                                    {stat.value}
                                    {typeof stat.value === 'number' && "+"}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-[#08080a] border-y border-white/5 mt-32">
                <div className="container max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-black mb-4 uppercase tracking-tighter italic font-mono">
                            <span className="text-primary">&lt;</span> system_capabilities <span className="text-primary">/&gt;</span>
                        </h2>
                        <p className="text-white/40 font-mono text-sm tracking-tighter uppercase">Compiling high-performance primitives for elite development.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Trophy}
                            title="Elite Contests"
                            description="Real-time algorithmic warfare. High-stakes competition with instant rating adjustments."
                            color="text-yellow-400"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Global Network"
                            description="Connect with top-tier talent. Engage in technical discourse and protocol exchange."
                            color="text-blue-400"
                        />
                        <FeatureCard
                            icon={() => <Logo showText={false} className="scale-125" />}
                            title="Instant Runtime"
                            description="Execution environment supporting 40+ protocols with sub-millisecond response times."
                            color="text-emerald-400"
                        />
                    </div>
                </div>
            </section>

            {/* Top Contestants / Rankings */}
            <section id="rankings" className="py-24 px-6 relative">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                        <div className="max-w-xl text-left">
                            <h2 className="text-3xl font-black mb-4 flex items-center gap-3 uppercase tracking-tighter">
                                <TrendingUp className="h-8 w-8 text-primary" />
                                Protocol Leaders
                            </h2>
                            <p className="text-white/40 text-lg">
                                The high-trust nodes shaping the architecture of our digital future.
                            </p>
                        </div>
                        <Link to="/community">
                            <Button variant="outline" className="border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">
                                Full Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {stats?.topContestants?.map((user: any, i: number) => (
                            <motion.div
                                key={user.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all"
                            >
                                <div className="absolute top-4 right-6 text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
                                    0{i + 1}
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img
                                            src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                            alt={user.name}
                                            className="h-16 w-16 rounded-2xl object-cover ring-2 ring-white/5 group-hover:ring-primary/40 transition-all shadow-2xl"
                                        />
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary shadow-lg">
                                            {user.trustScore}
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors uppercase tracking-tight">{user.name}</h3>
                                        <p className="text-sm text-white/40 font-mono tracking-tighter">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <div className="text-white/40">Data Snippets</div>
                                    <div className="text-primary">{user.snippetCount ?? 0}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section >

            <ChangelogSection />

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 bg-[#08080a]">
                <div className="container max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
                        <div className="text-left">
                            <div className="flex items-center gap-2 mb-8">
                                <Logo />
                            </div>
                            <p className="text-sm text-white/30 leading-relaxed font-medium">
                                Building the future of technical collaboration. Elite tools for elite developers.
                            </p>
                        </div>
                        {["Platform", "Company", "Connect"].map((title, idx) => (
                            <div key={idx} className="text-left">
                                <h4 className="font-black uppercase tracking-[0.2em] text-[10px] text-primary mb-6">{title}</h4>
                                <ul className="space-y-3 text-sm font-bold text-white/30">
                                    {idx === 0 && <>
                                        <li><a href="#" className="hover:text-white transition-colors">Practice Arena</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Neural Contests</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Data Snippets</a></li>
                                    </>}
                                    {idx === 1 && <>
                                        <li><a href="#" className="hover:text-white transition-colors">Manifesto</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Lab Journal</a></li>
                                        <li><a href="#" className="hover:text-white transition-colors">Terminal Support</a></li>
                                    </>}
                                    {idx === 2 && <>
                                        <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Globe className="h-4 w-4" /> Global Access</a></li>
                                        <li onClick={() => setIsAppealOpen(true)} className="cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
                                            <ShieldAlert className="h-4 w-4" /> Appeal protocol
                                        </li>
                                    </>}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        <div className="flex items-center gap-4">
                            <span>© 2026 CodeStudio Protocol</span>
                            <span className="h-1 w-1 rounded-full bg-white/10" />
                            <span>Encrypted at source</span>
                        </div>
                        <div className="flex gap-8">
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            <Dialog open={isAppealOpen} onOpenChange={setIsAppealOpen}>
                <DialogContent className="sm:max-w-[500px] bg-[#0c0c0e] border-white/10 text-white shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tighter">
                            <ShieldAlert className="h-5 w-5 text-red-500" />
                            Suspension Appeal Protocol
                        </DialogTitle>
                        <DialogDescription className="text-white/40 font-medium">
                            If your node has been restricted, provide telemetry details below for administrative review.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAppealSubmit} className="space-y-6 py-4">
                        <div className="space-y-4 text-left">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Identity Handle</Label>
                                    <Input
                                        id="username"
                                        placeholder="e.g. johndoe"
                                        className="bg-white/[0.03] border-white/5 focus:border-primary h-12 rounded-xl"
                                        value={appealForm.username}
                                        onChange={(e) => setAppealForm({ ...appealForm, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Registration Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        className="bg-white/[0.03] border-white/5 focus:border-primary h-12 rounded-xl"
                                        value={appealForm.email}
                                        onChange={(e) => setAppealForm({ ...appealForm, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="reason" className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Justification Logs</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Provide detailed context regarding your restriction event..."
                                    className="bg-white/[0.03] border-white/5 focus:border-primary min-h-[150px] resize-none rounded-2xl"
                                    value={appealForm.reason}
                                    onChange={(e) => setAppealForm({ ...appealForm, reason: e.target.value })}
                                    required
                                    minLength={20}
                                />
                                <p className="text-[10px] text-white/20 italic font-medium">
                                    Threshold: 20 characters minimum for human-in-the-loop review.
                                </p>
                            </div>
                        </div>

                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl flex items-start gap-3 text-left">
                            <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-[11px] text-primary/60 leading-relaxed font-bold">
                                Appeals are typically processed within 48-72 standard hours. Official dispatch will be sent to your registered node email.
                            </p>
                        </div>

                        <DialogFooter>
                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest h-14 rounded-2xl text-xs"
                                disabled={appealMutation.isPending}
                            >
                                {appealMutation.isPending ? "Transmitting Upstream..." : "Submit Appeal Request"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div >
    );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
    return (
        <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group hover:bg-white/[0.04] text-left">
            <div className={`h-16 w-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center mb-8 transition-transform group-hover:scale-110 group-hover:bg-primary/10 ${color}`}>
                <Icon className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black mb-4 uppercase tracking-tighter italic font-mono">{title}</h3>
            <p className="text-white/40 leading-relaxed text-sm font-bold">
                {description}
            </p>
        </div>
    );
}
