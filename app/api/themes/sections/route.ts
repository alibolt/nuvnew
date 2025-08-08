
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get('storeId');

  if (!storeId) {
    return NextResponse.json({ error: 'storeId is required' }, { status: 400 });
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { activeThemeId: true },
    });

    if (!store?.activeThemeId) {
      return NextResponse.json({ error: 'Active theme not found for this store' }, { status: 404 });
    }

    const theme = await prisma.theme.findUnique({
        where: { id: store.activeThemeId },
        include: {
            sections: {
                orderBy: {
                    name: 'asc'
                }
            }
        }
    });

    if (!theme) {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    return NextResponse.json(theme.sections);
  } catch (error) {
    console.error('Failed to fetch theme sections:', error);
    return NextResponse.json({ error: 'Failed to fetch theme sections' }, { status: 500 });
  }
}
