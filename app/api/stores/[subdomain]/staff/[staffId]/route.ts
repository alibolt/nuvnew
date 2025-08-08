import { NextRequest, NextResponse } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Update schema
const updateStaffSchema = z.object({
  name: z.string().optional(),
  role: z.enum(['admin', 'manager', 'staff', 'viewer', 'custom']).optional(),
  department: z.string().optional(),
  phone: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).optional(),
  permissions: z.any().optional(),
  accessRestrictions: z.any().optional(),
  twoFactorEnabled: z.boolean().optional(),
  twoFactorMethod: z.enum(['app', 'sms', 'email']).optional()
});

// PATCH - Update staff member
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; staffId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, staffId } = await params;
    const body = await request.json();
    
    // Validate input
    const validation = updateStaffSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid input', 
        details: validation.error.format() 
      }, { status: 400 });
    }

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Check if staff member exists
    const staffMember = await prisma.staffMember.findFirst({
      where: {
        id: staffId,
        storeId: store.id
      }
    });

    if (!staffMember) {
      return apiResponse.notFound('Staff member not found');
    }

    // Update staff member
    const updatedStaffMember = await prisma.staffMember.update({
      where: { id: staffId },
      data: validation.data
    });

    return NextResponse.json({ 
      message: 'Staff member updated successfully',
      staffMember: updatedStaffMember
    });
  } catch (error) {
    console.error('[STAFF API] PATCH Error:', error);
    return apiResponse.serverError();
  }
}

// DELETE - Remove staff member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string; staffId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain, staffId } = await params;

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return apiResponse.notFound('Store not found');
    }

    // Check if staff member exists
    const staffMember = await prisma.staffMember.findFirst({
      where: {
        id: staffId,
        storeId: store.id
      }
    });

    if (!staffMember) {
      return apiResponse.notFound('Staff member not found');
    }

    // Delete staff member
    await prisma.staffMember.delete({
      where: { id: staffId }
    });

    return NextResponse.json({ 
      message: 'Staff member removed successfully'
    });
  } catch (error) {
    console.error('[STAFF API] DELETE Error:', error);
    return apiResponse.serverError();
  }
}