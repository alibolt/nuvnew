import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ themeId: string }> }
) {
  const { themeId } = await params;
  console.log('[SECTIONS API] Request for themeId:', themeId);
  
  const session = await getServerSession(authOptions);
  console.log('[SECTIONS API] Session:', session ? 'Authenticated' : 'Not authenticated');
  
  if (!session) {
    console.log('[SECTIONS API] Returning 401 Unauthorized');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[SECTIONS API] Querying sections for theme:', themeId);
    
    // First verify the theme exists
    const theme = await prisma.theme.findUnique({
      where: { id: themeId }
    });
    
    console.log('[SECTIONS API] Theme found:', theme ? `${theme.code} - ${theme.name}` : 'NOT FOUND');
    
    if (!theme) {
      console.log('[SECTIONS API] Theme not found, returning 404');
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }
    
    const sections = await prisma.themeSection.findMany({
      where: { themeId: themeId },
      orderBy: [
        { name: 'asc' }
      ],
    });

    console.log('[SECTIONS API] Found sections:', sections.length);
    console.log('[SECTIONS API] Section types:', sections.map(s => s.type).join(', '));
    
    return NextResponse.json(sections);
  } catch (error) {
    console.error('[SECTIONS API] Failed to get theme sections:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}