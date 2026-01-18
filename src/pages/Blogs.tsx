"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Sparkles, Filter, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BlogCard } from "@/components/BlogCard";
import { documentsAPI } from "@/lib/api";
import { Link } from "react-router-dom";

const CATEGORIES = [
    "All",
    "Development",
    "Architecture",
    "Tutorials",
    "AI & ML",
    "DevOps",
    "Community"
];

export default function Blogs() {
    const { data, isLoading: loading } = useQuery({
        queryKey: ['blogs'],
        queryFn: () => documentsAPI.getAll()
    });

    const blogs = data?.documents || [];
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredBlogs = blogs.filter((blog: any) => {
        const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            blog.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCategory = activeCategory === "All" || blog.tags?.includes(activeCategory);
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-12 pb-20">
            {/* Premium Header */}
            <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-indigo-600/20 via-primary/10 to-transparent border border-primary/10 p-12 lg:p-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-[100px] animate-pulse" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full -ml-32 -mb-32 blur-[80px]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="max-w-2xl space-y-6 text-center md:text-left">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-xs font-black tracking-[0.2em] uppercase">
                            Premium Insights
                        </Badge>
                        <h1 className="text-6xl lg:text-7xl font-headline font-black tracking-tighter">
                            DevConnect <span className="text-gradient bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Nexus</span>
                        </h1>
                        <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xl">
                            Expert perspectives on modern software engineering, AI integration, and community growth.
                        </p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <Button size="lg" className="rounded-2xl px-8 h-14 font-bold gap-2">
                                <Sparkles className="h-5 w-5" />
                                Start Reading
                            </Button>
                            <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 font-bold border-primary/20 hover:bg-primary/5" asChild>
                                <Link to="/create">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Write a Post
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <div className="hidden lg:block">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                            <div className="relative bg-background/50 backdrop-blur-xl border border-primary/20 p-8 rounded-[2.5rem] shadow-2xl rotate-3">
                                <BookOpen className="h-32 w-32 text-primary opacity-50" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12 items-start">
                {/* Sidebar Controls */}
                <aside className="space-y-10 sticky top-24">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                            <Search className="h-3 w-3" /> Search Articles
                        </h3>
                        <div className="relative group">
                            <Input
                                placeholder="Search nexus..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-12 rounded-2xl bg-muted/30 border-primary/5 focus-visible:ring-primary/20 pl-4 group-hover:border-primary/20 transition-all shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/70 flex items-center gap-2">
                            <Filter className="h-3 w-3" /> Categories
                        </h3>
                        <div className="flex flex-col gap-1.5">
                            {CATEGORIES.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`text-left text-sm py-3 px-4 rounded-xl transition-all font-bold ${activeCategory === category
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1"
                                        : "hover:bg-primary/5 text-muted-foreground hover:text-primary"
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card rounded-[2rem] p-8 border border-primary/10 bg-gradient-to-br from-indigo-500/10 to-transparent">
                        <h4 className="font-headline font-bold text-lg mb-2">Weekly Newsletter</h4>
                        <p className="text-xs text-muted-foreground mb-6 leading-relaxed">Get the best of Nexus delivered to your inbox every Friday.</p>
                        <Input placeholder="email@dev.com" className="h-10 rounded-xl mb-3 bg-background/50" />
                        <Button className="w-full rounded-xl h-10 font-bold">Subscribe</Button>
                    </div>
                </aside>

                {/* Blog Grid */}
                <main className="space-y-8">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-[400px] rounded-[2rem] bg-muted/20 animate-pulse border border-primary/5" />
                            ))}
                        </div>
                    ) : filteredBlogs.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            {filteredBlogs.map((blog: any) => (
                                <BlogCard key={blog.id} blog={blog} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 space-y-6 text-center glass-card rounded-[3rem] border-dashed border-2">
                            <div className="p-6 rounded-full bg-primary/5">
                                <Search className="h-12 w-12 text-muted-foreground opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">No articles found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                                    We couldn't find any articles matching your search or category filters.
                                </p>
                            </div>
                            <Button variant="outline" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="rounded-xl px-8 border-primary/20">
                                Reset Filters
                            </Button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
