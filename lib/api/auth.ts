import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

interface AuthResult {
  session: any;
  store?: any;
  error?: NextResponse;
}

/**
 * Verify user authentication and optionally store ownership
 */
export async function verifyAuth(
  request: NextRequest,
  subdomain?: string,
  options?: {
    allowPublic?: boolean;
    requireStoreOwnership?: boolean;
  }
): Promise<AuthResult> {
  const { searchParams } = new URL(request.url);
  const isPublic = searchParams.get('public') === 'true';
  const { allowPublic = false, requireStoreOwnership = true } = options || {};

  // Get session
  const session = await getServerSession(authOptions);

  // Check if public access is allowed
  if (allowPublic && isPublic) {
    // For public access, still try to get the store but don't require auth
    if (subdomain) {
      const store = await prisma.store.findFirst({
        where: { subdomain }
      });
      
      if (!store) {
        return {
          session: null,
          error: NextResponse.json({ error: 'Store not found' }, { status: 404 })
        };
      }
      
      return { session: null, store };
    }
    return { session: null };
  }

  // Require authentication for non-public access
  if (!session?.user?.id) {
    return {
      session: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    };
  }

  // Verify store ownership if subdomain provided
  if (subdomain && requireStoreOwnership) {
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return {
        session,
        error: NextResponse.json({ error: 'Store not found or unauthorized' }, { status: 404 })
      };
    }

    return { session, store };
  }

  return { session };
}

/**
 * Middleware to check if user has specific permissions for a store
 */
export async function checkStorePermission(
  session: any,
  storeId: string,
  permission: 'read' | 'write' | 'admin'
): Promise<boolean> {
  if (!session?.user?.id) return false;

  // Check if user is store owner
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      userId: session.user.id
    }
  });

  if (store) return true;

  // Check staff permissions
  const staffMember = await prisma.storeStaff.findFirst({
    where: {
      storeId,
      userId: session.user.id,
      status: 'active'
    }
  });

  if (!staffMember) return false;

  // Check permission level
  const permissionLevels = {
    read: ['read', 'write', 'admin'],
    write: ['write', 'admin'],
    admin: ['admin']
  };

  return permissionLevels[permission].includes(staffMember.role);
}

/**
 * Get store by subdomain with optional authentication check
 */
export async function getStore(subdomain: string, userId?: string) {
  const where: any = { subdomain };
  
  if (userId) {
    where.userId = userId;
  }

  return await prisma.store.findFirst({ where });
}