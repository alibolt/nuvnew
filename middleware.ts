import { type NextRequest, NextResponse } from 'next/server';
import { rootDomain } from '@/lib/utils';

function extractSubdomain(request: NextRequest): string | null {
  const url = request.url;
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Local development environment
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('lvh.me')) {
    // Try to extract subdomain from the full URL
    const fullUrlMatch = url.match(/http:\/\/([^.]+)\.(localhost|lvh\.me)/);
    if (fullUrlMatch && fullUrlMatch[1]) {
      return fullUrlMatch[1];
    }

    // Fallback to host header approach
    if (hostname.includes('.localhost') || hostname.includes('.lvh.me')) {
      return hostname.split('.')[0];
    }

    return null;
  }

  // Production environment
  const rootDomainFormatted = rootDomain.split(':')[0];

  // Handle preview deployment URLs (tenant---branch-name.vercel.app)
  if (hostname.includes('---') && hostname.endsWith('.vercel.app')) {
    const parts = hostname.split('---');
    return parts.length > 0 ? parts[0] : null;
  }

  // Regular subdomain detection
  const isSubdomain =
    hostname !== rootDomainFormatted &&
    hostname !== `www.${rootDomainFormatted}` &&
    hostname.endsWith(`.${rootDomainFormatted}`);

  return isSubdomain ? hostname.replace(`.${rootDomainFormatted}`, '') : null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const subdomain = extractSubdomain(request);
  
  // Development modunda debug log'ları
  if (process.env.NODE_ENV === 'development' && process.env.DEBUG_MIDDLEWARE === 'true') {
    console.log('Middleware:', JSON.stringify({
      url: request.url,
      hostname: request.headers.get('host'),
      subdomain,
      pathname
    }, null, 2));
  }

  if (subdomain) {
    // Allow API routes to pass through on subdomains
    if (pathname.startsWith('/api/')) {
      return NextResponse.next();
    }

    // Block access to admin page from subdomains
    if (pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // For the root path on a subdomain, rewrite to the subdomain page
    if (pathname === '/') {
      return NextResponse.rewrite(new URL(`/s/${subdomain}`, request.url));
    }
    
    // For other paths on subdomain, check if they should be rewritten
    // This allows static assets and API routes to work correctly
    if (!pathname.startsWith('/s/')) {
      const url = new URL(`/s/${subdomain}${pathname}`, request.url);
      // Preserve query parameters
      url.search = request.nextUrl.search;
      return NextResponse.rewrite(url);
    }
  }

  // On the root domain, allow normal access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/|_vercel/|favicon.ico|robots.txt|.*\\..*).*)' 
  ]
};