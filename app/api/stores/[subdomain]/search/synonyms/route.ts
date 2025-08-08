import { NextRequest } from 'next/server';
import { apiResponse, handleApiError } from '@/lib/api/response';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const synonymGroupSchema = z.object({
  id: z.string().optional(),
  terms: z.array(z.string().min(1)),
  type: z.enum(['bidirectional', 'unidirectional']).default('bidirectional'),
  category: z.string().optional(),
  isActive: z.boolean().default(true)
});

const synonymsSchema = z.object({
  synonyms: z.array(synonymGroupSchema)
});

// GET - Get all synonyms for a store
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Get all synonyms for the store
    const synonyms = await prisma.searchSynonym.findMany({
      where: {
        storeId: store.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group synonyms by groupId
    const groupedSynonyms = synonyms.reduce((acc, synonym) => {
      const groupId = synonym.groupId || synonym.id;
      if (!acc[groupId]) {
        acc[groupId] = {
          id: groupId,
          terms: [],
          type: 'bidirectional',
          isActive: synonym.isActive,
          category: (synonym as any).category
        };
      }
      acc[groupId].terms.push(synonym.term);
      if (synonym.mappedTerms && synonym.mappedTerms.length > 0) {
        acc[groupId].terms.push(...synonym.mappedTerms);
        acc[groupId].type = 'unidirectional';
      }
      return acc;
    }, {} as Record<string, any>);

    return apiResponse.success({ synonyms: Object.values(groupedSynonyms) });
  } catch (error) {
    console.error('Error fetching synonyms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch synonyms' },
      { status: 500 }
    );
  }
}

// PUT - Update synonyms
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

    // Validate input
    const validation = synonymsSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid synonym data', 
        details: validation.error.format() 
      }, { status: 400 });
    }

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

    // Delete existing synonyms
    await prisma.searchSynonym.deleteMany({
      where: {
        storeId: store.id
      }
    });

    // Create new synonyms
    const synonymsToCreate = [];
    
    for (const group of validation.data.synonyms) {
      const groupId = group.id || `group-${Date.now()}-${Math.random()}`;
      
      if (group.type === 'bidirectional') {
        // For bidirectional, create entries for each term mapping to all others
        for (const term of group.terms) {
          const otherTerms = group.terms.filter(t => t !== term);
          if (otherTerms.length > 0) {
            synonymsToCreate.push({
              storeId: store.id,
              groupId,
              term: term.toLowerCase(),
              mappedTerms: otherTerms.map(t => t.toLowerCase()),
              isActive: group.isActive,
              category: group.category
            });
          }
        }
      } else {
        // For unidirectional, only first term maps to others
        if (group.terms.length >= 2) {
          synonymsToCreate.push({
            storeId: store.id,
            groupId,
            term: group.terms[0].toLowerCase(),
            mappedTerms: group.terms.slice(1).map(t => t.toLowerCase()),
            isActive: group.isActive,
            category: group.category
          });
        }
      }
    }

    // Batch create synonyms
    if (synonymsToCreate.length > 0) {
      await prisma.searchSynonym.createMany({
        data: synonymsToCreate
      });
    }

    // Update search settings to indicate synonyms are configured
    await prisma.searchSettings.update({
      where: { storeId: store.id },
      data: { 
        enableSynonyms: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      message: 'Synonyms updated successfully',
      count: synonymsToCreate.length
    });
  } catch (error) {
    console.error('Error updating synonyms:', error);
    return NextResponse.json(
      { error: 'Failed to update synonyms' },
      { status: 500 }
    );
  }
}

// POST - Test synonym expansion
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ subdomain: string }> }
) {
  try {
    const { subdomain } = await params;
    const { query } = await request.json();

    if (!query) {
      return apiResponse.badRequest('Query is required');
    }

    // Verify store exists
    const store = await prisma.store.findFirst({
      where: {
        subdomain: subdomain
      }
    });

    if (!store) {
      return apiResponse.notFound('Store ');
    }

    // Find synonyms for the query
    const searchTerm = query.toLowerCase();
    const synonyms = await prisma.searchSynonym.findMany({
      where: {
        storeId: store.id,
        isActive: true,
        OR: [
          { term: searchTerm },
          { mappedTerms: { has: searchTerm } }
        ]
      }
    });

    // Expand terms
    const expandedTerms = new Set([searchTerm]);
    
    for (const synonym of synonyms) {
      if (synonym.term === searchTerm) {
        // Add mapped terms
        synonym.mappedTerms.forEach(t => expandedTerms.add(t));
      } else {
        // This is a reverse lookup - add the main term
        expandedTerms.add(synonym.term);
        // If bidirectional, also add other mapped terms
        if (synonym.groupId) {
          const groupSynonyms = await prisma.searchSynonym.findMany({
            where: {
              storeId: store.id,
              groupId: synonym.groupId,
              isActive: true
            }
          });
          groupSynonyms.forEach(gs => {
            expandedTerms.add(gs.term);
            gs.mappedTerms.forEach(t => expandedTerms.add(t));
          });
        }
      }
    }

    return NextResponse.json({
      original: query,
      expanded: Array.from(expandedTerms)
    });
  } catch (error) {
    console.error('Error testing synonyms:', error);
    return NextResponse.json(
      { error: 'Failed to test synonyms' },
      { status: 500 }
    );
  }
}