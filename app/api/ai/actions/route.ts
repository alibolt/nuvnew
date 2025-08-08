import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// AI Actions - Allow AI to perform store operations
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, subdomain, data } = body;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Execute action based on type
    switch (action) {
      case 'create_product':
        return await createProduct(store.id, data);
      
      case 'update_product':
        return await updateProduct(store.id, data);
      
      case 'create_discount':
        return await createDiscount(store.id, data);
      
      case 'update_settings':
        return await updateStoreSettings(store.id, data);
      
      case 'create_campaign':
        return await createMarketingCampaign(store.id, data);
      
      case 'analyze_store':
        return await analyzeStore(store.id);
      
      case 'generate_content':
        return await generateContent(store.id, data);
      
      case 'bulk_update_products':
        return await bulkUpdateProducts(store.id, data);
      
      case 'export_products':
        return await exportProducts(store.id, data);
      
      case 'translate_content':
        return await translateContent(store.id, data);
      
      case 'batch_translate':
        return await batchTranslateContent(store.id, data);
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[AI Actions] Error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// Create a new product with AI-generated content
async function createProduct(storeId: string, data: any) {
  try {
    const product = await prisma.product.create({
      data: {
        storeId,
        name: data.name,
        description: data.description || '',
        slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
        isActive: data.isActive ?? true,
        productType: data.productType || 'physical',
        images: data.images || [],
        metaTitle: data.metaTitle || data.name,
        metaDescription: data.metaDescription || data.description?.substring(0, 160) || '',
        tags: data.tags || [],
        categoryId: data.categoryId || null,
        // Add default variant with price
        variants: {
          create: [{
            name: 'Default',
            price: data.price || 0,
            compareAtPrice: data.compareAtPrice || null,
            sku: data.sku || `SKU-${Date.now()}`,
            stock: data.stock || data.quantity || 0,
            options: {},
          }]
        }
      },
      include: {
        variants: true,
        category: true,
      }
    });

    return NextResponse.json({
      success: true,
      action: 'create_product',
      data: product,
      message: `Product "${product.name}" created successfully!`
    });
  } catch (error: any) {
    throw new Error(`Failed to create product: ${error.message}`);
  }
}

// Update existing product
async function updateProduct(storeId: string, data: any) {
  try {
    // Update product basic info
    const product = await prisma.product.update({
      where: {
        id: data.productId,
        storeId,
      },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.images && { images: data.images }),
        ...(data.tags && { tags: data.tags }),
        ...(data.metaTitle && { metaTitle: data.metaTitle }),
        ...(data.metaDescription && { metaDescription: data.metaDescription }),
      },
      include: {
        variants: true,
      }
    });

    // Update price on default variant if provided
    if (data.price !== undefined || data.compareAtPrice !== undefined) {
      const defaultVariant = product.variants.find((v: any) => v.name === 'Default') || product.variants[0];
      if (defaultVariant) {
        await prisma.productVariant.update({
          where: { id: defaultVariant.id },
          data: {
            ...(data.price !== undefined && { price: data.price }),
            ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      action: 'update_product',
      data: product,
      message: `Product "${product.name}" updated successfully!`
    });
  } catch (error: any) {
    throw new Error(`Failed to update product: ${error.message}`);
  }
}

// Create discount/coupon
async function createDiscount(storeId: string, data: any) {
  try {
    // First check if store has discounts feature
    // For now, we'll create a simple discount structure
    const discount = {
      id: `discount-${Date.now()}`,
      storeId,
      code: data.code || `SAVE${Math.floor(Math.random() * 1000)}`,
      type: data.type || 'percentage', // percentage or fixed
      value: data.value || 10,
      minPurchase: data.minPurchase || 0,
      usageLimit: data.usageLimit || null,
      expiresAt: data.expiresAt || null,
      isActive: true,
      createdAt: new Date(),
    };

    // In a real implementation, save to database
    // await prisma.discount.create({ data: discount });

    return NextResponse.json({
      success: true,
      action: 'create_discount',
      data: discount,
      message: `Discount code "${discount.code}" created! ${discount.value}${discount.type === 'percentage' ? '%' : '$'} off`
    });
  } catch (error: any) {
    throw new Error(`Failed to create discount: ${error.message}`);
  }
}

// Update store settings
async function updateStoreSettings(storeId: string, data: any) {
  try {
    // Map common terms to actual field names
    const fieldMapping: any = {
      // Store basic fields
      'storeName': 'name',
      'name': 'name',
      'description': 'description',
      'storeDescription': 'description',
      'currency': 'currency',
      'email': 'email',
      'phone': 'phone',
      'address': 'address',
      'facebook': 'facebook',
      'instagram': 'instagram',
      'twitter': 'twitter',
      'youtube': 'youtube',
      'primaryColor': 'primaryColor',
      'logo': 'logo',
      
      // StoreSettings fields
      'timezone': 'timeZone',
      'timeZone': 'timeZone',
      'businessEmail': 'businessEmail',
      'businessPhone': 'businessPhone',
      'businessName': 'businessName',
      'businessAddress': 'businessAddress',
      'businessCity': 'businessCity',
      'businessState': 'businessState',
      'businessZip': 'businessZip',
      'businessCountry': 'businessCountry',
      'taxId': 'taxId',
      'weightUnit': 'weightUnit',
      'lengthUnit': 'lengthUnit',
      'googleAnalytics': 'googleAnalyticsId',
      'facebookPixel': 'facebookPixelId',
      'enablePasswordProtection': 'enablePasswordProtection',
      'enableMaintenanceMode': 'enableMaintenanceMode',
      'maintenanceMessage': 'maintenanceMessage',
    };

    // Separate Store and StoreSettings updates
    const storeUpdates: any = {};
    const storeSettingsUpdates: any = {};
    const storeFields = ['name', 'description', 'currency', 'email', 'phone', 'address', 
                        'facebook', 'instagram', 'twitter', 'youtube', 'primaryColor', 'logo'];
    
    // Process each field
    for (const [key, value] of Object.entries(data)) {
      const mappedField = fieldMapping[key] || key;
      
      if (storeFields.includes(mappedField)) {
        storeUpdates[mappedField] = value;
      } else {
        storeSettingsUpdates[mappedField] = value;
      }
    }

    // Start transaction for atomic updates
    const result = await prisma.$transaction(async (tx) => {
      let storeResult = null;
      let settingsResult = null;
      
      // Update Store model if needed
      if (Object.keys(storeUpdates).length > 0) {
        storeResult = await tx.store.update({
          where: { id: storeId },
          data: storeUpdates,
        });
      }
      
      // Update or create StoreSettings if needed
      if (Object.keys(storeSettingsUpdates).length > 0) {
        // Check if settings exist
        const existingSettings = await tx.storeSettings.findUnique({
          where: { storeId }
        });
        
        if (existingSettings) {
          settingsResult = await tx.storeSettings.update({
            where: { storeId },
            data: storeSettingsUpdates,
          });
        } else {
          settingsResult = await tx.storeSettings.create({
            data: {
              storeId,
              ...storeSettingsUpdates,
            },
          });
        }
      }
      
      return { storeResult, settingsResult };
    });

    // Handle special settings that need API calls
    if (data.taxRate !== undefined) {
      // Update tax settings through the tax API
      await updateTaxSettings(storeId, data.taxRate);
    }
    
    if (data.shippingRate !== undefined) {
      // Update shipping settings through the shipping API
      await updateShippingSettings(storeId, data.shippingRate);
    }

    const updatedFields = [...Object.keys(storeUpdates), ...Object.keys(storeSettingsUpdates)];
    
    return NextResponse.json({
      success: true,
      action: 'update_settings',
      data: { ...storeUpdates, ...storeSettingsUpdates },
      message: `Store settings updated successfully! Updated: ${updatedFields.join(', ')}`
    });
  } catch (error: any) {
    throw new Error(`Failed to update settings: ${error.message}`);
  }
}

// Helper function to update tax settings
async function updateTaxSettings(storeId: string, taxRate: number) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId }
    });
    
    const taxSettings = settings?.taxSettings || {};
    taxSettings.defaultRate = taxRate;
    taxSettings.enabled = true;
    
    await prisma.storeSettings.update({
      where: { storeId },
      data: { taxSettings }
    });
  } catch (error) {
    console.error('Failed to update tax settings:', error);
  }
}

// Helper function to update shipping settings  
async function updateShippingSettings(storeId: string, shippingRate: number) {
  try {
    const settings = await prisma.storeSettings.findUnique({
      where: { storeId }
    });
    
    const shippingZones = settings?.shippingZones || { zones: [] };
    // Update default zone or create one
    if (shippingZones.zones && shippingZones.zones.length > 0) {
      shippingZones.zones[0].rates = [{
        name: 'Standard Shipping',
        price: shippingRate,
        minDays: 3,
        maxDays: 7
      }];
    } else {
      shippingZones.zones = [{
        name: 'Default Zone',
        countries: ['*'],
        rates: [{
          name: 'Standard Shipping',
          price: shippingRate,
          minDays: 3,
          maxDays: 7
        }]
      }];
    }
    
    await prisma.storeSettings.update({
      where: { storeId },
      data: { shippingZones }
    });
  } catch (error) {
    console.error('Failed to update shipping settings:', error);
  }
}

// Create marketing campaign
async function createMarketingCampaign(storeId: string, data: any) {
  try {
    const campaign = {
      id: `campaign-${Date.now()}`,
      storeId,
      name: data.name || 'New Campaign',
      type: data.type || 'email', // email, sms, social
      subject: data.subject,
      content: data.content,
      targetAudience: data.targetAudience || 'all',
      scheduledFor: data.scheduledFor || null,
      status: 'draft',
      createdAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      action: 'create_campaign',
      data: campaign,
      message: `Marketing campaign "${campaign.name}" created successfully!`
    });
  } catch (error: any) {
    throw new Error(`Failed to create campaign: ${error.message}`);
  }
}

// Analyze store performance
async function analyzeStore(storeId: string) {
  try {
    // Get store analytics
    const [products, orders, customers, categories] = await Promise.all([
      prisma.product.count({ where: { storeId } }),
      prisma.order.count({ where: { storeId } }),
      prisma.customer.count({ where: { storeId } }),
      prisma.category.count({ where: { storeId } }),
    ]);

    // Get recent orders for revenue calculation
    const recentOrders = await prisma.order.findMany({
      where: {
        storeId,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        total: true,
        status: true,
      }
    });

    const totalRevenue = recentOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const completedOrders = recentOrders.filter(o => o.status === 'completed').length;

    // Get low stock products
    const lowStockProducts = await prisma.productVariant.findMany({
      where: {
        product: { storeId },
        quantity: { lt: 5 }
      },
      include: {
        product: { select: { name: true } }
      },
      take: 5
    });

    const analysis = {
      overview: {
        totalProducts: products,
        totalOrders: orders,
        totalCustomers: customers,
        totalCategories: categories,
      },
      performance: {
        last30DaysRevenue: totalRevenue,
        last30DaysOrders: recentOrders.length,
        completedOrders,
        conversionRate: orders > 0 ? ((completedOrders / orders) * 100).toFixed(2) : 0,
      },
      alerts: {
        lowStockProducts: lowStockProducts.map(v => ({
          product: v.product.name,
          variant: v.name,
          quantity: v.quantity
        }))
      },
      recommendations: [
        products < 10 && "Add more products to your catalog",
        categories < 3 && "Create more categories to organize products",
        lowStockProducts.length > 0 && "Restock low inventory items",
        !totalRevenue && "Launch a marketing campaign to drive sales",
      ].filter(Boolean)
    };

    return NextResponse.json({
      success: true,
      action: 'analyze_store',
      data: analysis,
      message: 'Store analysis completed successfully!'
    });
  } catch (error: any) {
    throw new Error(`Failed to analyze store: ${error.message}`);
  }
}

// Generate various content types
async function generateContent(storeId: string, data: any) {
  try {
    const { contentType, context } = data;
    
    // Call Groq API to generate content - use relative URL for internal calls
    const response = await fetch(`http://localhost:3000/api/ai/groq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task: contentType || 'general',
        prompt: context.prompt || '',
        data: context
      }),
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      action: 'generate_content',
      data: {
        type: contentType,
        content: result.data?.result || result.result
      },
      message: `${contentType} content generated successfully!`
    });
  } catch (error: any) {
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

// Bulk update products
async function bulkUpdateProducts(storeId: string, data: any) {
  try {
    const { operation, filters, updates } = data;
    
    // Build where clause based on filters
    const where: any = { storeId };
    
    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.categoryName) {
      // Find category by name
      const category = await prisma.category.findFirst({
        where: { storeId, name: { contains: filters.categoryName, mode: 'insensitive' } }
      });
      if (category) where.categoryId = category.id;
    }
    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters.outOfStock) {
      // Products with zero stock
      const outOfStockProducts = await prisma.productVariant.findMany({
        where: { stock: 0 },
        select: { productId: true }
      });
      where.id = { in: outOfStockProducts.map(v => v.productId) };
    }
    if (filters.recent) {
      // Products created in last 7 days
      where.createdAt = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    }
    if (filters.tags && filters.tags.length > 0) {
      where.tags = { hasSome: filters.tags };
    }

    let result;
    
    switch (operation) {
      case 'price_change':
        // Update prices by percentage or fixed amount
        const products = await prisma.product.findMany({ 
          where,
          include: { variants: true }
        });
        
        let variantCount = 0;
        for (const product of products) {
          // Update all variants of the product
          for (const variant of product.variants) {
            const newPrice = updates.changeType === 'percentage' 
              ? variant.price * (1 + updates.value / 100)
              : variant.price + updates.value;
              
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: { price: Math.max(0, newPrice) }
            });
            variantCount++;
          }
        }
        
        result = { updated: variantCount, products: products.length };
        break;
        
      case 'activate':
        result = await prisma.product.updateMany({
          where,
          data: { isActive: true }
        });
        break;
        
      case 'deactivate':
        result = await prisma.product.updateMany({
          where,
          data: { isActive: false }
        });
        break;
        
      case 'add_tag':
        const productsToTag = await prisma.product.findMany({ where });
        
        for (const product of productsToTag) {
          const currentTags = Array.isArray(product.tags) ? product.tags : [];
          const newTags = [...new Set([...currentTags, updates.tag])];
          await prisma.product.update({
            where: { id: product.id },
            data: { tags: newTags }
          });
        }
        
        result = { updated: productsToTag.length };
        break;
        
      case 'remove_tag':
        const productsToUntag = await prisma.product.findMany({ where });
        
        for (const product of productsToUntag) {
          const currentTags = Array.isArray(product.tags) ? product.tags : [];
          const newTags = currentTags.filter((t: string) => t !== updates.tag);
          await prisma.product.update({
            where: { id: product.id },
            data: { tags: newTags }
          });
        }
        
        result = { updated: productsToUntag.length };
        break;
        
      default:
        throw new Error(`Unknown bulk operation: ${operation}`);
    }

    return NextResponse.json({
      success: true,
      action: 'bulk_update_products',
      data: result,
      message: `Bulk update completed! ${result.updated || result.count || 0} ${result.products ? `variants in ${result.products} products` : 'products'} updated.`
    });
  } catch (error: any) {
    throw new Error(`Failed to bulk update products: ${error.message}`);
  }
}

// Export products
async function exportProducts(storeId: string, data: any) {
  try {
    const { format = 'json' } = data;
    
    // Get all products with variants
    const products = await prisma.product.findMany({
      where: { storeId },
      include: {
        variants: true,
        category: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    if (format === 'csv') {
      // Convert to CSV format
      const csv = convertToCSV(products);
      
      return NextResponse.json({
        success: true,
        action: 'export_products',
        data: {
          format: 'csv',
          content: csv,
          filename: `products-${Date.now()}.csv`
        },
        message: `Exported ${products.length} products to CSV format`
      });
    } else {
      // Return as JSON
      return NextResponse.json({
        success: true,
        action: 'export_products', 
        data: {
          format: 'json',
          content: products,
          filename: `products-${Date.now()}.json`
        },
        message: `Exported ${products.length} products to JSON format`
      });
    }
  } catch (error: any) {
    throw new Error(`Failed to export products: ${error.message}`);
  }
}

// Translate single content item
async function translateContent(storeId: string, data: any) {
  try {
    const { contentType, contentId, targetLanguage = 'tr', sourceLanguage = 'en' } = data;
    
    // Get the content to translate
    let content: any = null;
    let fields: string[] = [];
    
    switch (contentType) {
      case 'product':
        content = await prisma.product.findFirst({
          where: { id: contentId, storeId }
        });
        fields = ['name', 'description', 'metaTitle', 'metaDescription'];
        break;
        
      case 'category':
        content = await prisma.category.findFirst({
          where: { id: contentId, storeId }
        });
        fields = ['name', 'description'];
        break;
        
      case 'page':
        content = await prisma.page.findFirst({
          where: { id: contentId, storeId }
        });
        fields = ['title', 'content', 'metaTitle', 'metaDescription'];
        break;
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    if (!content) {
      throw new Error(`${contentType} not found`);
    }
    
    // Prepare texts for translation
    const textsToTranslate = fields
      .filter(field => content[field])
      .map(field => ({
        field,
        text: content[field]
      }));
    
    // Call translation API
    const response = await fetch(`http://localhost:3000/api/ai/translate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-internal-api-call': 'true'
      },
      body: JSON.stringify({
        batch: true,
        texts: textsToTranslate,
        fromLanguage: sourceLanguage,
        toLanguage: targetLanguage,
        context: contentType
      })
    });
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const { translations } = await response.json();
    
    // Store translations in database
    const translatedData: any = {};
    translations.forEach((t: any) => {
      translatedData[t.field] = t.translation;
    });
    
    // Save to database based on content type
    let savedTranslation;
    switch (contentType) {
      case 'product':
        savedTranslation = await prisma.productTranslation.upsert({
          where: {
            productId_language: {
              productId: contentId,
              language: targetLanguage
            }
          },
          update: {
            name: translatedData.name || content.name,
            description: translatedData.description,
            metaTitle: translatedData.metaTitle,
            metaDescription: translatedData.metaDescription
          },
          create: {
            productId: contentId,
            language: targetLanguage,
            name: translatedData.name || content.name,
            description: translatedData.description,
            metaTitle: translatedData.metaTitle,
            metaDescription: translatedData.metaDescription
          }
        });
        break;
        
      case 'category':
        savedTranslation = await prisma.categoryTranslation.upsert({
          where: {
            categoryId_language: {
              categoryId: contentId,
              language: targetLanguage
            }
          },
          update: {
            name: translatedData.name || content.name,
            description: translatedData.description
          },
          create: {
            categoryId: contentId,
            language: targetLanguage,
            name: translatedData.name || content.name,
            description: translatedData.description
          }
        });
        break;
        
      case 'page':
        savedTranslation = await prisma.pageTranslation.upsert({
          where: {
            pageId_language: {
              pageId: contentId,
              language: targetLanguage
            }
          },
          update: {
            title: translatedData.title || translatedData.name || content.title,
            content: translatedData.content || translatedData.description || content.content,
            seoTitle: translatedData.metaTitle || translatedData.seoTitle,
            seoDescription: translatedData.metaDescription || translatedData.seoDescription
          },
          create: {
            pageId: contentId,
            language: targetLanguage,
            title: translatedData.title || translatedData.name || content.title,
            content: translatedData.content || translatedData.description || content.content,
            seoTitle: translatedData.metaTitle || translatedData.seoTitle,
            seoDescription: translatedData.metaDescription || translatedData.seoDescription
          }
        });
        break;
    }
    
    return NextResponse.json({
      success: true,
      action: 'translate_content',
      data: {
        contentType,
        contentId,
        targetLanguage,
        translations: translatedData,
        saved: true
      },
      message: `${contentType} translated to ${targetLanguage.toUpperCase()} and saved successfully!`
    });
  } catch (error: any) {
    throw new Error(`Failed to translate content: ${error.message}`);
  }
}

// Batch translate multiple content items
async function batchTranslateContent(storeId: string, data: any) {
  try {
    const { contentType, targetLanguage = 'tr', sourceLanguage = 'en', limit = 10, filter = {} } = data;
    
    let items: any[] = [];
    let fields: string[] = [];
    
    // Get content based on type
    switch (contentType) {
      case 'product':
        const whereClause: any = { storeId };
        
        // Apply filters
        if (filter.categoryId) whereClause.categoryId = filter.categoryId;
        if (filter.categoryName) {
          const category = await prisma.category.findFirst({
            where: { storeId, name: { contains: filter.categoryName, mode: 'insensitive' } }
          });
          if (category) whereClause.categoryId = category.id;
        }
        if (filter.untranslated) {
          // Check for items without translations in target language
          const translatedIds = await prisma.productTranslation.findMany({
            where: { 
              product: { storeId },
              language: targetLanguage 
            },
            select: { productId: true }
          });
          const translatedProductIds = translatedIds.map(t => t.productId);
          if (translatedProductIds.length > 0) {
            whereClause.id = { notIn: translatedProductIds };
          }
        }
        
        items = await prisma.product.findMany({
          where: whereClause,
          take: limit,
          orderBy: { createdAt: 'desc' }
        });
        fields = ['name', 'description', 'metaTitle', 'metaDescription'];
        break;
        
      case 'category':
        items = await prisma.category.findMany({
          where: { storeId },
          take: limit,
          orderBy: { createdAt: 'desc' }
        });
        fields = ['name', 'description'];
        break;
        
      case 'page':
        items = await prisma.page.findMany({
          where: { storeId },
          take: limit,
          orderBy: { createdAt: 'desc' }
        });
        fields = ['title', 'content', 'metaTitle', 'metaDescription'];
        break;
        
      default:
        throw new Error(`Unsupported content type: ${contentType}`);
    }
    
    if (items.length === 0) {
      return NextResponse.json({
        success: true,
        action: 'batch_translate',
        data: { translated: 0, saved: 0 },
        message: `No ${contentType}s found to translate`
      });
    }
    
    // Translate and save each item
    let translatedCount = 0;
    let savedCount = 0;
    const translationResults = [];
    const errors = [];
    
    for (const item of items) {
      try {
        // Prepare texts for this item
        const textsToTranslate = fields
          .filter(field => item[field])
          .map(field => ({
            field,
            text: item[field]
          }));
        
        if (textsToTranslate.length === 0) continue;
        
        // Call translation API
        const response = await fetch(`http://localhost:3000/api/ai/translate`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-internal-api-call': 'true'
          },
          body: JSON.stringify({
            batch: true,
            texts: textsToTranslate,
            fromLanguage: sourceLanguage,
            toLanguage: targetLanguage,
            context: contentType
          })
        });
        
        if (response.ok) {
          const { translations } = await response.json();
          
          // Build translated data object
          const translatedData: any = {};
          translations.forEach((t: any) => {
            translatedData[t.field] = t.translation;
          });
          
          // Save to database based on content type
          let savedTranslation;
          try {
            switch (contentType) {
              case 'product':
                savedTranslation = await prisma.productTranslation.upsert({
                  where: {
                    productId_language: {
                      productId: item.id,
                      language: targetLanguage
                    }
                  },
                  update: {
                    name: translatedData.name || item.name,
                    description: translatedData.description,
                    metaTitle: translatedData.metaTitle,
                    metaDescription: translatedData.metaDescription
                  },
                  create: {
                    productId: item.id,
                    language: targetLanguage,
                    name: translatedData.name || item.name,
                    description: translatedData.description,
                    metaTitle: translatedData.metaTitle,
                    metaDescription: translatedData.metaDescription
                  }
                });
                break;
                
              case 'category':
                savedTranslation = await prisma.categoryTranslation.upsert({
                  where: {
                    categoryId_language: {
                      categoryId: item.id,
                      language: targetLanguage
                    }
                  },
                  update: {
                    name: translatedData.name || item.name,
                    description: translatedData.description
                  },
                  create: {
                    categoryId: item.id,
                    language: targetLanguage,
                    name: translatedData.name || item.name,
                    description: translatedData.description
                  }
                });
                break;
                
              case 'page':
                savedTranslation = await prisma.pageTranslation.upsert({
                  where: {
                    pageId_language: {
                      pageId: item.id,
                      language: targetLanguage
                    }
                  },
                  update: {
                    title: translatedData.title || item.title,
                    content: translatedData.content || item.content,
                    seoTitle: translatedData.metaTitle || translatedData.seoTitle,
                    seoDescription: translatedData.metaDescription || translatedData.seoDescription
                  },
                  create: {
                    pageId: item.id,
                    language: targetLanguage,
                    title: translatedData.title || item.title,
                    content: translatedData.content || item.content,
                    seoTitle: translatedData.metaTitle || translatedData.seoTitle,
                    seoDescription: translatedData.metaDescription || translatedData.seoDescription
                  }
                });
                break;
            }
            
            if (savedTranslation) {
              savedCount++;
            }
          } catch (dbError: any) {
            console.error(`Failed to save translation for ${contentType} ${item.id}:`, dbError);
            errors.push({
              itemId: item.id,
              itemName: item.name || item.title,
              error: dbError.message
            });
          }
          
          translationResults.push({
            id: item.id,
            name: item.name || item.title,
            translations,
            saved: !!savedTranslation
          });
          translatedCount++;
        }
      } catch (itemError: any) {
        console.error(`Failed to translate ${contentType} ${item.id}:`, itemError);
        errors.push({
          itemId: item.id,
          itemName: item.name || item.title,
          error: itemError.message
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      action: 'batch_translate',
      data: {
        contentType,
        targetLanguage,
        totalItems: items.length,
        translatedCount,
        savedCount,
        results: translationResults,
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Successfully translated ${translatedCount} and saved ${savedCount} out of ${items.length} ${contentType}s to ${targetLanguage.toUpperCase()}`
    });
  } catch (error: any) {
    throw new Error(`Failed to batch translate: ${error.message}`);
  }
}

// Helper function to convert products to CSV
function convertToCSV(products: any[]): string {
  const headers = ['ID', 'Name', 'Description', 'Category', 'SKU', 'Price', 'Stock', 'Status', 'Tags', 'Created'];
  const rows = products.map(product => {
    const defaultVariant = product.variants[0] || {};
    return [
      product.id,
      product.name,
      product.description?.replace(/,/g, ';') || '',
      product.category?.name || '',
      defaultVariant.sku || '',
      defaultVariant.price || 0,
      defaultVariant.stock || 0,
      product.isActive ? 'Active' : 'Inactive',
      Array.isArray(product.tags) ? product.tags.join(';') : '',
      new Date(product.createdAt).toLocaleDateString()
    ].map(val => `"${val}"`).join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}

// GET endpoint to list available actions
export async function GET() {
  return NextResponse.json({
    availableActions: [
      {
        action: 'create_product',
        description: 'Create a new product with AI-generated content',
        requiredFields: ['name'],
        optionalFields: ['description', 'price', 'images', 'tags', 'categoryId']
      },
      {
        action: 'update_product',
        description: 'Update an existing product',
        requiredFields: ['productId'],
        optionalFields: ['name', 'description', 'price', 'isActive', 'images', 'tags']
      },
      {
        action: 'create_discount',
        description: 'Create a discount code',
        requiredFields: [],
        optionalFields: ['code', 'type', 'value', 'minPurchase', 'expiresAt']
      },
      {
        action: 'update_settings',
        description: 'Update store settings',
        requiredFields: [],
        optionalFields: ['storeName', 'currency', 'timezone', 'taxRate']
      },
      {
        action: 'create_campaign',
        description: 'Create a marketing campaign',
        requiredFields: ['name', 'content'],
        optionalFields: ['type', 'subject', 'targetAudience', 'scheduledFor']
      },
      {
        action: 'analyze_store',
        description: 'Get comprehensive store analysis',
        requiredFields: [],
        optionalFields: []
      },
      {
        action: 'generate_content',
        description: 'Generate various content types',
        requiredFields: ['contentType', 'context'],
        optionalFields: []
      },
      {
        action: 'bulk_update_products',
        description: 'Bulk update multiple products',
        requiredFields: ['operation'],
        optionalFields: ['filters', 'updates']
      }
    ]
  });
}