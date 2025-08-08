import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { createSubdomain } from '@/lib/subdomains';
import { industryTemplates } from '@/lib/industry-templates';

export async function POST(request: NextRequest) {
  console.log('[STORES API] POST request received');
  
  try {
    const session = await getServerSession(authOptions);
    console.log('[STORES API] Session:', session?.user?.email || 'No session');
    
    if (!session?.user?.id) {
      console.log('[STORES API] Unauthorized - no session');
      return apiResponse.unauthorized();
    }

    const body = await request.json();
    const { name, subdomain, industry } = body;
    console.log('[STORES API] Request body:', { name, subdomain, industry });
    console.log('[STORES API] Industry value type:', typeof industry);
    console.log('[STORES API] Industry is empty string:', industry === '');
    console.log('[STORES API] Industry is truthy:', !!industry);

    if (!name || !subdomain) {
      return apiResponse.badRequest('Name and subdomain are required');
    }

    // Check if subdomain is already taken
    const existingStore = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (existingStore) {
      return apiResponse.badRequest('This subdomain is already taken');
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    
    if (!user) {
      console.log('[STORES API] User not found in database:', session.user.id);
      return apiResponse.notFound('User ');
    }

    // Create store in database
    const store = await prisma.store.create({
      data: {
        name,
        subdomain,
        userId: session.user.id,
      }
    });

    // Create subdomain in Redis
    await createSubdomain({
      subdomain,
      emoji: '🛍️',
      createdAt: store.createdAt.getTime(),
    });

    // Get industry template
    const industryTemplate = industry ? industryTemplates.find(t => t.id === industry) : null;
    console.log('[STORES API] Industry template lookup:', {
      industryProvided: !!industry,
      industryValue: industry,
      templateFound: !!industryTemplate,
      templateId: industryTemplate?.id || 'none',
      availableTemplates: industryTemplates.map(t => t.id).join(', ')
    });

    // Create empty templates only - no sections for Commerce Pro theme
    const templates = [
      { templateType: 'homepage', name: 'Homepage', description: 'Homepage layout' },
      { templateType: 'product', name: 'Product', description: 'Product page layout' },
      { templateType: 'collection', name: 'Collection', description: 'Collection page layout' },
      { templateType: 'page', name: 'Page', description: 'Static page layout' },
      { templateType: 'search', name: 'Search', description: 'Search results layout' },
      { templateType: 'cart', name: 'Cart', description: 'Shopping cart layout' },
      { templateType: 'account', name: 'Account', description: 'Customer account layout' }
    ];
    
    // Add industry-specific theme settings to templates if available
    const templateSettings = industryTemplate?.themeSettings ? {
      primaryColor: industryTemplate.themeSettings.colors?.primary,
      secondaryColor: industryTemplate.themeSettings.colors?.secondary,
      accentColor: industryTemplate.themeSettings.colors?.accent,
      headingFont: industryTemplate.themeSettings.typography?.headingFont,
      bodyFont: industryTemplate.themeSettings.typography?.bodyFont
    } : {};

    // Create templates without any sections
    await prisma.storeTemplate.createMany({
      data: templates.map(template => ({
        storeId: store.id,
        ...template,
        isDefault: true,
        enabled: true,
        settings: templateSettings,
        seoSettings: {}
      }))
    });

    // Create default menus and content based on industry
    try {
      await prisma.$transaction(async (tx) => {
      console.log('[STORES API] Starting transaction for additional content');
      console.log('[STORES API] Industry template:', industryTemplate?.id || 'none');
      
      // Create categories based on industry template
      if (industryTemplate && industryTemplate.collections.length > 0) {
        console.log('[STORES API] Creating categories:', industryTemplate.collections.length);
        console.log('[STORES API] Categories to create:', industryTemplate.collections.map(c => c.name).join(', '));
        
        await tx.category.createMany({
          data: industryTemplate.collections.map(col => ({
            name: col.name,
            slug: col.handle,
            description: col.description,
            storeId: store.id
          }))
        });
        
        const createdCategories = await tx.category.count({
          where: { storeId: store.id }
        });
        console.log('[STORES API] Categories created:', createdCategories);
      } else {
        console.log('[STORES API] No categories to create - no industry template or no collections');
      }

      // Create menus based on industry template
      if (industryTemplate && industryTemplate.menuStructure.length > 0) {
        console.log('[STORES API] Creating industry-specific menus');
        console.log('[STORES API] Menu structure items:', industryTemplate.menuStructure.length);
        
        // Main Menu
        const mainMenu = await tx.menu.create({
          data: {
            name: 'Main Menu',
            handle: 'main-menu',
            storeId: store.id
          }
        });
        console.log('[STORES API] Created main menu:', mainMenu.id);

        // Create menu items from industry template
        let menuItemCount = 0;
        const createMenuItems = async (items: any[], parentId: string | null = null) => {
          for (const [index, item] of items.entries()) {
            const createdItem = await tx.menuItem.create({
              data: {
                label: item.label,
                link: item.link,
                target: item.target || '_self',
                position: index,
                menuId: mainMenu.id,
                parentId: parentId
              }
            });
            menuItemCount++;

            if (item.children && item.children.length > 0) {
              await createMenuItems(item.children, createdItem.id);
            }
          }
        };

        await createMenuItems(industryTemplate.menuStructure);
        console.log('[STORES API] Created menu items:', menuItemCount);
      } else {
        console.log('[STORES API] Creating default menus (no industry selected)');
        // Default menu structure if no industry selected
        const mainMenu = await tx.menu.create({
          data: {
            name: 'Main Menu',
            handle: 'main-menu',
            storeId: store.id
          }
        });
        console.log('[STORES API] Created default main menu:', mainMenu.id);

        // Simple default menu
        await tx.menuItem.createMany({
          data: [
            { label: 'Home', link: '/', position: 0, menuId: mainMenu.id, target: '_self' },
            { label: 'Shop', link: '/collections', position: 1, menuId: mainMenu.id, target: '_self' },
            { label: 'About', link: '/pages/about', position: 2, menuId: mainMenu.id, target: '_self' },
            { label: 'Contact', link: '/pages/contact', position: 3, menuId: mainMenu.id, target: '_self' }
          ]
        });
        console.log('[STORES API] Created default menu items: 4');
      }

      // Footer Menu (same for all)
      const footerMenu = await tx.menu.create({
        data: {
          name: 'Footer Menu',
          handle: 'footer-menu',
          storeId: store.id
        }
      });
      console.log('[STORES API] Created footer menu:', footerMenu.id);

      await tx.menuItem.createMany({
        data: [
          { label: 'Privacy Policy', link: '/pages/privacy-policy', position: 0, menuId: footerMenu.id, target: '_self' },
          { label: 'Terms of Service', link: '/pages/terms-of-service', position: 1, menuId: footerMenu.id, target: '_self' },
          { label: 'Shipping Info', link: '/pages/shipping-info', position: 2, menuId: footerMenu.id, target: '_self' },
          { label: 'Returns', link: '/pages/returns', position: 3, menuId: footerMenu.id, target: '_self' },
          { label: 'FAQ', link: '/pages/faq', position: 4, menuId: footerMenu.id, target: '_self' }
        ]
      });
      console.log('[STORES API] Created footer menu items: 5');

      // Create sample products for textile industry
      if (industryTemplate && industryTemplate.id === 'textile-yarn' && industryTemplate.sampleProducts.length > 0) {
        console.log('[STORES API] Creating sample products:', industryTemplate.sampleProducts.length);
        let productsCreated = 0;
        let variantsCreated = 0;
        
        for (const productData of industryTemplate.sampleProducts) {
          console.log('[STORES API] Creating product:', productData.name);
          
          // Find category if specified
          let categoryId = undefined;
          if (productData.collections && productData.collections.length > 0) {
            const category = await tx.category.findFirst({
              where: {
                storeId: store.id,
                slug: productData.collections[0]
              }
            });
            categoryId = category?.id;
            console.log('[STORES API] Product category:', category?.name || 'none');
          }
          
          const product = await tx.product.create({
            data: {
              name: productData.name,
              slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
              description: productData.description,
              isActive: true,
              storeId: store.id,
              categoryId: categoryId
            }
          });
          productsCreated++;

          // Create variants if any
          if (productData.variants && productData.variants.length > 0) {
            console.log('[STORES API] Creating variants:', productData.variants.length);
            await tx.productVariant.createMany({
              data: productData.variants.map((variant: any, index: number) => ({
                productId: product.id,
                name: variant.name,
                price: variant.price,
                compareAtPrice: variant.originalPrice || productData.originalPrice,
                sku: `${store.subdomain}-${product.slug}-${index + 1}`,
                stock: 100,
                options: {}
              }))
            });
            variantsCreated += productData.variants.length;
          } else {
            // Create default variant
            console.log('[STORES API] Creating default variant');
            await tx.productVariant.create({
              data: {
                productId: product.id,
                name: 'Default',
                price: productData.price,
                compareAtPrice: productData.originalPrice,
                sku: `${store.subdomain}-${product.slug}`,
                stock: 100,
                options: {}
              }
            });
            variantsCreated++;
          }
        }
        
        console.log('[STORES API] Products created:', productsCreated);
        console.log('[STORES API] Variants created:', variantsCreated);
      } else {
        console.log('[STORES API] No products to create - no industry template or not textile-yarn');
      }

      // Store theme settings if provided
      if (industryTemplate?.themeSettings) {
        console.log('[STORES API] Storing theme settings for industry:', industryTemplate.id);
        // Update store theme colors if available
        if (industryTemplate.themeSettings.colors?.primary) {
          await tx.store.update({
            where: { id: store.id },
            data: {
              primaryColor: industryTemplate.themeSettings.colors.primary
            }
          });
          console.log('[STORES API] Theme primary color updated:', industryTemplate.themeSettings.colors.primary);
        }
        
        // Store additional theme settings in StoreSettings if needed
        await tx.storeSettings.upsert({
          where: { storeId: store.id },
          create: {
            storeId: store.id,
            // Store theme and industry info as JSON in one of the existing JSON fields
            localizationSettings: {
              theme: industryTemplate.themeSettings,
              industry: industryTemplate.id
            }
          },
          update: {
            localizationSettings: {
              theme: industryTemplate.themeSettings,
              industry: industryTemplate.id
            }
          }
        });
        console.log('[STORES API] Theme settings stored in StoreSettings');
      }
      
      // Create test customer for textile industry
      if (industryTemplate && industryTemplate.id === 'textile-yarn') {
        console.log('[STORES API] Creating test customer');
        const testCustomer = await tx.customer.create({
          data: {
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'Customer',
            phone: '+1234567890',
            acceptsMarketing: true,
            storeId: store.id,
            addresses: JSON.stringify([{
              firstName: 'Test',
              lastName: 'Customer',
              address1: '123 Test Street',
              city: 'Test City',
              province: 'CA',
              country: 'US',
              zip: '12345',
              phone: '+1234567890',
              isDefault: true
            }])
          }
        });
        console.log('[STORES API] Test customer created:', testCustomer.email);

        // Prepare discount and campaign data
        console.log('[STORES API] Creating discount and marketing data');
        const discountsData = JSON.stringify([{
          id: `discount_${Date.now()}`,
          code: 'WELCOME10',
          name: 'Welcome Discount',
          type: 'percentage',
          value: 10,
          minimumRequirement: { type: 'none' },
          usageLimit: null,
          currentUsage: 0,
          usageLimitPerCustomer: 1,
          startsAt: new Date().toISOString(),
          endsAt: null,
          status: 'active',
          appliesTo: 'all',
          description: '10% off your first order',
          isAutomatic: false,
          priority: 0,
          totalSavings: 0,
          totalOrderValue: 0,
          views: 0,
          customerUsage: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);

        const campaignsData = JSON.stringify([{
          id: `campaign_${Date.now()}`,
          type: 'email',
          name: 'Welcome to Our Store',
          subject: 'Welcome! Here\'s 10% off your first order',
          fromName: store.name,
          fromEmail: 'hello@' + store.subdomain + '.com',
          content: {
            html: `
              <h1>Welcome to ${store.name}!</h1>
              <p>Thank you for joining our community of yarn and textile enthusiasts.</p>
              <p>As a special welcome gift, enjoy 10% off your first order with code: <strong>WELCOME10</strong></p>
              <p>Browse our collection of premium yarns, fabrics, and crafting supplies.</p>
              <a href="https://${store.subdomain}.${process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'}/collections" style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Shop Now</a>
            `,
            text: `Welcome to ${store.name}! Thank you for joining our community. Enjoy 10% off your first order with code: WELCOME10`
          },
          audience: { type: 'all' },
          scheduling: { type: 'immediate' },
          status: 'draft',
          audienceSize: 1,
          stats: {
            sent: 0,
            delivered: 0,
            opened: 0,
            clicked: 0,
            bounced: 0,
            unsubscribed: 0,
            failed: 0
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }]);

        // Create sample blog and blog post
        console.log('[STORES API] Creating sample blog and post');
        const blog = await tx.blog.create({
          data: {
            title: 'Crafting Tips & Tutorials',
            slug: 'crafting-tips',
            description: 'Learn new techniques and get inspired with our crafting guides',
            storeId: store.id
          }
        });

        await tx.blogPost.create({
          data: {
            blogId: blog.id,
            storeId: store.id,
            title: '5 Essential Tips for Beginning Knitters',
            slug: 'essential-tips-for-beginning-knitters',
            excerpt: 'Starting your knitting journey? Here are five essential tips to help you get started on the right foot.',
            content: `
              <h2>Welcome to the World of Knitting!</h2>
              <p>Knitting is a rewarding craft that allows you to create beautiful, functional items while relaxing and expressing your creativity. Here are our top 5 tips for beginners:</p>
              
              <h3>1. Choose the Right Yarn</h3>
              <p>Start with a medium-weight (worsted) yarn in a light color. This makes it easier to see your stitches and correct mistakes.</p>
              
              <h3>2. Select Appropriate Needles</h3>
              <p>Begin with size 8 (5mm) needles. They're comfortable to hold and work well with worsted weight yarn.</p>
              
              <h3>3. Master the Basic Stitches</h3>
              <p>Focus on learning the knit and purl stitches first. These two stitches are the foundation for countless patterns.</p>
              
              <h3>4. Practice Consistent Tension</h3>
              <p>Keep your yarn tension even. Not too tight, not too loose. This comes with practice!</p>
              
              <h3>5. Start with Simple Projects</h3>
              <p>Begin with dishcloths or scarves. They're quick to complete and help build your confidence.</p>
              
              <p>Remember, every expert knitter was once a beginner. Be patient with yourself and enjoy the journey!</p>
            `,
            author: store.name + ' Team',
            tags: 'knitting, beginner tips, tutorials, crafting',
            isPublished: true,
            publishedAt: new Date()
          }
        });
        console.log('[STORES API] Blog and blog post created');

        // Add product images and create media library entries
        console.log('[STORES API] Creating product images and media library entries');
        const productImages = [
          {
            url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=800&fit=crop', // Blue yarn
            alt: 'Merino Wool Yarn - Soft Blue'
          },
          {
            url: 'https://images.unsplash.com/photo-1528740096961-3798add1f634?w=800&h=800&fit=crop', // Floral fabric
            alt: 'Cotton Fabric - Floral Print'
          },
          {
            url: 'https://images.unsplash.com/photo-1590233033196-a50b826b059b?w=800&h=800&fit=crop', // Rainbow yarn
            alt: 'Acrylic Yarn Bundle - Rainbow Colors'
          },
          {
            url: 'https://images.unsplash.com/photo-1582131503261-fca1d1c0589f?w=800&h=800&fit=crop', // Thread spools
            alt: 'Silk Thread Set - Embroidery'
          },
          {
            url: 'https://images.unsplash.com/photo-1589968013527-eb5833927e03?w=800&h=800&fit=crop', // Knitting needles
            alt: 'Bamboo Knitting Needles Set'
          }
        ];

        // Prepare media library data
        const mediaData = JSON.stringify(productImages.map((img, index) => ({
          id: `media_${Date.now()}_${index}`,
          url: img.url,
          alt: img.alt,
          type: 'image',
          size: 150000, // Approximate size in bytes
          dimensions: { width: 800, height: 800 },
          createdAt: new Date().toISOString()
        })));

        // Get existing store settings to preserve data
        const existingSettings = await tx.storeSettings.findUnique({
          where: { storeId: store.id }
        });

        // Create/update store settings with all data at once
        await tx.storeSettings.upsert({
          where: { storeId: store.id },
          create: {
            storeId: store.id,
            discounts: discountsData,
            marketingCampaigns: campaignsData,
            mediaLibrary: mediaData,
            localizationSettings: existingSettings?.localizationSettings || {}
          },
          update: {
            discounts: discountsData,
            marketingCampaigns: campaignsData,
            mediaLibrary: mediaData,
            localizationSettings: existingSettings?.localizationSettings || {}
          }
        });
        console.log('[STORES API] Store settings created with discount, campaign, and media data');

        // Update products with images
        const products = await tx.product.findMany({
          where: { storeId: store.id }
        });

        for (let i = 0; i < products.length && i < productImages.length; i++) {
          await tx.product.update({
            where: { id: products[i].id },
            data: {
              images: JSON.stringify([productImages[i]])
            }
          });
        }
        console.log('[STORES API] Product images added:', productImages.length);

        // Create 5 test orders
        console.log('[STORES API] Creating test orders');
        const orderStatuses = ['completed', 'processing', 'pending', 'completed', 'shipped'];
        const paymentStatuses = ['paid', 'pending', 'pending', 'paid', 'paid'];
        
        for (let i = 0; i < 5; i++) {
          const orderNumber = `${store.subdomain.toUpperCase()}-TEST-${1000 + i}`;
          const orderDate = new Date();
          orderDate.setDate(orderDate.getDate() - (10 - i * 2)); // Spread orders over past 10 days
          
          // Get a random product with variants
          const productsWithVariants = await tx.product.findMany({
            where: { storeId: store.id },
            include: { variants: true }
          });
          
          if (productsWithVariants.length > 0) {
            const randomProduct = productsWithVariants[i % productsWithVariants.length];
            const variant = randomProduct.variants[0];
            
            if (variant) {
              const quantity = Math.floor(Math.random() * 3) + 1;
              const subtotal = variant.price * quantity;
              const tax = subtotal * 0.08; // 8% tax
              const shipping = i === 0 ? 0 : 10; // First order free shipping
              const discount = i === 0 ? subtotal * 0.1 : 0; // 10% off first order
              const total = subtotal + tax + shipping - discount;
              
              const order = await tx.order.create({
                data: {
                  orderNumber,
                  storeId: store.id,
                  customerEmail: testCustomer.email,
                  customerName: `${testCustomer.firstName} ${testCustomer.lastName}`,
                  customerPhone: testCustomer.phone,
                  customerId: testCustomer.id,
                  subtotalPrice: subtotal,
                  totalTax: tax,
                  totalShipping: shipping,
                  totalDiscount: discount,
                  totalPrice: total,
                  status: orderStatuses[i],
                  financialStatus: paymentStatuses[i],
                  shippingAddress: JSON.parse(testCustomer.addresses as string)[0],
                  billingAddress: JSON.parse(testCustomer.addresses as string)[0],
                  createdAt: orderDate,
                  lineItems: {
                    create: {
                      productId: randomProduct.id,
                      variantId: variant.id,
                      sku: variant.sku,
                      title: randomProduct.name,
                      variantTitle: variant.name,
                      quantity,
                      price: variant.price,
                      totalPrice: variant.price * quantity
                    }
                  }
                }
              });
              console.log(`[STORES API] Test order created: ${orderNumber}`);
            }
          }
        }
        console.log('[STORES API] Test orders created: 5');
      }
      
      console.log('[STORES API] Transaction completed successfully');
      });
    } catch (transactionError) {
      console.error('[STORES API] Transaction error:', transactionError);
      console.error('[STORES API] Transaction error details:', {
        message: transactionError instanceof Error ? transactionError.message : 'Unknown error',
        stack: transactionError instanceof Error ? transactionError.stack : undefined
      });
      // Don't fail the entire store creation, just log the error
      // The store was already created successfully
    }

    // Ensure StoreSettings exists with at least empty mediaLibrary
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    
    if (!storeSettings) {
      await prisma.storeSettings.create({
        data: {
          storeId: store.id,
          mediaLibrary: JSON.stringify([])
        }
      });
      console.log('[STORES API] Created default StoreSettings with empty mediaLibrary');
    }

    // Create test data for the new store
    try {
      const { createTestDataForStore } = await import('@/lib/create-test-data');
      await createTestDataForStore(store.id);
      console.log('[STORES API] Test data created for store:', store.id);
    } catch (error) {
      console.error('[STORES API] Error creating test data:', error);
      // Don't fail the store creation if test data fails
    }
    
    // Final summary
    console.log('[STORES API] Store creation completed:', {
      storeId: store.id,
      subdomain: store.subdomain,
      industry: industry || 'none',
      industryTemplateUsed: industryTemplate?.id || 'none'
    });
    
    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('[STORES API] Error:', error);
    console.error('[STORES API] Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const stores = await prisma.store.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(stores);
  } catch (error) {
    console.error('GET_STORES_ERROR', error);
    return apiResponse.serverError();
  }
}