import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for permission check
const checkPermissionSchema = z.object({
  staffId: z.string(),
  permission: z.string(),
  resource: z.string().optional() // Optional resource identifier
});

// POST - Check if staff member has permission
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
    const validation = checkPermissionSchema.safeParse(body);
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

    // Get staff member
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const staffMembers = storeSettings?.staffMembers as any[] || [];
    let staffMember;

    // Check if requesting for store owner
    if (validation.data.staffId === store.userId) {
      // Store owner has all permissions
      return NextResponse.json({
        hasPermission: true,
        role: 'owner',
        isOwner: true
      });
    }

    staffMember = staffMembers.find(member => member.id === validation.data.staffId);

    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Check if staff member is active
    if (staffMember.status !== 'active') {
      return NextResponse.json({
        hasPermission: false,
        reason: 'Account is not active'
      });
    }

    // Get permissions
    const permissions = staffMember.permissions || {};
    const hasPermission = permissions[validation.data.permission] === true;

    // Special permission checks
    if (!hasPermission && validation.data.resource) {
      // Check if user has permission for their own resources
      if (validation.data.resource === staffMember.id) {
        // Allow viewing/editing own profile
        if (['viewStaff', 'editStaff'].includes(validation.data.permission)) {
          return NextResponse.json({
            hasPermission: true,
            role: staffMember.role,
            reason: 'Own profile access'
          });
        }
      }
    }

    return NextResponse.json({
      hasPermission,
      role: staffMember.role,
      permissions: permissions
    });
  } catch (error) {
    console.error('[STAFF CHECK PERMISSION API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}