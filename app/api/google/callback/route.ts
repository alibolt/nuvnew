import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/google/callback';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        new URL('/dashboard/apps/google-integration?error=auth_denied', req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/apps/google-integration?error=invalid_request', req.url)
      );
    }

    // Decode and validate state
    let stateData;
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch (e) {
      return NextResponse.redirect(
        new URL('/dashboard/apps/google-integration?error=invalid_state', req.url)
      );
    }

    const { storeId, subdomain } = stateData;

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard/stores/${subdomain}/apps/google-integration?error=token_exchange_failed`, req.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Calculate token expiration
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Save or update Google integration
    await prisma.googleIntegration.upsert({
      where: { storeId },
      create: {
        storeId,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt,
        scope: tokens.scope,
      },
    });

    // Redirect back to Google Integration dashboard
    return NextResponse.redirect(
      new URL(`/dashboard/stores/${subdomain}/apps/google-integration?success=connected`, req.url)
    );
  } catch (error) {
    console.error('Google callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard/apps/google-integration?error=callback_failed', req.url)
    );
  }
}