import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/login',
          '/register',
          '/_next/',
          '/preview/',
          '/theme-studio/',
        ],
      },
    ],
    sitemap: 'https://nuvi.com/sitemap.xml',
  }
}