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

    // Get or create search settings
    let searchSettings = await prisma.searchSettings.findUnique({
      where: {
        storeId: store.id
      }
    });

    if (!searchSettings) {
      searchSettings = await prisma.searchSettings.create({
        data: {
          storeId: store.id
        }
      });
    }

    return NextResponse.json(searchSettings);
  } catch (error) {
    console.error('Error fetching search settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch search settings' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return apiResponse.unauthorized();
    }

    const { subdomain } = await params;
    const body = await request.json();

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

    // Update or create search settings
    const searchSettings = await prisma.searchSettings.upsert({
      where: {
        storeId: store.id
      },
      update: {
        enableFuzzySearch: body.enableFuzzySearch,
        fuzzyThreshold: body.fuzzyThreshold,
        enableSynonyms: body.enableSynonyms,
        enableAutoComplete: body.enableAutoComplete,
        autoCompleteMinChars: body.autoCompleteMinChars,
        autoCompleteMaxResults: body.autoCompleteMaxResults,
        searchResultsPerPage: body.searchResultsPerPage,
        enableSpellCorrection: body.enableSpellCorrection,
        enableSearchHistory: body.enableSearchHistory,
        historyRetentionDays: body.historyRetentionDays,
        enablePopularSearches: body.enablePopularSearches,
        popularSearchesCount: body.popularSearchesCount,
        defaultSortOrder: body.defaultSortOrder,
        enableFacetedSearch: body.enableFacetedSearch,
        updatedAt: new Date()
      },
      create: {
        storeId: store.id,
        enableFuzzySearch: body.enableFuzzySearch,
        fuzzyThreshold: body.fuzzyThreshold,
        enableSynonyms: body.enableSynonyms,
        enableAutoComplete: body.enableAutoComplete,
        autoCompleteMinChars: body.autoCompleteMinChars,
        autoCompleteMaxResults: body.autoCompleteMaxResults,
        searchResultsPerPage: body.searchResultsPerPage,
        enableSpellCorrection: body.enableSpellCorrection,
        enableSearchHistory: body.enableSearchHistory,
        historyRetentionDays: body.historyRetentionDays,
        enablePopularSearches: body.enablePopularSearches,
        popularSearchesCount: body.popularSearchesCount,
        defaultSortOrder: body.defaultSortOrder,
        enableFacetedSearch: body.enableFacetedSearch
      }
    });

    return NextResponse.json(searchSettings);
  } catch (error) {
    console.error('Error updating search settings:', error);
    return NextResponse.json(
      { error: 'Failed to update search settings' },
      { status: 500 }
    );
  }
}