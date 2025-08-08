'use client';

import { SearchProvider } from '@/contexts/search-context';
import { SearchPageContent } from './search-page-content';

interface SearchPageWrapperProps {
  subdomain: string;
  initialQuery?: string;
  children?: React.ReactNode;
}

export function SearchPageWrapper({ 
  subdomain, 
  initialQuery,
  children 
}: SearchPageWrapperProps) {
  return (
    <SearchProvider subdomain={subdomain} initialQuery={initialQuery}>
      {children || <SearchPageContent />}
    </SearchProvider>
  );
}