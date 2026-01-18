"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Wand2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CodeBlock } from "./CodeBlock";

// Mock AI Action (In a real app, this would call an API)
const generateSnippetAction = async ({ description }: { description: string }) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
        generatedCode: `// Generated snippet for: ${description}\n\nexport const MyComponent = () => {\n  return (\n    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">\n      <h2 className="text-primary font-bold">Hello from AI!</h2>\n      <p className="text-sm">This is a generated component.</p>\n    </div>\n  );\n};`
    };
};

export function AISnippetGenerator() {
    const [description, setDescription] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const { toast } = useToast();

    const handleGenerate = async () => {
        if (!description) {
            toast({
                variant: "destructive",
                title: "Missing description",
                description: "Please describe the snippet you want to create.",
            });
            return;
        }
        setIsGenerating(true);
        setGeneratedCode("");
        try {
            const result = await generateSnippetAction({ description });
            setGeneratedCode(result.generatedCode);
            toast({
                title: "Snippet generated!",
                description: "AI has successfully created a new snippet for you.",
            })
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "AI Error",
                description: "Failed to generate snippet. Please try again.",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card className="border-primary/20 bg-primary/5 shadow-inner">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 font-headline text-lg">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    AI Snippet Generator
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Textarea
                    placeholder="Describe a React component or utility function..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-background/50 border-primary/10 focus-visible:ring-primary/20 min-h-[100px] resize-none"
                    disabled={isGenerating}
                />
                <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Generate with AI
                        </>
                    )}
                </Button>
                {(isGenerating || generatedCode) && (
                    <div className="mt-4 rounded-xl border bg-background/50 overflow-hidden min-h-[150px] relative transition-all duration-500">
                        {isGenerating ? (
                            <div className="flex flex-col items-center justify-center absolute inset-0 bg-background/50 backdrop-blur-sm z-10 gap-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-xs font-medium text-muted-foreground animate-pulse">Consulting the AI minds...</p>
                            </div>
                        ) : null}
                        {generatedCode ? (
                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <CodeBlock code={generatedCode} language="typescript" />
                            </div>
                        ) : (
                            <div className="flex items-center justify-center absolute inset-0">
                                <p className="text-xs text-muted-foreground/50 italic">AI output will appear here...</p>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
