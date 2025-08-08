import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';

export async function requireAuth() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      redirect('/login');
    }
    
    return session;
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/login');
  }
}

export async function getOptionalAuth() {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    console.error('Optional auth error:', error);
    return null;
  }
}