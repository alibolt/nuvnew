import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for 2FA setup
const twoFactorSetupSchema = z.object({
  enabled: z.boolean(),
  method: z.enum(['app', 'sms', 'email']),
  phoneNumber: z.string().optional(),
  verificationCode: z.string().optional() // Required when enabling
});

// GET - Get 2FA status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; staffId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, staffId } = await params;

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
    const staffMember = staffMembers.find(member => member.id === staffId);

    if (!staffMember) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Only allow staff to view their own 2FA or admins to view any
    if (staffMember.email !== session.user.email && !['admin', 'owner'].includes(staffMember.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      twoFactorAuth: staffMember.twoFactorAuth || { enabled: false, method: 'app' }
    });
  } catch (error) {
    console.error('[STAFF 2FA API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Enable/disable 2FA
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string; staffId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storeId, staffId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = twoFactorSetupSchema.safeParse(body);
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

    // Get staff members
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const staffMembers = storeSettings?.staffMembers as any[] || [];
    const staffIndex = staffMembers.findIndex(member => member.id === staffId);

    if (staffIndex === -1) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    const staffMember = staffMembers[staffIndex];

    // Only allow staff to update their own 2FA or admins to update any
    if (staffMember.email !== session.user.email && !['admin', 'owner'].includes(staffMember.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // If enabling 2FA, require verification
    if (validation.data.enabled && !staffMember.twoFactorAuth?.enabled) {
      if (!validation.data.verificationCode) {
        // Generate and send verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // TODO: Send verification code via selected method
        // For demo, we'll return it in the response
        return NextResponse.json({
          requiresVerification: true,
          method: validation.data.method,
          // In production, don't send the code in response
          demoCode: verificationCode
        });
      }

      // TODO: Verify the code
      // For demo, accept any 6-digit code
      if (!/^\d{6}$/.test(validation.data.verificationCode)) {
        return NextResponse.json({ 
          error: 'Invalid verification code' 
        }, { status: 400 });
      }
    }

    // Generate backup codes if enabling
    const backupCodes = validation.data.enabled ? 
      Array.from({ length: 8 }, () => 
        `${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`.toUpperCase()
      ) : [];

    // Update 2FA settings
    staffMembers[staffIndex] = {
      ...staffMember,
      twoFactorAuth: {
        enabled: validation.data.enabled,
        method: validation.data.method,
        phoneNumber: validation.data.phoneNumber,
        backupCodes: validation.data.enabled ? backupCodes : undefined,
        enabledAt: validation.data.enabled ? new Date().toISOString() : undefined
      },
      updatedAt: new Date().toISOString()
    };

    // Update settings
    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { staffMembers }
    });

    return NextResponse.json({ 
      message: validation.data.enabled ? '2FA enabled successfully' : '2FA disabled successfully',
      twoFactorAuth: {
        enabled: validation.data.enabled,
        method: validation.data.method,
        backupCodes: validation.data.enabled ? backupCodes : undefined
      }
    });
  } catch (error) {
    console.error('[STAFF 2FA API] POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}