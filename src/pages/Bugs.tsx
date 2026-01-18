"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bug, Plus, Filter, Search, ShieldCheck, AlertCircle, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bugsAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { BugComments } from "@/components/BugComments";

export default function Bugs() {
    const { data, isLoading } = useQuery({
        queryKey: ['bugs'],
        queryFn: bugsAPI.getAll
    });

    const bugs = data?.bugs || [];
    const [activeTab, setActiveTab] = useState("all");
    const [selectedBugId, setSelectedBugId] = useState<string | null>(null);

    const getSeverityColor = (severity: string) => {
        if (!severity) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        switch (severity.toLowerCase()) {
            case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        if (!status) return <AlertCircle className="h-4 w-4 text-orange-500" />;
        switch (status.toLowerCase()) {
            case 'open': return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case 'in_progress':
            case 'in progress': return <Clock className="h-4 w-4 text-blue-500" />;
            case 'resolved':
            case 'closed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            default: return <AlertCircle className="h-4 w-4 text-orange-500" />;
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div className="flex items-center gap-6">
                    <div className="p-5 rounded-[2rem] glass-premium border-red-500/20 shadow-huge animate-float">
                        <Bug className="h-10 w-10 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-5xl md:text-7xl font-black font-headline tracking-tighter text-white italic drop-shadow-huge">Anomaly Archive</h1>
                        <p className="text-white/40 font-black tracking-widest uppercase text-xs mt-2 italic">Nexus Debugging Protocol & Bounty Nexus</p>
                    </div>
                </div>
                <Button className="rounded-full bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest h-14 px-10 shadow-huge shadow-red-500/20 gap-3 hover:scale-105 active:scale-95 transition-all">
                    <Plus className="h-5 w-5" /> Initialize Report
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
                <div className="space-y-10">
                    <div className="flex gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                            <Input placeholder="Scan for anomalies..." className="pl-12 h-14 rounded-2xl glass-premium border-white/5 focus:border-primary/50 text-lg transition-all" />
                        </div>
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl glass-premium border-white/5 hover:bg-white/10 transition-all">
                            <Filter className="h-5 w-5" />
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-white/5 h-14 p-1.5 rounded-full border border-white/10 backdrop-blur-md">
                            <TabsTrigger value="all" className="rounded-full px-8 h-full data-[state=active]:bg-primary data-[state=active]:text-black font-black uppercase tracking-widest text-[10px] transition-all">All Protocols</TabsTrigger>
                            <TabsTrigger value="open" className="rounded-full px-8 h-full data-[state=active]:bg-red-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all">Active Threats</TabsTrigger>
                            <TabsTrigger value="resolved" className="rounded-full px-8 h-full data-[state=active]:bg-green-500 data-[state=active]:text-white font-black uppercase tracking-widest text-[10px] transition-all">Neutralized</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-6 mt-10">
                            {isLoading ? (
                                <div className="text-center py-20">
                                    <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20 mx-auto" />
                                </div>
                            ) : bugs.length === 0 ? (
                                <div className="text-center py-20 glass-premium rounded-[3rem] border-dashed border-white/10">
                                    <ShieldCheck className="h-16 w-16 text-white/10 mx-auto mb-6" />
                                    <h3 className="text-2xl font-headline font-black text-white italic">Clear Skies</h3>
                                    <p className="text-white/40 font-medium">No verified anomalies in this sector.</p>
                                </div>
                            ) : (
                                bugs.map((bug: any) => (
                                    <Card
                                        key={bug.id}
                                        className="group glass-premium hover:border-primary/30 transition-all duration-500 overflow-hidden border-none rounded-[2.5rem] shadow-huge cursor-pointer"
                                        onClick={() => setSelectedBugId(bug.id)}
                                    >
                                        <CardHeader className="p-8">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-white/5">
                                                        {getStatusIcon(bug.status)}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">{bug.status || 'OPEN'}</span>
                                                    {bug.severity && (
                                                        <Badge variant="outline" className={`${getSeverityColor(bug.severity)} rounded-full px-3 py-0.5 font-black uppercase text-[8px] tracking-widest`}>
                                                            {bug.severity}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-white/20 uppercase font-black tracking-widest bg-white/5 px-3 py-1 rounded-full">ID-{bug.id.slice(0, 8)}</span>
                                            </div>
                                            <CardTitle className="text-3xl font-black font-headline text-white group-hover:text-primary transition-colors italic tracking-tight">{bug.title}</CardTitle>
                                            <CardDescription className="text-white/60 text-lg mt-3 leading-relaxed">{bug.description}</CardDescription>
                                        </CardHeader>
                                        {bug.tags && bug.tags.length > 0 && (
                                            <div className="px-8 pb-6">
                                                <div className="flex flex-wrap gap-2">
                                                    {bug.tags.map((tag: string) => (
                                                        <span key={tag} className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary rounded-full border border-primary/20">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <CardFooter className="p-8 bg-white/5 border-t border-white/5 flex justify-between items-center group-hover:bg-white/[0.07] transition-colors">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-10 w-10 border-2 border-white/10 shadow-lg">
                                                    <AvatarImage src={bug.reporter?.image} />
                                                    <AvatarFallback className="bg-primary text-black font-black">{bug.reporter?.username?.[0].toUpperCase() || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-white italic">@{bug.reporter?.username || 'user'}</span>
                                                    <span className="text-[10px] text-white/30 font-black uppercase tracking-tighter">Initiator</span>
                                                </div>
                                            </div>
                                            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(bug.createdAt))}
                                            </span>
                                        </CardFooter>
                                    </Card>
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                <aside className="space-y-8">
                    <div className="glass-premium p-10 rounded-[3rem] border-white/5 shadow-huge relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all duration-1000" />
                        <h3 className="flex items-center gap-3 text-2xl font-black font-headline text-white italic mb-6">
                            <ShieldCheck className="h-7 w-7 text-primary" />
                            Bounty Ops
                        </h3>
                        <p className="text-white/50 text-sm leading-relaxed mb-8 italic">Acquire kinetic credits and legendary badges by neutralizing critical system threats.</p>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <span className="font-black text-xs uppercase tracking-widest text-red-500">Critical</span>
                                <span className="text-primary font-black italic text-xl">500 CR</span>
                            </div>
                            <div className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                                <span className="font-black text-xs uppercase tracking-widest text-orange-500">High Tier</span>
                                <span className="text-primary font-black italic text-xl">200 CR</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[3rem] bg-gradient-to-br from-red-500 via-red-600 to-orange-600 text-white shadow-huge shadow-red-500/20 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
                        <h3 className="font-black font-headline text-3xl italic mb-4 relative z-10">QA Division</h3>
                        <p className="text-sm text-white/80 leading-relaxed mb-8 italic relative z-10">Gain early vector access to experimental nexus modules by joining our specialized elite QA initiative.</p>
                        <Button className="w-full bg-white text-red-600 hover:bg-red-50 rounded-2xl h-14 font-black uppercase tracking-widest relative z-10 shadow-huge">
                            Enlist Now
                        </Button>
                    </div>
                </aside>
            </div>
            <Sheet open={!!selectedBugId} onOpenChange={(open) => !open && setSelectedBugId(null)}>
                <SheetContent
                    side="right"
                    className="w-full sm:max-w-md p-0 border-l border-white/10 bg-black/60 backdrop-blur-2xl shadow-2xl glass-sidebar"
                    style={{ zIndex: 1000 }}
                >
                    <div className="h-full flex flex-col relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none -ml-32 -mb-32" />

                        <div className="flex-1 relative z-10 overflow-hidden">
                            {selectedBugId && <BugComments bugId={selectedBugId} />}
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div >
    );
}
