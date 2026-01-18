"use client";

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIExplanationModalProps {
    isOpen: boolean;
    onClose: () => void;
    code: string;
}

// Mock AI Logic for Explanation
const generateSnippetExplanation = async (code: string) => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    return `### Code Breakdown\n\n1. **Core Logic**: This snippet implements a robust mechanism to handle the provided data.\n2. **Performance**: It uses optimized patterns to minimize re-renders and memory overhead.\n3. **Maintainability**: The structure follows industry best practices, making it easy to extend and debug.\n\n### Best Practices Applied\n\n- **Strict Type Safety**: Ensures no runtime errors related to data types.\n- **Declarative Patterns**: Makes the intent of the code clear at a glance.`;
};

export function AIExplanationModal({ isOpen, onClose, code }: AIExplanationModalProps) {
    const [explanation, setExplanation] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            handleGenerateExplanation();
        } else {
            setExplanation(''); // Clear on close
        }
    }, [isOpen, code]);

    const handleGenerateExplanation = async () => {
        if (!code) {
            toast({ variant: 'destructive', title: "No code provided." });
            return;
        }
        setIsGenerating(true);
        setExplanation('');
        try {
            const result = await generateSnippetExplanation(code);
            setExplanation(result);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "AI Error",
                description: "Failed to generate explanation. Please try again.",
            });
            onClose();
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-xl border-primary/20 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 font-headline text-2xl">
                        <Wand2 className="h-6 w-6 text-primary animate-pulse" />
                        AI Insights
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground/80 font-medium">
                        Deep analysis and architectural breakdown of your snippet.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-6 min-h-[300px] max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                    {isGenerating ? (
                        <div className="flex flex-col items-center justify-center gap-6 py-20">
                            <div className="relative">
                                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                                <Wand2 className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                            </div>
                            <p className="text-muted-foreground font-medium animate-pulse tracking-wide">The AI is deconstructing the code patterns...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="rounded-2xl bg-muted/50 p-6 border border-primary/5 line-height-relaxed text-sm">
                                {explanation.split('\n').map((line, i) => (
                                    <p key={i} className={line.startsWith('#') ? "font-bold text-lg text-primary mt-4 first:mt-0" : "mt-2 opacity-90"}>
                                        {line.replace(/### |## |1. |2. |3. |- /g, '')}
                                    </p>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={onClose} className="rounded-full px-8 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all hover:scale-105">
                                    <Check className="mr-2 h-4 w-4" /> Got it
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
