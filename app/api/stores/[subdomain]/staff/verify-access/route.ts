import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema for access verification
const verifyAccessSchema = z.object({
  staffId: z.string(),
  twoFactorCode: z.string().optional(),
  ipAddress: z.string().optional()
});

// POST - Verify staff access with 2FA and restrictions
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
    const validation = verifyAccessSchema.safeParse(body);
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

    // Get staff member
    const storeSettings = await prisma.storeSettings.findUnique({
      where: { storeId: store.id }
    });

    const staffMembers = storeSettings?.staffMembers as any[] || [];
    const staffMember = staffMembers.find(member => member.id === validation.data.staffId);

    if (!staffMember) {
      return apiResponse.notFound('Staff member ');
    }

    // Check if staff member is active
    if (staffMember.status !== 'active') {
      return NextResponse.json({ 
        error: 'Access denied', 
        reason: 'Account is not active' 
      }, { status: 403 });
    }

    // Check access restrictions
    const restrictions = staffMember.accessRestrictions || {};
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    // Check allowed days
    if (restrictions.allowedDays && restrictions.allowedDays.length > 0) {
      if (!restrictions.allowedDays.includes(currentDay)) {
        return NextResponse.json({ 
          error: 'Access denied', 
          reason: 'Access not allowed on this day' 
        }, { status: 403 });
      }
    }

    // Check allowed hours
    if (restrictions.allowedHours) {
      const { start, end } = restrictions.allowedHours;
      if (currentTime < start || currentTime > end) {
        return NextResponse.json({ 
          error: 'Access denied', 
          reason: 'Access not allowed at this time' 
        }, { status: 403 });
      }
    }

    // Check IP whitelist
    if (restrictions.ipWhitelist && restrictions.ipWhitelist.length > 0) {
      const clientIp = validation.data.ipAddress || 
        request.headers.get('x-forwarded-for')?.split(',')[0] || 
        request.headers.get('x-real-ip') ||
        'unknown';
      
      if (!restrictions.ipWhitelist.includes(clientIp)) {
        return NextResponse.json({ 
          error: 'Access denied', 
          reason: 'IP address not whitelisted' 
        }, { status: 403 });
      }
    }

    // Check 2FA if enabled
    if (staffMember.twoFactorAuth?.enabled) {
      if (!validation.data.twoFactorCode) {
        return NextResponse.json({ 
          error: '2FA required',
          twoFactorMethod: staffMember.twoFactorAuth.method
        }, { status: 403 });
      }

      // TODO: Verify 2FA code based on method (app, sms, email)
      // For now, we'll accept any 6-digit code for demo purposes
      if (!/^\d{6}$/.test(validation.data.twoFactorCode)) {
        return NextResponse.json({ 
          error: 'Invalid 2FA code' 
        }, { status: 403 });
      }
    }

    // Update last access time
    const staffIndex = staffMembers.findIndex(member => member.id === validation.data.staffId);
    staffMembers[staffIndex] = {
      ...staffMember,
      lastAccessAt: new Date().toISOString()
    };

    await prisma.storeSettings.update({
      where: { storeId: store.id },
      data: { staffMembers }
    });

    // Generate session token
    const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const sessionExpiry = new Date();
    sessionExpiry.setMinutes(sessionExpiry.getMinutes() + (restrictions.maxSessionDuration || 60));

    return NextResponse.json({ 
      success: true,
      staffMember: {
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        role: staffMember.role,
        permissions: staffMember.permissions,
        department: staffMember.department
      },
      session: {
        token: sessionToken,
        expiresAt: sessionExpiry.toISOString()
      }
    });
  } catch (error) {
    console.error('[STAFF VERIFY ACCESS API] POST Error:', error);
    return apiResponse.serverError();
  }
}