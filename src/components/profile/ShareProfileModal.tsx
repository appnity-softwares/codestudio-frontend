
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, Check, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    username: string;
    displayName: string;
}

export function ShareProfileModal({ isOpen, onClose, username, displayName }: ShareProfileModalProps) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);
    const profileUrl = `${window.location.origin}/u/${username}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        toast({ title: "Link copied to clipboard" });
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadQR = () => {
        const svg = document.getElementById('profile-qr');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = 1000;
            canvas.height = 1000;
            ctx?.drawImage(img, 0, 0, 1000, 1000);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `${username}-profile-qr.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-canvas border-white/10">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-primary" />
                        Share Profile
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground whitespace-pre-line">
                        Let others scan your code to view your developer portfolio instantly.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center space-y-6 py-6">
                    <div className="p-4 bg-white rounded-2xl shadow-xl border-4 border-primary/20">
                        <QRCodeSVG
                            id="profile-qr"
                            value={profileUrl}
                            size={200}
                            level="H"
                            includeMargin={false}
                            imageSettings={{
                                src: "/logo.png", // Assuming logo exists
                                x: undefined,
                                y: undefined,
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                        />
                    </div>

                    <div className="text-center">
                        <h3 className="font-bold text-lg text-foreground">{displayName}</h3>
                        <p className="text-sm text-muted-foreground">codestudio.io/u/{username}</p>
                    </div>

                    <div className="flex items-center space-x-2 w-full">
                        <div className="grid flex-1 gap-2">
                            <Input
                                readOnly
                                value={profileUrl}
                                className="bg-black/20 border-white/10 text-xs h-9"
                            />
                        </div>
                        <Button size="sm" className="px-3 h-9" onClick={handleCopy}>
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <DialogFooter className="sm:justify-start gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-full gap-2"
                        onClick={downloadQR}
                    >
                        <Download className="h-4 w-4" />
                        Download QR
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="w-full"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
