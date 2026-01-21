import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, Users, Trophy, Zap, Globe, Sparkles, ChevronRight, TrendingUp } from "lucide-react";
import SEO from "@/components/SeoMeta";
import { useQuery } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";

export default function Landing() {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const { data: stats } = useQuery({
        queryKey: ["landing-stats"],
        queryFn: systemAPI.getLandingStats,
        staleTime: 5 * 60 * 1000,
    });

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate("/feed");
        }
    }, [isAuthenticated, navigate]);

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-x-hidden">
            <SEO
                title="CodeStudio - Master the Art of Coding"
                description="The ultimate platform for developers to compete, collaborate, and grow. Join thousands of coders in the arena."
            />
            {/* ... Navbar remains same ... */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
                <div className="container max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
                            <Code2 className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">CodeStudio</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/60">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#rankings" className="hover:text-white transition-colors">Rankings</a>
                        <a href="/practice" className="hover:text-white transition-colors">Practice</a>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/auth/signin">
                            <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/auth/signup">
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                                Get Started
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-30 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[100px] rounded-full opacity-20 pointer-events-none" />

                <div className="container max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8"
                    >
                        <Sparkles className="h-3 w-3" />
                        <span>v2.0 is now live</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]"
                    >
                        Master the Art of <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-pink-400">
                            Modern Coding
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed"
                    >
                        Join the world's most engaging developer platform. Compete in arenas,
                        showcase your snippets, and climb the global leaderboard.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Link to="/auth/signup">
                            <Button size="lg" className="h-12 px-8 text-base bg-white text-black hover:bg-white/90">
                                Join the Arena <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                        <Link to="/practice">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/10 hover:bg-white/5 text-white bg-transparent">
                                <Code2 className="mr-2 h-4 w-4" /> Enter Practice Arena
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Dynamic Stats */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mt-20 pt-10 border-t border-white/5"
                    >
                        {[
                            { label: "Active Developers", value: stats?.totalUsers ?? "..." },
                            { label: "Code Submissions", value: stats?.totalSubmissions ?? "..." },
                            { label: "Knowledge Snippets", value: stats?.totalSnippets ?? "..." },
                            { label: "Hosted Contests", value: stats?.totalContests ?? "..." },
                        ].map((stat, i) => (
                            <div key={i}>
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={stat.value}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-3xl font-bold text-white mb-1"
                                    >
                                        {stat.value}
                                        {typeof stat.value === 'number' && "+"}
                                    </motion.div>
                                </AnimatePresence>
                                <div className="text-sm text-white/40">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 px-6 bg-[#08080a] border-y border-white/5">
                <div className="container max-w-7xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">Everything you need to ship</h2>
                        <p className="text-white/40">From competitive programming to collaborative development, CodeStudio brings your coding experience to the next level.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={Trophy}
                            title="Competitive Arena"
                            description="Compete in real-time contests, earn rating points, and showcase your algorithmic mastery on the global leaderboard."
                            color="text-yellow-400"
                        />
                        <FeatureCard
                            icon={Users}
                            title="Developer Community"
                            description="Connect with like-minded developers, share code snippets, and build your professional network."
                            color="text-blue-400"
                        />
                        <FeatureCard
                            icon={Zap}
                            title="Real-time Execution"
                            description="Run code in 40+ languages instantly with our high-performance execution engine and advanced test cases."
                            color="text-emerald-400"
                        />
                    </div>
                </div>
            </section>

            {/* Top Contestants / Rankings */}
            <section id="rankings" className="py-24 px-6 relative">
                <div className="container max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-primary" />
                                Elite Rankings
                            </h2>
                            <p className="text-white/40 text-lg">
                                Meet the developers leading the pack. Our most trusted and active contributors shaping the future of CodeStudio.
                            </p>
                        </div>
                        <Link to="/community">
                            <Button variant="outline" className="border-white/10 hover:bg-white/5">
                                View Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
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
                                className="group relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 hover:border-primary/20 transition-all"
                            >
                                <div className="absolute top-4 right-6 text-4xl font-black text-white/5 group-hover:text-primary/10 transition-colors">
                                    0{i + 1}
                                </div>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img
                                            src={user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                                            alt={user.name}
                                            className="h-16 w-16 rounded-xl object-cover ring-2 ring-white/5 group-hover:ring-primary/40 transition-all"
                                        />
                                        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-[#050505] border border-white/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                            {user.trustScore}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{user.name}</h3>
                                        <p className="text-sm text-white/40">@{user.username}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-sm">
                                    <div className="text-white/40">Knowledge Snippets</div>
                                    <div className="font-mono text-primary">{user.snippetCount ?? 0}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Events / Ticker */}
            <section className="py-12 bg-primary/5 border-y border-primary/10">
                <div className="container max-w-7xl mx-auto px-6">
                    <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                        <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            Live Arena Feed
                        </div>
                        {stats?.upcomingEvents?.map((event: any) => (
                            <div key={event.id} className="flex items-center gap-4 group cursor-help">
                                <div className="text-sm border-l-2 border-white/10 pl-4 group-hover:border-primary transition-colors">
                                    <div className="font-bold text-white group-hover:text-primary transition-colors">{event.title}</div>
                                    <div className="text-xs text-white/30">{new Date(event.startTime).toLocaleDateString()} at {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </div>
                            </div>
                        ))}
                        {(!stats?.upcomingEvents || stats.upcomingEvents.length === 0) && (
                            <div className="text-white/40 text-sm font-medium">New challenges are arriving soon. Stay tuned.</div>
                        )}
                    </div>
                </div>
            </section>

            {/* Code Demo Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="container max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                            Build, Deploy, and <br />
                            <span className="text-primary">Scale Faster</span>
                        </h2>
                        <p className="text-lg text-white/40">
                            Our integrated development environment provides syntax highlighting, auto-completion, and instant feedback. Perfect for practicing algorithms or building full projects.
                        </p>

                        <div className="space-y-4">
                            {[
                                "Advanced Syntax Highlighting",
                                "Multi-language Support",
                                "Real-time Collaboration",
                                "Instant Deployment"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-3 text-white/70">
                                    <div className="h-6 w-6 rounded-full bg-white/5 flex items-center justify-center">
                                        <ChevronRight className="h-3 w-3 text-primary" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>

                        <Button className="mt-4" variant="outline">Learn more about IDE</Button>
                    </div>

                    <div className="flex-1 w-full relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-xl blur opacity-30" />
                        <div className="relative bg-[#0c0c0e] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                                <div className="flex gap-1.5">
                                    <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                                    <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50" />
                                </div>
                                <div className="ml-4 text-xs text-white/30 font-mono">solution.py</div>
                            </div>
                            <div className="p-6 font-mono text-sm leading-relaxed overflow-x-auto">
                                <div className="text-white/50"># Solve Two Sum Problem</div>
                                <div className="mt-2 text-purple-400">def <span className="text-blue-400">two_sum</span>(nums, target):</div>
                                <div className="pl-4 text-white/80">seen = { }</div>
                                <div className="pl-4 mt-1 text-purple-400">for <span className="text-white/80">i, num</span> <span className="text-purple-400">in</span> <span className="text-blue-400">enumerate</span>(nums):</div>
                                <div className="pl-8 text-white/80">complement = target - num</div>
                                <div className="pl-8 mt-1 text-purple-400">if <span className="text-white/80">complement</span> <span className="text-purple-400">in</span> <span className="text-white/80">seen:</span></div>
                                <div className="pl-12 text-purple-400">return <span className="text-white/80">[seen[complement], i]</span></div>
                                <div className="pl-8 text-white/80">seen[num] = i</div>
                                <div className="pl-4 text-purple-400">return <span className="text-orange-400">[]</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5 bg-[#08080a]">
                <div className="container max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <div className="h-6 w-6 rounded bg-primary/20 flex items-center justify-center">
                                    <Code2 className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="font-bold">CodeStudio</span>
                            </div>
                            <p className="text-sm text-white/40">
                                Empowering developers worldwide to build better software through collaboration.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Platform</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><a href="#" className="hover:text-white transition-colors">Practice Arena</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contests</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Snippets</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Leaderboard</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-white/40">
                                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold mb-4">Connect</h4>
                            <div className="flex gap-4">
                                <a href="#" className="text-white/40 hover:text-white transition-colors"><Globe className="h-5 w-5" /></a>
                                <a href="#" className="text-white/40 hover:text-white transition-colors"><Zap className="h-5 w-5" /></a>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
                        <div>© 2026 CodeStudio by Appnity. All rights reserved.</div>
                        <div className="flex gap-6">
                            <a href="#" className="hover:text-white">Privacy</a>
                            <a href="#" className="hover:text-white">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, title, description, color }: any) {
    return (
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all hover:bg-white/[0.04]">
            <div className={`h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-white/50 leading-relaxed">
                {description}
            </p>
        </div>
    );
}
