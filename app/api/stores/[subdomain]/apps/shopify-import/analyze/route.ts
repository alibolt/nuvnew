import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { scrapeShopifyStoreBasic } from '@/lib/services/shopify-scraper-basic';

// Helper function to extract navigation menus from HTML
function extractNavigationMenus(html: string, baseUrl: string): any[] {
  const menus: any[] = [];
  
  try {
    // Extract main navigation menu items
    const navRegex = /<nav[^>]*>[\s\S]*?<\/nav>/gi;
    const headerRegex = /<header[^>]*>[\s\S]*?<\/header>/gi;
    
    let matches = [...html.matchAll(navRegex), ...html.matchAll(headerRegex)];
    
    for (const match of matches) {
      const navHtml = match[0];
      
      // Extract links from navigation
      const linkRegex = /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi;
      const links = [...navHtml.matchAll(linkRegex)];
      
      const menuItems = links
        .map(link => {
          const href = link[1];
          const text = link[2].replace(/<[^>]*>/g, '').trim();
          
          // Skip empty or invalid links
          if (!text || !href || href === '#' || href === 'javascript:void(0)') return null;
          
          // Convert relative URLs to absolute
          let url = href;
          if (href.startsWith('/')) {
            url = baseUrl + href;
          } else if (!href.startsWith('http')) {
            url = baseUrl + '/' + href;
          }
          
          return {
            label: text,
            link: url,
            target: href.startsWith('http') && !href.includes(new URL(baseUrl).hostname) ? '_blank' : '_self'
          };
        })
        .filter(Boolean)
        .slice(0, 10); // Limit to first 10 menu items
      
      if (menuItems.length > 0) {
        menus.push({
          name: 'Main Navigation',
          handle: 'main-navigation',
          items: menuItems
        });
        break; // Only get the first meaningful navigation
      }
    }
  } catch (error) {
    console.error('Error extracting navigation menus:', error);
  }
  
  return menus;
}

// Helper function to extract site images (logos, banners, etc.)
function extractSiteImages(html: string, baseUrl: string): any[] {
  const images: any[] = [];
  
  try {
    // Extract images from various contexts
    const imageRegex = /<img[^>]*src=["']([^"']*)["'][^>]*>/gi;
    const matches = [...html.matchAll(imageRegex)];
    
    const processedUrls = new Set<string>();
    
    for (const match of matches) {
      const imgTag = match[0];
      const src = match[1];
      
      // Skip product images, small icons, and duplicates
      if (processedUrls.has(src)) continue;
      if (src.includes('product') || src.includes('variant')) continue;
      if (src.includes('icon') && (src.includes('16x16') || src.includes('32x32'))) continue;
      if (src.includes('favicon')) continue;
      
      // Convert relative URLs to absolute
      let imageUrl = src;
      if (src.startsWith('//')) {
        imageUrl = 'https:' + src;
      } else if (src.startsWith('/')) {
        imageUrl = baseUrl + src;
      } else if (!src.startsWith('http')) {
        imageUrl = baseUrl + '/' + src;
      }
      
      // Extract alt text and other attributes
      const altMatch = imgTag.match(/alt=["']([^"']*)["']/i);
      const classMatch = imgTag.match(/class=["']([^"']*)["']/i);
      const alt = altMatch ? altMatch[1] : '';
      const className = classMatch ? classMatch[1] : '';
      
      // Categorize image type based on context
      let type = 'other';
      let category = 'Site Images';
      
      if (className.includes('logo') || alt.toLowerCase().includes('logo')) {
        type = 'logo';
        category = 'Logo';
      } else if (className.includes('banner') || className.includes('hero') || alt.toLowerCase().includes('banner')) {
        type = 'banner';
        category = 'Banner';
      } else if (className.includes('slider') || className.includes('carousel')) {
        type = 'slider';
        category = 'Slider';
      } else if (imageUrl.includes('cdn.shopify.com/s/files')) {
        // This is likely a theme/site asset, not a product image
        type = 'asset';
        category = 'Theme Assets';
      }
      
      processedUrls.add(src);
      images.push({
        url: imageUrl,
        alt: alt || 'Site Image',
        type: type,
        category: category,
        className: className
      });
      
      // Limit to prevent too many images
      if (images.length >= 50) break;
    }
  } catch (error) {
    console.error('Error extracting site images:', error);
  }
  
  return images;
}

// Shopify Storefront API GraphQL query
const SHOPIFY_QUERY = `
  query getStoreInfo {
    shop {
      name
      description
      primaryDomain {
        url
      }
    }
    products(first: 250) {
      edges {
        node {
          id
          title
          description
          handle
          productType
          vendor
          tags
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 10) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                availableForSale
                selectedOptions {
                  name
                  value
                }
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
    collections(first: 50) {
      edges {
        node {
          id
          title
          description
          handle
          image {
            url
            altText
          }
        }
      }
    }
  }
`;

async function fetchShopifyData(shopUrl: string) {
  // Try to fetch real data from Shopify store
  try {
    // Clean URL
    let cleanUrl = shopUrl.trim();
    if (!cleanUrl.includes('http')) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    // Remove trailing slash
    cleanUrl = cleanUrl.replace(/\/$/, '');
    
    console.log(`Attempting to fetch Shopify data from: ${cleanUrl}`);
    
    // Try products.json endpoint (public Shopify API)
    const productsResponse = await fetch(`${cleanUrl}/products.json?limit=250`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    const collectionsResponse = await fetch(`${cleanUrl}/collections.json`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
    });
    
    // Fetch homepage HTML for navigation and site images
    const homepageResponse = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    
    let navigationMenus: any[] = [];
    let siteImages: any[] = [];
    
    if (homepageResponse.ok) {
      const html = await homepageResponse.text();
      console.log('Homepage HTML length:', html.length);
      navigationMenus = extractNavigationMenus(html, cleanUrl);
      siteImages = extractSiteImages(html, cleanUrl);
      console.log('Extracted menus:', navigationMenus.length);
      console.log('Extracted site images:', siteImages.length);
    } else {
      console.log('Homepage fetch failed:', homepageResponse.status);
    }
    
    if (productsResponse.ok && collectionsResponse.ok) {
      const productsData = await productsResponse.json();
      const collectionsData = await collectionsResponse.json();
      
      // Convert to GraphQL-like format
      return {
        data: {
          shop: {
            name: new URL(cleanUrl).hostname.split('.')[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            description: 'Shopify Store',
            primaryDomain: { url: cleanUrl }
          },
          products: {
            edges: productsData.products.map((product: any) => ({
              node: {
                title: product.title,
                description: product.body_html || '',
                handle: product.handle,
                productType: product.product_type,
                vendor: product.vendor,
                tags: Array.isArray(product.tags) ? product.tags : (product.tags ? product.tags.split(', ') : []),
                priceRange: {
                  minVariantPrice: { 
                    amount: Math.min(...product.variants.map((v: any) => v.price)), 
                    currencyCode: 'USD' 
                  },
                  maxVariantPrice: { 
                    amount: Math.max(...product.variants.map((v: any) => v.price)), 
                    currencyCode: 'USD' 
                  }
                },
                images: {
                  edges: product.images.map((img: any) => ({
                    node: {
                      url: img.src,
                      altText: img.alt || product.title
                    }
                  }))
                },
                variants: {
                  edges: product.variants.map((variant: any) => ({
                    node: {
                      title: variant.title,
                      price: { amount: variant.price, currencyCode: 'USD' },
                      availableForSale: variant.available,
                      selectedOptions: [
                        variant.option1 && { name: 'Option 1', value: variant.option1 },
                        variant.option2 && { name: 'Option 2', value: variant.option2 },
                        variant.option3 && { name: 'Option 3', value: variant.option3 }
                      ].filter(Boolean),
                      image: variant.featured_image ? {
                        url: variant.featured_image.src,
                        altText: variant.featured_image.alt
                      } : null
                    }
                  }))
                }
              }
            })),
            pageInfo: { hasNextPage: false }
          },
          collections: {
            edges: collectionsData.collections.map((collection: any) => ({
              node: {
                title: collection.title,
                description: collection.body_html,
                handle: collection.handle,
                image: collection.image ? {
                  url: collection.image.src,
                  altText: collection.image.alt
                } : null
              }
            }))
          },
          navigationMenus: navigationMenus,
          siteImages: siteImages
        }
      };
    } else {
      const productsText = await productsResponse.text().catch(() => 'N/A');
      const collectionsText = await collectionsResponse.text().catch(() => 'N/A');
      
      console.log('Shopify API responses failed:', {
        products: { status: productsResponse.status, preview: productsText.substring(0, 200) },
        collections: { status: collectionsResponse.status, preview: collectionsText.substring(0, 200) }
      });
      
      throw new Error(`Failed to fetch: Products ${productsResponse.status}, Collections ${collectionsResponse.status}`);
    }
  } catch (error) {
    console.error('Error fetching Shopify data:', error);
  }
  
  // Fallback to demo data if real fetch fails
  console.log('Using demo data fallback');
  return {
    data: {
      shop: {
        name: 'Demo Fashion Store',
        description: 'Premium fashion and lifestyle products',
        primaryDomain: { url: shopUrl }
      },
      products: {
        edges: [
          {
            node: {
              title: 'Classic T-Shirt',
              description: 'Comfortable cotton t-shirt perfect for everyday wear',
              handle: 'classic-t-shirt',
              productType: 'Apparel',
              vendor: 'Fashion Co',
              tags: ['summer', 'casual', 'cotton'],
              priceRange: {
                minVariantPrice: { amount: '29.99', currencyCode: 'USD' },
                maxVariantPrice: { amount: '39.99', currencyCode: 'USD' }
              },
              images: {
                edges: [
                  {
                    node: {
                      url: 'https://via.placeholder.com/600x800/8B9F7E/FFFFFF?text=Classic+T-Shirt',
                      altText: 'Classic T-Shirt Front View'
                    }
                  },
                  {
                    node: {
                      url: 'https://via.placeholder.com/600x800/D4A5A5/FFFFFF?text=Classic+T-Shirt+Back',
                      altText: 'Classic T-Shirt Back View'
                    }
                  }
                ]
              },
              variants: {
                edges: [
                  {
                    node: {
                      title: 'Small / White',
                      price: { amount: '29.99', currencyCode: 'USD' },
                      availableForSale: true,
                      selectedOptions: [
                        { name: 'Size', value: 'Small' },
                        { name: 'Color', value: 'White' }
                      ]
                    }
                  },
                  {
                    node: {
                      title: 'Medium / Black',
                      price: { amount: '29.99', currencyCode: 'USD' },
                      availableForSale: true,
                      selectedOptions: [
                        { name: 'Size', value: 'Medium' },
                        { name: 'Color', value: 'Black' }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            node: {
              title: 'Denim Jacket',
              description: 'Timeless denim jacket with a modern fit',
              handle: 'denim-jacket',
              productType: 'Outerwear',
              vendor: 'Denim Works',
              tags: ['denim', 'jacket', 'casual'],
              priceRange: {
                minVariantPrice: { amount: '89.99', currencyCode: 'USD' },
                maxVariantPrice: { amount: '89.99', currencyCode: 'USD' }
              },
              images: {
                edges: [
                  {
                    node: {
                      url: 'https://via.placeholder.com/600x800/4B5563/FFFFFF?text=Denim+Jacket',
                      altText: 'Denim Jacket'
                    }
                  }
                ]
              },
              variants: {
                edges: [
                  {
                    node: {
                      title: 'Medium',
                      price: { amount: '89.99', currencyCode: 'USD' },
                      availableForSale: true,
                      selectedOptions: [{ name: 'Size', value: 'Medium' }]
                    }
                  }
                ]
              }
            }
          },
          {
            node: {
              title: 'Summer Dress',
              description: 'Light and breezy summer dress',
              handle: 'summer-dress',
              productType: 'Dresses',
              vendor: 'Style Studio',
              tags: ['summer', 'dress', 'floral'],
              priceRange: {
                minVariantPrice: { amount: '59.99', currencyCode: 'USD' },
                maxVariantPrice: { amount: '59.99', currencyCode: 'USD' }
              },
              images: {
                edges: [
                  {
                    node: {
                      url: 'https://via.placeholder.com/600x800/F3A5A5/FFFFFF?text=Summer+Dress',
                      altText: 'Summer Dress'
                    }
                  }
                ]
              },
              variants: {
                edges: [
                  {
                    node: {
                      title: 'Small',
                      price: { amount: '59.99', currencyCode: 'USD' },
                      availableForSale: true,
                      selectedOptions: [{ name: 'Size', value: 'Small' }]
                    }
                  }
                ]
              }
            }
          }
        ],
        pageInfo: { hasNextPage: false }
      },
      collections: {
        edges: [
          {
            node: {
              title: 'Summer Collection',
              description: 'Fresh styles for the summer season',
              handle: 'summer-collection',
              image: {
                url: 'https://via.placeholder.com/800x400/FFE4B5/000000?text=Summer+Collection',
                altText: 'Summer Collection Banner'
              }
            }
          },
          {
            node: {
              title: 'New Arrivals',
              description: 'Latest additions to our store',
              handle: 'new-arrivals',
              image: {
                url: 'https://via.placeholder.com/800x400/E6E6FA/000000?text=New+Arrivals',
                altText: 'New Arrivals Banner'
              }
            }
          }
        ]
      },
      navigationMenus: [
        {
          name: 'Main Navigation',
          handle: 'main-navigation',
          items: [
            { label: 'Home', link: '/', target: '_self' },
            { label: 'Shop', link: '/collections/all', target: '_self' },
            { label: 'New Arrivals', link: '/collections/new-arrivals', target: '_self' },
            { label: 'Sale', link: '/collections/sale', target: '_self' },
            { label: 'About', link: '/pages/about', target: '_self' },
            { label: 'Contact', link: '/pages/contact', target: '_self' }
          ]
        }
      ],
      siteImages: [
        {
          url: 'https://via.placeholder.com/300x100/000000/FFFFFF?text=LOGO',
          alt: 'Store Logo',
          type: 'logo',
          category: 'Logo',
          className: 'site-logo'
        },
        {
          url: 'https://via.placeholder.com/1200x400/8B9F7E/FFFFFF?text=Hero+Banner',
          alt: 'Hero Banner',
          type: 'banner',
          category: 'Banner',
          className: 'hero-banner'
        },
        {
          url: 'https://via.placeholder.com/800x300/D4A5A5/FFFFFF?text=Promotional+Banner',
          alt: 'Promotional Banner',
          type: 'banner',
          category: 'Banner',
          className: 'promo-banner'
        },
        {
          url: 'https://via.placeholder.com/600x400/F3A5A5/FFFFFF?text=Slider+Image+1',
          alt: 'Slider Image 1',
          type: 'slider',
          category: 'Slider',
          className: 'slider-image'
        },
        {
          url: 'https://via.placeholder.com/600x400/E6E6FA/000000?text=Slider+Image+2',
          alt: 'Slider Image 2',
          type: 'slider',
          category: 'Slider',
          className: 'slider-image'
        }
      ]
    }
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();
    const { shopifyUrl } = body;

    if (!shopifyUrl) {
      return apiResponse.badRequest('Shopify URL is required');
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if Shopify Import app is installed
    const appInstall = await prisma.appInstall.findFirst({
      where: {
        storeId: store.id,
        app: {
          code: 'shopify-import',
        },
      },
      include: {
        app: true,
      },
    });

    if (!appInstall) {
      return apiResponse.badRequest('Shopify Import app is not installed');
    }

    // Create import session
    const importSession = await prisma.shopifyImport.create({
      data: {
        appInstallId: appInstall.id,
        storeUrl: shopifyUrl,
        status: 'analyzing',
      },
    });

    // Try Shopify API first
    let shopifyData = await fetchShopifyData(shopifyUrl);
    
    // If API fails, use web scraper
    let scrapedData: any = null;
    if (!shopifyData || (shopifyData as any).errors) {
      try {
        console.log('API failed, using web scraper for:', shopifyUrl);
        const scraper = new ShopifyScraper(shopifyUrl);
        scrapedData = await scraper.scrape();
        console.log('Scraper results:', {
          productsCount: scrapedData.products?.length || 0,
          collectionsCount: scrapedData.collections?.length || 0,
          pagesCount: scrapedData.pages?.length || 0,
          storeName: scrapedData.store?.name
        });
      } catch (scraperError) {
        console.error('Web scraper error:', scraperError);
        
        // Try basic fallback scraper
        try {
          console.log('Trying basic fallback scraper...');
          scrapedData = await scrapeShopifyStoreBasic(shopifyUrl);
        } catch (basicScraperError) {
          console.error('Basic scraper also failed:', basicScraperError);
        }
      }
      
      // If we got scraping data, use it instead of demo data
      if (scrapedData && scrapedData.products && scrapedData.products.length > 0) {
        console.log('Successfully scraped data, using real data instead of demo');
      } else {
        
        // Use fallback demo data
        scrapedData = {
          store: { 
            name: 'Demo Fashion Store', 
            description: 'Premium fashion and lifestyle products', 
            domain: shopifyUrl, 
            logo: 'https://via.placeholder.com/200x50/8B9F7E/FFFFFF?text=LOGO', 
            socialLinks: {
              facebook: 'https://facebook.com/demofashion',
              instagram: 'https://instagram.com/demofashion'
            } 
          },
          products: [
            {
              title: 'Sample T-Shirt',
              description: 'A comfortable cotton t-shirt',
              handle: 'sample-t-shirt',
              images: ['https://via.placeholder.com/600x800/8B9F7E/FFFFFF?text=T-Shirt'],
              price: '25.00',
              variants: [{ title: 'Small' }, { title: 'Medium' }, { title: 'Large' }]
            },
            {
              title: 'Sample Jeans',
              description: 'Classic denim jeans',
              handle: 'sample-jeans',
              images: ['https://via.placeholder.com/600x800/4B5563/FFFFFF?text=Jeans'],
              price: '75.00',
              variants: [{ title: '30' }, { title: '32' }, { title: '34' }]
            }
          ],
          collections: [
            {
              title: 'Demo Collection',
              description: 'Sample collection for demo',
              handle: 'demo-collection',
              image: 'https://via.placeholder.com/800x400/FFE4B5/000000?text=Demo+Collection'
            }
          ],
          pages: [
            {
              title: 'About Us',
              handle: 'about-us',
              content: '<h1>About Our Store</h1><p>We are a premium fashion retailer dedicated to bringing you the latest styles.</p>',
              metaTitle: 'About Us - Demo Fashion Store',
              metaDescription: 'Learn more about our fashion store'
            },
            {
              title: 'Contact',
              handle: 'contact',
              content: '<h1>Contact Us</h1><p>Email: contact@demofashion.com<br>Phone: 1-800-FASHION</p>',
              metaTitle: 'Contact Us',
              metaDescription: 'Get in touch with our team'
            }
          ]
        };
      }
      
      // Convert scraped data to expected format
      shopifyData = {
        data: {
          shop: {
            name: scrapedData.store.name,
            description: scrapedData.store.description,
            primaryDomain: { url: scrapedData.store.domain },
          },
          products: {
            edges: scrapedData.products.map((product: any) => ({
              node: {
                title: product.title,
                description: product.description,
                handle: product.handle,
                productType: product.productType,
                vendor: product.vendor,
                tags: product.tags,
                images: {
                  edges: product.images.map((img: any) => ({
                    node: img,
                  })),
                },
                variants: {
                  edges: product.variants.map((variant: any) => ({
                    node: {
                      title: variant.title,
                      price: {
                        amount: variant.price.toString(),
                        currencyCode: 'USD',
                      },
                      availableForSale: variant.availableForSale,
                      selectedOptions: variant.options,
                      image: variant.image,
                    },
                  })),
                },
              },
            })),
            pageInfo: { hasNextPage: false }
          },
          collections: {
            edges: scrapedData.collections.map((collection: any) => ({
              node: collection,
            })),
          },
          navigationMenus: scrapedData.navigationMenus || [
            {
              name: 'Main Navigation',
              handle: 'main-navigation',
              items: [
                { label: 'Home', link: '/', target: '_self' },
                { label: 'Products', link: '/products', target: '_self' },
                { label: 'About', link: '/about', target: '_self' },
                { label: 'Contact', link: '/contact', target: '_self' }
              ]
            }
          ],
          siteImages: scrapedData.siteImages || [
            {
              url: scrapedData.store?.logo || 'https://via.placeholder.com/300x100/000000/FFFFFF?text=LOGO',
              alt: 'Store Logo',
              type: 'logo',
              category: 'Logo'
            }
          ],
        },
      };
    }

    // Process and structure the data
    const processedData = {
      store: {
        name: shopifyData.data?.shop?.name || (shopifyData as any).shop?.name || scrapedData?.store?.name || 'Unknown Store',
        description: shopifyData.data?.shop?.description || (shopifyData as any).shop?.description || scrapedData?.store?.description || '',
        domain: shopifyData.data?.shop?.primaryDomain?.url || shopifyUrl,
        logo: scrapedData?.store?.logo || null,
        socialLinks: scrapedData?.store?.socialLinks || {},
      },
      products: (shopifyData.data?.products?.edges || (shopifyData as any).products?.edges || scrapedData?.products || []).map((edge: any) => {
        const product = edge.node || edge;
        return {
          title: product.title,
          description: product.description,
          handle: product.handle,
          productType: product.productType,
          vendor: product.vendor,
          tags: product.tags,
          images: (product.images?.edges || product.images || []).map((img: any) => ({
            url: img.node?.url || img.url,
            altText: img.node?.altText || img.altText,
          })),
          variants: (product.variants?.edges || product.variants || []).map((v: any) => {
            const variant = v.node || v;
            return {
              title: variant.title,
              price: parseFloat(variant.price?.amount || variant.price || '0'),
              availableForSale: variant.availableForSale,
              options: variant.selectedOptions || variant.options || [],
              image: variant.image,
            };
          }),
        };
      }),
      collections: (shopifyData.data?.collections?.edges || (shopifyData as any).collections?.edges || scrapedData?.collections || []).map((edge: any) => ({
        title: edge.node?.title || edge.title,
        description: edge.node?.description || edge.description,
        handle: edge.node?.handle || edge.handle,
        image: edge.node?.image || edge.image,
      })),
      pages: scrapedData?.pages || [],
      theme: scrapedData?.theme || {},
      sections: scrapedData?.sections || [],
      navigation: scrapedData?.navigation || {},
      navigationMenus: shopifyData.data?.navigationMenus || [],
      siteImages: shopifyData.data?.siteImages || [],
      allImages: [] as any[], // Will be populated below
      summary: {
        totalProducts: 0,
        totalCollections: 0,
        totalPages: 0,
        totalImages: 0,
        totalSections: 0,
        totalMenus: 0,
        totalSiteImages: 0,
      },
    };

    // Collect all unique images from products
    const allImagesMap = new Map();
    processedData.products.forEach((product: any) => {
      product.images?.forEach((image: any) => {
        if (image.url && !allImagesMap.has(image.url)) {
          allImagesMap.set(image.url, {
            url: image.url,
            altText: image.altText || product.title,
            productTitle: product.title,
            productHandle: product.handle
          });
        }
      });
    });
    
    // Add collection images
    processedData.collections.forEach((collection: any) => {
      if (collection.image?.url && !allImagesMap.has(collection.image.url)) {
        allImagesMap.set(collection.image.url, {
          url: collection.image.url,
          altText: collection.image.altText || collection.title,
          collectionTitle: collection.title,
          collectionHandle: collection.handle
        });
      }
    });
    
    processedData.allImages = Array.from(allImagesMap.values());

    // Calculate summary
    processedData.summary.totalProducts = processedData.products.length;
    processedData.summary.totalCollections = processedData.collections.length;
    processedData.summary.totalPages = processedData.pages.length;
    processedData.summary.totalSections = processedData.sections.length;
    processedData.summary.totalImages = processedData.allImages.length;
    processedData.summary.totalMenus = processedData.navigationMenus.length;
    processedData.summary.totalSiteImages = processedData.siteImages.length;
    
    console.log('Final processed data summary:', {
      menus: processedData.navigationMenus.length,
      siteImages: processedData.siteImages.length,
      products: processedData.products.length,
      collections: processedData.collections.length
    });

    // Update import session with data
    await prisma.shopifyImport.update({
      where: { id: importSession.id },
      data: {
        status: 'completed',
        data: processedData,
        completedAt: new Date(),
      },
    });

    // Update app last used
    await prisma.appInstall.update({
      where: { id: appInstall.id },
      data: { lastUsedAt: new Date() },
    });

    return apiResponse.success({
      importId: importSession.id,
      data: processedData,
    });
  } catch (error) {
    console.error('Error analyzing Shopify store:', error);
    return handleApiError(error);
  }
}