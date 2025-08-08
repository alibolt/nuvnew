import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

interface Props {
  params: Promise<{ subdomain: string }>
}

export default async function sitemap({ params }: Props): Promise<MetadataRoute.Sitemap> {
  const { subdomain } = await params
  const baseUrl = `https://${subdomain}.nuvi.com`
  
  // Get store
  const store = await prisma.store.findUnique({
    where: { subdomain },
    select: {
      id: true,
      updatedAt: true,
    }
  })
  
  if (!store) {
    return []
  }
  
  // Store homepage
  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: store.updatedAt,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ]
  
  // Get all products
  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
      isActive: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    }
  })
  
  // Add product pages
  const productPages: MetadataRoute.Sitemap = products.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))
  
  // Get all categories
  const categories = await prisma.category.findMany({
    where: {
      storeId: store.id,
    },
    select: {
      slug: true,
      updatedAt: true,
    }
  })
  
  // Add category pages
  const categoryPages: MetadataRoute.Sitemap = categories.map(category => ({
    url: `${baseUrl}/collections/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))
  
  // Get all published pages
  const customPages = await prisma.page.findMany({
    where: {
      storeId: store.id,
      published: true,
    },
    select: {
      slug: true,
      updatedAt: true,
    }
  })
  
  // Add custom pages
  const customPagesSitemap: MetadataRoute.Sitemap = customPages.map(page => ({
    url: `${baseUrl}/pages/${page.slug}`,
    lastModified: page.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }))
  
  // Static store pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/collections`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/account`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]
  
  return [...pages, ...productPages, ...categoryPages, ...customPagesSitemap, ...staticPages]
}