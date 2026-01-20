import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Code2, Rocket, Swords } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usersAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const steps = [
    { id: 'profile', title: 'Profile Basics', description: 'Tell us a bit about yourself.' },
    { id: 'skills', title: 'Skills & Interests', description: 'What do you code and care about?' },
    { id: 'action', title: 'Get Started', description: 'Choose your first mission.' },
];

const AVAILABLE_LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 'Java', 'C++', 'C#'];
const AVAILABLE_INTERESTS = ['Web Development', 'Algorithms', 'System Design', 'AI/ML', 'DevOps', 'Open Source', 'Competitive Programming'];

export default function Onboarding() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [bio, setBio] = useState('');
    const [selectedLangs, setSelectedLangs] = useState<string[]>([]);
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

    const handleNext = async () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(c => c + 1);
        } else {
            await handleFinish();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) setCurrentStep(c => c - 1);
    };

    const toggleSelection = (item: string, list: string[], setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            if (list.length >= 5) {
                toast({
                    title: "Limit reached",
                    description: "You can select up to 5 items.",
                    variant: "destructive",
                });
                return;
            }
            setList([...list, item]);
        }
    };

    const handleFinish = async () => {
        setIsLoading(true);
        try {
            await usersAPI.completeOnboarding({
                bio,
                languages: selectedLangs,
                interests: selectedInterests
            });
            await updateUser({ onboardingCompleted: true }); // Update local context if supported or force refresh
            navigate('/');
            toast({
                title: "Welcome aboard! 🚀",
                description: "Your profile has been set up.",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to complete onboarding.",
                variant: "destructive",
            });
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    // Render Steps
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Display Name</Label>
                            <Input disabled value={user?.name || ''} className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Imported from signup.</p>
                        </div>
                        <div className="space-y-2">
                            <Label>Username</Label>
                            <Input disabled value={'@' + (user?.username || '')} className="bg-muted" />
                        </div>
                        <div className="space-y-2">
                            <Label>Bio <span className="text-muted-foreground">(Optional)</span></Label>
                            <Textarea
                                placeholder="I write code and break things..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="resize-none h-24"
                                maxLength={160}
                            />
                            <p className="text-xs text-right text-muted-foreground">{bio.length}/160</p>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-base">Languages / Tech Stack</Label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_LANGUAGES.map(lang => (
                                    <Badge
                                        key={lang}
                                        variant={selectedLangs.includes(lang) ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1 text-sm hover:bg-primary/90 transition-colors"
                                        onClick={() => toggleSelection(lang, selectedLangs, setSelectedLangs)}
                                    >
                                        {lang}
                                        {selectedLangs.includes(lang) && <Check className="ml-1.5 h-3 w-3" />}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <Label className="text-base">Interests</Label>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_INTERESTS.map(interest => (
                                    <Badge
                                        key={interest}
                                        variant={selectedInterests.includes(interest) ? "default" : "outline"}
                                        className="cursor-pointer px-3 py-1 text-sm hover:bg-primary/90 transition-colors"
                                        onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                                    >
                                        {interest}
                                        {selectedInterests.includes(interest) && <Check className="ml-1.5 h-3 w-3" />}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <p className="text-sm text-muted-foreground mb-2">You're all set! Where would you like to go first?</p>

                        <Button variant="outline" className="h-auto p-4 justify-start space-x-4 hover:border-primary hover:bg-primary/5 group" onClick={() => handleFinish().then(() => navigate('/create'))}>
                            <div className="bg-blue-500/10 p-2 rounded-lg text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                <Code2 className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-foreground">Create First Snippet</h3>
                                <p className="text-xs text-muted-foreground">Share some code with the world.</p>
                            </div>
                            <ArrowRight className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>

                        <Button variant="outline" className="h-auto p-4 justify-start space-x-4 hover:border-primary hover:bg-primary/5 group" onClick={() => handleFinish().then(() => navigate('/arena'))}>
                            <div className="bg-red-500/10 p-2 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <Swords className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-foreground">Enter the Arena</h3>
                                <p className="text-xs text-muted-foreground">Compete in coding contests.</p>
                            </div>
                            <ArrowRight className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>

                        <Button variant="outline" className="h-auto p-4 justify-start space-x-4 hover:border-primary hover:bg-primary/5 group" onClick={() => handleFinish().then(() => navigate('/feed'))}>
                            <div className="bg-green-500/10 p-2 rounded-lg text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                                <Rocket className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-semibold text-foreground">Explore Community</h3>
                                <p className="text-xs text-muted-foreground">See what's trending today.</p>
                            </div>
                            <ArrowRight className="ml-auto w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen grid items-center justify-center p-4 bg-background relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px_32px]" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full opacity-20 pointer-events-none" />

            <Card className="w-full max-w-lg z-10 border-border/50 bg-black/60 backdrop-blur-xl">
                <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                        <Badge variant="secondary" className="text-xs">
                            Step {currentStep + 1} of {steps.length}
                        </Badge>
                        <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground hover:text-foreground">
                            Skip
                        </Button>
                    </div>
                    <CardTitle className="text-2xl">{steps[currentStep].title}</CardTitle>
                    <CardDescription>{steps[currentStep].description}</CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="min-h-[300px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderStepContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between">
                    <Button variant="ghost" onClick={handleBack} disabled={currentStep === 0}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    {currentStep === 2 ? (
                        null // Actions handled in render
                    ) : (
                        <Button onClick={handleNext} disabled={isLoading}>
                            Next
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
