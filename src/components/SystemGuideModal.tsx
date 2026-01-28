
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import {
    Code2,
    Trophy,
    BrainCircuit,
    ShieldCheck,
    ShoppingBag,
} from "lucide-react";
import { motion } from "framer-motion";

interface SystemGuideModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const GUIDE_SECTIONS = [
    {
        title: "The Logic Ecosystem",
        icon: BrainCircuit,
        color: "text-blue-400",
        items: [
            "Share reusable logic snippets with the global community.",
            "Earn XP (Spendable Credits) for solve-rates and popularity.",
            "Build your Developer Authority rank to unlock premium features."
        ]
    },
    {
        title: "The Battle Arena",
        icon: Trophy,
        color: "text-amber-500",
        items: [
            "Compete in time-sensitive coding challenges.",
            "Verify your solutions against our high-speed isolated runtime.",
            "Climb the global leaderboard and earn unique 3D trophies."
        ]
    },
    {
        title: "XP Economy & Skins",
        icon: ShoppingBag,
        color: "text-purple-400",
        items: [
            "Spend XP in the XP Store for premium profile aesthetics.",
            "Unlock unique Developer Auras that reflect your total XP level.",
            "Trade logic for visual prestige—no real money required."
        ]
    },
    {
        title: "Authority & Trust",
        icon: ShieldCheck,
        color: "text-emerald-400",
        items: [
            "Maintain a high Trust Score by publishing valid, clean code.",
            "Flag invalid snippets to earn Community Moderator status.",
            "Your Authority Rank is permanent; XP is spendable."
        ]
    }
];

export function SystemGuideModal({ isOpen, onClose }: SystemGuideModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] md:h-auto bg-[#0c0c0e]/95 backdrop-blur-2xl border-white/10 shadow-2xl p-0 overflow-hidden flex flex-col md:block">
                <div className="flex flex-col md:grid md:grid-cols-5 h-full overflow-hidden">
                    {/* Sidebar */}
                    <div className="md:col-span-2 bg-white/[0.02] border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-8 flex flex-col justify-between shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-4 md:mb-8">
                                <div className="p-2 rounded-xl bg-primary/20 text-primary">
                                    <Code2 className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h2 className="text-lg md:text-xl font-black text-white tracking-tight font-headline">SYSTEM <span className="text-primary italic">MANUAL</span></h2>
                            </div>
                            <p className="text-sm text-white/40 font-medium leading-relaxed mb-4 md:mb-8 hidden md:block">
                                Welcome to CodeStudio. This environment is designed to reward logic, community contribution, and competitive excellence.
                            </p>
                        </div>
                        <div className="space-y-4 hidden md:block">
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">PRO TIP</div>
                                <p className="text-[10px] text-white/50 leading-relaxed font-bold">
                                    Your 3D Trophies are permanent reflections of your career milestones. View them in the Trophy Room.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3 p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 relative flex flex-col">
                        <div className="space-y-6 md:space-y-8 pb-20 md:pb-0">
                            <p className="text-sm text-white/40 font-medium leading-relaxed md:hidden">
                                Welcome to CodeStudio. This environment is designed to reward logic, community contribution, and competitive excellence.
                            </p>
                            {GUIDE_SECTIONS.map((section, idx) => (
                                <motion.div
                                    key={section.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="space-y-3 md:space-y-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <section.icon className={`w-5 h-5 ${section.color}`} />
                                        <h3 className="text-sm font-black text-white uppercase tracking-wider">{section.title}</h3>
                                    </div>
                                    <ul className="space-y-3 pl-8 border-l border-white/5">
                                        {section.items.map((item, i) => (
                                            <li key={i} className="text-sm text-white/60 font-medium flex items-start gap-3">
                                                <div className="w-1 h-1 rounded-full bg-primary mt-2 shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-auto pt-6 border-t border-white/5 flex justify-end sticky bottom-0 bg-[#0c0c0e] md:bg-transparent pb-4 md:pb-0 z-10 w-full">
                            <button
                                onClick={onClose}
                                className="w-full md:w-auto px-6 py-3 md:py-2.5 rounded-xl bg-white text-black font-black uppercase text-xs md:text-[10px] tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-xl"
                            >
                                Acknowledge & Initialize
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
