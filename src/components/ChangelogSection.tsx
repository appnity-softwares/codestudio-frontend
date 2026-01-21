
import { motion } from "framer-motion";
import { Clock, Star, Zap, Shield, Layout, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

const CHANGES = [
    {
        version: "v2.1.0",
        title: "Live Platform Stats",
        description: "Real-time counters for developers, submissions, and snippets are now active on the landing page, providing live platform growth metrics.",
        icon: Zap,
        type: "FEATURE",
        date: "Jan 22, 2026"
    },
    {
        version: "v2.0.5",
        title: "Elite Rankings",
        description: "A brand new leaderboard section showcasing the top 3 developers based on trust score and code fingerprint, with hover effects and live snippet counts.",
        icon: Star,
        type: "IMPROVEMENT",
        date: "Jan 21, 2026"
    },
    {
        version: "v2.0.4",
        title: "Live Arena Feed",
        description: "Introduced a dynamic rolling ticker in the arena displaying upcoming challenges with exact dates and localized times.",
        icon: Clock,
        type: "FEATURE",
        date: "Jan 20, 2026"
    },
    {
        version: "v2.0.3",
        title: "Admin Power Tools",
        description: "Enhanced administrative capabilities for contest management and problem editing, including streamlined ID handling and real-time validation.",
        icon: Shield,
        type: "ADMIN",
        date: "Jan 19, 2026"
    },
    {
        version: "v2.0.0",
        title: "Snippet Engine v2",
        description: "Our core execution engine received a massive overhaul, supporting 40+ languages with sub-millisecond validation and improved safety protocols.",
        icon: Layout,
        type: "BREAKING",
        date: "Jan 15, 2026"
    }
];

export function ChangelogSection() {
    return (
        <section id="changelog" className="py-24 px-6 bg-[#050505] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
                    <div className="max-w-xl">
                        <h2 className="text-3xl font-bold mb-4 flex items-center gap-3">
                            <Clock className="h-8 w-8 text-primary" />
                            Latest Updates
                        </h2>
                        <p className="text-white/40 text-lg">
                            We're constantly shipping new features and improvements to make CodeStudio the best place for developers.
                        </p>
                    </div>
                    <Link to="/changelog">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all text-sm font-medium"
                        >
                            View Full Changelog
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {CHANGES.map((change, i) => (
                        <motion.div
                            key={change.version}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            viewport={{ once: true }}
                            className="group p-6 rounded-2xl bg-[#0c0c0e] border border-white/5 hover:border-primary/20 transition-all flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                    <change.icon className="h-6 w-6 text-primary" />
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className={cn(
                                        "text-[10px] font-bold tracking-widest uppercase mb-1",
                                        change.type === 'BREAKING' ? 'text-red-400 border-red-500/20' :
                                            change.type === 'FEATURE' ? 'text-emerald-400 border-emerald-500/20' :
                                                'text-blue-400 border-blue-500/20'
                                    )}>
                                        {change.type}
                                    </Badge>
                                    <div className="text-[10px] text-white/30 font-mono italic">{change.date}</div>
                                </div>
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-mono text-primary/70">{change.version}</span>
                                    <h3 className="font-bold text-white group-hover:text-primary transition-colors">{change.title}</h3>
                                </div>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    {change.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function cn(...classes: string[]) {
    return classes.filter(Boolean).join(' ');
}
