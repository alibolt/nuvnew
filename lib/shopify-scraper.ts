// Shopify store scraper service
// This service uses both Shopify Storefront API and web scraping as fallback

interface ShopifyProduct {
  title: string;
  description: string;
  handle: string;
  images: Array<{
    url: string;
    altText?: string;
  }>;
  variants: Array<{
    title: string;
    price: number;
    compareAtPrice?: number;
    availableForSale: boolean;
    options: Array<{
      name: string;
      value: string;
    }>;
    image?: {
      url: string;
      altText?: string;
    };
  }>;
  tags?: string[];
  vendor?: string;
  productType?: string;
}

interface ShopifyCollection {
  title: string;
  description?: string;
  handle: string;
  image?: {
    url: string;
    altText?: string;
  };
  products?: string[]; // Product handles
}

interface ShopifyStoreInfo {
  name: string;
  description?: string;
  domain: string;
  logo?: string;
  favicon?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

interface ShopifyPage {
  title: string;
  handle: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

interface ShopifyTheme {
  name?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    text?: string;
  };
  fonts?: {
    heading?: string;
    body?: string;
  };
  logo?: string;
  favicon?: string;
}

interface ShopifySection {
  type: string;
  content: any;
  settings?: any;
}

interface ShopifyData {
  store: ShopifyStoreInfo;
  products: ShopifyProduct[];
  collections: ShopifyCollection[];
  pages: ShopifyPage[];
  theme: ShopifyTheme;
  sections: ShopifySection[];
  navigation?: {
    main?: Array<{ title: string; url: string; }>;
    footer?: Array<{ title: string; url: string; }>;
  };
}

// HTML parsing helper
function extractJsonLd(html: string): any[] {
  const jsonLdRegex = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g;
  const matches = [...html.matchAll(jsonLdRegex)];
  const results = [];

  for (const match of matches) {
    try {
      const data = JSON.parse(match[1]);
      results.push(data);
    } catch (e) {
      // Invalid JSON, skip
    }
  }

  return results;
}

// Extract product data from HTML
function extractProductFromHtml(html: string): Partial<ShopifyProduct> | null {
  try {
    // Try to find product data in JSON-LD
    const jsonLdData = extractJsonLd(html);
    const productData = jsonLdData.find(
      (data) => data['@type'] === 'Product' || data['@type'] === 'ProductGroup'
    );

    if (productData) {
      const product: Partial<ShopifyProduct> = {
        title: productData.name,
        description: productData.description,
        images: productData.image
          ? Array.isArray(productData.image)
            ? productData.image.map((url: string) => ({ url }))
            : [{ url: productData.image }]
          : [],
      };

      // Extract variants from offers
      if (productData.offers) {
        const offers = Array.isArray(productData.offers)
          ? productData.offers
          : [productData.offers];

        product.variants = offers.map((offer: any) => ({
          title: offer.name || 'Default',
          price: parseFloat(offer.price || '0'),
          availableForSale: offer.availability === 'https://schema.org/InStock',
          options: [],
        }));
      }

      return product;
    }

    // Fallback to meta tags
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);

    if (titleMatch) {
      return {
        title: titleMatch[1],
        description: descMatch?.[1],
        images: imageMatch ? [{ url: imageMatch[1] }] : [],
      };
    }

    return null;
  } catch (error) {
    console.error('Error extracting product from HTML:', error);
    return null;
  }
}

// Main scraper class
export class ShopifyScraper {
  private baseUrl: string;
  private domain: string;

  constructor(shopifyUrl: string) {
    // Normalize URL
    let cleanUrl = shopifyUrl.trim();
    if (!cleanUrl.includes('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    this.baseUrl = cleanUrl.replace(/\/$/, ''); // Remove trailing slash
    this.domain = new URL(this.baseUrl).hostname;
  }

  // Fetch HTML content
  private async fetchHtml(path: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.text();
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      throw error;
    }
  }

  // Get store information
  async getStoreInfo(): Promise<ShopifyStoreInfo> {
    try {
      const html = await this.fetchHtml('');
      
      // Extract store name from title
      const titleMatch = html.match(/<title>([^<]+)<\/title>/);
      const storeName = titleMatch
        ? titleMatch[1].replace(' – ', ' - ').split(' - ')[0].trim()
        : this.domain;

      // Extract description
      const descMatch = html.match(
        /<meta name="description" content="([^"]+)"/
      );

      // Extract logo
      const logoMatch = html.match(
        /<img[^>]+class="[^"]*logo[^"]*"[^>]+src="([^"]+)"/i
      );

      // Extract social links
      const facebookMatch = html.match(/facebook\.com\/([^"'\s]+)/);
      const instagramMatch = html.match(/instagram\.com\/([^"'\s]+)/);
      const twitterMatch = html.match(/twitter\.com\/([^"'\s]+)/);
      const youtubeMatch = html.match(/youtube\.com\/([^"'\s]+)/);

      return {
        name: storeName,
        description: descMatch?.[1],
        domain: this.domain,
        logo: logoMatch?.[1],
        socialLinks: {
          facebook: facebookMatch ? `https://facebook.com/${facebookMatch[1]}` : undefined,
          instagram: instagramMatch ? `https://instagram.com/${instagramMatch[1]}` : undefined,
          twitter: twitterMatch ? `https://twitter.com/${twitterMatch[1]}` : undefined,
          youtube: youtubeMatch ? `https://youtube.com/${youtubeMatch[1]}` : undefined,
        },
      };
    } catch (error) {
      console.error('Error getting store info:', error);
      return {
        name: this.domain,
        domain: this.domain,
      };
    }
  }

  // Get products from sitemap or collections
  async getProducts(limit: number = 50): Promise<ShopifyProduct[]> {
    const products: ShopifyProduct[] = [];

    try {
      // Try sitemap first
      const sitemapXml = await this.fetchHtml('/sitemap_products_1.xml').catch(
        () => null
      );

      if (sitemapXml) {
        // Parse product URLs from sitemap
        const urlMatches = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)];
        const productUrls = urlMatches
          .map((m) => m[1])
          .filter((url) => url.includes('/products/'))
          .slice(0, limit);

        // Fetch each product
        for (const url of productUrls) {
          const path = new URL(url).pathname;
          const html = await this.fetchHtml(path).catch(() => null);
          
          if (html) {
            const product = extractProductFromHtml(html);
            if (product && product.title) {
              products.push({
                title: product.title,
                description: product.description || '',
                handle: path.split('/').pop() || '',
                images: product.images || [],
                variants: product.variants || [
                  {
                    title: 'Default',
                    price: 0,
                    availableForSale: true,
                    options: [],
                  },
                ],
              });
            }
          }

          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // If no sitemap, try /products.json endpoint
      if (products.length === 0) {
        const response = await fetch(`${this.baseUrl}/products.json?limit=${limit}`);
        if (response.ok) {
          const data = await response.json();
          if (data.products) {
            for (const p of data.products) {
              products.push({
                title: p.title,
                description: p.body_html || '',
                handle: p.handle,
                vendor: p.vendor,
                productType: p.product_type,
                tags: p.tags ? p.tags.split(', ') : [],
                images: p.images?.map((img: any) => ({
                  url: img.src,
                  altText: img.alt,
                })) || [],
                variants: p.variants?.map((v: any) => ({
                  title: v.title,
                  price: parseFloat(v.price),
                  compareAtPrice: v.compare_at_price
                    ? parseFloat(v.compare_at_price)
                    : undefined,
                  availableForSale: v.available,
                  options: v.option1
                    ? [
                        { name: 'Option1', value: v.option1 },
                        ...(v.option2 ? [{ name: 'Option2', value: v.option2 }] : []),
                        ...(v.option3 ? [{ name: 'Option3', value: v.option3 }] : []),
                      ]
                    : [],
                })) || [],
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error getting products:', error);
    }

    return products;
  }

  // Get collections
  async getCollections(): Promise<ShopifyCollection[]> {
    const collections: ShopifyCollection[] = [];

    try {
      // Try collections.json endpoint
      const response = await fetch(`${this.baseUrl}/collections.json`);
      if (response.ok) {
        const data = await response.json();
        if (data.collections) {
          for (const c of data.collections) {
            collections.push({
              title: c.title,
              description: c.body_html,
              handle: c.handle,
              image: c.image ? { url: c.image.src, altText: c.image.alt } : undefined,
            });
          }
        }
      } else {
        // Fallback to HTML scraping
        const html = await this.fetchHtml('/collections');
        
        // Extract collection links
        const collectionLinks = [
          ...html.matchAll(/<a[^>]+href="\/collections\/([^"]+)"[^>]*>([^<]+)<\/a>/g),
        ];

        for (const [, handle, title] of collectionLinks.slice(0, 10)) {
          collections.push({
            title: title.trim(),
            handle,
          });
        }
      }
    } catch (error) {
      console.error('Error getting collections:', error);
    }

    return collections;
  }

  // Get pages
  async getPages(): Promise<ShopifyPage[]> {
    const pages: ShopifyPage[] = [];
    const standardPages = ['/pages/about', '/pages/contact', '/pages/shipping-policy', 
                          '/pages/privacy-policy', '/pages/terms-of-service', '/pages/refund-policy'];

    for (const pagePath of standardPages) {
      try {
        const html = await this.fetchHtml(pagePath);
        
        // Extract page title
        const titleMatch = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
        const metaTitleMatch = html.match(/<title>([^<]+)<\/title>/);
        const metaDescMatch = html.match(/<meta name="description" content="([^"]+)"/);
        
        // Extract main content
        const contentMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
        let content = '';
        
        if (contentMatch) {
          // Clean HTML content
          content = contentMatch[1]
            .replace(/<script[\s\S]*?<\/script>/g, '')
            .replace(/<style[\s\S]*?<\/style>/g, '')
            .trim();
        }
        
        if (titleMatch || metaTitleMatch) {
          pages.push({
            title: titleMatch?.[1] || metaTitleMatch?.[1].split(' – ')[0] || '',
            handle: pagePath.split('/').pop() || '',
            content: content,
            metaTitle: metaTitleMatch?.[1],
            metaDescription: metaDescMatch?.[1],
          });
        }
      } catch (error) {
        // Page doesn't exist, skip
      }
    }

    return pages;
  }

  // Get theme information
  async getTheme(): Promise<ShopifyTheme> {
    try {
      const html = await this.fetchHtml('');
      
      // Extract CSS variables and theme colors
      const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
      const theme: ShopifyTheme = {};
      
      if (styleMatch) {
        const cssContent = styleMatch.join(' ');
        
        // Try to find CSS variables
        const primaryColorMatch = cssContent.match(/--color-primary:\s*([^;]+)/);
        const bgColorMatch = cssContent.match(/--color-background:\s*([^;]+)/);
        
        if (primaryColorMatch || bgColorMatch) {
          theme.colors = {
            primary: primaryColorMatch?.[1]?.trim(),
            background: bgColorMatch?.[1]?.trim(),
          };
        }
      }
      
      // Extract logo
      const logoMatch = html.match(/<img[^>]*class="[^"]*logo[^"]*"[^>]*src="([^"]+)"/i);
      if (logoMatch) {
        theme.logo = logoMatch[1];
      }
      
      // Extract favicon
      const faviconMatch = html.match(/<link[^>]*rel="icon"[^>]*href="([^"]+)"/);
      if (faviconMatch) {
        theme.favicon = faviconMatch[1];
      }
      
      return theme;
    } catch (error) {
      return {};
    }
  }

  // Extract sections from homepage
  async getSections(): Promise<ShopifySection[]> {
    const sections: ShopifySection[] = [];
    
    try {
      const html = await this.fetchHtml('');
      
      // Common Shopify sections
      const sectionPatterns = [
        { type: 'hero', pattern: /<section[^>]*class="[^"]*hero[^"]*"[^>]*>([\s\S]*?)<\/section>/i },
        { type: 'featured-products', pattern: /<section[^>]*class="[^"]*featured[^"]*"[^>]*>([\s\S]*?)<\/section>/i },
        { type: 'banner', pattern: /<section[^>]*class="[^"]*banner[^"]*"[^>]*>([\s\S]*?)<\/section>/i },
        { type: 'newsletter', pattern: /<section[^>]*class="[^"]*newsletter[^"]*"[^>]*>([\s\S]*?)<\/section>/i },
      ];
      
      for (const { type, pattern } of sectionPatterns) {
        const match = html.match(pattern);
        if (match) {
          // Extract text content and images
          const sectionHtml = match[1];
          const textContent = sectionHtml
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          
          const images = [...sectionHtml.matchAll(/<img[^>]+src="([^"]+)"[^>]*>/g)]
            .map(m => m[1]);
          
          sections.push({
            type,
            content: {
              text: textContent,
              images,
              html: sectionHtml,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error extracting sections:', error);
    }
    
    return sections;
  }

  // Get navigation menus
  async getNavigation() {
    try {
      const html = await this.fetchHtml('');
      
      // Extract main navigation
      const mainNavMatch = html.match(/<nav[^>]*class="[^"]*main[^"]*"[^>]*>([\s\S]*?)<\/nav>/i);
      const mainLinks: Array<{ title: string; url: string }> = [];
      
      if (mainNavMatch) {
        const linkMatches = [...mainNavMatch[1].matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
        for (const [, url, title] of linkMatches) {
          if (!url.includes('javascript:') && title.trim()) {
            mainLinks.push({ title: title.trim(), url });
          }
        }
      }
      
      // Extract footer navigation
      const footerMatch = html.match(/<footer[^>]*>([\s\S]*?)<\/footer>/i);
      const footerLinks: Array<{ title: string; url: string }> = [];
      
      if (footerMatch) {
        const linkMatches = [...footerMatch[1].matchAll(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g)];
        for (const [, url, title] of linkMatches) {
          if (!url.includes('javascript:') && title.trim()) {
            footerLinks.push({ title: title.trim(), url });
          }
        }
      }
      
      return {
        main: mainLinks,
        footer: footerLinks,
      };
    } catch (error) {
      return {};
    }
  }

  // Main scrape method
  async scrape(): Promise<ShopifyData> {
    const [store, products, collections, pages, theme, sections, navigation] = await Promise.all([
      this.getStoreInfo(),
      this.getProducts(),
      this.getCollections(),
      this.getPages(),
      this.getTheme(),
      this.getSections(),
      this.getNavigation(),
    ]);

    return {
      store,
      products,
      collections,
      pages,
      theme,
      sections,
      navigation,
    };
  }
}