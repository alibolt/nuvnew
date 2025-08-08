import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for import request
const importSchema = z.object({
  type: z.enum(['products', 'customers', 'inventory', 'orders']),
  format: z.enum(['csv', 'json', 'xlsx']),
  fileName: z.string().min(1),
  fileUrl: z.string().url().optional(),
  fileData: z.string().optional(), // Base64 encoded file content
  mappings: z.record(z.string()).optional(), // Column mappings
  settings: z.object({
    skipFirstRow: z.boolean().default(true),
    updateExisting: z.boolean().default(false),
    createMissing: z.boolean().default(true),
    validateData: z.boolean().default(true),
    dryRun: z.boolean().default(false)
  }).optional()
});

// Available import types and their required fields
const importTypes = {
  products: {
    name: 'Products',
    description: 'Import products with variants, images, and inventory',
    requiredFields: ['title', 'price'],
    optionalFields: [
      'description', 'vendor', 'type', 'tags', 'sku', 'barcode', 'weight',
      'inventory', 'compareAtPrice', 'cost', 'status', 'images', 'variants'
    ],
    sampleData: [
      {
        title: 'Sample Product',
        description: 'This is a sample product description',
        price: '29.99',
        compareAtPrice: '39.99',
        sku: 'SAMPLE-001',
        inventory: '100',
        status: 'active'
      }
    ]
  },
  customers: {
    name: 'Customers',
    description: 'Import customer data and contact information',
    requiredFields: ['email'],
    optionalFields: [
      'firstName', 'lastName', 'phone', 'acceptsMarketing', 'tags',
      'address1', 'address2', 'city', 'province', 'country', 'zip'
    ],
    sampleData: [
      {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        acceptsMarketing: 'true',
        address1: '123 Main St',
        city: 'New York',
        province: 'NY',
        country: 'United States',
        zip: '10001'
      }
    ]
  },
  inventory: {
    name: 'Inventory',
    description: 'Import inventory levels and stock adjustments',
    requiredFields: ['sku', 'quantity'],
    optionalFields: [
      'location', 'cost', 'barcode', 'lowStockThreshold', 'trackQuantity',
      'allowBackorders', 'reason', 'note'
    ],
    sampleData: [
      {
        sku: 'SAMPLE-001',
        quantity: '50',
        location: 'Warehouse A',
        cost: '15.00',
        lowStockThreshold: '10',
        reason: 'recount'
      }
    ]
  },
  orders: {
    name: 'Orders',
    description: 'Import order data (be careful with this)',
    requiredFields: ['customerEmail', 'lineItems'],
    optionalFields: [
      'orderNumber', 'status', 'paymentStatus', 'fulfillmentStatus',
      'total', 'subtotal', 'tax', 'shipping', 'discount',
      'shippingAddress', 'billingAddress', 'notes', 'tags'
    ],
    sampleData: [
      {
        customerEmail: 'customer@example.com',
        orderNumber: 'ORD-001',
        status: 'fulfilled',
        total: '29.99',
        lineItems: '[{"sku":"SAMPLE-001","quantity":1,"price":"29.99"}]'
      }
    ]
  }
};

// GET - List import jobs
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

    // Get import jobs from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let importJobs = storeSettings?.importJobs as any[] || [];

    // Filter by status
    if (status) {
      importJobs = importJobs.filter(job => job.status === status);
    }

    // Sort by creation date (newest first)
    importJobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ 
      importJobs,
      importTypes
    });
  } catch (error) {
    console.error('[IMPORTS API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create import job
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
    const validation = importSchema.safeParse(body);
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

    // Validate that either fileUrl or fileData is provided
    if (!validation.data.fileUrl && !validation.data.fileData) {
      return NextResponse.json({ 
        error: 'Either fileUrl or fileData must be provided' 
      }, { status: 400 });
    }

    // Get current import jobs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const importJobs = storeSettings?.importJobs as any[] || [];

    // Create new import job
    const newImportJob = {
      id: `import_${Date.now()}`,
      type: validation.data.type,
      format: validation.data.format,
      fileName: validation.data.fileName,
      fileUrl: validation.data.fileUrl,
      mappings: validation.data.mappings || {},
      settings: validation.data.settings || {
        skipFirstRow: true,
        updateExisting: false,
        createMissing: true,
        validateData: true,
        dryRun: false
      },
      status: 'pending',
      progress: 0,
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      preview: null,
      createdAt: new Date().toISOString(),
      createdBy: session.user.email,
      startedAt: null,
      completedAt: null,
      results: null
    };

    // Add to import jobs
    importJobs.push(newImportJob);

    // Keep only last 50 import jobs
    if (importJobs.length > 50) {
      importJobs.splice(0, importJobs.length - 50);
    }

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        importJobs
      },
      create: {
        storeId: store.id,
        importJobs
      }
    });

    // TODO: Start background job to process import
    // This would typically validate the file, parse data, and then import
    setTimeout(async () => {
      try {
        // Update job status to processing
        const currentSettings = await prisma.storeSettings.findUnique({
          where: { storeId: store.id }
        });
        
        const currentJobs = currentSettings?.importJobs as any[] || [];
        const jobIndex = currentJobs.findIndex(job => job.id === newImportJob.id);
        
        if (jobIndex !== -1) {
          // Validation phase
          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'validating',
            startedAt: new Date().toISOString(),
            progress: 10
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { importJobs: currentJobs }
          });

          // Simulate validation time
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Processing phase
          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'processing',
            progress: 50,
            totalRecords: Math.floor(Math.random() * 100) + 10 // Random for demo
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { importJobs: currentJobs }
          });

          // Simulate processing time
          await new Promise(resolve => setTimeout(resolve, 3000));

          // Complete the job
          const totalRecords = currentJobs[jobIndex].totalRecords;
          const successfulRecords = Math.floor(totalRecords * 0.9); // 90% success rate for demo
          const failedRecords = totalRecords - successfulRecords;

          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'completed',
            progress: 100,
            processedRecords: totalRecords,
            successfulRecords,
            failedRecords,
            completedAt: new Date().toISOString(),
            results: {
              created: successfulRecords,
              updated: 0,
              skipped: failedRecords,
              errors: failedRecords > 0 ? [
                { row: 5, field: 'price', message: 'Invalid price format' },
                { row: 12, field: 'email', message: 'Email already exists' }
              ] : []
            }
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { importJobs: currentJobs }
          });
        }
      } catch (error) {
        console.error('Import processing error:', error);
        
        // Mark job as failed
        const currentSettings = await prisma.storeSettings.findUnique({
          where: { storeId: store.id }
        });
        
        const currentJobs = currentSettings?.importJobs as any[] || [];
        const jobIndex = currentJobs.findIndex(job => job.id === newImportJob.id);
        
        if (jobIndex !== -1) {
          currentJobs[jobIndex] = {
            ...currentJobs[jobIndex],
            status: 'failed',
            errors: ['Import processing failed']
          };

          await prisma.storeSettings.update({
            where: { storeId: store.id },
            data: { importJobs: currentJobs }
          });
        }
      }
    }, 1000);

    return NextResponse.json({ 
      message: 'Import job created successfully',
      importJob: newImportJob
    });
  } catch (error) {
    console.error('[IMPORTS API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update import job (mainly for re-running or cancellation)
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
    const { importId, action, mappings } = await request.json();
    
    if (!importId || !action) {
      return NextResponse.json({ 
        error: 'Import ID and action are required' 
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

    // Get current import jobs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const importJobs = storeSettings?.importJobs as any[] || [];
    const jobIndex = importJobs.findIndex(job => job.id === importId);

    if (jobIndex === -1) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 });
    }

    // Handle different actions
    switch (action) {
      case 'cancel':
        if (importJobs[jobIndex].status === 'pending' || 
            importJobs[jobIndex].status === 'validating' || 
            importJobs[jobIndex].status === 'processing') {
          importJobs[jobIndex] = {
            ...importJobs[jobIndex],
            status: 'cancelled',
            completedAt: new Date().toISOString()
          };
        } else {
          return NextResponse.json({ 
            error: 'Cannot cancel completed or failed import' 
          }, { status: 400 });
        }
        break;
        
      case 'retry':
        if (importJobs[jobIndex].status === 'failed') {
          importJobs[jobIndex] = {
            ...importJobs[jobIndex],
            status: 'pending',
            progress: 0,
            processedRecords: 0,
            successfulRecords: 0,
            failedRecords: 0,
            errors: [],
            warnings: [],
            startedAt: null,
            completedAt: null,
            results: null
          };
        } else {
          return NextResponse.json({ 
            error: 'Can only retry failed imports' 
          }, { status: 400 });
        }
        break;
        
      case 'update_mappings':
        if (mappings && (importJobs[jobIndex].status === 'pending' || 
                        importJobs[jobIndex].status === 'validating')) {
          importJobs[jobIndex] = {
            ...importJobs[jobIndex],
            mappings
          };
        } else {
          return NextResponse.json({ 
            error: 'Can only update mappings for pending imports' 
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
        importJobs
      }
    });

    return NextResponse.json({ 
      message: `Import job ${action} successful`,
      importJob: importJobs[jobIndex]
    });
  } catch (error) {
    console.error('[IMPORTS API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete import job
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
    const importId = searchParams.get('importId');
    
    if (!importId) {
      return NextResponse.json({ error: 'Import ID is required' }, { status: 400 });
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

    // Get current import jobs
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const importJobs = storeSettings?.importJobs as any[] || [];
    const filteredJobs = importJobs.filter(job => job.id !== importId);

    if (filteredJobs.length === importJobs.length) {
      return NextResponse.json({ error: 'Import job not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        importJobs: filteredJobs
      }
    });

    return NextResponse.json({ 
      message: 'Import job deleted successfully'
    });
  } catch (error) {
    console.error('[IMPORTS API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}