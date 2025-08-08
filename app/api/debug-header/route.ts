import { NextResponse } from 'next/server';
import { getGlobalSections } from '@/lib/services/global-sections-loader';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain') || 'test-store2';
  const themeCode = searchParams.get('theme') || 'commerce';
  
  try {
    const globalSections = await getGlobalSections(subdomain, themeCode);
    
    return NextResponse.json({
      subdomain,
      themeCode,
      globalSections: {
        announcementBar: globalSections.announcementBar,
        header: globalSections.header,
        footer: globalSections.footer
      }
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to load global sections',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}