import { memo } from 'react';
import { cn } from '@/lib/utils';
import { X, Send, AlertCircle, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAllowedHostsText } from '@/utils/imageUrl';

interface ImageLinkPreviewProps {
    url: string;
    onCancel: () => void;
    onSend: () => void;
    isLoading?: boolean;
    error?: string;
    className?: string;
}

/**
 * ImageLinkPreview - Preview component for pasted image URLs
 * 
 * Features:
 * - Shows image preview before sending
 * - Cancel/Send actions with explicit user intent
 * - Error fallback for broken images
 * - Safe rendering (no dangerouslySetInnerHTML)
 */
export const ImageLinkPreview = memo(function ImageLinkPreview({
    url,
    onCancel,
    onSend,
    isLoading = false,
    error,
    className,
}: ImageLinkPreviewProps) {
    return (
        <div className={cn(
            "p-3 border-t border-border bg-card/80 backdrop-blur-sm",
            "animate-in slide-in-from-bottom-2 duration-200",
            className
        )}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    <span>Image Preview</span>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onCancel}
                    aria-label="Cancel image"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Preview Image */}
            <div className="relative rounded-lg overflow-hidden bg-muted/30 mb-3">
                <img
                    src={url}
                    alt="Preview"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="max-w-full max-h-[280px] mx-auto object-contain"
                    onError={(e) => {
                        // Replace with broken image placeholder
                        const target = e.currentTarget;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent && !parent.querySelector('.error-placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'error-placeholder flex flex-col items-center justify-center py-8 text-muted-foreground';
                            placeholder.innerHTML = `
                <svg class="h-12 w-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs">Failed to load image</span>
              `;
                            parent.appendChild(placeholder);
                        }
                    }}
                />
            </div>

            {/* URL Display (truncated) */}
            <div className="text-[10px] text-muted-foreground truncate mb-3 px-1">
                {url.length > 80 ? `${url.substring(0, 80)}...` : url}
            </div>

            {/* Error Display */}
            {error && (
                <div className="flex items-center gap-2 text-xs text-destructive mb-3 px-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] text-muted-foreground">
                    Supported: {getAllowedHostsText()}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        size="sm"
                        onClick={onSend}
                        disabled={isLoading}
                        className="gap-1.5"
                    >
                        <Send className="h-3.5 w-3.5" />
                        Send Image
                    </Button>
                </div>
            </div>
        </div>
    );
});
