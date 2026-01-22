
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsAPI, paymentsAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar, ShieldCheck, AlertCircle, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import SEO from "@/components/SeoMeta";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";


export default function EventDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch Event Data
    const { data: eventData, isLoading: isEventLoading } = useQuery({
        queryKey: ['event', id],
        queryFn: () => eventsAPI.getById(id!),
        enabled: !!id
    });

    // Fetch Access/Registration Status
    const { data: accessData, isLoading: isAccessLoading } = useQuery({
        queryKey: ['event-access', id],
        queryFn: () => eventsAPI.getAccessDetails(id!),
        enabled: !!id && !!user,
        retry: false
    });

    const event = eventData?.event;
    const isRegistered = accessData?.access;

    const registerMutation = useMutation({
        mutationFn: async (paymentDetails: any) => {
            return eventsAPI.register(id!, paymentDetails);
        },
        onSuccess: () => {
            toast({ title: "Successfully registered!", variant: "default" });
            queryClient.invalidateQueries({ queryKey: ['event-access', id] });
        },
        onError: (error: any) => {
            toast({ title: "Registration failed", description: error.message || "Registration failed", variant: "destructive" });
        }
    });

    const joinExternalMutation = useMutation({
        mutationFn: async () => {
            return eventsAPI.joinExternal(id!);
        },
        onSuccess: (res: any) => {
            if (res.url) {
                window.open(res.url, '_blank');
            }
            queryClient.invalidateQueries({ queryKey: ['event-access', id] });
        },
        onError: (error: any) => {
            toast({ title: "Failed to join external contest", description: error.message, variant: "destructive" });
        }
    });

    const handleRegister = async () => {
        if (!user) {
            toast({ title: "Please login to register", variant: "destructive" });
            return;
        }

        if (event.price === 0) {
            // Free registration
            registerMutation.mutate({});
        } else {
            // Paid registration (Razorpay)
            try {
                const order = await paymentsAPI.createOrder(id!);

                const options = {
                    key: order.keyId,
                    amount: order.amount,
                    currency: order.currency,
                    name: "CodeStudio Arena",
                    description: `Registration for ${event.title}`,
                    order_id: order.orderId,
                    handler: function (response: any) {
                        const paymentDetails = {
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        };
                        registerMutation.mutate(paymentDetails);
                    },
                    prefill: {
                        name: user.name,
                        email: user.email,
                    },
                    theme: {
                        color: "#6d28d9"
                    }
                };

                const rzp1 = new (window as any).Razorpay(options);
                rzp1.open();
            } catch (err: any) {
                toast({ title: "Failed to initiate payment", variant: "destructive" });
            }
        }
    };

    // Load Razorpay Script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); }
    }, []);

    if (isEventLoading || isAccessLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;
    if (!event) return <div className="p-20 text-center">Event not found</div>;

    const isLive = event.status === 'LIVE';
    const isUpcoming = event.status === 'UPCOMING';
    const isEnded = event.status === 'ENDED';

    // Auto-redirect to leaderboard if ended
    useEffect(() => {
        if (event && !event.isExternal && (event.status === 'ENDED' || new Date() > new Date(event.endTime))) {
            // Only redirect if user was "trying" to participate? 
            // Requirement says: "If contest.status === ENDED ... Auto redirect user to /arena/contest/:id/leaderboard"
            // But verify if this is disruptive to just "Viewing" the event detail page?
            // "Do NOT show code editor... Auto redirect".
            // If I am on Event Detail, I usually see "View Leaderboard" button anyway.
            // Maybe explicitly force it if they are trying to "Enter"?
            // The requirement implies strictly redirecting interaction flow.
            // Let's safe-guard: If I am just viewing details, maybe stay?
            // "Do NOT show code editor... Auto redirect user to .../leaderboard"
            // This suggests mainly for the Environment page. 
            // BUT, the requirement says "Contest End Redirect Logic... Auto redirect user to .../leaderboard"
            // Let's apply it here too if they are registered, or just generally?
            // If I apply it generally, they can't see the detail page anymore (history, stats etc).
            // That might be bad UX if detail page has stats.
            // Let's apply it primarily to the "Environment" page which HAS the editor.
            // For EventDetail, we just ensure the "Enter" button goes to Leaderboard (already handles this in UI logic).
        }
    }, [event]);

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            {event && (
                <SEO
                    title={`${event.title} - CodeStudio Arena`}
                    description={event.description}
                    type="website"
                    schema={JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Event",
                        "name": event.title,
                        "description": event.description,
                        "startDate": new Date(event.startTime).toISOString(),
                        "endDate": new Date(event.endTime).toISOString(),
                        "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
                        "eventStatus": "https://schema.org/EventScheduled",
                        "location": {
                            "@type": "VirtualLocation",
                            "url": window.location.href
                        },
                        "organizer": {
                            "@type": "Organization",
                            "name": "CodeStudio",
                            "url": window.location.origin
                        },
                        "offers": {
                            "@type": "Offer",
                            "price": event.price,
                            "priceCurrency": "INR",
                            "availability": "https://schema.org/InStock",
                            "url": window.location.href,
                            "validFrom": new Date(event.startTime).toISOString()
                        }
                    })}
                />
            )}

            {event && (
                <BreadcrumbSchema items={[
                    { name: 'Home', item: window.location.origin },
                    { name: 'Arena', item: `${window.location.origin}/arena` },
                    { name: event.title, item: window.location.href }
                ]} />
            )}

            {event && !event.isExternal && (
                <>
                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "FAQPage",
                            "mainEntity": [
                                {
                                    "@type": "Question",
                                    "name": "Who can participate?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "This contest is open to all registered users of CodeStudio. Ensure you have a stable internet connection." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "Which languages are allowed?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "We support C++, Java, Python, JavaScript, and Go. You can choose your preferred language for each problem." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "How is cheating detected?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "We use advanced plagiarism detection (MOSS-like) and monitor behavioral patterns (tab switching, copy-pasting) to ensure fair play." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "How is ranking calculated?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "Ranking is based on score (points per problem) and time penalties. Ties are broken by total submission time." }
                                },
                                {
                                    "@type": "Question",
                                    "name": "What happens after the contest ends?",
                                    "acceptedAnswer": { "@type": "Answer", "text": "The leaderboard is frozen for a short verification period. Once verified, ratings are updated and editorial solutions are published." }
                                }
                            ]
                        })}
                    </script>
                </>
            )}

            <Button variant="ghost" className="mb-6" onClick={() => navigate('/arena')}>&larr; Back to Arena</Button>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant={isLive ? "destructive" : isUpcoming ? "default" : "secondary"}>
                                {event.status}
                            </Badge>
                            {event.price > 0 ? (
                                <Badge variant="outline" className="text-green-500 border-green-500/50">₹{event.price}</Badge>
                            ) : (
                                <Badge variant="outline" className="text-blue-500 border-blue-500/50">Free</Badge>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold">{event.title}</h1>
                        <p className="text-muted-foreground mt-2 text-lg">{event.description}</p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-muted-foreground">Start Time</span>
                                <span className="font-mono">{format(new Date(event.startTime), "PP pp")}</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-muted-foreground">End Time</span>
                                <span className="font-mono">{format(new Date(event.endTime), "PP pp")}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Duration</span>
                                <span className="font-mono">
                                    {Math.round((new Date(event.endTime).getTime() - new Date(event.startTime).getTime()) / (1000 * 60))} mins
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                                <li>Behave professionally and ethically.</li>
                                <li>Plagiarism will result in immediate disqualification.</li>
                                <li>Ensure a stable internet connection.</li>
                                <li>Decisions by judges are final.</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-1">
                    <Card className="sticky top-20 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Registration</CardTitle>
                            <CardDescription>Join this event to compete</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {isRegistered ? (
                                <div className="flex flex-col items-center gap-3 p-4 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
                                    <ShieldCheck className="h-8 w-8" />
                                    <span className="font-semibold">Registered</span>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Entry Fee</span>
                                        <span className="font-bold">{event.price > 0 ? `₹${event.price}` : "Free"}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Includes access to all problems and leaderboard.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col gap-3">
                            {isRegistered ? (
                                event.isExternal ? (
                                    isLive || (event.externalJoinVisibleAt && new Date() >= new Date(event.externalJoinVisibleAt)) ? (
                                        <Button
                                            className="w-full bg-blue-600 hover:bg-blue-500"
                                            size="lg"
                                            onClick={() => joinExternalMutation.mutate()}
                                            disabled={joinExternalMutation.isPending}
                                        >
                                            {joinExternalMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                                            Go to {event.externalPlatform || 'Contest'}
                                        </Button>
                                    ) : (
                                        <div className="space-y-3">
                                            <Button className="w-full" variant="secondary" disabled>
                                                Join Link Hidden
                                            </Button>
                                            <p className="text-[10px] text-center text-muted-foreground">
                                                Link will be available ~15m before start.
                                            </p>
                                        </div>
                                    )
                                ) : (
                                    isLive ? (
                                        <Button className="w-full" size="lg" onClick={() => navigate(`/contest/${event.id}`)}>
                                            Enter Contest
                                        </Button>
                                    ) : isEnded ? (
                                        <Button className="w-full" variant="outline" onClick={() => navigate(`/contest/${event.id}/leaderboard`)}>
                                            View Leaderboard
                                        </Button>
                                    ) : (
                                        <Button className="w-full" variant="secondary" disabled>
                                            Starts Soon
                                        </Button>
                                    )
                                )
                            ) : (
                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleRegister}
                                    disabled={registerMutation.isPending || isEnded}
                                >
                                    {registerMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEnded ? "Registration Closed" : `Register for ${event.price > 0 ? `₹${event.price}` : "Free"}`}
                                </Button>
                            )}

                            {!isRegistered && isEnded && (
                                <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> Registration closed
                                </div>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
