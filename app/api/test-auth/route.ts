import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      status: 'success',
      hasSession: !!session,
      session: session ? {
        user: {
          email: session.user?.email,
          name: session.user?.name,
          id: session.user?.id
        }
      } : null,
      authConfig: {
        hasGoogleProvider: !!process.env.GOOGLE_CLIENT_ID,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
      }
    });
  } catch (error) {
    console.error('Auth test error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}