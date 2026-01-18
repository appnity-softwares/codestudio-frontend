import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { registrationsAPI, paymentsAPI } from '@/lib/api';
import { Loader2, CreditCard } from 'lucide-react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    event: any;
    onSuccess: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, event, onSuccess }) => {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsSubmitting(true);
        try {
            const res = await loadRazorpay();
            if (!res) {
                toast({ title: "Error", description: "Razorpay SDK failed to load", variant: "destructive" });
                return;
            }

            // 1. Create Order
            const orderData = await paymentsAPI.createOrder(event.id);

            // 2. Open Razorpay
            const options = {
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "DevConnect Arena",
                description: `Entry Fee for ${event.title}`,
                order_id: orderData.orderId,
                handler: async function (response: any) {
                    try {
                        // 3. Verify Payment
                        await paymentsAPI.verifyPayment({
                            eventId: event.id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });

                        toast({ title: "Registration Successful", description: "See you in the arena!" });
                        onSuccess();
                        onClose();
                    } catch (verifyError) {
                        toast({ title: "Verification Failed", description: "Payment verified failed on server.", variant: "destructive" });
                    }
                },
                prefill: {
                    name: "DevConnect User", // In real app, fill from user context
                    email: "user@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#dc2626" // Red-600 to match theme
                }
            };

            const paymentObject = new (window as any).Razorpay(options);
            paymentObject.open();

        } catch (error: any) {
            console.error(error);
            toast({ title: "Payment Failed", description: error.message || "Could not initiate payment", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFreeRegistration = async () => {
        setIsSubmitting(true);
        try {
            await registrationsAPI.register(event.id);
            toast({ title: "Registration Successful", description: "You have joined the event." });
            onSuccess();
            onClose();
        } catch (error: any) {
            toast({ title: "Registration Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFree = event.entryFee === 0;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-neutral-800 text-white">
                <DialogHeader>
                    <DialogTitle>Register for {event.title}</DialogTitle>
                    <DialogDescription className="text-neutral-400">
                        {isFree ? "Confirm your spot for this event." : `Entry Fee: ₹${event.entryFee}`}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    {!isFree ? (
                        <>
                            <div className="bg-red-900/20 p-6 rounded-full">
                                <CreditCard className="w-12 h-12 text-red-500" />
                            </div>
                            <p className="text-center text-neutral-300 text-sm max-w-[200px]">
                                secure payment via Razorpay.
                            </p>
                        </>
                    ) : (
                        <p className="text-center text-neutral-300">
                            Ready to prove your skills?
                        </p>
                    )}
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button
                        type="button"
                        onClick={isFree ? handleFreeRegistration : handlePayment}
                        disabled={isSubmitting}
                        className={`w-full font-bold ${isFree ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isFree ? "Confirm Registration" : `Pay ₹${event.entryFee} & Register`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default RegistrationModal;
