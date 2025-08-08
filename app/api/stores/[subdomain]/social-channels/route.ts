import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// Social channel configurations
const SOCIAL_CHANNELS = {
  instagram: {
    name: 'Instagram',
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes: ['instagram_shopping_tag_products', 'pages_show_list', 'instagram_basic'],
    features: ['Shopping Tags', 'Stories', 'Reels', 'Live Shopping']
  },
  facebook: {
    name: 'Facebook',
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    scopes: ['catalog_management', 'pages_manage_posts', 'pages_read_engagement'],
    features: ['Facebook Shop', 'Marketplace', 'Live Shopping', 'Ads Integration']
  },
  tiktok: {
    name: 'TikTok',
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    scopes: ['product.info.basic', 'video.upload'],
    features: ['TikTok Shop', 'Live Shopping', 'Product Showcase', 'Influencer Collabs']
  }
};

export async function GET(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const store = await prisma.store.findFirst({
      where: {
        subdomain: params.subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get connected social channels from database
    // For now, we'll return mock data
    const connectedChannels = [
      {
        id: 'instagram',
        platform: 'Instagram',
        connected: false,
        username: null,
        followers: 0,
        products: 0,
        sales: 0,
        engagement: 0,
        lastSync: null,
        accessToken: null
      },
      {
        id: 'facebook',
        platform: 'Facebook',
        connected: false,
        username: null,
        followers: 0,
        products: 0,
        sales: 0,
        engagement: 0,
        lastSync: null,
        accessToken: null
      }
    ];

    return NextResponse.json({
      success: true,
      channels: connectedChannels,
      availableChannels: SOCIAL_CHANNELS
    });
  } catch (error) {
    console.error('Error fetching social channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch social channels' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { subdomain: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { platform, action } = body;

    const store = await prisma.store.findFirst({
      where: {
        subdomain: params.subdomain,
        userId: session.user.id
      }
    });

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    if (action === 'connect') {
      // Generate OAuth URL for the platform
      const channel = SOCIAL_CHANNELS[platform as keyof typeof SOCIAL_CHANNELS];
      if (!channel) {
        return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
      }

      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/stores/${params.subdomain}/social-channels/callback`;
      const state = Buffer.from(JSON.stringify({ 
        storeId: store.id, 
        platform,
        subdomain: params.subdomain 
      })).toString('base64');

      let authUrl = '';
      
      if (platform === 'instagram' || platform === 'facebook') {
        const appId = process.env.FACEBOOK_APP_ID || '';
        authUrl = `${channel.authUrl}?client_id=${appId}&redirect_uri=${redirectUri}&scope=${channel.scopes.join(',')}&state=${state}&response_type=code`;
      } else if (platform === 'tiktok') {
        const clientKey = process.env.TIKTOK_CLIENT_KEY || '';
        authUrl = `${channel.authUrl}?client_key=${clientKey}&redirect_uri=${redirectUri}&scope=${channel.scopes.join(',')}&state=${state}&response_type=code`;
      }

      return NextResponse.json({
        success: true,
        authUrl,
        platform
      });
    }

    if (action === 'disconnect') {
      // Remove social channel connection from database
      // For now, just return success
      return NextResponse.json({
        success: true,
        message: `${platform} disconnected successfully`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error managing social channel:', error);
    return NextResponse.json(
      { error: 'Failed to manage social channel' },
      { status: 500 }
    );
  }
}