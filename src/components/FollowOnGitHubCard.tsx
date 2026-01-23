"use client";

import { Button } from "@/components/ui/button";
import { Github, Twitter, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

export function FollowOnGitHubCard() {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="rounded-[1.5rem] bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-md overflow-hidden relative group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="p-5 relative z-10">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-white/5 rounded-lg text-white">
                        <Github className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-white text-base">Join Community</h3>
                </div>

                <p className="text-xs text-white/50 mb-4 leading-relaxed">
                    Get updates from the core developers and the organization behind CodeStudio.
                </p>

                <div className="space-y-2">
                    <Button variant="outline" size="sm" asChild className="w-full justify-start bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white/80 transition-all rounded-xl h-9">
                        <a href="https://github.com/jatin" target="_blank" rel="noopener noreferrer">
                            <Github className="mr-2 h-4 w-4" />
                            <ExternalLink className="ml-auto h-3 w-3 text-white" />
                        </a>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                        <Button variant="ghost" size="sm" asChild className="w-full text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-8">
                            <a href="https://twitter.com/devconnect" target="_blank" rel="noopener noreferrer">
                                <Twitter className="mr-2 h-3.5 w-3.5" />
                                Twitter
                            </a>
                        </Button>
                        <Button variant="ghost" size="sm" asChild className="w-full text-xs text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-8">
                            <a href="https://github.com/devconnect" target="_blank" rel="noopener noreferrer">
                                <Github className="mr-2 h-3.5 w-3.5" />
                                GitHub
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
