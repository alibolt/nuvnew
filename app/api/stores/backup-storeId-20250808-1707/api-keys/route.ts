import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Schema for API key
const apiKeySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  permissions: z.array(z.enum([
    'products:read',
    'products:write',
    'orders:read',
    'orders:write',
    'customers:read',
    'customers:write',
    'inventory:read',
    'inventory:write',
    'analytics:read',
    'webhooks:read',
    'webhooks:write',
    'settings:read',
    'settings:write'
  ])),
  expiresAt: z.string().datetime().optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  rateLimit: z.object({
    requestsPerMinute: z.number().min(1).max(1000).default(60),
    requestsPerHour: z.number().min(1).max(10000).default(1000)
  }).optional()
});

// Schema for updating API key
const updateApiKeySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  permissions: z.array(z.enum([
    'products:read',
    'products:write',
    'orders:read',
    'orders:write',
    'customers:read',
    'customers:write',
    'inventory:read',
    'inventory:write',
    'analytics:read',
    'webhooks:read',
    'webhooks:write',
    'settings:read',
    'settings:write'
  ])).optional(),
  expiresAt: z.string().datetime().optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  rateLimit: z.object({
    requestsPerMinute: z.number().min(1).max(1000),
    requestsPerHour: z.number().min(1).max(10000)
  }).optional(),
  active: z.boolean().optional()
});

// Generate API key
function generateApiKey(): { key: string; hash: string } {
  const key = `nk_${crypto.randomBytes(32).toString('hex')}`;
  const hash = crypto.createHash('sha256').update(key).digest('hex');
  return { key, hash };
}

// Available permissions
const availablePermissions = [
  {
    category: 'Products',
    permissions: [
      { value: 'products:read', label: 'Read Products', description: 'View product information' },
      { value: 'products:write', label: 'Write Products', description: 'Create, update, and delete products' }
    ]
  },
  {
    category: 'Orders',
    permissions: [
      { value: 'orders:read', label: 'Read Orders', description: 'View order information' },
      { value: 'orders:write', label: 'Write Orders', description: 'Create, update, and manage orders' }
    ]
  },
  {
    category: 'Customers',
    permissions: [
      { value: 'customers:read', label: 'Read Customers', description: 'View customer information' },
      { value: 'customers:write', label: 'Write Customers', description: 'Create, update, and manage customers' }
    ]
  },
  {
    category: 'Inventory',
    permissions: [
      { value: 'inventory:read', label: 'Read Inventory', description: 'View inventory levels' },
      { value: 'inventory:write', label: 'Write Inventory', description: 'Update inventory levels' }
    ]
  },
  {
    category: 'Analytics',
    permissions: [
      { value: 'analytics:read', label: 'Read Analytics', description: 'View store analytics and reports' }
    ]
  },
  {
    category: 'Webhooks',
    permissions: [
      { value: 'webhooks:read', label: 'Read Webhooks', description: 'View webhook configurations' },
      { value: 'webhooks:write', label: 'Write Webhooks', description: 'Create and manage webhooks' }
    ]
  },
  {
    category: 'Settings',
    permissions: [
      { value: 'settings:read', label: 'Read Settings', description: 'View store settings' },
      { value: 'settings:write', label: 'Write Settings', description: 'Update store settings' }
    ]
  }
];

// GET - List API keys
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
    const active = searchParams.get('active');
    
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

    // Get API keys from store settings
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    let apiKeys = storeSettings?.apiKeys as any[] || [];

    // Filter by active status
    if (active !== null) {
      const isActive = active === 'true';
      apiKeys = apiKeys.filter(key => key.active === isActive);
    }

    // Hide sensitive information and add computed fields
    const safeApiKeys = apiKeys.map(apiKey => {
      const now = new Date();
      const isExpired = apiKey.expiresAt && new Date(apiKey.expiresAt) <= now;
      
      return {
        ...apiKey,
        keyHash: undefined, // Never expose the hash
        key: `${apiKey.key.substring(0, 12)}...`, // Show only prefix
        isExpired,
        usageStats: {
          totalRequests: apiKey.usageLog?.length || 0,
          requestsThisMonth: apiKey.usageLog?.filter((log: any) => {
            const logDate = new Date(log.timestamp);
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
            return logDate >= monthStart;
          }).length || 0,
          lastUsed: apiKey.usageLog?.length > 0 
            ? apiKey.usageLog[apiKey.usageLog.length - 1].timestamp 
            : null
        }
      };
    });

    return NextResponse.json({ 
      apiKeys: safeApiKeys,
      availablePermissions
    });
  } catch (error) {
    console.error('[API KEYS] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create API key
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
    const validation = apiKeySchema.safeParse(body);
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

    // Get current API keys
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const apiKeys = storeSettings?.apiKeys as any[] || [];

    // Check for duplicate name
    const existingKey = apiKeys.find(key => key.name === validation.data.name);
    if (existingKey) {
      return NextResponse.json({ 
        error: 'An API key with this name already exists' 
      }, { status: 400 });
    }

    // Generate API key
    const { key, hash } = generateApiKey();

    // Create new API key
    const newApiKey = {
      id: `key_${Date.now()}`,
      name: validation.data.name,
      description: validation.data.description,
      key: key, // Store full key temporarily for response
      keyHash: hash, // Store hash for verification
      permissions: validation.data.permissions,
      expiresAt: validation.data.expiresAt,
      ipWhitelist: validation.data.ipWhitelist || [],
      rateLimit: validation.data.rateLimit || {
        requestsPerMinute: 60,
        requestsPerHour: 1000
      },
      active: true,
      createdAt: new Date().toISOString(),
      createdBy: session.user.email,
      lastUsed: null,
      usageLog: []
    };

    // Add to API keys
    apiKeys.push(newApiKey);

    // Update settings
    await prisma.storeSettings.upsert({
      where: { storeId: store.id },
      update: {
        apiKeys
      },
      create: {
        storeId: store.id,
        apiKeys
      }
    });

    // Return the full key only once (for copying)
    const responseKey = {
      ...newApiKey,
      key: key // Full key for user to copy
    };

    // Store the key with hash instead of full key
    const storedKey = {
      ...newApiKey,
      key: `${key.substring(0, 12)}...`, // Store only prefix
      keyHash: hash
    };

    // Update stored version
    apiKeys[apiKeys.length - 1] = storedKey;
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { apiKeys }
    });

    return NextResponse.json({ 
      message: 'API key created successfully. Copy this key now as it will not be shown again.',
      apiKey: responseKey
    });
  } catch (error) {
    console.error('[API KEYS] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update API key
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
    const validation = updateApiKeySchema.safeParse(body);
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

    // Get current API keys
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const apiKeys = storeSettings?.apiKeys as any[] || [];
    const keyIndex = apiKeys.findIndex(key => key.id === validation.data.id);

    if (keyIndex === -1) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Check for duplicate name if name is being changed
    if (validation.data.name && validation.data.name !== apiKeys[keyIndex].name) {
      const duplicateName = apiKeys.find(
        key => key.name === validation.data.name && key.id !== validation.data.id
      );
      
      if (duplicateName) {
        return NextResponse.json({ 
          error: 'An API key with this name already exists' 
        }, { status: 400 });
      }
    }

    // Update API key
    const { id, ...updateData } = validation.data;
    apiKeys[keyIndex] = {
      ...apiKeys[keyIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        apiKeys
      }
    });

    // Return safe version
    const safeApiKey = {
      ...apiKeys[keyIndex],
      keyHash: undefined
    };

    return NextResponse.json({ 
      message: 'API key updated successfully',
      apiKey: safeApiKey
    });
  } catch (error) {
    console.error('[API KEYS] PUT Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete API key
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
    const keyId = searchParams.get('keyId');
    
    if (!keyId) {
      return NextResponse.json({ error: 'API key ID is required' }, { status: 400 });
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

    // Get current API keys
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const apiKeys = storeSettings?.apiKeys as any[] || [];
    const filteredKeys = apiKeys.filter(key => key.id !== keyId);

    if (filteredKeys.length === apiKeys.length) {
      return NextResponse.json({ error: 'API key not found' }, { status: 404 });
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        apiKeys: filteredKeys
      }
    });

    return NextResponse.json({ 
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('[API KEYS] DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}