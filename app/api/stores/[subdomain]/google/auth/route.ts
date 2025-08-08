import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters',
  'https://www.googleapis.com/auth/content',
  'https://www.googleapis.com/auth/adwords',
  'https://www.googleapis.com/auth/business.manage',
  'email',
  'profile'
];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    // Get store
    const store = await prisma.store.findFirst({
      where: {
        subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Check if Google Integration app is installed
    const googleApp = await prisma.app.findUnique({
      where: { code: 'google-integration' }
    });

    if (!googleApp) {
      return apiResponse.notFound('Google Integration app ');
    }

    const appInstall = await prisma.appInstall.findUnique({
      where: {
        storeId_appId: {
          storeId: store.id,
          appId: googleApp.id
        }
      }
    });

    if (!appInstall || appInstall.status !== 'active') {
      return NextResponse.json({ error: 'Google Integration app not installed' }, { status: 403 });
    }

    // Create state parameter to verify callback
    const state = Buffer.from(JSON.stringify({
      storeId: store.id,
      subdomain: store.subdomain,
      timestamp: Date.now()
    })).toString('base64');

    // Build Google OAuth URL
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', GOOGLE_SCOPES.join(' '));
    authUrl.searchParams.append('access_type', 'offline');
    authUrl.searchParams.append('prompt', 'consent');
    authUrl.searchParams.append('state', state);

    return apiResponse.success({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}