
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Flag, Trophy, Users, Activity, AlertTriangle, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SeoMeta";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: adminAPI.getDashboard,
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground mr-2" /> Loading Dashboard Stats...</div>;

    const metrics = dashboardData?.metrics || {};

    const submissionData = [
        { name: 'Accepted', value: Math.round((metrics.submissionSuccessRate || 0) * (metrics.totalSubmissions || 1)), color: '#10b981' },
        { name: 'Pending/Failed', value: (metrics.totalSubmissions || 0) - Math.round((metrics.submissionSuccessRate || 0) * (metrics.totalSubmissions || 0)), color: '#ef4444' },
    ];



    return (
        <div className="space-y-8">
            <SEO title="Admin Console" name="CodeStudio Admin" type="admin" />

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Command Center</h1>
                    <p className="text-muted-foreground">Real-time platform overview and system metrics.</p>
                </div>
                <div className="flex items-center gap-2 p-1 px-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Deep Scan Active</span>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* ... existing cards (keeping them but maybe refining) ... */}
                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold opacity-70">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black">{metrics.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">{metrics.activeUsersToday || 0} active today</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold opacity-70">Live Contests</CardTitle>
                        <Trophy className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{metrics.liveContests || 0}</div>
                        <p className="text-xs text-muted-foreground font-medium">{metrics.totalContests || 0} total contests</p>
                    </CardContent>
                </Card>

                <Link to="/admin/flags">
                    <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-border/50 shadow-sm transition-all hover:shadow-md hover:border-amber-500/50 cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-bold opacity-70">Flagged Items</CardTitle>
                            <Flag className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.flaggedSubmissions || 0}</div>
                            <p className="text-xs text-amber-500 font-bold uppercase tracking-tighter">Requires Action</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-border/50 shadow-sm transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-bold opacity-70">Submissions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {metrics.totalSubmissions ? metrics.totalSubmissions.toLocaleString() : 0}
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">{metrics.pendingSubmissions || 0} currently processing</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Activity className="h-4 w-4 text-blue-500" />
                            Engagement Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Users', val: metrics.totalUsers },
                                { name: 'Snippets', val: metrics.totalSnippets },
                                { name: 'Subs', val: metrics.totalSubmissions },
                                { name: 'Flags', val: metrics.flaggedSubmissions },
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <RechartsTooltip />
                                <Bar dataKey="val" fill="currentColor" className="fill-primary" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Zap className="h-4 w-4 text-emerald-500" />
                            Success Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[250px] flex flex-col items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={submissionData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {submissionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-2xl font-black">{Math.round((metrics.submissionSuccessRate || 0) * 100)}%</p>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">Global Pass</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Analytics Section */}
            <AnalyticsSection />
        </div>
    );
}

function AnalyticsSection() {
    const { data: topSnippets } = useQuery({
        queryKey: ['admin-top-snippets'],
        queryFn: () => adminAPI.getTopSnippets(5),
    });

    const { data: suspicious } = useQuery({
        queryKey: ['admin-suspicious'],
        queryFn: adminAPI.getSuspiciousActivity,
    });

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        Top Viewed Snippets
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {topSnippets?.snippets?.map((snippet: any) => (
                            <div key={snippet.id} className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium truncate max-w-[200px]">{snippet.title}</p>
                                    <p className="text-xs text-muted-foreground">by {snippet.author?.name || 'Anonymous'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-sm">{snippet.viewsCount} views</p>
                                </div>
                            </div>
                        ))}
                        {(!topSnippets?.snippets || topSnippets.snippets.length === 0) && (
                            <p className="text-sm text-muted-foreground">No data available</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Suspicious Activity
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold mb-2">High Copy Volume</h4>
                            <div className="space-y-2">
                                {suspicious?.highCopySnippets?.map((snippet: any) => (
                                    <div key={snippet.id} className="flex justify-between items-center text-sm">
                                        <span className="truncate max-w-[200px]">{snippet.title}</span>
                                        <span className="font-mono text-red-500">{snippet.copyCount} copies</span>
                                    </div>
                                ))}
                                {(!suspicious?.highCopySnippets || suspicious.highCopySnippets.length === 0) && (
                                    <p className="text-xs text-muted-foreground">No high copy activity</p>
                                )}
                            </div>
                        </div>

                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
