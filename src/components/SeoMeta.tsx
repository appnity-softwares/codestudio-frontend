

interface SEOProps {
    title: string;
    description?: string;
    name?: string;
    type?: string;
    image?: string;
    url?: string;
    schema?: string;
    children?: React.ReactNode;
}

export default function SEO({ title, description, name = 'CodeStudio', type = 'website', image, url, schema, children }: SEOProps) {
    return (
        <>
            {/* Standard metadata tags */}
            <title>{title} | {name}</title>
            <meta name='description' content={description} />

            {/* Open Graph tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}

            {/* Schema.org */}
            {schema && <script type="application/ld+json">{schema}</script>}

            {children}
        </>
    );
}
