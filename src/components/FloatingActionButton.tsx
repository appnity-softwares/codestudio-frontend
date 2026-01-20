import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Code2, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABOption {
    icon: React.ReactNode;
    label: string;
    path: string;
    gradient: string;
}

const fabOptions: FABOption[] = [
    {
        icon: <Code2 className="h-5 w-5" />,
        label: "Create Snippet",
        path: "/create",
        gradient: "from-emerald-500 to-teal-600"
    },
    {
        icon: <Trophy className="h-5 w-5" />,
        label: "Join Contest",
        path: "/arena",
        gradient: "from-amber-500 to-orange-600"
    }
];

export function FloatingActionButton() {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleOptionClick = (path: string) => {
        setIsOpen(false);
        navigate(path);
    };

    return (
        <>
            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* FAB Container - Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
                {/* Options - Appear ABOVE the button */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="flex flex-col gap-3 mb-2"
                        >
                            {fabOptions.map((option, index) => (
                                <motion.button
                                    key={option.path}
                                    initial={{ opacity: 0, x: 20, scale: 0.8 }}
                                    animate={{
                                        opacity: 1,
                                        x: 0,
                                        scale: 1,
                                        transition: { delay: index * 0.08 }
                                    }}
                                    exit={{
                                        opacity: 0,
                                        x: 20,
                                        scale: 0.8,
                                        transition: { delay: (fabOptions.length - index - 1) * 0.05 }
                                    }}
                                    onClick={() => handleOptionClick(option.path)}
                                    className={cn(
                                        "flex items-center gap-3 px-5 py-3 rounded-2xl text-white shadow-2xl",
                                        "bg-gradient-to-r",
                                        option.gradient,
                                        "hover:shadow-xl hover:scale-105 transition-all duration-200",
                                        "border border-white/20 backdrop-blur-sm"
                                    )}
                                >
                                    {option.icon}
                                    <span className="text-sm font-semibold whitespace-nowrap">
                                        {option.label}
                                    </span>
                                </motion.button>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main FAB Button - Modern Gradient */}
                <motion.button
                    whileHover={{ scale: 1.08, rotate: isOpen ? 0 : 5 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "h-16 w-16 rounded-2xl shadow-2xl flex items-center justify-center",
                        "bg-gradient-to-br from-violet-600 via-primary to-purple-700",
                        "hover:from-violet-500 hover:via-primary hover:to-purple-600",
                        "text-white transition-all duration-300",
                        "border border-white/20",
                        "shadow-[0_8px_30px_rgba(139,92,246,0.4)]",
                        isOpen && "rounded-xl"
                    )}
                >
                    <motion.div
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="relative"
                    >
                        {isOpen ? (
                            <X className="h-7 w-7" />
                        ) : (
                            <Plus className="h-7 w-7" />
                        )}
                    </motion.div>

                    {/* Glow Effect */}
                    {!isOpen && (
                        <motion.div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 opacity-0 blur-xl -z-10"
                            animate={{ opacity: [0, 0.5, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </motion.button>
            </div>
        </>
    );
}
