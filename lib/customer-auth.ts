import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key';

export interface CustomerSession {
  customerId: string;
  email: string;
  storeId: string;
}

export async function getCustomerSession(storeId: string): Promise<CustomerSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('customer-token')?.value;

    if (!token) {
      return null;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerSession;

    // Check if token is for this store
    if (decoded.storeId !== storeId) {
      return null;
    }

    // Verify customer still exists and is active
    const customer = await prisma.customer.findUnique({
      where: { id: decoded.customerId },
      select: { id: true, status: true },
    });

    if (!customer || customer.status !== 'active') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}

export async function requireCustomerAuth(storeId: string) {
  const session = await getCustomerSession(storeId);
  
  if (!session) {
    throw new Error('Authentication required');
  }
  
  return session;
}