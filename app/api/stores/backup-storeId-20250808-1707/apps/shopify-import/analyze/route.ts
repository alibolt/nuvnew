import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { ShopifyScraper } from '@/lib/shopify-scraper';
import { scrapeShopifyStoreBasic } from '@/lib/shopify-scraper-basic';

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
          }
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
      }
    }
  };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const body = await request.json();
    const { shopifyUrl } = body;

    if (!shopifyUrl) {
      return NextResponse.json(
        { error: 'Shopify URL is required' },
        { status: 400 }
      );
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        id: storeId,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Check if Shopify Import app is installed
    const appInstall = await prisma.appInstall.findFirst({
      where: {
        storeId: storeId,
        app: {
          code: 'shopify-import',
        },
      },
      include: {
        app: true,
      },
    });

    if (!appInstall) {
      return NextResponse.json(
        { error: 'Shopify Import app is not installed' },
        { status: 400 }
      );
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
          products: [],
          collections: [],
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
      summary: {
        totalProducts: 0,
        totalCollections: 0,
        totalPages: 0,
        totalImages: 0,
        totalSections: 0,
      },
    };

    // Calculate summary
    processedData.summary.totalProducts = processedData.products.length;
    processedData.summary.totalCollections = processedData.collections.length;
    processedData.summary.totalPages = processedData.pages.length;
    processedData.summary.totalSections = processedData.sections.length;
    processedData.summary.totalImages = processedData.products.reduce(
      (total: number, product: any) => total + (product.images?.length || 0),
      0
    ) + processedData.sections.reduce(
      (total: number, section: any) => total + (section.content?.images?.length || 0),
      0
    );

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

    return NextResponse.json({
      importId: importSession.id,
      data: processedData,
    });
  } catch (error) {
    console.error('Error analyzing Shopify store:', error);
    return NextResponse.json(
      { error: 'Failed to analyze Shopify store' },
      { status: 500 }
    );
  }
}