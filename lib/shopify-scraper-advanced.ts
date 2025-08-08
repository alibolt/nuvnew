import type { Page, Browser } from 'puppeteer';
import * as cheerio from 'cheerio';
import PQueue from 'p-queue';
import { getPuppeteerLaunchOptions } from './puppeteer-helper';

// Dynamic imports to handle environments where Puppeteer might not be available
let puppeteer: any;
let StealthPlugin: any;

async function initPuppeteer() {
  try {
    const puppeteerExtra = await import('puppeteer-extra');
    puppeteer = puppeteerExtra.default;
    
    const stealthPlugin = await import('puppeteer-extra-plugin-stealth');
    StealthPlugin = stealthPlugin.default;
    
    // Use stealth plugin to avoid detection
    puppeteer.use(StealthPlugin());
    
    return true;
  } catch (error) {
    console.error('Puppeteer initialization failed:', error);
    return false;
  }
}

interface ScraperOptions {
  headless?: boolean;
  timeout?: number;
  maxConcurrency?: number;
  userAgent?: string;
  proxy?: string;
}

interface ProductData {
  title: string;
  description: string;
  handle: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: Array<{
    title: string;
    price: number;
    compareAtPrice?: number;
    available: boolean;
    options: { [key: string]: string };
  }>;
  tags: string[];
  vendor?: string;
  type?: string;
}

interface CollectionData {
  title: string;
  handle: string;
  description?: string;
  image?: string;
  productCount?: number;
}

interface PageData {
  title: string;
  handle: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
}

export class AdvancedShopifyScraper {
  private browser: Browser | null = null;
  private queue: PQueue;
  private options: ScraperOptions;
  private baseUrl: string;

  constructor(shopifyUrl: string, options: ScraperOptions = {}) {
    this.baseUrl = this.normalizeUrl(shopifyUrl);
    this.options = {
      headless: true,
      timeout: 30000,
      maxConcurrency: 3,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ...options
    };
    
    this.queue = new PQueue({ concurrency: this.options.maxConcurrency });
  }

  private normalizeUrl(url: string): string {
    let cleanUrl = url.trim();
    if (!cleanUrl.includes('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    return cleanUrl.replace(/\/$/, '');
  }

  async initialize(): Promise<void> {
    // Initialize Puppeteer if not already done
    const puppeteerAvailable = await initPuppeteer();
    if (!puppeteerAvailable) {
      throw new Error('Puppeteer is not available');
    }

    const launchOptions = getPuppeteerLaunchOptions();
    launchOptions.headless = this.options.headless;

    if (this.options.proxy) {
      launchOptions.args.push(`--proxy-server=${this.options.proxy}`);
    }

    this.browser = await puppeteer.launch(launchOptions);
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }

    const page = await this.browser.newPage();
    
    // Set user agent
    await page.setUserAgent(this.options.userAgent!);
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set timeout
    page.setDefaultTimeout(this.options.timeout!);
    page.setDefaultNavigationTimeout(this.options.timeout!);

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['font', 'media'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  async scrapeStoreInfo(): Promise<any> {
    const page = await this.createPage();
    
    try {
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      const storeData = await page.evaluate(() => {
        const getMetaContent = (name: string) => {
          const meta = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
          return meta?.getAttribute('content') || '';
        };

        return {
          name: document.title.split(' – ')[0] || '',
          description: getMetaContent('description'),
          logo: document.querySelector('img[src*="logo"], .logo img, .header__logo img')?.getAttribute('src') || '',
          favicon: document.querySelector('link[rel="icon"]')?.getAttribute('href') || '',
          socialLinks: {
            facebook: (Array.from(document.querySelectorAll('a[href*="facebook.com"]'))[0] as HTMLAnchorElement)?.href || '',
            instagram: (Array.from(document.querySelectorAll('a[href*="instagram.com"]'))[0] as HTMLAnchorElement)?.href || '',
            twitter: (Array.from(document.querySelectorAll('a[href*="twitter.com"]'))[0] as HTMLAnchorElement)?.href || '',
          },
          currency: (window as any).Shopify?.currency?.active || 'USD',
          locale: (window as any).Shopify?.locale || 'en',
        };
      });

      return {
        ...storeData,
        domain: this.baseUrl,
      };
    } finally {
      await page.close();
    }
  }

  async scrapeProducts(limit: number = 50): Promise<ProductData[]> {
    const products: ProductData[] = [];
    const page = await this.createPage();

    try {
      // First, try to get products from sitemap
      const sitemapUrl = `${this.baseUrl}/sitemap_products_1.xml`;
      await page.goto(sitemapUrl, { waitUntil: 'networkidle2' });
      
      const productUrls = await page.evaluate(() => {
        const urls: string[] = [];
        const locs = document.querySelectorAll('loc');
        locs.forEach(loc => {
          const url = loc.textContent;
          if (url && url.includes('/products/')) {
            urls.push(url);
          }
        });
        return urls;
      });

      // If no sitemap, try products page
      if (productUrls.length === 0) {
        await page.goto(`${this.baseUrl}/collections/all`, { waitUntil: 'networkidle2' });
        
        const collectionUrls = await page.evaluate(() => {
          const urls: string[] = [];
          const links = document.querySelectorAll('a[href*="/products/"]');
          links.forEach(link => {
            const href = link.getAttribute('href');
            if (href) {
              urls.push(href.startsWith('http') ? href : window.location.origin + href);
            }
          });
          return [...new Set(urls)];
        });
        
        productUrls.push(...collectionUrls);
      }

      // Scrape individual products
      const urlsToScrape = productUrls.slice(0, limit);
      
      for (const url of urlsToScrape) {
        const productData = await this.queue.add(async () => {
          return await this.scrapeProduct(url);
        });
        
        if (productData) {
          products.push(productData);
        }
      }

      return products;
    } finally {
      await page.close();
    }
  }

  private async scrapeProduct(url: string): Promise<ProductData | null> {
    const page = await this.createPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for product data to load
      await page.waitForSelector('[data-product-json], script[type="application/ld+json"]', { timeout: 10000 }).catch(() => {});

      const productData = await page.evaluate(() => {
        // Try to get product JSON data
        const productJson = document.querySelector('[data-product-json]')?.textContent;
        if (productJson) {
          try {
            return JSON.parse(productJson);
          } catch (e) {}
        }

        // Try LD+JSON
        const ldJsonScripts = document.querySelectorAll('script[type="application/ld+json"]');
        for (const script of ldJsonScripts) {
          try {
            const data = JSON.parse(script.textContent || '');
            if (data['@type'] === 'Product') {
              return data;
            }
          } catch (e) {}
        }

        // Fallback to manual extraction
        const getTextContent = (selector: string) => {
          return document.querySelector(selector)?.textContent?.trim() || '';
        };

        const getImageUrls = () => {
          const images: string[] = [];
          document.querySelectorAll('.product__media img, .product-single__photo img, [data-product-single-media-wrapper] img').forEach(img => {
            const src = img.getAttribute('src') || img.getAttribute('data-src');
            if (src) {
              images.push(src.startsWith('//') ? 'https:' + src : src);
            }
          });
          return images;
        };

        return {
          title: getTextContent('h1, .product__title, .product-single__title'),
          description: getTextContent('.product__description, .product-single__description, [data-product-description]'),
          vendor: getTextContent('.product__vendor, .product-single__vendor'),
          price: getTextContent('.price, .product__price, .product-single__price'),
          images: getImageUrls()
        };
      });

      if (!productData || !productData.title) {
        return null;
      }

      // Parse the data into our format
      const handle = url.split('/products/').pop()?.split('?')[0] || '';
      
      let variants: any[] = [];
      let price = 0;
      let compareAtPrice = undefined;

      if (productData.variants) {
        variants = productData.variants.map((v: any) => ({
          title: v.title || v.name || 'Default',
          price: parseFloat(v.price) / 100,
          compareAtPrice: v.compare_at_price ? parseFloat(v.compare_at_price) / 100 : undefined,
          available: v.available ?? true,
          options: v.options || {}
        }));
        price = variants[0]?.price || 0;
        compareAtPrice = variants[0]?.compareAtPrice;
      } else if (productData.offers) {
        // LD+JSON format
        const offers = Array.isArray(productData.offers) ? productData.offers : [productData.offers];
        variants = offers.map((offer: any) => ({
          title: offer.name || 'Default',
          price: parseFloat(offer.price || offer.lowPrice || '0'),
          available: offer.availability === 'https://schema.org/InStock',
          options: {}
        }));
        price = variants[0]?.price || 0;
      } else if (productData.price) {
        // Simple price string
        price = parseFloat(productData.price.replace(/[^0-9.]/g, ''));
        variants = [{
          title: 'Default',
          price: price,
          available: true,
          options: {}
        }];
      }

      return {
        title: productData.title || productData.name || '',
        description: productData.description || '',
        handle: handle,
        price: price,
        compareAtPrice: compareAtPrice,
        images: productData.images || productData.image || [],
        variants: variants,
        tags: productData.tags || [],
        vendor: productData.vendor || productData.brand?.name || '',
        type: productData.product_type || productData.category || ''
      };
    } catch (error) {
      console.error(`Error scraping product ${url}:`, error);
      return null;
    } finally {
      await page.close();
    }
  }

  async scrapeCollections(): Promise<CollectionData[]> {
    const page = await this.createPage();
    const collections: CollectionData[] = [];

    try {
      // Try collections page
      await page.goto(`${this.baseUrl}/collections`, { waitUntil: 'networkidle2' });

      const collectionData = await page.evaluate(() => {
        const collections: any[] = [];
        
        // Common collection selectors
        const collectionElements = document.querySelectorAll(
          '.collection-grid-item, .collection-list__item, .collection-item, [data-collection-id]'
        );

        collectionElements.forEach(el => {
          const link = el.querySelector('a')?.href || '';
          const title = el.querySelector('h2, h3, .collection-grid-item__title')?.textContent?.trim() || '';
          const image = el.querySelector('img')?.src || '';
          
          if (link && title) {
            collections.push({
              title,
              handle: link.split('/collections/').pop()?.split('?')[0] || '',
              image: image.startsWith('//') ? 'https:' + image : image
            });
          }
        });

        // If no collections found, try links
        if (collections.length === 0) {
          document.querySelectorAll('a[href*="/collections/"]').forEach(link => {
            const href = link.getAttribute('href') || '';
            const title = link.textContent?.trim() || '';
            
            if (href && title && !href.includes('/products/')) {
              collections.push({
                title,
                handle: href.split('/collections/').pop()?.split('?')[0] || ''
              });
            }
          });
        }

        return collections;
      });

      // Deduplicate by handle
      const uniqueCollections = new Map<string, CollectionData>();
      collectionData.forEach(col => {
        if (col.handle && !uniqueCollections.has(col.handle)) {
          uniqueCollections.set(col.handle, col);
        }
      });

      collections.push(...uniqueCollections.values());
    } catch (error) {
      console.error('Error scraping collections:', error);
    } finally {
      await page.close();
    }

    return collections;
  }

  async scrapePages(): Promise<PageData[]> {
    const pages: PageData[] = [];
    const commonPages = [
      'about', 'about-us', 'contact', 'contact-us',
      'shipping-policy', 'privacy-policy', 'terms-of-service',
      'refund-policy', 'return-policy', 'faq'
    ];

    for (const pageName of commonPages) {
      const pageData = await this.queue.add(async () => {
        return await this.scrapePage(pageName);
      });
      
      if (pageData) {
        pages.push(pageData);
      }
    }

    return pages;
  }

  private async scrapePage(handle: string): Promise<PageData | null> {
    const page = await this.createPage();
    
    try {
      await page.goto(`${this.baseUrl}/pages/${handle}`, { waitUntil: 'networkidle2' });
      
      const pageData = await page.evaluate(() => {
        const title = document.querySelector('h1')?.textContent?.trim() || 
                     document.querySelector('.page-title')?.textContent?.trim() || '';
        
        const contentElement = document.querySelector('main, .page-content, .rte, [data-section-type="page"]');
        let content = '';
        
        if (contentElement) {
          // Clone and clean the content
          const clone = contentElement.cloneNode(true) as HTMLElement;
          
          // Remove scripts and styles
          clone.querySelectorAll('script, style').forEach(el => el.remove());
          
          content = clone.innerHTML;
        }

        const metaTitle = document.querySelector('title')?.textContent || '';
        const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

        return {
          title,
          content,
          metaTitle,
          metaDescription
        };
      });

      if (!pageData.title) {
        return null;
      }

      return {
        ...pageData,
        handle
      };
    } catch (error) {
      // Page doesn't exist
      return null;
    } finally {
      await page.close();
    }
  }

  async scrapeThemeAndSections(): Promise<any> {
    const page = await this.createPage();
    
    try {
      await page.goto(this.baseUrl, { waitUntil: 'networkidle2' });
      
      const themeData = await page.evaluate(() => {
        // Extract theme settings from CSS variables
        const computedStyle = getComputedStyle(document.documentElement);
        const getCSSVariable = (name: string) => computedStyle.getPropertyValue(name)?.trim();
        
        const theme = {
          colors: {
            primary: getCSSVariable('--color-primary') || getCSSVariable('--primary') || '',
            secondary: getCSSVariable('--color-secondary') || getCSSVariable('--secondary') || '',
            background: getCSSVariable('--color-background') || getCSSVariable('--background') || '',
            text: getCSSVariable('--color-text') || getCSSVariable('--text') || '',
          },
          fonts: {
            heading: getCSSVariable('--font-heading') || '',
            body: getCSSVariable('--font-body') || '',
          }
        };

        // Extract sections
        const sections: any[] = [];
        
        // Hero section
        const hero = document.querySelector('.hero, .banner, [data-section-type="hero"], .slideshow');
        if (hero) {
          const heroData: any = {
            type: 'hero',
            content: {}
          };
          
          heroData.content.title = hero.querySelector('h1, h2, .hero__title')?.textContent?.trim();
          heroData.content.subtitle = hero.querySelector('p, .hero__subtitle')?.textContent?.trim();
          heroData.content.buttonText = hero.querySelector('a.button, .btn')?.textContent?.trim();
          heroData.content.buttonLink = hero.querySelector('a.button, .btn')?.getAttribute('href');
          
          const heroImage = hero.querySelector('img');
          if (heroImage) {
            heroData.content.image = heroImage.src;
          }
          
          sections.push(heroData);
        }

        // Featured products section
        const featuredProducts = document.querySelector('.featured-collection, .featured-products, [data-section-type="featured-collection"]');
        if (featuredProducts) {
          sections.push({
            type: 'featured-products',
            content: {
              title: featuredProducts.querySelector('h2, .section-header__title')?.textContent?.trim()
            }
          });
        }

        // Newsletter section
        const newsletter = document.querySelector('.newsletter, [data-section-type="newsletter"]');
        if (newsletter) {
          sections.push({
            type: 'newsletter',
            content: {
              title: newsletter.querySelector('h2, h3')?.textContent?.trim(),
              subtitle: newsletter.querySelector('p')?.textContent?.trim()
            }
          });
        }

        return {
          theme,
          sections
        };
      });

      return themeData;
    } finally {
      await page.close();
    }
  }

  async scrapeAll(): Promise<any> {
    await this.initialize();
    
    try {
      const [storeInfo, products, collections, pages, themeAndSections] = await Promise.all([
        this.scrapeStoreInfo(),
        this.scrapeProducts(50),
        this.scrapeCollections(),
        this.scrapePages(),
        this.scrapeThemeAndSections()
      ]);

      return {
        store: storeInfo,
        products,
        collections,
        pages,
        theme: themeAndSections.theme,
        sections: themeAndSections.sections,
        navigation: {
          main: [],
          footer: []
        }
      };
    } finally {
      await this.close();
    }
  }
}

// Export a function for easy use in API routes
export async function scrapeShopifyStore(url: string, options?: ScraperOptions): Promise<any> {
  try {
    const scraper = new AdvancedShopifyScraper(url, options);
    return await scraper.scrapeAll();
  } catch (error) {
    console.error('Advanced scraper failed:', error);
    
    // Return a structure that indicates failure
    return {
      error: true,
      message: error instanceof Error ? error.message : 'Scraping failed',
      store: null,
      products: [],
      collections: [],
      pages: [],
      theme: {},
      sections: [],
      navigation: { main: [], footer: [] }
    };
  }
}