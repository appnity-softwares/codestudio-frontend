import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog";
import {
    CheckCircle, Trophy, Code2, Sword, Star, HelpCircle, ArrowLeft,
    Monitor, Layout, Zap, Gift, Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

const HELP_SECTIONS = [
    { id: "getting-started", label: "Getting Started", icon: Zap },
    { id: "xp-system", label: "XP & Leveling", icon: Star },
    { id: "snippets", label: "Logic Blocks", icon: Code2 },
    { id: "arena", label: "The Arena", icon: Sword },
    { id: "quests", label: "Daily Quests", icon: Gift },
    { id: "trophy-room", label: "Trophy Room", icon: Trophy },
    { id: "authority", label: "Authority & Ranks", icon: CheckCircle },
    { id: "faq", label: "FAQ", icon: HelpCircle },
];

export default function Help() {
    const navigate = useNavigate();
    const userXP = useSelector((state: RootState) => state.user.xp) || 0;
    const userLevel = useSelector((state: RootState) => state.user.level) || 1;

    // Calculate level progress
    const currentLevelThreshold = LEVEL_THRESHOLDS[userLevel - 1] || 0;
    const nextLevelThreshold = LEVEL_THRESHOLDS[userLevel] || (userLevel * 1000);
    const progress = Math.min(100, Math.max(0, ((userXP - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100));

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-xl">
                <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/feed')}
                            className="text-muted-foreground hover:text-foreground gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Platform
                        </Button>
                        <div className="h-4 w-px bg-border mx-2" />
                        <span className="font-bold text-sm tracking-wide uppercase text-primary/80">System Manual v2.1</span>
                    </div>
                </div>
            </div>

            <div className="container max-w-6xl mx-auto py-12 px-4 animate-in fade-in duration-500">
                {/* Hero Header */}
                <div className="mb-16 text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-7xl font-black tracking-tight font-headline text-balance">
                        Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Ecosystem</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                        Your comprehensive guide to navigating CodeStudio, earning reputation, and dominating the arena.
                    </p>
                </div>

                {/* Quick Shortcuts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {HELP_SECTIONS.slice(0, 4).map((item) => (
                        <a
                            key={item.label}
                            href={`#${item.id}`}
                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-center gap-3 text-center"
                        >
                            <div className="p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <item.icon className="h-6 w-6 text-primary" />
                            </div>
                            <span className="font-bold text-sm">{item.label}</span>
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Sticky Navigation */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 space-y-1">
                            {HELP_SECTIONS.map((section) => (
                                <a
                                    key={section.id}
                                    href={`#${section.id}`}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-transparent hover:border-border group"
                                >
                                    <section.icon className="h-4 w-4 opacity-50 group-hover:opacity-100 group-hover:text-primary transition-all" />
                                    {section.label}
                                </a>
                            ))}
                            <div className="pt-8 px-4">
                                <Card className="bg-primary/5 border-primary/20 p-5 rounded-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform">
                                        <Gift className="h-10 w-10 text-primary" />
                                    </div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-primary mb-2 flex items-center gap-2">
                                        <Sparkles className="h-3 w-3" /> Contributor Status
                                    </h4>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                                        Top 10% architects each month receive the 'Elite' badge and 2x XP multipliers for 30 days.
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-9 space-y-24 pb-32">
                        {/* Getting Started */}
                        <section id="getting-started" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <Zap className="h-6 w-6 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">The Architect's Journey</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p>
                                    Welcome to <span className="text-foreground font-bold font-headline italic tracking-tighter">CodeStudio</span>, a specialized nexus designed for logic architects and software engineers to share, compete, and evolve. Unlike traditional social platforms, everything here is centered around <strong>executable logic</strong> and <strong>verified performance</strong>.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-card/50">
                                        <h4 className="text-foreground font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[10px]">1</div>
                                            Build
                                        </h4>
                                        <p className="text-sm">Create Snippets (Logic Blocks) using our multi-runtime editor. Use React for UI components or Python/Go for pure logic.</p>
                                    </div>
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-card/50">
                                        <h4 className="text-foreground font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[10px]">2</div>
                                            Verify
                                        </h4>
                                        <p className="text-sm">Run your code against real inputs using the Piston Execution engine. Visual components get live previews.</p>
                                    </div>
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-card/50">
                                        <h4 className="text-foreground font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[10px]">3</div>
                                            Compete
                                        </h4>
                                        <p className="text-sm">Enter the Arena to solve algorithmic challenges under time pressure and climb the global ladder.</p>
                                    </div>
                                    <div className="space-y-2 p-4 rounded-xl border border-border bg-card/50">
                                        <h4 className="text-foreground font-black uppercase text-xs tracking-widest italic flex items-center gap-2">
                                            <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[10px]">4</div>
                                            Rank Up
                                        </h4>
                                        <p className="text-sm">Earn XP and Authority Rank to unlock premium customization like Auras and exclusive 3D artifacts.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* XP & Leveling Logic Section */}
                        <section id="xp-system" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10">
                                    <Star className="h-6 w-6 text-cyan-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">XP & Leveling Architecture</h2>
                            </div>

                            <Card className="bg-gradient-to-br from-card to-muted/20 border-border overflow-hidden ring-1 ring-primary/20">
                                <CardContent className="p-0">
                                    <div className="p-6 border-b border-border bg-primary/5">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold">Nexus Synchronization</h3>
                                                <p className="text-sm text-muted-foreground">Level {userLevel} • {userXP} Accumulated XP</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Next Burst</span>
                                                <p className="font-headline italic text-2xl font-black text-primary">{nextLevelThreshold} <span className="text-xs">XP</span></p>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-4 w-full bg-muted/50 rounded-full overflow-hidden p-0.5 border border-border">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Current Rank: {userLevel < 5 ? 'NOVITIATE' : userLevel < 15 ? 'EXPLORER' : 'VANGUARD'}</span>
                                            <p className="text-xs font-black text-primary italic font-headline">{progress.toFixed(1)}%</p>
                                        </div>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="font-black flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                <Zap className="h-4 w-4 text-amber-500" />
                                                Synthesis (XP Income)
                                            </h4>
                                            <div className="space-y-2">
                                                {[
                                                    { action: "Logic Block Publication", xp: "+50", detail: "Per verified snippet" },
                                                    { action: "Verified Fork Reception", xp: "+25", detail: "When others build on your logic" },
                                                    { action: "Detailed Peer Review", xp: "+15", detail: "Constructive feedback on feed" },
                                                    { action: "Daily Check-in", xp: "+10", detail: "Resets every 24 hours" },
                                                    { action: "Arena Victory", xp: "50-500", detail: "Based on trial difficulty" },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-lg bg-surface/50 border border-border/40 group hover:border-primary/30 transition-colors">
                                                        <div>
                                                            <div className="text-sm font-bold">{item.action}</div>
                                                            <div className="text-[10px] text-muted-foreground">{item.detail}</div>
                                                        </div>
                                                        <Badge variant="secondary" className="font-black text-[10px] bg-primary/10 text-primary border-primary/20">{item.xp} XP</Badge>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-black flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                                <Trophy className="h-4 w-4 text-purple-500" />
                                                Evolution (Unlocks)
                                            </h4>
                                            <div className="space-y-3">
                                                {[
                                                    { level: 5, label: "Aura Modulation", detail: "Access to store Auras." },
                                                    { level: 10, label: "Vault Customization", detail: "Pin specific artifacts." },
                                                    { level: 25, label: "Authority override", detail: "Ability to self-nominate." },
                                                    { level: 50, label: "Grandmaster Status", detail: "Infinite customization." },
                                                ].map((item, idx) => (
                                                    <div key={idx} className={cn("flex items-start gap-4 p-3 rounded-xl border transition-all", userLevel >= item.level ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/5 border-border/50 opacity-60")}>
                                                        <div className={cn("shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs", userLevel >= item.level ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground")}>
                                                            {item.level}
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-bold flex items-center gap-2">
                                                                {item.label}
                                                                {userLevel >= item.level && <CheckCircle className="h-3 w-3" />}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">{item.detail}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Logic Blocks Section */}
                        <section id="snippets" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Code2 className="h-6 w-6 text-blue-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">Logic Blocks (Snippets)</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-muted-foreground">
                                <p>
                                    The Snippet Library is your personal knowledge base and a public portfolio.
                                    Unlike GitHub Gists, CodeStudio snippets are editable, versioned, and executable.
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="bg-card border-border">
                                    <div className="p-6">
                                        <h3 className="font-bold flex items-center gap-2 text-foreground mb-2">
                                            <Layout className="h-4 w-4 text-blue-500" />
                                            Live Visual Previews
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Create React components, HTML/CSS demos, or Mermaid diagrams and see them render instantly in the feed.
                                        </p>
                                    </div>
                                </Card>
                                <Card className="bg-card border-border">
                                    <div className="p-6">
                                        <h3 className="font-bold flex items-center gap-2 text-foreground mb-2">
                                            <Monitor className="h-4 w-4 text-purple-500" />
                                            Native Execution
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Execution support for Python, Go, Rust, C++, and Node.js using our distributed Piston engine.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </section>

                        {/* Arena Section */}
                        <section id="arena" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Sword className="h-6 w-6 text-amber-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">Competitive Arena</h2>
                            </div>
                            <Card className="bg-muted/10 border-border overflow-hidden">
                                <CardContent className="p-6">
                                    <p className="leading-relaxed text-muted-foreground mb-6 font-medium">
                                        Solve algorithmic challenges under time pressure. Your global rank is determined by a Glicko-2 rating system, ensuring fair matchmaking and persistent progression.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-amber-500/5 text-amber-500 border-amber-500/20">Timed Contests</Badge>
                                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-blue-500/5 text-blue-500 border-blue-500/20">Practice Mode</Badge>
                                        <Badge variant="outline" className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-purple-500/5 text-purple-500 border-purple-500/20">Global Leaderboards</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Quests Section */}
                        <section id="quests" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-pink-500/10">
                                    <Gift className="h-6 w-6 text-pink-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">Daily Quests</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4 text-muted-foreground leading-relaxed">
                                    <p>
                                        Quests are short-term tactical objectives that reset every 24 hours. Successfully completing a quest generates rewards that must be manually claimed in the Toolbelt.
                                    </p>
                                    <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
                                        <h4 className="text-foreground font-bold text-sm">Typical Objectives:</h4>
                                        <ul className="text-xs space-y-2 list-disc list-inside font-mono">
                                            <li>Execute snippets in 3+ languages</li>
                                            <li>Fork 2Featured logic blocks</li>
                                            <li>Receive 5 unique reactions</li>
                                            <li>Achieve 100% test pass rate</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="rounded-2xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-6 flex flex-col justify-center items-center text-center group">
                                    <Trophy className="h-12 w-12 text-pink-500 mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                                    <h4 className="font-black italic uppercase text-sm mb-2 text-pink-500 tracking-widest">Streak Bonus</h4>
                                    <p className="text-xs text-muted-foreground max-w-[200px]">
                                        Complete all daily objectives to trigger a <strong>Streak Multiplier</strong>, boosting all XP synthesis by 1.5x.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Trophy Room Section */}
                        <section id="trophy-room" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/10">
                                    <Trophy className="h-6 w-6 text-amber-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">Trophy Room & Artifacts</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-muted-foreground text-sm">
                                <p>
                                    Your Trophy Room (The Sanctum) is a persistent 3D gallery. Artifacts are classified into three distinct categories of recognition:
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {[
                                    { title: "Artifacts", detail: "Rare 3D models earned through high-level Arena victories.", icon: Zap, color: "text-amber-500" },
                                    { title: "Badges", detail: "Standard recognition for basic milestones like 'First Commit'.", icon: Star, color: "text-blue-500" },
                                    { title: "Medals", detail: "Exclusive to top 3 finishers in Global Events.", icon: Trophy, color: "text-purple-500" },
                                ].map((item, i) => (
                                    <div key={i} className="p-5 rounded-2xl bg-card border border-border space-y-3 hover:border-primary/20 transition-all">
                                        <div className={cn("p-2 rounded-lg w-fit", item.color, "bg-current/10")}>
                                            <item.icon className="h-5 w-5" />
                                        </div>
                                        <h4 className="font-bold text-foreground text-sm tracking-tight uppercase">{item.title}</h4>
                                        <p className="text-[10px] leading-relaxed text-muted-foreground">{item.detail}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Authority & Ranks Section */}
                        <section id="authority" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10">
                                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">Authority & Ranks</h2>
                            </div>
                            <Card className="border-border bg-muted/10 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
                                        {[
                                            { rank: "NOVICE", xp: "0+", color: "text-blue-400" },
                                            { rank: "EXPLORER", xp: "1000+", color: "text-cyan-400" },
                                            { rank: "VANGUARD", xp: "5000+", color: "text-purple-400" },
                                            { rank: "GRANDMASTER", xp: "25000+", color: "text-amber-400" },
                                        ].map((item, i) => (
                                            <div key={i} className="p-6 text-center space-y-1 group hover:bg-white/5 transition-colors">
                                                <div className={cn("text-lg font-black font-headline italic tracking-tighter", item.color)}>{item.rank}</div>
                                                <div className="text-[10px] font-mono text-muted-foreground uppercase">{item.xp} XP</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-background/50 border-t border-border">
                                        <p className="text-xs text-muted-foreground leading-relaxed">
                                            <strong className="text-foreground">Authority Score (AS):</strong> A secret metric calculated by combining your XP, your follow-to-follower ratio, and the average uptime of your logic blocks.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* FAQ Section */}
                        <section id="faq" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-muted">
                                    <HelpCircle className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight font-headline uppercase italic">Frequently Asked Questions</h2>
                            </div>
                            <Accordion type="single" collapsible className="w-full">
                                {[
                                    { q: "How are levels calculated?", a: "Levels are non-linear. The XP required for the next level increases exponentially (Level^2 * 100 constant). This ensures that high levels represent significant mastery." },
                                    { q: "Can I lose XP?", a: "No, XP is cumulative and never decays. However, your 'Influence Score' (Trust) can decrease if you are reported for spam or toxicity." },
                                    { q: "What is the Interface Engine?", a: "The Interface Engine allows you to customize the platform's theme and layout. It unlocks at Level 3." },
                                    { q: "How do I report a bug?", a: "Use the Feedback Wall. Verified bugs award significant XP thanks." }
                                ].map((item, i) => (
                                    <AccordionItem key={i} value={`item-${i}`} className="border-border">
                                        <AccordionTrigger className="text-base font-bold text-foreground">{item.q}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed text-sm">
                                            {item.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    </div>
                </div>
                {/* Mobile Navigation Fab */}
                <div className="lg:hidden fixed bottom-24 right-6 z-[60]">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button size="icon" className="h-14 w-14 rounded-full shadow-2xl shadow-primary/20 bg-primary text-white">
                                <Layout className="h-6 w-6" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border p-6 rounded-t-[2rem] sm:rounded-2xl bottom-0 top-auto translate-y-0 sm:top-[50%] sm:translate-y-[-50%]">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black italic font-headline uppercase">Manual Index</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-2 gap-3 pt-4">
                                {HELP_SECTIONS.map((section) => (
                                    <DialogClose asChild key={section.id}>
                                        <a
                                            href={`#${section.id}`}
                                            className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-all text-center"
                                        >
                                            <section.icon className="h-5 w-5 text-primary" />
                                            <span className="text-xs font-bold">{section.label}</span>
                                        </a>
                                    </DialogClose>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </div>
    );
}
