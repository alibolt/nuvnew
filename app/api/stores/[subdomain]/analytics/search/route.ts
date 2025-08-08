import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '7days';

    // Verify store ownership
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain,
        userId: session.user.id,
      },
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Calculate date range
    let startDate = new Date();
    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        break;
    }

    // Fetch search queries
    const searchQueries = await prisma.searchQuery.findMany({
      where: {
        storeId: store.id,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate popular searches
    const searchCounts: { [key: string]: { count: number; totalResults: number; clicks: number } } = {};
    
    searchQueries.forEach(query => {
      const normalized = query.normalizedQuery;
      if (!searchCounts[normalized]) {
        searchCounts[normalized] = { count: 0, totalResults: 0, clicks: 0 };
      }
      searchCounts[normalized].count++;
      searchCounts[normalized].totalResults += query.resultCount;
      
      // Count clicks (if clickedResults exists and has items)
      const clickedResults = query.clickedResults as string[] || [];
      searchCounts[normalized].clicks += clickedResults.length;
    });

    const popularSearches = Object.entries(searchCounts)
      .map(([query, data]) => ({
        query,
        count: data.count,
        clickThroughRate: data.count > 0 ? (data.clicks / data.count) * 100 : 0,
        averagePosition: data.totalResults / data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    // Calculate metrics
    const totalSearches = searchQueries.length;
    const uniqueSearches = new Set(searchQueries.map(q => q.normalizedQuery)).size;
    const searchesWithNoResults = searchQueries.filter(q => q.resultCount === 0).length;
    const totalClicks = searchQueries.reduce((sum, q) => {
      const clicks = (q.clickedResults as string[] || []).length;
      return sum + (clicks > 0 ? 1 : 0);
    }, 0);

    const metrics = {
      totalSearches,
      uniqueSearches,
      averageResultsPerSearch: totalSearches > 0 
        ? searchQueries.reduce((sum, q) => sum + q.resultCount, 0) / totalSearches 
        : 0,
      searchesWithNoResults,
      clickThroughRate: totalSearches > 0 ? (totalClicks / totalSearches) * 100 : 0,
      conversionRate: 0 // This would need order tracking to calculate
    };

    return NextResponse.json({
      queries: searchQueries,
      popularSearches,
      metrics
    });
  } catch (error) {
    console.error('Search analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search analytics' },
      { status: 500 }
    );
  }
}