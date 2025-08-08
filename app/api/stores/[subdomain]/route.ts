import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { deleteSubdomain } from '@/lib/subdomains';

// GET - Get store details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    console.log('[STORE API] Request for subdomain:', subdomain);
    
    const session = await getServerSession(authOptions);
    console.log('[STORE API] Session:', session ? `User: ${session.user?.email}` : 'Not authenticated');
    
    if (!session?.user?.id) {
      console.log('[STORE API] Returning 401 Unauthorized');
      return apiResponse.unauthorized();
    }

    console.log('[STORE API] Looking for store:', subdomain, 'for user:', session.user.id);

    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    console.log('[STORE API] Store found:', store ? store.subdomain : 'NOT FOUND');

    if (!store) {
      console.log('[STORE API] Store not found, returning 404');
      return apiResponse.notFound('Store ');
    }

    return apiResponse.success(store);
  } catch (error) {
    console.error('[STORE API] GET_STORE_ERROR', error);
    return apiResponse.serverError();
  }
}

// PUT - Update store
export async function PUT(
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
    const { 
      name, 
      description, 
      logo, 
      primaryColor,
      email,
      phone,
      address,
      facebook,
      instagram,
      twitter,
      youtube,
      metaTitle,
      metaDescription,
      keywords,
      bannerImage,
      bannerTitle,
      bannerSubtitle
    } = body;

    // Check if store exists and belongs to user
    const existingStore = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!existingStore) {
      return apiResponse.notFound('Store ');
    }

    // Update store
    const updatedStore = await prisma.store.update({
      where: { id: existingStore.id },
      data: {
        name,
        description,
        logo,
        primaryColor,
        email,
        phone,
        address,
        facebook,
        instagram,
        twitter,
        youtube,
        metaTitle,
        metaDescription,
        keywords,
        bannerImage,
        bannerTitle,
        bannerSubtitle
      }
    });

    return apiResponse.success(updatedStore);
  } catch (error) {
    console.error('UPDATE_STORE_ERROR', error);
    return apiResponse.serverError();
  }
}

// DELETE - Delete store
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;

    // Check if store exists and belongs to user
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Delete store and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all related data that might not cascade automatically
      // This ensures clean deletion even if there are constraint issues
      
      // Delete order line items first (deepest level)
      await tx.orderLineItem.deleteMany({
        where: {
          order: {
            storeId: store.id
          }
        }
      });
      
      // Delete orders
      await tx.order.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete product variants and images
      await tx.productImage.deleteMany({
        where: {
          variant: {
            product: {
              storeId: store.id
            }
          }
        }
      });
      
      await tx.productVariant.deleteMany({
        where: {
          product: {
            storeId: store.id
          }
        }
      });
      
      // Delete products
      await tx.product.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete menu items
      await tx.menuItem.deleteMany({
        where: {
          menu: {
            storeId: store.id
          }
        }
      });
      
      // Delete menus
      await tx.menu.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete categories
      await tx.category.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete customers
      await tx.customer.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete blog posts
      await tx.blogPost.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete blogs
      await tx.blog.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete pages
      await tx.page.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete section blocks
      await tx.sectionBlock.deleteMany({
        where: {
          section: {
            template: {
              storeId: store.id
            }
          }
        }
      });
      
      // Delete section instances
      await tx.storeSectionInstance.deleteMany({
        where: {
          template: {
            storeId: store.id
          }
        }
      });
      
      // Delete templates
      await tx.storeTemplate.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete store settings
      await tx.storeSettings.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete payment settings and tax regions
      const paymentSettings = await tx.paymentSettings.findUnique({
        where: { storeId: store.id }
      });
      
      if (paymentSettings) {
        await tx.taxRegion.deleteMany({
          where: { paymentSettingsId: paymentSettings.id }
        });
        
        await tx.paymentSettings.delete({
          where: { id: paymentSettings.id }
        });
      }
      
      // Delete email logs
      await tx.emailLog.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete app installs and related data
      await tx.shopifyImport.deleteMany({
        where: {
          appInstall: {
            storeId: store.id
          }
        }
      });
      
      await tx.appInstall.deleteMany({
        where: { storeId: store.id }
      });
      
      // Delete search-related data
      await tx.searchIndex.deleteMany({
        where: { storeId: store.id }
      });
      
      await tx.searchQuery.deleteMany({
        where: { storeId: store.id }
      });
      
      await tx.searchSynonym.deleteMany({
        where: { storeId: store.id }
      });
      
      await tx.searchBoost.deleteMany({
        where: { storeId: store.id }
      });
      
      await tx.searchRedirect.deleteMany({
        where: { storeId: store.id }
      });
      
      await tx.searchSettings.deleteMany({
        where: { storeId: store.id }
      });
      
      await tx.googleIntegration.deleteMany({
        where: { storeId: store.id }
      });
      
      // Finally, delete the store itself
      await tx.store.delete({
        where: { id: store.id }
      });
    });

    // Delete from Redis after successful database deletion
    await deleteSubdomain(store.subdomain);

    return apiResponse.success({ message: 'Store deleted successfully' });
  } catch (error) {
    console.error('DELETE_STORE_ERROR', error);
    return apiResponse.serverError();
  }
}