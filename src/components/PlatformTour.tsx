import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, X, Sparkles, HelpCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

interface Step {
    target: string;
    title: string;
    content: string;
    position: "top" | "bottom" | "left" | "right";
}

const TOUR_STEPS: Record<string, Step[]> = {
    "/feed": [
        {
            target: ".dock-logo",
            title: "The Logic Nexus",
            content: "Welcome to the global feed. This is where real-time executable logic flows. Stay updated with the latest snippets from around the world.",
            position: "bottom"
        },
        {
            target: ".dock-container",
            title: "Navigation Dock",
            content: "Hover over the bottom of the screen to reveal the Dock. It's your command center for switching between the Feed, Arena, and Profile.",
            position: "top"
        }
    ],
    "/trophy-room": [
        {
            target: "h1",
            title: "Your Digital Legacy",
            content: "This is the Sanctum of Excellence. Every major milestone you achieve is minted as a persistent 3D artifact here.",
            position: "bottom"
        },
        {
            target: "canvas",
            title: "3D Artifacts",
            content: "These are your verified achievements. You can rotate and inspect them. They represent your real-world coding skills.",
            position: "top"
        }
    ],
    "/roadmaps": [
        {
            target: "h1",
            title: "Skill Roadmaps",
            content: "Plan your evolution. Roadmaps help you master specific stacks like React, Go, or Backend Architecture.",
            position: "bottom"
        }
    ]
};

export function PlatformTour() {
    const location = useLocation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    const activePath = location.pathname;
    const steps = TOUR_STEPS[activePath] || [];

    // Handle initial visibility and path changes
    useEffect(() => {
        if (TOUR_STEPS[activePath]) {
            const hasSeen = localStorage.getItem(`tour_seen_${activePath}`);
            if (!hasSeen) {
                const timer = setTimeout(() => setIsVisible(true), 2000);
                return () => clearTimeout(timer);
            }
        }
    }, [activePath]);

    // Handle window resize and mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });

            // Re-calculate target rect on resize
            if (isVisible && steps[currentStep]) {
                const target = document.querySelector(steps[currentStep].target);
                if (target) {
                    setTargetRect(target.getBoundingClientRect());
                }
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isVisible, currentStep, activePath]);

    // Update target rect when step changes
    useEffect(() => {
        if (isVisible && steps[currentStep]) {
            const updateRect = () => {
                const target = document.querySelector(steps[currentStep].target);
                if (target) {
                    setTargetRect(target.getBoundingClientRect());
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            };

            // Small delay to allow layout shifts/scrolls
            const timer = setTimeout(updateRect, 100);
            return () => clearTimeout(timer);
        } else {
            setTargetRect(null);
        }
    }, [isVisible, currentStep, activePath]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem(`tour_seen_${activePath}`, "true");
    };

    const resetTour = () => {
        setCurrentStep(0);
        setIsVisible(true);
    };

    if (steps.length === 0 || windowSize.height < 500) return null;

    return (
        <>
            <AnimatePresence>
                {!isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed bottom-24 right-6 z-[60]"
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={resetTour}
                            className="h-12 w-12 rounded-full bg-primary shadow-xl shadow-primary/20 text-white hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all group overflow-visible"
                        >
                            <HelpCircle className="h-6 w-6" />
                            <span className="absolute right-14 bg-card border border-border px-3 py-1.5 rounded-lg text-xs font-bold text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                                Take Tutorial
                            </span>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isVisible && targetRect && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
                        {/* Overlay with Cutout */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-[2px] pointer-events-auto cursor-pointer"
                            onClick={handleClose}
                            style={{
                                clipPath: `polygon(
                                    0% 0%, 0% 100%, 100% 100%, 100% 0%,
                                    ${targetRect.left - 10}px 0%,
                                    ${targetRect.left - 10}px ${targetRect.top - 10}px,
                                    ${targetRect.right + 10}px ${targetRect.top - 10}px,
                                    ${targetRect.right + 10}px ${targetRect.bottom + 10}px,
                                    ${targetRect.left - 10}px ${targetRect.bottom + 10}px,
                                    ${targetRect.left - 10}px 0%
                                )`
                            }}
                        />

                        {/* Tooltip Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                top: isMobile ? 'auto' :
                                    (steps[currentStep].position === 'bottom'
                                        ? Math.min(windowSize.height - 250, targetRect.bottom + 20)
                                        : 'auto'
                                    ),
                                bottom: isMobile ? 40 :
                                    (steps[currentStep].position === 'top'
                                        ? Math.min(windowSize.height - 100, (windowSize.height - targetRect.top) + 20)
                                        : 'auto'
                                    ),
                                left: isMobile ? '50%' :
                                    Math.max(20, Math.min(windowSize.width - 340, targetRect.left + (targetRect.width / 2) - 160)),
                                transform: isMobile ? 'translateX(-50%)' : 'none'
                            }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className={cn(
                                "fixed sm:absolute pointer-events-auto bg-card border-2 border-primary/30 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] p-5 w-[calc(100vw-40px)] sm:w-[320px] overflow-hidden z-[110]",
                                isMobile ? "bottom-10" : ""
                            )}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <Sparkles className="h-20 w-20 text-primary" />
                            </div>

                            <div className="flex justify-between items-start mb-3">
                                <Badge variant="outline" className="text-[10px] font-black uppercase text-primary border-primary/20">
                                    CORE PROTOCOL {currentStep + 1}/{steps.length}
                                </Badge>
                                <button onClick={handleClose} className="p-1.5 hover:bg-muted rounded-full transition-colors">
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </button>
                            </div>

                            <h3 className="text-xl font-black italic font-headline uppercase tracking-tighter mb-2 text-foreground">
                                {steps[currentStep].title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-medium">
                                {steps[currentStep].content}
                            </p>

                            <div className="flex items-center justify-between">
                                <div className="flex gap-1.5">
                                    {steps.map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "h-1.5 rounded-full transition-all duration-300",
                                                i === currentStep ? "w-6 bg-primary" : "w-1.5 bg-muted"
                                            )}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {currentStep > 0 && (
                                        <Button variant="ghost" size="sm" onClick={handleBack} className="h-10 px-4 gap-1.5 font-bold text-xs rounded-xl">
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <Button size="sm" onClick={handleNext} className="h-10 px-6 gap-2 font-black uppercase text-[10px] tracking-widest rounded-xl">
                                        {currentStep === steps.length - 1 ? (
                                            <>Finish <X className="h-3.5 w-3.5" /></>
                                        ) : (
                                            <>Next <ChevronRight className="h-4 w-4" /></>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {/* Pointer Arrow (Desktop Only) */}
                            {!isMobile && (
                                <div
                                    className={cn(
                                        "absolute w-4 h-4 bg-card border-2 border-primary/30 rotate-45 z-[-1]",
                                        steps[currentStep].position === 'bottom' ? "-top-2 left-1/2 -translate-x-1/2 border-b-0 border-r-0" :
                                            steps[currentStep].position === 'top' ? "-bottom-2 left-1/2 -translate-x-1/2 border-t-0 border-l-0" :
                                                steps[currentStep].position === 'left' ? "-right-2 top-1/2 -translate-y-1/2 border-b-0 border-l-0" :
                                                    "-left-2 top-1/2 -translate-y-1/2 border-t-0 border-r-0"
                                    )}
                                />
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
