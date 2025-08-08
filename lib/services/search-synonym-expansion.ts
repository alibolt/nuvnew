import { prisma } from '@/lib/prisma';

export async function expandSearchTermsWithSynonyms(
  query: string,
  storeId: string
): Promise<string[]> {
  try {
    // Check if synonyms are enabled
    const searchSettings = await prisma.searchSettings.findUnique({
      where: { storeId }
    });

    if (!searchSettings?.enableSynonyms) {
      return [query];
    }

    // Split query into individual terms
    const terms = query.toLowerCase().split(/\s+/).filter(t => t.length > 0);
    const expandedTerms = new Set<string>();

    // For each term, find synonyms
    for (const term of terms) {
      expandedTerms.add(term);

      // Find direct synonyms
      const synonyms = await prisma.searchSynonym.findMany({
        where: {
          storeId,
          isActive: true,
          OR: [
            { term: term },
            { mappedTerms: { has: term } }
          ]
        }
      });

      // Add expanded terms
      for (const synonym of synonyms) {
        if (synonym.term === term) {
          // Add mapped terms
          synonym.mappedTerms.forEach(t => expandedTerms.add(t));
        } else {
          // This is a reverse lookup - add the main term
          expandedTerms.add(synonym.term);
          
          // If it's part of a bidirectional group, get all terms in the group
          if (synonym.groupId) {
            const groupSynonyms = await prisma.searchSynonym.findMany({
              where: {
                storeId,
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
    }

    // Generate search variations
    const variations: string[] = [];
    
    // Original query
    variations.push(query);
    
    // Individual expanded terms
    expandedTerms.forEach(term => {
      if (!variations.includes(term)) {
        variations.push(term);
      }
    });

    // If query had multiple terms, create combinations
    if (terms.length > 1) {
      const expandedTermsArray = Array.from(expandedTerms);
      
      // Replace each term in the original query with its synonyms
      for (let i = 0; i < terms.length; i++) {
        const termSynonyms = expandedTermsArray.filter(t => {
          // Find synonyms for this specific position
          return t !== terms[i]; // Get alternatives
        });
        
        for (const synonym of termSynonyms) {
          const newTerms = [...terms];
          newTerms[i] = synonym;
          const variation = newTerms.join(' ');
          if (!variations.includes(variation)) {
            variations.push(variation);
          }
        }
      }
    }

    return variations;
  } catch (error) {
    console.error('Error expanding search terms with synonyms:', error);
    return [query];
  }
}

export function buildSynonymSearchConditions(expandedTerms: string[]) {
  // Build OR conditions for all expanded terms
  const conditions = expandedTerms.map(term => {
    const words = term.split(/\s+/);
    
    if (words.length === 1) {
      // Single word - simple contains
      return {
        OR: [
          { name: { contains: term } },
          { description: { contains: term } }
        ]
      };
    } else {
      // Multiple words - match all words
      return {
        AND: words.map(word => ({
          OR: [
            { name: { contains: word } },
            { description: { contains: word } }
          ]
        }))
      };
    }
  });

  return { OR: conditions };
}