"use client";

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard, Activity, TrendingUp,
    MessageSquare, Settings, ShieldCheck, Sparkles, Heart
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { snippetsAPI, usersAPI } from "@/lib/api";
import { SnippetCard } from "@/components/SnippetCard";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from "framer-motion";

const data = [
    { name: 'Mon', visits: 4000, engagement: 2400 },
    { name: 'Tue', visits: 3000, engagement: 1398 },
    { name: 'Wed', visits: 2000, engagement: 9800 },
    { name: 'Thu', visits: 2780, engagement: 3908 },
    { name: 'Fri', visits: 1890, engagement: 4800 },
    { name: 'Sat', visits: 2390, engagement: 3800 },
    { name: 'Sun', visits: 3490, engagement: 4300 },
];

interface Snippet {
    id: string;
    title: string;
    description: string;
    language: string;
    code: string;
    author: {
        id: string;
        username: string;
        image?: string;
    };
    likes: number;
    comments: number;
    createdAt: string;
}

export default function Dashboard() {
    const { user } = useAuth();
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [loading, setLoading] = useState(true);

    const [stats, setStats] = useState<any>({ snippets: 0, chart: [] });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [snippetsData, statsData] = await Promise.all([
                    snippetsAPI.getAll(),
                    usersAPI.getStats()
                ]);
                setSnippets(snippetsData.snippets.slice(0, 3));
                setStats(statsData);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { label: "Total Snippets", value: stats.snippets || 0, delta: "", icon: LayoutDashboard, color: "text-blue-400" },
        // { label: "Total Reach", value: stats.reach, delta: "+12.5%", icon: Eye, color: "text-blue-400" },
        // { label: "Engagement", value: stats.engagement, delta: "+5.2%", icon: Activity, color: "text-purple-400" },
        // { label: "Followers", value: stats.followers, delta: "+2.1%", icon: Users, color: "text-pink-400" },
    ];

    return (
        <div className="h-[calc(100vh-6rem)] overflow-hidden grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-0">
            {/* Left Column - Scrollable Main Content */}
            <div className="overflow-y-auto pr-4 lg:pr-8 space-y-8 pb-20 scrollbar-hide">

                {/* Header Section */}
                <div className="flex flex-col gap-2 pt-2">
                    <h1 className="text-3xl font-black font-headline tracking-tighter uppercase italic flex items-center gap-3">
                        <LayoutDashboard className="h-8 w-8 text-primary" /> Command Center
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Welcome back, <span className="text-primary font-bold">@{user?.username}</span>. Your nexus performance is nominal.
                    </p>
                </div>

                {/* Insights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="border-none bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors shadow-lg">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`p-3 rounded-xl bg-white/5 ${stat.color}`}>
                                            <stat.icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-green-400 text-xs font-black bg-green-500/10 px-2 py-1 rounded-full">{stat.delta}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">{stat.label}</p>
                                        <h3 className="text-3xl font-black font-headline text-white">{stat.value}</h3>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Charts Area */}
                <Card className="border-none bg-white/5 backdrop-blur-md shadow-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                        <TrendingUp className="h-32 w-32 text-primary rotate-12" />
                    </div>
                    <CardHeader>
                        <CardTitle className="font-headline text-xl">Nexus Traffic</CardTitle>
                        <CardDescription>Visualizing your profile interactions over time.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats.chart.length ? stats.chart : data}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                                />
                                <Area type="monotone" dataKey="visits" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorVisits)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" /> Live Feed
                        </h2>
                        <Button variant="ghost" className="text-primary text-xs font-black uppercase tracking-widest">View All Scans</Button>
                    </div>
                    <div className="grid gap-6">
                        {loading ? (
                            [1, 2].map(i => <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />)
                        ) : (
                            snippets.map(snippet => <SnippetCard key={snippet.id} snippet={snippet} />)
                        )}
                    </div>
                </div>
            </div>

            {/* Right Column - Sticky Sidebar / Independent Scroll */}
            <div className="hidden xl:block overflow-y-auto pl-8 pb-20 scrollbar-hide border-l border-white/5 h-full">
                <div className="space-y-8 sticky top-0">

                    {/* Professional Status */}
                    <Card className="border-none bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl overflow-hidden relative group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                        <CardHeader className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                                    <ShieldCheck className="h-6 w-6 text-white" />
                                </div>
                                <Button size="sm" variant="ghost" className="h-8 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase">
                                    Upgrade
                                </Button>
                            </div>
                            <CardTitle className="font-headline text-2xl italic">Pro Status</CardTitle>
                            <CardDescription className="text-indigo-100/80 font-medium">Your nexus is operating at maximum efficiency.</CardDescription>
                        </CardHeader>
                        <CardContent className="relative z-10 pt-0">
                            <div className="space-y-3 mt-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Bandwidth</span>
                                        <span className="text-indigo-200">82%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-[82%]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span>Storage</span>
                                        <span className="text-indigo-200">45%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-white w-[45%]" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tools */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Tools & Resources</h3>

                        <Link to="/settings" className="block">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all group cursor-pointer">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                    <Settings className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">Configuration</h4>
                                    <p className="text-xs text-muted-foreground">Manage your nexus settings</p>
                                </div>
                            </div>
                        </Link>



                        <Link to="/chat" className="block">
                            <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/20 transition-all group cursor-pointer">
                                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition-transform">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-sm text-white group-hover:text-primary transition-colors">Direct Link</h4>
                                    <p className="text-xs text-muted-foreground">Encrypted comms channel</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Support */}
                    <Card className="border-dashed bg-white/5 border-2 border-white/10">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                                <Heart className="h-6 w-6 text-red-500 animate-pulse" />
                            </div>
                            <h4 className="font-bold text-sm mb-1 italic">Creator Support</h4>
                            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">Your contributions keep the nexus online and glitch-free.</p>
                            <Button variant="outline" size="sm" className="w-full rounded-xl text-[10px] font-black uppercase tracking-widest border-red-500/20 text-red-500 hover:bg-red-500/10">
                                Send Credits
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 border border-cyan-500/20">
                        <div className="flex items-start gap-4">
                            <Sparkles className="h-5 w-5 text-cyan-400 mt-1" />
                            <div>
                                <h4 className="font-bold text-sm text-cyan-400 mb-1">Tip of the Day</h4>
                                <p className="text-xs text-cyan-200/70 leading-relaxed">
                                    Use <code className="bg-black/30 px-1 rounded text-white">Cmd+K</code> to open the command palette from anywhere in the app.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
