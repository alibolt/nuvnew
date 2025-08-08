import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { downloadImage, downloadImages } from '@/lib/image-downloader';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await context.params;
    const { shopifyUrl, selectedData, storeData } = await request.json();

    if (!shopifyUrl || !selectedData) {
      return apiResponse.badRequest('Missing required data: shopifyUrl and selectedData are required');
    }

    // storeData can be empty object - that's valid
    const storeMetadata = storeData || {};

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

    // Download logo if available
    let logoUrl = store.logo;
    if (storeMetadata.logo) {
      const downloadedLogo = await downloadImage(storeMetadata.logo, subdomain);
      if (downloadedLogo) {
        logoUrl = downloadedLogo;
      }
    }

    // Download favicon if available
    let faviconUrl = null;
    if (storeMetadata.favicon) {
      const downloadedFavicon = await downloadImage(storeMetadata.favicon, subdomain);
      if (downloadedFavicon) {
        faviconUrl = downloadedFavicon;
      }
    }

    // Extract social links
    const socialLinks = {
      facebook: storeMetadata.socialLinks?.facebook || '',
      twitter: storeMetadata.socialLinks?.twitter || '',
      instagram: storeMetadata.socialLinks?.instagram || '',
      youtube: storeMetadata.socialLinks?.youtube || '',
      pinterest: storeMetadata.socialLinks?.pinterest || '',
      tiktok: storeMetadata.socialLinks?.tiktok || '',
      linkedin: storeMetadata.socialLinks?.linkedin || '',
    };

    // Get store settings for media library
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });
    
    // Parse mediaLibrary - it's stored as JSON string
    let mediaLibrary: any[] = [];
    if (storeSettings?.mediaLibrary) {
      try {
        if (typeof storeSettings.mediaLibrary === 'string') {
          mediaLibrary = JSON.parse(storeSettings.mediaLibrary) || [];
        } else if (Array.isArray(storeSettings.mediaLibrary)) {
          mediaLibrary = storeSettings.mediaLibrary;
        }
      } catch (error) {
        console.error('Failed to parse mediaLibrary:', error);
        mediaLibrary = [];
      }
    }

    // Import selected products
    let importedProducts = 0;
    let importedProductImages = 0;
    if (selectedData.products && selectedData.products.length > 0) {
      for (const productData of selectedData.products) {
        try {
          // Download product images
          let downloadedImages: any[] = [];
          if (productData.images && productData.images.length > 0) {
            const imageUrls = productData.images.map((img: any) => img.url || img);
            const downloadedUrls = await downloadImages(imageUrls, subdomain);
            downloadedImages = downloadedUrls.map((url, index) => ({
              url: url,
              altText: productData.images[index]?.altText || productData.title
            }));

            // Add product images to media library
            for (let i = 0; i < downloadedUrls.length; i++) {
              const url = downloadedUrls[i];
              const originalImage = productData.images[i];
              
              if (url) {
                const filename = url.split('/').pop() || 'product-image.jpg';
                const mediaFile = {
                  id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  originalName: filename,
                  fileName: filename,
                  fileUrl: url,
                  url: url, // For backward compatibility
                  mimeType: 'image/jpeg',
                  fileSize: 0,
                  alt: originalImage?.altText || productData.title,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  metadata: {
                    title: `${productData.title} - Image ${i + 1}`,
                    description: `Product image for ${productData.title}`,
                    tags: ['product', 'shopify-import', productData.productType || 'product'].filter(Boolean),
                    folder: 'products',
                    uploadedBy: session.user.email,
                    source: 'shopify-import',
                    productTitle: productData.title,
                    productHandle: productData.handle
                  },
                  usage: [],
                  context: 'product',
                  contextId: productData.handle
                };
                
                mediaLibrary.push(mediaFile);
                importedProductImages++;
              }
            }
          }

          // Create product
          const product = await prisma.product.create({
            data: {
              name: productData.title,
              description: productData.description || '',
              slug: productData.handle || productData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
              productType: 'physical',
              isActive: true,
              storeId: store.id,
              tags: JSON.stringify(productData.tags || []),
              images: JSON.stringify(downloadedImages),
              metaTitle: productData.title,
              metaDescription: productData.description?.substring(0, 160) || '',
            }
          });

          // Create variants
          if (productData.variants && productData.variants.length > 0) {
            for (const variantData of productData.variants) {
              await prisma.productVariant.create({
                data: {
                  name: variantData.title,
                  price: variantData.price || 0,
                  stock: variantData.availableForSale ? 10 : 0,
                  productId: product.id,
                  options: JSON.stringify(variantData.options || []),
                }
              });
            }
          }
          importedProducts++;
        } catch (error) {
          console.error('Error importing product:', productData.title, error);
        }
      }
    }

    // Pages import removed - only importing images now
    let importedPages = 0;

    // Import selected collections as categories
    let importedCategories = 0;
    if (selectedData.collections && selectedData.collections.length > 0) {
      for (const collectionData of selectedData.collections) {
        try {
          // Download collection image if available
          let collectionImage = null;
          if (collectionData.image?.url) {
            collectionImage = await downloadImage(collectionData.image.url, subdomain);
          }

          // Generate unique slug
          let baseSlug = collectionData.handle || collectionData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          let uniqueSlug = baseSlug;
          let counter = 1;
          
          // Check for existing slug and make it unique
          while (await prisma.category.findFirst({ where: { storeId: store.id, slug: uniqueSlug } })) {
            uniqueSlug = `${baseSlug}-${counter}`;
            counter++;
          }

          await prisma.category.create({
            data: {
              name: collectionData.title,
              slug: uniqueSlug,
              description: collectionData.description || '',
              image: collectionImage || collectionData.image?.url || null,
              storeId: store.id,
            }
          });
          importedCategories++;
        } catch (error) {
          console.error('Error importing collection:', collectionData.title, error);
        }
      }
    }

    // Update store with imported data
    const updatedStore = await prisma.store.update({
      where: { id: store.id },
      data: {
        name: storeMetadata.name || store.name,
        description: storeMetadata.description || store.description,
        logo: logoUrl,
        email: storeMetadata.email || store.email,
        phone: storeMetadata.phone || store.phone,
        address: storeMetadata.address || store.address,
        facebook: socialLinks.facebook,
        twitter: socialLinks.twitter,
        instagram: socialLinks.instagram,
        youtube: socialLinks.youtube,
        metaTitle: storeMetadata.metaTitle || storeMetadata.name,
        metaDescription: storeMetadata.metaDescription || storeMetadata.description,
      }
    });

    // Import menus if selected
    let importedMenus = 0;
    if (selectedData.menus && selectedData.menus.length > 0) {
      for (const menu of selectedData.menus) {
        try {
          // Check if menu already exists
          const existingMenu = await prisma.menu.findUnique({
            where: {
              storeId_handle: {
                storeId: store.id,
                handle: menu.handle
              }
            }
          });

          if (existingMenu) {
            // Update existing menu
            await prisma.menu.update({
              where: { id: existingMenu.id },
              data: {
                name: menu.name,
                items: {
                  deleteMany: {}, // Delete existing items
                  create: menu.items?.map((item: any, index: number) => ({
                    label: item.label,
                    link: item.link,
                    position: index
                  })) || []
                }
              }
            });
          } else {
            // Create new menu
            await prisma.menu.create({
              data: {
                name: menu.name,
                handle: menu.handle,
                storeId: store.id,
                items: {
                  create: menu.items?.map((item: any, index: number) => ({
                    label: item.label,
                    link: item.link,
                    position: index
                  })) || []
                }
              }
            });
          }
          importedMenus++;
        } catch (error) {
          console.error(`Error importing menu ${menu.handle}:`, error);
        }
      }
    }

    // Import site images if selected and add to media library
    let importedSiteImages = 0;
    if (selectedData.siteImages && selectedData.siteImages.length > 0) {
      for (const image of selectedData.siteImages) {
        try {
          // Download and save image
          const downloadedImage = await downloadImage(image.url, subdomain);
          if (downloadedImage) {
            // Create media record
            const filename = downloadedImage.split('/').pop() || 'image.jpg';
            const mediaFile = {
              id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              originalName: filename,
              fileName: filename,
              fileUrl: downloadedImage,
              url: downloadedImage, // For backward compatibility
              mimeType: 'image/jpeg',
              fileSize: 0, // Will be updated if needed
              alt: image.alt || 'Site Image',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              metadata: {
                title: image.alt || 'Site Image',
                description: `Imported from Shopify: ${image.category}`,
                tags: [image.type, image.category, 'shopify-import'].filter(Boolean),
                folder: 'shopify-import',
                uploadedBy: session.user.email,
                source: 'shopify-import',
                originalUrl: image.url,
                imageType: image.type,
                imageCategory: image.category
              },
              usage: [],
              context: 'theme'
            };
            
            // Add to media library
            mediaLibrary.push(mediaFile);
            importedSiteImages++;
          }
        } catch (error) {
          console.error(`Error importing site image ${image.url}:`, error);
        }
      }
      
    }

    // Update store settings with new media library (includes both product and site images)
    if (importedProductImages > 0 || importedSiteImages > 0) {
      await prisma.storeSettings.upsert({
        where: { storeId: store.id },
        update: { 
          mediaLibrary: JSON.stringify(mediaLibrary) 
        },
        create: {
          storeId: store.id,
          mediaLibrary: JSON.stringify(mediaLibrary)
        }
      });
    }

    return apiResponse.success({
      message: `Import completed successfully! Imported ${importedProducts} products, ${importedCategories} collections, ${importedMenus} menus, ${importedSiteImages} site images, and ${importedProductImages} product images to Media Library.`,
      stats: {
        products: importedProducts,
        categories: importedCategories,
        menus: importedMenus,
        siteImages: importedSiteImages,
        productImages: importedProductImages,
        totalMediaFiles: importedProductImages + importedSiteImages,
      },
      store: {
        name: updatedStore.name,
        logo: updatedStore.logo,
        description: updatedStore.description,
      }
    });
  } catch (error) {
    console.error('Error importing store metadata:', error);
    return handleApiError(error);
  }
}