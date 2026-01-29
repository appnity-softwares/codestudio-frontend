/**
 * Image URL detection utilities
 * Used for paste-to-preview image messages
 */

// Allowed image hosts (should match backend allowlist)
const ALLOWED_IMAGE_HOSTS = [
    'images.unsplash.com',
    'source.unsplash.com',
    'cdn.jsdelivr.net',
    'raw.githubusercontent.com',
    'user-images.githubusercontent.com',
    'avatars.githubusercontent.com',
    'i.imgur.com',
    'imgur.com',
    'storage.googleapis.com',
    's3.amazonaws.com',
    'res.cloudinary.com',
    'imagedelivery.net',
    'via.placeholder.com',
    'picsum.photos',
    'placekitten.com',
    'placehold.co',
];

// Allowed image extensions
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|webp|gif|svg)$/i;

// CDNs that don't require file extensions
const NO_EXTENSION_HOSTS = [
    'picsum.photos',
    'source.unsplash.com',
    'via.placeholder.com',
    'placehold.co',
    'imagedelivery.net',
    'res.cloudinary.com',
];

/**
 * Check if a string is a valid image URL
 * @param text - The text to check
 * @returns true if it's a valid image URL from allowed hosts
 */
export function isImageUrl(text: string): boolean {
    if (!text || typeof text !== 'string') return false;

    try {
        const trimmed = text.trim();
        const url = new URL(trimmed);

        // Only HTTPS
        if (url.protocol !== 'https:') return false;

        // Check if host is allowed
        const hostAllowed = ALLOWED_IMAGE_HOSTS.some(
            (host) => url.host === host || url.host.endsWith(`.${host}`)
        );
        if (!hostAllowed) return false;

        // Check extension (or if it's a CDN that doesn't need extensions)
        const hasExtension = IMAGE_EXTENSIONS.test(url.pathname);
        const isNoExtensionCDN = NO_EXTENSION_HOSTS.some((host) => url.host.includes(host));

        return hasExtension || isNoExtensionCDN;
    } catch {
        return false;
    }
}

/**
 * Extract image dimensions from metadata JSON
 */
export function parseImageMetadata(metadata: string | undefined): {
    width?: number;
    height?: number;
    aspectRatio?: number;
} {
    if (!metadata) return {};

    try {
        const parsed = JSON.parse(metadata);
        return {
            width: parsed.width,
            height: parsed.height,
            aspectRatio: parsed.aspectRatio || (parsed.width && parsed.height ? parsed.width / parsed.height : undefined),
        };
    } catch {
        return {};
    }
}

/**
 * Get a human-readable list of allowed hosts
 */
export function getAllowedHostsText(): string {
    return 'Unsplash, GitHub, Imgur, Cloudinary, Picsum';
}
