import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for inventory item
const inventoryItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  sku: z.string().min(1),
  quantity: z.number().min(0),
  reservedQuantity: z.number().min(0).default(0),
  lowStockThreshold: z.number().min(0).optional(),
  trackQuantity: z.boolean().default(true),
  allowBackorders: z.boolean().default(false),
  location: z.string().optional(),
  cost: z.number().min(0).optional(),
  barcode: z.string().optional(),
});

// Schema for inventory adjustment
const inventoryAdjustmentSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().optional(),
  adjustment: z.number(),
  reason: z.enum(['recount', 'damaged', 'sold', 'returned', 'transfer', 'correction', 'other']),
  note: z.string().optional(),
});

// GET - Get inventory items
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
    const lowStock = searchParams.get('lowStock') === 'true';
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    
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

    // Get inventory from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let inventory = storeSettings?.inventory as any[] || [];

    // Search filter
    if (search) {
      inventory = inventory.filter(item => 
        item.sku.toLowerCase().includes(search.toLowerCase()) ||
        item.barcode?.toLowerCase().includes(search.toLowerCase()) ||
        item.productName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Location filter
    if (location) {
      inventory = inventory.filter(item => item.location === location);
    }

    // Low stock filter
    if (lowStock) {
      inventory = inventory.filter(item => {
        if (!item.trackQuantity || !item.lowStockThreshold) return false;
        const availableQuantity = item.quantity - item.reservedQuantity;
        return availableQuantity <= item.lowStockThreshold;
      });
    }

    // Calculate totals
    const totalValue = inventory.reduce((sum, item) => 
      sum + (item.quantity * (item.cost || 0)), 0
    );

    const lowStockItems = inventory.filter(item => {
      if (!item.trackQuantity || !item.lowStockThreshold) return false;
      const availableQuantity = item.quantity - item.reservedQuantity;
      return availableQuantity <= item.lowStockThreshold;
    }).length;

    return NextResponse.json({ 
      inventory,
      summary: {
        totalItems: inventory.length,
        totalValue,
        lowStockItems
      }
    });
  } catch (error) {
    console.error('[INVENTORY API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Add inventory item
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
    const validation = inventoryItemSchema.safeParse(body);
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

    // Get current inventory
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const inventory = storeSettings?.inventory as any[] || [];

    // Check for duplicate SKU
    const existingItem = inventory.find(item => item.sku === validation.data.sku);
    if (existingItem) {
      return NextResponse.json({ 
        error: 'An item with this SKU already exists' 
      }, { status: 400 });
    }

    // Create new inventory item
    const newItem = {
      id: `inv_${Date.now()}`,
      ...validation.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adjustmentHistory: []
    };

    // Add to inventory
    inventory.push(newItem);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        inventory
      },
      create: {
        storeId: store.id,
        inventory
      }
    });

    return NextResponse.json({ 
      message: 'Inventory item added successfully',
      item: newItem 
    });
  } catch (error) {
    console.error('[INVENTORY API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Adjust inventory
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
    const body = await request.json();
    
    // Validate input
    const validation = inventoryAdjustmentSchema.safeParse(body);
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

    // Get current inventory
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const inventory = storeSettings?.inventory as any[] || [];
    
    // Find inventory item
    const itemIndex = inventory.findIndex(item => 
      item.productId === validation.data.productId &&
      (!validation.data.variantId || item.variantId === validation.data.variantId)
    );

    if (itemIndex === -1) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    const item = inventory[itemIndex];
    const newQuantity = item.quantity + validation.data.adjustment;

    if (newQuantity < 0) {
      return NextResponse.json({ 
        error: 'Adjustment would result in negative inventory' 
      }, { status: 400 });
    }

    // Create adjustment record
    const adjustment = {
      id: `adj_${Date.now()}`,
      adjustment: validation.data.adjustment,
      reason: validation.data.reason,
      note: validation.data.note,
      previousQuantity: item.quantity,
      newQuantity,
      performedBy: session.user.email,
      timestamp: new Date().toISOString()
    };

    // Update inventory item
    inventory[itemIndex] = {
      ...item,
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
      adjustmentHistory: [...(item.adjustmentHistory || []), adjustment]
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        inventory
      }
    });

    return NextResponse.json({ 
      message: 'Inventory adjusted successfully',
      item: inventory[itemIndex],
      adjustment
    });
  } catch (error) {
    console.error('[INVENTORY API] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Remove inventory item
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
    const itemId = searchParams.get('itemId');
    
    if (!itemId) {
      return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
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

    // Get current inventory
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const inventory = storeSettings?.inventory as any[] || [];
    const filteredInventory = inventory.filter(item => item.id !== itemId);

    if (filteredInventory.length === inventory.length) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        inventory: filteredInventory
      }
    });

    return NextResponse.json({ 
      message: 'Inventory item removed successfully'
    });
  } catch (error) {
    console.error('[INVENTORY API] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}