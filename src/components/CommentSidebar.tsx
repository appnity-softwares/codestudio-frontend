"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CommentsSection } from "./CommentsSection";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommentSidebarProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    snippetId: string;
}

export function CommentSidebar({ open, onOpenChange, snippetId }: CommentSidebarProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-md p-0 border-l border-white/10 bg-black/40 backdrop-blur-3xl shadow-2xl overflow-hidden"
                style={{ zIndex: 1000 }}
            >
                <div className="h-full flex flex-col relative overflow-hidden">
                    {/* Premium Background Glows */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none -mr-48 -mt-48 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] pointer-events-none -ml-32 -mb-32" />

                    <SheetHeader className="p-8 pb-4 relative z-10 border-b border-white/5 bg-white/5 backdrop-blur-md">
                        <div className="flex items-center justify-between">
                            <SheetTitle className="text-2xl font-black font-headline text-white italic tracking-tighter flex items-center gap-3">
                                <MessageCircle className="h-6 w-6 text-primary" />
                                Nexus Comms
                            </SheetTitle>
                            <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary font-black uppercase tracking-widest text-[9px] px-3 py-1 rounded-full animate-in fade-in zoom-in duration-500">
                                Live Stream
                            </Badge>
                        </div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-[0.2em] mt-2 ml-9">Encrypted Thread // Channel {snippetId.slice(0, 8)}</p>
                    </SheetHeader>

                    <div className="flex-1 relative z-10 overflow-hidden bg-gradient-to-b from-transparent to-black/20">
                        <CommentsSection snippetId={snippetId} />
                    </div>

                    {/* Bottom Aesthetic Bar */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent w-full relative z-10" />
                </div>
            </SheetContent>
        </Sheet>
    );
}
