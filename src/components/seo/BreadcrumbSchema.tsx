

interface BreadcrumbItem {
    name: string;
    item: string; // URL
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.item
        }))
    };

    return (
        <>
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        </>
    );
};
