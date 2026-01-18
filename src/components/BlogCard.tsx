"use client";

import { useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface BlogCardProps {
    blog: {
        id: string;
        title: string;
        slug: string;
        content: string;
        tags: string[];
        createdAt: string;
        author: {
            name: string;
            username: string;
            image?: string;
        };
    };
}

export function BlogCard({ blog }: BlogCardProps) {
    const excerpt = blog.content.substring(0, 160).replace(/[#*`]/g, '') + '...';
    const date = new Date(blog.createdAt);

    // 3D Tilt Ref
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

    const rotateX = useTransform(mouseY, [-0.5, 0.5], ["5deg", "-5deg"]);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-5deg", "5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseXFromCenter = e.clientX - rect.left - width / 2;
        const mouseYFromCenter = e.clientY - rect.top - height / 2;
        x.set(mouseXFromCenter / width);
        y.set(mouseYFromCenter / height);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <Link to={`/blogs/${blog.slug}`} className="block h-full perspective-1000">
            <motion.div
                ref={ref}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                    rotateX,
                    rotateY,
                    transformStyle: "preserve-3d",
                }}
                className="group h-full relative rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/20 shadow-xl"
            >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="p-6 flex flex-col h-full relative z-10" style={{ transform: "translateZ(20px)" }}>
                    {/* Header: Tags & Date */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div className="flex flex-wrap gap-2">
                            {blog.tags.slice(0, 2).map((tag) => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="bg-white/5 text-white/80 border-white/10 hover:bg-white/10 hover:border-white/20 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-medium"
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-medium text-white/40 uppercase tracking-widest">
                            <Calendar className="h-3 w-3" />
                            <span>{format(date, 'MMM d')}</span>
                        </div>
                    </div>

                    {/* Content: Title & Author */}
                    <div className="space-y-4 mb-6 flex-1">
                        <h3 className="font-headline text-2xl font-bold text-white/90 leading-tight group-hover:text-white transition-colors">
                            {blog.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                            {excerpt}
                        </p>
                    </div>

                    {/* Footer: User & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border border-white/10">
                                <AvatarImage src={blog.author.image} alt={blog.author.name} />
                                <AvatarFallback className="bg-white/10 text-white/50 text-xs">
                                    {blog.author.name?.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white/90">{blog.author.name}</span>
                                <div className="flex items-center gap-1 text-[10px] text-white/40">
                                    <Clock className="h-2.5 w-2.5" />
                                    <span>5 MIN</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:bg-white group-hover:text-black transition-all duration-300 transform group-hover:-translate-y-1 group-hover:translate-x-1 shadow-lg">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
