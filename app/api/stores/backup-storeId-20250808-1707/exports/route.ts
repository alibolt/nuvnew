import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for export request
const exportSchema = z.object({
  type: z.enum(['products', 'orders', 'customers', 'inventory', 'analytics', 'all_data']),
  format: z.enum(['csv', 'json', 'xlsx']),
  filters: z.object({
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    status: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional(),
  columns: z.array(z.string()).optional(), // Specific columns to export
  includeImages: z.boolean().default(false),
  includeVariants: z.boolean().default(true)
});

// Available export types and their columns
const exportTypes = {
  products: {
    name: 'Products',
    description: 'Export all product data including variants, images, and inventory',
    defaultColumns: [
      'id', 'title', 'description', 'price', 'compareAtPrice', 'cost', 'sku', 
      'barcode', 'inventory', 'weight', 'status', 'vendor', 'type', 'tags', 
      'createdAt', 'updatedAt'
    ],
    optionalColumns: [
      'images', 'variants', 'options', 'metafields', 'seo'
    ]
  },
  orders: {
    name: 'Orders',
    description: 'Export order data including customer information and line items',
    defaultColumns: [
      'id', 'orderNumber', 'customerEmail', 'customerName', 'status', 'total', 
      'subtotal', 'tax', 'shipping', 'discount', 'paymentStatus', 'fulfillmentStatus',
      'shippingAddress', 'billingAddress', 'createdAt', 'updatedAt'
    ],
    optionalColumns: [
      'lineItems', 'transactions', 'fulfillments', 'notes', 'tags'
    ]
  },
  customers: {
    name: 'Customers',
    description: 'Export customer data and order history',
    defaultColumns: [
      'id', 'email', 'firstName', 'lastName', 'phone', 'acceptsMarketing',
      'totalSpent', 'orderCount', 'defaultAddress', 'createdAt', 'updatedAt'
    ],
    optionalColumns: [
      'addresses', 'orders', 'tags', 'metafields'
    ]
  },
  inventory: {
    name: 'Inventory',
    description: 'Export inventory levels and stock movements',
    defaultColumns: [
      'sku', 'productTitle', 'variantTitle', 'quantity', 'reservedQuantity',
      'availableQuantity', 'location', 'cost', 'lowStockThreshold', 'updatedAt'
    ],
    optionalColumns: [
      'adjustmentHistory', 'supplier', 'reorderPoint', 'reorderQuantity'
    ]
  },
  analytics: {
    name: 'Analytics',
    description: 'Export sales and performance analytics',
    defaultColumns: [
      'date', 'revenue', 'orders', 'customers', 'sessions', 'conversionRate',
      'averageOrderValue', 'topProducts', 'topCategories'
    ],
    optionalColumns: [
      'traffic', 'sources', 'devices', 'locations', 'customerLTV'
    ]
  }
};

// GET - List export jobs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get export jobs from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let exportJobs = storeSettings?.exportJobs as any[] || [];

    // Filter by status
    if (status) {
      exportJobs = exportJobs.filter(job => job.status === status);
    }

    // Sort by creation date (newest first)
    exportJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ 
      exportJobs,
      exportTypes
    });
  } catch (error) {
    console.error('[EXPORTS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create export job
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
    
    // Validate input
    const validation = exportSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current export jobs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const exportJobs = storeSettings?.exportJobs as any[] || [];

    // Create new export job
    const newExportJob = {
      id: `export_${Date.now()}`,
      type: validation.data.type,
      format: validation.data.format,
      filters: validation.data.filters || {},
      columns: validation.data.columns || exportTypes[validation.data.type]?.defaultColumns || [],
      includeImages: validation.data.includeImages,
      includeVariants: validation.data.includeVariants,
      status: 'pending',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      downloadUrl: null,
      fileName: null,
      fileSize: null,
      createdAt: new Date().toISOString(),
      createdBy: session.user.email,
      startedAt: null,
      completedAt: null,
      error: null
    };

    // Add to export jobs
    exportJobs.push(newExportJob);

    // Keep only last 50 export jobs
    if (exportJobs.length > 50) {
      exportJobs.splice(0, exportJobs.length - 50);
    }

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        exportJobs
      },
      create: {
        storeId: store.id,
        exportJobs
      }
    });

    // TODO: Start background job to process export
    // This would typically be handled by a queue system like Bull or Redis
    // For now, we'll simulate the process
    setTimeout(async () => {
      try {
        // Update job status to processing
        const currentSettings = await prisma.storeSettings.findUnique({
          where: { storeId: store.id }
        });
        
        const currentJobs = currentSettings?.exportJobs as any[] || [];
        const jobIndex = currentJobs.findIndex(job => job.id === newExportJob.id);
        
        if (jobIndex !== -1) {
          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'processing',
            startedAt: new Date().toISOString(),
            progress: 10
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { exportJobs: currentJobs }
          });

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 5000));

          // Complete the job
          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'completed',
            progress: 100,
            completedAt: new Date().toISOString(),
            downloadUrl: `/api/stores/${storeId}/exports/${newExportJob.id}/download`,
            fileName: `${validation.data.type}_export_${Date.now()}.${validation.data.format}`,
            fileSize: Math.floor(Math.random() * 1000000) + 100000 // Random file size for demo
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { exportJobs: currentJobs }
          });
        }
      } catch (error) {
        console.error('Export processing error:', error);
        
        // Mark job as failed
        const currentSettings = await prisma.storeSettings.findUnique({
          where: { storeId: store.id }
        });
        
        const currentJobs = currentSettings?.exportJobs as any[] || [];
        const jobIndex = currentJobs.findIndex(job => job.id === newExportJob.id);
        
        if (jobIndex !== -1) {
          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'failed',
            error: 'Export processing failed'
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { exportJobs: currentJobs }
          });
        }
      }
    }, 1000);

    return NextResponse.json({ 
      message: 'Export job created successfully',
      exportJob: newExportJob
    });
  } catch (error) {
    console.error('[EXPORTS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update export job (mainly for cancellation)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { exportId, action } = await request.json();
    
    if (!exportId || !action) {
      return NextResponse.json({ 
        error: 'Export ID and action are required' 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current export jobs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const exportJobs = storeSettings?.exportJobs as any[] || [];
    const jobIndex = exportJobs.findIndex(job => job.id === exportId);

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'cancel':
        if (exportJobs[jobIndex].status === 'pending' || exportJobs[jobIndex].status === 'processing') {
          exportJobs[jobIndex] = {
            ...exportJobs[jobIndex],
            status: 'cancelled',
            completedAt: new Date().toISOString()
          };
        } else {
          return NextResponse.json({ 
            error: 'Cannot cancel completed or failed export' 
          }, { status: 400 });
        }
        break;
        
      case 'retry':
        if (exportJobs[jobIndex].status === 'failed') {
          exportJobs[jobIndex] = {
            ...exportJobs[jobIndex],
            status: 'pending',
            progress: 0,
            error: null,
            startedAt: null,
            completedAt: null
          };
        } else {
          return NextResponse.json({ 
            error: 'Can only retry failed exports' 
          }, { status: 400 });
        }
        break;
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        exportJobs
      }
    });

    return NextResponse.json({ 
      message: `Export job ${action}ed successfully`,
      exportJob: exportJobs[jobIndex]
    });
  } catch (error) {
    console.error('[EXPORTS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete export job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId } = await params;
    const { searchParams } = new URL(request.url);
    const exportId = searchParams.get('exportId');
    
    if (!exportId) {
      return NextResponse.json({ error: 'Export ID is required' }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { id: storeId, userId: session.user.id },
          { subdomain: storeId, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get current export jobs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const exportJobs = storeSettings?.exportJobs as any[] || [];
    const filteredJobs = exportJobs.filter(job => job.id !== exportId);

    if (filteredJobs.length === exportJobs.length) {
      return NextResponse.json({ error: 'Export job not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        exportJobs: filteredJobs
      }
    });

    // TODO: Delete actual export file from storage

    return NextResponse.json({ 
      message: 'Export job deleted successfully'
    });
  } catch (error) {
    console.error('[EXPORTS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}