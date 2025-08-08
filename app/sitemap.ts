import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://nuvi.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
  
  // Get all active stores
  const stores = await prisma.store.findMany({
    where: {
      status: 'active'
    },
    select: {
      subdomain: true,
      updatedAt: true,
    }
  })
  
  // Generate store homepages
  const storePages: MetadataRoute.Sitemap = stores.map(store => ({
    url: `https://${store.subdomain}.nuvi.com`,
    lastModified: store.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.9,
  }))
  
  return [...staticPages, ...storePages]
}