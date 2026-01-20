import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Code2, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FABOption {
    icon: React.ReactNode;
    label: string;
    path: string;
    color: string;
}

const fabOptions: FABOption[] = [
    {
        icon: <Code2 className="h-5 w-5" />,
        label: "Create Snippet",
        path: "/create",
        color: "bg-emerald-500 hover:bg-emerald-600"
    },
    {
        icon: <Trophy className="h-5 w-5" />,
        label: "Join Contest",
        path: "/arena",
        color: "bg-amber-500 hover:bg-amber-600"
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
        <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
            {/* Options */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {fabOptions.map((option, index) => (
                            <motion.button
                                key={option.path}
                                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: { delay: index * 0.05 }
                                }}
                                exit={{
                                    opacity: 0,
                                    y: 10,
                                    scale: 0.8,
                                    transition: { delay: (fabOptions.length - index) * 0.03 }
                                }}
                                onClick={() => handleOptionClick(option.path)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-full text-white shadow-lg",
                                    "transition-all duration-200 group",
                                    option.color
                                )}
                            >
                                <span className="text-sm font-medium whitespace-nowrap">
                                    {option.label}
                                </span>
                                {option.icon}
                            </motion.button>
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main FAB Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg flex items-center justify-center",
                    "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                    "hover:from-primary/90 hover:to-primary/70",
                    "transition-all duration-300",
                    "border border-primary/20"
                )}
            >
                <motion.div
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
                </motion.div>
            </motion.button>

            {/* Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
