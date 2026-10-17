import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://novarion.web.id';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/privacy'],
        disallow: ['/app/', '/admin/', '/auth/', '/api/', '/login'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
