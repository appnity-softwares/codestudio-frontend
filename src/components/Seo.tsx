import { useEffect } from "react";

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
}

export function Seo({
    title = "CodeStudio | The Social Platform for Developers",
    description = "Connect with developers worldwide, share code snippets, participate in coding contests, and build your digital engineering presence on CodeStudio.",
    keywords = "social media, developer, tech, codestudio, coding contests, code snippets, engineering portfolio, devconnect",
    image = "/og-image.png",
    url = window.location.href,
    type = "website"
}: SEOProps) {
    useEffect(() => {
        // Update Title
        document.title = title;

        // Update Meta Tags
        const updateMeta = (name: string, content: string, isProperty: boolean = false) => {
            let element = document.querySelector(isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`);
            if (element) {
                element.setAttribute("content", content);
            } else {
                element = document.createElement("meta");
                if (isProperty) {
                    element.setAttribute("property", name);
                } else {
                    element.setAttribute("name", name);
                }
                element.setAttribute("content", content);
                document.head.appendChild(element);
            }
        };

        updateMeta("description", description);
        updateMeta("keywords", keywords);

        // OpenGraph
        updateMeta("og:title", title, true);
        updateMeta("og:description", description, true);
        updateMeta("og:image", image, true);
        updateMeta("og:url", url, true);
        updateMeta("og:type", type, true);

        // Twitter
        updateMeta("twitter:card", "summary_large_image");
        updateMeta("twitter:title", title);
        updateMeta("twitter:description", description);
        updateMeta("twitter:image", image);

        // Structured Data (JSON-LD)
        const schema = {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "CodeStudio",
            "operatingSystem": "Web",
            "applicationCategory": "DeveloperApplication",
            "description": description,
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "ratingCount": "1000"
            },
            "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
            }
        };

        let schemaScript = document.querySelector('script[type="application/ld+json"]');
        if (!schemaScript) {
            schemaScript = document.createElement("script");
            schemaScript.setAttribute("type", "application/ld+json");
            document.head.appendChild(schemaScript);
        }
        schemaScript.textContent = JSON.stringify(schema);

    }, [title, description, keywords, image, url, type]);

    return null;
}

