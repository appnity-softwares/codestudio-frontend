import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Terminal, Home, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { Seo } from "@/components/Seo"

export default function NotFound() {
    return (
        <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-6 pb-20">
            <Seo
                title="404 - Lost in the Void | CodeStudio"
                description="The page you are looking for has been moved or doesn't exist. Let's get you back to building."
            />

            {/* Background Aesthetic */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[160px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="max-w-2xl w-full text-center space-y-8"
            >
                {/* Premium Vector - Psychological Mindset */}
                <div className="relative w-full max-w-md mx-auto aspect-square group">
                    <img
                        src="/not_found_vector.png"
                        alt="404 Error - Lost in Space"
                        className="w-full h-full object-contain filter drop-shadow-2xl transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute -inset-4 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                </div>

                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                        <Terminal className="h-3 w-3" /> Error Code: 0x404
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black font-headline tracking-tighter text-foreground leading-[0.9]">
                        LOST IN THE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">DIGITAL VOID?</span>
                    </h1>

                    <p className="text-lg text-muted-foreground font-medium max-w-lg mx-auto leading-relaxed">
                        Even the most optimized compilers encounter a <span className="text-foreground font-bold">SEGFAULT</span> sometimes.
                        The path you're tracking has been garbage collected or never existed in the source.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Button
                        asChild
                        size="lg"
                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                        <Link to="/feed">
                            <Home className="h-4 w-4" /> Return to Flow
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => window.history.back()}
                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs gap-3 hover:bg-white/5"
                    >
                        <ArrowLeft className="h-4 w-4" /> Undo Operation
                    </Button>
                </div>

                <div className="pt-12 text-[10px] uppercase font-black tracking-widest text-muted-foreground/30 flex items-center justify-center gap-4">
                    <span>Compiling Recovery...</span>
                    <div className="h-1 w-24 bg-muted/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="h-full bg-primary"
                        />
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
