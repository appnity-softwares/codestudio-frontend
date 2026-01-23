import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
    CheckCircle, Trophy, Code2, Users, Sword, Star, HelpCircle, ArrowLeft,
    Monitor, Layout, Zap, Gift
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];

export default function Help() {
    const navigate = useNavigate();
    const userXP = useSelector((state: RootState) => state.user.xp) || 0;
    const userLevel = useSelector((state: RootState) => state.user.level) || 1;

    // Calculate level progress
    const currentLevelThreshold = LEVEL_THRESHOLDS[userLevel - 1] || 0;
    const nextLevelThreshold = LEVEL_THRESHOLDS[userLevel] || (userLevel * 1000); // Fallback for high levels
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
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight font-headline">
                        Master the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Ecosystem</span>
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Your comprehensive guide to navigating CodeStudio, earning reputation, and dominating the arena.
                    </p>
                </div>

                {/* Quick Shortcuts Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
                    {[
                        { icon: Code2, label: "Snippets", href: "#snippets", color: "text-blue-500" },
                        { icon: Sword, label: "Arena", href: "#arena", color: "text-amber-500" },
                        { icon: Star, label: "XP System", href: "#xp-system", color: "text-cyan-500" },
                        { icon: Users, label: "Community", href: "#community", color: "text-purple-500" },
                    ].map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col items-center gap-3 text-center"
                        >
                            <div className={cn("p-3 rounded-full bg-muted group-hover:bg-primary/10 transition-colors", item.color)}>
                                <item.icon className="h-6 w-6" />
                            </div>
                            <span className="font-bold text-sm">{item.label}</span>
                        </a>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-16">

                        {/* XP & Leveling Logic Section - Highlighted */}
                        <section id="xp-system" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-cyan-500/10">
                                    <Star className="h-6 w-6 text-cyan-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">XP & Leveling Architecture</h2>
                            </div>

                            <Card className="bg-gradient-to-br from-card to-muted/20 border-border overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="p-6 border-b border-border">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold">Your Current Progress</h3>
                                                <p className="text-sm text-muted-foreground">Level {userLevel} • {userXP} Total XP</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs uppercase font-bold text-muted-foreground">Next Level</span>
                                                <p className="font-mono text-xl font-black text-primary">{nextLevelThreshold} XP</p>
                                            </div>
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="h-3 w-full bg-muted/50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-1000 ease-out"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2 text-right">{progress.toFixed(1)}% to Level {userLevel + 1}</p>
                                    </div>

                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                                <Zap className="h-4 w-4 text-amber-500" />
                                                Earning Actions
                                            </h4>
                                            <ul className="space-y-3 text-sm">
                                                <li className="flex justify-between items-center py-2 border-b border-border/50">
                                                    <span>Snippet Publication</span>
                                                    <Badge variant="secondary" className="font-mono text-emerald-500">+50 XP</Badge>
                                                </li>
                                                <li className="flex justify-between items-center py-2 border-b border-border/50">
                                                    <span>Detailed Feedback</span>
                                                    <Badge variant="secondary" className="font-mono text-emerald-500">+15 XP</Badge>
                                                </li>
                                                <li className="flex justify-between items-center py-2 border-b border-border/50">
                                                    <span>Daily Login Streak</span>
                                                    <Badge variant="secondary" className="font-mono text-emerald-500">+10-100 XP</Badge>
                                                </li>
                                                <li className="flex justify-between items-center py-2 border-b border-border/50">
                                                    <span>Arena Contest Place</span>
                                                    <Badge variant="secondary" className="font-mono text-purple-500">Var</Badge>
                                                </li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold mb-4 flex items-center gap-2">
                                                <Trophy className="h-4 w-4 text-purple-500" />
                                                Level Benefits
                                            </h4>
                                            <ul className="space-y-3 text-sm text-muted-foreground">
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                    <span><strong>Level 5:</strong> Unlock animated profile avatars.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                    <span><strong>Level 10:</strong> Create private contest rooms.</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                                    <span><strong>Level 20:</strong> access to 'Mentor' role application.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Code Snippets Section */}
                        <section id="snippets" className="scroll-mt-24 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/10">
                                    <Code2 className="h-6 w-6 text-blue-500" />
                                </div>
                                <h2 className="text-3xl font-black tracking-tight">Code Snippets</h2>
                            </div>
                            <div className="prose prose-invert max-w-none text-muted-foreground">
                                <p>
                                    The Snippet Library is your personal knowledge base and a public portfolio.
                                    Unlike GitHub Gists, CodeStudio snippets are executable, versioned, and categorized by difficulty and type.
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
                                            Multi-Runtime Support
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            Native execution for Python, Go, Rust, C++, and Node.js. Input/Output is captured and displayed.
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
                                <h2 className="text-3xl font-black tracking-tight">Competitive Arena</h2>
                            </div>
                            <Card className="bg-muted/10 border-border">
                                <CardContent className="pt-6">
                                    <p className="leading-relaxed text-muted-foreground mb-6">
                                        Prove your mettle in the Arena. Live contests happen weekly. Your global rank is determined by a Glicko-2 rating system, ensuring fair matchmaking.
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className="px-3 py-1 text-xs">Timed Contests</Badge>
                                        <Badge variant="outline" className="px-3 py-1 text-xs">Practice Mode</Badge>
                                        <Badge variant="outline" className="px-3 py-1 text-xs">Global Leaderboards</Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </section>

                        {/* FAQ Section */}
                        <section id="faq" className="scroll-mt-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <HelpCircle className="h-5 w-5 text-muted-foreground" />
                                Frequently Asked Questions
                            </h2>
                            <Accordion type="single" collapsible className="w-full">
                                {[
                                    { q: "How are levels calculated?", a: "Levels are non-linear. The XP required for the next level increases exponentially (Level^2 * 100 constant). This ensures that high levels represent significant mastery." },
                                    { q: "Can I lose XP?", a: "No, XP is cumulative and never decays. However, your 'Influence Score' (Trust) can decrease if you are reported for spam or toxicity." },
                                    { q: "What is the Interface Engine?", a: "The Interface Engine allows you to customize the platform's theme and layout. It unlocks at Level 3." },
                                    { q: "How do I report a bug?", a: "Use the Feedback Wall. Verified bugs award significant XP thanks." }
                                ].map((item, i) => (
                                    <AccordionItem key={i} value={`item-${i}`} className="border-border">
                                        <AccordionTrigger className="text-base font-medium">{item.q}</AccordionTrigger>
                                        <AccordionContent className="text-muted-foreground leading-relaxed">
                                            {item.a}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </section>
                    </div>

                    {/* Right Sticky Sidebar */}
                    <div className="hidden lg:block lg:col-span-4 pl-8">
                        <div className="sticky top-24 space-y-6">
                            <Card className="bg-primary/5 border-primary/20">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base font-bold text-primary">
                                        <Gift className="h-4 w-4" />
                                        Contributor Rewards
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm text-muted-foreground">
                                    Top contributors on the monthly leaderboard receive exclusive "Architect" badges and profile customization options.
                                </CardContent>
                            </Card>

                            <div className="text-xs text-muted-foreground/50 font-mono">
                                <p>System Manual v2.1.0</p>
                                <p>Last Updated: {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
