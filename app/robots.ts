import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://gen-2-ten.vercel.app';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/'], // Mencegah bot mengindeks endpoint API jika ada
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
