import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for staff member
const staffMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'manager', 'staff', 'viewer', 'custom']),
  department: z.string().optional(),
  phone: z.string().optional(),
  
  // Two-factor authentication
  twoFactorAuth: z.object({
    enabled: z.boolean(),
    method: z.enum(['app', 'sms', 'email']),
    phoneNumber: z.string().optional(),
    backupCodes: z.array(z.string()).optional()
  }).optional(),
  
  // Access restrictions
  accessRestrictions: z.object({
    ipWhitelist: z.array(z.string().ip()).optional(),
    allowedDays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).optional(),
    allowedHours: z.object({
      start: z.string(), // HH:MM format
      end: z.string()
    }).optional(),
    maxSessionDuration: z.number().min(1).max(1440).optional(), // minutes
    requirePasswordChange: z.boolean().default(false),
    passwordExpiryDays: z.number().min(1).max(365).optional()
  }).optional(),
  
  permissions: z.object({
    // Products
    viewProducts: z.boolean(),
    createProducts: z.boolean(),
    editProducts: z.boolean(),
    deleteProducts: z.boolean(),
    exportProducts: z.boolean(),
    importProducts: z.boolean(),
    
    // Orders
    viewOrders: z.boolean(),
    createOrders: z.boolean(),
    editOrders: z.boolean(),
    cancelOrders: z.boolean(),
    fulfillOrders: z.boolean(),
    refundOrders: z.boolean(),
    exportOrders: z.boolean(),
    
    // Customers
    viewCustomers: z.boolean(),
    createCustomers: z.boolean(),
    editCustomers: z.boolean(),
    deleteCustomers: z.boolean(),
    exportCustomers: z.boolean(),
    
    // Inventory
    viewInventory: z.boolean(),
    adjustInventory: z.boolean(),
    transferInventory: z.boolean(),
    
    // Discounts
    viewDiscounts: z.boolean(),
    createDiscounts: z.boolean(),
    editDiscounts: z.boolean(),
    deleteDiscounts: z.boolean(),
    
    // Settings
    viewSettings: z.boolean(),
    editGeneralSettings: z.boolean(),
    editPaymentSettings: z.boolean(),
    editShippingSettings: z.boolean(),
    editTaxSettings: z.boolean(),
    editNotificationSettings: z.boolean(),
    editSecuritySettings: z.boolean(),
    
    // Themes
    viewThemes: z.boolean(),
    editThemes: z.boolean(),
    publishThemes: z.boolean(),
    
    // Analytics
    viewAnalytics: z.boolean(),
    viewReports: z.boolean(),
    exportReports: z.boolean(),
    
    // Marketing
    viewMarketing: z.boolean(),
    createCampaigns: z.boolean(),
    editCampaigns: z.boolean(),
    sendEmails: z.boolean(),
    
    // Apps & Integrations
    viewApps: z.boolean(),
    installApps: z.boolean(),
    configureApps: z.boolean(),
    
    // Staff Management
    viewStaff: z.boolean(),
    inviteStaff: z.boolean(),
    editStaff: z.boolean(),
    deleteStaff: z.boolean(),
    
    // API Access
    viewApiKeys: z.boolean(),
    createApiKeys: z.boolean(),
    deleteApiKeys: z.boolean(),
    
    // Activity Logs
    viewActivityLogs: z.boolean(),
    exportActivityLogs: z.boolean()
  }).optional()
});

// Role-based default permissions
const rolePermissions = {
  admin: {
    // Products - Full access
    viewProducts: true,
    createProducts: true,
    editProducts: true,
    deleteProducts: true,
    exportProducts: true,
    importProducts: true,
    
    // Orders - Full access
    viewOrders: true,
    createOrders: true,
    editOrders: true,
    cancelOrders: true,
    fulfillOrders: true,
    refundOrders: true,
    exportOrders: true,
    
    // Customers - Full access
    viewCustomers: true,
    createCustomers: true,
    editCustomers: true,
    deleteCustomers: true,
    exportCustomers: true,
    
    // Inventory - Full access
    viewInventory: true,
    adjustInventory: true,
    transferInventory: true,
    
    // Discounts - Full access
    viewDiscounts: true,
    createDiscounts: true,
    editDiscounts: true,
    deleteDiscounts: true,
    
    // Settings - Full access
    viewSettings: true,
    editGeneralSettings: true,
    editPaymentSettings: true,
    editShippingSettings: true,
    editTaxSettings: true,
    editNotificationSettings: true,
    editSecuritySettings: true,
    
    // Themes - Full access
    viewThemes: true,
    editThemes: true,
    publishThemes: true,
    
    // Analytics - Full access
    viewAnalytics: true,
    viewReports: true,
    exportReports: true,
    
    // Marketing - Full access
    viewMarketing: true,
    createCampaigns: true,
    editCampaigns: true,
    sendEmails: true,
    
    // Apps & Integrations - Full access
    viewApps: true,
    installApps: true,
    configureApps: true,
    
    // Staff Management - Full access
    viewStaff: true,
    inviteStaff: true,
    editStaff: true,
    deleteStaff: true,
    
    // API Access - Full access
    viewApiKeys: true,
    createApiKeys: true,
    deleteApiKeys: true,
    
    // Activity Logs - Full access
    viewActivityLogs: true,
    exportActivityLogs: true
  },
  
  manager: {
    // Products - Can manage but not delete
    viewProducts: true,
    createProducts: true,
    editProducts: true,
    deleteProducts: false,
    exportProducts: true,
    importProducts: true,
    
    // Orders - Full management
    viewOrders: true,
    createOrders: true,
    editOrders: true,
    cancelOrders: true,
    fulfillOrders: true,
    refundOrders: true,
    exportOrders: true,
    
    // Customers - Full management
    viewCustomers: true,
    createCustomers: true,
    editCustomers: true,
    deleteCustomers: false,
    exportCustomers: true,
    
    // Inventory - Full management
    viewInventory: true,
    adjustInventory: true,
    transferInventory: true,
    
    // Discounts - Full management
    viewDiscounts: true,
    createDiscounts: true,
    editDiscounts: true,
    deleteDiscounts: true,
    
    // Settings - View only, limited edit
    viewSettings: true,
    editGeneralSettings: false,
    editPaymentSettings: false,
    editShippingSettings: true,
    editTaxSettings: false,
    editNotificationSettings: true,
    editSecuritySettings: false,
    
    // Themes - Can edit but not publish
    viewThemes: true,
    editThemes: true,
    publishThemes: false,
    
    // Analytics - Full view access
    viewAnalytics: true,
    viewReports: true,
    exportReports: true,
    
    // Marketing - Full management
    viewMarketing: true,
    createCampaigns: true,
    editCampaigns: true,
    sendEmails: true,
    
    // Apps & Integrations - View and configure only
    viewApps: true,
    installApps: false,
    configureApps: true,
    
    // Staff Management - Limited
    viewStaff: true,
    inviteStaff: false,
    editStaff: false,
    deleteStaff: false,
    
    // API Access - No access
    viewApiKeys: false,
    createApiKeys: false,
    deleteApiKeys: false,
    
    // Activity Logs - View only
    viewActivityLogs: true,
    exportActivityLogs: false
  },
  
  staff: {
    // Products - Basic operations
    viewProducts: true,
    createProducts: false,
    editProducts: true,
    deleteProducts: false,
    exportProducts: false,
    importProducts: false,
    
    // Orders - Fulfillment focused
    viewOrders: true,
    createOrders: false,
    editOrders: true,
    cancelOrders: false,
    fulfillOrders: true,
    refundOrders: false,
    exportOrders: false,
    
    // Customers - View and basic edit
    viewCustomers: true,
    createCustomers: true,
    editCustomers: true,
    deleteCustomers: false,
    exportCustomers: false,
    
    // Inventory - View only
    viewInventory: true,
    adjustInventory: false,
    transferInventory: false,
    
    // Discounts - View only
    viewDiscounts: true,
    createDiscounts: false,
    editDiscounts: false,
    deleteDiscounts: false,
    
    // Settings - No access
    viewSettings: false,
    editGeneralSettings: false,
    editPaymentSettings: false,
    editShippingSettings: false,
    editTaxSettings: false,
    editNotificationSettings: false,
    editSecuritySettings: false,
    
    // Themes - No access
    viewThemes: false,
    editThemes: false,
    publishThemes: false,
    
    // Analytics - No access
    viewAnalytics: false,
    viewReports: false,
    exportReports: false,
    
    // Marketing - No access
    viewMarketing: false,
    createCampaigns: false,
    editCampaigns: false,
    sendEmails: false,
    
    // Apps & Integrations - No access
    viewApps: false,
    installApps: false,
    configureApps: false,
    
    // Staff Management - No access
    viewStaff: false,
    inviteStaff: false,
    editStaff: false,
    deleteStaff: false,
    
    // API Access - No access
    viewApiKeys: false,
    createApiKeys: false,
    deleteApiKeys: false,
    
    // Activity Logs - No access
    viewActivityLogs: false,
    exportActivityLogs: false
  },
  
  viewer: {
    // Products - View only
    viewProducts: true,
    createProducts: false,
    editProducts: false,
    deleteProducts: false,
    exportProducts: false,
    importProducts: false,
    
    // Orders - View only
    viewOrders: true,
    createOrders: false,
    editOrders: false,
    cancelOrders: false,
    fulfillOrders: false,
    refundOrders: false,
    exportOrders: false,
    
    // Customers - View only
    viewCustomers: true,
    createCustomers: false,
    editCustomers: false,
    deleteCustomers: false,
    exportCustomers: false,
    
    // Inventory - View only
    viewInventory: true,
    adjustInventory: false,
    transferInventory: false,
    
    // Discounts - View only
    viewDiscounts: true,
    createDiscounts: false,
    editDiscounts: false,
    deleteDiscounts: false,
    
    // Settings - View only
    viewSettings: true,
    editGeneralSettings: false,
    editPaymentSettings: false,
    editShippingSettings: false,
    editTaxSettings: false,
    editNotificationSettings: false,
    editSecuritySettings: false,
    
    // Themes - View only
    viewThemes: true,
    editThemes: false,
    publishThemes: false,
    
    // Analytics - View only
    viewAnalytics: true,
    viewReports: true,
    exportReports: false,
    
    // Marketing - View only
    viewMarketing: true,
    createCampaigns: false,
    editCampaigns: false,
    sendEmails: false,
    
    // Apps & Integrations - No access
    viewApps: false,
    installApps: false,
    configureApps: false,
    
    // Staff Management - No access
    viewStaff: false,
    inviteStaff: false,
    editStaff: false,
    deleteStaff: false,
    
    // API Access - No access
    viewApiKeys: false,
    createApiKeys: false,
    deleteApiKeys: false,
    
    // Activity Logs - No access
    viewActivityLogs: false,
    exportActivityLogs: false
  },
  
  custom: {
    // All permissions false by default - must be set explicitly
    viewProducts: false,
    createProducts: false,
    editProducts: false,
    deleteProducts: false,
    exportProducts: false,
    importProducts: false,
    viewOrders: false,
    createOrders: false,
    editOrders: false,
    cancelOrders: false,
    fulfillOrders: false,
    refundOrders: false,
    exportOrders: false,
    viewCustomers: false,
    createCustomers: false,
    editCustomers: false,
    deleteCustomers: false,
    exportCustomers: false,
    viewInventory: false,
    adjustInventory: false,
    transferInventory: false,
    viewDiscounts: false,
    createDiscounts: false,
    editDiscounts: false,
    deleteDiscounts: false,
    viewSettings: false,
    editGeneralSettings: false,
    editPaymentSettings: false,
    editShippingSettings: false,
    editTaxSettings: false,
    editNotificationSettings: false,
    editSecuritySettings: false,
    viewThemes: false,
    editThemes: false,
    publishThemes: false,
    viewAnalytics: false,
    viewReports: false,
    exportReports: false,
    viewMarketing: false,
    createCampaigns: false,
    editCampaigns: false,
    sendEmails: false,
    viewApps: false,
    installApps: false,
    configureApps: false,
    viewStaff: false,
    inviteStaff: false,
    editStaff: false,
    deleteStaff: false,
    viewApiKeys: false,
    createApiKeys: false,
    deleteApiKeys: false,
    viewActivityLogs: false,
    exportActivityLogs: false
  }
};

// GET - List staff members
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    
    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        staffMembers: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    const staffMembers = store.staffMembers || [];

    // Add store owner as admin
    const allStaff = [
      {
        id: store.user.id,
        email: store.user.email,
        name: store.user.name || 'Store Owner',
        role: 'owner',
        permissions: rolePermissions.admin,
        isOwner: true,
        status: 'active',
        createdAt: store.createdAt
      },
      ...staffMembers
    ];

    return apiResponse.success({ staffMembers: allStaff });
  } catch (error) {
    console.error('[STAFF API] GET Error:', error);
    return apiResponse.serverError();
  }
}

// POST - Invite staff member
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
    
    // Validate input
    const validation = staffMemberSchema.safeParse(body);
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
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if already invited
    const existingMember = await prisma.staffMember.findFirst({
      where: {
        storeId: store.id,
        email: validation.data.email
      }
    });

    if (existingMember) {
      return apiResponse.badRequest('This email is already a staff member');
    }

    // Create new staff member
    const newStaffMember = await prisma.staffMember.create({
      data: {
        storeId: store.id,
        email: validation.data.email,
        name: validation.data.name,
        role: validation.data.role,
        department: validation.data.department,
        phone: validation.data.phone,
        permissions: validation.data.permissions || rolePermissions[validation.data.role],
        accessRestrictions: validation.data.accessRestrictions || {},
        twoFactorEnabled: validation.data.twoFactorAuth?.enabled || false,
        twoFactorMethod: validation.data.twoFactorAuth?.method,
        status: 'active',
        invitedBy: session.user.email,
        invitedAt: new Date()
      }
    });

    // TODO: Send invitation email

    return NextResponse.json({ 
      message: 'Staff member invited successfully',
      staffMember: newStaffMember
    });
  } catch (error) {
    console.error('[STAFF API] POST Error:', error);
    return apiResponse.serverError();
  }
}

// PUT - Update staff member
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
    const { staffId, ...updateData } = await request.json();
    
    if (!staffId) {
      return apiResponse.badRequest('Staff ID is required');
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current staff
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const staffMembers = storeSettings?.staffMembers as any[] || [];
    const staffIndex = staffMembers.findIndex(member => member.id === staffId);

    if (staffIndex === -1) {
      return apiResponse.notFound('Staff member ');
    }

    // Validate permissions if provided
    if (updateData.permissions) {
      const permissionKeys = Object.keys(updateData.permissions);
      const validPermissions = Object.keys(rolePermissions.admin);
      const invalidPermissions = permissionKeys.filter(key => !validPermissions.includes(key));
      
      if (invalidPermissions.length > 0) {
        return NextResponse.json({ 
          error: 'Invalid permissions', 
          details: { invalidPermissions } 
        }, { status: 400 });
      }
    }

    // If role is changed from custom, apply default permissions
    if (updateData.role && updateData.role !== 'custom' && staffMembers[staffIndex].role === 'custom') {
      updateData.permissions = (rolePermissions as any)[updateData.role];
    }

    // Update staff member
    staffMembers[staffIndex] = {
      ...staffMembers[staffIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        staffMembers
      }
    });

    return NextResponse.json({ 
      message: 'Staff member updated successfully',
      staffMember: staffMembers[staffIndex]
    });
  } catch (error) {
    console.error('[STAFF API] PUT Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Remove staff member
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
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    
    if (!staffId) {
      return apiResponse.badRequest('Staff ID is required');
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { subdomain: subdomain, userId: session.user.id },
          { subdomain: subdomain, userId: session.user.id }
        ]
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get current staff
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const staffMembers = storeSettings?.staffMembers as any[] || [];
    const filteredStaff = staffMembers.filter(member => member.id !== staffId);

    if (filteredStaff.length === staffMembers.length) {
      return apiResponse.notFound('Staff member ');
    }

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: {
        staffMembers: filteredStaff
      }
    });

    return apiResponse.success({ message: 'Staff member removed successfully' });
  } catch (error) {
    console.error('[STAFF API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}