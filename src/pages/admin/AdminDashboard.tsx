
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Flag, Trophy, Users, Activity, AlertTriangle, FileCode, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import SEO from "@/components/SeoMeta";

export default function AdminDashboard() {
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: adminAPI.getDashboard,
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>;

    const metrics = dashboardData?.metrics || {};

    return (
        <div className="space-y-8">
            <SEO title="Admin Dashboard" name="CodeStudio Admin" type="admin" />
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Dashboard</h1>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">{metrics.activeUsersToday || 0} active today</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Live Contests</CardTitle>
                        <Trophy className="h-4 w-4 text-indigo-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-indigo-600">{metrics.liveContests || 0}</div>
                        <p className="text-xs text-muted-foreground">{metrics.totalContests || 0} total contests</p>
                    </CardContent>
                </Card>

                <Link to="/admin/flags">
                    <Card className="hover:border-amber-300 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Flagged Submissions</CardTitle>
                            <Flag className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{metrics.flaggedSubmissions || 0}</div>
                            <p className="text-xs text-muted-foreground">Requires review</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalSubmissions || 0}</div>
                        <p className="text-xs text-muted-foreground">{metrics.pendingSubmissions || 0} pending</p>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid gap-4 md:grid-cols-3">
                <Link to="/admin/users">
                    <Card className="hover:border-red-300 transition-colors cursor-pointer">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Low Trust Users</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{metrics.lowTrustUsers || 0}</div>
                            <p className="text-xs text-muted-foreground">Trust score &lt; 50</p>
                        </CardContent>
                    </Card>
                </Link>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Snippets</CardTitle>
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.totalSnippets || 0}</div>
                        <p className="text-xs text-muted-foreground">Code snippets shared</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Suspended Users</CardTitle>
                        <ShieldAlert className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{metrics.suspendedUsers || 0}</div>
                        <p className="text-xs text-muted-foreground">Currently blocked</p>
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
                                    <p className="text-xs text-muted-foreground">{snippet.forkCount} forks</p>
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
                        <div>
                            <h4 className="text-sm font-bold mb-2">High Fork Volume</h4>
                            <div className="space-y-2">
                                {suspicious?.highForkSnippets?.map((snippet: any) => (
                                    <div key={snippet.id} className="flex justify-between items-center text-sm">
                                        <span className="truncate max-w-[200px]">{snippet.title}</span>
                                        <span className="font-mono text-orange-500">{snippet.forkCount} forks</span>
                                    </div>
                                ))}
                                {(!suspicious?.highForkSnippets || suspicious.highForkSnippets.length === 0) && (
                                    <p className="text-xs text-muted-foreground">No high fork activity</p>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
