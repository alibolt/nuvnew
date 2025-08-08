// SEO utility functions

export function generateStructuredData(type: 'Product' | 'Organization' | 'WebSite', data: any) {
  switch (type) {
    case 'Product':
      return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: data.name,
        description: data.description,
        image: data.images || [],
        brand: {
          '@type': 'Brand',
          name: data.vendor || data.storeName,
        },
        offers: {
          '@type': 'Offer',
          priceCurrency: data.currency || 'USD',
          price: data.price,
          availability: data.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          seller: {
            '@type': 'Organization',
            name: data.storeName,
          },
        },
        aggregateRating: data.rating ? {
          '@type': 'AggregateRating',
          ratingValue: data.rating.value,
          reviewCount: data.rating.count,
        } : undefined,
      }
      
    case 'Organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url,
        logo: data.logo,
        description: data.description,
        email: data.email,
        telephone: data.phone,
        address: data.address ? {
          '@type': 'PostalAddress',
          streetAddress: data.address,
        } : undefined,
        sameAs: [
          data.facebook,
          data.instagram,
          data.twitter,
          data.youtube,
        ].filter(Boolean),
      }
      
    case 'WebSite':
      return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: data.name,
        url: data.url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${data.url}/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }
      
    default:
      return null
  }
}

export function generateBreadcrumbs(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function sanitizeMetaDescription(description: string, maxLength = 160): string {
  if (!description) return ''
  
  // Remove HTML tags
  const cleaned = description.replace(/<[^>]*>/g, '')
  
  // Trim to max length
  if (cleaned.length > maxLength) {
    return cleaned.substring(0, maxLength - 3) + '...'
  }
  
  return cleaned
}

export function generateCanonicalUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, baseUrl)
  
  // Only include allowed parameters (for pagination, etc.)
  const allowedParams = ['page', 'sort']
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (allowedParams.includes(key)) {
        url.searchParams.set(key, value)
      }
    })
  }
  
  return url.toString()
}