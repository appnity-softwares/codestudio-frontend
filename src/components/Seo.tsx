import { Helmet } from 'react-helmet-async';

interface SeoProps {
    title: string;
    description?: string;
    type?: string;
    name?: string;
    image?: string;
    url?: string;
}

export const Seo = ({ title, description, type, name, image, url }: SeoProps) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name='description' content={description} />

            {/* Open Graph tags */}
            <meta property="og:type" content={type || 'website'} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {image && <meta property="og:image" content={image} />}
            {url && <meta property="og:url" content={url} />}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name || 'CodeStudio'} />
            <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
        </Helmet>
    );
};
