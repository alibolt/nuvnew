import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      // User denied permission
      return new NextResponse(`
        <html>
          <body>
            <script>
              window.opener?.postMessage({ type: 'auth-error', error: '${error}' }, '*');
              window.close();
            </script>
          </body>
        </html>
      `, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    if (!code || !state) {
      return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
    }

    // Decode state
    const stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    const { storeId, platform, subdomain } = stateData;

    let accessToken = '';
    let userData: any = {};

    if (platform === 'instagram' || platform === 'facebook') {
      // Exchange code for access token
      const appId = process.env.FACEBOOK_APP_ID || '';
      const appSecret = process.env.FACEBOOK_APP_SECRET || '';
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/stores/${subdomain}/social-channels/callback`;

      const tokenResponse = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?` +
        `client_id=${appId}&` +
        `redirect_uri=${redirectUri}&` +
        `client_secret=${appSecret}&` +
        `code=${code}`
      );

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        accessToken = tokenData.access_token;

        // Get user data
        const userResponse = await fetch(
          `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`
        );

        if (userResponse.ok) {
          userData = await userResponse.json();
        }

        // Get Instagram business account if connecting Instagram
        if (platform === 'instagram') {
          const pagesResponse = await fetch(
            `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,instagram_business_account&access_token=${accessToken}`
          );

          if (pagesResponse.ok) {
            const pagesData = await pagesResponse.json();
            const pageWithInstagram = pagesData.data?.find((page: any) => page.instagram_business_account);
            
            if (pageWithInstagram) {
              const igAccountId = pageWithInstagram.instagram_business_account.id;
              
              // Get Instagram account details
              const igResponse = await fetch(
                `https://graph.facebook.com/v18.0/${igAccountId}?fields=username,followers_count,media_count&access_token=${accessToken}`
              );

              if (igResponse.ok) {
                const igData = await igResponse.json();
                userData = {
                  ...userData,
                  instagram: igData
                };
              }
            }
          }
        }
      }
    } else if (platform === 'tiktok') {
      // TikTok OAuth flow
      const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
      
      const tokenResponse = await fetch('https://open-api.tiktok.com/oauth/access_token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code: code,
          grant_type: 'authorization_code'
        })
      });

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json();
        accessToken = tokenData.data.access_token;
        userData = {
          open_id: tokenData.data.open_id,
          scope: tokenData.data.scope
        };
      }
    }

    // Save connection to database
    // For now, we'll just return success
    // In production, you would save the access token and user data to the database

    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener?.postMessage({ 
              type: 'auth-success', 
              platform: '${platform}',
              userData: ${JSON.stringify(userData)}
            }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    console.error('OAuth callback error:', error);
    return new NextResponse(`
      <html>
        <body>
          <script>
            window.opener?.postMessage({ type: 'auth-error', error: 'Authentication failed' }, '*');
            window.close();
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}