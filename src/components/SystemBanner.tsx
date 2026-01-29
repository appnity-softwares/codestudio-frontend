import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { systemAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SystemBanner() {
    const { data: systemData } = useQuery({
        queryKey: ['system-status'],
        queryFn: () => systemAPI.getPublicStatus(),
        staleTime: 60000 * 5,
    });
    const settings = systemData?.settings || {};
    const bannerVisible = settings['system_banner_visible'] === 'true';
    const bannerTitle = settings['system_banner_title'];
    const bannerBadge = settings['system_banner_badge'];
    const bannerLink = settings['system_banner_link'];

    let bannerItems: string[] = [];
    try {
        if (settings['system_banner_content']) {
            bannerItems = JSON.parse(settings['system_banner_content']);
        }
    } catch (e) {
        bannerItems = [settings['system_banner_content']];
    }

    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        if (bannerVisible && bannerTitle) {
            const key = `dismissed_banner_${bannerTitle}`;
            if (!localStorage.getItem(key)) {
                setShowBanner(true);
            }
        }
    }, [bannerVisible, bannerTitle]);

    if (!bannerVisible || !showBanner || !bannerTitle) return null;

    return (
        <AnimatePresence>
            <motion.div
                key={bannerTitle}
                initial={{ height: 0, opacity: 0, marginBottom: 0 }}
                animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
                exit={{ height: 0, opacity: 0, marginBottom: 0 }}
                className="overflow-hidden px-4 md:px-8 pt-6 max-w-[1800px] mx-auto w-full z-40 relative"
            >
                <div className="relative p-6 rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-purple-500/10 border border-primary/20 shadow-2xl backdrop-blur-xl group overflow-hidden">
                    {/* Decorative Blobs */}
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-all duration-1000" />
                    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 blur-[100px] rounded-full group-hover:bg-purple-500/30 transition-all duration-1000" />

                    <div className="relative flex flex-col md:flex-row items-center gap-6">
                        <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20 shrink-0">
                            <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-xl font-black text-foreground mb-2 flex items-center gap-2 justify-center md:justify-start uppercase tracking-tight">
                                {bannerTitle}
                                {bannerBadge && (
                                    <span className="text-[10px] bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded-full font-bold">{bannerBadge}</span>
                                )}
                            </h2>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                {bannerItems.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                        <div className={cn(
                                            "h-2 w-2 rounded-full",
                                            idx % 3 === 0 ? "bg-emerald-500" : idx % 3 === 1 ? "bg-blue-500" : "bg-amber-500"
                                        )} />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {bannerLink && (
                                <a
                                    href={bannerLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-6 py-2.5 bg-primary text-primary-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl"
                                >
                                    READ MORE
                                </a>
                            )}
                            <button
                                onClick={() => {
                                    setShowBanner(false);
                                    localStorage.setItem(`dismissed_banner_${bannerTitle}`, 'true');
                                }}
                                className={cn(
                                    "px-6 py-2.5 bg-card text-foreground text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-sm border border-border",
                                    bannerLink && "bg-transparent text-foreground border border-border hover:bg-muted"
                                )}
                            >
                                GOT IT!
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
